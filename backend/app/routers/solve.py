from fastapi import APIRouter, Depends
from app.schemas.solve import SolveGetResponse, SolveRequest, SolveResponse
from app.models.solve import Solve
from app.core.config import get_db
from app.core.auth import get_current_user

from datetime import datetime

router = APIRouter()

# Get all solves by user's id
@router.get("/solve", response_model=SolveGetResponse)
def get_solve(
    current_user: dict = Depends(get_current_user),  # ← Add this parameter
    db = Depends(get_db)
):
    user_id = current_user["user_id"]

    solves = db.query(Solve).filter(Solve.user_id == user_id).all()

    print("solves:", solves)
    return {"solves": solves}

@router.post("/solve", response_model=SolveResponse)
def create_solve(
    req: SolveRequest,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    user_id = current_user["user_id"]

    # Create new solve object
    solve = Solve(
        user_id=user_id,
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

