from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, Tuple, List

from ...models.form import Form
from ...schemas.common.enum_schema import TimeFilterEnum

class FormRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_forms(
            self,
            admin_id: int, 
            offset: int, 
            limit: int,
            time_filter: Optional[TimeFilterEnum] = None
    ) -> Tuple[List[Form], int]:
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
        forms = list(result.scalars().all())

        return forms, total

    async def create_form(self, form_data: Dict[str, Any]) -> Form:
        new_form = Form(**form_data)
        self.db.add(new_form)
        await self.db.commit()
        await self.db.refresh(new_form)
        return new_form

    async def get_form_detail(self, form_id: int, admin_id: int) -> Optional[Form]:
        query = select(Form).options(selectinload(Form.fields)).where(
            Form.id == form_id,
            Form.admin_id == admin_id
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def update_form(self, form: Form, update_data: Dict[str, Any]) -> Form:
        for key, value in update_data.items():
            setattr(form, key, value)
        await self.db.commit()
        await self.db.refresh(form)
        return form

    async def delete_form(self, form: Form) -> None:
        await self.db.delete(form)
        await self.db.commit()
