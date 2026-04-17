import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.api import router as api_router
from services.data_loader import data_store
from services.model_loader import model_loader


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[Backend] Loading data store...")
    data_store.load()
    print("[Backend] Ready.")
    yield
    print("[Backend] Shutting down.")


app = FastAPI(
    title="VISIONGUARD: Mengungkap Kegagalan Persepsi Model Deteksi pada Kendaraan Otonom dengan Explainable AI",
    version="1.0.0",
    lifespan=lifespan,
)

allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]

print(f"[Backend] Allowed origins: {allowed_origins}")
print(f"[Backend] API URL: {os.getenv('NEXT_PUBLIC_API_KEY')}")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "images_loaded": data_store.total_images,
        "objects_loaded": data_store.total_objects,
    }


@app.get("/models/status")
async def model_status():
    return model_loader.get_status()
