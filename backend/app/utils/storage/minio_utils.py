import io
import uuid
from datetime import datetime, timedelta
from minio import Minio
from minio.error import S3Error
from ...configs.minio_config import minio_settings


class MinioHandler:
    def __init__(self):
        # 1. CLIENT NỘI BỘ
        self.client = Minio(
            minio_settings.ENDPOINT,  # Thường là "minio:9000"
            access_key=minio_settings.ACCESS_KEY,
            secret_key=minio_settings.SECRET_KEY,
            secure=minio_settings.SECURE
        )

        # 2. CLIENT ẢO (EXTERNAL)
        self.external_client = Minio(
            minio_settings.PUBLIC_ENDPOINT,  # Lấy từ .env, phải là "localhost:9005"
            access_key=minio_settings.ACCESS_KEY,
            secret_key=minio_settings.SECRET_KEY,
            secure=minio_settings.SECURE,
            region="us-east-1"  # BẮT BUỘC có để Client không tự động check kết nối mạng
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

    def upload_file(
            self,
            file_name: str, file_data: bytes,
            content_type: str = "application/pdf"
    ) -> str:
        """Upload file lên MinIO bằng Client Nội bộ. Trả về đường dẫn."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = uuid.uuid4().hex[:8]
        month_folder = datetime.now().strftime("%Y/%m")

        object_name = f"uploads/{month_folder}/{timestamp}_{unique_id}.pdf"

        try:
            # Dùng internal client để upload
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

    def get_presigned_url(self, file_path: str, expires_in_hours: int = 1) -> str:
        """
        Tạo URL tạm thời bằng EXTERNAL CLIENT để Frontend có thể mở được file.
        """
        try:
            # Cắt bỏ '/' ở đầu nếu bị thừa
            clean_path = file_path.lstrip('/')
            parts = clean_path.split("/", 1)

            if len(parts) != 2:
                raise ValueError("Đường dẫn file không hợp lệ")

            bucket_name, object_name = parts

            # SỬ DỤNG EXTERNAL CLIENT TẠI ĐÂY
            url = self.external_client.presigned_get_object(
                bucket_name=bucket_name,
                object_name=object_name,
                expires=timedelta(hours=expires_in_hours)
            )
            return url
        except Exception as e:
            raise Exception(f"Lỗi khi tạo link truy cập: {e}")


minio_handler = MinioHandler()