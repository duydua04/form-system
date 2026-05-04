from fastapi import status
from ...utils.storage.minio_utils import minio_handler
from ...utils.error_helper.exceptions import AppException

class UploadService:
    def upload_pdf(self, file_name: str, file_data: bytes, content_type: str) -> dict:
        try:
            file_path = minio_handler.upload_file(
                file_name=file_name,
                file_data=file_data,
                content_type=content_type
            )
            return {
                "file_path": file_path,
                "file_name": file_name
            }
        except Exception as e:
            raise AppException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                error_code="STORAGE_UPLOAD_ERROR",
                message="Không thể lưu trữ file lúc này. Vui lòng thử lại sau.",
                details=[{"issue": str(e)}]
            )

def get_upload_service() -> UploadService:
    return UploadService()