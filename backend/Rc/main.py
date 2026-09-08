from enum import Enum
from typing import Optional

import math
import numpy as np
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

# Initialize the router instead of the FastAPI app
router = APIRouter()


# -----------------------------
# Simulation Mode
# -----------------------------

class SimulationMode(str, Enum):
    charging = "charging"
    discharging = "discharging"
    both = "both"


# -----------------------------
# Request Model
# -----------------------------

class RCSimulationRequest(BaseModel):
    voltage: float = Field(
        ...,
        gt=0,
        description="Source voltage in volts (V)"
    )

    resistance: float = Field(
        ...,
        gt=0,
        description="Resistance in ohms (Ω)"
    )

    capacitance_microfarads: float = Field(
        ...,
        gt=0,
        description="Capacitance in microfarads (μF)"
    )

    time: float = Field(
        ...,
        gt=0,
        description="Simulation time in seconds (s)"
    )

    points: int = Field(
        default=100,
        ge=10,
        le=1000,
        description="Number of points in the simulation curve"
    )

    mode: SimulationMode = Field(
        default=SimulationMode.both,
        description="Simulation mode: charging, discharging, or both"
    )


# -----------------------------
# Root Endpoint
# -----------------------------

@router.get("/")
def root():
    return {
        "message": "RC Circuit Virtual Lab API",
        "status": "running",
        "version": "2.0.0",
        "documentation": "/docs"
    }


# -----------------------------
# Health Check
# -----------------------------

@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "experiment": "RC Circuit"
    }


# -----------------------------
# RC Circuit Simulation
# -----------------------------

@router.post("/simulate")
def simulate_rc_circuit(request: RCSimulationRequest):

    # Convert capacitance from μF to F
    capacitance_farads = request.capacitance_microfarads * 1e-6

    # RC time constant
    time_constant = request.resistance * capacitance_farads

    # Generate time values
    time_values = np.linspace(
        0,
        request.time,
        request.points
    )

    # -----------------------------
    # Charging equations
    # -----------------------------

    charging_voltage = (
        request.voltage
        * (1 - np.exp(-time_values / time_constant))
    )

    charging_current = (
        (request.voltage / request.resistance)
        * np.exp(-time_values / time_constant)
    )

    # -----------------------------
    # Discharging equations
    # -----------------------------

    discharging_voltage = (
        request.voltage
        * np.exp(-time_values / time_constant)
    )

    discharging_current = (
        -(request.voltage / request.resistance)
        * np.exp(-time_values / time_constant)
    )

    # -----------------------------
    # Final values
    # -----------------------------

    final_charging_voltage = float(charging_voltage[-1])
    final_discharging_voltage = float(discharging_voltage[-1])

    final_charging_current = float(charging_current[-1])
    final_discharging_current = float(discharging_current[-1])

    # -----------------------------
    # Build response
    # -----------------------------

    response = {
        "experiment": "RC Circuit",

        "parameters": {
            "voltage_volts": request.voltage,
            "resistance_ohms": request.resistance,
            "capacitance_microfarads": request.capacitance_microfarads,
            "capacitance_farads": capacitance_farads,
            "time_seconds": request.time,
            "points": request.points,
            "mode": request.mode.value
        },

        "results": {
            "time_constant_seconds": time_constant
        },

        "curve": {
            "time": time_values.tolist()
        },

        "formulas": {
            "time_constant": "τ = RC",
            "charging_voltage": "Vc(t) = V₀(1 - e^(-t/RC))",
            "discharging_voltage": "Vc(t) = V₀e^(-t/RC)",
            "charging_current": "I(t) = (V₀/R)e^(-t/RC)",
            "discharging_current": "I(t) = -(V₀/R)e^(-t/RC)"
        }
    }

    # -----------------------------
    # Add charging results
    # -----------------------------

    if request.mode in [
        SimulationMode.charging,
        SimulationMode.both
    ]:

        response["results"]["charging_voltage_final"] = (
            final_charging_voltage
        )

        response["results"]["charging_current_final"] = (
            final_charging_current
        )

        response["curve"]["charging_voltage"] = (
            charging_voltage.tolist()
        )

        response["curve"]["charging_current"] = (
            charging_current.tolist()
        )

    # -----------------------------
    # Add discharging results
    # -----------------------------

    if request.mode in [
        SimulationMode.discharging,
        SimulationMode.both
    ]:

        response["results"]["discharging_voltage_final"] = (
            final_discharging_voltage
        )

        response["results"]["discharging_current_final"] = (
            final_discharging_current
        )

        response["curve"]["discharging_voltage"] = (
            discharging_voltage.tolist()
        )

        response["curve"]["discharging_current"] = (
            discharging_current.tolist()
        )

    return response