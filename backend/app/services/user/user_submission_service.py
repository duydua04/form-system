import math
from fastapi import status, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ...configs.db_config import get_db
from ...models.form import Form
from ...models.submission import Submission
from ...models.submission_answer import SubmissionAnswer
from ...utils.error_helper.exceptions import AppException
from ...services.common.submission_validator import SubmissionValidator
from ...schemas.user.user_submission_schema import FormSubmitRequest
from ...schemas.common.enum_schema import TimeFilterEnum
from ...repositories.user.user_submission_repository import UserSubmissionRepository
from ...schemas.common.pagination_schema import PaginatedResponse  # Import schema

class UserSubmissionService:
    def __init__(self, repo: UserSubmissionRepository):
        self.repo = repo

    async def get_active_forms(self, page: int, limit: int, time_filter: TimeFilterEnum | None = None) -> PaginatedResponse:
        offset = (page - 1) * limit
        forms, total = await self.repo.get_active_forms(offset, limit, time_filter)

        return PaginatedResponse(
            items=forms,
            total=total,
            page=page,
            limit=limit,
            total_pages=math.ceil(total / limit) if total > 0 else 0
        )

    async def submit_form(self, form_id: int, user_id: int, payload: FormSubmitRequest) -> Submission:
        form = await self.repo.get_form_detail_active(form_id)

        if not form:
            raise AppException(
                status_code=status.HTTP_404_NOT_FOUND,
                error_code="FORM_NOT_FOUND",
                message="Form not exist or closed."
            )

        user_answers_dict = {ans.field_id: ans.value for ans in payload.answers}
        valid_answers_objects = []
        for field in form.fields:
            raw_value = user_answers_dict.get(field.id)
            validated_value = SubmissionValidator.validate_answer(field, raw_value)

            if validated_value is not None and str(validated_value).strip() != "":
                answer_model = SubmissionAnswer(
                    field_id=field.id,
                    value=str(validated_value)
                )
                valid_answers_objects.append(answer_model)

        return await self.repo.create_submission(form_id, user_id, valid_answers_objects)

    async def get_user_submissions(self, user_id: int, page: int, limit: int) -> PaginatedResponse:
        offset = (page - 1) * limit
        submissions, total = await self.repo.get_user_submissions(user_id, offset, limit)

        # Map submission + form info vào response
        items = []
        for sub in submissions:
            items.append({
                "id": sub.id,
                "form_id": sub.form_id,
                "user_id": sub.user_id,
                "submitted_at": sub.submitted_at,
                "form_title": sub.form.title if sub.form else "Biểu mẫu đã xoá",
                "form_description": sub.form.description if sub.form else None,
            })

        return PaginatedResponse(
            items=items,
            total=total,
            page=page,
            limit=limit,
            total_pages=math.ceil(total / limit) if total > 0 else 0
        )

    async def get_submission_detail(self, submission_id: int, user_id: int):
        submission = await self.repo.get_submission_detail(submission_id, user_id)

        if not submission:
            raise AppException(
                status_code=status.HTTP_404_NOT_FOUND,
                error_code="SUBMISSION_NOT_FOUND",
                message="Không tìm thấy bài nộp hoặc bạn không có quyền xem."
            )

        # Map answers kèm field info
        answers = []
        for ans in submission.answers:
            answers.append({
                "id": ans.id,
                "field_id": ans.field_id,
                "field_label": ans.field.label if ans.field else "Trường đã xoá",
                "field_type": ans.field.field_type if ans.field else "text",
                "value": ans.value,
            })

        # Sắp xếp theo field_id
        answers.sort(key=lambda a: a.get("field_id", 0))

        return {
            "id": submission.id,
            "form_id": submission.form_id,
            "form_title": submission.form.title if submission.form else "Biểu mẫu đã xoá",
            "form_description": submission.form.description if submission.form else None,
            "user_id": submission.user_id,
            "submitted_at": submission.submitted_at,
            "answers": answers,
        }

    async def get_form_detail(self, form_id: int) -> Form:
        form = await self.repo.get_form_detail_active(form_id)

        if not form:
            raise AppException(
                status_code=status.HTTP_404_NOT_FOUND,
                error_code="FORM_NOT_FOUND",
                message="Biểu mẫu không tồn tại hoặc đã bị đóng."
            )

        form.fields.sort(key=lambda x: x.display_order)

        return form

def get_user_submission_service(db: AsyncSession = Depends(get_db)) -> UserSubmissionService:
    return UserSubmissionService(UserSubmissionRepository(db))