from fastapi import APIRouter, Depends, HTTPException, status

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

    times = [solve.time for solve in solves]

    stats = {
        "best_ao5": stat_calculator.calculate_best_ao5(times),
        "best_ao12": stat_calculator.calculate_best_ao12(times),
        "best_ao100": stat_calculator.calculate_best_ao100(times),
        "best_time": stat_calculator.get_best_time(times),
        "total_solves": len(solves)
    }

    return stats

@router.delete("/solve/{solve_id}")
def delete_solve(
    solve_id: int,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    user_id = current_user["user_id"]
    
    solve = db.query(SolveModel).filter(
        SolveModel.id == solve_id, 
        SolveModel.user_id == user_id
    ).first()
    
    if not solve:
        raise HTTPException(
            status_code=404,
            detail="Solve not found"
        )
    
    db.delete(solve)
    db.commit()
    
    return {"status": "success"}

