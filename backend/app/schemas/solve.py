from pydantic import BaseModel
from datetime import datetime

class Solve(BaseModel):
    id: int
    user_id: int
    time: int # stored in centiseconds
    scramble: str
    dnf: bool
    plusTwo: bool
    createdAt: datetime
    updatedAt: datetime
