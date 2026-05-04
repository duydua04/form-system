from pydantic_settings import BaseSettings, SettingsConfigDict

class MinioSettings(BaseSettings):
    ENDPOINT: str = "localhost:9000"
    ACCESS_KEY: str = "admin_form"
    SECRET_KEY: str = "SecurePassword123!"
    SECURE: bool = False
    BUCKET_NAME: str = "form-submissions"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        env_prefix="MINIO_",
        extra="ignore"
    )

minio_settings = MinioSettings()