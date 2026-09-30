"""Standard-library workspace support, deliberately independent of Pillow."""

from .storage import Workspace, WorkspaceError, guard_output, workspace_from_environment

__all__ = ["Workspace", "WorkspaceError", "guard_output", "workspace_from_environment"]
