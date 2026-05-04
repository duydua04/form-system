from fastapi import Depends
from ...services.admin.admin_submission_service import AdminSubmissionService, get_admin_submission_service

class AdminSubmissionController:
    def __init__(self, service: AdminSubmissionService):
        self.service = service

    async def get_form_submissions(self, form_id: int, page: int, limit: int):
        return await self.service.get_form_submissions(form_id, page, limit)

    async def get_submission_detail(self, submission_id: int):
        return await self.service.get_submission_detail(submission_id)

    async def get_all_submissions(self, page: int, limit: int):
        return await self.service.get_all_submissions(page, limit)

def get_admin_submission_controller(service: AdminSubmissionService = Depends(get_admin_submission_service)) -> AdminSubmissionController:
    return AdminSubmissionController(service)