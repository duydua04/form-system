from fastapi import APIRouter, Depends, status, Query

from ...controllers.admin.admin_submission_controller import AdminSubmissionController, get_admin_submission_controller
from ...schemas.admin.admin_submission_schema import SubmissionListItemResponse, SubmissionAdminDetailResponse, \
    SubmissionGlobalItemResponse
from ...schemas.common.pagination_schema import PaginatedResponse
from ...middleware.auth import require_admin

admin_submission_router = APIRouter(
    tags=["Admin - Form Submissions"],
    dependencies=[Depends(require_admin)]
)

@admin_submission_router.get(
    "/api/admin/forms/{form_id:int}/submissions",
    response_model=PaginatedResponse[SubmissionListItemResponse],
    status_code=status.HTTP_200_OK
)
async def list_form_submissions(
    form_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    controller: AdminSubmissionController = Depends(get_admin_submission_controller)
):
    """Admin lấy danh sách tất cả các bài nộp của 1 Form cụ thể"""
    return await controller.get_form_submissions(form_id, page, limit)


@admin_submission_router.get(
    "/api/admin/submissions/{submission_id:int}",
    response_model=SubmissionAdminDetailResponse,
    status_code=status.HTTP_200_OK
)
async def get_submission_detail(
    submission_id: int,
    controller: AdminSubmissionController = Depends(get_admin_submission_controller)
):
    """Admin xem chi tiết 1 bài nộp (Bao gồm thông tin người nộp và các câu trả lời)"""
    return await controller.get_submission_detail(submission_id)

@admin_submission_router.get(
    "/api/admin/submissions",
    response_model=PaginatedResponse[SubmissionGlobalItemResponse],
    status_code=status.HTTP_200_OK
)
async def list_all_submissions(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    controller: AdminSubmissionController = Depends(get_admin_submission_controller)
):
    """Admin lấy danh sách TẤT CẢ các bài nộp trên hệ thống"""
    return await controller.get_all_submissions(page, limit)