from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.analyze import router as analyze_router

app = FastAPI(
    title="PharmaGuard API",
    version="1.0.0"
)

# Enable CORS for React integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Update to your frontend's deployed URL later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze_router, prefix="/api")

@app.get("/")
def root():
    return {"message": "PharmaGuard Backend Running"}