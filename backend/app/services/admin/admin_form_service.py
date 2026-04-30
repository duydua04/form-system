from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from fastapi import status, Depends
from datetime import datetime, timezone, timedelta
import math

from ...configs.db_config import get_db
from ...models.form import Form
from ...schemas.admin.admin_form_schema import FormCreateRequest, FormUpdateRequest, TimeFilterEnum
from ...utils.error_helper.exceptions import AppException


class FormService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_forms(
            self,
            admin_id: int, page: int, limit: int,
            time_filter: TimeFilterEnum | None = None
    ):
        offset = (page - 1) * limit
        query = select(Form).where(Form.admin_id == admin_id)

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
        forms = result.scalars().all()

        return {
            "items": forms,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": math.ceil(total / limit) if total > 0 else 0
        }

    async def create_form(self, admin_id: int, payload: FormCreateRequest) -> Form:
        new_form = Form(
            admin_id=admin_id,
            title=payload.title,
            description=payload.description,
            display_order=payload.display_order,
            status=payload.status
        )
        self.db.add(new_form)
        await self.db.commit()
        await self.db.refresh(new_form)
        return new_form

    async def get_form_detail(self, form_id: int, admin_id: int) -> Form:
        query = select(Form).options(selectinload(Form.fields)).where(
            Form.id == form_id,
            Form.admin_id == admin_id
        )
        result = await self.db.execute(query)
        form = result.scalar_one_or_none()

        if not form:
            raise AppException(
                status_code=status.HTTP_404_NOT_FOUND,
                message="Form not found"
            )
        return form

    async def update_form(self, form_id: int, admin_id: int, payload: FormUpdateRequest) -> Form:
        form = await self.get_form_detail(form_id, admin_id)

        update_data = payload.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(form, key, value)

        await self.db.commit()
        await self.db.refresh(form)
        return form

    async def delete_form(self, form_id: int, admin_id: int) -> None:
        form = await self.get_form_detail(form_id, admin_id)
        await self.db.delete(form)
        await self.db.commit()


def get_form_service(db: AsyncSession = Depends(get_db)) -> FormService:
    return FormService(db)