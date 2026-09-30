## 4. Compact mode

Compact is the default user-facing audit.

~~~text
## Artifact audit
**Verdict:** ...
**Acceptability:** ...
**Confidence:** Low / Medium / High / Very high.
**Visual contract:** One sentence covering rendering mode, realism/world rules,
intended use, material delivery requirements, and the strict areas that control
the decision.
**Conformance:** Satisfied / Material mismatch /
Ambiguous interpretation or correspondence / Not assessable /
Not provided or not applicable. Name the prompt, declared_context, reference,
continuity, or delivery source.
**Visibility limits:** Concise decision-relevant limits, or None material.

### Findings
| # | Status | Domain | Severity | Confidence | Location | Evidence | Repair target |
|---|---|---|---:|---|---|---|---|

### Conformance mismatches
| Source | Requirement ID | Requirement | Observed result | Confidence | Decision impact |
|---|---|---|---|---|---|

### Ambiguity / not flagged
- Possible issues, relevant benign explanations, style-consistent anomalies,
  not-assessable concerns, or requested non-findings.

### Final recommendation
Acceptability decision, decisive reason, and first repair priority.
~~~

Omit empty optional sections. Keep no more than five combined material artifact findings and conformance mismatches by default. A positive caller-supplied `max_findings` overrides that combined limit.

Compact rules:

- Findings contain only confirmed or probable artifacts.
- Use status to distinguish confirmed from probable.
- Put possible concerns under ambiguity/manual review.
- Keep evidence directly observable and location-specific.
- Report conformance mismatch separately from artifact severity.
- Use confidence labels only.
- Include repair targets unless `include_repair_guidance` is false.
- Do not include long module lists or internal scores.

If there are no findings, retain the Findings heading only when a table helps answer an explicit concern. Otherwise state the clean result and the relevant non-finding in one line.
