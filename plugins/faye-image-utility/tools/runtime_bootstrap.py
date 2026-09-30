#!/usr/bin/env python3
"""Standard-library entry point for project-contained runtime setup and execution."""

import json
from pathlib import Path
import sys

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "shared" / "python"))

from faye_workspace.runtime import RuntimeSetupError, launch
from faye_workspace.storage import WorkspaceError


def main():
    try:
        return launch(sys.argv[1:])
    except (RuntimeSetupError, WorkspaceError, OSError, TimeoutError) as exc:
        json.dump({
            "status": "error",
            "requirements": {"python": ">=3.10", "pillow": ">=12.3.0", "colorManagement": "LittleCMS2"},
            "error": {
                "code": getattr(exc, "code", "workspace_setup_failed"),
                "message": str(exc),
                "installInstructions": getattr(exc, "instructions", []),
            },
        }, sys.stderr)
        sys.stderr.write("\n")
        return 24


if __name__ == "__main__":
    raise SystemExit(main())
