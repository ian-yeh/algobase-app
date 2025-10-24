# https://dbdiagram.io/
# run: uvicorn app.main:app --reload

from fastapi import FastAPI
import uvicorn

from app.routers.user import router as user_router
from app.routers.solve import router as solve_router

app = FastAPI()

# include routers
app.include_router(user_router)
app.include_router(solve_router)

@app.get("/")
def health_check():
    return {"status": "200"}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)