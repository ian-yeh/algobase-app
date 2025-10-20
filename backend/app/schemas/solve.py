from pydantic import BaseModel
from datetime import datetime

class Solve(BaseModel):
    id: int
    user_id: str
    time: int # stored in centiseconds
    scramble: str
    dnf: bool
    plusTwo: bool
    createdAt: datetime
    updatedAt: datetime

class SolveResponese(BaseModel):
    solve: Solve

    class Config:
        from_attributes = True