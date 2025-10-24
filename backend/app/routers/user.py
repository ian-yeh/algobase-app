from fastapi import APIRouter, Depends 
from app.schemas.user import UserRequest, UserResponse
from app.models.user import User
from app.core.config import get_db 
from app.core.auth import get_current_user

from datetime import datetime

router = APIRouter()

@router.post("/user", response_model=UserResponse)
def check_user(
    req: UserRequest, 
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    user_id = current_user["user_id"]
    user = db.query(User).filter(User.id == user_id).first()

    if user:
        user.lastActivityDate = datetime.now()
        db.commit()
        db.refresh(user)

    else:
        # Create new user object for new user
        user = User(
            id=user_id,
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

@router.put("/user", response_model=UserResponse)
def update_user(
    req: UserRequest, 
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    user_id = current_user["user_id"]
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise Exception("User not found")

    user.username=req.username
    user.email=req.email
    user.imageUrl=req.imageUrl
    user.lastActivityDate=datetime.now()

    db.commit()
    db.refresh(user)

    return {"user": user}
