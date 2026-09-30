# Structured Image Age-Rating Contract

This reference defines the request, deterministic resolution, and result contract for `$faye-image-age-rating`. Rating criteria live in `age-rating-systems.md`; identifiers and ordering live in `age-rating-catalog.json`.

## Contract boundary

Assess only the visible image. Medium, intended use, and other reliable caller context may guide system routing, evidence interpretation, confidence, visibility limits, and messages, but the context is not itself rated. Never claim to assess an unseen film, game, video, narrative, audio track, duration, mechanic, or distribution context.

The utility returns informational still-image analogies. It does not issue an official rating, certify legal compliance, enforce moderation policy, decide display access, or verify a viewer's age or identity.

Visual classification is probabilistic. Request normalization, system routing, required messages, and result consistency are deterministic. Scripts must not invent a visual cause or rating.

## Request

Use `schemaVersion: "1.0.0"` and `utility: "age_rating"`. Each input has one optional medium field. Do not put medium in the shared `context` object.

```json
{
    "schemaVersion": "1.0.0",
    "utility": "age_rating",
    "imageInputs": [
        {
            "label": "image-1",
            "source": "/absolute/path/image.png",
            "medium": "artwork"
        }
    ],
    "systems": [
        "mpa",
        "pegi"
    ],
    "causes": {
        "mode": "all"
    },
    "outputMode": "strict_json",
    "context": {}
}
```

The request normalizer applies these defaults:

- `schemaVersion`: `1.0.0`.
- `utility`: `age_rating`.
- Missing `imageInputs[].medium`: `null`.
- `systems`: `all`.
- `causes.mode`: `all`.
- `outputMode`: `strict_json`.
- `context`: empty object.

### Text constraints

Every request or result string marked nonblank by its schema must contain at least one character outside this stable blank set: U+0009-U+000D, U+001C-U+0020, U+0085, U+00A0, U+1680, U+2000-U+200A, U+2028-U+2029, U+202F, U+205F, U+3000, and U+FEFF. The request validator, result validator, and image preflight must use this exact set rather than platform trimming or a runtime-specific whitespace class.

String length limits count Unicode code points. A label of 120 supplementary characters is valid; a label of 121 is not.

The render-only `trailingSummary` uses the same stable blank set for its nonblank and surrounding-whitespace rules. Its single-line rule rejects the explicit line-boundary set U+000A-U+000D, U+001C-U+001E, U+0085, U+2028, and U+2029 wherever they occur.

### Medium input

`medium` accepts `artwork`, `photograph`, `film`, `game`, `video`, `mixed`, or `unknown`. The value describes the source or intended medium of that image; it does not broaden the assessment beyond the visible still.

- Preserve an invoker-provided value as authoritative, including `unknown`.
- When normalized medium is `null`, determine medium from the image before system resolution.
- Never infer medium from unseen context or overwrite an invoker value.

### System selection

`systems` accepts:

- `all`: evaluate MPA, PEGI, EIRIN, CERO, and IMDA in catalog order.
- `auto`: resolve directly applicable systems independently for each image.
- A non-empty unique array of system IDs. One-element and multi-system arrays are both valid.

Arrays are normalized into catalog order. Do not place `all` or `auto` inside an array. Explicit arrays and `all` always evaluate every selected system, even when the system normally applies to another medium.

## Medium determination

Every result records one medium object:

```json
{
    "id": "artwork",
    "source": "invoker_provided",
    "confidence": null
}
```

Consistency rules:

- `invoker_provided`: ID equals the request value and confidence is null.
- `inferred`: ID is not `unknown` and confidence is `low`, `medium`, `high`, or `very_high`.
- `undetermined`: ID is `unknown` and confidence is null.

For `auto`, use inferred medium to narrow systems only at `high` or `very_high` confidence. Low/medium inference falls back to all systems.

Direct applicability is catalog-defined:

- `film`: MPA, EIRIN, IMDA.
- `game`: PEGI, CERO.
- `video`: IMDA.
- `artwork`, `photograph`, `mixed`, and `unknown`: no direct system; `auto` falls back to all systems as still-image analogies.

## Deterministic messages

Every image result has a `messages` array. Resolver-generated messages must be copied exactly and remain first in resolver order:

- `medium-inferred`: the assessor inferred medium.
- `medium-unspecified`: applicability cannot be determined.
- `auto-selection-fallback`: `auto` evaluated all systems because no reliable direct set was available.
- `system-medium-mismatch`: explicit selection contains systems not directly applicable to a reliable medium determination.

Group all mismatching systems into one warning. A mismatch never removes the requested system, substitutes another system, or by itself forces manual review. After required messages, the assessor may append `assessment-note` entries at info level for additional image-specific information.

## Cause modes

- `all`: report every present or uncertain visual cause; omit routine absences.
- `off`: report no cause findings, driver IDs, or cause-revealing explanations.
- `selected`: require one `selectedId` and report exactly that cause as `present`, `absent`, `uncertain`, or `not_assessable`.

Cause selection changes reporting, not rating scope. Every system rating still considers the complete visible image. In `selected` or `off` mode, set `hasUnreportedDrivers` when hidden causes materially affect a rating. Medium must not suppress or reduce a visible cause; use realism, detail, frequency, and framing qualifiers instead.

Result correlations are mandatory:

- In `all` mode, every rating has `hasUnreportedDrivers: false` because all reportable drivers are exposed.
- Every `driverIds` value identifies a reported cause finding whose presence is `present` or `uncertain`. An `absent` or `not_assessable` cause cannot drive a rating.
- A null `ratingId` requires an empty `driverIds` array.
- A `present` cause or interactive risk requires at least one evidence statement from its declared evidence source.

## Result shape

Return normalized selections and one result per request image. System expansion belongs to each image because `auto` may produce different system sets within a batch.

```json
{
    "systemsSelection": "auto",
    "results": [
        {
            "imageLabel": "image-1",
            "medium": {
                "id": "film",
                "source": "inferred",
                "confidence": "high"
            },
            "systemsEvaluated": [
                "mpa",
                "eirin",
                "imda"
            ],
            "messages": []
        }
    ]
}
```

Each complete image result also contains status, one ordered rating per evaluated system, causes, interactive risks, visibility limits, and manual review. Use the stable catalog slug in `ratingId` and exact presentation text in `ratingLabel`. Use both as null when no responsible estimate is possible.

If any image requires review, use top-level `manual_review_required`. Use top-level `unable_to_assess` only when every image is unavailable or uninspectable.

## Finding and interactive-risk rules

- Record only visible, reliable caller-provided, or explicitly inferred evidence.
- `present` requires non-null severity.
- `absent` and `not_assessable` require null severity.
- Use confidence labels, never invented numeric confidence.
- PEGI interactive risks remain separate from visual causes.
- When PEGI is not evaluated for an image, use `not_applicable` with no findings.
- When PEGI is evaluated but still-image evidence cannot establish interactive features, use `not_assessable` with no findings.
- Never infer gameplay mechanics from artwork, genre, or theme.

## Output modes

- `strict_json`: one JSON object without a Markdown fence or prose.
- `json_with_summary`: include one top-level `summary` string.
- `json_then_summary`: validate JSON without a summary field, then render one concise single-line summary after it.

## Assessor handoff and response rendering

The assessor returns one machine-only candidate JSON object for parent result validation:

```json
{
    "result": {},
    "trailingSummary": null
}
```

`result` is the exact object emitted by result validation. Use null for `trailingSummary` in `strict_json` and `json_with_summary`. For `json_then_summary`, use one summary containing at least one character outside the stable blank set, no stable blank character at either boundary, and no defined line-boundary character. Do not include Markdown fences, validation reports, diagnostics, or prose in the handoff.

The parent combines its authoritative normalized request with this handoff and runs `render`. Render mode revalidates request/result correlation and emits the public response deterministically. Return its stdout verbatim; do not manually reconstruct or append to it.

## Deterministic workflow

The contract CLI reads stdin and never writes files. Resolve the plugin root, then use `tools/run_python.ps1` on Windows or `tools/run_python.sh` on macOS/Linux for every mode:

```powershell
$json | powershell -NoProfile -ExecutionPolicy Bypass -File <plugin-root>/tools/run_python.ps1 <skill-root>/scripts/validate_age_rating_contract.py request
$json | powershell -NoProfile -ExecutionPolicy Bypass -File <plugin-root>/tools/run_python.ps1 <skill-root>/scripts/validate_age_rating_contract.py resolve
$json | powershell -NoProfile -ExecutionPolicy Bypass -File <plugin-root>/tools/run_python.ps1 <skill-root>/scripts/validate_age_rating_contract.py result
$json | powershell -NoProfile -ExecutionPolicy Bypass -File <plugin-root>/tools/run_python.ps1 <skill-root>/scripts/validate_age_rating_contract.py render
```

On macOS/Linux, replace the PowerShell launcher prefix with `sh <plugin-root>/tools/run_python.sh`. The launchers require Python 3.10+ and Pillow 12.3.0+ with LittleCMS2 support. Any dependency failure is structured JSON on stderr with `installInstructions`; surface every instruction and stop without installing anything automatically.

1. `request` accepts a raw request and emits its normalized form.
2. `resolve` accepts `{ request, mediumDeterminations }` and emits per-image medium, systems, and mandatory messages.
3. `result` accepts `{ request, result }`, validates their correlation, and emits only the validated result.
4. `render` accepts `{ request, result, trailingSummary }`, revalidates the result, enforces output-mode summary placement, and emits the exact public response. Successful render output has empty stderr.

Invalid input produces structured errors on stderr and a nonzero exit code. Successful validation proves contract consistency, not visual correctness.

## Local-image technical preflight

When a request image has a readable local path, run the separate preflight before delegating visual judgment:

```powershell
$json | powershell -NoProfile -ExecutionPolicy Bypass -File <plugin-root>/tools/run_python.ps1 <skill-root>/scripts/preflight_age_rating_images.py
```

Its input is `{ "images": [{ "label": "image-1", "source": "C:/absolute/path/image.png" }] }`. Labels must match the normalized request. The preflight uses the EXIF-normalized first displayed frame, does not upscale its analysis image, and limits the longest analysis edge to 1024 pixels. It reports deterministic decoding properties, raw-byte SHA-256 and exact duplicate labels, alpha/frame state, luma statistics, clipping ratios, entropy, edge variance, and a difference hash. Multi-frame inputs are measured from frame zero and explicitly flagged.

For repeatability, transparent pixels are composited onto white for metrics; downsampling uses Lanczos; luma uses the 256-bin grayscale histogram; P01/P99 use nearest-rank histogram percentiles; clipping counts exact 0 and 255 pixels; entropy uses base 2; edge variance applies Pillow `FIND_EDGES` after removing a one-pixel border; and dHash compares left-to-right samples in a 9-by-8 grid and emits 16 lowercase hexadecimal characters. Floating metrics are rounded to six decimal places. The dHash is descriptive only; duplicate grouping uses raw-byte SHA-256 exclusively.

This output is an internal assessor aid, not a request or result field. An unavailable item does not discard other batch results. Missing local paths or attachments without a filesystem path must continue without fabricated metrics. Preflight values can support inspectability, visibility-limit, and confidence decisions only. They cannot establish medium, semantic content, cause presence, severity, or a rating.

## Parent-owned staged execution

The public schemas and validator modes are unchanged. Parent execution context adds `stage` separately: `determine_medium`, `assess`, `correct_medium`, or `correct_result`. The medium stage returns `{ mediumDeterminations }`; the parent passes that array with the normalized request to `resolve`. The emitted object is supplied unchanged as separate `resolution` context for assessment. The result stage returns the candidate handoff above. The parent alone runs request, preflight, resolve, result, and render through the plugin launcher. The assessor reads [assessor-protocol.md](assessor-protocol.md) and never runs write-producing commands. Each stage has an initial attempt and at most two correction rounds; summary/render corrections share the result-stage budget. Unresolved errors stop delivery rather than bypassing validation.
