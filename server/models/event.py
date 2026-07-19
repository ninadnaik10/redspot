from pydantic import BaseModel, Field, field_validator
from typing import Optional

class ClickEvent(BaseModel):
    event_type: str = Field(default="click", description="Type of event")
    site_id: str = Field(description="Website site ID")
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


class UserCreate(BaseModel):
    name: str
    email: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    created_at: str
    updated_at: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    timestamp: str
    version: Optional[str] = None


class EventResponse(BaseModel):
    ok: bool
    message: Optional[str] = None


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str = Field(min_length=8)


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class WebsiteCreate(BaseModel):
    name: str
    url: str


class WebsiteResponse(BaseModel):
    id: str
    site_id: str
    name: str
    url: str
    created_at: str
