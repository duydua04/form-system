from fastapi import Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Type, TypeVar
from ...configs.db_config import Base, get_db
from ...models.user import User
from ...models.admin import Admin
from ...schemas.common.auth_schema import RegisterRequest, LoginRequest
from ...utils.security.password import get_password_hash, verify_password
from ...utils.error_helper.exceptions import AppException
from ...repositories.common.auth_repository import AuthRepository

T = TypeVar('T', bound=Base)

class AuthService:
    def __init__(self, auth_repo: AuthRepository):
        self.auth_repo = auth_repo

    async def _authenticate_account(self, model: Type[T], payload: LoginRequest) -> T:
        account = await self.auth_repo.get_account_by_email(model, payload.email)

        if not account or not verify_password(payload.password, account.password_hash):
            raise AppException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                error_code="INVALID_CREDENTIALS",
                message="Invalid email or password provided."
            )
        return account

    async def _get_account_by_id(self, model: Type[T], account_id: int, role_name: str) -> T:
        account = await self.auth_repo.get_account_by_id(model, account_id)
        if not account:
            raise AppException(
                status_code=status.HTTP_404_NOT_FOUND,
                error_code=f"{role_name.upper()}_NOT_FOUND",
                message=f"The requested {role_name} profile could not be found."
            )
        return account

    async def register_user(self, payload: RegisterRequest) -> User:
        if await self.auth_repo.get_account_by_email(User, payload.email):
            raise AppException(
                status_code=status.HTTP_409_CONFLICT,
                error_code="EMAIL_ALREADY_EXISTS",
                message="A user with this email address is already registered."
            )

        new_user = User(
            username=payload.username,
            email=payload.email,
            password_hash=get_password_hash(payload.password)
        )
        return await self.auth_repo.create_account(new_user)

    async def register_admin(self, payload: RegisterRequest) -> Admin:
        if await self.auth_repo.get_account_by_email(Admin, payload.email):
            raise AppException(
                status_code=status.HTTP_409_CONFLICT,
                error_code="EMAIL_ALREADY_EXISTS",
                message="An admin with this email address is already registered."
            )

        new_admin = Admin(
            username=payload.username,
            email=payload.email,
            password_hash=get_password_hash(payload.password)
        )
        return await self.auth_repo.create_account(new_admin)

    async def authenticate_user(self, payload: LoginRequest) -> User:
        return await self._authenticate_account(User, payload)

    async def get_user_by_id(self, user_id: int) -> User:
        return await self._get_account_by_id(User, user_id, "user")

    async def authenticate_admin(self, payload: LoginRequest) -> Admin:
        return await self._authenticate_account(Admin, payload)

    async def get_admin_by_id(self, admin_id: int) -> Admin:
        return await self._get_account_by_id(Admin, admin_id, "administrator")

def get_auth_service(db: AsyncSession = Depends(get_db)) -> AuthService:
    return AuthService(AuthRepository(db))