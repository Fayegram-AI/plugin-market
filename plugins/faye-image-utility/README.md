# Faye Image Utility

Faye Image Utility is a Codex plugin package for image utility skills and
regulated subagents. Current packaged skills include contract-based
generated-image QA, artifact auditing, explicitly requested informational image
age-rating estimates with structured output and visible-cause reporting, real
image format conversion, and multi-format deterministic painting and editing.

## Identity

- Stable plugin ID: `faye-image-utility`
- Display name: `Faye Image Utility`
- Version: `0.1.0-beta.6`
- Publisher: [Fayegram](https://fayegram.com)
- Publishing team: `Fayegram`
- Legal owner: `Semicolon, LLC`
- Website: [Faye Plugin Market](https://plugin-market.fayegram.com)
- Repository: [plugin-market](https://github.com/Fayegram-AI/plugin-market)
- Icon asset: `assets/icon.png`, referenced by `interface.composerIcon` and
  `interface.logo`

## Contents

```text
<plugin-root>/
    .codex-plugin/plugin.json
    .grok-plugin/plugin.json
    plugin.json
    LICENSE
    FAYEGRAM_ASSETS.md
    agents/faye-image-assessor.toml
    agents/faye-image-painter.toml
    agents/image-processor.toml
    assets/icon.png
    references/workspace-storage.md
    shared/python/faye_image_common/
        __init__.py
        formats.py
        limits.py
        paths.py
        pillow_io.py
        pillow_output.py
    shared/python/faye_image_editor/
        __init__.py
        cli.py
        document.py
        errors.py
        models.py
        output.py
        service.py
        validation.py
        operations/
    shared/python/faye_workspace/
        __init__.py
        locking.py
        runtime.py
        sessions.py
        storage.py
    tools/
        PYTHON_RUNTIME.md
        requirements.lock
        runtime_bootstrap.py
        python_runtime_probe.py
        run_python.ps1
        run_python.sh
        image_editor.py
    skills/faye-image-artifact-audit/
        SKILL.md
        agents/openai.yaml
        references/
            assessor-protocol.md
            audit-framework.md
            objects-and-built-scenes.md
            optics-materials-and-environment.md
            parent-handoff.md
            people-and-creatures.md
            reporting.md
            reporting-modes/
            styles-prompts-and-series.md
            text-products-and-interfaces.md
    skills/faye-image-age-rating/
        SKILL.md
        agents/openai.yaml
        references/age-rating-catalog.json
        references/age-rating-request.schema.json
        references/age-rating-result.schema.json
        references/age-rating-systems.md
        references/assessor-protocol.md
        references/structured-rating-contract.md
        scripts/validate_age_rating_contract.py
        scripts/preflight_age_rating_images.py
        scripts/faye_age_rating/
    skills/faye-image-format-converter/
        SKILL.md
        agents/openai.yaml
        scripts/convert_image.py
    skills/simple-paint-n-annotation/
        SKILL.md
        agents/openai.yaml
        references/editor-contract.md
```

The read-only image assessor is bundled inside this plugin package. Do not add a
parallel active copy outside this plugin package.

## Licensing

The plugin software and documentation are licensed under the MIT License. See
`LICENSE` for the complete terms and the required Semicolon, LLC copyright and
permission notice.

The Fayegram name, the Faye Image Utility name, and `assets/icon.png` are
identity assets outside the MIT grant. `FAYEGRAM_ASSETS.md` defines the limited
permission for authentic package display and unmodified redistribution.

This package license does not claim or change ownership of user prompts,
images, local files, generated or edited images, reports, or other inputs and
outputs handled or created while using the plugin.

## Marketplace Presentation

`.codex-plugin/plugin.json` defines the public display name, brand color, starter
prompts, and icon paths. The root `plugin.json` is the minimal compatibility
manifest; it retains package identity, version, description, license, and author.
The icon is a flat, high-contrast `1024x1024` PNG designed to
remain legible when the marketplace displays it at small sizes such as `64x64`.

```json
"brandColor": "#14B8A6",
"composerIcon": "./assets/icon.png",
"logo": "./assets/icon.png"
```

## Current Skills

`$faye-image-artifact-audit` supports image QA and artifact auditing: artifact
checks, prompt/declared-context/reference/continuity/delivery conformance,
targeted inspection, batch comparison, severity, confidence, acceptability,
and repair-target reporting.

The skill must perform analysis through the bundled `faye_image_assessor`
subagent. If the runtime does not expose plugin-bundled agents, report that Faye
Image Utility's bundled image assessor is unavailable instead of performing the
full audit in the parent thread.

The artifact protocol is split into a canonical framework, reporting rules, and
focused topical references. The parent passes their resolved runtime paths;
the assessor reads its utility protocol, the two core references, the selected
reporting mode, and only the topical guides relevant to the inspected image.

`$faye-image-age-rating` supports structured age/content rating estimates and
visible-cause reporting for images after explicit tagged invocation. It defaults
to all five supported systems—MPA, PEGI, EIRIN, CERO, and IMDA—all detected
visual causes, and strict JSON. A caller can select one or several systems,
request per-image medium-based automatic selection, disable cause reporting,
select one cause for focused reporting, embed a concise summary in JSON, or ask
for one concise single-line summary after the JSON. Focused cause reporting does
not narrow the rating basis; every rating still considers the complete visible
image. Rating results use stable slug IDs and return the catalog's exact
official display label separately.

The skill performs visual judgment through the bundled `faye_image_assessor`
subagent and requires request normalization, deterministic per-image system
resolution, and correlated result validation through the bundled
Python validator. The parent runs every launcher and validator; the read-only
assessor returns medium determinations, receives the exact resolved systems,
and returns candidate findings. Each stage allows at most two correction rounds.
Only a validated result is rendered, and render stdout is returned verbatim.
A deterministic Pillow-based local-image preflight supplies
technical decode, dimensions, duplicate, luma, entropy, edge, and difference-hash
signals for inspectability and confidence only; it does not classify content.
The request/result schemas, Python validator, and image preflight share one
stable nonblank-character set and Unicode code-point length rules. Render-only
trailing summaries use the same blank set and an explicit Unicode line-boundary
set.
PEGI interactive risks are reported separately and only from visible
UI/text or reliable caller-supplied context. The output remains an informational
estimate by analogy to rating systems, not an official rating, legal conclusion,
moderation decision, or viewer age-verification result. Metadata disables
implicit invocation: only an explicit `$faye-image-age-rating` mention may
engage the skill. An untagged natural-language request does not activate it,
including a request specifically asking for an age/content rating. After
invocation, the skill remains out of scope for broad image checks, moderation,
NSFW/adultness, generation, editing, conversion, or description.

`$faye-image-format-converter` supports real conversion among `jpg`, `png`,
`webp`, and `base64`. It must spawn the bundled `image_processor` subagent, and
that subagent must run `skills/faye-image-format-converter/scripts/convert_image.py`
for every conversion. The converter accepts raw base64 or data URLs, writes
base64 output as text, rejects unsupported formats, rejects animated inputs,
requires Pillow, creates parent output directories, and flattens transparent
images to white for JPEG unless a background color is provided. Explicit
`--output` paths are used exactly, their suffix must match the target format,
and replacing an existing file requires explicit `--force` authorization.
Omitted output paths are written under
`.faye/artifacts/faye-image-utility/format-converter/` from the current workspace and
auto-suffixed to avoid collisions. Inputs are limited to 256 MiB, 128 million
decoded pixels, and 32,768 pixels per edge.

`$simple-paint-n-annotation` supports deterministic painting and basic editing
for static PNG, JPEG, and WebP files. It creates canvases, draws strokes,
geometry, modern text, and labels, and applies resize, crop, rotation, flip,
opacity, and image-compositing operations. User-facing requests still delegate
to the bundled `faye_image_painter`, which runs the plugin-internal
`tools/image_editor.py` structured JSON adapter and verifies its output. New
explicit output paths are written normally; replacing an existing file requires
explicit `output.overwrite` authorization. Omitted destinations remain
collision-safe. Combined rendered text bounds are checked before Pillow creates
glyph masks, preventing individually valid text length and font-size values from
forming an unsafe raster workload.

The implementation is a modular Python/Pillow package under
`shared/python/faye_image_editor/`, outside the public `skills/` tree. Other
plugin-owned scripts may import only the document, operation, or rendering
features needed for deterministic internal substeps without delegating through
the painter. The CLI remains one adapter, not the exclusive editor gateway.

Existing images preserve their source container unless the request specifies a
PNG, JPEG, or WebP destination; new canvases default to PNG. Omitted output
paths write under `.faye/artifacts/faye-image-utility/image-editor/` and auto-suffix to
avoid collisions. PNG and WebP preserve alpha; JPEG flattens alpha onto a
configurable background. Animated inputs, PDFs, document markup, unsupported
formats, and semantic or generative edits fail clearly.

All decoded working pixels use sRGB. Valid source profiles are converted to
sRGB, EXIF orientation is baked into the pixels, and PNG, JPEG, and WebP
outputs embed an sRGB profile. Valid source DPI is retained for PNG and JPEG;
WebP omits it. EXIF, GPS, XMP, comments, and other ancillary source metadata
are not copied to outputs.

Faye Image Utility is a deterministic image editor, not a semantic photo editor
or image generator. Route object removal, generative fill, restoration,
background invention, metadata inspection or editing, safety moderation, and
official rating certification to an appropriate dedicated tool or process.
The output-sanitization policy above is part of safe encoding, not a metadata
editing workflow.

## How To Use

Invoke the skill that matches the requested image workflow:

```text
Use $faye-image-artifact-audit to inspect this image for visible artifacts and prompt conformance.
Use $faye-image-age-rating to estimate this image's age ratings across all supported systems and return visible causes as JSON.
Use $faye-image-format-converter to convert this image to WebP.
Use $simple-paint-n-annotation to add clear labels and arrows to this image.
```

Use local file paths or attached images when the runtime supports attachments.
For artifact audits, provide the original prompt, intended use, visual style,
reference image, explicit delivery requirements, or specific concern when
available. For age-rating estimates, provide the available request context.
For conversion and paint tasks, provide explicit input and output paths when the
output location matters.

## Skill Routing

- Use `$faye-image-artifact-audit` for generated-image QA, artifact and
  conformance checks, acceptability, and repair targets.
- Use `$faye-image-age-rating` only when the request explicitly names
  `$faye-image-age-rating`; untagged age/content-rating requests do not engage it.
- Use `$faye-image-format-converter` only for real conversion among `jpg`,
  `png`, `webp`, and `base64`.
- Use `$simple-paint-n-annotation` for deterministic painting, annotation,
  compositing, resizing, cropping, rotation, flipping, opacity, and text.
- PDF annotation, image generation, semantic photo editing, metadata inspection
  or editing, and safety moderation are outside the current plugin scope.

## Runtime Requirements

- Plugin-bundled subagents must be available. Each skill reports a blocker
  instead of simulating work when its required subagent is unavailable.
- Every Python-backed workflow uses the plugin-owned `tools/run_python.ps1`
  launcher on Windows or `tools/run_python.sh` on macOS/Linux. The launchers
  resolve Python, preserve script stdin/arguments/output, and run the shared
  project-local runtime bootstrap before invoking a target script.
- Python 3.10 or newer and Pillow 12.3.0 or newer with LittleCMS2 color
  management are required. Locked Pillow wheels install automatically into an
  isolated project-local environment using existing Python with venv/ensurepip.
  Any dependency error, including unavailable LittleCMS2, produces structured
  JSON on stderr with OS-aware `installInstructions`; callers surface every
  instruction and stop. The plugin never installs or upgrades host software
  automatically. `FAYE_WORKSPACE_ROOT` is required and identifies the active
  project independently of the invocation directory.
- `FAYE_PYTHON` may name an explicit base interpreter executable; it is never the package-installation target. Without it,
  Windows tries `py -3`, `python3`, and `python`; macOS/Linux tries `python3`
  and `python`.
- Structured age-rating normalization, validation, and local-image preflight
  require Python with Pillow and use
  `skills/faye-image-age-rating/scripts/validate_age_rating_contract.py` and
  `skills/faye-image-age-rating/scripts/preflight_age_rating_images.py`.
  Contract input is limited to 8 MiB; each local preflight image uses the same
  256 MiB, 128-million-pixel, and 32,768-pixel-edge limits as conversion.
- Format conversion uses the same shared Python/Pillow loading layer and uses
  `skills/faye-image-format-converter/scripts/convert_image.py`.
- Painting and deterministic editing use Python with Pillow through the shared
  `faye_image_editor` package and internal `tools/image_editor.py` adapter.
- Artifact audits and age-rating estimates are read-only visual assessment
  workflows and do not write image files.

See `tools/PYTHON_RUNTIME.md` for the internal driver contract, platform
commands, resolution order, and structured error codes.

## Boundaries

Age-rating output is an informational estimate by analogy to rating systems. It
is not an official rating, legal conclusion, certification, platform moderation
decision, or viewer age-verification result. `all` expands to the five systems
declared in the versioned catalog; it does not mean every rating system in
existence. Deterministic validation checks contract correctness, not whether a
visual rating judgment is substantively correct.

The paint skill accepts and emits static PNG, JPEG, and WebP images. It is
limited to deterministic pixel operations with explicit geometry; it does not
perform semantic or generative editing. Animated inputs, PDFs, document markup,
corrupt images, and unsupported containers must fail clearly.

## Current Bundled Agents

`faye_image_assessor` is the shared read-only visual assessment subagent used by
`$faye-image-artifact-audit` and `$faye-image-age-rating`.

`faye_image_painter` is the workspace-write painting and deterministic editing
subagent used by `$simple-paint-n-annotation`; it must run the internal Python
editor adapter and verify PNG, JPEG, or WebP outputs instead of simulating edits.

`image_processor` is the workspace-write format-conversion subagent used by
`$faye-image-format-converter`; it must run the bundled converter and verify
JPEG, PNG, WebP, or base64 output instead of simulating conversion.

## Validation

From the marketplace repository root, run:

```powershell
npm run validate
```

This checks the distributed package structure, skill and agent metadata,
registry alignment, managed-file integrity, licensing boundaries, and forbidden
artifacts. It does not execute image workflows or the development test suites.

## Workspace storage update

Managed files use `.faye/` under the explicitly selected project. Read
`references/workspace-storage.md` for lazy Git protection, persistent versus
temporary storage, and seven-day cleanup on next use without scheduling.
Legacy `faye/` content is not migrated or removed.
