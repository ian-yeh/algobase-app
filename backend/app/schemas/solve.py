from pydantic import BaseModel
from datetime import datetime

class SolveSchema(BaseModel):
    id: int
    cube_type: str
    time: int # stored in centiseconds
    scramble: str
    dnf: bool
    createdAt: datetime

class SolveRequest(BaseModel):
    cube_type: str
    time: int # stored in centiseconds
    scramble: str
    dnf: bool

class StatsSchema(BaseModel):
    best_ao5: int
    best_ao12: int
    best_ao100: int
    best_time: int
    total_solves: int