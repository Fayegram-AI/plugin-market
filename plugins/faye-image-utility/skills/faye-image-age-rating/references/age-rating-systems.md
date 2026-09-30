# Image Age-Rating Systems

This reference supports `$faye-image-age-rating`. Use it to estimate image age/content ratings by analogy to five established systems. Never present an estimate as an official rating, legal determination, platform decision, certification mark, or viewer age-verification result.

Machine-readable rating IDs, official codes and labels, and neutral cause IDs live in `age-rating-catalog.json`. Rating IDs are stable lowercase slugs; official presentation text is kept separately as the rating label. Structured request and result rules live in `structured-rating-contract.md`.

## Contents

1. Sources and method
2. Cross-system evidence model
3. MPA
4. PEGI
5. EIRIN
6. CERO
7. IMDA
8. Still-image and comparison limits

## 1. Sources and method

Official sources checked on 2026-08-01:

- MPA Ratings Guide: https://www.filmratings.com/ratings-guide/
- MPA common descriptors: https://www.filmratings.com/common-descriptors/
- PEGI labels and descriptors: https://pegi.info/what-do-the-labels-mean
- EIRIN film classification: https://www.eirin.jp/english/008.html
- CERO rating system: https://www.cero.gr.jp/en/publics/index/17/
- IMDA film and video classification guide: https://iris.imda.gov.sg/guide/film-and-video-classification-guide

For every requested system:

1. Inventory visible content and reliable caller-supplied context.
2. Separate visible, user-provided, and inferred evidence.
3. Evaluate intensity, realism, detail, frequency, framing, vulnerability, glamorization, and likely audience impact.
4. Estimate the lowest system rating that plausibly covers the strongest supported content.
5. Report uncertainty caused by the still-image boundary.
6. Use manual review instead of forcing a rating outside the assessable or normally classifiable range.

Do not assign one rating and mechanically translate it across systems. Each system has its own medium, vocabulary, thresholds, and treatment of advisory or restricted categories.

### Medium applicability

Medium is per-image routing context, not an additional assessment target. Use an invoker-provided value when present. Otherwise infer only from the visible image and record confidence; do not infer a complete work or intended release.

Direct system associations are:

- Film: MPA, EIRIN, and IMDA.
- Game: PEGI and CERO.
- Video: IMDA.
- Artwork, photograph, mixed, or unknown: no directly applicable system.

`auto` uses those associations only for invoker-provided medium or a high- or very-high-confidence inference. Otherwise it evaluates all systems as still-image analogies. Explicit system arrays and `all` always retain every selected system. Record incompatibility as a message; do not replace, omit, or silently reinterpret the requested system.

## 2. Cross-system evidence model

Use the neutral cause IDs from the catalog to report evidence consistently. Map those findings to each system's own classification concerns; do not imply that the neutral IDs are official descriptor terms.

Important cross-system distinctions:

- Separate peril from actual violence and separate violence from blood/gore.
- Separate nudity from sexual content and sexual violence.
- Separate alcohol, tobacco/smoking, and drug use even when a system groups them.
- Treat crime, discrimination/hate, self-harm/suicide, and mature themes as independent findings when evidence supports them.
- Treat rude or crude content separately from strong language.
- Do not infer frequency, duration, audio, gameplay mechanics, or unseen story events from one image.

Weapons alone do not determine a rating. Evaluate use, threat, target, realism, injury, blood, framing, and context. Likewise, nudity alone does not determine sexual framing; distinguish artistic, medical, incidental, and erotic presentation from visible evidence.

## 3. MPA: United States film-style estimate

MPA ratings are G, PG, PG-13, R, and NC-17. The MPA uses individualized rating descriptors for PG and above. Common descriptor families include violence, action, language, sex, nudity, drugs, smoking, themes, and other concerns.

- G: general audiences; content remains within a restrained all-audience range.
- PG: parental guidance suggested; may include mild action, peril, violence, language, thematic material, rude content, or limited non-sexual nudity.
- PG-13: stronger caution for children under 13; may include more realistic or frequent violence, some blood, stronger language, sexual material, nudity, drug material, terror, or mature themes.
- R: restricted for viewers under 17 without an accompanying adult in the film system; may include strong or graphic violence, gore, sexual content, sexualized nudity, strong language, or drug use.
- NC-17: no one 17 and under admitted in the film system; use only when visible material clearly exceeds the R range, while acknowledging that an isolated still cannot reproduce an official whole-film review.

MPA rating descriptors are tailored to individual films. Report neutral cause IDs in structured output and use concise system-specific wording only in an optional summary.

## 4. PEGI: European game-style estimate

PEGI age labels are PEGI 3, 7, 12, 16, and 18.

- PEGI 3: suitable for all age groups; only very mild comic or childlike violence and no frightening imagery or bad language.
- PEGI 7: may include imagery or sounds frightening to younger children and very mild implied, non-detailed, or non-realistic violence.
- PEGI 12: may include somewhat more graphic fantasy violence, non-realistic violence toward human-like characters, mild language, sexual innuendo, or sexual posturing.
- PEGI 16: violence or sexual activity reaches a realistic-looking level; stronger language and depictions of tobacco, alcohol, or illegal drugs may appear.
- PEGI 18: may include gross violence, apparently motiveless killing, violence toward defenseless characters, glamorized illegal drug use, simulated gambling, or explicit sexual activity.

PEGI content descriptors include Violence, Bad Language, Fear/Horror, Gambling, Sex, Drugs, and Discrimination. Non-sexual nudity does not by itself require the Sex descriptor, although it may remain a neutral plugin cause.

PEGI also publishes interactive-risk descriptors and age-affecting features. Keep these separate from visual causes:

- In-game purchases.
- Paid random items.
- Time-limited offers.
- Cryptocurrency-linked play.
- Pressure-to-play mechanics.
- Unrestricted communication.

These mechanics normally cannot be established from standalone artwork. Use only visible UI/text or reliable caller-supplied context. Otherwise report the interactive-risk section as not assessable.

## 5. EIRIN: Japan film-style estimate

EIRIN ratings are G, PG12, R15+, and R18+.

- G: suitable for all ages.
- PG12: parental guidance requested for viewers under 12.
- R15+: no one under 15 admitted.
- R18+: no one under 18 admitted.

EIRIN identifies eight main classifiable elements: theme, language, sex, nudity, violence and cruelty, horror and menace, drug use, and criminal behavior. Context and impact affect classification. Use manual review rather than forcing an R18+ estimate when material may fall outside EIRIN's normally classifiable range.

## 6. CERO: Japan game-style estimate

CERO age-classification marks are A, B, C, D, and Z.

- A: all ages.
- B: ages 12 and above.
- C: ages 15 and above.
- D: ages 17 and above.
- Z: ages 18 and above only; CERO distinguishes this restricted mark from its advisory age classifications.

CERO reviews sex-related expression, violence expression, antisocial acts, and language- or ideology-related expression. Published examples include nudity, sexual expression, blood, mutilation, corpses, killing, horror, fighting, crime, controlled substances, abuse, illegal drinking/smoking, illegal gambling, sexual crime, prostitution, suicide/self-injury, and trafficking.

CERO reviews representative gameplay and the most extreme recorded content, not isolated artwork. Use lower confidence for a still and manual review for possibly prohibited expression rather than forcing a normal A-Z estimate.

## 7. IMDA: Singapore film/video-style estimate

IMDA film ratings are G, PG, PG13, NC16, M18, and R21.

- G: general audiences.
- PG: parental guidance.
- PG13: parental guidance for children below 13.
- NC16: no children under 16.
- M18: mature audiences aged 18 and above.
- R21: restricted to adults aged 21 and above.

IMDA's major film content concerns are theme and message, violence, nudity, sex, language, drug and substance abuse, and horror. Classification also weighs context, impact, frequency, intensity, detail, realism, and treatment. IMDA may refuse classification for content outside its guidelines; an image estimate must report manual review rather than claim an official refusal.

## 8. Still-image and comparison limits

A still image can support observations about visible composition, readable text, depicted acts, injury, nudity, and framing. It usually cannot establish:

- Audio or spoken language.
- Motion, duration, frequency, or repetition.
- The full narrative or most extreme scene.
- Gameplay interactivity or player agency.
- Monetization, communication, or pressure mechanics without visible UI or supplied context.
- Official submission context, jurisdictional procedure, or legal eligibility.

Record the image medium when known, but never rate the context or unseen work. Film systems and game systems may produce different estimates from the same image because their complete-work standards differ. Medium does not erase or reduce visible causes such as gore or nudity; express visual differences through the existing realism, detail, frequency, and framing qualifiers. Keep every comparison informational and never use official marks or logos.
