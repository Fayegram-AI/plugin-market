# Project-local Python Runtime

Every Python-backed workflow uses `run_python.ps1` on Windows or `run_python.sh`
on Ubuntu/macOS. They select existing Python >=3.10 and invoke the standard-library
bootstrap before Pillow imports. `FAYE_PYTHON` selects the base executable, never
the package-installation target. Without it, Windows tries `py -3`, `python3`,
and `python`; POSIX tries `python3` and `python`.

## Invocation

Read `../references/workspace-storage.md`. Obtain the active absolute project
from the parent, not cwd, inputs, or the plugin installation. Set process-local
`FAYE_WORKSPACE_ROOT` before invoking either launcher. Optionally pass a fresh
`FAYE_SESSION_ID` from the parent task to reuse unchanged Git checks. Renew the
session ID on task resume; without it each invocation verifies setup again.

```powershell
$env:FAYE_WORKSPACE_ROOT = '<absolute-project-directory>'
$env:FAYE_SESSION_ID = '<fresh-parent-task-session>'
powershell -NoProfile -ExecutionPolicy Bypass -File <plugin-root>/tools/run_python.ps1 <absolute-script-path> [...arguments]
```

```sh
FAYE_WORKSPACE_ROOT=/absolute/project FAYE_SESSION_ID=task-session sh <plugin-root>/tools/run_python.sh <absolute-script-path> [...arguments]
```

Direct CLI managed writes require the same workspace context. Explicit relative
input/output paths retain cwd semantics. Windows PowerShell reserves a lone
trailing `-` under `-File`; use `--request=-` or `--input=-`. Text JSON/base64
stdin is supported; use file paths for binary image input on Windows.

## Automatic isolated setup

Existing Python must include venv/ensurepip. The bootstrap never installs system
Python, OS packages, or packages into the base interpreter. Pillow>=12.3.0 with
LittleCMS2 is required; `requirements.lock` pins Pillow==12.3.0 with published
binary-wheel hashes. No source builds or compiler installations are attempted.

Dependencies live under `.faye/runtime/faye-image-utility/`. Setup uses a native
process lock and final-location virtual environments without system site packages.
Only publish a ready record after Pillow, LittleCMS2, JPEG, PNG, and WebP checks
pass. Lock, interpreter, platform, or location changes select a fresh generation.
Healthy environments are reused offline, never relocated or upgraded in place.
Installer scratch and wheel/pip caches remain inside `.faye/`. Python bytecode
writes beside installed plugin code are suppressed. CPython's optional POSIX
lib64 alias is removed from newly created environments; the normal lib path stays.

First-time setup and actual stale-session cleanup emit brief stderr notices.
Healthy reuse is quiet. Preserve target stdin, arguments, stdout, and exit status.
Cleanup happens on next use; no scheduler, background service, or automation is
created. State, artifacts, caches, and runtime environments are never age-deleted.

## Errors

Errors contain `status`, `requirements` (`python: >=3.10`, `pillow: >=12.3.0`,
`colorManagement: LittleCMS2`), and `error` with `code`, `message`, and
`installInstructions`. Bootstrap failures exit 24. Target failures retain their
own output/error schemas and exit codes.

Launcher/base errors: `python_not_found`, `python_too_old`,
`runtime_probe_missing`, `python_script_missing`.

Probe diagnostics: `pillow_missing`, `pillow_too_old`,
`color_management_unavailable`, `codec_unavailable`.

Bootstrap errors: `workspace_setup_failed`, `dependency_lock_invalid`,
`python_prerequisite_missing`, `dependency_setup_failed`, `runtime_verification_failed`.

Surface the message and every `installInstructions` entry. Never bypass a failed
check or claim a file was created without target success. Missing prerequisites,
compatible wheels, or connectivity are recoverable errors. Installer logs are
not echoed because index/proxy diagnostics can contain credentials. Fix the
reported prerequisites or connectivity and retry without modifying system packages.

## Platform acceptance

Routine tests use a local wheel fixture repacked from the already-required
development Pillow installation, with a fixture-specific hash lock. They never
download packages or change the production lock. In the development plugin root:

```sh
python -B -m unittest discover -s tests -p 'test_*.py'
```

Run on Windows, Ubuntu, and macOS with a supported Python/Pillow installation.
POSIX syntax checks on Windows do not replace real Ubuntu or macOS execution.
Run live first-install verification separately with intended network access,
then verify offline reuse. Report unavailable platform coverage explicitly.
