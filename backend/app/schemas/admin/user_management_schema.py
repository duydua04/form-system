from pydantic import BaseModel, EmailStr, Field

class AccountResponse(BaseModel):
    id: int
    email: str
    created_at: str

    model_config = {"from_attributes": True}

class CreateAccountRequest(BaseModel):
    email: EmailStr
    role: str = Field(...)
    password: str = Field(...)

class CreateAccountResponse(BaseModel):
    id: int
    email: str
    role: str
    message: str