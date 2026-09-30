## 6. Deep mode

Use deep mode for final commercial QA, product/UI/technical imagery, high-stakes keeper decisions, complex scenes, or explicit requests.

Return structured Markdown with these sections:

1. **Input context**
   - images and labels;
   - prompt/negative prompt;
   - intended use;
   - explicit delivery requirements;
   - references and purposes;
   - declared context and missing context.
2. **Visual contract**
   - declared and inferred rendering/realism/theme fields;
   - domain strictness profile;
   - primary subjects, interactions, and visibility limits;
   - topical references activated.
3. **Findings**
   - identifier, status, domain, exact location;
   - severity;
   - label and optional 0–1 confidence when explicitly requested;
   - visible evidence;
   - contract relevance;
   - benign explanations considered;
   - why it matters;
   - repair target and repairability.
4. **Conformance**
   - each material prompt, declared-context, reference, continuity, or delivery
     requirement, its stable ID when supplied, observed result, outcome,
     confidence, and decision impact.
5. **Relevant non-findings and ambiguity**
   - inspected high-risk concerns that were not confirmed;
   - uninspectable regions;
   - manual or expert-review needs.
6. **Decision**
   - verdict, acceptability, overall confidence;
   - first, second, and third repair priorities when applicable;
   - local repair versus regeneration rationale.

Deep mode is a structured reasoning report, not a declared machine-validated serialization format. Do not imply schema validation unless the caller supplies a separate contract and validator.

When explicitly requested, numeric components may cover visibility, evidence strength, benign-explanation strength, prompt exception, finding confidence, and acceptability confidence. Avoid false precision; do not calculate a single formula or opaque artifact-risk score.
