from fastapi import APIRouter 

router = APIRouter(tags=["auth"])

@router.post("/login")
def login():
    return {"message": "Login endpoint"}

@router.post("/logout")
def logout():
    return {"message": "Logout endpoint"}

@router.post("/register")
def register():
    return {"message": "Register endpoint"}

@router.post("/forgot-password")
def forgot_password():
    return {"message": "Forgot password endpoint"}

@router.post("/reset-password")
def reset_password():
    return {"message": "Reset password endpoint"}

@router.get("/authorize")
def authorize():
    return {"message": "Authorize endpoint"}

@router.get("/callback")
def callback():
    return {"message": "Callback endpoint"}