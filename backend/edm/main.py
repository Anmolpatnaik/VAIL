from fastapi import APIRouter
from pydantic import BaseModel, Field
import math

router = APIRouter()

class EDMRequest(BaseModel):
    current: float = Field(..., ge=1, le=50, description="Discharge Current in Amps (Max 50)")
    voltage: float = Field(..., ge=40, le=120, description="Gap Voltage in Volts")
    pulse_on: float = Field(..., ge=10, le=500, description="Pulse ON time in microseconds")
    pulse_off: float = Field(..., ge=10, le=500, description="Pulse OFF time in microseconds")
    material: str = Field("Cu-St", description="Tool-Workpiece combination")

@router.post("/simulate")
def simulate_edm(req: EDMRequest):
    # Empirical physics model for EDM Material Removal Rate (MRR)
    # MRR is heavily dependent on Current and Pulse ON time.
    
    # Base MRR calculation (simplified for simulation curves)
    mrr_base = (req.current * 8.5) * (req.voltage / 50.0)
    
    # Pulse efficiency factor
    duty_cycle = req.pulse_on / (req.pulse_on + req.pulse_off)
    mrr_final = mrr_base * duty_cycle
    
    # Surface Roughness (Ra) calculation
    # Roughness increases with higher current and longer pulse ON time
    roughness = 0.25 * math.pow(req.current, 0.3) * math.pow(req.pulse_on, 0.4)
    
    # Cap values based on the physical machine's max specs (350 for Cu-St)
    mrr_final = min(mrr_final, 350.0)
    
    return {
        "experiment": "Electric Discharge Machining",
        "parameters": {
            "current_A": req.current,
            "voltage_V": req.voltage,
            "pulse_on_us": req.pulse_on,
            "pulse_off_us": req.pulse_off
        },
        "results": {
            "mrr_mm3_min": round(mrr_final, 2),
            "surface_roughness_Ra": round(roughness, 3),
            "duty_cycle_percent": round(duty_cycle * 100, 1)
        }
    }