---
name: faye-image-age-rating
description: "Never auto-invoke. Use only for explicit $faye-image-age-rating requests to estimate MPA, PEGI, EIRIN, CERO, or IMDA image ratings and visible causes. Do not use for moderation, NSFW checks, general inspection, artifact QA, editing, conversion, or generation."
---

# Faye Image Age Rating

Estimate image age/content ratings through the bundled `faye_image_assessor` and return a validated result. Treat every rating as an informational still-image analogy, never official certification, legal advice, moderation enforcement, display gating, or viewer age verification.

## Engagement gate

Invoke this skill only through an explicit `$faye-image-age-rating` mention. Do not activate it from an untagged natural-language request, even when that request asks for an age/content rating. After invocation, use it only for an age/content rating, rating-system mapping, age restriction, parental-guidance classification, or rating-focused cause check.

Route generated-image QA to `$faye-image-artifact-audit`, deterministic painting, annotation, or basic editing to `$simple-paint-n-annotation`, and jpg/png/webp/base64 conversion to `$faye-image-format-converter`.

## Contract defaults

- Systems: `all`, expanding to MPA, PEGI, EIRIN, CERO, and IMDA.
- Causes: `all`, reporting present and uncertain visual causes.
- Output: `strict_json`, without surrounding prose.
- Rating scope: the complete visible image, regardless of cause filtering.
- Interactive risks: separate PEGI context, never inferred from artwork alone.

Allow `systems: "auto"` or a non-empty array containing one or several system IDs. Allow cause mode `off` or `selected`; `selected` requires one neutral cause ID. Allow `json_with_summary` or `json_then_summary` only when requested.

Read `references/structured-rating-contract.md` for every request. Read `references/age-rating-systems.md` before rating. Use `references/age-rating-catalog.json`, `references/age-rating-request.schema.json`, and `references/age-rating-result.schema.json` as the machine contract. Never invent identifiers. Emit stable slugs such as `pegi-3` in `ratingId` and exact presentation labels such as `PEGI 3` in `ratingLabel`.

## Workflow

1. Resolve each image to a local path or attachment reference and assign a
   unique short label. Prefer originals over compressed screenshots.
2. Put an invoker-supplied medium only in that image's `medium` field. Never
   create `context.medium`. Include other context only when supplied or clearly
   identified.
3. Resolve the plugin root and this skill root to absolute paths. Select
   `tools/run_python.ps1` on Windows or `tools/run_python.sh` on macOS/Linux,
   then pipe the raw request to the absolute
   `<skill-root>/scripts/validate_age_rating_contract.py` path in `request`
   mode. Never invoke `py`, `python`, or `python3` directly. Use the normalized
   JSON as the authoritative handoff.
4. For every resolved local path, pipe `{ "images": [{ "label", "source" }] }`
   to the absolute `<skill-root>/scripts/preflight_age_rating_images.py` path
   through the same launcher. Keep this technical preflight separate from the
   request and public result. Pass its output to the assessor as supplemental
   inspectability information. If an attachment has no usable local path,
   continue without inventing preflight metrics.
5. Delegate to the bundled `faye_image_assessor` at
   `../../agents/faye-image-assessor.toml` with the normalized request,
   supplemental preflight, and absolute skill/contract paths. Send stage
   `determine_medium` separately from the public request. Require only
   `{ mediumDeterminations }`, one ordered entry per image. Preserve supplied
   media; the assessor determines medium only where normalized medium is null
   and must still evaluate only the visible image.
6. In the parent, pipe `{ request, mediumDeterminations }` through the selected
   launcher to `<skill-root>/scripts/validate_age_rating_contract.py` in
   `resolve` mode. Send the exact emitted object as `resolution`, the unchanged
   normalized request, and stage `assess` to the same assessor.
7. Require one machine-only handoff object containing exactly `result` and
   `trailingSummary`. This is a candidate, not proof of validation. Use null
   for `trailingSummary` except for `json_then_summary`, where it must satisfy
   the structured contract's stable nonblank, no-surrounding-whitespace, and
   single-line rules. Reject fences, diagnostics, or surrounding prose.
8. In the parent, pipe `{ request, result }` through the launcher to the
   validator in `result` mode. Preserve the exact validated object.
9. For invalid medium, candidate, or handoff structure, send the exact errors
   to the same assessor with stage `correct_medium` or `correct_result`.
   Allow at most two correction rounds for medium and two for the result
   (including handoff/summary corrections), then report the unresolved failure.
   Rerun the appropriate validator after each correction. If medium changes,
   rerun resolution before assessment. Never repair visual findings in the
   parent or invent evidence to make validation pass.
10. In the parent, pipe `{ request, result, trailingSummary }` through the
    launcher to the validator in `render` mode. A render error uses the same
    result correction budget and must pass result validation again.
11. Return render-mode stdout verbatim. Do not reconstruct, reformat,
    summarize, fence, or append text to the rendered response.

The assessor remains read-only at every stage: it never runs a launcher, validator, installer, or filesystem cleanup. The parent owns every such operation. Keep `stage` and `resolution` outside public request/result schemas. If a required native role is unavailable, follow the explicit blocker below.

If the launcher reports any dependency error at a deterministic step, including unsupported Python, missing or outdated Pillow, missing pip, or unavailable LittleCMS2, return its structured error with every `installInstructions` entry and stop. Allow the launcher to install dependencies in the project-local isolated runtime; never install system packages or replace deterministic validation with an unvalidated response.

The deterministic layers normalize selections, resolve medium applicability, generate required warnings, validate cross-field consistency, and serialize the public response. They never determine whether a visual rating is correct. The preflight additionally reports decoding, dimensions, EXIF orientation, alpha, frames, exact duplicates, luma distribution, entropy, edge variance, and a difference hash. These technical signals may affect inspectability, visibility limits, or confidence only; they must never determine medium, content causes, or age ratings.

## Normalized handoff

Send `workspace_root` and `session_id` as separate agent execution context. Do not add these fields to the normalized rating request or result schemas.

```json
{
    "schemaVersion": "1.0.0",
    "utility": "age_rating",
    "imageInputs": [
        {
            "label": "image-1",
            "source": "/absolute/or/attachment/reference.png",
            "medium": null
        }
    ],
    "systems": "all",
    "causes": {
        "mode": "all"
    },
    "outputMode": "strict_json",
    "context": {}
}
```

Natural-language mappings:

- "Rate this image" => defaults.
- "Choose systems for this game image" => `systems: "auto"` and per-image `medium: "game"` when supplied by the invoker.
- "Compare MPA and PEGI" => `systems: ["mpa", "pegi"]`.
- "Do not list causes" => `causes.mode: "off"`.
- "Check specifically for gore" => `causes.mode: "selected"` with `selectedId: "blood-gore"`.

## Evidence and uncertainty

- Rate visible pixels, not the context, complete work, or presumed off-screen content.
- Preserve invoker-provided medium. Infer medium only when it is absent, and record the inference and confidence.
- Do not reduce or suppress causes because the image is artwork or stylized.
- In cause mode `all`, set every rating's `hasUnreportedDrivers` to false.
- Every `driverIds` entry must name a reported `present` or `uncertain` cause; a null `ratingId` has no drivers, and a `present` cause has visible evidence.
- Lower rating confidence for small, cropped, compressed, stylized, obscured, or context-poor images.
- Use `manual_review_required` when a responsible estimate depends on missing evidence or falls outside a system's normally classifiable range.
- Use `unable_to_assess` only when the image is unavailable or uninspectable.
- Do not identify real people or infer sensitive personal traits.

If the bundled assessor is unavailable, report that Faye Image Utility's image assessor cannot be used. Do not perform the full rating analysis in the parent thread or substitute another plugin, agent, or tool.

## Project-local storage

Before managed writes or runtime setup, read `../../references/workspace-storage.md` from this skill folder. Use host tools for instruction-only setup; no new runtime is needed for notes or screenshots. Pass the active absolute `workspace_root` and a fresh task-session ID to child workflows. Image launchers require `FAYE_WORKSPACE_ROOT` and accept `FAYE_SESSION_ID` for cached setup validation.
