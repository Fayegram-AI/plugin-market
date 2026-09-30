## Age Rating Utility

Only perform age rating when the parent explicitly sends `utility: age_rating` in a normalized version 1 request. Do not infer this utility from broad requests to check, inspect, analyze, audit, moderate, judge safety, judge NSFW/adultness, review artifacts, review aesthetics, generate, convert, edit, resize, describe, or extract metadata from an image.

Before rating:

1. Read the age-rating catalog, structured contract, system reference, and result schema at the absolute paths supplied by the parent. Do not execute Python, a launcher, validation, runtime setup, or filesystem cleanup.
2. Treat the normalized request as authoritative. Do not add systems, causes, output modes, or context that the request does not contain.
3. Confirm every requested image is inspectable. Preserve its request label in the corresponding result. When supplied, use deterministic preflight only to corroborate decoding, displayed dimensions, exact duplication, inspectability, visibility limits, or confidence. Never derive medium, semantic causes, severity, or ratings from technical metrics.
4. For each image, preserve a non-null request medium as `invoker_provided`. When request medium is null, make a separate visual medium determination as `inferred` with confidence or `undetermined` with ID `unknown`. Do not infer the content of a complete work.
5. In stage `determine_medium`, return only `{ "mediumDeterminations": [...] }`. The array has one ordered `{ imageLabel, medium }` entry per request image, using the structured contract's medium object. Do not return ratings yet.
6. The parent runs `resolve`. Wait for stage `assess` with the unchanged normalized request and exact `resolution` object from that validator. Use its per-image systems, medium objects, and mandatory messages exactly. If resolution is absent, request it from the parent; never reconstruct it.

Structured policy:

1. Default `systems: all` evaluates MPA, PEGI, EIRIN, CERO, and IMDA in catalog order. `systems: auto` uses deterministic per-image resolution. An explicit array evaluates every listed system in catalog order.
2. Rate only the complete visible image for every system. Medium, intended use, and other context may guide routing, interpretation, confidence, limits, and messages, but the context or complete work is never the assessment target.
3. Keep every explicitly requested system even when it is not directly applicable to the medium. Copy the resolver's mismatch warning exactly; do not substitute, suppress, or null the rating merely because of the mismatch.
4. Cause mode filters only reported cause evidence; it never narrows the rating basis.
5. In cause mode `all`, report present and uncertain causes and omit routine absent causes. In mode `off`, emit no cause findings or driver identifiers. In mode `selected`, report exactly the selected cause as present, absent, uncertain, or not assessable.
6. When selected/off cause reporting hides material rating drivers, set `hasUnreportedDrivers: true` without disclosing those driver identities. In cause mode `all`, always set it to false. Every disclosed driver ID must identify a reported present or uncertain cause finding; null ratings have no drivers, and present findings require non-empty visible evidence.
7. Do not lower or suppress a visible cause because the image is artwork, photographed, stylized, or associated with a different medium. Use realism, detail, frequency, and framing qualifiers for visible differences.
8. Keep PEGI interactive risks separate from visual causes. Assess them only from visible UI/text or reliable `user_provided` context. A present risk requires at least one evidence statement from that declared source. Never infer game mechanics from visual genre or artwork.
9. Use only catalog identifiers, rating labels, enum values, ordering, notice text, schema version, and catalog version. Emit the stable catalog slug as `ratingId` and its exact official presentation text as `ratingLabel`; never place a display label in `ratingId` or invent near-synonyms.
10. Treat output as an informational estimate, not an official rating,
   certification, legal conclusion, moderation decision, or viewer age check.

Evidence policy:

- Record only visible, user-provided, or explicitly labeled inferred evidence.
- Separate action/peril, violence, and blood/gore.
- Separate nudity, sexual content, and sexual violence.
- Separate alcohol, tobacco/smoking, and drugs.
- Evaluate mature themes, fear/horror, language, crude/rude content, gambling, discrimination/hate, self-harm/suicide, and crime/antisocial behavior when supported.
- Apply intensity, realism, detail, frequency, framing, context, vulnerability, glamorization, and audience impact as qualifiers, not standalone causes.
- Do not infer identities, biological age, or other sensitive traits of real people. If apparent vulnerability matters, describe only visible context and lower confidence when age or status is uncertain.

Confidence policy:

- `very_high`: strong visible evidence, clear system fit, and low missing-context risk.
- `high`: clear visible evidence with limited context gaps.
- `medium`: plausible fit where still-image limitations materially matter.
- `low`: small, cropped, obscured, ambiguous, highly stylized, or substantially context-dependent evidence.

Use `manual_review_required` when a responsible estimate depends on material missing context, evidence is disputed, or content may sit outside a system's normally classifiable range. Use `unable_to_assess` only when the image itself is unavailable or uninspectable. Never use uncertainty as a substitute rating.

Output and validation:

1. Construct the exact JSON object required by the result schema. Copy each resolver-produced `medium`, `systemsEvaluated`, and required `messages` value exactly. Optional `assessment-note` messages may follow required messages and must use info level.
2. For `strict_json`, do not include a summary field, Markdown fence, or prose.
3. For `json_with_summary`, include one concise top-level `summary` field.
4. For `json_then_summary`, construct JSON without a summary field and prepare one concise summary separately. It must satisfy the structured contract's stable nonblank, no-surrounding-whitespace, and single-line rules.
5. Return one machine-only JSON handoff object with exactly `result` and `trailingSummary`. The result is a candidate for parent validation. Set `trailingSummary` to null for `strict_json` and `json_with_summary`; use the separately prepared contract-valid summary for `json_then_summary`.
6. In stage `correct_medium` or `correct_result`, correct only the supplied contract errors and return the corresponding stage's machine-only object. Preserve unaffected findings and context. Do not invent evidence to satisfy validation; report an unresolved blocker if a responsible correction is impossible. The parent allows at most two correction rounds per stage.
7. Do not render the public response or execute validation. Do not add Markdown fences, command output, diagnostics, or surrounding prose to a handoff. The parent owns all deterministic validation and response rendering.

The validator checks structure and consistency only. Successful validation does not prove the visual judgment or make the estimate official.
