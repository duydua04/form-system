from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, case
from fastapi import status, Depends

from ...configs.db_config import get_db
from ...models.field import Field
from ...models.form import Form
from ...schemas.admin.admin_field_schema import FieldCreateRequest, FieldUpdateRequest, FieldReorderRequest
from ...utils.error_helper.exceptions import AppException


class FieldService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def _verify_form_ownership(self, form_id: int, admin_id: int):
        """Kiểm tra xem Form có tồn tại và thuộc quyền sở hữu của Admin đang request không"""
        query = select(Form).where(Form.id == form_id, Form.admin_id == admin_id)
        result = await self.db.execute(query)
        form = result.scalar_one_or_none()
        if not form:
            raise AppException(
                status_code=status.HTTP_404_NOT_FOUND,
                error_code="FORM_NOT_FOUND",
                message="Form không tồn tại hoặc bạn không có quyền thao tác trên form này."
            )
        return form

    async def _get_field_with_auth(self, form_id: int, field_id: int, admin_id: int) -> Field:
        """Lấy thông tin Field kèm kiểm tra quyền bảo mật"""
        await self._verify_form_ownership(form_id, admin_id)

        query = select(Field).where(Field.id == field_id, Field.form_id == form_id)
        result = await self.db.execute(query)
        field = result.scalar_one_or_none()

        if not field:
            raise AppException(
                status_code=status.HTTP_404_NOT_FOUND,
                error_code="FIELD_NOT_FOUND",
                message="Field không tồn tại trong form này."
            )
        return field

    async def create_field(self, form_id: int, admin_id: int, payload: FieldCreateRequest) -> Field:
        await self._verify_form_ownership(form_id, admin_id)

        new_field = Field(
            form_id=form_id,
            label=payload.label,
            field_type=payload.field_type,
            display_order=payload.display_order,
            is_required=payload.is_required,
            options=payload.options
        )
        self.db.add(new_field)
        await self.db.commit()
        await self.db.refresh(new_field)
        return new_field

    async def update_field(self, form_id: int, field_id: int, admin_id: int, payload: FieldUpdateRequest) -> Field:
        field = await self._get_field_with_auth(form_id, field_id, admin_id)

        update_data = payload.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(field, key, value)

        await self.db.commit()
        await self.db.refresh(field)
        return field

    async def reorder_fields(self, form_id: int, admin_id: int, payload: FieldReorderRequest) -> None:
        await self._verify_form_ownership(form_id, admin_id)

        if not payload.ordered_field_ids:
            return

        order_mapping = {
            field_id: index
            for index, field_id in enumerate(payload.ordered_field_ids)
        }

        stmt = update(Field).where(
            Field.form_id == form_id,
            Field.id.in_(payload.ordered_field_ids)
        ).values(
            display_order=case(order_mapping, value=Field.id)
        )

        await self.db.execute(stmt)
        await self.db.commit()

    async def delete_field(self, form_id: int, field_id: int, admin_id: int) -> None:
        field = await self._get_field_with_auth(form_id, field_id, admin_id)
        await self.db.delete(field)
        await self.db.commit()


def get_field_service(db: AsyncSession = Depends(get_db)) -> FieldService:
    return FieldService(db)