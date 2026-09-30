#!/usr/bin/env python3
"""Internal JSON CLI adapter for the shared Faye image editor package."""

from __future__ import annotations

import sys
sys.dont_write_bytecode = True
from pathlib import Path


PLUGIN_ROOT = Path(__file__).resolve().parents[1]
SHARED_PYTHON = PLUGIN_ROOT / "shared" / "python"
if str(SHARED_PYTHON) not in sys.path:
    sys.path.insert(0, str(SHARED_PYTHON))

from faye_image_editor.cli import main  # noqa: E402 - local runtime bootstrap.


if __name__ == "__main__":
    raise SystemExit(main())
