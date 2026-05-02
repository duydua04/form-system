from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, case
from typing import Optional, Dict, Any, List

from ...models.field import Field
from ...models.form import Form

class FieldRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_form_ownership(self, form_id: int, admin_id: int) -> Optional[Form]:
        query = select(Form).where(Form.id == form_id, Form.admin_id == admin_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_field(self, form_id: int, field_id: int) -> Optional[Field]:
        query = select(Field).where(Field.id == field_id, Field.form_id == form_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_field_by_display_order(self, form_id: int, display_order: int) -> Optional[Field]:
        query = select(Field).where(Field.form_id == form_id, Field.display_order == display_order)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def swap_display_order(self, field1: Field, field2: Field) -> None:
        temp = field1.display_order
        field1.display_order = field2.display_order
        field2.display_order = temp
        await self.db.commit()
        await self.db.refresh(field1)
        await self.db.refresh(field2)

    async def create_field(self, field_data: Dict[str, Any]) -> Field:
        new_field = Field(**field_data)
        self.db.add(new_field)
        await self.db.commit()
        await self.db.refresh(new_field)
        return new_field

    async def update_field(self, field: Field, update_data: Dict[str, Any]) -> Field:
        for key, value in update_data.items():
            setattr(field, key, value)
        await self.db.commit()
        await self.db.refresh(field)
        return field

    async def reorder_fields(self, form_id: int, ordered_field_ids: List[int]) -> None:
        if not ordered_field_ids:
            return

        order_mapping = {
            field_id: index
            for index, field_id in enumerate(ordered_field_ids)
        }

        stmt = update(Field).where(
            Field.form_id == form_id,
            Field.id.in_(ordered_field_ids)
        ).values(
            display_order=case(order_mapping, value=Field.id)
        )

        await self.db.execute(stmt)
        await self.db.commit()

    async def delete_field(self, field: Field) -> None:
        await self.db.delete(field)
        await self.db.commit()
