from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict
from ...models.enums import FieldTypeEnum


class FormActiveResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    display_order: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AnswerSubmitRequest(BaseModel):
    field_id: int
    value: Optional[str] = None


class FormSubmitRequest(BaseModel):
    answers: List[AnswerSubmitRequest]


class SubmissionResponse(BaseModel):
    id: int
    form_id: int
    user_id: int
    submitted_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FieldUserResponse(BaseModel):
    id: int
    label: str
    field_type: FieldTypeEnum
    is_required: bool
    options: Optional[list[str]] = None
    display_order: int

    model_config = ConfigDict(from_attributes=True)


class FormDetailUserResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    fields: List[FieldUserResponse]

    model_config = ConfigDict(from_attributes=True)