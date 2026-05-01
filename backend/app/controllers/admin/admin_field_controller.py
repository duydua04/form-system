from fastapi import Depends
from ...services.admin.admin_field_service import FieldService, get_field_service
from ...schemas.admin.admin_field_schema import FieldCreateRequest, FieldUpdateRequest

class FieldController:
    def __init__(self, field_service: FieldService):
        self.field_service = field_service

    async def create(self, form_id: int, admin_id: int, payload: FieldCreateRequest):
        return await self.field_service.create_field(form_id, admin_id, payload)

    async def update(self, form_id: int, field_id: int, admin_id: int, payload: FieldUpdateRequest):
        return await self.field_service.update_field(form_id, field_id, admin_id, payload)

    async def delete(self, form_id: int, field_id: int, admin_id: int):
        await self.field_service.delete_field(form_id, field_id, admin_id)
        return {"message": "Xóa field thành công."}

# Dependency Injection
def get_field_controller(service: FieldService = Depends(get_field_service)) -> FieldController:
    return FieldController(service)