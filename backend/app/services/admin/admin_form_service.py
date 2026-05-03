from fastapi import status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
import math

from ...configs.db_config import get_db
from ...models.form import Form
from ...schemas.admin.admin_form_schema import FormCreateRequest, FormUpdateRequest
from ...schemas.common.enum_schema import TimeFilterEnum
from ...utils.error_helper.exceptions import AppException
from ...repositories.admin.admin_form_repository import FormRepository
from ...schemas.common.pagination_schema import PaginatedResponse  # Import schema

class FormService:
    def __init__(self, form_repo: FormRepository):
        self.form_repo = form_repo

    async def get_forms(
            self,
            admin_id: int, page: int, limit: int,
            time_filter: TimeFilterEnum | None = None
    ) -> PaginatedResponse:
        offset = (page - 1) * limit
        forms, total = await self.form_repo.get_forms(
            admin_id=admin_id,
            offset=offset,
            limit=limit,
            time_filter=time_filter
        )

        return PaginatedResponse(
            items=forms,
            total=total,
            page=page,
            limit=limit,
            total_pages=math.ceil(total / limit) if total > 0 else 0
        )

    async def create_form(self, admin_id: int, payload: FormCreateRequest) -> Form:
        form_data = payload.model_dump()
        form_data["admin_id"] = admin_id
        return await self.form_repo.create_form(form_data)

    async def get_form_detail(self, form_id: int, admin_id: int) -> Form:
        form = await self.form_repo.get_form_detail(form_id, admin_id)

        if not form:
            raise AppException(
                status_code=status.HTTP_404_NOT_FOUND,
                message="Form not found"
            )
        return form

    async def update_form(self, form_id: int, admin_id: int, payload: FormUpdateRequest) -> Form:
        form = await self.get_form_detail(form_id, admin_id)

        update_data = payload.model_dump(exclude_unset=True)
        return await self.form_repo.update_form(form, update_data)

    async def delete_form(self, form_id: int, admin_id: int) -> None:
        form = await self.get_form_detail(form_id, admin_id)
        await self.form_repo.delete_form(form)


def get_form_service(db: AsyncSession = Depends(get_db)) -> FormService:
    return FormService(FormRepository(db))