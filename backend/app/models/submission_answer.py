from sqlalchemy import ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from datetime import datetime
from ..configs.db_config import Base


class Submission(Base):
    __tablename__ = "form_submissions"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    form_id: Mapped[int] = mapped_column(ForeignKey("forms.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    form: Mapped["Form"] = relationship(back_populates="submissions")
    user: Mapped["User"] = relationship(back_populates="submissions")
    answers: Mapped[list["SubmissionAnswer"]] = relationship(back_populates="submission", cascade="all, delete-orphan")