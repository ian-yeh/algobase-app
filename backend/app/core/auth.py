# app/core/auth.py
from fastapi import Request, HTTPException, status

async def get_current_user(request: Request) -> dict:
    """
    Extract user info from X-User-ID header.
    In a production app, this should be replaced with proper JWT verification.
    """
    user_id = request.headers.get("X-User-ID")
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="X-User-ID header missing"
        )
    
    return {
        "user_id": user_id,
        "email": request.headers.get("X-User-Email"),  # Optional: pass email in header too
    }