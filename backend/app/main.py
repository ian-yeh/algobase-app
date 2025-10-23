# https://dbdiagram.io/
# run: uvicorn app.main:app --reload

from app.core.config import SessionLocal 
from fastapi import FastAPI, Depends, Query
import uvicorn
from datetime import datetime

from app.schemas.user import UserRequest, UserResponse 
from app.models.user import User
from app.schemas.solve import SolveRequest, SolveResponse, SolveGetResponse
from app.models.solve import Solve

app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"status": "200"}

@app.post("/user", response_model=UserResponse)
def create_user(req: UserRequest, db = Depends(get_db)):
    #print(req.user_id)
    user = db.query(User).filter(User.id == req.user_id).first()

    if user:
        user.lastActivityDate = datetime.now()
        db.commit()
        db.refresh(user)

    else:
        # Create new user object for new user
        user = User(
            id=req.user_id,
            username=req.username,
            email=req.email,
            emailVerified=False,
            imageUrl=req.imageUrl,
            lastActivityDate=datetime.now(),
        )

        # Adding user to database
        db.add(user)
        db.commit()
        db.refresh(user)

    return {"user": user}

@app.put("/user", response_model=UserResponse)
def update_user(req: UserRequest, db = Depends(get_db)):
    user = db.query(User).filter(User.id == req.user_id).first()

    if not user:
        raise Exception("User not found")

    user.username=req.username
    user.email=req.email
    user.imageUrl=req.imageUrl
    user.lastActivityDate=datetime.now()

    db.commit()
    db.refresh(user)

    return {"user": user}

@app.post("/solve", response_model=SolveResponse)
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

# Get all solves by user's id
@app.get("/solve", response_model=SolveGetResponse)
def get_solve(user_id: str = Query(...), db = Depends(get_db)):
    print("user_id:", user_id)

    solves = db.query(Solve).filter(Solve.user_id == user_id).all()

    print("solves:", solves)
    return {"solves": solves}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)