import React, { useState } from 'react';
import Scene3D from "./vibrationstring3D"; // Verify this matches your file casing exactly!
import VibrationCharts from "./vibrationstringcharts";
import ValidatedParameterControl from "./ValidatedParameterControl";
import { ENDPOINTS } from "./apiConfig";

export default function VibrationStringSimulation({ onSaveData, onSimulationUpdate }) {
  const [params, setParams] = useState({
    length: 1.0,
    tension: 4.0,
    linear_density: 0.001,
    amplitude: 0.04,
    mode: 2,
    duration: 5.0,
    damping_factor: 0.0,
    spatial_points: 100,
    time_points: 100
  });

  const [invalidInputs, setInvalidInputs] = useState({});
  const hasInvalid = Object.values(invalidInputs).some(Boolean);
  const setFieldInvalid = (field, isVal) => setInvalidInputs(p => ({ ...p, [field]: !isVal }));

  const waveSpeed = Math.sqrt(Math.max(params.tension, 0) / Math.max(params.linear_density, 0.0001));
  const frequency = (params.mode / (2.0 * Math.max(params.length, 0.1))) * waveSpeed;
  const wavelength = (2.0 * params.length) / Math.max(params.mode, 1);

  React.useEffect(() => {
    if (onSimulationUpdate) {
      onSimulationUpdate({
        tension: Number(params.tension.toFixed(2)),
        frequency: Number(frequency.toFixed(1)),
        wavelength: Number(wavelength.toFixed(2)),
        harmonicMode: params.mode,
        waveSpeed: Number(waveSpeed.toFixed(1)),
        length: params.length,
      });
    }
  }, [params.tension, params.mode, params.length, frequency, wavelength, waveSpeed, onSimulationUpdate]);

  const [results, setResults] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (e) => {
    setParams({ ...params, [e.target.name]: parseFloat(e.target.value) });
  };

  const handleParamChange = (name, value) => {
    setParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setParams({
      length: 1.0,
      tension: 0.0,
      linear_density: 0.001,
      amplitude: 0.05,
      mode: 2,
      duration: 5.0,
      damping_factor: 0.0,
      spatial_points: 100,
      time_points: 100
    });
    setResults(null);
    setIsPlaying(false);
  };

  const handleSimulate = async () => {
    try {
      const response = await fetch(ENDPOINTS.stringSimulate, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setResults(data);
      setIsPlaying(true);
    } catch (error) {
      console.warn("Backend unavailable, executing client-side physics fallback:", error);
      // Resilient local simulation fallback
      const waveSpeed = Math.sqrt(params.tension / params.linear_density);
      const frequency = (params.mode / (2.0 * params.length)) * waveSpeed;
      const omega = 2.0 * Math.PI * frequency;
      const spatialPts = params.spatial_points || 100;
      const timePts = params.time_points || 100;
      const xArr = Array.from({ length: spatialPts }, (_, i) => (i / (spatialPts - 1)) * params.length);
      const tArr = Array.from({ length: timePts }, (_, i) => (i / (timePts - 1)) * params.duration);
      const dispArr = tArr.map((t) =>
        xArr.map((x) =>
          params.amplitude * Math.sin((params.mode * Math.PI * x) / params.length) * Math.cos(omega * t) * (params.damping_factor > 0 ? Math.exp(-params.damping_factor * t) : 1.0)
        )
      );
      setResults({
        success: true,
        parameters: { length_m: params.length, tension_N: params.tension, linear_density_kg_per_m: params.linear_density, amplitude_m: params.amplitude, mode: params.mode },
        physics: { wave_speed_m_per_s: waveSpeed, frequency_hz: frequency, angular_frequency_rad_per_s: omega, wavelength_m: (2.0 * params.length) / params.mode },
        data: { x_m: xArr, time_s: tArr, displacement_m: dispArr }
      });
      setIsPlaying(true);
    }
  };

  // Save observation directly matching App.jsx keys: tension, length, frequency, speed, wavelength
  const handleSaveObservation = () => {
    // Determine wave speed and wavelength from backend results or standard standing wave formula
    const waveSpeed = results?.physics?.wave_speed_m_per_s ?? Math.sqrt(params.tension / params.linear_density);
    const wavelength = results?.physics?.wavelength_m ?? (2 * params.length) / params.mode;
    const frequency = results?.physics?.frequency_hz ?? waveSpeed / wavelength;

    if (onSaveData) {
      onSaveData({
        tension: Number(params.tension).toFixed(2),
        length: Number(params.length).toFixed(2),
        frequency: Number(frequency).toFixed(2),
        speed: Number(waveSpeed).toFixed(2),
        wavelength: Number(wavelength).toFixed(3),
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
          〰️ Melde's String Standing Wave Laboratory
        </h2>
        <p style={{ marginTop: "6px", marginBottom: 0, color: "#94a3b8", fontSize: "14px" }}>
          Investigate standing waves, resonant harmonic loops, and tension dependence using electromagnetic frequency drivers.
        </p>
      </div>

      {/* Main Grid: Control Panel (Left) + 3D Scene & Charts (Right) */}
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
          <div className="sim-panel-title">Oscillator Parameters</div>
          
          {/* LABORATORY REAL-TIME CALIBRATION CAUTION */}
          <div className="lab-caution-banner">
            <span className="lab-caution-icon">⚠️</span>
            <div className="lab-caution-content">
              <div className="lab-caution-title">Real-Time Lab Calibration</div>
              <div className="lab-caution-text">
                String parameters (length 0.30–3.00 m, tension 0.1–25.0 N, modes 1–10, amplitude 0.005–0.120 m) are strictly calibrated to physical university Melde's standing wave benches and slotted laboratory weight sets. Out-of-range inputs will be rejected.
              </div>
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <h3 className="sim-section-header">String Properties</h3>
            
            <div className="sim-param-box">
              <div className="sim-param-title" style={{ marginBottom: "6px" }}>
                String Type (Linear Density)
              </div>
              <select 
                name="linear_density" 
                value={params.linear_density} 
                onChange={handleChange} 
                className="sim-select"
              >
                <option value={0.001}>Fine Copper Wire (0.001 kg/m)</option>
                <option value={0.005}>White Elastic String (0.005 kg/m)</option>
                <option value={0.010}>Thick Heavy Cord (0.010 kg/m)</option>
              </select>
            </div>

            <ValidatedParameterControl
              label="String Length"
              limitHint="0.30 – 3.00 m"
              value={params.length}
              unit="m"
              min={0.30}
              max={3.00}
              step={0.01}
              formatDecimals={2}
              onChange={(val) => handleParamChange("length", val)}
              onValidityChange={(isVal) => setFieldInvalid("length", isVal)}
            />

            <ValidatedParameterControl
              label="Tension"
              limitHint="0.1 – 25.0 N (Slotted Weights)"
              value={params.tension}
              unit="N"
              min={0.1}
              max={25.0}
              step={0.1}
              formatDecimals={1}
              onChange={(val) => handleParamChange("tension", val)}
              onValidityChange={(isVal) => setFieldInvalid("tension", isVal)}
            />

            <h3 className="sim-section-header">Signal Generator</h3>
            
            <ValidatedParameterControl
              label="Harmonic Mode (n)"
              limitHint="1 – 10 loops"
              value={params.mode}
              unit="loops"
              min={1}
              max={10}
              step={1}
              formatDecimals={0}
              onChange={(val) => handleParamChange("mode", parseInt(val))}
              onValidityChange={(isVal) => setFieldInvalid("mode", isVal)}
            />

            <ValidatedParameterControl
              label="Amplitude"
              limitHint="0.005 – 0.120 m"
              value={params.amplitude}
              unit="m"
              min={0.005}
              max={0.12}
              step={0.005}
              formatDecimals={3}
              onChange={(val) => handleParamChange("amplitude", val)}
              onValidityChange={(isVal) => setFieldInvalid("amplitude", isVal)}
            />
          </div>

          {hasInvalid && (
            <div className="sim-input-error-msg" style={{ marginBottom: "12px", padding: "6px 10px" }}>
              ⚠️ Cannot operate generator: One or more parameters exceed permissible lab range. Please correct invalid inputs.
            </div>
          )}

          {/* BEAUTIFIED ACTION BUTTONS */}
          <button 
            onClick={handleSimulate} 
            disabled={hasInvalid}
            className="sim-btn-primary"
            style={{ width: "100%", marginTop: "14px" }}
            title="Power on driver generator and calculate harmonics"
          >
            ⚡ Power On Generator
          </button>

          {/* SAVE READING BUTTON */}
          <button 
            onClick={handleSaveObservation} 
            className="sim-btn-success"
            style={{ width: "100%", marginTop: "10px" }}
            title="Save standing wave metrics to observations"
          >
            📥 Save to Observations
          </button>

          {/* RESET BUTTON */}
          <button 
            onClick={handleReset} 
            className="sim-btn-reset"
            style={{ width: "100%", marginTop: "10px" }}
            title="Reset parameters to 0 N baseline and clear calculations"
          >
            <span>🔄</span> Reset to Baseline (0 N)
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
              <div className="sim-highlight-card-title" style={{ marginBottom: "8px" }}>Theoretical Calculations</div>
              <div className="sim-calc-row">
                <span className="sim-calc-label">Wave Speed (v):</span>
                <span className="sim-calc-val-accent">{results.physics.wave_speed_m_per_s.toFixed(2)} m/s</span>
              </div>
              <div className="sim-calc-row">
                <span className="sim-calc-label">Target Frequency (f):</span>
                <span className="sim-calc-val-accent">{results.physics.frequency_hz.toFixed(2)} Hz</span>
              </div>
              <div className="sim-calc-row">
                <span className="sim-calc-label">Wavelength (λ):</span>
                <span className="sim-calc-val-accent">{results.physics.wavelength_m.toFixed(2)} m</span>
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
            <Scene3D params={params} results={results} isPlaying={isPlaying} />
          </div>

          {/* Charts */}
          <div className="sim-graph-card" style={{ marginTop: 0, padding: "18px" }}>
            <VibrationCharts params={params} results={results} />
          </div>
        </div>

      </div>
    </div>
  );
}