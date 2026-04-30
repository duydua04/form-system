from sqlalchemy import String, Text, Integer, ForeignKey, DateTime, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from datetime import datetime
from ..configs.db_config import Base
from .enums import FormStatusEnum


class Form(Base):
    __tablename__ = "forms"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    admin_id: Mapped[int] = mapped_column(ForeignKey("admins.id", ondelete="CASCADE"), nullable=False, index=True)

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    display_order: Mapped[int] = mapped_column(Integer, server_default="0", nullable=False)

    status: Mapped[FormStatusEnum] = mapped_column(
        SQLEnum(FormStatusEnum, native_enum=False, length=20),
        default=FormStatusEnum.DRAFT,
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    # Relationship
    admin: Mapped["Admin"] = relationship(back_populates="forms")
    fields: Mapped[list["Field"]] = relationship(back_populates="form", cascade="all, delete-orphan")
    submissions: Mapped[list["Submission"]] = relationship(back_populates="form", cascade="all, delete-orphan")