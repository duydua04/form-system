from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
from typing import Union

# --- Request Payloads ---
class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# --- Response Payloads ---
class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class AdminResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class AuthSuccessResponse(BaseModel):
    success: bool = True
    message: str
    account: Union[UserResponse, AdminResponse]

class LogoutResponse(BaseModel):
    success: bool = True
    message: str