from fastapi import Depends
from ...services.common.upload_service import UploadService, get_upload_service


class UploadController:
    def __init__(self, service: UploadService):
        self.service = service

    def handle_pdf_upload(self, file_name: str, file_data: bytes, content_type: str):
        upload_result = self.service.upload_pdf(file_name, file_data, content_type)

        return {
            "success": True,
            "message": "Tải file lên thành công.",
            "data": upload_result
        }


def get_upload_controller(service: UploadService = Depends(get_upload_service)) -> UploadController:
    return UploadController(service)