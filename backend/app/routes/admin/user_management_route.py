from fastapi import APIRouter, Depends, Query
from ...controllers.admin.user_management_controller import UserManagementController, get_user_management_controller
from ...schemas.admin.user_management_schema import CreateAccountRequest, CreateAccountResponse, AccountResponse
from ...schemas.common.pagination_schema import PaginatedResponse
from ...middleware.auth import require_admin

user_management_router = APIRouter(
    prefix="/api/admin/accounts",
    tags=["Admin - User Management"],
    dependencies=[Depends(require_admin)]
)

@user_management_router.post("", response_model=CreateAccountResponse)
async def create_new_account(
    payload: CreateAccountRequest,
    controller: UserManagementController = Depends(get_user_management_controller)
):
    """
    API Tạo tài khoản mới.
    - Truyền "role": "admin" để tạo quản trị viên.
    - Truyền "role": "user" để tạo nhân viên.
    - Truyền mật khẩu thủ công vào trường "password".
    """
    return await controller.create_account(payload)


@user_management_router.get("/users", response_model=PaginatedResponse[AccountResponse])
async def get_user_list(
    page: int = Query(1, ge=1, description="Trang hiện tại (tối thiểu 1)"),
    limit: int = Query(10, ge=1, le=100, description="Số lượng nhân viên trên mỗi trang"),
    controller: UserManagementController = Depends(get_user_management_controller)
):
    """API lấy danh sách toàn bộ User (Nhân viên) kèm phân trang."""
    return await controller.get_users(page, limit)