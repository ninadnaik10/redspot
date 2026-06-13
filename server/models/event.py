from pydantic import BaseModel, Field, field_validator
from typing import Optional, Any
from datetime import datetime


class ClickEvent(BaseModel):
    event_type: str = Field(default="click", description="Type of event")
    url: str = Field(description="Full URL where event occurred")
    path: str = Field(description="URL path")
    timestamp: str = Field(description="ISO timestamp of event")

    click_x: int = Field(description="X coordinate relative to document")
    click_y: int = Field(description="Y coordinate relative to document")

    screen_width: int = Field(description="Browser window width")
    screen_height: int = Field(description="Browser window height")
    doc_width: int = Field(description="Document scroll width")
    doc_height: int = Field(description="Document scroll height")

    target_tag: Optional[str] = Field(default=None, description="Target element tag")
    target_id: Optional[str] = Field(default=None, description="Target element ID")
    target_class: Optional[str] = Field(default=None, description="Target element classes")
    target_text: Optional[str] = Field(default=None, description="Target element text")

    @field_validator('timestamp')
    @classmethod
    def validate_timestamp(cls, v):
        if isinstance(v, str):
            return v
        return str(v)


class HealthResponse(BaseModel):
    status: str
    timestamp: str
    version: Optional[str] = None


class EventResponse(BaseModel):
    ok: bool
    message: Optional[str] = None