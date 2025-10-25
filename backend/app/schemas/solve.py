from pydantic import BaseModel
from datetime import datetime

class SolveSchema(BaseModel):
    id: int
    cube_type: str
    time: float
    scramble: str
    dnf: bool
    createdAt: datetime

class SolveRequest(BaseModel):
    cube_type: str
    time: float
    scramble: str
    dnf: bool

class StatsSchema(BaseModel):
    best_ao5: float
    best_ao12: float
    best_ao100: float
    best_time: float
    total_solves: int