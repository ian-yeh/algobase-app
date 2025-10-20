# https://dbdiagram.io/
# run: uvicorn app.main:app --reload

from app.core.config import SessionLocal 
from fastapi import FastAPI, Depends
import uvicorn
from datetime import datetime

from app.schemas.user import UserRequest, UserResponse 
from app.models.user import User

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
def create_user(req: UserRequest, db = Depends(get_db)) -> UserResponse:
    print(req.user_id)

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
            imageUrl=req.user.image,
            lastActivityDate=datetime.now()
        )

        # Adding user to database
        db.add(user)
        db.commit()
        db.refresh(user)

    return {"user": user}


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)