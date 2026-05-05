import math
from fastapi import status, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ...configs.db_config import get_db
from ...utils.error_helper.exceptions import AppException
from ...schemas.common.pagination_schema import PaginatedResponse
from ...repositories.admin.admin_submission_repository import AdminSubmissionRepository


class AdminSubmissionService:
    def __init__(self, repo: AdminSubmissionRepository):
        self.repo = repo

    async def get_form_submissions(self, form_id: int, page: int, limit: int) -> PaginatedResponse:
        offset = (page - 1) * limit
        submissions, total = await self.repo.get_submissions_by_form(form_id, offset, limit)

        items = []
        for sub in submissions:
            items.append({
                "id": sub.id,
                "user_id": sub.user_id,
                "username": sub.user.username if sub.user else "Unknown",
                "email": sub.user.email if sub.user else "Unknown",
                "submitted_at": sub.submitted_at,
            })

        total_pages = math.ceil(total / limit) if total > 0 else 0

        # Trả về instance của PaginatedResponse
        return PaginatedResponse(
            items=items,
            total=total,
            page=page,
            limit=limit,
            total_pages=total_pages
        )

    async def get_submission_detail(self, submission_id: int) -> dict:
        submission = await self.repo.get_submission_detail(submission_id)

        if not submission:
            raise AppException(
                status_code=status.HTTP_404_NOT_FOUND,
                error_code="SUBMISSION_NOT_FOUND",
                message="Không tìm thấy bài nộp này."
            )

        answers = []
        for ans in submission.answers:
            answers.append({
                "id": ans.id,
                "field_id": ans.field_id,
                "field_label": ans.field.label if ans.field else "Trường đã xoá",
                "field_type": ans.field.field_type if ans.field else "text",
                "value": ans.value,
            })

        answers.sort(key=lambda a: a.get("field_id", 0))

        return {
            "id": submission.id,
            "form_id": submission.form_id,
            "form_title": submission.form.title if submission.form else "Biểu mẫu đã xoá",
            "user_id": submission.user_id,
            "email": submission.user.email if submission.user else "Unknown",
            "submitted_at": submission.submitted_at,
            "answers": answers,
        }

    async def get_all_submissions(self, page: int, limit: int) -> PaginatedResponse:
        offset = (page - 1) * limit
        submissions, total = await self.repo.get_all_submissions(offset, limit)

        items = []
        for sub in submissions:
            items.append({
                "id": sub.id,
                "form_id": sub.form_id,
                "form_title": sub.form.title if sub.form else "Biểu mẫu đã xoá",
                "user_id": sub.user_id,
                "email": sub.user.email if sub.user else "Unknown",
                "submitted_at": sub.submitted_at,
            })

        return PaginatedResponse(
            items=items,
            total=total,
            page=page,
            limit=limit,
            total_pages=math.ceil(total / limit) if total > 0 else 0
        )


def get_admin_submission_service(db: AsyncSession = Depends(get_db)) -> AdminSubmissionService:
    return AdminSubmissionService(AdminSubmissionRepository(db))