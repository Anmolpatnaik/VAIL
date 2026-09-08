import React, { useState } from "react";
import EDM3D from "./EDM3D"; 

function EDMSimulation({ onSaveData }) {
  // Input Parameters
  const [toolShape, setToolShape] = useState("cylindrical");
  const [current, setCurrent] = useState(15);
  const [voltage, setVoltage] = useState(50);
  const [pulseOn, setPulseOn] = useState(100);
  const [pulseOff, setPulseOff] = useState(50);

  // Simulation State
  const [isMachining, setIsMachining] = useState(false);
  const [results, setResults] = useState(null);

  const handleRunSimulation = () => {
    setIsMachining(true);
    setResults(null);

    setTimeout(() => {
      const energyFactor = (current * voltage) / 1000;
      const dutyFactor = pulseOn / pulseOff;
      const shapeMultiplier = toolShape === "cubical" ? 1.1 : 1.0; 

      const calculatedMrr = Math.max(0.5, energyFactor * dutyFactor * 1.8 * shapeMultiplier).toFixed(2);
      
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
    }, 2000);
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
        style={{ 
          width: "340px", 
          background: "#0f172a", 
          padding: "24px", 
          borderRadius: "12px", 
          color: "#f8fafc", 
          display: "flex", 
          flexDirection: "column", 
          gap: "18px",
          border: "1px solid #1e3a5f",
          overflowY: "auto"
        }}
      >
        <h3 style={{ margin: 0, color: "#38bdf8", borderBottom: "1px solid #1e3a5f", paddingBottom: "10px" }}>
          ⚙️ EDM Parameters
        </h3>
        
        {/* Tool Shape Dropdown */}
        <div>
          <label style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#94a3b8", marginBottom: "8px" }}>
            <span>Tool Electrode Shape</span>
          </label>
          <select 
            value={toolShape} 
            onChange={(e) => setToolShape(e.target.value)}
            disabled={isMachining}
            style={{ 
              width: "100%", 
              padding: "10px", 
              borderRadius: "6px", 
              background: "#1e293b", 
              color: "#f8fafc", 
              border: "1px solid #334155",
              cursor: isMachining ? "not-allowed" : "pointer",
              outline: "none"
            }}
          >
            <option value="cylindrical">Cylindrical</option>
            <option value="cubical">Cubical</option>
          </select>
        </div>

        {/* Discharge Current */}
        <div>
          <label style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#94a3b8", marginBottom: "8px" }}>
            <span>Discharge Current (I)</span>
            <strong style={{ color: "#f8fafc" }}>{current} A</strong>
          </label>
          <input type="range" min="5" max="50" step="1" value={current} onChange={(e) => setCurrent(e.target.value)} disabled={isMachining} style={{ width: "100%", cursor: isMachining ? "not-allowed" : "pointer", accentColor: "#38bdf8" }} />
        </div>

        {/* Gap Voltage */}
        <div>
          <label style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#94a3b8", marginBottom: "8px" }}>
            <span>Gap Voltage (V)</span>
            <strong style={{ color: "#f8fafc" }}>{voltage} V</strong>
          </label>
          <input type="range" min="30" max="120" step="5" value={voltage} onChange={(e) => setVoltage(e.target.value)} disabled={isMachining} style={{ width: "100%", cursor: isMachining ? "not-allowed" : "pointer", accentColor: "#38bdf8" }} />
        </div>

        {/* Pulse ON Time */}
        <div>
          <label style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#94a3b8", marginBottom: "8px" }}>
            <span>Pulse ON Time (Ton)</span>
            <strong style={{ color: "#f8fafc" }}>{pulseOn} µs</strong>
          </label>
          <input type="range" min="10" max="500" step="10" value={pulseOn} onChange={(e) => setPulseOn(e.target.value)} disabled={isMachining} style={{ width: "100%", cursor: isMachining ? "not-allowed" : "pointer", accentColor: "#38bdf8" }} />
        </div>

        {/* Pulse OFF Time */}
        <div>
          <label style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#94a3b8", marginBottom: "8px" }}>
            <span>Pulse OFF Time (Toff)</span>
            <strong style={{ color: "#f8fafc" }}>{pulseOff} µs</strong>
          </label>
          <input type="range" min="10" max="200" step="5" value={pulseOff} onChange={(e) => setPulseOff(e.target.value)} disabled={isMachining} style={{ width: "100%", cursor: isMachining ? "not-allowed" : "pointer", accentColor: "#38bdf8" }} />
        </div>

        {/* Run Button */}
        <button 
          onClick={handleRunSimulation} 
          disabled={isMachining} 
          style={{ 
            padding: "14px", 
            background: isMachining ? "#334155" : "#2563eb", 
            color: "#fff", 
            border: "none", 
            borderRadius: "8px", 
            cursor: isMachining ? "not-allowed" : "pointer", 
            fontWeight: "bold", 
            marginTop: "8px",
            transition: "all 0.2s"
          }}
        >
          {isMachining ? "Machining..." : "▶ Start Machining"}
        </button>

        {/* Results Box */}
        {results && (
          <div style={{ marginTop: "10px", padding: "16px", background: "#020617", borderRadius: "8px", border: "1px solid #1e293b" }}>
            <h4 style={{ margin: "0 0 12px 0", color: "#e2e8f0", fontSize: "14px" }}>Simulation Results</h4>
            
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#94a3b8", marginBottom: "6px" }}>
              <span>Initial Weight:</span> <span>{results.initWeight} g</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#94a3b8", marginBottom: "6px" }}>
              <span>Final Weight:</span> <span style={{ color: "#facc15" }}>{results.finalWeight} g</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#94a3b8", marginBottom: "12px" }}>
              <span>Machining Time:</span> <span>{results.machTime} min</span>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#f8fafc", fontWeight: "bold", paddingTop: "10px", borderTop: "1px solid #1e293b" }}>
              <span>MRR:</span> <span style={{ color: "#4ade80" }}>{results.mrr} mm³/min</span>
            </div>
            
            <button 
              onClick={handleSaveToTable} 
              style={{ width: "100%", padding: "10px", marginTop: "16px", background: "#16a34a", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
            >
              💾 Record Observation
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