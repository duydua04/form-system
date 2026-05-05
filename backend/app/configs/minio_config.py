from pydantic_settings import BaseSettings, SettingsConfigDict

class MinioSettings(BaseSettings):
    ENDPOINT: str
    PUBLIC_ENDPOINT: str
    ACCESS_KEY: str
    SECRET_KEY: str
    SECURE: bool
    BUCKET_NAME: str

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        env_prefix="MINIO_",
        extra="ignore"
    )

minio_settings = MinioSettings()