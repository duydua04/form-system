from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from datetime import datetime, timezone, timedelta
from typing import Optional, Tuple, List

from ...models.form import Form
from ...models.submission import Submission
from ...models.submission_answer import SubmissionAnswer
from ...models.enums import FormStatusEnum
from ...schemas.common.enum_schema import TimeFilterEnum

class UserSubmissionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_active_forms(self, offset: int, limit: int, time_filter: Optional[TimeFilterEnum] = None) -> Tuple[List[Form], int]:
        query = select(Form).where(Form.status == FormStatusEnum.active)

        if time_filter:
            now = datetime.now(timezone.utc)
            if time_filter == TimeFilterEnum.TODAY:
                start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
                query = query.where(Form.created_at >= start_date)
            elif time_filter == TimeFilterEnum.THIS_WEEK:
                start_date = now - timedelta(days=now.weekday())
                start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
                query = query.where(Form.created_at >= start_date)

        total_query = select(func.count()).select_from(query.subquery())
        total = (await self.db.execute(total_query)).scalar() or 0

        query = query.order_by(Form.display_order.asc(), Form.created_at.desc())
        query = query.offset(offset).limit(limit)

        result = await self.db.execute(query)
        forms = list(result.scalars().all())

        return forms, total

    async def get_form_detail_active(self, form_id: int) -> Optional[Form]:
        query = select(Form).options(selectinload(Form.fields)).where(
            Form.id == form_id,
            Form.status == FormStatusEnum.active
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def create_submission(self, form_id: int, user_id: int, answers_data: List[SubmissionAnswer]) -> Submission:
        new_submission = Submission(
            form_id=form_id,
            user_id=user_id,
            answers=answers_data
        )
        self.db.add(new_submission)
        await self.db.commit()
        await self.db.refresh(new_submission)
        return new_submission

    async def get_user_submissions(self, user_id: int, offset: int, limit: int) -> Tuple[List[Submission], int]:
        query = select(Submission).options(
            selectinload(Submission.form)
        ).where(Submission.user_id == user_id)

        total_query = select(func.count()).select_from(
            select(Submission.id).where(Submission.user_id == user_id).subquery()
        )
        total = (await self.db.execute(total_query)).scalar() or 0

        query = query.order_by(Submission.submitted_at.desc())
        query = query.offset(offset).limit(limit)

        result = await self.db.execute(query)
        submissions = list(result.scalars().all())

        return submissions, total

    async def get_submission_detail(self, submission_id: int, user_id: int) -> Optional[Submission]:
        """Lấy chi tiết 1 submission kèm answers + field info, chỉ của user đang đăng nhập"""
        query = select(Submission).options(
            selectinload(Submission.form),
            selectinload(Submission.answers).selectinload(SubmissionAnswer.field)
        ).where(
            Submission.id == submission_id,
            Submission.user_id == user_id
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
