import React, { useState } from "react";
import OpAmp3D from "./OpAmp3D";

export default function OpAmpSimulation({ onSaveData }) {
  const [config, setConfig] = useState("inverting");
  const [vin, setVin] = useState(1.0);
  const [r1, setR1] = useState(10);
  const [rf, setRf] = useState(50);
  const [vcc, setVcc] = useState(12);
  
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const handleSimulate = () => {
    setLoading(true);
    setTimeout(() => {
      const gain = config === "inverting" ? - (rf / r1) : (1 + (rf / r1));
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
        <div style={{ padding: "20px", border: "1px solid #d9e0e8", borderRadius: "12px", background: "#f8fafc", boxShadow: "0 2px 8px rgba(15,23,42,0.06)" }}>
          {/* Increased font size, bolder weight */}
          <div style={{ fontSize: "19px", fontWeight: "800", marginBottom: "18px", color: "#0f172a" }}>
            Circuit Parameters
          </div>

          <div style={{ marginBottom: "15px" }}>
            <div style={{ fontSize: "13px", marginBottom: "5px", fontWeight: "bold", color: "#334155" }}>
              Configuration
            </div>
            <select 
              value={config}
              onChange={(e) => setConfig(e.target.value)}
              style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", cursor: "pointer", background: "white", color: "black", fontSize: "12px" }}
            >
              <option value="inverting" style={{ color: "black" }}>Inverting Amplifier</option>
              <option value="non-inverting" style={{ color: "black" }}>Non-Inverting Amplifier</option>
            </select>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", fontSize: "13px" }}>
              <span>Input Voltage (Vin)</span>
              <strong>{Number(vin).toFixed(1)} V</strong>
            </div>
            <input 
              type="range" min="-5.0" max="5.0" step="0.1" value={vin}
              onChange={(e) => setVin(Number(e.target.value))}
              style={{ width: "100%", cursor: "pointer" }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", fontSize: "13px" }}>
              <span>Input Resistor (R1)</span>
              <strong>{r1} kΩ</strong>
            </div>
            <input 
              type="range" min="1" max="50" step="1" value={r1}
              onChange={(e) => setR1(Number(e.target.value))}
              style={{ width: "100%", cursor: "pointer" }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", fontSize: "13px" }}>
              <span>Feedback Resistor (Rf)</span>
              <strong>{rf} kΩ</strong>
            </div>
            <input 
              type="range" min="10" max="200" step="10" value={rf}
              onChange={(e) => setRf(Number(e.target.value))}
              style={{ width: "100%", cursor: "pointer" }}
            />
          </div>

          {/* Run and Stop Buttons */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <button
              onClick={handleSimulate}
              disabled={loading}
              style={{
                flex: 1, padding: "11px", border: "none", borderRadius: "8px",
                background: loading ? "#94a3b8" : "#2563eb", color: "white", fontWeight: "bold", 
                cursor: loading ? "not-allowed" : "pointer", fontSize: "13px"
              }}
            >
              {loading ? "Running..." : "⚡ Run"}
            </button>

            <button
              onClick={handleStop}
              style={{
                flex: 1, padding: "11px", border: "none", borderRadius: "8px",
                background: "#ef4444", color: "white", fontWeight: "bold", 
                cursor: "pointer", fontSize: "13px"
              }}
            >
              ⏹ Stop
            </button>
          </div>

          <button
            onClick={handleAddObservation}
            style={{
              width: "100%", padding: "10px", border: "none", borderRadius: "8px",
              background: "#0d9488", color: "white", fontWeight: "bold", 
              cursor: "pointer", fontSize: "13px", marginBottom: "15px"
            }}
          >
            📋 Record to Observations Table
          </button>

          {/* Results Box */}
          <div style={{ padding: "14px", borderRadius: "8px", background: results ? (results.is_saturated ? "#fef2f2" : "#e0f2fe") : "#f1f5f9", border: `1px solid ${results ? (results.is_saturated ? "#fca5a5" : "#bae6fd") : "#cbd5e1"}` }}>
            <div style={{ fontSize: "13px", fontWeight: "bold", marginBottom: "8px", color: results ? (results.is_saturated ? "#991b1b" : "#0369a1") : "#475569" }}>
              {!results ? "💤 Standby Mode (Click Run)" : (results.is_saturated ? "⚠️ Saturation Reached!" : "⚡ Live Circuit Output")}
            </div>
            <div style={{ fontSize: "13px", color: results ? (results.is_saturated ? "#7f1d1d" : "#0c4a6e") : "#94a3b8", marginBottom: "4px" }}>
              <strong>Voltage Gain:</strong> {results ? results.voltage_gain.toFixed(2) : "—"}
            </div>
            <div style={{ fontSize: "13px", color: results ? (results.is_saturated ? "#7f1d1d" : "#0c4a6e") : "#94a3b8" }}>
              <strong>Output Voltage:</strong> {results ? `${results.output_voltage.toFixed(2)} V` : "—"}
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