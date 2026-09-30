## 7. Batch-compare mode

Use batch compare for variants, character sheets, product sets, storyboards, or before/after images.

Determine selection from `comparison_goal`, not image category. Rank only when the goal explicitly asks to select, prefer, rank, or choose among competing alternatives. If selection intent is missing or ambiguous, use an unranked comparison.

Begin with this overview table. Add **Rank** as the first column only for an explicit selection goal:

| Image | Verdict | Conformance | Acceptability | Confidence | Decisive reason |
|---|---|---|---|---|---|

Then return, in this order:

1. Comparison goal and reference purposes.
2. One compact result per image.
3. A cross-image conclusion: a ranked recommendation with decisive tradeoffs for an explicit selection goal, or an unranked comparison conclusion covering continuity and conformance when applicable.
4. Shared and recurring artifact patterns.
5. Conformance mismatches, with prompt, declared-context, reference, continuity, or delivery source.
6. Repair versus regeneration recommendations.
7. Visibility or comparability limits.

The per-image compact subsections in step 2 include material findings, conformance mismatches, visibility limits, and the repair target when repair guidance is enabled. The overview table summarizes those subsections; it does not replace their evidence.

Apply `max_findings` independently to each image's compact subsection. For each image, it caps the combined artifact findings and conformance mismatches under the compact-mode rule. It does not cap the number of images, overview rows, or shared and recurring pattern summaries.

The cap limits reporting, not inspection or the decision. Select the most decision-relevant items using the aggregation criteria below. If additional material artifact findings or conformance mismatches passed review but were omitted by the cap, state `Additional material issues omitted: N` in that image's subsection. Possible/manual-review concerns and relevant non-findings remain outside the numeric cap, but keep the ambiguity section selective and never use it to evade the cap.

Rules:

- Assess each image independently before cross-image synthesis.
- Do not use an unexplained aggregate score.
- Normalize for crop, view, scale, pose, lighting, and reference purpose.
- Distinguish local artifact quality from identity, product, prompt, or series fidelity.
- For selection, identify the preferred candidate and strongest alternative when useful. If candidates are indistinguishable at the supplied resolution, say so.
- A lower-ranked candidate may remain acceptable; selection position does not change its per-image acceptability.
- For an unranked comparison, state whether the images work together for the supplied goal and identify affected image labels for material continuity or conformance mismatches.
