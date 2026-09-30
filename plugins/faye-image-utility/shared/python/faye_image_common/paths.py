"""Shared collision-safe output-file helpers."""

from __future__ import annotations

import os
import stat
import uuid
from enum import Enum
from pathlib import Path
from typing import BinaryIO
from faye_workspace import guard_output, workspace_from_environment
from faye_workspace.sessions import register_sibling


TEMPORARY_FILE_PREFIX = ".faye-image-"


class OutputWriteMode(str, Enum):
    """Supported destination collision policies."""

    EXCLUSIVE = "exclusive"
    AUTO_SUFFIX = "auto_suffix"
    OVERWRITE = "overwrite"


class OutputCollisionError(Exception):
    """The requested protected destination already exists."""

    def __init__(self, path: Path) -> None:
        self.path = path
        super().__init__(f"Output file already exists: {path}.")


class OutputWriteError(Exception):
    """A filesystem operation prevented an output from being committed."""

    def __init__(self, operation: str, path: Path) -> None:
        self.operation = operation
        self.path = path
        super().__init__(output_error_message(operation, path))


def output_error_message(operation: str, path: Path) -> str:
    """Return a stable, path-aware message for an output operation."""

    if operation == "create_directory":
        return f"Unable to create output directory: {path}."
    if operation == "replace":
        return f"Unable to replace output file: {path}."
    return f"Unable to write output file: {path}."


def write_output_bytes(
    path: Path,
    payload: bytes,
    mode: OutputWriteMode,
) -> Path:
    """Commit bytes according to the requested collision policy.

    Protected destinations use exclusive creation so the existence check and
    ownership claim are one filesystem operation. Authorized replacement uses
    a sibling temporary file so readers never observe a partial replacement.
    """

    guard_output(path)
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
    except OSError as exc:
        raise OutputWriteError("create_directory", path.parent) from exc

    if mode is OutputWriteMode.OVERWRITE:
        return _write_replacement(path, payload)
    if mode is OutputWriteMode.EXCLUSIVE:
        _write_exclusive(path, payload)
        return path
    if mode is OutputWriteMode.AUTO_SUFFIX:
        counter = 0
        while True:
            candidate = suffixed_path(path, counter)
            try:
                _write_exclusive(candidate, payload)
            except OutputCollisionError:
                counter += 1
                continue
            return candidate
    raise ValueError(f"Unsupported output write mode: {mode!r}.")


def suffixed_path(path: Path, counter: int) -> Path:
    """Return the base path for zero or its numbered sibling otherwise."""

    if counter == 0:
        return path
    return path.with_name(f"{path.stem}-{counter}{path.suffix}")


def _write_exclusive(path: Path, payload: bytes) -> None:
    guard_output(path)
    created = False
    try:
        with path.open("xb") as output:
            created = True
            output.write(payload)
    except FileExistsError as exc:
        raise OutputCollisionError(path) from exc
    except OSError as exc:
        if created:
            _best_effort_unlink(path)
        raise OutputWriteError("write", path) from exc


def _write_replacement(path: Path, payload: bytes) -> Path:
    guard_output(path)
    temporary: Path | None = None
    replaced = False
    ready_to_replace = False
    try:
        preserved_mode = _preserved_output_mode(path)
        temporary, output = _open_sibling_temporary(path)
        with output:
            output.write(payload)
        if preserved_mode is not None:
            os.chmod(temporary, preserved_mode)
        ready_to_replace = True
        guard_output(path)
        os.replace(temporary, path)
        replaced = True
        return path
    except OSError as exc:
        operation = "replace" if ready_to_replace else "write"
        raise OutputWriteError(operation, path) from exc
    finally:
        if temporary is not None and not replaced:
            _best_effort_unlink(temporary)


def _open_sibling_temporary(path: Path) -> tuple[Path, BinaryIO]:
    """Exclusively create a normal-permission temporary beside a destination."""

    while True:
        temporary = path.with_name(
            f"{TEMPORARY_FILE_PREFIX}{uuid.uuid4().hex}.tmp"
        )
        guard_output(temporary)
        if os.environ.get("FAYE_OPERATION_DIR"):
            workspace = workspace_from_environment()
            if temporary.absolute().is_relative_to(workspace.base):
                register_sibling(workspace, temporary)
        try:
            return temporary, temporary.open("xb")
        except FileExistsError:
            continue


def _preserved_output_mode(path: Path) -> int | None:
    """Return POSIX access bits without carrying set-ID or sticky bits."""

    if os.name == "nt":
        return None
    try:
        return stat.S_IMODE(path.stat().st_mode) & 0o777
    except FileNotFoundError:
        return None


def _best_effort_unlink(path: Path) -> None:
    """Remove an incomplete artifact without masking its primary failure."""

    try:
        path.unlink(missing_ok=True)
    except OSError:
        pass
