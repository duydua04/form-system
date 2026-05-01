from fastapi import Depends
from ...services.user.user_submission_service import UserSubmissionService, get_user_submission_service
from ...schemas.user.user_submission_schema import FormSubmitRequest
from ...schemas.common.enum_schema import TimeFilterEnum

class UserSubmissionController:
    def __init__(self, service: UserSubmissionService):
        self.service = service

    async def get_active_forms(self, page: int, limit: int, time_filter: TimeFilterEnum | None = None):
        return await self.service.get_active_forms(page, limit, time_filter)

    async def submit(self, form_id: int, user_id: int, payload: FormSubmitRequest):
        await self.service.submit_form(form_id, user_id, payload)
        return {"message": "Submit form successfully."}

    async def get_my_submissions(self, user_id: int, page: int, limit: int):
        return await self.service.get_user_submissions(user_id, page, limit)

    async def get_detail(self, form_id: int):
        return await self.service.get_form_detail(form_id)

def get_user_submission_controller(service: UserSubmissionService = Depends(get_user_submission_service)) -> UserSubmissionController:
    return UserSubmissionController(service)