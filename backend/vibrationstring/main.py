from fastapi import APIRouter
from pydantic import BaseModel, Field
import numpy as np

# Initialize the router instead of the FastAPI app
router = APIRouter()

# ---------------------------------------------------------
# Request Models
# ---------------------------------------------------------
class StringParameters(BaseModel):
    length: float = Field(..., gt=0, description="String length in meters")
    tension: float = Field(..., gt=0, description="String tension in Newtons")
    linear_density: float = Field(..., gt=0, description="Linear mass density in kg/m")
    amplitude: float = Field(0.01, gt=0, description="Initial displacement amplitude in meters")
    mode: int = Field(1, ge=1, description="Vibration mode number")
    duration: float = Field(2.0, gt=0, description="Simulation duration in seconds")
    damping_factor: float = Field(0.0, ge=0.0, description="Damping coefficient (0 for undamped)")
    spatial_points: int = Field(100, ge=20, le=500, description="Number of spatial points")
    time_points: int = Field(200, ge=20, le=1000, description="Number of time points")

class ModeRequest(BaseModel):
    length: float = Field(..., gt=0)
    tension: float = Field(..., gt=0)
    linear_density: float = Field(..., gt=0)
    number_of_modes: int = Field(5, ge=1, le=20)

# ---------------------------------------------------------
# Physics Calculations
# ---------------------------------------------------------
def calculate_wave_speed(tension: float, linear_density: float) -> float:
    return float(np.sqrt(tension / linear_density))

def calculate_frequency(length: float, tension: float, linear_density: float, mode: int) -> float:
    wave_speed = calculate_wave_speed(tension, linear_density)
    return float((mode / (2.0 * length)) * wave_speed)

# ---------------------------------------------------------
# Endpoints
# ---------------------------------------------------------
@router.post("/simulate")
def simulate_string(parameters: StringParameters):
    L = parameters.length
    T = parameters.tension
    mu = parameters.linear_density
    A = parameters.amplitude
    n = parameters.mode
    gamma = parameters.damping_factor

    # Core physics
    wave_speed = calculate_wave_speed(T, mu)
    frequency = calculate_frequency(L, T, mu, n)
    omega = 2.0 * np.pi * frequency

    # Grid generation
    x = np.linspace(0, L, parameters.spatial_points)
    time = np.linspace(0, parameters.duration, parameters.time_points)

    # 2D Vectorized calculation: shape (time_points, spatial_points)
    X = x[np.newaxis, :]       # Shape: (1, spatial_points)
    Time = time[:, np.newaxis] # Shape: (time_points, 1)

    spatial_part = np.sin(n * np.pi * X / L)
    temporal_part = np.cos(omega * Time)
    damping = np.exp(-gamma * Time) if gamma > 0 else 1.0

    displacement = A * spatial_part * temporal_part * damping

    return {
        "success": True,
        "parameters": {
            "length_m": L,
            "tension_N": T,
            "linear_density_kg_per_m": mu,
            "amplitude_m": A,
            "mode": n,
            "duration_s": parameters.duration,
            "damping_factor": gamma
        },
        "physics": {
            "wave_speed_m_per_s": wave_speed,
            "frequency_hz": frequency,
            "angular_frequency_rad_per_s": omega,
            "wavelength_m": 2.0 * L / n
        },
        "data": {
            "x_m": x.tolist(),
            "time_s": time.tolist(),
            "displacement_m": displacement.tolist()
        }
    }

@router.post("/frequency")
def frequency_endpoint(parameters: StringParameters):
    f = calculate_frequency(parameters.length, parameters.tension, parameters.linear_density, parameters.mode)
    wave_speed = calculate_wave_speed(parameters.tension, parameters.linear_density)
    return {
        "success": True,
        "frequency_hz": f,
        "wave_speed_m_per_s": wave_speed,
        "mode": parameters.mode
    }

@router.post("/modes")
def calculate_modes(parameters: ModeRequest):
    wave_speed = calculate_wave_speed(parameters.tension, parameters.linear_density)
    modes = [
        {
            "mode": n,
            "frequency_hz": float((n / (2.0 * parameters.length)) * wave_speed),
            "wavelength_m": float(2.0 * parameters.length / n)
        }
        for n in range(1, parameters.number_of_modes + 1)
    ]
    return {
        "success": True,
        "wave_speed_m_per_s": wave_speed,
        "modes": modes
    }

@router.get("/")
def root():
    return {"project": "VAIL", "module": "Vibration of Strings", "status": "running"}

@router.get("/health")
def health():
    return {"status": "healthy"}