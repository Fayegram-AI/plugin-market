"""Locked local virtual environments and transparent image-script execution."""

from __future__ import annotations

import hashlib
import importlib.util
import json
import os
from pathlib import Path
import platform
import re
import subprocess
import sys
import uuid

from .locking import file_lock
from .sessions import IMAGE_PLUGIN, TemporarySession, cleanup_sessions
from .storage import WorkspaceError, workspace_from_environment


PLUGIN_ROOT = Path(__file__).resolve().parents[3]
LOCK_FILE = PLUGIN_ROOT / "tools" / "requirements.lock"
PROBE = PLUGIN_ROOT / "tools" / "python_runtime_probe.py"


class RuntimeSetupError(Exception):
    def __init__(self, code, message, instructions=()):
        super().__init__(message)
        self.code = code
        self.instructions = list(instructions)


def child_environment(workspace, session):
    """Override write locations only in child processes, never global configuration."""

    environment = os.environ.copy()
    environment.update({
        "FAYE_WORKSPACE_ROOT": str(workspace.root),
        "FAYE_SESSION_ID": workspace.session,
        "FAYE_OPERATION_DIR": str(session.path),
        "TMPDIR": str(session.path), "TMP": str(session.path), "TEMP": str(session.path),
        "PYTHONDONTWRITEBYTECODE": "1", "PYTHONNOUSERSITE": "1",
        "PIP_CACHE_DIR": str(workspace.directory("cache", IMAGE_PLUGIN, "pip")),
        "PIP_DISABLE_PIP_VERSION_CHECK": "1", "PIP_NO_INPUT": "1",
        "PIP_CONFIG_FILE": os.devnull,
    })
    # User Python injection must not redirect imports or bytecode outside the project.
    for name in ("PYTHONPATH", "PYTHONHOME", "PYTHONPYCACHEPREFIX"):
        environment.pop(name, None)
    return environment


def runtime_identity(workspace, lock_file=LOCK_FILE):
    executable = Path(sys.executable).resolve()
    info = executable.stat()
    return {
        "lock": hashlib.sha256(lock_file.read_bytes()).hexdigest(),
        "python": str(executable), "python_version": sys.version,
        "python_mtime": info.st_mtime_ns, "python_size": info.st_size,
        "platform": platform.platform(), "machine": platform.machine(),
        "location": str(workspace.base / "runtime" / IMAGE_PLUGIN),
    }


def interpreter(environment_path):
    return environment_path / ("Scripts/python.exe" if os.name == "nt" else "bin/python")


def probe_runtime(python, environment, expected_version="12.3.0"):
    result = subprocess.run([str(python), "-B", "-I", str(PROBE)],
                            env=environment, capture_output=True, text=True, check=False)
    try:
        payload = json.loads(result.stdout if result.returncode == 0 else result.stderr)
        return (result.returncode == 0 and payload.get("status") == "ok"
                and payload.get("runtime", {}).get("pillow", {}).get("version") == expected_version)
    except (ValueError, TypeError):
        return False


def run_setup(command, environment):
    """Never inherit application stdout/stdin or leak installer logs/credentials."""

    try:
        result = subprocess.run(command, env=environment, stdin=subprocess.DEVNULL,
                                stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False, timeout=300)
    except subprocess.TimeoutExpired as exc:
        raise RuntimeSetupError("dependency_setup_failed", "Local dependency setup timed out; retry when prerequisites and network access are available.") from exc
    if result.returncode:
        raise RuntimeSetupError(
            "dependency_setup_failed",
            "Project-local setup failed. Check Python venv support, network access, and availability of a compatible locked Pillow wheel; then retry.",
            ["Ensure this Python installation includes venv and ensurepip.",
             "Retry with network access or a populated project-local wheel cache. System packages were not modified."],
        )


def ensure_runtime(workspace, environment, *, lock_file=LOCK_FILE):
    """Serialize installation; never replace or relocate an environment in use."""

    identity = runtime_identity(workspace, lock_file)
    match = re.search(r"(?im)^pillow==([^\s]+)", lock_file.read_text(encoding="utf-8"))
    if match is None:
        raise RuntimeSetupError("dependency_lock_invalid", "The bundled Pillow version lock is missing.")
    expected_version = match.group(1)
    key = hashlib.sha256(json.dumps(identity, sort_keys=True).encode()).hexdigest()[:24]
    parent = workspace.directory("runtime", IMAGE_PLUGIN)
    pointer = workspace.checked(parent / f"{key}.json")
    with file_lock(workspace.checked(parent / ".install.lock")):
        if pointer.exists():
            try:
                ready = json.loads(pointer.read_text(encoding="utf-8"))
            except (ValueError, OSError) as exc:
                raise WorkspaceError("The runtime ready record is unreadable; resolve this configuration explicitly.") from exc
            if (not isinstance(ready, dict) or ready.get("owner") != IMAGE_PLUGIN
                    or not re.fullmatch(key + r"-[0-9a-f]{12}", str(ready.get("directory", "")))):
                raise WorkspaceError("The runtime ready record has conflicting ownership or location.")
            folder = workspace.checked(parent / ready["directory"])
            # Dependencies can be modified after setup. Never execute a reused
            # environment whose module tree now traverses outside managed storage.
            workspace.check_tree(folder)
            try:
                python = workspace.checked(interpreter(folder))
                if ready.get("identity") == identity and python.is_file() and probe_runtime(python, environment, expected_version):
                    return python
            except OSError:
                pass
        # A fresh generation keeps existing readers safe and avoids relocating venvs.
        if any(importlib.util.find_spec(name) is None for name in ("venv", "ensurepip")):
            raise RuntimeSetupError(
                "python_prerequisite_missing", "The selected Python lacks venv or ensurepip; no packages were installed.",
                ["Use Python with venv/ensurepip support (Ubuntu/Debian: the python3-venv package), then retry. Do not install Pillow into the base interpreter."],
            )
        workspace.check_tree(workspace.base / "cache" / IMAGE_PLUGIN)
        folder = workspace.directory("runtime", IMAGE_PLUGIN, f"{key}-{uuid.uuid4().hex[:12]}")
        print("Faye is preparing the project's isolated image runtime.", file=sys.stderr)
        run_setup([sys.executable, "-B", "-I", "-m", "venv", "--copies", str(folder)], environment)
        # CPython creates this optional alias even with --copies on POSIX. The
        # actual environment uses lib; remove only this known, newly created link.
        alias = folder / "lib64"
        if alias.is_symlink() and alias.resolve() == (folder / "lib").resolve():
            alias.unlink()
        workspace.check_tree(folder)
        python = workspace.checked(interpreter(folder))
        cache = workspace.directory("cache", IMAGE_PLUGIN, "wheels")
        pip = [str(python), "-B", "-I", "-m", "pip", "--isolated", "--disable-pip-version-check",
               "--cache-dir", environment["PIP_CACHE_DIR"]]
        arguments = ["--require-hashes", "--only-binary=:all:", "--no-deps", "-r", str(lock_file)]
        # Prefer an existing wheelhouse without network access; download only if absent.
        wheel_pattern = f"pillow-{expected_version}-*.whl"
        cached = list(cache.glob(wheel_pattern))
        for wheel in cached:
            workspace.checked(wheel)
        if not cached:
            run_setup([*pip, "download", "--dest", str(cache), *arguments], environment)
        try:
            run_setup([*pip, "install", "--no-index", "--find-links", str(cache), *arguments], environment)
        except RuntimeSetupError:
            if not cached:
                raise
            run_setup([*pip, "download", "--dest", str(cache), *arguments], environment)
            run_setup([*pip, "install", "--no-index", "--find-links", str(cache), *arguments], environment)
        if not probe_runtime(python, environment, expected_version):
            raise RuntimeSetupError("runtime_verification_failed", "The local environment failed Pillow, LittleCMS2, or JPEG/PNG/WebP verification.")
        workspace.write_json(pointer, {"owner": IMAGE_PLUGIN, "identity": identity, "directory": folder.name})
        return python


def launch(arguments):
    if not arguments or not Path(arguments[0]).is_file():
        raise RuntimeSetupError("python_script_missing", "An existing Python script path is required.")
    workspace = workspace_from_environment().initialize()
    cleanup_sessions(workspace)
    session = TemporarySession(workspace)
    success = False
    try:
        environment = child_environment(workspace, session)
        python = ensure_runtime(workspace, environment)
        result = subprocess.run([str(python), "-B", *arguments], env=environment, check=False)
        success = result.returncode == 0
        return result.returncode
    finally:
        try:
            session.close(success=success)
        except (OSError, ValueError, TypeError, AttributeError):
            # Preserve the application's exit status or original setup error.
            # Uncertain session data remains for conservative cleanup on next use.
            print("Faye could not finalize temporary-session cleanup; retained files for later inspection.", file=sys.stderr)
