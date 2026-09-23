import React, { useState } from 'react';
import Scene3D from "./impulsemomentum3d";
import CollisionCharts from "./impulsemomentumcharts"; // Import the new charts
import ValidatedParameterControl from "./ValidatedParameterControl";
import { ENDPOINTS } from "./apiConfig";

export default function ImpulseMomentum({ onSaveData, onSimulationUpdate }) {
  const [params, setParams] = useState({
    mass_1: 1.0,
    initial_velocity_1: 1.5,
    mass_2: 1.0,
    initial_velocity_2: -1.0,
    restitution_coefficient: 1.0,
  });

  const [invalidInputs, setInvalidInputs] = useState({});
  const hasInvalid = Object.values(invalidInputs).some(Boolean);
  const setFieldInvalid = (field, isVal) => setInvalidInputs(p => ({ ...p, [field]: !isVal }));

  React.useEffect(() => {
    if (onSimulationUpdate) {
      const p1 = params.mass_1 * params.initial_velocity_1;
      const p2 = params.mass_2 * params.initial_velocity_2;
      onSimulationUpdate({
        v1: Number(params.initial_velocity_1.toFixed(2)),
        v2: Number(params.initial_velocity_2.toFixed(2)),
        mass1: Number(params.mass_1.toFixed(2)),
        mass2: Number(params.mass_2.toFixed(2)),
        p1: Number(p1.toFixed(3)),
        p2: Number(p2.toFixed(3)),
        totalMomentum: Number((p1 + p2).toFixed(3)),
        restitution: params.restitution_coefficient,
      });
    }
  }, [params, onSimulationUpdate]);

  const [results, setResults] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sceneKey, setSceneKey] = useState(0); 
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (e) => {
    setParams({ ...params, [e.target.name]: parseFloat(e.target.value) });
  };

  const handleParamChange = (name, value) => {
    setParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setParams({
      mass_1: 1.0,
      initial_velocity_1: 0.0,
      mass_2: 1.0,
      initial_velocity_2: 0.0,
      restitution_coefficient: 1.0,
    });
    setResults(null);
    setIsPlaying(false);
    setSceneKey((prev) => prev + 1);
  };

  const handleReturnToStart = () => {
    setIsPlaying(false);
    setSceneKey((prev) => prev + 1);
  };

  const handleSimulate = async () => {
    try {
      const response = await fetch(ENDPOINTS.impulseCollision, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setResults(data);
      setIsPlaying(true);
      setSceneKey((prev) => prev + 1); 
    } catch (error) {
      console.warn("Backend collision service unavailable, falling back to local physics:", error);
      const m1 = params.mass_1, m2 = params.mass_2;
      const u1 = params.initial_velocity_1, u2 = params.initial_velocity_2;
      const e = params.restitution_coefficient;
      const totalMass = m1 + m2;
      const v1 = ((m1 - e * m2) * u1 + (1 + e) * m2 * u2) / totalMass;
      const v2 = ((1 + e) * m1 * u1 + (m2 - e * m1) * u2) / totalMass;
      const pInitial = m1 * u1 + m2 * u2;
      const pFinal = m1 * v1 + m2 * v2;
      const keInitial = 0.5 * m1 * (u1 ** 2) + 0.5 * m2 * (u2 ** 2);
      const keFinal = 0.5 * m1 * (v1 ** 2) + 0.5 * m2 * (v2 ** 2);
      setResults({
        success: true,
        restitution_coefficient: e,
        object_1: { mass_kg: m1, initial_velocity_m_per_s: u1, final_velocity_m_per_s: Number(v1.toFixed(4)), impulse_N_s: Number((m1 * (v1 - u1)).toFixed(4)) },
        object_2: { mass_kg: m2, initial_velocity_m_per_s: u2, final_velocity_m_per_s: Number(v2.toFixed(4)), impulse_N_s: Number((m2 * (v2 - u2)).toFixed(4)) },
        system: { total_initial_momentum: Number(pInitial.toFixed(4)), total_final_momentum: Number(pFinal.toFixed(4)), initial_kinetic_energy_J: Number(keInitial.toFixed(4)), final_kinetic_energy_J: Number(keFinal.toFixed(4)), kinetic_energy_loss_J: Number((keInitial - keFinal).toFixed(4)) }
      });
      setIsPlaying(true);
      setSceneKey((prev) => prev + 1);
    }
  };

  // Save observation matching App.jsx keys: mass, velocity, force, time, impulse, deltaP
  const handleSaveObservation = () => {
    const mass = params.mass_1;
    const vInitial = params.initial_velocity_1;

    // Retrieve final velocity from backend results or compute 1D elastic collision fallback
    const vFinal = results?.object_1?.final_velocity_m_per_s ?? 
      ((params.mass_1 - params.restitution_coefficient * params.mass_2) * vInitial +
        (1 + params.restitution_coefficient) * params.mass_2 * params.initial_velocity_2) /
      (params.mass_1 + params.mass_2);

    // Momentum change: Δp = m * (v_final - v_initial)
    const deltaP = Math.abs(mass * (vFinal - vInitial));

    // Collision duration estimate for dynamic cart collision
    const collisionTime = 0.05; // 50 ms contact window
    const force = deltaP / collisionTime; // F = Δp / Δt
    const impulse = force * collisionTime; // J = F * Δt

    if (onSaveData) {
      onSaveData({
        mass: Number(mass).toFixed(2),
        velocity: Number(vInitial).toFixed(2),
        force: Number(force).toFixed(2),
        time: Number(collisionTime).toFixed(3),
        impulse: Number(impulse).toFixed(3),
        deltaP: Number(deltaP).toFixed(3),
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  return (
    <div style={{ width: "100%", boxSizing: "border-box", fontFamily: "Arial, Helvetica, sans-serif" }}>
      {/* Title */}
      <div style={{ marginBottom: "18px" }}>
        <h2 style={{ margin: 0, fontSize: "26px", color: "#38bdf8", fontWeight: 800 }}>
          💥 Impulse & Momentum Collision Laboratory
        </h2>
        <p style={{ marginTop: "6px", marginBottom: 0, color: "#94a3b8", fontSize: "14px" }}>
          Simulate 1D dynamic cart collisions with photogate telemetry, momentum conservation, and kinetic energy analysis.
        </p>
      </div>

      {/* Main Grid: Control Panel (Left) + 3D View & Charts (Right) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(310px, 350px) minmax(0, 1fr)",
          gap: "20px",
          alignItems: "start",
        }}
      >
        {/* LEFT SIDEBAR: Controls */}
        <div className="sim-control-panel">
          <div className="sim-panel-title">Track Parameters</div>
          
          {/* LABORATORY REAL-TIME CALIBRATION CAUTION */}
          <div className="lab-caution-banner">
            <span className="lab-caution-icon">⚠️</span>
            <div className="lab-caution-content">
              <div className="lab-caution-title">Real-Time Lab Calibration</div>
              <div className="lab-caution-text">
                Track dynamics parameters (cart mass 0.10–5.00 kg, velocities -5.0 to +5.0 m/s, restitution 0.0–1.0) are strictly calibrated to physical university dynamics air tracks and collision carts. Values outside this range will be rejected.
              </div>
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <h3 className="sim-section-header">Cart 1 (Blue)</h3>
            <ValidatedParameterControl
              label="Mass"
              limitHint="0.10 – 5.00 kg"
              value={params.mass_1}
              unit="kg"
              min={0.10}
              max={5.00}
              step={0.05}
              formatDecimals={2}
              onChange={(val) => handleParamChange("mass_1", val)}
              onValidityChange={(isVal) => setFieldInvalid("mass_1", isVal)}
            />

            <ValidatedParameterControl
              label="Initial Velocity"
              limitHint="-5.0 – +5.0 m/s"
              value={params.initial_velocity_1}
              unit="m/s"
              min={-5.0}
              max={5.0}
              step={0.1}
              formatDecimals={1}
              onChange={(val) => handleParamChange("initial_velocity_1", val)}
              onValidityChange={(isVal) => setFieldInvalid("initial_velocity_1", isVal)}
            />

            <h3 className="sim-section-header">Cart 2 (Green)</h3>
            <ValidatedParameterControl
              label="Mass"
              limitHint="0.10 – 5.00 kg"
              value={params.mass_2}
              unit="kg"
              min={0.10}
              max={5.00}
              step={0.05}
              formatDecimals={2}
              onChange={(val) => handleParamChange("mass_2", val)}
              onValidityChange={(isVal) => setFieldInvalid("mass_2", isVal)}
            />

            <ValidatedParameterControl
              label="Initial Velocity"
              limitHint="-5.0 – +5.0 m/s"
              value={params.initial_velocity_2}
              unit="m/s"
              min={-5.0}
              max={5.0}
              step={0.1}
              formatDecimals={1}
              onChange={(val) => handleParamChange("initial_velocity_2", val)}
              onValidityChange={(isVal) => setFieldInvalid("initial_velocity_2", isVal)}
            />

            <h3 className="sim-section-header">Environment</h3>
            <ValidatedParameterControl
              label="Coefficient of Restitution (Elasticity)"
              limitHint="0.0 – 1.0 (0=Inelastic, 1=Elastic)"
              value={params.restitution_coefficient}
              unit="coeff (e)"
              min={0.0}
              max={1.0}
              step={0.05}
              formatDecimals={2}
              onChange={(val) => handleParamChange("restitution_coefficient", val)}
              onValidityChange={(isVal) => setFieldInvalid("restitution_coefficient", isVal)}
            />
          </div>

          {hasInvalid && (
            <div className="sim-input-error-msg" style={{ marginBottom: "12px", padding: "6px 10px" }}>
              ⚠️ Cannot fire carts: One or more parameters exceed permissible lab range. Please correct invalid inputs.
            </div>
          )}

          {/* BEAUTIFIED ACTION BUTTONS */}
          <button 
            onClick={handleSimulate} 
            disabled={hasInvalid}
            className="sim-btn-primary"
            style={{ width: "100%", marginTop: "14px" }}
            title="Launch dynamic collision test"
          >
            🚀 Fire Carts
          </button>

          <button 
            onClick={handleReturnToStart} 
            className="sim-btn-slate"
            style={{ width: "100%", marginTop: "10px" }}
            title="Return carts back to their starting positions"
          >
            ↩ Reset Track
          </button>

          {/* SAVE READING BUTTON */}
          <button 
            onClick={handleSaveObservation} 
            className="sim-btn-success"
            style={{ width: "100%", marginTop: "10px" }}
            title="Log collision kinematics into observation table"
          >
            📥 Save to Observations
          </button>

          {/* RESET BUTTON */}
          <button 
            onClick={handleReset} 
            className="sim-btn-reset"
            style={{ width: "100%", marginTop: "10px" }}
            title="Reset parameters to 0 m/s defaults and reset scene"
          >
            <span>🔄</span> Reset to Baseline (0 m/s)
          </button>

          {savedSuccess && (
            <div style={{ 
              marginTop: "8px", 
              padding: "6px 10px", 
              borderRadius: "6px", 
              background: "rgba(16, 185, 129, 0.15)", 
              border: "1px solid #10b981", 
              color: "#34d399", 
              fontSize: "12px", 
              fontWeight: "700", 
              textAlign: "center" 
            }}>
              ✓ Reading saved to observation table!
            </div>
          )}

          {results && (
            <div className="sim-highlight-card" style={{ marginTop: "16px" }}>
              <div className="sim-highlight-card-title" style={{ marginBottom: "8px" }}>Photogate Readings</div>
              <div className="sim-calc-row">
                <span className="sim-calc-label">Cart 1 Final:</span>
                <span className="sim-calc-val-accent">{results.object_1.final_velocity_m_per_s} m/s</span>
              </div>
              <div className="sim-calc-row">
                <span className="sim-calc-label">Cart 2 Final:</span>
                <span className="sim-calc-val-accent">{results.object_2.final_velocity_m_per_s} m/s</span>
              </div>
              <div className="sim-calc-row" style={{ marginTop: "4px" }}>
                <span className="sim-calc-label">KE Loss:</span>
                <span className="sim-calc-val-warning">{results.system.kinetic_energy_loss_J} J</span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT WORKSPACE: 3D Scene + Charts */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px", minWidth: 0 }}>
          {/* 3D Canvas */}
          <div 
            style={{ 
              height: "440px", 
              borderRadius: "12px", 
              overflow: "hidden", 
              border: "1px solid #1e3a5f", 
              background: "#071321" 
            }}
          >
            <Scene3D key={sceneKey} params={params} results={results} isPlaying={isPlaying} />
          </div>

          {/* Charts */}
          <div className="sim-graph-card" style={{ marginTop: 0, padding: "18px" }}>
            <CollisionCharts params={params} results={results} />
          </div>
        </div>

      </div>
    </div>
  );
}
