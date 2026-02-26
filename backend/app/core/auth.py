# app/core/auth.py
from fastapi import Request, HTTPException, status
import json
import base64

async def get_current_user(request: Request) -> dict:
    """
    Extract user info from Authorization header (Bearer token).
    Decodes the JWT payload to get the user_id (sub).
    """
    auth_header = request.headers.get("Authorization")
    
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing or invalid"
        )
    
    token = auth_header.split(" ")[1]
    
    try:
        # JWT format: header.payload.signature
        # We only need the payload (second part)
        parts = token.split(".")
        if len(parts) < 2:
            raise ValueError("Invalid token format")
            
        payload_b64 = parts[1]
        # Pad with '=' if necessary for base64 decoding
        missing_padding = len(payload_b64) % 4
        if missing_padding:
            payload_b64 += '=' * (4 - missing_padding)
            
        payload_json = base64.b64decode(payload_b64).decode("utf-8")
        payload = json.loads(payload_json)
        
        user_id = payload.get("sub")
        email = payload.get("email")
        
        if not user_id:
            raise ValueError("Token missing 'sub' field")
            
        return {
            "user_id": user_id,
            "email": email,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )