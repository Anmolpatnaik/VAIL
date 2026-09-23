import React, { useState, useEffect } from "react";
import { measureQuantity, InstrumentTypes } from "../../engine/MeasurementEngine";

/**
 * EDMDepthGauge — VAIL 2.0 Virtual Instrument Engine (§10)
 * 
 * Specialized laboratory instrument for Electrical Discharge Machining (EDM):
 * - Digital spark gap micrometer depth gauge (1 μm resolution)
 * - Material Removal Rate (MRR) live evaluator
 * - "Log to Observation Table" action
 */
export default function EDMDepthGauge({
  liveDepth = 1.25, // mm
  liveMRR = 24.5, // mm³/min
  liveCurrent = 15.0, // A
  onLogMeasurement,
  isOpen = true,
  onClose,
}) {
  const [displayMode, setDisplayMode] = useState("mrr"); // 'mrr', 'depth', 'current'
  const [isRealistic, setIsRealistic] = useState(true);

  const rawVal = displayMode === "mrr" ? liveMRR : displayMode === "depth" ? liveDepth : liveCurrent;
  const spec = displayMode === "mrr"
    ? { unit: "mm³/min", resolution: 0.1, gainAccuracy: 0.02, digitOffset: 1, noiseSd: 0.2 }
    : displayMode === "depth"
    ? { unit: "mm", resolution: 0.001, gainAccuracy: 0.005, digitOffset: 1, noiseSd: 0.003 }
    : { unit: "A", resolution: 0.1, gainAccuracy: 0.01, digitOffset: 1, noiseSd: 0.05 };

  const reading = measureQuantity(rawVal, InstrumentTypes.GENERIC, isRealistic, 0.0, spec);

  const handleLog = () => {
    if (!onLogMeasurement) return;
    onLogMeasurement({
      quantity: displayMode === "mrr" ? "MRR" : displayMode === "depth" ? "DEPTH" : "CURRENT",
      field: displayMode === "mrr" ? "mrr" : displayMode === "depth" ? "depth" : "current",
      measuredValue: reading.measuredValue,
      uncertainty: reading.absoluteUncertainty,
      unit: reading.unit,
      isRealistic,
      timestamp: new Date().toLocaleTimeString(),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="vail-dmm-chassis">
      <div className="vail-dmm-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>⚡</span>
          <div>
            <div style={{ fontWeight: "800", letterSpacing: "1px", fontSize: "13px", color: "#f8fafc" }}>
              EDM SPARK MONITOR &amp; DEPTH GAUGE
            </div>
            <div style={{ fontSize: "10px", color: "#94a3b8" }}>Optical Linear Encoder • MRR Calculator</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <button
            onClick={() => setIsRealistic(!isRealistic)}
            className={`dmm-mode-btn ${isRealistic ? "realistic" : "ideal"}`}
          >
            {isRealistic ? "🔬 Realistic" : "⚡ Ideal"}
          </button>
          {onClose && (
            <button onClick={onClose} className="dmm-close-btn" title="Close Instrument">
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="vail-dmm-screen">
        <div className="dmm-screen-annunciators">
          <span className="ann-active">
            {displayMode === "mrr" ? "REMOVAL RATE" : displayMode === "depth" ? "TOOL PENETRATION" : "PEAK DISCHARGE"}
          </span>
          <span className={isRealistic ? "ann-active" : "ann-inactive"}>OPTICAL MICROMETER</span>
          <span className="ann-unit">{reading.unit}</span>
        </div>

        <div className="dmm-screen-digits">
          <span className="digits-main">
            {reading.measuredValue.toFixed(displayMode === "depth" ? 3 : 1)}
          </span>
          <span className="digits-unit">{reading.unit}</span>
        </div>

        <div className="dmm-uncertainty-bar">
          <span>Uncertainty: <strong>± {reading.absoluteUncertainty} {reading.unit}</strong></span>
          <span style={{ color: "#34d399", fontSize: "10px" }}>Precision Probe</span>
        </div>
      </div>

      <div className="vail-dmm-controls">
        <button
          onClick={() => setDisplayMode("mrr")}
          className={`dmm-ctrl-btn ${displayMode === "mrr" ? "active" : ""}`}
        >
          📊 MRR Rate
        </button>

        <button
          onClick={() => setDisplayMode("depth")}
          className={`dmm-ctrl-btn ${displayMode === "depth" ? "active" : ""}`}
        >
          📏 Depth (mm)
        </button>

        <button
          onClick={handleLog}
          className="dmm-log-btn"
          title="Send EDM reading to observation table"
        >
          📥 Log {displayMode.toUpperCase()}
        </button>
      </div>

      <div style={{ padding: "8px 10px", background: "rgba(15, 23, 42, 0.6)", borderRadius: "8px", border: "1px solid #334155", fontSize: "11px", color: "#cbd5e1" }}>
        Measures spark erosion depth in die-sinking machining. Material Removal Rate increases proportionally with discharge energy <em>E = V · I · t_on</em>.
      </div>
    </div>
  );
}
