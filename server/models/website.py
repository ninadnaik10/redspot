from sqlalchemy import String, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
import uuid

from .user import Base


def _generate_site_id() -> str:
    return f"w_{uuid.uuid4()}"


class Website(Base):
    __tablename__ = "websites"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    site_id: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False, default=_generate_site_id)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    url: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())