from fastapi import APIRouter, Depends, status
from ...controllers.admin.admin_field_controller import FieldController, get_field_controller
from ...schemas.admin.admin_field_schema import FieldCreateRequest, FieldUpdateRequest, FieldResponse
from ...middleware.auth import require_admin

field_router = APIRouter(
    prefix="/api/forms",
    tags=["Admin - Field Management"]
)

@field_router.post("/{form_id}/fields", response_model=FieldResponse, status_code=status.HTTP_201_CREATED)
async def create_field(
    form_id: int,
    payload: FieldCreateRequest,
    admin_id: int = Depends(require_admin),
    controller: FieldController = Depends(get_field_controller)
):
    """Add field to form"""
    return await controller.create(form_id, admin_id, payload)

@field_router.put("/{form_id}/fields/{field_id}", response_model=FieldResponse, status_code=status.HTTP_200_OK)
async def update_field(
    form_id: int,
    field_id: int,
    payload: FieldUpdateRequest,
    admin_id: int = Depends(require_admin),
    controller: FieldController = Depends(get_field_controller)
):
    """Update field"""
    return await controller.update(form_id, field_id, admin_id, payload)

@field_router.delete("/{form_id}/fields/{field_id}", status_code=status.HTTP_200_OK)
async def delete_field(
    form_id: int,
    field_id: int,
    admin_id: int = Depends(require_admin),
    controller: FieldController = Depends(get_field_controller)
):
    """Delete field"""
    return await controller.delete(form_id, field_id, admin_id)