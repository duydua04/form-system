from pydantic import BaseModel, ConfigDict, Field, model_validator
from typing import Optional
from ...models.enums import FieldTypeEnum


class FieldCreateRequest(BaseModel):
    label: str = Field(..., max_length=255)
    field_type: FieldTypeEnum
    display_order: int = 0
    is_required: bool = False
    options: Optional[list[str]] = None
    swap_if_exists: bool = False

    @model_validator(mode='after')
    def check_options_logic(self) -> "FieldCreateRequest":
        allowed_options_types = [FieldTypeEnum.select, FieldTypeEnum.multi_select]
        if self.field_type in allowed_options_types and not self.options:
            raise ValueError("Cần cung cấp 'options' khi loại field là 'select' hoặc 'multi_select'.")
        if self.field_type not in allowed_options_types and self.options is not None:
            raise ValueError("'options' phải để trống (null) khi loại field không phải là 'select' hoặc 'multi_select'.")
        return self


class FieldUpdateRequest(BaseModel):
    label: Optional[str] = Field(None, max_length=255)
    field_type: Optional[FieldTypeEnum] = None
    display_order: Optional[int] = None
    is_required: Optional[bool] = None
    options: Optional[list[str]] = None
    swap_if_exists: bool = False


class FieldResponse(BaseModel):
    id: int
    form_id: int
    label: str
    field_type: FieldTypeEnum
    display_order: int
    is_required: bool
    options: Optional[list[str]] = None

    model_config = ConfigDict(from_attributes=True)

class FieldReorderRequest(BaseModel):
    ordered_field_ids: list[int] = Field(
        ...,
        description="List IDs of fields in the desired order from top to bottom",
        min_length=1
    )