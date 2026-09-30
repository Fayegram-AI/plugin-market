## 5. Targeted mode

Use targeted mode for one or more named regions, subjects, or domains, such as:

- hands and rings;
- shoe/foot state;
- clothing transition;
- glass, reflection, or rain;
- product label and geometry;
- UI text and controls;
- vehicle wheels or mechanical attachment.

Return one block for every `targeted_scopes` entry, preserving its ID and target:

~~~text
## Artifact audit — targeted
### Target — TARGET_SCOPE_ID
**Target:** TARGET_SCOPE_TEXT
**Artifact status:** Confirmed artifact / Probable artifact /
Possible issue/manual review / Style-consistent anomaly / Not assessable /
Not an artifact.
**Severity:** Minor / Moderate / Major / Critical, when there is an artifact.
**Artifact confidence:** ..., when artifact status is confirmed, probable, or
possible/manual review.
**Evidence:** Exact location and visible relationship, or a reliable measured
delivery property.
**Benign explanations considered:** Only the material alternatives.
**Repair target:** ...
**Visibility limit:** ...

#### Conformance results
| Source | Requirement ID | Requirement | Outcome | Confidence | Evidence | Decision impact |
|---|---|---|---|---|---|---|
~~~

Rules:

- Require at least one targeted scope; repeat the block independently when several scopes are supplied.
- Remain within each requested target. Do not merge mixed target statuses into one status.
- Treat `specific_concerns` as inspection priorities, never implicit target blocks.
- Include one conformance row per assessed requirement applicable to that target scope. Preserve every declared-requirement ID and do not merge different requirements or their outcomes. Omit the table when no requirement applies; do not merge artifact and conformance confidence judgments.
- Mention an unrelated finding only if it is clearly critical for the intended use.
- Do not use a “not an artifact” target result to imply a clean whole-image audit.
- If resolution prevents the targeted judgment, say not assessable and request the original or a crop rather than guessing.
