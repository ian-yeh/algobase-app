# app/core/auth.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from jose import JWTError, jwt
import os

# Get this from Supabase Dashboard → Settings → API → JWT Secret
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
security = HTTPBearer()

async def get_current_user(credentials = Depends(security)) -> dict:
    """
    Verify JWT that SUPABASE created and extract user info.
    """
    try:
        # Decode JWT that Supabase created
        payload = jwt.decode(
            credentials.credentials,  # ← JWT from Supabase
            SUPABASE_JWT_SECRET,      # ← Secret to verify signature
            algorithms=["HS256"],
            audience="authenticated"
        )
        
        # Extract user info that Supabase put in the JWT
        return {
            "user_id": payload["sub"],  # ← Supabase added this
            "email": payload.get("email"),  # ← Supabase added this
            "email_verified": payload.get("email_confirmed_at") is not None,
        }
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )