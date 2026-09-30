## 8. Aggregation and selection

The top-level decision is a calibrated synthesis, not a maximum function. Consider:

- highest well-supported severity;
- salience and intended use;
- number and concentration of findings;
- whether findings share one root cause;
- prompt, declared-context, reference, continuity, and delivery conformance;
- repairability and risk to unaffected regions;
- image and context limitations.

Deduplicate findings that describe one root cause. For example, a malformed hand-object intersection may create apparent finger, grip, and object-boundary defects. Prefer one primary finding with related evidence unless separate repairs are required.

Do not let repeated symptoms inflate severity mechanically. Conversely, a small central exact-text defect can control acceptability in a product or UI deliverable even if the rest of the image is clean.

Use the verdict for visible artifact severity and acceptability for the decision. Explain when they diverge:

- no major visual artifacts, but **Needs targeted repair** because wrong exact text blocks the intended use and stable local replacement is practical;
- a major artifact, but targeted repair is practical;
- minor artifacts, but manual review is required because the original image is too small for the critical label.
