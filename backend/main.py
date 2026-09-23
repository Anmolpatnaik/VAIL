import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 1. Import the routers
from hysteresis.main import router as hysteresis_router
from impulsemomentum.main import router as impulse_router
from vibrationstring.main import router as string_router
from Rc.main import router as rc_router
from edm.main import router as edm_router
from OpAmp.main import router as opamp_router

# VAIL 2.0 Engine
from engine.experiment_registry import router as registry_router
from engine.assistant import router as assistant_router
from engine.draft_generator import router as draft_router

app = FastAPI(title="VAIL 2.0 — Virtual Engineering Laboratory Engine")

# 2. CORS configuration for production and development
allowed_origins_env = os.getenv("ALLOWED_ORIGINS")
if allowed_origins_env:
    origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# 3. Attach the available experiments
app.include_router(hysteresis_router, prefix="/api/hysteresis", tags=["Hysteresis"])
app.include_router(impulse_router, prefix="/api/impulse", tags=["Impulse Momentum"])
app.include_router(string_router, prefix="/api/string", tags=["Vibration String"])
app.include_router(rc_router, prefix="/api/rc", tags=["RC Circuit"])
app.include_router(edm_router, prefix="/api/edm", tags=["EDM"])
app.include_router(opamp_router, prefix="/api/opamp", tags=["Op-Amp"])

# VAIL 2.0 Engine Registry, AI Assistant & Generative Drafts
app.include_router(registry_router, prefix="/api/experiments", tags=["Experiment Registry"])
app.include_router(assistant_router, prefix="/api/assistant", tags=["AI Assistant"])
app.include_router(draft_router, prefix="/api/draft", tags=["Generative Lab Synthesizer"])


# 4. Health checks
@app.get("/")
@app.get("/api")
def root():
    return {"status": "Master Server is Running and Ready!", "version": "1.0.0"}

@app.get("/health")
@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "vail-backend"}
