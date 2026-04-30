from fastapi import Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Type, TypeVar
from ...configs.db_config import Base, get_db
from ...models.user import User
from ...models.admin import Admin
from ...schemas.common.auth_schema import RegisterRequest, LoginRequest
from ...utils.security.password import get_password_hash, verify_password
from ...utils.error_helper.exceptions import AppException

T = TypeVar('T', bound=Base)


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def _authenticate_account(self, model: Type[T], payload: LoginRequest) -> T:
        query = select(model).where(model.email == payload.email)
        result = await self.db.execute(query)
        account = result.scalar_one_or_none()

        if not account or not verify_password(payload.password, account.password_hash):
            raise AppException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                error_code="INVALID_CREDENTIALS",
                message="Invalid email or password provided."
            )
        return account

    async def _get_account_by_id(self, model: Type[T], account_id: int, role_name: str) -> T:
        account = await self.db.get(model, account_id)
        if not account:
            raise AppException(
                status_code=status.HTTP_404_NOT_FOUND,
                error_code=f"{role_name.upper()}_NOT_FOUND",
                message=f"The requested {role_name} profile could not be found."
            )
        return account

    async def register_user(self, payload: RegisterRequest) -> User:
        query = select(User).where(User.email == payload.email)
        if (await self.db.execute(query)).scalar_one_or_none():
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
        self.db.add(new_user)
        await self.db.commit()
        await self.db.refresh(new_user)
        return new_user

    async def register_admin(self, payload: RegisterRequest) -> Admin:
        # Kiểm tra xem email đã tồn tại trong bảng admins chưa
        query = select(Admin).where(Admin.email == payload.email)
        if (await self.db.execute(query)).scalar_one_or_none():
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
        self.db.add(new_admin)
        await self.db.commit()
        await self.db.refresh(new_admin)
        return new_admin

    async def authenticate_user(self, payload: LoginRequest) -> User:
        return await self._authenticate_account(User, payload)

    async def get_user_by_id(self, user_id: int) -> User:
        return await self._get_account_by_id(User, user_id, "user")

    async def authenticate_admin(self, payload: LoginRequest) -> Admin:
        return await self._authenticate_account(Admin, payload)

    async def get_admin_by_id(self, admin_id: int) -> Admin:
        return await self._get_account_by_id(Admin, admin_id, "administrator")

def get_auth_service(db: AsyncSession = Depends(get_db)) -> AuthService:
    return AuthService(db)