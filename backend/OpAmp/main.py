from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

# Create an APIRouter instead of a standalone FastAPI app
router = APIRouter()

class OpAmpRequest(BaseModel):
    config: str = Field("inverting", description="Op-amp configuration ('inverting' or 'non-inverting')")
    vin: float = Field(..., description="Input signal voltage in Volts")
    r1: float = Field(..., gt=0, description="Input resistance R1 in kΩ (must be strictly > 0)")
    rf: float = Field(..., ge=0, description="Feedback resistance Rf in kΩ (must be >= 0)")
    vcc: float = Field(default=12.0, gt=0, description="DC supply rail voltage in Volts (must be > 0)")


@router.get("/")
def root():
    return {
        "message": "Op-Amp Virtual Laboratory API",
        "status": "running",
        "version": "2.0.0"
    }


@router.get("/health")
def health():
    return {
        "status": "ok",
        "experiment": "Op-Amp"
    }


@router.post("/simulate")
async def simulate_opamp(data: OpAmpRequest):
    # Defense-in-depth check for non-positive input resistance
    if data.r1 <= 0:
        raise HTTPException(
            status_code=422,
            detail="Input resistance 'r1' must be strictly greater than 0 to prevent division by zero."
        )

    cfg = data.config.strip().lower()
    if cfg == "inverting":
        gain = -(data.rf / data.r1)
    elif cfg in ("non-inverting", "non_inverting", "noninverting"):
        gain = 1.0 + (data.rf / data.r1)
    else:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid configuration '{data.config}'. Supported modes are 'inverting' and 'non-inverting'."
        )

    vout_raw = gain * data.vin

    is_saturated = False
    vout = vout_raw
    if vout > data.vcc:
        vout = data.vcc
        is_saturated = True
    elif vout < -data.vcc:
        vout = -data.vcc
        is_saturated = True

    return {
        "status": "success",
        "results": {
            "voltage_gain": round(gain, 2),
            "output_voltage": round(vout, 2),
            "is_saturated": is_saturated,
            "supply_rail": data.vcc
        }
    }