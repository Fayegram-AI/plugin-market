"""Owned temporary sessions and conservative cleanup on next use; no scheduler."""

from __future__ import annotations

import json
import math
import os
from pathlib import Path
import re
import shutil
import socket
import sys
import time
import uuid

from .storage import WorkspaceError, is_link
from .locking import file_lock


RETENTION_SECONDS = 7 * 24 * 60 * 60
IMAGE_PLUGIN = "faye-image-utility"


def safe_segment(value):
    if not isinstance(value, str) or not re.fullmatch(r"[a-z0-9][a-z0-9-]{0,79}", value):
        raise WorkspaceError("Plugin and temporary session identifiers must be bounded lowercase path segments.")
    return value


def process_alive(pid):
    """Return None when liveness cannot safely be established (notably permissions)."""

    if not isinstance(pid, int) or isinstance(pid, bool) or pid <= 0:
        return None
    if os.name == "nt":
        import ctypes
        from ctypes import wintypes
        kernel = ctypes.WinDLL("kernel32", use_last_error=True)
        kernel.OpenProcess.argtypes = [wintypes.DWORD, wintypes.BOOL, wintypes.DWORD]
        kernel.OpenProcess.restype = wintypes.HANDLE
        kernel.CloseHandle.argtypes = [wintypes.HANDLE]
        handle = kernel.OpenProcess(0x1000, False, pid)
        if not handle:
            return False if ctypes.get_last_error() == 87 else None
        kernel.CloseHandle(handle)
        return True
    try:
        os.kill(pid, 0)
        return True
    except ProcessLookupError:
        return False
    except PermissionError:
        return None


def _safe_tree(workspace, root):
    """Preflight the complete owned tree; never descend through a link."""

    workspace.checked(root)
    for entry in root.iterdir():
        workspace.checked(entry)
        if entry.is_dir():
            _safe_tree(workspace, entry)


def cleanup_sessions(workspace, plugin=IMAGE_PLUGIN, *, now=None):
    """Only remove old, proven-owned, inactive sessions from this plugin's tmp area."""

    parent = workspace.checked(workspace.base / "tmp" / safe_segment(plugin))
    if not parent.exists():
        return []
    now = time.time() if now is None else now
    removed = []
    for folder in parent.iterdir():
        if is_link(folder) or not folder.is_dir():
            continue
        try:
            marker = workspace.checked(folder / ".session.json")
            data = json.loads(marker.read_text(encoding="utf-8"))
            if (data.get("owner") != plugin or data.get("session_id") != folder.name
                    or data.get("workspace_root") != str(workspace.root)):
                continue
            activity = data.get("last_activity")
            if (isinstance(activity, bool) or not isinstance(activity, (int, float)) or not math.isfinite(activity)
                    or now - activity <= RETENTION_SECONDS):
                continue
            closed = data.get("status") == "closed"
            dead = (data.get("status") == "active" and data.get("host") == socket.gethostname()
                    and process_alive(data.get("pid")) is False)
            if not (closed or dead):
                continue
            _safe_tree(workspace, folder)
            # Explicitly registered siblings are recoverable only inside managed storage.
            siblings = data.get("owned_siblings", [])
            if not isinstance(siblings, list):
                continue
            checked = []
            for value in siblings:
                sibling = workspace.checked(workspace.base / value)
                if not sibling.name.startswith(".faye-image-") or sibling.suffix != ".tmp":
                    raise WorkspaceError("Invalid owned sibling record.")
                checked.append(sibling)
            for sibling in checked:
                sibling.unlink(missing_ok=True)
            workspace.checked(folder)
            shutil.rmtree(folder)
            removed.append(folder.name)
        except (OSError, ValueError, TypeError, AttributeError):
            # Unknown data, ownership, or links must never become a deletion heuristic.
            continue
    if removed:
        print(f"Faye cleaned {len(removed)} expired temporary session(s).", file=sys.stderr)
    return removed


class TemporarySession:
    """A process-owned operation directory; failure retains evidence until later cleanup."""

    def __init__(self, workspace, plugin=IMAGE_PLUGIN):
        self.workspace = workspace
        self.plugin = safe_segment(plugin)
        self.id = uuid.uuid4().hex
        self.path = workspace.directory("tmp", plugin, self.id)
        self.marker = self.path / ".session.json"
        self.data = {
            "owner": plugin, "session_id": self.id, "workspace_root": str(workspace.root),
            "status": "active", "last_activity": time.time(),
            "host": socket.gethostname(), "pid": os.getpid(), "owned_siblings": [],
        }
        workspace.write_json(self.marker, self.data)

    def close(self, *, success):
        # The child can register atomic-write siblings while the parent waits.
        current = json.loads(self.workspace.checked(self.marker).read_text(encoding="utf-8"))
        if current.get("owner") != self.plugin or current.get("session_id") != self.id:
            raise WorkspaceError("Temporary-session ownership changed during the operation.")
        self.data = current
        self.data.update(status="closed", last_activity=time.time())
        self.workspace.write_json(self.marker, self.data)
        if success:
            _safe_tree(self.workspace, self.path)
            shutil.rmtree(self.path)


def register_sibling(workspace, path):
    """Track an atomic-write sibling only when a launcher owns the current session."""

    session_path = os.environ.get("FAYE_OPERATION_DIR")
    if not session_path:
        return
    marker = workspace.checked(Path(session_path) / ".session.json")
    with file_lock(workspace.checked(Path(session_path) / ".session.lock")):
        data = json.loads(marker.read_text(encoding="utf-8"))
        if data.get("owner") != IMAGE_PLUGIN or data.get("status") != "active":
            raise WorkspaceError("The active temporary session is not owned by Image Utility.")
        data["owned_siblings"].append(str(workspace.checked(path).relative_to(workspace.base)))
        data["last_activity"] = time.time()
        workspace.write_json(marker, data)
