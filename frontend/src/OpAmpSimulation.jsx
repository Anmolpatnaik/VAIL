import React, { useState } from "react";
import OpAmp3D from "./OpAmp3D";
import ValidatedParameterControl from "./ValidatedParameterControl";

export default function OpAmpSimulation({ onSaveData }) {
  const [config, setConfig] = useState("inverting");
  const [vin, setVin] = useState(1.0);
  const [r1, setR1] = useState(10);
  const [rf, setRf] = useState(50);
  const [vcc, setVcc] = useState(12);

  const [invalidInputs, setInvalidInputs] = useState({});
  const hasInvalid = Object.values(invalidInputs).some(Boolean);
  const setFieldInvalid = (field, isVal) => setInvalidInputs(p => ({ ...p, [field]: !isVal }));
  
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const handleSimulate = () => {
    setLoading(true);
    setTimeout(() => {
      const safeR1 = Math.max(r1 || 0, 0.1);
      const gain = config === "inverting" ? - (rf / safeR1) : (1 + (rf / safeR1));
      let vout = gain * vin;
      const isSaturated = Math.abs(vout) >= vcc;
      if (vout > vcc) vout = vcc;
      if (vout < -vcc) vout = -vcc;

      setResults({ voltage_gain: gain, output_voltage: vout, is_saturated: isSaturated });
      setIsRunning(true);
      setLoading(false);
    }, 300);
  };

  const handleStop = () => {
    setIsRunning(false);
    setResults(null);
    setLoading(false);
  };

  const handleReset = () => {
    setVin(0.0);
    setR1(10);
    setRf(50);
    setConfig("inverting");
    setIsRunning(false);
    setResults(null);
    setLoading(false);
  };

  const handleAddObservation = () => {
    if (!results) {
      alert("Please run the simulation first before recording observations!");
      return;
    }
    if (onSaveData) {
      onSaveData({
        mode: config.toUpperCase(),
        vin: Number(vin).toFixed(1),
        rf: rf,
        rin: r1,
        gain: results.voltage_gain.toFixed(2),
        vout: results.output_voltage.toFixed(2),
      });
    }
  };

  return (
    <div style={{ width: "100%", boxSizing: "border-box", fontFamily: "Arial, Helvetica, sans-serif", color: "#172033" }}>
      {/* Main Workspace */}
      <div style={{ display: "grid", gridTemplateColumns: "300px minmax(0, 1fr)", gap: "20px", alignItems: "start" }}>
        
        {/* Control Panel */}
        <div className="sim-control-panel">
          <div className="sim-panel-title">
            Circuit Parameters
          </div>

          {/* LABORATORY REAL-TIME CALIBRATION CAUTION */}
          <div className="lab-caution-banner" style={{ marginBottom: "16px" }}>
            <span className="lab-caution-icon">⚠️</span>
            <div className="lab-caution-content">
              <div className="lab-caution-title">Real-Time Lab Calibration</div>
              <div className="lab-caution-text">
                Circuit parameters (Vin -10.0V to +10.0V, R1 0.5–50 kΩ, Rf 1–200 kΩ) are strictly calibrated to physical IC 741 / LM358 operational amplifier laboratory trainer kits (dual-rail ±12V supply). Out-of-range inputs will be rejected.
              </div>
            </div>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <div className="sim-param-title" style={{ marginBottom: "6px" }}>
              Configuration
            </div>
            <select 
              value={config}
              onChange={(e) => setConfig(e.target.value)}
              className="sim-select"
            >
              <option value="inverting">Inverting Amplifier</option>
              <option value="non-inverting">Non-Inverting Amplifier</option>
            </select>
          </div>

          {/* Input Voltage */}
          <ValidatedParameterControl
            label="Input Voltage (Vin)"
            limitHint="-10.0 – +10.0 V"
            value={vin}
            unit="V"
            min={-10.0}
            max={10.0}
            step={0.05}
            formatDecimals={2}
            onChange={(val) => setVin(val)}
            onValidityChange={(isVal) => setFieldInvalid("vin", isVal)}
          />

          {/* Input Resistor R1 */}
          <ValidatedParameterControl
            label="Input Resistor (R1)"
            limitHint="0.5 – 50.0 kΩ"
            value={r1}
            unit="kΩ"
            min={0.5}
            max={50.0}
            step={0.5}
            formatDecimals={1}
            onChange={(val) => setR1(val)}
            onValidityChange={(isVal) => setFieldInvalid("r1", isVal)}
          />

          {/* Feedback Resistor Rf */}
          <ValidatedParameterControl
            label="Feedback Resistor (Rf)"
            limitHint="1.0 – 200.0 kΩ"
            value={rf}
            unit="kΩ"
            min={1.0}
            max={200.0}
            step={1.0}
            formatDecimals={1}
            onChange={(val) => setRf(val)}
            onValidityChange={(isVal) => setFieldInvalid("rf", isVal)}
          />

          {hasInvalid && (
            <div className="sim-input-error-msg" style={{ marginBottom: "12px", padding: "6px 10px" }}>
              ⚠️ Cannot run simulation: One or more parameters exceed permissible lab range. Please correct invalid inputs.
            </div>
          )}

          {/* Run and Stop Buttons */}
          <div style={{ display: "flex", gap: "10px", marginTop: "14px", marginBottom: "10px" }}>
            <button
              onClick={handleSimulate}
              disabled={loading || hasInvalid}
              className="sim-btn-primary"
              style={{ flex: 1 }}
            >
              {loading ? "Running..." : "⚡ Run"}
            </button>

            <button
              onClick={handleStop}
              className="sim-btn-danger"
              style={{ flex: 1 }}
            >
              ⏹ Stop
            </button>
          </div>

          {/* Record Observations Button */}
          <button
            onClick={handleAddObservation}
            className="sim-btn-success"
            style={{ width: "100%", marginBottom: "10px" }}
          >
            📋 Record to Observations Table
          </button>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="sim-btn-reset"
            style={{ marginBottom: "12px" }}
            title="Reset parameters to 0 V defaults and clear results"
          >
            <span>🔄</span> Reset to Baseline (0 V)
          </button>

          {/* Results Box */}
          <div className="sim-highlight-card" style={{ marginTop: "5px" }}>
            <div className="sim-highlight-card-title" style={{ marginBottom: "8px" }}>
              {!results ? "💤 Standby Mode (Click Run)" : (results.is_saturated ? "⚠️ Saturation Reached!" : "⚡ Live Circuit Output")}
            </div>
            <div className="sim-calc-row">
              <span className="sim-calc-label">Voltage Gain:</span>
              <span className="sim-calc-val-accent">{results ? results.voltage_gain.toFixed(2) : "—"}</span>
            </div>
            <div className="sim-calc-row">
              <span className="sim-calc-label">Output Voltage:</span>
              <span className="sim-calc-val-accent">{results ? `${results.output_voltage.toFixed(2)} V` : "—"}</span>
            </div>
          </div>
        </div>

        {/* Right Column: 3D Workspace */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ minWidth: 0, minHeight: "520px", borderRadius: "12px", overflow: "hidden", background: "#030712", boxShadow: "0 3px 12px rgba(15,23,42,0.12)" }}>
           <OpAmp3D 
             vin={vin} 
             vout={results ? results.output_voltage : 0} 
             isSaturated={results ? results.is_saturated : false} 
             config={config} 
             isRunning={isRunning} 
           />
          </div>
        </div>

      </div>
    </div>
  );
}