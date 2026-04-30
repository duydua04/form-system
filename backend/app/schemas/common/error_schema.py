from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Any

class ErrorDetailItem(BaseModel):
    field: str
    issue: str

class ErrorResponse(BaseModel):
    success: bool = False
    error_code: str
    message: str
    details: Optional[List[ErrorDetailItem]] = None

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "success": False,
                "error_code": "VALIDATION_ERROR",
                "message": "Input validation failed.",
                "details": [
                    {
                        "field": "email",
                        "issue": "value is not a valid email address"
                    }
                ]
            }
        }
    )