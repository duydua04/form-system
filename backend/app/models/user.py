from sqlalchemy import String, DateTime, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from datetime import datetime
from ..configs.db_config import Base
from .enum import UserRoleEnum


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)

    # Sử dụng Enum, lưu dưới dạng VARCHAR(20) trong DB
    role: Mapped[UserRoleEnum] = mapped_column(
        SQLEnum(UserRoleEnum, native_enum=False, length=20),
        default=UserRoleEnum.EMPLOYEE,
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Mối quan hệ
    forms: Mapped[list["Form"]] = relationship(back_populates="owner", cascade="all, delete-orphan")
    submissions: Mapped[list["Submission"]] = relationship(back_populates="submitter")