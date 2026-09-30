"""High-level request execution shared by CLI and direct consumers."""

from __future__ import annotations

from typing import Any

from .document import ImageEditor
from .models import EditorRequest, EditorResult
from .operations import validate_operations
from .output import resolve_output, write_editor_output


def execute_request(raw: Any) -> EditorResult:
    """Validate and execute one mapping-based editor request."""

    request = EditorRequest.from_mapping(raw)
    operations = validate_operations(request.operations)
    editor = (
        ImageEditor.open(request.input)
        if request.input is not None
        else ImageEditor.create(request.canvas)
    )
    editor.apply(operations)

    output_path, output_format = resolve_output(
        request.output,
        input_path=editor.input_path,
        source_format=editor.source_format,
    )
    rendered = editor.render_image()
    output_path = write_editor_output(
        rendered,
        output_path,
        output_format,
        request.output,
        editor.encoding_metadata,
    )
    return EditorResult(
        input_path=editor.input_path,
        output_path=output_path,
        source_format=editor.source_format,
        output_format=output_format,
        width=rendered.width,
        height=rendered.height,
        operation_types=tuple(operation.type for operation in operations),
    )
