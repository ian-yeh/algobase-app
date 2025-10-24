from fastapi import APIRouter, Depends, Query
from app.schemas.solve import SolveGetResponse, SolveRequest, SolveResponse
from app.models.solve import Solve
from app.core.config import get_db

from datetime import datetime

router = APIRouter()

# Get all solves by user's id
@router.get("/solve", response_model=SolveGetResponse)
def get_solve(user_id: str = Query(...), db = Depends(get_db)):
    print("user_id:", user_id)

    solves = db.query(Solve).filter(Solve.user_id == user_id).all()

    print("solves:", solves)
    return {"solves": solves}

@router.post("/solve", response_model=SolveResponse)
def create_solve(req: SolveRequest, db = Depends(get_db)):
    # Create new solve object
    solve = Solve(
        user_id=req.user_id,
        time=req.time,
        cube_type=req.cube_type,
        scramble=req.scramble,
        dnf=req.dnf,
        createdAt=datetime.now(),
    )

    # Adding solve to database
    db.add(solve)
    db.commit()
    db.refresh(solve)

    return {"solve": solve}

