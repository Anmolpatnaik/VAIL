"""
base_experiment.py — VAIL 2.0 Backend Engine Core

Abstract base class for all experiment physics modules.
Provides a standard interface that each experiment must implement:
  - validate_params(): Input validation beyond Pydantic
  - compute(): Core physics computation
  - validate_results(): Post-computation validation against reference data
  - get_metadata(): Experiment metadata for the registry

This enables:
  1. Consistent API surface across all experiments
  2. Pluggable validation levels (mathematical, numerical, experimental)
  3. Future: auto-discovery of experiment modules
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from pydantic import BaseModel
from enum import Enum


class ValidationLevel(str, Enum):
    """Validation rigor levels for VAIL 2.0"""
    DRAFT = "draft"           # No validation — work in progress
    TESTED = "tested"         # Basic unit tests pass
    VERIFIED = "verified"     # Mathematical verification against known equations
    VALIDATED = "validated"   # Numerical verification against reference solvers
    EXPERIMENTALLY_VALIDATED = "experimentally_validated"  # Compared with physical measurements


class ExperimentMetadata(BaseModel):
    """Standard metadata that every experiment must provide."""
    id: str
    title: str
    discipline: str
    level: str
    description: str
    version: str = "1.0.0"
    validation_level: ValidationLevel = ValidationLevel.TESTED
    authors: List[str] = []
    tags: List[str] = []


class ValidationResult(BaseModel):
    """Result of a validation check."""
    passed: bool
    level: ValidationLevel
    message: str
    details: Optional[Dict[str, Any]] = None
    reference_data: Optional[Dict[str, Any]] = None


class BaseExperiment(ABC):
    """
    Abstract base class for all VAIL 2.0 experiment modules.
    
    Each experiment physics module should extend this class and implement
    the required methods. The engine will auto-discover and register
    experiments that follow this interface.
    
    Example:
        class ImpulseMomentumExperiment(BaseExperiment):
            def get_metadata(self):
                return ExperimentMetadata(
                    id="impulse-momentum",
                    title="Impulse-Momentum Theorem",
                    ...
                )
            
            def validate_params(self, params):
                # Custom validation beyond Pydantic schema
                ...
            
            def compute(self, params):
                # Core physics computation
                ...
            
            def validate_results(self, params, results):
                # Check results against reference data
                ...
    """

    @abstractmethod
    def get_metadata(self) -> ExperimentMetadata:
        """Return experiment metadata for the registry."""
        pass

    @abstractmethod
    def validate_params(self, params: Dict[str, Any]) -> List[str]:
        """
        Validate input parameters beyond Pydantic schema validation.
        
        Returns a list of validation error messages (empty if valid).
        Use this for physics-level validation:
          - Parameter ranges that make physical sense
          - Combinations that would produce invalid states
          - Warnings for extreme values
        """
        pass

    @abstractmethod
    def compute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the core physics computation.
        
        This should be a pure function: same inputs → same outputs.
        No side effects, no API calls, no database access.
        
        Returns a dictionary of results in the experiment's standard format.
        """
        pass

    def validate_results(self, params: Dict[str, Any], results: Dict[str, Any]) -> ValidationResult:
        """
        Validate computed results against reference data.
        
        Override this method to implement validation levels:
          - Level 1: Mathematical verification (known equations, limiting cases)
          - Level 2: Numerical verification (comparison with reference solvers)
          - Level 3: Experimental validation (comparison with physical measurements)
        
        Default implementation returns a basic pass.
        """
        return ValidationResult(
            passed=True,
            level=ValidationLevel.DRAFT,
            message="No validation rules defined for this experiment.",
        )

    def get_parameter_schema(self) -> Optional[Dict[str, Any]]:
        """
        Return JSON Schema for experiment parameters.
        Used by the frontend to auto-generate parameter controls.
        
        Default implementation returns None (manual parameter UI).
        """
        return None

    def get_reference_data(self) -> Optional[Dict[str, Any]]:
        """
        Return reference/expected data for validation comparisons.
        
        This could be:
          - Known analytical solutions for specific inputs
          - Pre-computed numerical results
          - Published experimental measurements
        
        Default implementation returns None.
        """
        return None
