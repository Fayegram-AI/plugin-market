---
name: simple-paint-n-annotation
description: "Draw on a blank canvas or edit static PNG/JPEG/WebP images with deterministic painting, annotation, compositing, and basic transforms. Exclude generative/semantic edits, artifact QA, age ratings, conversion-only work, and PDFs."
---

# Faye Simple Paint and Annotation

Use a blank canvas for requested new drawings. Resolve the required source image before editing an existing image; if it is unavailable, report the blocker.

## Scope

Build an ordered operation list, using pixel coordinates for placement:

- Strokes, lines, arrows, rectangles, circles, dots, text, and labels.
- Resize, crop, rotate, horizontal or vertical flip, and global opacity.
- Positioning and compositing one static image over another.

Do not use this skill for semantic object removal, generative fill, restoration, background invention, complex photo retouching, metadata editing, PDF or document annotation, or generative image synthesis. Route conversion-only requests to `$faye-image-format-converter`, generated-image QA to `$faye-image-artifact-audit`, and explicit age/content rating to `$faye-image-age-rating`.

## Delegated Workflow

1. Spawn the bundled `faye_image_painter` defined at `../../agents/faye-image-painter.toml` from this skill folder.
2. Send the source path when present, requested destination when supplied, canvas settings for a new image, ordered editor operations, and output preferences.
3. Require the painter to run the plugin-internal `../../tools/image_editor.py` JSON adapter. Resolve that script to an absolute path before execution, and run it through the plugin-root `tools/run_python.ps1` launcher on Windows or `tools/run_python.sh` on macOS/Linux.
4. Do not perform a user-facing paint/edit request directly in the parent thread or claim success from reasoning alone.
5. If the painter, launcher runtime, internal editor, input, or requested operation is unavailable, report the blocker instead of simulating output.

Send the painter the absolute path to [references/editor-contract.md](references/editor-contract.md); it must read that contract before building editor JSON. The parent loads it only when exact operation fields are needed to resolve the request.

Preserve operation order and use the user's explicit output path exactly. Authorize replacement only for an existing file the user explicitly agreed to replace. Omitted destinations use the collision-safe project-local `.faye/artifacts/faye-image-utility/image-editor/` default. Require the painter to verify that the result exists, is non-empty, and matches its reported PNG, JPEG, or WebP container before claiming success.

## Response

Return the output path, input path when present, source and output formats, final dimensions, operations applied, and important limitations. Do not paste image bytes or base64 unless explicitly requested.

## Project-local storage

Before managed writes or runtime setup, read `../../references/workspace-storage.md` from this skill folder. Use host tools for instruction-only setup; no new runtime is needed for notes or screenshots. Pass the active absolute `workspace_root` and a fresh task-session ID to child workflows. Image launchers require `FAYE_WORKSPACE_ROOT` and accept `FAYE_SESSION_ID` for cached setup validation.
