#!/usr/bin/env python3
"""Validate the Python/Pillow runtime used by Faye Image Utility scripts.

This probe intentionally uses syntax supported by Python versions older than the
plugin minimum. That lets the platform launchers explain an outdated runtime
instead of failing while parsing the diagnostic script.
"""

from __future__ import print_function

import importlib.util
import io
import json
import platform
import re
import sys


MINIMUM_PYTHON = (3, 10, 0)
MINIMUM_PILLOW = (12, 3, 0)
REQUIREMENTS = {
    "python": ">=3.10",
    "pillow": ">=12.3.0",
    "colorManagement": "LittleCMS2",
}
EXIT_CODES = {
    "python_too_old": 20,
    "pillow_missing": 21,
    "pillow_too_old": 22,
    "color_management_unavailable": 23,
}


def version_tuple(value):
    """Return a comparable three-part version tuple from a version value."""

    if isinstance(value, (tuple, list)):
        parts = [int(part) for part in value[:3]]
    else:
        parts = [int(part) for part in re.findall(r"\d+", str(value))[:3]]
    return tuple((parts + [0, 0, 0])[:3])


def version_text(value):
    """Return a stable dotted version string."""

    return ".".join(str(part) for part in version_tuple(value))


def python_install_instructions(system_name):
    """Return OS-aware Python installation instructions without taking action."""

    normalized = (system_name or "").lower()
    if normalized == "windows":
        return [
            "Windows: run `winget install -e --id Python.Python.3.12`.",
            (
                "Alternative: install Python 3.10 or newer from "
                "https://www.python.org/downloads/windows/ and enable "
                "'Add python.exe to PATH'."
            ),
        ]
    if normalized == "darwin":
        return [
            "macOS with Homebrew: run `brew install python`.",
            (
                "Alternative: install Python 3.10 or newer from "
                "https://www.python.org/downloads/macos/."
            ),
        ]
    if normalized == "linux":
        return [
            (
                "Ubuntu/Debian: run `sudo apt update && sudo apt install -y "
                "python3 python3-pip python3-venv`."
            ),
            "Fedora/RHEL: run `sudo dnf install -y python3 python3-pip python3-venv`.",
            (
                "Other Linux distributions: install Python 3.10 or newer and "
                "pip with the system package manager."
            ),
        ]
    return [
        (
            "Install Python 3.10 or newer from https://www.python.org/downloads/ "
            "or with the operating system package manager."
        )
    ]


def pillow_install_instructions(executable, pip_available, system_name):
    """Return commands for making pip and the supported Pillow version available."""

    return [
        "Rerun through the plugin launcher with FAYE_WORKSPACE_ROOT set; it automatically installs locked Pillow>=12.3.0 in the project-local runtime.",
        "If venv creation fails, ensure the selected Python includes venv and ensurepip; do not install Pillow into the base interpreter.",
    ]


def pillow_after_python_instruction(system_name):
    """Explain automatic local installation after Python itself becomes available."""
    return "Rerun the plugin launcher; locked Pillow>=12.3.0 installs into the project-local runtime."


def error_result(code, message, instructions, runtime):
    """Build the stable structured failure contract used by both launchers."""

    return {
        "status": "error",
        "requirements": REQUIREMENTS,
        "runtime": runtime,
        "error": {
            "code": code,
            "message": message,
            "installInstructions": instructions,
        },
    }


def evaluate_runtime(
    python_version,
    pillow_version,
    pip_available,
    executable,
    system_name,
    color_management_available=True,
):
    """Evaluate supplied runtime facts and return the probe's JSON-compatible result."""

    python_value = version_tuple(python_version)
    runtime = {
        "python": {
            "executable": executable,
            "version": version_text(python_value),
        },
        "pillow": {
            "version": None if pillow_version is None else str(pillow_version),
            "littleCms2Available": bool(color_management_available),
        },
        "pipAvailable": bool(pip_available),
        "platform": system_name,
    }
    if python_value < MINIMUM_PYTHON:
        instructions = python_install_instructions(system_name)
        instructions.extend(
            [
                pillow_after_python_instruction(system_name),
                "Rerun the original Faye Image Utility command after installation.",
            ]
        )
        return error_result(
            "python_too_old",
            "Faye Image Utility requires Python 3.10 or newer; found %s."
            % version_text(python_value),
            instructions,
            runtime,
        )

    if pillow_version is None:
        return error_result(
            "pillow_missing",
            "Faye Image Utility requires Pillow 12.3.0 or newer, but Pillow is not installed.",
            pillow_install_instructions(executable, pip_available, system_name),
            runtime,
        )

    pillow_value = version_tuple(pillow_version)
    if pillow_value < MINIMUM_PILLOW:
        return error_result(
            "pillow_too_old",
            "Faye Image Utility requires Pillow 12.3.0 or newer; found %s."
            % str(pillow_version),
            pillow_install_instructions(executable, pip_available, system_name),
            runtime,
        )

    if not color_management_available:
        return error_result(
            "color_management_unavailable",
            (
                "Faye Image Utility requires a Pillow build with LittleCMS2 "
                "color-management support."
            ),
            pillow_install_instructions(executable, pip_available, system_name),
            runtime,
        )

    return {
        "status": "ok",
        "requirements": REQUIREMENTS,
        "runtime": runtime,
    }


def detect_runtime():
    """Inspect the active interpreter without importing plugin implementation code."""

    try:
        pip_available = importlib.util.find_spec("pip") is not None
    except (ImportError, AttributeError, ValueError):
        pip_available = False
    try:
        import PIL
        from PIL import Image as PillowImage
        from PIL import features as pillow_features

        PillowImage.new("RGB", (1, 1))
        pillow_version = getattr(PIL, "__version__", "0")
        color_management_available = bool(pillow_features.check("littlecms2"))
    except (ImportError, OSError):
        pillow_version = None
        color_management_available = False
    return evaluate_runtime(
        python_version=sys.version_info[:3],
        pillow_version=pillow_version,
        pip_available=pip_available,
        executable=sys.executable,
        system_name=platform.system(),
        color_management_available=color_management_available,
    )


def main():
    """Write exactly one JSON result and return a stable process status."""

    if "--base" in sys.argv:
        if sys.version_info >= (3, 10):
            result = {"status": "ok", "requirements": REQUIREMENTS}
        else:
            result = error_result("python_too_old", "Python 3.10 or newer is required.",
                                  python_install_instructions(platform.system()), {})
    else:
        result = detect_runtime()
        if result["status"] == "ok":
            try:
                from PIL import Image
                for codec in ("JPEG", "PNG", "WEBP"):
                    buffer = io.BytesIO()
                    Image.new("RGB", (2, 2), "red").save(buffer, codec)
                    buffer.seek(0)
                    with Image.open(buffer) as decoded:
                        decoded.load()
            except (OSError, ValueError, KeyError) as exc:
                result = error_result("codec_unavailable", "JPEG/PNG/WebP verification failed.", [], {})
    stream = sys.stdout if result["status"] == "ok" else sys.stderr
    json.dump(result, stream, ensure_ascii=True, sort_keys=True)
    stream.write("\n")
    if result["status"] == "ok":
        return 0
    return EXIT_CODES.get(result["error"]["code"], 25)


if __name__ == "__main__":
    sys.exit(main())
