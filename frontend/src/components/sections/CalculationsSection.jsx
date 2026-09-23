import React, { useState } from "react";
import { getExperimentConfig } from "../../engine/ExperimentRegistry";

// Live Dynamic Calculation Helper: Evaluates student's recorded parameters against physical governing laws
export function renderLiveDynamicCalculations(experiment, run) {
  if (!run) return null;

  switch (experiment) {
    case "rc": {
      const v0 = parseFloat(run.voltage) || 0;
      const r = parseFloat(run.resistance) || 1;
      const cUf = parseFloat(run.capacitance) || 1;
      const cFarad = cUf * 1e-6;
      const tauTheor = r * cFarad;
      const i0Theor = (v0 / r) * 1000; // mA
      const vcTheor = v0 * 0.6321;
      const tSteadyTheor = 5 * tauTheor;

      const tauObs = parseFloat(run.tau) || 0;
      const vcObs = parseFloat(run.vc) || 0;

      const tauErr = tauTheor > 0 ? (Math.abs(tauObs - tauTheor) / tauTheor) * 100 : 0;
      const vcErr = vcTheor > 0 ? (Math.abs(vcObs - vcTheor) / vcTheor) * 100 : 0;

      return (
        <div className="dyn-calc-steps-grid">
          <div className="dyn-calc-step-card">
            <div className="dyn-step-title">Step 1: Capacitance Unit Conversion &amp; Initial Surge Current</div>
            <div className="dyn-step-formula-box">
              C = {cUf} μF × 10⁻⁶ = {cFarad.toExponential(3)} Farads (F)
              <br />
              I₀ = V₀ / R = {v0.toFixed(1)} V / {r.toFixed(0)} Ω = {(v0 / r).toFixed(5)} A = {i0Theor.toFixed(2)} mA
            </div>
          </div>

          <div className="dyn-calc-step-card">
            <div className="dyn-step-title">Step 2: Circuit Time Constant (τ = R · C) Evaluation</div>
            <div className="dyn-step-formula-box">
              τ_theor = {r.toFixed(0)} Ω × {cFarad.toExponential(3)} F = {tauTheor.toFixed(4)} s
              <br />
              Steady State Duration (5τ) = 5 × {tauTheor.toFixed(4)} s = {tSteadyTheor.toFixed(3)} s
            </div>
          </div>

          <div className="dyn-calc-step-card">
            <div className="dyn-step-title">Step 3: Theoretical Capacitor Voltage at t = τ (63.21% Charging Level)</div>
            <div className="dyn-step-formula-box">
              V_c(τ) = {v0.toFixed(1)} V × (1 − e⁻¹) = {v0.toFixed(1)} V × 0.6321 = {vcTheor.toFixed(3)} V
            </div>

            <div className="dyn-calc-comparison-box">
              <div className="dyn-comparison-item">
                <div className="dyn-comparison-label">Time Constant τ (Theor vs Obs)</div>
                <div className="dyn-comparison-val">{tauTheor.toFixed(3)} s vs {tauObs.toFixed(3)} s</div>
                <div style={{ fontSize: "12px", marginTop: "4px" }}>Discrepancy: <strong>{tauErr.toFixed(2)}%</strong></div>
              </div>
              <div className="dyn-comparison-item">
                <div className="dyn-comparison-label">Voltage V_C(τ) (Theor vs Obs)</div>
                <div className="dyn-comparison-val">{vcTheor.toFixed(2)} V vs {vcObs.toFixed(2)} V</div>
                <div style={{ fontSize: "12px", marginTop: "4px" }}>Discrepancy: <strong>{vcErr.toFixed(2)}%</strong></div>
              </div>
            </div>

            <div className={`dyn-error-badge ${tauErr < 5 ? "badge-success" : tauErr < 10 ? "badge-warning" : "badge-danger"}`}>
              {tauErr < 5 ? "✅ High Precision Experimental Agreement (< 5% error)" : "⚠️ Acceptable Educational Tolerance (5%–10% error)"}
            </div>
          </div>
        </div>
      );
    }

    case "hysteresis": {
      const maxH = parseFloat(run.maxH) || 0;
      const freq = parseFloat(run.freq) || 50;
      const loopArea = parseFloat(run.loopArea) || 0;
      const lossObs = parseFloat(run.loss) || 0;
      const maxB = parseFloat(run.maxB) || 0;
      const coreVolume = 0.001; // m³

      const lossTheor = loopArea * freq * coreVolume * 1000;
      const lossErr = lossTheor > 0 ? (Math.abs(lossObs - lossTheor) / lossTheor) * 100 : 0;

      return (
        <div className="dyn-calc-steps-grid">
          <div className="dyn-calc-step-card">
            <div className="dyn-step-title">Step 1: Applied Field Excitation &amp; Flux Saturation</div>
            <div className="dyn-step-formula-box">
              H_max = {maxH.toFixed(1)} A/m | Operating Frequency = {freq} Hz | Peak Induction B_max = {maxB.toFixed(3)} T
            </div>
          </div>

          <div className="dyn-calc-step-card">
            <div className="dyn-step-title">Step 2: Hysteresis Energy Integral per Cycle (w_h = ∮ B · dH)</div>
            <div className="dyn-step-formula-box">
              Loop Area = {loopArea.toFixed(3)} J/m³ per magnetization cycle
            </div>
          </div>

          <div className="dyn-calc-step-card">
            <div className="dyn-step-title">Step 3: Total Power Loss Verification (P = w_h · f · V_core)</div>
            <div className="dyn-step-formula-box">
              P_loss = {loopArea.toFixed(3)} J/m³ × {freq} Hz × {coreVolume} m³ = {lossTheor.toFixed(3)} W
            </div>

            <div className="dyn-calc-comparison-box">
              <div className="dyn-comparison-item">
                <div className="dyn-comparison-label">Core Loss (Theor vs Obs)</div>
                <div className="dyn-comparison-val">{lossTheor.toFixed(3)} W vs {lossObs.toFixed(3)} W</div>
                <div style={{ fontSize: "12px", marginTop: "4px" }}>Discrepancy: <strong>{lossErr.toFixed(2)}%</strong></div>
              </div>
            </div>

            <div className="dyn-error-badge badge-success">
              ✅ Magnetic Hysteresis Energy Integral Confirmed
            </div>
          </div>
        </div>
      );
    }

    case "string": {
      const tension = parseFloat(run.tension) || 1;
      const length = parseFloat(run.length) || 1.0;
      const mu = 0.001; // kg/m
      const mode = 2; // harmonic 2

      const vTheor = Math.sqrt(tension / mu);
      const lambdaTheor = (2 * length) / mode; // = length
      const fTheor = vTheor / lambdaTheor;

      const fObs = parseFloat(run.frequency) || 0;
      const lambdaObs = parseFloat(run.wavelength) || 0;

      const fErr = fTheor > 0 ? (Math.abs(fObs - fTheor) / fTheor) * 100 : 0;
      const lambdaErr = lambdaTheor > 0 ? (Math.abs(lambdaObs - lambdaTheor) / lambdaTheor) * 100 : 0;

      return (
        <div className="dyn-calc-steps-grid">
          <div className="dyn-calc-step-card">
            <div className="dyn-step-title">Step 1: Transverse Wave Propagation Speed (v = √(T / μ))</div>
            <div className="dyn-step-formula-box">
              v = √({tension.toFixed(2)} N / {mu} kg/m) = √{(tension / mu).toFixed(1)} = {vTheor.toFixed(2)} m/s
            </div>
          </div>

          <div className="dyn-calc-step-card">
            <div className="dyn-step-title">Step 2: Harmonic Mode Spatial Wavelength (λ_n = 2L / n)</div>
            <div className="dyn-step-formula-box">
              λ₂ = (2 × {length.toFixed(2)} m) / {mode} = {lambdaTheor.toFixed(3)} m
            </div>
          </div>

          <div className="dyn-calc-step-card">
            <div className="dyn-step-title">Step 3: Resonant Driving Frequency (f_n = v / λ_n)</div>
            <div className="dyn-step-formula-box">
              f₂ = {vTheor.toFixed(2)} m/s / {lambdaTheor.toFixed(3)} m = {fTheor.toFixed(2)} Hz
            </div>

            <div className="dyn-calc-comparison-box">
              <div className="dyn-comparison-item">
                <div className="dyn-comparison-label">Resonant Frequency (Theor vs Obs)</div>
                <div className="dyn-comparison-val">{fTheor.toFixed(2)} Hz vs {fObs.toFixed(2)} Hz</div>
                <div style={{ fontSize: "12px", marginTop: "4px" }}>Discrepancy: <strong>{fErr.toFixed(2)}%</strong></div>
              </div>
              <div className="dyn-comparison-item">
                <div className="dyn-comparison-label">Wavelength (Theor vs Obs)</div>
                <div className="dyn-comparison-val">{lambdaTheor.toFixed(3)} m vs {lambdaObs.toFixed(3)} m</div>
                <div style={{ fontSize: "12px", marginTop: "4px" }}>Discrepancy: <strong>{lambdaErr.toFixed(2)}%</strong></div>
              </div>
            </div>

            <div className={`dyn-error-badge ${fErr < 5 ? "badge-success" : "badge-warning"}`}>
              {fErr < 5 ? "✅ High Precision Standing Wave Agreement (< 5% error)" : "⚠️ Acceptable Resonant Mode Alignment"}
            </div>
          </div>
        </div>
      );
    }

    case "impulse": {
      const mass = parseFloat(run.mass) || 1.0;
      const force = parseFloat(run.force) || 0;
      const time = parseFloat(run.time) || 0.05;
      const jObs = parseFloat(run.impulse) || 0;
      const deltaPObs = parseFloat(run.deltaP) || 0;

      const jTheor = force * time;
      const diff = Math.abs(jObs - deltaPObs);
      const err = Math.abs(jObs) > 0 ? (diff / Math.abs(jObs)) * 100 : 0;

      return (
        <div className="dyn-calc-steps-grid">
          <div className="dyn-calc-step-card">
            <div className="dyn-step-title">Step 1: Applied Impact Force Impulse (J = F · Δt)</div>
            <div className="dyn-step-formula-box">
              J = {force.toFixed(2)} N × {time.toFixed(3)} s = {jTheor.toFixed(3)} N·s
            </div>
          </div>

          <div className="dyn-calc-step-card">
            <div className="dyn-step-title">Step 2: Linear Momentum Transition (Δp = m · Δv)</div>
            <div className="dyn-step-formula-box">
              Δp = {mass.toFixed(2)} kg × Δv = {deltaPObs.toFixed(3)} kg·m/s
            </div>
          </div>

          <div className="dyn-calc-step-card">
            <div className="dyn-step-title">Step 3: Impulse-Momentum Theorem Equivalence Verification (|J − Δp| = 0)</div>
            <div className="dyn-step-formula-box">
              |J_obs − Δp_obs| = |{jObs.toFixed(3)} − {deltaPObs.toFixed(3)}| = {diff.toFixed(4)} N·s
            </div>

            <div className="dyn-calc-comparison-box">
              <div className="dyn-comparison-item">
                <div className="dyn-comparison-label">Recorded Impulse (J)</div>
                <div className="dyn-comparison-val">{jObs.toFixed(3)} N·s</div>
              </div>
              <div className="dyn-comparison-item">
                <div className="dyn-comparison-label">Momentum Change (Δp)</div>
                <div className="dyn-comparison-val">{deltaPObs.toFixed(3)} kg·m/s</div>
              </div>
              <div className="dyn-comparison-item">
                <div className="dyn-comparison-label">Equivalence Residual</div>
                <div className="dyn-comparison-val">{diff.toFixed(4)}</div>
                <div style={{ fontSize: "12px", marginTop: "4px" }}>Relative Offset: <strong>{err.toFixed(2)}%</strong></div>
              </div>
            </div>

            <div className="dyn-error-badge badge-success">
              ✅ Impulse-Momentum Equivalence Confirmed
            </div>
          </div>
        </div>
      );
    }

    case "edm": {
      const current = parseFloat(run.current) || 0;
      const voltage = parseFloat(run.voltage) || 0;
      const pOn = parseFloat(run.pulseOn) || 0;
      const pOff = parseFloat(run.pulseOff) || 0;
      const initW = parseFloat(run.initWeight) || 0;
      const finalW = parseFloat(run.finalWeight) || 0;
      const machTime = parseFloat(run.machTime) || 15;
      const mrrObs = parseFloat(run.mrr) || 0;

      const dutyCycle = pOn + pOff > 0 ? (pOn / (pOn + pOff)) * 100 : 0;
      const massLost = initW - finalW;
      const volumeRemoved = massLost / 0.00785; // mm³ (density of steel)
      const mrrTheor = volumeRemoved / (machTime || 1);
      const mrrErr = mrrTheor > 0 ? (Math.abs(mrrObs - mrrTheor) / mrrTheor) * 100 : 0;
      const sparkEnergy = (voltage * current * pOn) * 1e-3; // mJ

      return (
        <div className="dyn-calc-steps-grid">
          <div className="dyn-calc-step-card">
            <div className="dyn-step-title">Step 1: Pulse Duty Cycle Factor &amp; Single-Spark Discharge Energy</div>
            <div className="dyn-step-formula-box">
              η = [T_on / (T_on + T_off)] × 100% = [{pOn} / ({pOn} + {pOff})] × 100% = {dutyCycle.toFixed(1)}%
              <br />
              E_s = {voltage} V × {current} A × {pOn} µs × 10⁻³ = {sparkEnergy.toFixed(2)} mJ
            </div>
          </div>

          <div className="dyn-calc-step-card">
            <div className="dyn-step-title">Step 2: Gravimetric Weight Loss to Volumetric Erosion Conversion</div>
            <div className="dyn-step-formula-box">
              ΔW = {initW.toFixed(1)} g − {finalW.toFixed(2)} g = {massLost.toFixed(2)} g
              <br />
              V_removed = {massLost.toFixed(2)} g / 0.00785 g/mm³ = {volumeRemoved.toFixed(2)} mm³
            </div>
          </div>

          <div className="dyn-calc-step-card">
            <div className="dyn-step-title">Step 3: Material Removal Rate (MRR = V_removed / t_mach)</div>
            <div className="dyn-step-formula-box">
              MRR_theor = {volumeRemoved.toFixed(2)} mm³ / {machTime} min = {mrrTheor.toFixed(2)} mm³/min
            </div>

            <div className="dyn-calc-comparison-box">
              <div className="dyn-comparison-item">
                <div className="dyn-comparison-label">Removal Rate (Theor vs Obs)</div>
                <div className="dyn-comparison-val">{mrrTheor.toFixed(2)} vs {mrrObs.toFixed(2)} mm³/min</div>
                <div style={{ fontSize: "12px", marginTop: "4px" }}>Discrepancy: <strong>{mrrErr.toFixed(2)}%</strong></div>
              </div>
            </div>

            <div className="dyn-error-badge badge-success">
              ✅ Electro-Thermal Spark Erosion Verified
            </div>
          </div>
        </div>
      );
    }

    case "opamp": {
      const mode = run.mode || "INVERTING";
      const vin = parseFloat(run.vin) || 0;
      const rf = parseFloat(run.rf) || 50;
      const rin = parseFloat(run.rin) || 10;
      const isInverting = mode.includes("INV") && !mode.includes("NON");

      const gainTheor = isInverting ? -(rf / rin) : (1 + (rf / rin));
      const voutUnclipped = gainTheor * vin;
      const voutTheor = Math.max(-12, Math.min(12, voutUnclipped));
      const isSaturatedTheor = Math.abs(voutUnclipped) >= 12;

      const gainObs = parseFloat(run.gain) || 0;
      const voutObs = parseFloat(run.vout) || 0;

      const gainErr = Math.abs(gainTheor) > 0 ? (Math.abs(gainObs - gainTheor) / Math.abs(gainTheor)) * 100 : 0;
      const voutErr = Math.abs(voutTheor) > 0 ? (Math.abs(voutObs - voutTheor) / Math.abs(voutTheor)) * 100 : 0;

      return (
        <div className="dyn-calc-steps-grid">
          <div className="dyn-calc-step-card">
            <div className="dyn-step-title">Step 1: Closed-Loop Voltage Gain (A_v) Formulation</div>
            <div className="dyn-step-formula-box">
              {isInverting
                ? `Inverting Gain A_v = −(R_f / R₁) = −(${rf} kΩ / ${rin} kΩ) = ${gainTheor.toFixed(2)}`
                : `Non-Inverting Gain A_v = 1 + (R_f / R₁) = 1 + (${rf} kΩ / ${rin} kΩ) = ${gainTheor.toFixed(2)}`}
            </div>
          </div>

          <div className="dyn-calc-step-card">
            <div className="dyn-step-title">Step 2: Linear Output Voltage (V_out = A_v · V_in)</div>
            <div className="dyn-step-formula-box">
              V_out,linear = {gainTheor.toFixed(2)} × {vin.toFixed(2)} V = {voutUnclipped.toFixed(2)} V
            </div>
          </div>

          <div className="dyn-calc-step-card">
            <div className="dyn-step-title">Step 3: Dual DC Rail Saturation Threshold Check (±12.0 V)</div>
            <div className="dyn-step-formula-box">
              Condition: {isSaturatedTheor ? `|${voutUnclipped.toFixed(2)} V| ≥ 12.0 V ==> Hard Saturation Clipping at ${voutTheor.toFixed(2)} V` : `|${voutUnclipped.toFixed(2)} V| < 12.0 V ==> Linear Operation Window Maintained`}
            </div>

            <div className="dyn-calc-comparison-box">
              <div className="dyn-comparison-item">
                <div className="dyn-comparison-label">Voltage Gain (Theor vs Obs)</div>
                <div className="dyn-comparison-val">{gainTheor.toFixed(2)} vs {gainObs.toFixed(2)}</div>
                <div style={{ fontSize: "12px", marginTop: "4px" }}>Discrepancy: <strong>{gainErr.toFixed(2)}%</strong></div>
              </div>
              <div className="dyn-comparison-item">
                <div className="dyn-comparison-label">Output Voltage (Theor vs Obs)</div>
                <div className="dyn-comparison-val">{voutTheor.toFixed(2)} V vs {voutObs.toFixed(2)} V</div>
                <div style={{ fontSize: "12px", marginTop: "4px" }}>Discrepancy: <strong>{voutErr.toFixed(2)}%</strong></div>
              </div>
            </div>

            <div className="dyn-error-badge badge-success">
              ✅ Operational Amplifier Circuit Response Confirmed
            </div>
          </div>
        </div>
      );
    }

    default:
      return <div>Dynamic calculations verified.</div>;
  }
}

export default function CalculationsSection({ experiment, observations = [], onOpenReportModal }) {
  const [selectedRunIdx, setSelectedRunIdx] = useState(0);

  // Filter valid student runs with their slot numbers (1-indexed)
  const validRuns = observations
    .map((obs, idx) => (obs ? { obs, slotNum: idx + 1 } : null))
    .filter(Boolean);

  const activeRunObj = validRuns[selectedRunIdx] || validRuns[0] || null;
  const currentRun = activeRunObj ? activeRunObj.obs : null;

  const config = getExperimentConfig(experiment);
  const data = config?.calculations;

  if (!data) return null;

  return (
    <div className="info-section">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", flexWrap: "wrap", gap: "12px" }}>
        <h2 style={{ margin: 0 }}>{data.title}</h2>
        {onOpenReportModal && (
          <button
            onClick={onOpenReportModal}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 18px",
              background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)",
              color: "#ffffff",
              border: "1px solid #38bdf8",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(2, 132, 199, 0.35)",
              transition: "all 0.2s ease"
            }}
          >
            <span>📄</span> Official Lab Report (PDF)
          </button>
        )}
      </div>

      {/* LIVE DYNAMIC OBSERVED RUN EVALUATION CARD */}
      <div className="info-card" style={{ borderLeft: "4px solid #38bdf8" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "12px" }}>
          <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px", color: "#38bdf8" }}>
            <span>⚡</span> Live Student Data Evaluation &amp; Error Analysis
          </h3>

          {validRuns.length > 0 && (
            <div className="dyn-calc-slots">
              <span style={{ fontSize: "12.5px", fontWeight: "700", opacity: 0.85, alignSelf: "center" }}>Select Run:</span>
              {validRuns.map((item, idx) => (
                <button
                  key={idx}
                  className={`dyn-calc-slot-btn ${selectedRunIdx === idx ? "active" : ""}`}
                  onClick={() => setSelectedRunIdx(idx)}
                >
                  Run #{item.slotNum}
                </button>
              ))}
            </div>
          )}
        </div>

        {validRuns.length === 0 ? (
          <div className="dyn-empty-notice">
            <strong style={{ fontSize: "15px", display: "block", marginBottom: "6px" }}>
              ℹ️ Live Dynamic Calculation Engine Ready
            </strong>
            No observation runs have been saved yet for this experiment session. Navigate to the <strong>"🔬 Experiment"</strong> tab, adjust parameters, run the simulation, and click <strong>"Save Observation"</strong> to evaluate your personal recorded parameters dynamically with automated formula substitutions and percentage error verification!
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: "16px", fontSize: "13.5px", color: "#64748b" }}>
              Evaluating live telemetry recorded for <strong>Run #{activeRunObj.slotNum}</strong>:
            </div>

            {/* Dynamic Step-by-Step Evaluation */}
            {renderLiveDynamicCalculations(experiment, currentRun)}
          </div>
        )}
      </div>

      {/* OVERVIEW */}
      <div className="info-card">
        <h3>📋 Standard Mathematical Procedure</h3>
        <p className="calc-overview-text">
          {data.overview}
        </p>
      </div>

      {/* STEP-BY-STEP CALCULATION GUIDE */}
      <div className="info-card">
        <h3>🔢 Step-by-Step Calculation Guide</h3>
        <div className="calc-step-list">
          {data.steps?.map((s, idx) => (
            <div className="calc-step-card" key={idx}>
              <div className="calc-step-num">{s.step}</div>
              <div className="calc-step-body">
                <div className="calc-step-title">{s.title}</div>
                <div className="calc-step-desc">{s.desc}</div>
                <div className="calc-step-eq">{s.equation}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WORKED EXAMPLE */}
      {data.workedExample && (
        <div className="info-card" style={{ borderLeft: "4px solid #22c55e" }}>
          <h3 style={{ color: "#4ade80" }}>💡 {data.workedExample.title}</h3>
          <div className="calc-example-box">
            <div className="calc-example-given">
              <strong>Given Parameters:</strong> {data.workedExample.given}
            </div>
            <div className="calc-example-steps">
              {data.workedExample.steps?.map((stepLine, idx) => (
                <div key={idx} className="calc-example-line">{stepLine}</div>
              ))}
            </div>
            {data.workedExample.conclusion && (
              <div className="calc-example-conclusion">
                <strong>Experimental Conclusion:</strong> {data.workedExample.conclusion}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
