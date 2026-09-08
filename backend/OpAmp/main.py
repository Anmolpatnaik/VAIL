from fastapi import APIRouter
from pydantic import BaseModel

# Create an APIRouter instead of a standalone FastAPI app
router = APIRouter()

class OpAmpRequest(BaseModel):
    config: str  # "inverting" or "non-inverting"
    vin: float
    r1: float
    rf: float
    vcc: float = 12.0

@router.post("/simulate")
async def simulate_opamp(data: OpAmpRequest):
    if data.config == "inverting":
        gain = - (data.rf / data.r1)
    else:
        gain = 1.0 + (data.rf / data.r1)
    
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