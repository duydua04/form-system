import io
import uuid
from datetime import datetime
from minio import Minio
from minio.error import S3Error
from ...configs.minio_config import minio_settings


class MinioHandler:
    def __init__(self):
        self.client = Minio(
            minio_settings.ENDPOINT,
            access_key=minio_settings.ACCESS_KEY,
            secret_key=minio_settings.SECRET_KEY,
            secure=minio_settings.SECURE
        )
        self.bucket_name = minio_settings.BUCKET_NAME
        self._ensure_bucket_exists()

    def _ensure_bucket_exists(self):
        """Tự động tạo bucket lúc khởi động nếu chưa có"""
        try:
            if not self.client.bucket_exists(self.bucket_name):
                self.client.make_bucket(self.bucket_name)
                print(f"Đã tạo bucket thành công: {self.bucket_name}")
        except S3Error as e:
            print(f"Lỗi khởi tạo bucket MinIO: {e}")

    def upload_file(self, file_name: str, file_data: bytes, content_type: str = "application/pdf") -> str:
        """
        Upload file lên MinIO. Trả về đường dẫn.
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = uuid.uuid4().hex[:8]
        month_folder = datetime.now().strftime("%Y/%m")

        # Cấu trúc: uploads/2026/05/20260504_153000_a1b2c3d4.pdf
        object_name = f"uploads/{month_folder}/{timestamp}_{unique_id}.pdf"

        try:
            self.client.put_object(
                bucket_name=self.bucket_name,
                object_name=object_name,
                data=io.BytesIO(file_data),
                length=len(file_data),
                content_type=content_type
            )
            return f"{self.bucket_name}/{object_name}"
        except S3Error as e:
            raise Exception(f"S3Error: {e}")


minio_handler = MinioHandler()