# Evidence Storage

Analysis and visual QA may create necessary temporary evidence captures; this
does not authorize source edits, dependency changes, caches from starting a
build, authored content changes, or durable reports. Prefer in-memory browser
inspection when it can answer the question. An explicit no-filesystem-writes
instruction overrides this permission, including outside the repository.

When a capture requires a file and no output path is supplied, use the active
project's `.faye/tmp/faye-ui-system-engineer/<skill-name>/<session>/`, using the
active skill's name (for example, `ui-inspection`).
Use a fresh task session and collision-safe filenames. Honor an explicit
user-provided path exactly. Do not use arbitrary outside-project fallback paths.
Clean up only captures created by this task after use; resolve and verify each
cleanup target remains inside the task-owned location. Preserve pre-existing
files. Disclose cleanup failures and the retained path.

Write a durable report only when requested. Without an explicit report path,
use `.faye/reports/faye-ui-system-engineer/<skill-name>/` in the
active project. File-output permission does not imply implementation authority.
