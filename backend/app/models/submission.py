from sqlalchemy import Integer, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import JSONB
from typing import Any
from datetime import datetime
from ..configs.db_config import Base


class Submission(Base):
    __tablename__ = "form_submissions"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    form_id: Mapped[int] = mapped_column(ForeignKey("forms.id", ondelete="CASCADE"), nullable=False, index=True)
    submitter_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))

    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    answers: Mapped[Any] = mapped_column(JSONB, nullable=False)

    form: Mapped["Form"] = relationship(back_populates="submissions")
    submitter: Mapped["User"] = relationship(back_populates="submissions")