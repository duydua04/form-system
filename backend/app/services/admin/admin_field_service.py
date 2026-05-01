from fastapi import status, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ...configs.db_config import get_db
from ...models.field import Field
from ...models.form import Form
from ...schemas.admin.admin_field_schema import FieldCreateRequest, FieldUpdateRequest, FieldReorderRequest
from ...utils.error_helper.exceptions import AppException
from ...repositories.admin.admin_field_repository import FieldRepository


class FieldService:
    def __init__(self, field_repo: FieldRepository):
        self.field_repo = field_repo

    async def _verify_form_ownership(self, form_id: int, admin_id: int) -> Form:
        """Kiểm tra xem Form có tồn tại và thuộc quyền sở hữu của Admin đang request không"""
        form = await self.field_repo.get_form_ownership(form_id, admin_id)
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

        field = await self.field_repo.get_field(form_id, field_id)

        if not field:
            raise AppException(
                status_code=status.HTTP_404_NOT_FOUND,
                error_code="FIELD_NOT_FOUND",
                message="Field không tồn tại trong form này."
            )
        return field

    async def create_field(self, form_id: int, admin_id: int, payload: FieldCreateRequest) -> Field:
        await self._verify_form_ownership(form_id, admin_id)

        field_data = payload.model_dump()
        field_data["form_id"] = form_id
        return await self.field_repo.create_field(field_data)

    async def update_field(self, form_id: int, field_id: int, admin_id: int, payload: FieldUpdateRequest) -> Field:
        field = await self._get_field_with_auth(form_id, field_id, admin_id)

        update_data = payload.model_dump(exclude_unset=True)
        return await self.field_repo.update_field(field, update_data)

    async def reorder_fields(self, form_id: int, admin_id: int, payload: FieldReorderRequest) -> None:
        await self._verify_form_ownership(form_id, admin_id)

        await self.field_repo.reorder_fields(form_id, payload.ordered_field_ids)

    async def delete_field(self, form_id: int, field_id: int, admin_id: int) -> None:
        field = await self._get_field_with_auth(form_id, field_id, admin_id)
        await self.field_repo.delete_field(field)


def get_field_service(db: AsyncSession = Depends(get_db)) -> FieldService:
    return FieldService(FieldRepository(db))