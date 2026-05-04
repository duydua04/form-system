from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class SubmissionListItemResponse(BaseModel):
    id: int
    user_id: int
    username: str
    email: str
    submitted_at: datetime

class AdminSubmissionAnswerResponse(BaseModel):
    id: int
    field_id: int
    field_label: str
    field_type: str
    value: Optional[str]

class SubmissionAdminDetailResponse(BaseModel):
    id: int
    form_id: int
    form_title: str
    user_id: int
    username: str
    email: str
    submitted_at: datetime
    answers: List[AdminSubmissionAnswerResponse]

class SubmissionGlobalItemResponse(BaseModel):
    id: int
    form_id: int
    form_title: str
    user_id: int
    username: str
    email: str
    submitted_at: datetime