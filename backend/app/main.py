# https://dbdiagram.io/

from core.config import SessionLocal 
from fastapi import FastAPI, Depends
import uvicorn
from pydantic import BaseModel
from datetime import datetime

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

class UserRequest(BaseModel):
    user_id: str

@app.post("/user")
def create_user(req: UserRequest, db = Depends(get_db)):
    print(req.user_id)

    user = db.query("users").filter("id" == req.user_id).first()
    print(user)

    # Build a full user dict that matches the User schema
    user_obj = {
        "id": req.user_id,
        "username": "testuser",
        "email": "ianyeh7@gmail.com",
        "emailVerified": False,
        "image": None,
        "lastActivityDate": datetime.now()
    }

    return {"user": user_obj}


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)