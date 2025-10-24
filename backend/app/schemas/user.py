from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class UserSchema(BaseModel):
    id: str
    username: str
    email: str
    emailVerified: bool
    imageUrl: str | None
    lastActivityDate: datetime

class UserResponse(BaseModel):
    user: UserSchema

    class Config:
        from_attributes = True

class UserRequest(BaseModel):
    email: str
    username: str 
    imageUrl: Optional[str] = None