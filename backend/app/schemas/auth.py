import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, computed_field


class UserRegister(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_-]+$")
    password: str = Field(..., min_length=6, max_length=128)


class UserLogin(BaseModel):
    email_or_username: str
    password: str


class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    username: str
    created_at: datetime
    last_login: Optional[datetime] = None

    model_config = {"from_attributes": True}

    @computed_field
    @property
    def is_admin(self) -> bool:
        return self.email.strip().lower() == "abel@kalayil.com"



class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
