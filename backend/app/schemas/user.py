from pydantic import BaseModel
from datetime import datetime

class User(BaseModel):
    id: int
    username: str
    email: str
    emailVerified: bool
    image: str | None
    lastActivityDate: datetime