"""
experiments.py — VAIL 2.0 Physical Experiment Implementations

Standardized BaseExperiment implementations for all 6 VAIL laboratories:
1. RCExperiment (Charging & Discharging Transient Response)
2. HysteresisExperiment (Magnetic B-H Loop & Steinmetz Core Loss)
3. VibrationStringExperiment (Standing Waves & Resonant Harmonics)
4. ImpulseMomentumExperiment (Collision Dynamics & Impulse Equivalence)
5. EDMExperiment (Die-Sinking Spark Erosion & Material Removal Rate)
6. OpAmpExperiment (IC 741 Inverting/Non-Inverting Amplifier & Saturation Limits)
"""

import math
import numpy as np
from typing import Dict, Any, List, Optional
from .base_experiment import BaseExperiment, ExperimentMetadata, ValidationLevel, ValidationResult
from .validation_engine import ValidationEngine


# -----------------------------------------------------------------------------
# 1. RC Circuit Experiment
# -----------------------------------------------------------------------------
class RCExperiment(BaseExperiment):
    def get_metadata(self) -> ExperimentMetadata:
        return ExperimentMetadata(
            id="rc",
            title="Charging & Discharging of Capacitor (RC Circuit)",
            discipline="Physics / Electrical Engineering",
            level="BTech Year 1",
            description="Study the exponential charging and discharging characteristics of a capacitor in an RC circuit.",
            version="2.0.0",
            validation_level=ValidationLevel.EXPERIMENTALLY_VALIDATED,
            authors=["VAIL Physics Team"],
            tags=["circuits", "transients", "capacitance", "time_constant"],
        )

    def validate_params(self, params: Dict[str, Any]) -> List[str]:
        errors = []
        voltage = params.get("voltage", 0)
        resistance = params.get("resistance", 0)
        capacitance = params.get("capacitance_microfarads", params.get("capacitance", 0))

        if voltage <= 0 or voltage > 100:
            errors.append("Voltage must be between 0 and 100 V.")
        if resistance <= 0 or resistance > 1e7:
            errors.append("Resistance must be between 1 Ω and 10 MΩ.")
        if capacitance <= 0 or capacitance > 1e5:
            errors.append("Capacitance must be between 0.01 μF and 100,000 μF.")
        return errors

    def compute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        v0 = float(params.get("voltage", 10.0))
        r = float(params.get("resistance", 1000.0))
        c_uf = float(params.get("capacitance_microfarads", params.get("capacitance", 1000.0)))
        c_farads = c_uf * 1e-6
        tau = r * c_farads
        points = int(params.get("points", 100))
        t_max = float(params.get("time", 5.0 * tau))

        t = np.linspace(0, t_max, points)
        vc_charging = v0 * (1.0 - np.exp(-t / tau))
        i_charging = (v0 / r) * np.exp(-t / tau)
        vc_discharging = v0 * np.exp(-t / tau)
        i_discharging = -(v0 / r) * np.exp(-t / tau)

        return {
            "time_constant_seconds": round(float(tau), 6),
            "steady_state_time_seconds": round(float(5 * tau), 4),
            "peak_surge_current_amperes": round(float(v0 / r), 6),
            "time_points": [round(float(x), 4) for x in t],
            "charging_voltage": [round(float(x), 4) for x in vc_charging],
            "charging_current": [round(float(x), 6) for x in i_charging],
            "discharging_voltage": [round(float(x), 4) for x in vc_discharging],
            "discharging_current": [round(float(x), 6) for x in i_discharging],
        }

    def get_parameter_schema(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "voltage": {"type": "number", "default": 10.0, "minimum": 0.1, "maximum": 50.0},
                "resistance": {"type": "number", "default": 1000.0, "minimum": 10.0, "maximum": 100000.0},
                "capacitance_microfarads": {"type": "number", "default": 1000.0, "minimum": 1.0, "maximum": 10000.0},
                "points": {"type": "integer", "default": 100, "minimum": 10, "maximum": 500},
            },
            "required": ["voltage", "resistance", "capacitance_microfarads"],
        }

    def validate_results(self, params: Dict[str, Any], results: Dict[str, Any]) -> ValidationResult:
        report = ValidationEngine.validate_rc(params, results)
        return ValidationResult(
            passed=report.passed,
            level=report.validation_level,
            message=report.summary_message,
            details=report.model_dump(),
            reference_data=report.reference_comparison,
        )

    def get_reference_data(self) -> Optional[Dict[str, Any]]:
        return ValidationEngine.get_reference_dataset("rc")


# -----------------------------------------------------------------------------
# 2. Hysteresis Loop Experiment
# -----------------------------------------------------------------------------
class HysteresisExperiment(BaseExperiment):
    def get_metadata(self) -> ExperimentMetadata:
        return ExperimentMetadata(
            id="hysteresis",
            title="Hysteresis Loss & Magnetic B-H Curve",
            discipline="Physics / Materials Science",
            level="BTech Year 1",
            description="Study ferromagnetic domain hysteresis, B-H loop area integration, and Steinmetz core energy dissipation.",
            version="2.0.0",
            validation_level=ValidationLevel.VERIFIED,
            authors=["VAIL Physics Team"],
            tags=["magnetism", "hysteresis", "b_h_curve", "materials"],
        )

    def validate_params(self, params: Dict[str, Any]) -> List[str]:
        errors = []
        max_h = params.get("maxH", params.get("max_h", 500))
        freq = params.get("freq", params.get("frequency", 50))
        if max_h <= 0 or max_h > 5000:
            errors.append("Magnetic field intensity maxH must be between 10 and 5000 A/m.")
        if freq <= 0 or freq > 1000:
            errors.append("Frequency must be between 1 and 1000 Hz.")
        return errors

    def compute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        max_h = float(params.get("maxH", params.get("max_h", 500.0)))
        freq = float(params.get("freq", params.get("frequency", 50.0)))
        points = int(params.get("points", 200))
        volume = float(params.get("volume", 0.001))

        # Nonlinear ferromagnetic sigmoidal loop approximation
        theta = np.linspace(0, 2 * np.pi, points)
        h = max_h * np.sin(theta)
        # Saturation induction B_s ~ 1.5 T, with phase lag producing remanence and coercivity
        b_s = 1.5
        h_c = 0.15 * max_h
        b = b_s * np.tanh((h + np.sign(np.cos(theta)) * h_c) / (0.35 * max_h))

        # Numerical closed-loop integration: w_h = ∮ B dH
        area = float(np.abs(np.trapezoid(b, h)))
        power_loss = area * freq * volume

        return {
            "loop_area_j_m3": round(area, 3),
            "hysteresis_power_loss_watts": round(power_loss, 4),
            "max_b_tesla": round(float(np.max(b)), 4),
            "min_b_tesla": round(float(np.min(b)), 4),
            "coercive_field_a_m": round(float(h_c), 2),
            "remanence_tesla": round(float(b_s * np.tanh(h_c / (0.35 * max_h))), 4),
            "h_field_points": [round(float(x), 2) for x in h],
            "b_induction_points": [round(float(x), 4) for x in b],
        }

    def get_parameter_schema(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "maxH": {"type": "number", "default": 500.0, "minimum": 50.0, "maximum": 2000.0},
                "frequency": {"type": "number", "default": 50.0, "minimum": 10.0, "maximum": 400.0},
                "volume": {"type": "number", "default": 0.001, "minimum": 0.0001, "maximum": 0.1},
            },
            "required": ["maxH", "frequency"],
        }


# -----------------------------------------------------------------------------
# 3. Vibrations on String Experiment
# -----------------------------------------------------------------------------
class VibrationStringExperiment(BaseExperiment):
    def get_metadata(self) -> ExperimentMetadata:
        return ExperimentMetadata(
            id="string",
            title="Vibrations on String (Standing Waves)",
            discipline="Physics / Acoustics",
            level="BTech Year 1",
            description="Investigate harmonic standing waves on stretched strings, phase speed v = √(T/μ), and resonant frequencies.",
            version="2.0.0",
            validation_level=ValidationLevel.EXPERIMENTALLY_VALIDATED,
            authors=["VAIL Physics Team"],
            tags=["waves", "resonance", "standing_waves", "harmonics"],
        )

    def validate_params(self, params: Dict[str, Any]) -> List[str]:
        errors = []
        tension = params.get("tension", 10)
        length = params.get("length", 1.0)
        mu = params.get("linearDensity", params.get("mu", 0.001))
        if tension <= 0 or tension > 200:
            errors.append("Tension must be between 0.1 N and 200 N.")
        if length <= 0 or length > 5:
            errors.append("String length must be between 0.2 m and 5.0 m.")
        if mu <= 0:
            errors.append("Linear density must be positive.")
        return errors

    def compute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        tension = float(params.get("tension", 10.0))
        length = float(params.get("length", 1.0))
        mu = float(params.get("linearDensity", params.get("mu", 0.001)))
        
        velocity = math.sqrt(tension / mu)
        harmonics = []
        for n in range(1, 6):
            f_n = (n / (2.0 * length)) * velocity
            lambda_n = (2.0 * length) / n
            harmonics.append({
                "mode": n,
                "frequency_hz": round(f_n, 2),
                "wavelength_m": round(lambda_n, 3),
                "node_spacing_m": round(lambda_n / 2.0, 3),
            })

        return {
            "wave_speed_m_s": round(velocity, 2),
            "fundamental_frequency_hz": harmonics[0]["frequency_hz"],
            "harmonics": harmonics,
        }

    def get_parameter_schema(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "tension": {"type": "number", "default": 10.0, "minimum": 1.0, "maximum": 100.0},
                "length": {"type": "number", "default": 1.0, "minimum": 0.5, "maximum": 2.5},
                "linearDensity": {"type": "number", "default": 0.001, "minimum": 0.0001, "maximum": 0.01},
            },
            "required": ["tension", "length"],
        }


# -----------------------------------------------------------------------------
# 4. Impulse-Momentum Theorem Experiment
# -----------------------------------------------------------------------------
class ImpulseMomentumExperiment(BaseExperiment):
    def get_metadata(self) -> ExperimentMetadata:
        return ExperimentMetadata(
            id="impulse",
            title="Impulse-Momentum Theorem & 1D Collisions",
            discipline="Physics / Classical Mechanics",
            level="BTech Year 1",
            description="Verify Newton's second law in impulse formulation and conservation of linear momentum in collisions.",
            version="2.0.0",
            validation_level=ValidationLevel.VERIFIED,
            authors=["VAIL Physics Team"],
            tags=["mechanics", "momentum", "impulse", "collisions"],
        )

    def validate_params(self, params: Dict[str, Any]) -> List[str]:
        errors = []
        m1 = params.get("m1", params.get("mass", 0.5))
        m2 = params.get("m2", 0.5)
        e = params.get("elasticity", params.get("coefficient_of_restitution", 1.0))
        if m1 <= 0 or m2 <= 0:
            errors.append("Cart masses must be strictly positive.")
        if e < 0 or e > 1.0:
            errors.append("Coefficient of restitution must be between 0 and 1.")
        return errors

    def compute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        m1 = float(params.get("m1", params.get("mass", 0.5)))
        m2 = float(params.get("m2", 0.5))
        u1 = float(params.get("u1", params.get("v1_initial", 1.2)))
        u2 = float(params.get("u2", params.get("v2_initial", 0.0)))
        e = float(params.get("elasticity", params.get("coefficient_of_restitution", 1.0)))

        # 1D collision kinematic equations with coefficient of restitution
        v1 = ((m1 - e * m2) * u1 + (1 + e) * m2 * u2) / (m1 + m2)
        v2 = ((m2 - e * m1) * u2 + (1 + e) * m1 * u1) / (m1 + m2)

        initial_p = m1 * u1 + m2 * u2
        final_p = m1 * v1 + m2 * v2
        delta_p1 = m1 * (v1 - u1)
        impulse = delta_p1  # Impulse delivered to cart 1

        initial_ke = 0.5 * m1 * (u1 ** 2) + 0.5 * m2 * (u2 ** 2)
        final_ke = 0.5 * m1 * (v1 ** 2) + 0.5 * m2 * (v2 ** 2)

        return {
            "v1_final_m_s": round(float(v1), 4),
            "v2_final_m_s": round(float(v2), 4),
            "impulse_cart1_n_s": round(float(impulse), 4),
            "momentum_change_cart1_kg_m_s": round(float(delta_p1), 4),
            "momentum_conservation_error": round(float(abs(final_p - initial_p)), 6),
            "kinetic_energy_initial_joules": round(float(initial_ke), 4),
            "kinetic_energy_final_joules": round(float(final_ke), 4),
            "kinetic_energy_loss_joules": round(float(initial_ke - final_ke), 4),
        }

    def get_parameter_schema(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "m1": {"type": "number", "default": 0.5, "minimum": 0.1, "maximum": 5.0},
                "m2": {"type": "number", "default": 0.5, "minimum": 0.1, "maximum": 5.0},
                "u1": {"type": "number", "default": 1.2, "minimum": -5.0, "maximum": 5.0},
                "u2": {"type": "number", "default": 0.0, "minimum": -5.0, "maximum": 5.0},
                "elasticity": {"type": "number", "default": 1.0, "minimum": 0.0, "maximum": 1.0},
            },
            "required": ["m1", "m2", "u1"],
        }


# -----------------------------------------------------------------------------
# 5. EDM Machining Experiment
# -----------------------------------------------------------------------------
class EDMExperiment(BaseExperiment):
    def get_metadata(self) -> ExperimentMetadata:
        return ExperimentMetadata(
            id="edm",
            title="Electric Discharge Machining (Smart ZNC EDM)",
            discipline="Mechanical Engineering",
            level="BTech Year 2",
            description="Study the electro-thermal spark erosion process, Material Removal Rate (MRR), and surface roughness Ra.",
            version="2.0.0",
            validation_level=ValidationLevel.VALIDATED,
            authors=["VAIL Manufacturing Team"],
            tags=["manufacturing", "edm", "spark_erosion", "machining"],
        )

    def validate_params(self, params: Dict[str, Any]) -> List[str]:
        errors = []
        i = params.get("current", 10)
        v = params.get("voltage", 45)
        p_on = params.get("pulseOn", 100)
        p_off = params.get("pulseOff", 50)
        if i <= 0 or i > 50:
            errors.append("Current must be between 1 and 50 A.")
        if v <= 0 or v > 100:
            errors.append("Gap voltage must be between 10 and 100 V.")
        if p_on <= 0 or p_off <= 0:
            errors.append("Pulse times must be strictly positive.")
        return errors

    def compute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        i = float(params.get("current", 10.0))
        v = float(params.get("voltage", 45.0))
        p_on = float(params.get("pulseOn", 100.0))
        p_off = float(params.get("pulseOff", 50.0))
        mach_time = float(params.get("machTime", 15.0))

        duty_cycle = p_on / (p_on + p_off)
        spark_energy_mj = (v * i * p_on) * 1e-3
        # Empirical spark erosion relationship for steel
        mrr = (i * 8.5) * (v / 50.0) * duty_cycle
        surface_roughness_ra = 0.25 * (i ** 0.3) * (p_on ** 0.4)

        return {
            "duty_cycle_percent": round(duty_cycle * 100.0, 2),
            "single_spark_energy_mj": round(spark_energy_mj, 3),
            "material_removal_rate_mm3_min": round(mrr, 3),
            "surface_roughness_ra_um": round(surface_roughness_ra, 3),
            "machining_time_minutes": mach_time,
        }

    def get_parameter_schema(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "current": {"type": "number", "default": 10.0, "minimum": 1.0, "maximum": 40.0},
                "voltage": {"type": "number", "default": 45.0, "minimum": 20.0, "maximum": 80.0},
                "pulseOn": {"type": "number", "default": 100.0, "minimum": 10.0, "maximum": 500.0},
                "pulseOff": {"type": "number", "default": 50.0, "minimum": 10.0, "maximum": 500.0},
            },
            "required": ["current", "voltage", "pulseOn", "pulseOff"],
        }


# -----------------------------------------------------------------------------
# 6. Op-Amp IC 741 Experiment
# -----------------------------------------------------------------------------
class OpAmpExperiment(BaseExperiment):
    def get_metadata(self) -> ExperimentMetadata:
        return ExperimentMetadata(
            id="opamp",
            title="Operational Amplifier (IC 741) Characteristics",
            discipline="Electronics & Communication",
            level="BTech Year 1",
            description="Study voltage gain, inverting/non-inverting configurations, and supply rail saturation clipping.",
            version="2.0.0",
            validation_level=ValidationLevel.EXPERIMENTALLY_VALIDATED,
            authors=["VAIL Electronics Team"],
            tags=["electronics", "opamp", "ic741", "analog_circuits"],
        )

    def validate_params(self, params: Dict[str, Any]) -> List[str]:
        errors = []
        rf = params.get("rf", 50)
        rin = params.get("rin", params.get("r1", 10))
        vcc = params.get("vcc", 15)
        if rf <= 0 or rin <= 0:
            errors.append("Resistors must be positive.")
        if vcc <= 0 or vcc > 22:
            errors.append("Vcc supply rails must be between 1 and 22 V.")
        return errors

    def compute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        mode = str(params.get("mode", "INVERTING")).upper()
        vin = float(params.get("vin", 1.5))
        rf = float(params.get("rf", 50.0))
        rin = float(params.get("rin", params.get("r1", 10.0)))
        vcc = float(params.get("vcc", 15.0))
        v_sat = max(0.0, vcc - 2.0)  # Internal transistor dropout ~2V

        is_inverting = "NON" not in mode and "INV" in mode
        if is_inverting:
            gain = -(rf / rin)
        else:
            gain = 1.0 + (rf / rin)

        vout_unclipped = gain * vin
        vout_clipped = max(-v_sat, min(v_sat, vout_unclipped))
        is_saturated = abs(vout_unclipped) >= v_sat

        return {
            "configuration": "INVERTING" if is_inverting else "NON_INVERTING",
            "voltage_gain_av": round(float(gain), 3),
            "vout_linear_volts": round(float(vout_unclipped), 3),
            "vout_actual_volts": round(float(vout_clipped), 3),
            "saturation_limit_volts": round(float(v_sat), 2),
            "is_saturated": bool(is_saturated),
        }

    def get_parameter_schema(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "mode": {"type": "string", "enum": ["INVERTING", "NON_INVERTING"], "default": "INVERTING"},
                "vin": {"type": "number", "default": 1.5, "minimum": -15.0, "maximum": 15.0},
                "rf": {"type": "number", "default": 50.0, "minimum": 1.0, "maximum": 500.0},
                "rin": {"type": "number", "default": 10.0, "minimum": 1.0, "maximum": 100.0},
                "vcc": {"type": "number", "default": 15.0, "minimum": 5.0, "maximum": 20.0},
            },
            "required": ["mode", "vin", "rf", "rin"],
        }
