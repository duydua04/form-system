from fastapi import Depends
from ...services.admin.admin_form_service import FormService, get_form_service
from ...schemas.admin.admin_form_schema import FormCreateRequest, FormUpdateRequest, TimeFilterEnum

class FormController:
    def __init__(self, form_service: FormService):
        self.form_service = form_service

    async def get_list(
            self,
            admin_id: int,
            page: int, limit: int,
            time_filter: TimeFilterEnum | None
    ):
        return await self.form_service.get_forms(admin_id, page, limit, time_filter)

    async def create(
            self,
            admin_id: int,
            payload: FormCreateRequest
    ):
        return await self.form_service.create_form(admin_id, payload)

    async def get_detail(
            self,
            form_id: int, admin_id: int
    ):
        return await self.form_service.get_form_detail(form_id, admin_id)

    async def update(
            self,
            form_id: int,
            admin_id: int,
            payload: FormUpdateRequest
    ):
        return await self.form_service.update_form(form_id, admin_id, payload)

    async def delete(
            self,
            form_id: int,
            admin_id: int
    ):
        await self.form_service.delete_form(form_id, admin_id)
        return {"message": "Form deleted successfully"}


def get_form_controller(service: FormService = Depends(get_form_service)) -> FormController:
    return FormController(service)