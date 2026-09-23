"""
experiment_registry.py — VAIL 2.0 Backend Engine

Auto-discovers, registers, and serves experiment physics computation.
Provides:
  - GET /api/experiments/                  (Catalog metadata)
  - GET /api/experiments/{id}              (Schema & metadata)
  - GET /api/experiments/{id}/validate     (Rigor level & verification)
  - POST /api/experiments/{id}/compute     (Standardized physics engine)
"""

from fastapi import APIRouter, HTTPException, Body
from typing import Dict, List, Any, Optional
from .base_experiment import BaseExperiment, ExperimentMetadata
from .measurement_engine import MeasurementEngine, InstrumentType
from .validation_engine import ValidationEngine
from .experiments import (
    RCExperiment,
    HysteresisExperiment,
    VibrationStringExperiment,
    ImpulseMomentumExperiment,
    EDMExperiment,
    OpAmpExperiment,
)

router = APIRouter()

# Registry of all experiment instances
_experiments: Dict[str, BaseExperiment] = {}


def register_experiment(experiment: BaseExperiment):
    """Register an experiment instance in the global registry."""
    metadata = experiment.get_metadata()
    _experiments[metadata.id] = experiment


def get_experiment(experiment_id: str) -> Optional[BaseExperiment]:
    """Get a registered experiment by ID."""
    return _experiments.get(experiment_id)


def list_experiments() -> List[ExperimentMetadata]:
    """List metadata for all registered experiments."""
    return [exp.get_metadata() for exp in _experiments.values()]


# Bootstrap standard VAIL 2.0 core experiments
def init_default_experiments():
    defaults = [
        RCExperiment(),
        HysteresisExperiment(),
        VibrationStringExperiment(),
        ImpulseMomentumExperiment(),
        EDMExperiment(),
        OpAmpExperiment(),
    ]
    for exp in defaults:
        register_experiment(exp)

init_default_experiments()


# --- API Endpoints ---

@router.get("/")
def get_all_experiments():
    """
    Returns metadata for all registered experiments.
    Used by the frontend ExperimentRegistry to populate the catalog.
    """
    return {
        "success": True,
        "count": len(_experiments),
        "experiments": [
            exp.get_metadata().model_dump() 
            for exp in _experiments.values()
        ]
    }


@router.get("/{experiment_id}")
def get_experiment_info(experiment_id: str):
    """Get detailed info and parameter schema for a specific experiment."""
    exp = get_experiment(experiment_id)
    if not exp:
        raise HTTPException(status_code=404, detail=f"Experiment '{experiment_id}' not found")
    
    metadata = exp.get_metadata()
    schema = exp.get_parameter_schema()
    
    return {
        "success": True,
        "metadata": metadata.model_dump(),
        "parameter_schema": schema,
    }


@router.get("/{experiment_id}/validate")
def validate_experiment(experiment_id: str):
    """Check the validation status and rigor level of an experiment."""
    exp = get_experiment(experiment_id)
    if not exp:
        raise HTTPException(status_code=404, detail=f"Experiment '{experiment_id}' not found")
    
    metadata = exp.get_metadata()
    return {
        "success": True,
        "experiment_id": experiment_id,
        "validation_level": metadata.validation_level,
        "version": metadata.version,
    }


@router.post("/{experiment_id}/compute")
def compute_experiment(experiment_id: str, params: Dict[str, Any] = Body(...)):
    """
    Execute standardized physics computation for a registered experiment.
    Validates input ranges and executes analytical solvers.
    """
    exp = get_experiment(experiment_id)
    if not exp:
        raise HTTPException(status_code=404, detail=f"Experiment '{experiment_id}' not found")

    # Physics-level validation
    errors = exp.validate_params(params)
    if errors:
        return {
            "success": False,
            "errors": errors,
        }

    try:
        results = exp.compute(params)
        val_result = exp.validate_results(params, results)
        return {
            "success": True,
            "experiment_id": experiment_id,
            "results": results,
            "validation": val_result.model_dump(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Computation failed: {str(e)}")


@router.get("/{experiment_id}/reference-data")
def get_reference_data(experiment_id: str):
    """Return calibrated hardware laboratory reference benchmark dataset."""
    exp = get_experiment(experiment_id)
    if not exp:
        raise HTTPException(status_code=404, detail=f"Experiment '{experiment_id}' not found")
    ref_data = exp.get_reference_data() or ValidationEngine.get_reference_dataset(experiment_id)
    return {
        "success": True,
        "experiment_id": experiment_id,
        "reference_data": ref_data,
    }


@router.post("/{experiment_id}/validate-results")
def validate_results_endpoint(experiment_id: str, payload: Dict[str, Any] = Body(...)):
    """Run full Level 1-3 validation audit against student inputs & outputs."""
    exp = get_experiment(experiment_id)
    if not exp:
        raise HTTPException(status_code=404, detail=f"Experiment '{experiment_id}' not found")
    
    params = payload.get("params", {})
    results = payload.get("results", {})
    
    # If results are not provided, run compute first
    if not results:
        errors = exp.validate_params(params)
        if errors:
            return {"success": False, "errors": errors}
        results = exp.compute(params)

    report = ValidationEngine.validate_experiment(experiment_id, params, results)
    return {
        "success": True,
        "experiment_id": experiment_id,
        "report": report.model_dump(),
    }


@router.post("/{experiment_id}/measure")
def measure_endpoint(experiment_id: str, payload: Dict[str, Any] = Body(...)):
    """
    Measurement Engine endpoint: converts physical value to realistic instrument reading
    incorporating quantization, sensor noise, tolerances, and GUM uncertainty budget.
    """
    true_value = float(payload.get("value", 0.0))
    inst_type_str = payload.get("instrument_type", "multimeter_dcv")
    is_realistic = bool(payload.get("is_realistic", True))
    tolerance = float(payload.get("component_tolerance", 0.0))
    custom_spec = payload.get("custom_spec", None)

    try:
        inst_type = InstrumentType(inst_type_str)
    except ValueError:
        inst_type = InstrumentType.GENERIC

    res = MeasurementEngine.apply_measurement(
        true_value=true_value,
        instrument_type=inst_type,
        is_realistic=is_realistic,
        component_tolerance=tolerance,
        custom_spec=custom_spec,
    )

    return {
        "success": True,
        "experiment_id": experiment_id,
        "measurement": res.model_dump(),
    }
