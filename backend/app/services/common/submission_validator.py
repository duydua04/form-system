import os
import re
from datetime import datetime
from typing import Callable, Dict, Any
from fastapi import status

from ...models.enums import FieldTypeEnum
from ...utils.error_helper.exceptions import AppException

class SubmissionValidator:
    _validators: Dict[FieldTypeEnum, Callable[[Any, str], None]] = {}

    @classmethod
    def register(cls, field_type: FieldTypeEnum):
        """
        Decorator used to register a validator function for a specific field type.
        """
        def decorator(func: Callable[[Any, str], None]):
            cls._validators[field_type] = func
            return func
        return decorator

    @classmethod
    def validate_answer(cls, field, value: str):
        """
        Main dispatcher
        """
        is_empty = value is None or str(value).strip() == ""
        if field.is_required and is_empty:
            raise AppException(
                status_code=status.HTTP_400_BAD_REQUEST,
                error_code="VALIDATION_ERROR",
                message=f"Field '{field.label}' is required and cannot be empty."
            )

        if is_empty:
            return value

        validator_func = cls._validators.get(field.field_type)

        if not validator_func:
            raise AppException(
                status_code=400,
                message=f"Field type '{field.field_type}' is not currently supported for validation."
            )

        # 3. Execute the validator function
        validator_func(field, value)

        return value


@SubmissionValidator.register(FieldTypeEnum.text)
def validate_text(field, value: str):
    """Validates that the text does not exceed 200 characters."""
    if len(value) > 200:
        raise AppException(
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="VALIDATION_ERROR",
            message=f"Field '{field.label}' must not exceed 200 characters."
        )

@SubmissionValidator.register(FieldTypeEnum.number)
def validate_number(field, value: str):
    """Validates that the number is a valid float between 0 and 100."""
    try:
        num = float(value)
        if num < 0 or num > 100:
            raise AppException(
                status_code=400,
                error_code="VALIDATION_ERROR",
                message=f"Field '{field.label}' must be a value between 0 and 100."
            )
    except ValueError:
        raise AppException(
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="VALIDATION_ERROR",
            message=f"Field '{field.label}' must be a valid number."
        )

@SubmissionValidator.register(FieldTypeEnum.date)
def validate_date(field, value: str):
    """Validates that the date is real and follows the expected format: YYYY-MM-DD.
    Rejects non-existent dates such as Feb 31 or Apr 31.
    """
    try:
        datetime.strptime(value, "%Y-%m-%d")
    except ValueError:
        raise AppException(
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="VALIDATION_ERROR",
            message=f"Field '{field.label}' contains an invalid date. "
                    f"Please enter a real date in YYYY-MM-DD format (e.g. 2024-03-15)."
        )

@SubmissionValidator.register(FieldTypeEnum.color)
def validate_color(field, value: str):
    """Validates that the value is a valid HEX color code in the format #RRGGBB."""
    hex_pattern = re.compile(r"^#[0-9A-Fa-f]{6}$")
    if not hex_pattern.match(value):
        raise AppException(
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="VALIDATION_ERROR",
            message=f"Field '{field.label}' must be a valid HEX color code "
        )

@SubmissionValidator.register(FieldTypeEnum.select)
def validate_select(field, value: str):
    """Validates that the value exists and is a single option."""
    # Note: value comes as a string. If it contains a comma, it might be an attempt to multi-select.
    # But we check against the options list directly.
    if not field.options or value not in field.options:
        raise AppException(
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="VALIDATION_ERROR",
            message=f"Giá trị '{value}' không hợp lệ cho trường '{field.label}' hoặc bạn đang chọn nhiều hơn 1 tùy chọn."
        )

@SubmissionValidator.register(FieldTypeEnum.multi_select)
def validate_multi_select(field, value: str):
    """Validates that all values in the comma-separated string exist in options."""
    if not field.options:
        raise AppException(
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="VALIDATION_ERROR",
            message=f"Trường '{field.label}' chưa được cấu hình các tùy chọn."
        )
    
    # Split by comma and trim whitespace
    selected_values = [v.strip() for v in value.split(",") if v.strip()]
    
    if not selected_values and field.is_required:
        raise AppException(
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="VALIDATION_ERROR",
            message=f"Trường '{field.label}' yêu cầu ít nhất một lựa chọn."
        )

    for val in selected_values:
        if val not in field.options:
            raise AppException(
                status_code=status.HTTP_400_BAD_REQUEST,
                error_code="VALIDATION_ERROR",
                message=f"Giá trị '{val}' không nằm trong danh sách tùy chọn của trường '{field.label}'."
            )


@SubmissionValidator.register(FieldTypeEnum.file)
def validate_file_submission(field, value: str):
    """
    Validates that the file path returned from MinIO is secure and matches allowed extensions.
    """
    if value.startswith(("http://", "https://", "/", "\\", ".")):
        raise AppException(
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="INVALID_FILE_PATH",
            message=f"Đường dẫn file cho trường '{field.label}' chứa ký tự không hợp lệ."
        )

    expected_prefix = "form-submissions/uploads/"
    if not value.startswith(expected_prefix):
        raise AppException(
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="INVALID_FILE_SOURCE",
            message=f"File cho trường '{field.label}' không hợp lệ hoặc chưa được tải lên hệ thống đúng cách."
        )

    _, ext = os.path.splitext(value)
    ext = ext.lower()

    options = field.options or {}
    allowed_exts = options.get("allowed_extensions") if isinstance(options, dict) else None
    if not allowed_exts:
        allowed_exts = [".pdf"]

    if ext not in allowed_exts:
        raise AppException(
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="INVALID_FILE_EXTENSION",
            message=f"Trường '{field.label}' chỉ chấp nhận các định dạng: {', '.join(allowed_exts)}."
        )