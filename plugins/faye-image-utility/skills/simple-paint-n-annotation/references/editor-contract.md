# Editor Contract

The painter must read this reference before constructing or executing a request. Paths using <plugin-root> are resolved from the invoking skill.

Recommended handoff shape:

```yaml
faye_image_utility_request:
    utility: simple_paint_and_annotation
    workspace_root: /absolute/active/project
    session_id: fresh-parent-task-session
    input: optional/source.png
    output: optional/edited.webp
    overwrite: false
    canvas:
        width: 640
        height: 360
        background: "#00000000"
    operations:
        - type: rectangle
          x: 20
          y: 20
          width: 160
          height: 80
          fill: "#fef3c780"
          stroke: "#ef4444ff"
          strokeWidth: 4
        - type: arrow
          start: [220, 120]
          end: [340, 80]
          color: "#2563ebff"
          width: 6
        - type: label
          text: "LOOK HERE"
          x: 30
          y: 120
          color: "#111827ff"
          background: "#fef3c7ff"
          fontSize: 24
```

## Internal Editor Contract

The painter converts the handoff into JSON and invokes the selected launcher:

```text
Windows: powershell -NoProfile -ExecutionPolicy Bypass -File <plugin-root>/tools/run_python.ps1 <plugin-root>/tools/image_editor.py --request=<json-file-or->
macOS/Linux: sh <plugin-root>/tools/run_python.sh <plugin-root>/tools/image_editor.py --request <json-file-or->
```

The launcher resolves Python 3.10 or newer and verifies Pillow 12.3.0 or newer with LittleCMS2 support. If it reports any dependency error, including unsupported Python, missing or outdated Pillow, missing pip, or unavailable LittleCMS2, return the structured error with every `installInstructions` entry and stop if automatic project-local setup cannot complete; never install system packages. When Windows stdin is selected, use the single argument `--request=-`; a lone trailing `-` is reserved by `powershell -File` and is not forwarded.

Request shape:

```json
{
    "schemaVersion": "1.0",
    "input": { "path": "optional/source.png" },
    "canvas": {
        "width": 640,
        "height": 360,
        "background": "#00000000"
    },
    "operations": [],
    "output": {
        "path": "optional/edited.png",
        "format": "png",
        "background": "#ffffff",
        "quality": 95,
        "overwrite": false
    }
}
```

Rules:

- Omit `input` to create a canvas. Canvas defaults to 640×360 transparent.
- When `input` is present, use a `resize` operation instead of canvas dimensions.
- Existing images preserve their decoded source format unless an output path or format overrides it. New canvases default to PNG.
- Explicit output paths must end in `.png`, `.jpg`, `.jpeg`, or `.webp`; an explicit format must agree with the suffix.
- A new explicit output path is written normally. If it already exists, the editor stops unless `output.overwrite` is true. Set it to true only when the user explicitly authorizes replacement; it is invalid without `output.path`.
- Omitted destinations write under `.faye/artifacts/faye-image-utility/image-editor/` and auto-suffix to avoid collisions.
- PNG and WebP preserve alpha. JPEG flattens alpha onto the configured output background, defaulting to white.
- JPEG and WebP quality defaults to 95. Inputs must be static and single-frame.
- Colors use `#RRGGBB` or `#RRGGBBAA`; coordinates are pixel-based; operations are applied in order; each image edge is limited to 4096 pixels.
- Editor JSON is limited to 8 MiB and 256 operations, including at most 32 composites. Stroke data is limited to 16,384 points per stroke and 65,536 total points; text is limited to 4,096 characters per operation and 16,384 total characters. Rendered text is limited to 32,768 pixels per edge and 16,777,216 pixels in area before rasterization. Font files are limited to 32 MiB.
- Working pixels are normalized to sRGB. Outputs embed sRGB, bake EXIF orientation, retain valid source DPI for PNG and JPEG, and strip EXIF, GPS, XMP, comments, and other ancillary metadata.

Canonical operations are `stroke`, `line`, `arrow`, `rectangle`, `circle`, `dot`, `text`, `label`, `resize`, `crop`, `rotate`, `flip`, `opacity`, and `composite`. Only the canonical operations and fields above are accepted; legacy command flags and field aliases are invalid.

Operation fields:

- `stroke`: `points`, optional `color`, and optional `width`.
- `line` or `arrow`: `start`, `end`, optional `color`, and optional `width`.
- `rectangle`: `x`, `y`, `width`, `height`, optional `fill`, `stroke`, and `strokeWidth`.
- `circle`: `center`, `radius`, optional `fill`, `stroke`, and `strokeWidth`.
- `dot`: `center`, optional `radius`, and optional `color`.
- `text` or `label`: `text`, optional `x`, `y`, `color`, `fontSize`, `fontPath`, `background`, `padding`, and `spacing`.
- `resize`: `width`, `height`, optional `mode` (`stretch`, `contain`, or `cover`), and optional `background` for containment padding.
- `crop`: non-negative `x`, `y`, `width`, and `height`; the box must remain inside the current image.
- `rotate`: `degrees`, optional `expand` (default true), and optional `background`; positive degrees rotate counterclockwise.
- `flip`: `axis` set to `horizontal` or `vertical`.
- `opacity`: `value` from 0 through 1.
- `composite`: `path`, optional `x`, `y`, `opacity`, and optional paired `width` and `height`. The overlay is clipped to the current canvas.

## Internal Reuse Boundary

The implementation lives under `shared/python/faye_image_editor/` so another plugin-owned script can import a document, validation, operation, or rendering feature for a deterministic substep. Such direct reuse does not make the editor a public skill and does not require every consumer to use this CLI. User-facing painting and editing through this skill still delegates to `faye_image_painter`.
