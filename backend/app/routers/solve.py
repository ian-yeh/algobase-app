from fastapi import APIRouter, Depends

from app.core.config import get_db
from app.core.auth import get_current_user
from app.models.solve import SolveModel
from app.schemas.solve import SolveRequest, SolveSchema, StatsSchema
from app.services.solve_service import SolveService

from datetime import datetime

router = APIRouter()

# Get all solves by user's id
@router.get("/solve", response_model=list[SolveSchema])
def get_solve(
    current_user: dict = Depends(get_current_user),  # ← Add this parameter
    db = Depends(get_db)
):
    user_id = current_user["user_id"]

    solves = db.query(SolveModel).filter(SolveModel.user_id == user_id).all()

    print("solves:", solves)
    return solves

@router.post("/solve", response_model=SolveSchema)
def create_solve(
    req: SolveRequest,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    user_id = current_user["user_id"]

    # Create new solve object
    solve = SolveModel(
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

    return solve

@router.get("/stats", response_model=StatsSchema)
def get_stats(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    user_id = current_user["user_id"]

    # getting all of the solves
    solves = db.query(SolveModel).filter(SolveModel.user_id == user_id).all()

    stat_calculator = SolveService()

    stats = {
        "best_ao5": 11,
        "best_ao12": 13,
        "best_ao100": 1,
        "best_time": stat_calculator.get_best_time([1, 2, 3, 4, 5, 6]),
        "total_solves": len(solves)
    }

    return stats

