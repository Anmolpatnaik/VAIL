from fastapi import APIRouter
from pydantic import BaseModel, Field
import numpy as np

router = APIRouter()

class HysteresisInput(BaseModel):
    max_H: float = 1000.0
    points: int = 1000
    frequency: float = 50.0
    volume: float = 0.001
    
@router.get("/")
def root():
    return {
        "message": "Hysteresis Loss API is running",
        "docs": "/docs"
    }


@router.get("/health")
def health():
    return {"status": "ok"}


@router.post("/simulate")
def simulate(data: HysteresisInput):
    try:
        Hmax = data.max_H
        n = data.points

        # Generate magnetic field cycle
        theta = np.linspace(0, 2 * np.pi, n)

        H = Hmax * np.sin(theta)

        # Educational hysteresis model
        Bs = 1.5
        Br = 0.75

        B = (
            Bs * np.tanh(2.2 * H / Hmax)
            + Br * np.cos(theta)
        )

        B = B * 0.75

        # Calculate B-H loop area
        area = abs(np.trapezoid(B, H))

        loss_per_cycle = area

        power_loss = (
            loss_per_cycle
            * data.frequency
            * data.volume
        )

        max_B = float(np.max(B))
        min_B = float(np.min(B))

        # Approximate coercive field
        positive_indices = np.where(H >= 0)[0]

        if len(positive_indices) > 0:
            idx = positive_indices[
                np.argmin(
                    np.abs(B[positive_indices])
                )
            ]

            coercive_field = abs(float(H[idx]))
        else:
            coercive_field = 0.0

        # Approximate remanence
        zero_idx = np.argmin(np.abs(H))
        remanence = abs(float(B[zero_idx]))

        return {
            "parameters": {
                "max_H": data.max_H,
                "points": data.points,
                "frequency": data.frequency,
                "volume": data.volume,
            },

            "curve": {
                "H": H.tolist(),
                "B": B.tolist(),
            },

            "results": {
                "loop_area": float(area),
                "loss_per_cycle": float(loss_per_cycle),
                "power_loss": float(power_loss),
                "max_B": max_B,
                "min_B": min_B,
                "coercive_field": coercive_field,
                "remanence": remanence,
            }
        }

    except Exception as e:
        print("SIMULATION ERROR:", repr(e))
        raise