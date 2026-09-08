from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 1. Import the routers (Commented out the missing folders)
from hysteresis.main import router as hysteresis_router
from impulsemomentum.main import router as impulse_router
from vibrationstring.main import router as string_router
from Rc.main import router as rc_router
from edm.main import router as edm_router
from OpAmp.main import router as opamp_router


app = FastAPI(title="Hexascale Master Backend")

# 2. Allow your React frontend to communicate with it
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
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


# 4. A quick health check
@app.get("/")
def health_check():
    return {"status": "Master Server is Running and Ready!"}
