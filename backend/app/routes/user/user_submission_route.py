from fastapi import APIRouter, Depends, status, Query
from typing import Optional

from ...controllers.user.user_submission_controller import UserSubmissionController, get_user_submission_controller
from ...schemas.user.user_submission_schema import (
    FormActiveResponse,
    FormSubmitRequest,
    SubmissionResponse, FormDetailUserResponse
)
from ...schemas.common.pagination_schema import PaginatedResponse
from ...schemas.common.enum_schema import TimeFilterEnum
from ...middleware.auth import require_user

user_form_router = APIRouter(
    tags=["User - Form & Submission"]
)

@user_form_router.get(
    "/api/forms/active",
    response_model=PaginatedResponse[FormActiveResponse],
    status_code=status.HTTP_200_OK
)
async def list_active_forms(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    time_filter: Optional[TimeFilterEnum] = None,
    user_id: int = Depends(require_user),
    controller: UserSubmissionController = Depends(get_user_submission_controller)
):
    """Danh sách form active, sắp xếp theo thứ tự hiển thị"""
    return await controller.get_active_forms(page, limit, time_filter)


@user_form_router.post(
    "/api/forms/{id:int}/submit",
    status_code=status.HTTP_201_CREATED
)
async def submit_form(
    id: int,
    payload: FormSubmitRequest,
    user_id: int = Depends(require_user),
    controller: UserSubmissionController = Depends(get_user_submission_controller)
):
    """Nhân viên submit form"""
    return await controller.submit(form_id=id, user_id=user_id, payload=payload)


@user_form_router.get(
    "/api/submissions",
    response_model=PaginatedResponse[SubmissionResponse],
    status_code=status.HTTP_200_OK
)
async def list_my_submissions(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    user_id: int = Depends(require_user),
    controller: UserSubmissionController = Depends(get_user_submission_controller)
):
    """Xem lại danh sách bài đã submit"""
    return await controller.get_my_submissions(user_id, page, limit)

@user_form_router.get(
    "/api/user/forms/{id:int}",
    response_model=FormDetailUserResponse,
    status_code=status.HTTP_200_OK
)
async def get_form_detail(
    id: int,
    user_id: int = Depends(require_user),
    controller: UserSubmissionController = Depends(get_user_submission_controller)
):
    """Lấy chi tiết 1 form kèm danh sách các trường nhập liệu (Fields)"""
    return await controller.get_detail(form_id=id)