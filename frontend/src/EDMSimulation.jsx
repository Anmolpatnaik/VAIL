import React, { useState } from "react";
import EDM3D from "./EDM3D"; 
import ValidatedParameterControl from "./ValidatedParameterControl";

function EDMSimulation({ onSaveData }) {
  // Input Parameters
  const [toolShape, setToolShape] = useState("cylindrical");
  const [current, setCurrent] = useState(15);
  const [voltage, setVoltage] = useState(50);
  const [pulseOn, setPulseOn] = useState(100);
  const [pulseOff, setPulseOff] = useState(50);

  const [invalidInputs, setInvalidInputs] = useState({});
  const hasInvalid = Object.values(invalidInputs).some(Boolean);
  const setFieldInvalid = (field, isVal) => setInvalidInputs(p => ({ ...p, [field]: !isVal }));

  // Simulation State
  const [isMachining, setIsMachining] = useState(false);
  const [results, setResults] = useState(null);

  const handleRunSimulation = () => {
    setIsMachining(true);
    setResults(null);

    setTimeout(() => {
      const safePulseOff = Math.max(pulseOff || 0, 1);
      const energyFactor = (current * voltage) / 1000;
      const dutyFactor = pulseOn / safePulseOff;
      const shapeMultiplier = toolShape === "cubical" ? 1.1 : 1.0; 

      const calculatedMrr = (current > 0 && voltage > 0)
        ? Math.max(0.1, energyFactor * dutyFactor * 1.8 * shapeMultiplier).toFixed(2)
        : "0.00";
      
      const initWeight = 250.0;
      const machTime = 15;
      const densityOfSteel = 0.00785;
      
      const massRemoved = parseFloat(calculatedMrr) * machTime * densityOfSteel;
      const finalWeight = (initWeight - massRemoved).toFixed(2);

      setResults({
        initWeight: initWeight.toFixed(1),
        finalWeight: finalWeight,
        machTime: machTime,
        mrr: calculatedMrr,
      });
      setIsMachining(false);
    }, 1800);
  };

  const handleReset = () => {
    setCurrent(0);
    setVoltage(0);
    setPulseOn(100);
    setPulseOff(50);
    setToolShape("cylindrical");
    setIsMachining(false);
    setResults(null);
  };

  const handleSaveToTable = () => {
    if (results && onSaveData) {
      onSaveData({
        current: current,
        voltage: voltage,
        pulseOn: pulseOn,
        pulseOff: pulseOff,
        initWeight: results.initWeight,
        finalWeight: results.finalWeight,
        machTime: results.machTime,
        mrr: results.mrr,
      });
    }
  };

  return (
    <div style={{ display: "flex", gap: "20px", height: "600px", width: "100%" }}>
      
      {/* LEFT SIDE: Control Panel (Shifted from Right) */}
      <div 
        className="sim-control-panel"
        style={{ 
          width: "340px", 
          display: "flex", 
          flexDirection: "column", 
          gap: "16px",
          overflowY: "auto"
        }}
      >
        <h3 className="sim-panel-title" style={{ margin: 0, borderBottom: "1px solid rgba(148, 163, 184, 0.2)", paddingBottom: "10px" }}>
          ⚙️ EDM Parameters
        </h3>

        {/* LABORATORY REAL-TIME CALIBRATION CAUTION */}
        <div className="lab-caution-banner" style={{ margin: "0 0 10px 0" }}>
          <span className="lab-caution-icon">⚠️</span>
          <div className="lab-caution-content">
            <div className="lab-caution-title">Real-Time Lab Calibration</div>
            <div className="lab-caution-text">
              Machining parameters (current 1–50 A, gap voltage 15–120 V, pulse ON 10–500 µs, pulse OFF 5–250 µs) are strictly calibrated to industrial spark erosion electrical discharge machines. Out-of-range inputs will be rejected.
            </div>
          </div>
        </div>
        
        {/* Tool Shape Dropdown */}
        <div>
          <label style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#94a3b8", marginBottom: "8px" }}>
            <span>Tool Electrode Shape</span>
          </label>
          <select 
            value={toolShape} 
            onChange={(e) => setToolShape(e.target.value)}
            disabled={isMachining}
            className="sim-select"
          >
            <option value="cylindrical">Cylindrical</option>
            <option value="cubical">Cubical</option>
          </select>
        </div>

        {/* Discharge Current */}
        <ValidatedParameterControl
          label="Discharge Current (I)"
          limitHint="1.0 – 50.0 A (Generator Source)"
          value={current}
          unit="A"
          min={1.0}
          max={50.0}
          step={0.5}
          disabled={isMachining}
          formatDecimals={1}
          onChange={(val) => setCurrent(val)}
          onValidityChange={(isVal) => setFieldInvalid("current", isVal)}
        />

        {/* Gap Voltage */}
        <ValidatedParameterControl
          label="Gap Voltage (V)"
          limitHint="15 – 120 V (Spark Gap)"
          value={voltage}
          unit="V"
          min={15.0}
          max={120.0}
          step={1.0}
          disabled={isMachining}
          formatDecimals={0}
          onChange={(val) => setVoltage(val)}
          onValidityChange={(isVal) => setFieldInvalid("voltage", isVal)}
        />

        {/* Pulse ON Time */}
        <ValidatedParameterControl
          label="Pulse ON Time (Ton)"
          limitHint="10 – 500 µs"
          value={pulseOn}
          unit="µs"
          min={10.0}
          max={500.0}
          step={5.0}
          disabled={isMachining}
          formatDecimals={0}
          onChange={(val) => setPulseOn(val)}
          onValidityChange={(isVal) => setFieldInvalid("pulseOn", isVal)}
        />

        {/* Pulse OFF Time */}
        <ValidatedParameterControl
          label="Pulse OFF Time (Toff)"
          limitHint="5 – 250 µs"
          value={pulseOff}
          unit="µs"
          min={5.0}
          max={250.0}
          step={5.0}
          disabled={isMachining}
          formatDecimals={0}
          onChange={(val) => setPulseOff(val)}
          onValidityChange={(isVal) => setFieldInvalid("pulseOff", isVal)}
        />

        {hasInvalid && (
          <div className="sim-input-error-msg" style={{ marginBottom: "8px", padding: "6px 10px" }}>
            ⚠️ Cannot machine: One or more parameters exceed permissible lab range. Please correct invalid inputs.
          </div>
        )}

        {/* Run Button */}
        <button 
          onClick={handleRunSimulation} 
          disabled={isMachining || hasInvalid} 
          className="sim-btn-primary"
          style={{ marginTop: "12px" }}
        >
          {isMachining ? "⚡ Machining in Progress..." : "▶ Start Machining"}
        </button>

        {/* Reset Button */}
        <button 
          onClick={handleReset} 
          disabled={isMachining} 
          className="sim-btn-reset"
          style={{ marginTop: "10px" }}
          title="Reset parameters to 0 V / 0 A baseline and clear results"
        >
          <span>🔄</span> Reset to Baseline (0 V / 0 A)
        </button>

        {/* Results Box */}
        {results && (
          <div className="sim-highlight-card" style={{ marginTop: "14px", padding: "16px" }}>
            <h4 className="sim-highlight-card-title" style={{ margin: "0 0 12px 0", fontSize: "13px" }}>Simulation Results</h4>
            
            <div className="sim-calc-row">
              <span className="sim-calc-label">Initial Weight:</span>
              <span className="sim-calc-val-normal">{results.initWeight} g</span>
            </div>
            <div className="sim-calc-row">
              <span className="sim-calc-label">Final Weight:</span>
              <span className="sim-calc-val-warning">{results.finalWeight} g</span>
            </div>
            <div className="sim-calc-row" style={{ marginBottom: "10px" }}>
              <span className="sim-calc-label">Machining Time:</span>
              <span className="sim-calc-val-normal">{results.machTime} min</span>
            </div>
            
            <div className="sim-calc-row sim-calc-divider">
              <span className="sim-calc-label-highlight">MRR:</span>
              <span className="sim-calc-val-success">{results.mrr} mm³/min</span>
            </div>
            
            <button 
              onClick={handleSaveToTable} 
              className="sim-btn-success"
              style={{ width: "100%", marginTop: "14px" }}
            >
              📥 Record Observation
            </button>
          </div>
        )}
      </div>

      {/* RIGHT SIDE: 3D Scene View (Shifted from Left) */}
      <div 
        style={{ 
          flex: 1, 
          position: "relative", 
          background: "#000000", 
          borderRadius: "12px", 
          overflow: "hidden",
          border: "1px solid #1e293b",
          cursor: "grab"
        }}
      >
        <EDM3D isMachining={isMachining} toolShape={toolShape} />
        
        {/* Floating Controls Hint */}
        <div style={{ position: "absolute", bottom: 16, right: 16, color: "#94a3b8", fontSize: "12px", background: "rgba(0,0,0,0.5)", padding: "4px 8px", borderRadius: "4px", pointerEvents: "none" }}>
          🖱️ Click & Drag to Rotate | Scroll to Zoom
        </div>

        {isMachining && (
          <div style={{ position: "absolute", top: 16, left: 16, color: "#4ade80", fontWeight: "bold", background: "rgba(0,0,0,0.6)", padding: "6px 12px", borderRadius: "6px" }}>
            ⚡ Sparking in Progress...
          </div>
        )}
      </div>

    </div>
  );
}

export default EDMSimulation;