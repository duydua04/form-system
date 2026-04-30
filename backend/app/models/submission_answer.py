from sqlalchemy import ForeignKey, Text, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..configs.db_config import Base


class SubmissionAnswer(Base):
    __tablename__ = "submission_answers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    submission_id: Mapped[int] = mapped_column(
        ForeignKey("form_submissions.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    field_id: Mapped[int] = mapped_column(
        ForeignKey("fields.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    value: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    # Biến này phải tên là 'submission' để khớp với back_populates="submission" ở class Submission
    submission: Mapped["Submission"] = relationship("Submission", back_populates="answers")

    # Nối với class Field (Giả sử bạn đặt tên class là Field)
    field: Mapped["Field"] = relationship("Field", back_populates="answers")