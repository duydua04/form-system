from fastapi import APIRouter, UploadFile, File, Depends, status, Query
from ...controllers.common.upload_controller import UploadController, get_upload_controller
from ...utils.error_helper.exceptions import AppException
from ...utils.storage.minio_utils import minio_handler

# 5MB giới hạn
MAX_FILE_SIZE = 5 * 1024 * 1024

upload_router = APIRouter(tags=["Common - Uploads"])


@upload_router.post(
    "/api/upload/file",
    status_code=status.HTTP_201_CREATED
)
async def upload_pdf_file(
        file: UploadFile = File(...),
        controller: UploadController = Depends(get_upload_controller)
):
    """API Upload độc lập. Nhận PDF <= 5MB."""

    # 1. Validate loại file (Chỉ cho phép .pdf)
    if not file.filename.lower().endswith(".pdf") or file.content_type != "application/pdf":
        raise AppException(
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="INVALID_FILE_TYPE",
            message="Hệ thống chỉ chấp nhận định dạng file .pdf"
        )

    # 2. Đọc file vào RAM và Validate kích thước
    file_data = await file.read()
    if len(file_data) > MAX_FILE_SIZE:
        raise AppException(
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="FILE_TOO_LARGE",
            message="Kích thước file vượt quá 5MB. Vui lòng tải lên file nhỏ hơn."
        )

    # 3. Đẩy xuống Controller
    return controller.handle_pdf_upload(
        file_name=file.filename,
        file_data=file_data,
        content_type=file.content_type
    )

@upload_router.get(
    "/api/files/presigned-url",
    status_code=status.HTTP_200_OK
)
async def get_file_access_url(path: str = Query(..., description="Đường dẫn file trên MinIO")):
    """
    API lấy link truy cập file tạm thời (Presigned URL).
    Phục vụ cho tính năng Xem/Tải file trên giao diện.
    """
    try:
        url = minio_handler.get_presigned_url(path)
        return {
            "success": True,
            "data": {
                "url": url
            }
        }
    except Exception as e:
        raise AppException(
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="PRESIGNED_URL_ERROR",
            message="Không thể tạo link truy cập file lúc này.",
            details=[{"issue": str(e)}]
        )