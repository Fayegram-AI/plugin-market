---
name: faye-image-format-converter
description: "Use when the user asks to convert, export, encode, or decode a static image among JPEG/JPG, PNG, WebP, and base64. Do not use for resizing, cropping, annotation, compositing, generation, visual analysis, metadata-only work, PDFs, or unsupported formats."
---

# Image Format Converter

Use `$faye-image-artifact-audit` for generated-image artifact QA and prompt conformance. Use `$simple-paint-n-annotation` for deterministic painting, annotation, compositing, or basic transformations. Use `$faye-image-age-rating` only for explicitly requested image age/content rating estimates. Use another dedicated Faye Image Utility skill or the environment's dedicated tool for generation, semantic photo editing, PDF annotation, metadata inspection or editing, or other image processing when one exists.

## Workflow

1. Spawn the bundled `image_processor` subagent defined at `../../agents/image-processor.toml` from this skill folder.
2. Send the subagent the input path or base64 text/stdin source, target format, optional source format, optional output path, explicit overwrite authorization when requested, optional background color, optional base64 container format, and raw-base64 preference.
3. Require the subagent to run `scripts/convert_image.py` from this skill folder through the plugin-root `tools/run_python.ps1` launcher on Windows or `tools/run_python.sh` on macOS/Linux for every conversion.
4. Do not perform conversion directly in the parent thread and do not claim success from reasoning alone.
5. If the bundled subagent or script cannot be used, report a blocker instead of faking conversion.

Recommended handoff shape:

```yaml
faye_image_utility_request:
    utility: format_conversion
    workspace_root: /absolute/active/project
    session_id: fresh-parent-task-session
    input: /absolute/or/workspace/path/image.png
    from: auto
    to: jpg
    output: optional/output/path.jpg
    force: false
    background: "#ffffff"
    base64_format: png
    raw_base64: false
```

## Script Contract

Run the script through the selected runtime launcher with:

```text
Windows: powershell -NoProfile -ExecutionPolicy Bypass -File <plugin-root>/tools/run_python.ps1 <skill-root>/scripts/convert_image.py --input <path-or-stdin> --to <jpg|png|webp|base64> [...options]
macOS/Linux: sh <plugin-root>/tools/run_python.sh <skill-root>/scripts/convert_image.py --input <path-or-stdin> --to <jpg|png|webp|base64> [...options]
```

Defaults and rules:

- Python 3.10 or newer and Pillow 12.3.0 or newer with LittleCMS2 support are required. If the launcher reports any dependency error, including unsupported Python, missing or outdated Pillow, missing pip, or unavailable LittleCMS2, report every `installInstructions` entry and stop. Allow automatic isolated project-local setup; never install system packages.
- `--input -` reads from stdin.
- With the Windows PowerShell launcher, spell stdin as `--input=-` because a lone trailing `-` is reserved by `powershell -File`.
- `--from auto` first uses an existing file, then recognizes data URLs or strict raw base64 that decodes to a supported image. A nonexistent path is reported as missing instead of being mislabeled as invalid base64.
- Base64 input accepts `.txt`, `.b64`, raw base64, data URLs, and stdin.
- Base64 output writes a text file. It writes a data URL by default; `--raw-base64` writes only the base64 payload. `--raw-base64` and `--base64-format` are valid only with `--to base64`.
- If converting to `base64`, the encoded image container defaults to the source image format. Use `--base64-format` to force `jpg`, `png`, or `webp`.
- JPEG output flattens transparency onto `--background` when provided, otherwise white.
- If `--output` is omitted, the script writes under `.faye/artifacts/faye-image-utility/format-converter/` from the current workspace and auto-suffixes when needed.
- If `--output` is specified, its suffix must match the target: `.jpg` or `.jpeg` for `jpg`, `.png` for `png`, `.webp` for `webp`, and `.txt` or `.b64` for `base64`.
- A new explicit output path is written normally. If it already exists, the script stops unless `--force` was explicitly requested. `--force` requires an explicit `--output` path and is never applied to implicit destinations.
- Animated or multi-frame inputs are unsupported and must fail clearly.
- Image, base64, and stdin inputs are limited to 256 MiB. Decoded images may contain at most 128 million pixels and no edge may exceed 32,768 pixels. For large base64 inputs, use stdin or a `.b64` file instead of a command-line argument.
- Valid source profiles are normalized to sRGB and outputs embed sRGB. EXIF orientation is baked into pixels; valid DPI is retained for PNG and JPEG; source EXIF, GPS, XMP, comments, and other ancillary metadata are stripped.

## Response

Return the output path, source format, target format, and any important notes. Do not paste base64 output unless the user explicitly asks for the content.

## Project-local storage

Before managed writes or runtime setup, read `../../references/workspace-storage.md` from this skill folder. Use host tools for instruction-only setup; no new runtime is needed for notes or screenshots. Pass the active absolute `workspace_root` and a fresh task-session ID to child workflows. Image launchers require `FAYE_WORKSPACE_ROOT` and accept `FAYE_SESSION_ID` for cached setup validation.
