from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import Optional, Tuple, List

from ...models.submission import Submission
from ...models.submission_answer import SubmissionAnswer


class AdminSubmissionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_submissions_by_form(self, form_id: int, offset: int, limit: int) -> Tuple[List[Submission], int]:
        """Lấy danh sách các bài nộp của 1 form cụ thể, kèm thông tin user"""
        query = select(Submission).options(
            selectinload(Submission.user)
        ).where(Submission.form_id == form_id)

        total_query = select(func.count()).select_from(
            select(Submission.id).where(Submission.form_id == form_id).subquery()
        )
        total = (await self.db.execute(total_query)).scalar() or 0

        query = query.order_by(Submission.submitted_at.desc()).offset(offset).limit(limit)

        result = await self.db.execute(query)
        submissions = list(result.scalars().all())

        return submissions, total

    async def get_submission_detail(self, submission_id: int) -> Optional[Submission]:
        """Lấy chi tiết 1 bài nộp kèm form, user, và answers + field"""
        query = select(Submission).options(
            selectinload(Submission.user),
            selectinload(Submission.form),
            selectinload(Submission.answers).selectinload(SubmissionAnswer.field)
        ).where(Submission.id == submission_id)

        result = await self.db.execute(query)
        return result.scalar_one_or_none()