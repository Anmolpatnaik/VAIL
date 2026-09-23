import React, { useState, useEffect } from "react";
import { measureQuantity, InstrumentTypes } from "../../engine/MeasurementEngine";

/**
 * FluxmeterBHTool — VAIL 2.0 Virtual Instrument Engine (§10)
 * 
 * Specialized laboratory instrument for Magnetic Hysteresis B-H Loop:
 * - Digital Hall Effect Gaussmeter (measures H in A/m)
 * - Integrating Fluxmeter (measures B in Tesla)
 * - Steinmetz Core Loss Integrator (w_h in J/m³)
 * - "Log to Observation Table" action
 */
export default function FluxmeterBHTool({
  liveH = 500.0,
  liveB = 1.45,
  liveLoopArea = 1420.0,
  onLogMeasurement,
  isOpen = true,
  onClose,
}) {
  const [channel, setChannel] = useState("b"); // 'b' (Tesla), 'h' (A/m), or 'loss' (J/m³)
  const [isRealistic, setIsRealistic] = useState(true);

  const rawVal = channel === "b" ? liveB : channel === "h" ? liveH : liveLoopArea;
  const spec = channel === "b"
    ? { unit: "T", resolution: 0.001, gainAccuracy: 0.01, digitOffset: 1, noiseSd: 0.005 }
    : channel === "h"
    ? { unit: "A/m", resolution: 0.5, gainAccuracy: 0.008, digitOffset: 1, noiseSd: 1.0 }
    : { unit: "J/m³", resolution: 1.0, gainAccuracy: 0.02, digitOffset: 2, noiseSd: 5.0 };

  const reading = measureQuantity(rawVal, InstrumentTypes.GENERIC, isRealistic, 0.0, spec);

  const handleLog = () => {
    if (!onLogMeasurement) return;
    onLogMeasurement({
      quantity: channel === "b" ? "MAX_B" : channel === "h" ? "MAX_H" : "LOOP_AREA",
      field: channel === "b" ? "maxB" : channel === "h" ? "maxH" : "loopArea",
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
          <span style={{ fontSize: "16px" }}>🧲</span>
          <div>
            <div style={{ fontWeight: "800", letterSpacing: "1px", fontSize: "13px", color: "#f8fafc" }}>
              DIGITAL FLUXMETER &amp; GAUSSMETER
            </div>
            <div style={{ fontSize: "10px", color: "#94a3b8" }}>Hall Effect Probe • B-H Loop Integrator</div>
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
          <span className="ann-active">{channel === "b" ? "INDUCTION B" : channel === "h" ? "FIELD H" : "ENERGY LOSS"}</span>
          <span className={isRealistic ? "ann-active" : "ann-inactive"}>HALL PROBE</span>
          <span className="ann-unit">{reading.unit}</span>
        </div>

        <div className="dmm-screen-digits">
          <span className="digits-main">
            {reading.measuredValue.toFixed(channel === "b" ? 3 : 1)}
          </span>
          <span className="digits-unit">{reading.unit}</span>
        </div>

        <div className="dmm-uncertainty-bar">
          <span>Uncertainty: <strong>± {reading.absoluteUncertainty} {reading.unit}</strong></span>
          <span style={{ color: "#34d399", fontSize: "10px" }}>Precision Sensor</span>
        </div>
      </div>

      <div className="vail-dmm-controls">
        <button
          onClick={() => setChannel("b")}
          className={`dmm-ctrl-btn ${channel === "b" ? "active" : ""}`}
        >
          🧲 Induction B (T)
        </button>

        <button
          onClick={() => setChannel("h")}
          className={`dmm-ctrl-btn ${channel === "h" ? "active" : ""}`}
        >
          ⚡ Field H (A/m)
        </button>

        <button
          onClick={handleLog}
          className="dmm-log-btn"
          title={`Send ${channel} to observation table`}
        >
          📥 Log {channel.toUpperCase()}
        </button>
      </div>

      <div style={{ padding: "8px 10px", background: "rgba(15, 23, 42, 0.6)", borderRadius: "8px", border: "1px solid #334155", fontSize: "11px", color: "#cbd5e1" }}>
        Measures ferromagnetic response inside Epstein frame core: <em>B = μ · H</em>. Loop area <em>∮ B dH</em> represents cyclic hysteresis thermal loss per unit volume.
      </div>
    </div>
  );
}
