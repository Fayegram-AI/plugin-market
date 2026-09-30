# Canonical Handoff

Send this structure. Omit optional fields that are genuinely unavailable.

~~~yaml
faye_image_utility_request:
    utility: image_artifact_review
    protocol_version: 2
    mode: compact
    image_inputs:
        - path: ABSOLUTE_LOCAL_IMAGE_PATH
          label: target_image_1
          observed_delivery:
              - id: parent_decode
                displayed_width_px: 1920
                displayed_height_px: 1080
                measurement_source: decoded_image
    prompt: optional original generation prompt
    negative_prompt: optional negative prompt
    intended_use: optional intended use
    delivery_requirements:
        expected_width_px: 1920
        expected_height_px: 1080
        expected_aspect_ratio: "16:9"
        dimension_tolerance_px: 0
        aspect_ratio_tolerance_percent: 0
        crop_or_safe_area: optional framing, crop, bleed, or protected-area requirement
    declared_style: optional declared rendering style
    declared_theme: optional theme or world rules
    declared_requirements:
        - id: two_blue_mugs
          requirement: exactly two blue mugs must be visible
          applies_to:
              - target_image_1
    strictness_override:
        text_logo_and_product_fidelity: 5
    specific_concerns:
        - hands
        - clothing state
        - glass reflection
    targeted_scopes:
        - id: subject_left_hand_and_ring
          target: subject-left hand and ring
    reference_images:
        - path: ABSOLUTE_LOCAL_REFERENCE_PATH
          label: product_front_reference
          purpose: product_reference
          applies_to:
              - target_image_1
    visible_text_context:
        text: "EXACT REQUIRED TEXT"
        role: exact_requirement
        source: user_provided
    comparison_goal: optional selection goal or caller-stated continuity goal
    output_preferences:
        max_findings: 5
        include_repair_guidance: true
        include_non_findings: true
        confidence_format: labels
    artifact_reference_paths:
        framework: ABSOLUTE_PATH_TO_audit-framework.md
        reporting: ABSOLUTE_PATH_TO_reporting.md
        people_and_creatures: ABSOLUTE_PATH_TO_people-and-creatures.md
        objects_and_built_scenes: ABSOLUTE_PATH_TO_objects-and-built-scenes.md
        optics_materials_and_environment: ABSOLUTE_PATH_TO_optics-materials-and-environment.md
        text_products_and_interfaces: ABSOLUTE_PATH_TO_text-products-and-interfaces.md
        styles_prompts_and_series: ABSOLUTE_PATH_TO_styles-prompts-and-series.md
~~~

Allowed reference purposes are **style_reference**, **identity_reference**, **product_reference**, **before_after**, **continuity_reference**, and **expected_layout**, plus **context_only**. Use **context_only** when the caller supplied a reference but did not state, and the parent cannot derive from the caller's explicit language, what it should govern. Never infer a purpose from the reference's pixels. A **context_only** reference may support cautious description or a benign hypothesis, but it cannot establish a conformance requirement, material mismatch, or acceptability decision. A style reference is not automatically an identity or product-fidelity reference.

Use **delivery_requirements** only for requirements explicitly supplied by the caller or an authoritative source. Never infer expected delivery from the current target. Omit unknown keys; pixel dimensions must be positive integers, and tolerances must be non-negative numbers. Omitted tolerances are zero. Exact crop or safe-area evaluation requires the requirement to state its coordinate system or units; otherwise report ambiguous correspondence rather than inventing geometry. Use per-image **observed_delivery** as a list of one or more reliable parent observations. Each observation requires a unique **id** in **snake_case**, displayed width and height measured after the orientation used for assessment, and one allowed **measurement_source**: **decoded_image**, **authoritative_metadata**, or **user_provided**. Preserve multiple reliable observations when they disagree; do not silently select one. Omit any observation whose source or orientation is uncertain, and omit the list when none is reliable. The assessor then measures independently when possible or reports the requirement not assessable. Do not apply an unstated dimension or aspect-ratio tolerance. Derive observed aspect ratio from each observation's displayed width and height; do not hand off a second potentially conflicting observed ratio.

Use **visible_text_context.role** values **exact_requirement** or **reliable_transcription** and **source** values **user_provided** or **authoritative_reference**. An exact user-provided requirement is conformance source **declared_context**; an authoritative-reference requirement is source **reference**. A reliable transcription is evidence, not automatically a requirement.

Use **declared_requirements** only for explicit caller-supplied constraints not already represented by the original prompt, intended use, declared style/theme, exact-text context, a purpose-tagged reference, cross-image continuity context in **comparison_goal**, or delivery fields. When present, it is a non-empty list. Each item requires a unique, non-empty **id** in **snake_case** and one non-blank **requirement** containing a single independently assessable constraint. Its optional **applies_to** value is a non-empty list of unique existing target labels; omission means every target. Blank or duplicate IDs, blank requirements, empty or duplicate target lists, and unknown target labels are invalid and must be corrected before delegation. Preserve the caller's meaning and report its conformance source as **declared_context**. Never place a requirement in **prompt** unless it was part of the supplied original generation prompt, and never promote a concern or an inference into a declared requirement. Put caller-stated cross-image continuity rules, relevant target labels, and any stated narrative order in **comparison_goal**. Preserve the caller's wording and do not invent an unstated sequence. Report an applicable supplied rule as conformance source **continuity**.

In **targeted** mode, send one or more **targeted_scopes**, each with a unique **id** in **snake_case** and one concise **target**. The assessor returns one targeted result block per scope. **specific_concerns** only prioritize inspection in any mode and never silently create targeted scopes.

Give every target a unique label when sending more than one image. A reference’s optional **applies_to** list contains target labels; omission means the reference applies to every target. Use only the canonical **snake_case** strictness keys defined in audit-framework.md, never one global strictness score. Confidence labels are the default; request 0–1 values only in deep mode and only when they are genuinely useful.

Output preferences have these exact semantics:

- **max_findings** is a positive integer for compact mode and each per-image compact subsection in batch comparison; other modes use their own limits.
- **include_repair_guidance** defaults to true. False omits repair targets and prioritized edit steps, but not acceptability or repairability rationale.
- **include_non_findings** defaults to false. True adds only decision-relevant non-findings; false never suppresses ambiguity, visibility limits, or manual review needs.
- **confidence_format** is **labels** or **numeric_and_labels**. The latter is valid only in deep mode; other modes use labels.
