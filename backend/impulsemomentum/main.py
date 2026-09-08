from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
import numpy as np

# Create the router instead of the FastAPI app
router = APIRouter()

# ---------------------------------------------------------
# Request Models
# ---------------------------------------------------------
class ImpulseSimulationRequest(BaseModel):
    mass: float = Field(..., gt=0, description="Mass of the object in kilograms")
    initial_velocity: float = Field(..., description="Initial velocity (v_i) in m/s")
    final_velocity: Optional[float] = Field(None, description="Final velocity (v_f) in m/s")
    force: Optional[float] = Field(None, description="Average applied force (F) in Newtons")
    time_interval: Optional[float] = Field(None, gt=0, description="Impact duration (dt) in seconds")
    label: Optional[str] = Field("Trial", description="Optional trial identifier")
    time_points: int = Field(50, ge=10, le=500, description="Number of trajectory time points")

class CollisionRequest(BaseModel):
    mass_1: float = Field(..., gt=0, description="Mass of Object 1 in kg")
    initial_velocity_1: float = Field(..., description="Initial velocity of Object 1 in m/s")
    mass_2: float = Field(..., gt=0, description="Mass of Object 2 in kg")
    initial_velocity_2: float = Field(..., description="Initial velocity of Object 2 in m/s")
    restitution_coefficient: float = Field(1.0, ge=0.0, le=1.0, description="Coefficient of restitution e (0 = inelastic, 1 = elastic)")

# ---------------------------------------------------------
# Endpoints
# ---------------------------------------------------------
@router.post("/simulate")
def simulate_impulse(params: ImpulseSimulationRequest):
    m = params.mass
    vi = params.initial_velocity
    vf = params.final_velocity
    f = params.force
    dt = params.time_interval

    # Validation: Ensure either vf OR (force AND time_interval) is provided
    if vf is None and (f is None or dt is None):
        raise HTTPException(
            status_code=400,
            detail="Provide either 'final_velocity' or both 'force' and 'time_interval'."
        )

    p_initial = m * vi

    # Solve kinematics & impulse
    if vf is not None and dt is not None:
        duration = dt
        p_final = m * vf
        impulse = p_final - p_initial
        avg_force = impulse / duration if duration > 0 else 0.0
    elif f is not None and dt is not None:
        duration = dt
        avg_force = f
        impulse = avg_force * duration
        p_final = p_initial + impulse
        vf = p_final / m
    else:
        duration = 1.0  # Default normalization window
        p_final = m * vf
        impulse = p_final - p_initial
        avg_force = impulse / duration

    delta_v = vf - vi
    acceleration = avg_force / m

    # Energy calculations
    ke_initial = 0.5 * m * (vi ** 2)
    ke_final = 0.5 * m * (vf ** 2)
    delta_ke = ke_final - ke_initial

    # Vectorized trajectory array generation
    time_series = np.linspace(0, duration, params.time_points)
    velocity_series = vi + acceleration * time_series
    momentum_series = m * velocity_series
    position_series = (vi * time_series) + (0.5 * acceleration * (time_series ** 2))
    force_series = np.full_like(time_series, avg_force)

    return {
        "success": True,
        "label": params.label,
        "parameters": {
            "mass_kg": m,
            "initial_velocity_m_per_s": vi,
            "final_velocity_m_per_s": float(np.round(vf, 4)),
            "applied_force_N": float(np.round(avg_force, 4)),
            "duration_s": float(np.round(duration, 4))
        },
        "physics": {
            "initial_momentum_kg_m_per_s": float(np.round(p_initial, 4)),
            "final_momentum_kg_m_per_s": float(np.round(p_final, 4)),
            "delta_momentum_kg_m_per_s": float(np.round(impulse, 4)),
            "impulse_N_s": float(np.round(impulse, 4)),
            "delta_velocity_m_per_s": float(np.round(delta_v, 4)),
            "acceleration_m_per_s2": float(np.round(acceleration, 4)),
            "initial_kinetic_energy_J": float(np.round(ke_initial, 4)),
            "final_kinetic_energy_J": float(np.round(ke_final, 4)),
            "delta_kinetic_energy_J": float(np.round(delta_ke, 4))
        },
        "trajectory": {
            "time_s": time_series.round(4).tolist(),
            "velocity_m_per_s": velocity_series.round(4).tolist(),
            "momentum_kg_m_per_s": momentum_series.round(4).tolist(),
            "position_m": position_series.round(4).tolist(),
            "force_N": force_series.round(4).tolist()
        }
    }

@router.post("/collision")
def simulate_collision(params: CollisionRequest):
    m1, m2 = params.mass_1, params.mass_2
    u1, u2 = params.initial_velocity_1, params.initial_velocity_2
    e = params.restitution_coefficient

    # 1D Collision Mechanics using restitution coefficient
    # v1 = (m1*u1 + m2*u2 - m2*e*(u1 - u2)) / (m1 + m2)
    # v2 = (m1*u1 + m2*u2 + m1*e*(u1 - u2)) / (m1 + m2)
    total_mass = m1 + m2
    v1 = ((m1 - e * m2) * u1 + (1 + e) * m2 * u2) / total_mass
    v2 = ((1 + e) * m1 * u1 + (m2 - e * m1) * u2) / total_mass

    p_initial_total = (m1 * u1) + (m2 * u2)
    p_final_total = (m1 * v1) + (m2 * v2)

    impulse_on_1 = m1 * (v1 - u1)
    impulse_on_2 = m2 * (v2 - u2)

    ke_initial_total = 0.5 * m1 * (u1 ** 2) + 0.5 * m2 * (u2 ** 2)
    ke_final_total = 0.5 * m1 * (v1 ** 2) + 0.5 * m2 * (v2 ** 2)
    energy_loss = ke_initial_total - ke_final_total

    return {
        "success": True,
        "restitution_coefficient": e,
        "object_1": {
            "mass_kg": m1,
            "initial_velocity_m_per_s": u1,
            "final_velocity_m_per_s": float(np.round(v1, 4)),
            "impulse_N_s": float(np.round(impulse_on_1, 4))
        },
        "object_2": {
            "mass_kg": m2,
            "initial_velocity_m_per_s": u2,
            "final_velocity_m_per_s": float(np.round(v2, 4)),
            "impulse_N_s": float(np.round(impulse_on_2, 4))
        },
        "system": {
            "total_initial_momentum": float(np.round(p_initial_total, 4)),
            "total_final_momentum": float(np.round(p_final_total, 4)),
            "initial_kinetic_energy_J": float(np.round(ke_initial_total, 4)),
            "final_kinetic_energy_J": float(np.round(ke_final_total, 4)),
            "kinetic_energy_loss_J": float(np.round(energy_loss, 4))
        }
    }

@router.get("/")
def root():
    return {"project": "VAIL", "module": "Impulse-Momentum Theorem", "status": "running"}

@router.get("/health")
def health():
    return {"status": "healthy"}