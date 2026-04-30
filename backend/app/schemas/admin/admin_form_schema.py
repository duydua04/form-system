from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Any
from datetime import datetime
from enum import Enum
from ...models.enums import FormStatusEnum, FieldTypeEnum

class TimeFilterEnum(str, Enum):
    TODAY = "today"
    THIS_WEEK = "this_week"

class FormCreateRequest(BaseModel):
    title: str = Field(..., max_length=255)
    description: Optional[str] = None
    display_order: int = 0
    status: FormStatusEnum = FormStatusEnum.DRAFT

class FormUpdateRequest(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    display_order: Optional[int] = None
    status: Optional[FormStatusEnum] = None

class FieldResponse(BaseModel):
    id: int
    label: str
    field_type: FieldTypeEnum
    display_order: int
    is_required: bool
    options: Optional[Any] = None

    model_config = ConfigDict(from_attributes=True)

class FormResponse(BaseModel):
    id: int
    admin_id: int
    title: str
    description: Optional[str]
    display_order: int
    status: FormStatusEnum
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class FormDetailResponse(FormResponse):
    fields: List[FieldResponse] = []

class PaginatedFormResponse(BaseModel):
    items: List[FormResponse]
    total: int
    page: int
    limit: int
    total_pages: int