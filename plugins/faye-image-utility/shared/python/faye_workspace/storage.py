"""Explicit workspace identity, managed-path containment, and lazy Git setup."""

from __future__ import annotations

import json
import hashlib
import os
from pathlib import Path
import shutil
import stat
import subprocess
import uuid

from .locking import file_lock


POLICY_VERSION = 1
_PROCESS_SESSION = uuid.uuid4().hex


class WorkspaceError(ValueError):
    """An actionable storage conflict; no outside-workspace fallback is allowed."""


def is_link(path: Path) -> bool:
    """Also reject Windows junctions and other reparse points, including dangling ones."""

    try:
        info = path.lstat()
    except FileNotFoundError:
        return False
    return (stat.S_ISREG(info.st_mode) and info.st_nlink > 1) or stat.S_ISLNK(info.st_mode) or bool(
        getattr(info, "st_file_attributes", 0) & getattr(stat, "FILE_ATTRIBUTE_REPARSE_POINT", 1024)
    )


def file_stamp(path: Path):
    try:
        info = path.lstat()
        return [info.st_mtime_ns, info.st_size, info.st_ino, info.st_mode]
    except FileNotFoundError:
        return None


def git_environment_stamp():
    values = {key: value for key, value in os.environ.items()
              if key.startswith("GIT_") or key in ("HOME", "XDG_CONFIG_HOME", "USERPROFILE")}
    return hashlib.sha256(json.dumps(values, sort_keys=True).encode()).hexdigest()


class Workspace:
    """Manage only .faye beneath an explicitly selected, existing project."""

    def __init__(self, root):
        supplied = Path(root)
        if not supplied.is_absolute():
            raise WorkspaceError("FAYE_WORKSPACE_ROOT must be an absolute project directory.")
        try:
            self.root = supplied.resolve(strict=True)
        except OSError as exc:
            raise WorkspaceError("The selected workspace does not exist.") from exc
        if not self.root.is_dir():
            raise WorkspaceError("The selected workspace must be a directory.")
        self.base = self.root / ".faye"
        self.session = os.environ.get("FAYE_SESSION_ID") or _PROCESS_SESSION

    def checked(self, path) -> Path:
        """Reject lexical escapes and links before creation and before each mutation."""

        candidate = Path(os.path.abspath(path))
        try:
            relative = candidate.relative_to(self.base)
        except ValueError as exc:
            raise WorkspaceError(f"Managed destination is outside {self.base}: {candidate}") from exc
        current = self.base
        for part in (None, *relative.parts):
            if part is not None:
                current = current / part
            if is_link(current):
                raise WorkspaceError(f"Managed storage cannot contain links or junctions: {current}")
        return candidate

    def directory(self, *parts) -> Path:
        path = self.checked(self.base.joinpath(*parts))
        # Build one component at a time, rechecking existing parents before writes.
        for current in reversed([path, *path.parents]):
            if current == self.base or self.base in current.parents:
                self.checked(current)
                current.mkdir(exist_ok=True)
        return self.checked(path)

    def write_json(self, path, value):
        path = self.checked(path)
        self.directory(*path.parent.relative_to(self.base).parts)
        temporary = self.checked(path.with_name(f".{path.name}-{uuid.uuid4().hex}.tmp"))
        try:
            with temporary.open("x", encoding="utf-8", newline="\n") as stream:
                json.dump(value, stream, indent=4)
                stream.write("\n")
            self.checked(path)
            os.replace(temporary, path)
        finally:
            temporary.unlink(missing_ok=True)

    def check_tree(self, path):
        """Inspect an existing managed tree without following linked directories."""

        path = self.checked(path)
        if not path.exists():
            return
        for entry in path.iterdir():
            self.checked(entry)
            if entry.is_dir():
                self.check_tree(entry)

    def initialize(self):
        """Reuse a session's verified Git result only while its watched inputs agree."""

        self.directory()
        lock = self.checked(self.base / ".setup.lock")
        with file_lock(lock):
            ignore = self.checked(self.base / ".gitignore")
            try:
                with ignore.open("x", encoding="utf-8", newline="\n") as stream:
                    stream.write("*\n")
            except FileExistsError:
                if ignore.read_text(encoding="utf-8") not in ("*", "*\n"):
                    raise WorkspaceError("Conflicting .faye/.gitignore; preserve it and resolve the configuration explicitly.")
            marker = self.checked(self.base / "state" / "workspace.json")
            previous = None
            if marker.exists():
                try:
                    previous = json.loads(marker.read_text(encoding="utf-8"))
                except (ValueError, OSError) as exc:
                    raise WorkspaceError("Conflicting .faye/state/workspace.json; setup metadata is unreadable.") from exc
                if not isinstance(previous, dict) or previous.get("owner") != "faye-workspace":
                    raise WorkspaceError("Existing workspace metadata is not owned by Faye.")
                if previous.get("policy_version", POLICY_VERSION) != POLICY_VERSION:
                    raise WorkspaceError("Workspace storage uses a different policy version; resolve it explicitly.")
            if self._fresh(previous):
                return self
            watched = self._verify_git()
            self.write_json(marker, {
                "owner": "faye-workspace", "policy_version": POLICY_VERSION,
                "workspace_root": str(self.root), "session_id": self.session,
                "watched": {str(p): file_stamp(p) for p in watched},
                "git_available": shutil.which("git"),
                "git_environment": git_environment_stamp(),
            })
        return self

    def _fresh(self, value):
        return bool(
            isinstance(value, dict)
            and value.get("policy_version") == POLICY_VERSION
            and value.get("workspace_root") == str(self.root)
            and value.get("session_id") == self.session
            and value.get("git_available") == shutil.which("git")
            and value.get("git_environment") == git_environment_stamp()
            and isinstance(value.get("watched"), dict) and value["watched"]
            and all(file_stamp(Path(p)) == stamp for p, stamp in value["watched"].items())
        )

    def _verify_git(self):
        # Watching every ancestor detects git-init and a newly created parent repo.
        watched = {self.base / ".gitignore"}
        for parent in (self.root, *self.root.parents):
            watched.update((parent / ".git", parent / ".gitignore"))
        if shutil.which("git") is None:
            return watched

        def git(*args):
            return subprocess.run(["git", "-C", str(self.root), *args], capture_output=True,
                                  env={**os.environ, "LC_ALL": "C"}, check=False)

        probe = git("rev-parse", "--show-toplevel", "--absolute-git-dir", "--git-common-dir")
        if probe.returncode:
            if b"not a git repository" in probe.stderr:
                return watched
            raise WorkspaceError("Unable to inspect Git for the selected workspace: " + probe.stderr.decode(errors="replace").strip())
        top, git_dir, common_dir = probe.stdout.decode().splitlines()
        for folder in (Path(git_dir), (self.root / common_dir).resolve()):
            watched.update(folder / name for name in ("index", "config", "config.worktree", "info/exclude"))
        watched.update((Path.home() / ".gitconfig", Path.home() / ".config/git/config", Path.home() / ".config/git/ignore"))
        origins = git("config", "--show-origin", "--name-only", "--list")
        if origins.returncode:
            raise WorkspaceError("Unable to inspect applicable Git configuration.")
        for line in origins.stdout.decode().splitlines():
            origin = line.split("\t", 1)[0]
            if origin.startswith("file:"):
                watched.add((self.root / origin[5:]).resolve())
        excludes = git("config", "--path", "--get", "core.excludesFile")
        if excludes.returncode == 0:
            watched.add((self.root / excludes.stdout.decode().strip()).resolve())
        relative = self.base.relative_to(Path(top).resolve()).as_posix()
        tracked = git("ls-files", "-z", "--", ":(top,literal)" + relative)
        if tracked.returncode or tracked.stdout:
            raise WorkspaceError("Managed .faye files are tracked or Git discovery failed; do not automatically untrack them.")
        ignored = git("check-ignore", "--no-index", "-q", "--", str(self.base / ".gitignore"))
        if ignored.returncode != 0:
            raise WorkspaceError("Git does not ignore .faye contents; resolve the conflicting ignore configuration.")
        return watched


def workspace_from_environment() -> Workspace:
    value = os.environ.get("FAYE_WORKSPACE_ROOT", "")
    if not value:
        raise WorkspaceError("Set FAYE_WORKSPACE_ROOT to the active project's absolute directory; no fallback is used.")
    return Workspace(value)


def guard_output(path):
    """Explicit external outputs stay explicit; any .faye target needs its workspace."""

    raw_parts = Path(path).absolute().parts
    if ".." in raw_parts and any(part.lower() == ".faye" for part in raw_parts):
        # Normalizing link/.. before validation can hide a traversed link while
        # the eventual filesystem operation still follows the original path.
        raise WorkspaceError("Managed destinations must not contain parent traversal (..).")
    absolute = Path(os.path.abspath(path))
    parts = [part.lower() if os.name == "nt" else part for part in absolute.parts]
    if ".faye" in parts:
        workspace = workspace_from_environment()
        # A project may itself live inside an enclosing .faye test/work directory.
        # Only .faye below the selected root identifies that project's storage.
        if absolute.is_relative_to(workspace.root):
            relative_parts = absolute.relative_to(workspace.root).parts
            if not any(part.lower() == ".faye" if os.name == "nt" else part == ".faye" for part in relative_parts):
                return Path(path)
        workspace.initialize()
        workspace.checked(absolute)
    return Path(path)
