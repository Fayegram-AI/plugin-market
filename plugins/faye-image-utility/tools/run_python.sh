#!/bin/sh
# POSIX launcher for every Python-backed Faye Image Utility script.

set -u

script_path=${1-}
if [ -z "$script_path" ]; then
    printf '%s\n' '{"status":"error","requirements":{"python":">=3.10","pillow":">=12.3.0","colorManagement":"LittleCMS2"},"error":{"code":"python_script_missing","message":"A Python script path is required.","installInstructions":[]}}' >&2
    exit 13
fi
shift

launcher_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
probe_path=$launcher_dir/python_runtime_probe.py

if [ ! -f "$probe_path" ] || [ ! -f "$launcher_dir/runtime_bootstrap.py" ]; then
    printf '%s\n' '{"status":"error","requirements":{"python":">=3.10","pillow":">=12.3.0","colorManagement":"LittleCMS2"},"error":{"code":"runtime_probe_missing","message":"The bundled Faye Image Utility Python runtime probe is missing.","installInstructions":[]}}' >&2
    exit 12
fi

if [ ! -f "$script_path" ]; then
    printf '%s\n' '{"status":"error","requirements":{"python":">=3.10","pillow":">=12.3.0","colorManagement":"LittleCMS2"},"error":{"code":"python_script_missing","message":"The requested Faye Image Utility Python script does not exist.","installInstructions":[]}}' >&2
    exit 13
fi

best_failure=
best_failure_code=1

try_candidate() {
    candidate=$1
    shift

    case "$candidate" in
        */*)
            [ -x "$candidate" ] || return 127
            ;;
        *)
            command -v "$candidate" >/dev/null 2>&1 || return 127
            ;;
    esac

    probe_output=$("$candidate" -B "$probe_path" --base 2>&1)
    probe_exit_code=$?
    case "$probe_output" in
        *'"status": "ok"'*)
            if [ "$probe_exit_code" -eq 0 ]; then
                exec "$candidate" -B "$launcher_dir/runtime_bootstrap.py" "$script_path" "$@"
            fi
            ;;
        *'"status": "error"'*)
            best_failure=$probe_output
            best_failure_code=$probe_exit_code
            ;;
        *)
            # A command alias or broken executable is not a usable runtime.
            ;;
    esac
    return 0
}

if [ -n "${FAYE_PYTHON:-}" ]; then
    try_candidate "$FAYE_PYTHON" "$@"
else
    try_candidate python3 "$@"
    try_candidate python "$@"
fi

if [ -n "$best_failure" ]; then
    printf '%s\n' "$best_failure" >&2
    exit "$best_failure_code"
fi

case "$(uname -s 2>/dev/null || printf unknown)" in
    Darwin)
        printf '%s\n' '{"status":"error","requirements":{"python":">=3.10","pillow":">=12.3.0","colorManagement":"LittleCMS2"},"error":{"code":"python_not_found","message":"Faye Image Utility requires Python 3.10 or newer, but no usable Python interpreter was found.","installInstructions":["macOS with Homebrew: run `brew install python`.","Alternative: install Python 3.10 or newer from https://www.python.org/downloads/macos/.","Pillow>=12.3.0 is installed automatically in the project-local runtime after Python is available.","Rerun the original Faye Image Utility command after installation."]}}' >&2
        ;;
    Linux)
        printf '%s\n' '{"status":"error","requirements":{"python":">=3.10","pillow":">=12.3.0","colorManagement":"LittleCMS2"},"error":{"code":"python_not_found","message":"Faye Image Utility requires Python 3.10 or newer, but no usable Python interpreter was found.","installInstructions":["Ubuntu/Debian: run `sudo apt update && sudo apt install -y python3 python3-pip python3-venv`.","Fedora/RHEL: run `sudo dnf install -y python3 python3-pip python3-venv`.","Other Linux distributions: install Python 3.10 or newer and pip with the system package manager.","Pillow>=12.3.0 is installed automatically in the project-local runtime after Python is available.","Rerun the original Faye Image Utility command after installation."]}}' >&2
        ;;
    *)
        printf '%s\n' '{"status":"error","requirements":{"python":">=3.10","pillow":">=12.3.0","colorManagement":"LittleCMS2"},"error":{"code":"python_not_found","message":"Faye Image Utility requires Python 3.10 or newer, but no usable Python interpreter was found.","installInstructions":["Install Python 3.10 or newer from https://www.python.org/downloads/ or with the operating system package manager.","Pillow>=12.3.0 is installed automatically in the project-local runtime after Python is available.","Rerun the original Faye Image Utility command after installation."]}}' >&2
        ;;
esac
exit 10
