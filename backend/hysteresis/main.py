from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
import numpy as np

router = APIRouter()

class HysteresisInput(BaseModel):
    max_H: float = Field(default=1000.0, ge=0.0, le=100000.0, description="Peak magnetic field intensity in A/m (must be >= 0)")
    points: int = Field(default=1000, ge=20, le=10000, description="Number of trajectory discretization points")
    frequency: float = Field(default=50.0, gt=0.0, le=5000.0, description="AC excitation frequency in Hz (must be > 0)")
    volume: float = Field(default=0.001, gt=0.0, description="Magnetic core volume in m³ (must be > 0)")


@router.get("/")
def root():
    return {
        "message": "Hysteresis Loss Virtual Lab API",
        "status": "running",
        "version": "2.0.0",
        "docs": "/docs"
    }


@router.get("/health")
def health():
    return {
        "status": "ok",
        "experiment": "Hysteresis"
    }


@router.post("/simulate")
def simulate(data: HysteresisInput):
    try:
        Hmax = float(data.max_H)
        n = int(data.points)
        freq = float(data.frequency)
        vol = float(data.volume)

        # -------------------------------------------------------------
        # Physical Zero-Field State (Hmax == 0)
        # Prevents 0/0 NaN division, RuntimeWarnings, and metric corruption
        # -------------------------------------------------------------
        if Hmax <= 0.0:
            zeros_list = [0.0] * n
            return {
                "parameters": {
                    "max_H": 0.0,
                    "points": n,
                    "frequency": freq,
                    "volume": vol,
                },
                "curve": {
                    "H": zeros_list,
                    "B": zeros_list,
                },
                "results": {
                    "loop_area": 0.0,
                    "loss_per_cycle": 0.0,
                    "power_loss": 0.0,
                    "max_B": 0.0,
                    "min_B": 0.0,
                    "coercive_field": 0.0,
                    "remanence": 0.0,
                }
            }

        # Generate magnetic field cycle
        theta = np.linspace(0, 2 * np.pi, n)
        H = Hmax * np.sin(theta)

        # Educational hysteresis model
        Bs = 1.5
        Br = 0.75

        # Safe normalized ratio: H / Hmax is numerically bounded to [-1.0, 1.0]
        # Since H = Hmax * sin(theta), H / Hmax is strictly sin(theta)
        norm_ratio = np.sin(theta)
        B = (
            Bs * np.tanh(2.2 * norm_ratio)
            + Br * np.cos(theta)
        )
        B = B * 0.75

        # Sanitize against any potential NaN/Inf
        B = np.nan_to_num(B, nan=0.0, posinf=Bs, neginf=-Bs)
        H = np.nan_to_num(H, nan=0.0, posinf=Hmax, neginf=-Hmax)

        # Calculate B-H loop area (supports both NumPy 2.x np.trapezoid and NumPy 1.x np.trapz)
        trapz_fn = getattr(np, "trapezoid", getattr(np, "trapz", None))
        if trapz_fn:
            area = abs(float(trapz_fn(B, H)))
        else:
            # Fallback manual trapezoidal integration
            area = abs(float(np.sum(0.5 * (B[:-1] + B[1:]) * np.diff(H))))

        loss_per_cycle = area
        power_loss = loss_per_cycle * freq * vol

        max_B = float(np.max(B))
        min_B = float(np.min(B))

        # Approximate coercive field (H when B crosses zero)
        positive_indices = np.where(H >= 0)[0]
        if len(positive_indices) > 0:
            idx = positive_indices[np.argmin(np.abs(B[positive_indices]))]
            coercive_field = abs(float(H[idx]))
        else:
            coercive_field = 0.0

        # Approximate remanence (B when H crosses zero)
        zero_idx = np.argmin(np.abs(H))
        remanence = abs(float(B[zero_idx]))

        return {
            "parameters": {
                "max_H": Hmax,
                "points": n,
                "frequency": freq,
                "volume": vol,
            },
            "curve": {
                "H": H.tolist(),
                "B": B.tolist(),
            },
            "results": {
                "loop_area": round(area, 4),
                "loss_per_cycle": round(loss_per_cycle, 4),
                "power_loss": round(power_loss, 4),
                "max_B": round(max_B, 4),
                "min_B": round(min_B, 4),
                "coercive_field": round(coercive_field, 4),
                "remanence": round(remanence, 4),
            }
        }

    except Exception as e:
        print("SIMULATION ERROR:", repr(e))
        raise HTTPException(status_code=500, detail=f"Simulation computation error: {str(e)}")