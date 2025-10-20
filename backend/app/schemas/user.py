from pydantic import BaseModel
from datetime import datetime

class User(BaseModel):
    id: str
    username: str
    email: str
    emailVerified: bool
    image: str | None
    lastActivityDate: datetime

class UserResponse(BaseModel):
    user: User

    class Config:
        from_attributes = True

class UserRequest(BaseModel):
    user_id: str
    email: str
    username: str 
    imageUrl: str