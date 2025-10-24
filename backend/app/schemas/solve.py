from pydantic import BaseModel
from datetime import datetime

class Solve(BaseModel):
    id: int
    cube_type: str
    time: int # stored in centiseconds
    scramble: str
    dnf: bool
    createdAt: datetime

class SolveResponse(BaseModel):
    solve: Solve

    class Config:
        from_attributes = True

class SolveRequest(BaseModel):
    cube_type: str
    time: int # stored in centiseconds
    scramble: str
    dnf: bool

class SolveGetRequest(BaseModel):
    pass

class SolveGetResponse(BaseModel):
    solves: list[Solve] = []

    class Config:
        from_attributes = True