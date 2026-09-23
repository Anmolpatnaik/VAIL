"""
measurement_engine.py — VAIL 2.0 Measurement Engine Core
Blueprint Reference: §2, §9, §10

Converts true physical state into realistic instrument-like measurements
with resolution, quantization, sensor noise, and ISO/GUM uncertainty evaluation.

Conceptual pipeline:
  True physical state → Instrument model → Measured value → Resolution/uncertainty → Student observation
"""

import math
import random
from typing import Dict, Any, List, Optional, Tuple
from pydantic import BaseModel
from enum import Enum


class InstrumentType(str, Enum):
    MULTIMETER_DCV = "multimeter_dcv"
    MULTIMETER_ACV = "multimeter_acv"
    MULTIMETER_DCA = "multimeter_dca"
    MULTIMETER_RESISTANCE = "multimeter_resistance"
    MULTIMETER_CAPACITANCE = "multimeter_capacitance"
    OSCILLOSCOPE = "oscilloscope"
    STOPWATCH = "stopwatch"
    VERNIER = "vernier"
    MICROMETER = "micrometer"
    GENERIC = "generic"


class UncertaintyComponent(BaseModel):
    name: str
    type: str  # "Type A" (statistical) or "Type B" (resolution, tolerance)
    distribution: str  # "normal", "rectangular", "triangular"
    standard_uncertainty: float
    degrees_of_freedom: Optional[int] = None


class MeasurementResult(BaseModel):
    nominal_value: float
    measured_value: float
    unit: str
    resolution: float
    absolute_uncertainty: float
    relative_uncertainty_percent: float
    coverage_factor_k: float = 2.0  # 95% confidence level (GUM standard)
    confidence_interval_low: float
    confidence_interval_high: float
    uncertainty_budget: List[UncertaintyComponent] = []
    is_realistic: bool = True
    formatted_reading: str


# Standard specification limits for virtual instruments
INSTRUMENT_SPECS = {
    InstrumentType.MULTIMETER_DCV: {
        "unit": "V",
        "resolution": 0.001,       # 3.5 digit resolution (1 mV on 2V range)
        "gain_accuracy": 0.005,    # ±(0.5% + 2 digits)
        "digit_offset": 2,
        "input_impedance_ohms": 10e6,
        "noise_sd": 0.0008,
    },
    InstrumentType.MULTIMETER_ACV: {
        "unit": "V",
        "resolution": 0.001,
        "gain_accuracy": 0.01,     # ±(1.0% + 5 digits)
        "digit_offset": 5,
        "input_impedance_ohms": 10e6,
        "noise_sd": 0.0015,
    },
    InstrumentType.MULTIMETER_DCA: {
        "unit": "mA",
        "resolution": 0.01,        # 10 μA resolution on 200mA range
        "gain_accuracy": 0.008,    # ±(0.8% + 2 digits)
        "digit_offset": 2,
        "shunt_resistance_ohms": 1.0,
        "noise_sd": 0.01,
    },
    InstrumentType.MULTIMETER_RESISTANCE: {
        "unit": "Ω",
        "resolution": 0.1,
        "gain_accuracy": 0.008,
        "digit_offset": 2,
        "noise_sd": 0.05,
    },
    InstrumentType.MULTIMETER_CAPACITANCE: {
        "unit": "μF",
        "resolution": 0.01,
        "gain_accuracy": 0.02,     # ±(2.0% + 5 digits)
        "digit_offset": 5,
        "noise_sd": 0.02,
    },
    InstrumentType.OSCILLOSCOPE: {
        "unit": "V",
        "resolution": 0.01,        # 8-bit ADC quantization over screen span
        "gain_accuracy": 0.02,     # ±2% vertical accuracy
        "digit_offset": 1,
        "noise_sd": 0.005,
        "timebase_jitter_s": 50e-12,
    },
    InstrumentType.STOPWATCH: {
        "unit": "s",
        "resolution": 0.01,        # 10 ms timer resolution
        "gain_accuracy": 0.0005,
        "digit_offset": 1,
        "human_reaction_sd": 0.15, # Typical human reflex delay uncertainty
        "noise_sd": 0.02,
    },
    InstrumentType.VERNIER: {
        "unit": "mm",
        "resolution": 0.02,        # Standard vernier least count (0.02 mm)
        "gain_accuracy": 0.0,
        "digit_offset": 1,
        "noise_sd": 0.005,
    },
    InstrumentType.MICROMETER: {
        "unit": "mm",
        "resolution": 0.01,        # Micrometer screw gauge least count (0.01 mm)
        "gain_accuracy": 0.0,
        "digit_offset": 1,
        "noise_sd": 0.002,
    },
    InstrumentType.GENERIC: {
        "unit": "units",
        "resolution": 0.001,
        "gain_accuracy": 0.01,
        "digit_offset": 1,
        "noise_sd": 0.002,
    },
}


class MeasurementEngine:
    """
    Core engine for instrument measurement modeling and uncertainty propagation.
    Follows ISO/IEC Guide 98-3 (GUM - Guide to the Expression of Uncertainty in Measurement).
    """

    @staticmethod
    def quantize(value: float, resolution: float) -> float:
        """Quantize continuous value to discrete instrument least-count resolution."""
        if resolution <= 0:
            return value
        steps = round(value / resolution)
        return round(steps * resolution, 8)

    @classmethod
    def apply_measurement(
        cls,
        true_value: float,
        instrument_type: InstrumentType = InstrumentType.MULTIMETER_DCV,
        is_realistic: bool = True,
        custom_spec: Optional[Dict[str, Any]] = None,
        component_tolerance: float = 0.0,
        seed: Optional[int] = None,
    ) -> MeasurementResult:
        """
        Simulate instrument observation from true physical quantity.
        
        Args:
            true_value: Ideal analytical physical value.
            instrument_type: Target instrument profile.
            is_realistic: If False, returns ideal value without noise/tolerance.
            custom_spec: Overrides for instrument specs (resolution, accuracy).
            component_tolerance: Relative component tolerance spread (e.g., 0.05 for 5% resistor).
            seed: Optional seed for repeatable student sessions.
        """
        rng = random.Random(seed) if seed is not None else random

        spec = INSTRUMENT_SPECS.get(instrument_type, INSTRUMENT_SPECS[InstrumentType.GENERIC]).copy()
        if custom_spec:
            spec.update(custom_spec)

        resolution = float(spec.get("resolution", 0.001))
        unit = spec.get("unit", "")
        gain_acc = float(spec.get("gain_accuracy", 0.005))
        digit_offset = int(spec.get("digit_offset", 2))
        noise_sd = float(spec.get("noise_sd", 0.001))

        budget: List[UncertaintyComponent] = []

        if not is_realistic:
            # Ideal mode: precise value formatted to resolution
            measured_val = cls.quantize(true_value, resolution)
            abs_uncertainty = resolution / 2.0
            rel_uncertainty = (abs_uncertainty / abs(true_value) * 100.0) if true_value != 0 else 0.0
            decimals = cls._get_decimals(resolution)
            
            return MeasurementResult(
                nominal_value=round(true_value, 6),
                measured_value=round(measured_val, decimals),
                unit=unit,
                resolution=resolution,
                absolute_uncertainty=round(abs_uncertainty, 6),
                relative_uncertainty_percent=round(rel_uncertainty, 4),
                coverage_factor_k=2.0,
                confidence_interval_low=round(measured_val - abs_uncertainty, 6),
                confidence_interval_high=round(measured_val + abs_uncertainty, 6),
                uncertainty_budget=[],
                is_realistic=False,
                formatted_reading=f"{measured_val:.{decimals}f} {unit}",
            )

        # Realistic Mode:
        # 1. Component tolerance shift (systematic bias for this session/run)
        tol_shift = 0.0
        if component_tolerance > 0:
            # Normal distribution with 3-sigma at tolerance limit
            tol_shift = rng.gauss(0, (true_value * component_tolerance) / 3.0)

        # 2. Instrument gain & offset calibration error
        cal_error = rng.gauss(0, (abs(true_value) * gain_acc) / math.sqrt(3.0))

        # 3. Dynamic Gaussian sensor/thermal noise
        noise = rng.gauss(0, noise_sd)

        # 4. Human reaction time for stopwatches
        reaction_error = 0.0
        if instrument_type == InstrumentType.STOPWATCH:
            reaction_sd = float(spec.get("human_reaction_sd", 0.15))
            reaction_error = rng.gauss(0, reaction_sd)

        # Raw reading with all physical effects
        simulated_value = true_value + tol_shift + cal_error + noise + reaction_error

        # 5. ADC Quantization & display resolution rounding
        measured_val = cls.quantize(simulated_value, resolution)

        # --- Uncertainty Budget Evaluation (ISO GUM) ---
        # Component 1: Resolution (Type B, rectangular distribution)
        u_res = (resolution / 2.0) / math.sqrt(3.0)
        budget.append(
            UncertaintyComponent(
                name="Digital Resolution / Quantization",
                type="Type B",
                distribution="rectangular",
                standard_uncertainty=round(u_res, 6),
            )
        )

        # Component 2: Manufacturer Accuracy Specification (Type B, rectangular)
        spec_abs = (abs(measured_val) * gain_acc) + (digit_offset * resolution)
        u_spec = spec_abs / math.sqrt(3.0)
        budget.append(
            UncertaintyComponent(
                name="Instrument Manufacturer Tolerance",
                type="Type B",
                distribution="rectangular",
                standard_uncertainty=round(u_spec, 6),
            )
        )

        # Component 3: Random Noise (Type A / normal)
        u_noise = noise_sd
        budget.append(
            UncertaintyComponent(
                name="Sensor / Thermal Noise",
                type="Type A",
                distribution="normal",
                standard_uncertainty=round(u_noise, 6),
            )
        )

        if component_tolerance > 0:
            u_tol = (abs(true_value) * component_tolerance) / math.sqrt(3.0)
            budget.append(
                UncertaintyComponent(
                    name="Component Nominal Tolerance",
                    type="Type B",
                    distribution="rectangular",
                    standard_uncertainty=round(u_tol, 6),
                )
            )

        # Combined Standard Uncertainty: u_c = sqrt(sum(u_i^2))
        u_combined = math.sqrt(sum(c.standard_uncertainty ** 2 for c in budget))
        
        # Expanded Uncertainty: U = k * u_c (k = 2.0 for 95% coverage)
        k = 2.0
        u_expanded = k * u_combined

        rel_uncertainty = (u_expanded / abs(measured_val) * 100.0) if measured_val != 0 else 0.0
        decimals = cls._get_decimals(resolution)

        return MeasurementResult(
            nominal_value=round(true_value, 6),
            measured_value=round(measured_val, decimals),
            unit=unit,
            resolution=resolution,
            absolute_uncertainty=round(u_expanded, decimals if decimals > 2 else 3),
            relative_uncertainty_percent=round(rel_uncertainty, 2),
            coverage_factor_k=k,
            confidence_interval_low=round(measured_val - u_expanded, decimals),
            confidence_interval_high=round(measured_val + u_expanded, decimals),
            uncertainty_budget=budget,
            is_realistic=True,
            formatted_reading=f"{measured_val:.{decimals}f} ± {u_expanded:.{decimals}f} {unit}",
        )

    @staticmethod
    def _get_decimals(resolution: float) -> int:
        if resolution <= 0:
            return 3
        if resolution >= 1:
            return 0
        s = f"{resolution:.8f}".rstrip("0")
        if "." in s:
            return len(s.split(".")[1])
        return 2

    @classmethod
    def propagate_uncertainty(
        cls,
        expression_type: str,
        inputs: List[Tuple[float, float]],  # List of (val, uncertainty)
    ) -> Tuple[float, float]:
        """
        GUM Uncertainty Propagation for common laboratory calculations:
          - "sum_diff": y = x1 ± x2 => u(y) = sqrt(u1^2 + u2^2)
          - "product": y = x1 * x2 => u(y)/y = sqrt((u1/x1)^2 + (u2/x2)^2)
          - "quotient": y = x1 / x2 => u(y)/y = sqrt((u1/x1)^2 + (u2/x2)^2)
        """
        if expression_type == "sum_diff":
            val = sum(x[0] for x in inputs)
            u = math.sqrt(sum(x[1] ** 2 for x in inputs))
            return val, u

        elif expression_type == "product":
            val = 1.0
            rel_u_sq = 0.0
            for x, u in inputs:
                val *= x
                if x != 0:
                    rel_u_sq += (u / x) ** 2
            return val, abs(val) * math.sqrt(rel_u_sq)

        elif expression_type == "quotient":
            (x1, u1), (x2, u2) = inputs[0], inputs[1]
            if x2 == 0:
                raise ValueError("Division by zero in uncertainty propagation")
            val = x1 / x2
            rel_u = math.sqrt((u1 / x1) ** 2 + (u2 / x2) ** 2) if x1 != 0 else 0
            return val, abs(val) * rel_u

        return inputs[0][0], inputs[0][1]
