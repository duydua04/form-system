from fastapi import APIRouter, UploadFile, File, Depends, status
from ...controllers.common.upload_controller import UploadController, get_upload_controller
from ...utils.error_helper.exceptions import AppException

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