from fastapi import Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from ...configs.db_config import get_db
from ...models.user import User
from ...models.admin import Admin
from ...utils.security.password import get_password_hash
from ...utils.error_helper.exceptions import AppException
from ...schemas.common.pagination_schema import PaginatedResponse
from ...schemas.admin.user_management_schema import CreateAccountRequest, CreateAccountResponse, AccountResponse
from ...repositories.admin.user_management_repo import UserManagementRepository


class UserManagementService:
    def __init__(self, repo: UserManagementRepository):
        self.repo = repo

    async def create_account(self, payload: CreateAccountRequest) -> CreateAccountResponse:
        if payload.role not in ['user', 'admin']:
            raise AppException(
                status_code=status.HTTP_400_BAD_REQUEST,
                error_code="INVALID_ROLE",
                message="Role must be either 'user' or 'admin'."
            )

        target_model = Admin if payload.role == 'admin' else User

        if await self.repo.get_account_by_email(target_model, payload.email):
            raise AppException(
                status_code=status.HTTP_409_CONFLICT,
                error_code="EMAIL_EXISTS",
                message=f"An account with this email already exists in the {payload.role} system."
            )

        hashed_password = get_password_hash(payload.password)
        new_account = target_model(
            email=payload.email,
            password_hash=hashed_password
        )
        saved_account = await self.repo.create_account(new_account)
        return CreateAccountResponse(
            id=saved_account.id,
            email=saved_account.email,
            role=payload.role,
            message=f"Successfully created a new {payload.role} account."
        )

    async def get_paginated_users(self, page: int, limit: int) -> PaginatedResponse[AccountResponse]:
        total = await self.repo.count_accounts(User)

        total_pages = (total + limit - 1) // limit if total > 0 else 0
        offset = (page - 1) * limit

        users = await self.repo.get_paginated_accounts(User, offset, limit)

        return PaginatedResponse(
            items=[AccountResponse.model_validate(user) for user in users],
            total=total,
            page=page,
            limit=limit,
            total_pages=total_pages
        )


def get_user_management_service(db: AsyncSession = Depends(get_db)) -> UserManagementService:
    return UserManagementService(UserManagementRepository(db))