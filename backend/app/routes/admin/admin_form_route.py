from fastapi import APIRouter, Depends, status, Query
from ...controllers.admin.admin_form_controller import FormController, get_form_controller
from ...schemas.admin.admin_form_schema import (
    FormResponse,
    FormDetailResponse,
    FormCreateRequest,
    FormUpdateRequest
)
from ...schemas.common.pagination_schema import PaginatedResponse
from ...schemas.common.enum_schema import TimeFilterEnum
from ...middleware.auth import require_admin

admin_form_router = APIRouter(
    prefix="/api/forms",
    tags=["Admin - Form Management"]
)

@admin_form_router.get("",
                 response_model=PaginatedResponse[FormResponse],
                 status_code=status.HTTP_200_OK
)
async def list_forms(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(6, ge=1, le=100, description="Items per page"),
    time_filter: TimeFilterEnum | None = Query(None, description="Filter by time: today, this_week"),
    admin_id: int = Depends(require_admin),
    controller: FormController = Depends(get_form_controller)
):

    return await controller.get_list(admin_id, page, limit, time_filter)

@admin_form_router.post("", response_model=FormResponse, status_code=status.HTTP_201_CREATED)
async def create_form(
    payload: FormCreateRequest,
    admin_id: int = Depends(require_admin),
    controller: FormController = Depends(get_form_controller)
):
    """Tạo form mới"""
    return await controller.create(admin_id, payload)

@admin_form_router.get("/{form_id:int}", response_model=FormDetailResponse, status_code=status.HTTP_200_OK)
async def get_form_detail(
    form_id: int,
    admin_id: int = Depends(require_admin),
    controller: FormController = Depends(get_form_controller)
):
    """Lấy chi tiết 1 form (kèm danh sách field)"""
    return await controller.get_detail(form_id, admin_id)

@admin_form_router.put("/{form_id:int}", response_model=FormResponse, status_code=status.HTTP_200_OK)
async def update_form(
    form_id: int,
    payload: FormUpdateRequest,
    admin_id: int = Depends(require_admin),
    controller: FormController = Depends(get_form_controller)
):
    """Cập nhật thông tin form"""
    return await controller.update(form_id, admin_id, payload)

@admin_form_router.delete("/{form_id:int}", status_code=status.HTTP_200_OK)
async def delete_form(
    form_id: int,
    admin_id: int = Depends(require_admin),
    controller: FormController = Depends(get_form_controller)
):
    """Xóa form"""
    return await controller.delete(form_id, admin_id)