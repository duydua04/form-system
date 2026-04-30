from sqlalchemy import String, Integer, Boolean, ForeignKey, CheckConstraint, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB
from typing import Any
from ..configs.db_config import Base
from .enum import FieldTypeEnum


class Field(Base):
    __tablename__ = "fields"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    form_id: Mapped[int] = mapped_column(ForeignKey("forms.id", ondelete="CASCADE"), nullable=False, index=True)
    label: Mapped[str] = mapped_column(String(255), nullable=False)

    field_type: Mapped[FieldTypeEnum] = mapped_column(
        SQLEnum(FieldTypeEnum, native_enum=False, length=50),
        nullable=False
    )

    display_order: Mapped[int] = mapped_column(Integer, server_default="0", nullable=False)
    is_required: Mapped[bool] = mapped_column(Boolean, server_default="false", nullable=False)

    options: Mapped[Any | None] = mapped_column(JSONB)

    form: Mapped["Form"] = relationship(back_populates="fields")

    __table_args__ = (
        CheckConstraint(
            "(field_type = 'select' AND options IS NOT NULL) OR (field_type != 'select' AND options IS NULL)",
            name="check_options_logic"
        ),
    )