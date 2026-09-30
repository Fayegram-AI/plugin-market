## 3. Triage mode

Use triage for rapid screening or a large initial set.

Return:

~~~text
## Artifact audit — triage
**Verdict:** ...
**Acceptability:** ...
**Confidence:** ...
**Conformance:** Satisfied / Material mismatch /
Ambiguous interpretation or correspondence / Not assessable /
Not provided or not applicable.
**Conformance source:** prompt / declared_context / reference / continuity /
delivery, when a requirement was assessed.
**Top issues:** Up to three location- or property-specific artifact or
conformance issues.
**Recommendation:** Accept, inspect further, repair, or regenerate.
**Visibility limit:** Include only when decision-relevant.
~~~

Rules:

- Include zero to three decisive issues.
- Omit low-confidence minor concerns.
- Do not include a full contract or taxonomy.
- If triage cannot distinguish two strong candidates, recommend compact or targeted review rather than pretending to rank them.
- A clean triage result means no significant visible defect at the inspected resolution; it is not certification.
