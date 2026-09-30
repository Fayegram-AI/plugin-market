"""Stable user-facing errors for the internal image editor."""


class EditorError(Exception):
    """Base failure raised by the editor package."""

    code = "editor_error"


class RequestValidationError(EditorError):
    """The editor request or one of its operations is invalid."""

    code = "invalid_request"


class EditorInputError(EditorError):
    """The requested source image cannot be loaded safely."""

    code = "invalid_input"


class EditorOutputError(EditorError):
    """The requested image output cannot be produced safely."""

    code = "invalid_output"
