from fastapi import Depends
from ...services.admin.user_management_service import UserManagementService, get_user_management_service
from ...schemas.admin.user_management_schema import CreateAccountRequest, CreateAccountResponse, AccountResponse
from ...schemas.common.pagination_schema import PaginatedResponse

class UserManagementController:
    def __init__(self, service: UserManagementService):
        self.service = service

    async def create_account(self, payload: CreateAccountRequest) -> CreateAccountResponse:
        return await self.service.create_account(payload)

    async def get_users(self, page: int, limit: int) -> PaginatedResponse[AccountResponse]:
        return await self.service.get_paginated_users(page, limit)

def get_user_management_controller(service: UserManagementService = Depends(get_user_management_service)) -> UserManagementController:
    return UserManagementController(service)