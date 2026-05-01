import math
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from fastapi import status, Depends

from ...configs.db_config import get_db
from ...models.form import Form

from ...models.submission import Submission
from ...models.submission_answer import SubmissionAnswer
from ...models.enums import FormStatusEnum
from ...utils.error_helper.exceptions import AppException
from ...services.common.submission_validator import SubmissionValidator
from ...schemas.user.user_submission_schema import FormSubmitRequest
from ...schemas.common.enum_schema import TimeFilterEnum


class UserSubmissionService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_active_forms(self, page: int, limit: int, time_filter: TimeFilterEnum | None = None):
        offset = (page - 1) * limit

        query = select(Form).where(Form.status == FormStatusEnum.active)

        if time_filter:
            now = datetime.now(timezone.utc)
            if time_filter == TimeFilterEnum.TODAY:
                start_date = now.replace(
                    hour=0, minute=0,
                    second=0, microsecond=0
                )
                query = query.where(Form.created_at >= start_date)
            elif time_filter == TimeFilterEnum.THIS_WEEK:
                start_date = now - timedelta(days=now.weekday())
                start_date = start_date.replace(
                    hour=0, minute=0,
                    second=0, microsecond=0
                )
                query = query.where(Form.created_at >= start_date)

        total_query = select(func.count()).select_from(query.subquery())
        total = (await self.db.execute(total_query)).scalar() or 0

        query = query.order_by(Form.display_order.asc(), Form.created_at.desc())
        query = query.offset(offset).limit(limit)

        result = await self.db.execute(query)
        forms = result.scalars().all()

        return {
            "items": forms,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": math.ceil(total / limit) if total > 0 else 0
        }

    async def submit_form(self, form_id: int, user_id: int, payload: FormSubmitRequest) -> Submission:
        query = select(Form).options(selectinload(Form.fields)).where(
            Form.id == form_id,
            Form.status == FormStatusEnum.active
        )
        result = await self.db.execute(query)
        form = result.scalar_one_or_none()

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

        new_submission = Submission(
            form_id=form_id,
            user_id=user_id,
            answers=valid_answers_objects
        )

        self.db.add(new_submission)
        await self.db.commit()
        await self.db.refresh(new_submission)

        return new_submission

    async def get_user_submissions(self, user_id: int, page: int, limit: int):
        offset = (page - 1) * limit
        query = select(Submission).where(Submission.user_id == user_id)

        total_query = select(func.count()).select_from(query.subquery())
        total = (await self.db.execute(total_query)).scalar() or 0

        query = query.order_by(Submission.submitted_at.desc())
        query = query.offset(offset).limit(limit)

        result = await self.db.execute(query)
        submissions = result.scalars().all()

        return {
            "items": submissions,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": math.ceil(total / limit) if total > 0 else 0
        }

    async def get_form_detail(self, form_id: int) -> Form:
        query = select(Form).options(selectinload(Form.fields)).where(
            Form.id == form_id,
            Form.status == FormStatusEnum.active
        )
        result = await self.db.execute(query)
        form = result.scalar_one_or_none()

        if not form:
            raise AppException(
                status_code=status.HTTP_404_NOT_FOUND,
                error_code="FORM_NOT_FOUND",
                message="Biểu mẫu không tồn tại hoặc đã bị đóng."
            )

        form.fields.sort(key=lambda x: x.display_order)

        return form
def get_user_submission_service(db: AsyncSession = Depends(get_db)) -> UserSubmissionService:
    return UserSubmissionService(db)