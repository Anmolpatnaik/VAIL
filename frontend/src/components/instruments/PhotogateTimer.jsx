import React, { useState, useEffect } from "react";
import { measureQuantity, InstrumentTypes } from "../../engine/MeasurementEngine";

/**
 * PhotogateTimer — VAIL 2.0 Virtual Instrument Engine (§10)
 * 
 * Specialized laboratory instrument for Impulse-Momentum Dynamics:
 * - Dual photogate transit timer (0.1 ms resolution)
 * - Glider velocity calculator (v = flag_width / Δt)
 * - Momentum & Kinetic energy evaluation
 * - "Log to Observation Table" action
 */
export default function PhotogateTimer({
  liveVelocity1 = 0.5,
  liveVelocity2 = 0.48,
  gliderMass = 0.25, // kg
  onLogMeasurement,
  isOpen = true,
  onClose,
}) {
  const [gateMode, setGateMode] = useState("gate1"); // 'gate1', 'gate2', 'momentum'
  const [isRealistic, setIsRealistic] = useState(true);
  const flagWidth = 0.05; // 5 cm photogate flag

  const rawDeltaT1 = liveVelocity1 > 0 ? flagWidth / liveVelocity1 : 0.1;
  const rawDeltaT2 = liveVelocity2 > 0 ? flagWidth / liveVelocity2 : 0.104;

  const tReading1 = measureQuantity(
    rawDeltaT1,
    InstrumentTypes.STOPWATCH,
    isRealistic,
    0.0,
    { unit: "s", resolution: 0.0001, gainAccuracy: 0.0005, digitOffset: 1, noiseSd: 0.0002 }
  );

  const tReading2 = measureQuantity(
    rawDeltaT2,
    InstrumentTypes.STOPWATCH,
    isRealistic,
    0.0,
    { unit: "s", resolution: 0.0001, gainAccuracy: 0.0005, digitOffset: 1, noiseSd: 0.0002 }
  );

  const v1 = flagWidth / (tReading1.measuredValue || 0.1);
  const v2 = flagWidth / (tReading2.measuredValue || 0.104);
  const p1 = gliderMass * v1;
  const p2 = gliderMass * v2;

  const handleLog = () => {
    if (!onLogMeasurement) return;
    onLogMeasurement({
      quantity: "PHOTOGATE_VELOCITY",
      field: "velocity",
      v1: Number(v1.toFixed(3)),
      v2: Number(v2.toFixed(3)),
      p1: Number(p1.toFixed(4)),
      p2: Number(p2.toFixed(4)),
      deltaT1: tReading1.measuredValue,
      deltaT2: tReading2.measuredValue,
      unit: "m/s",
      isRealistic,
      timestamp: new Date().toLocaleTimeString(),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="vail-dmm-chassis">
      <div className="vail-dmm-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>⏱️</span>
          <div>
            <div style={{ fontWeight: "800", letterSpacing: "1px", fontSize: "13px", color: "#f8fafc" }}>
              DUAL PHOTOGATE TIMER
            </div>
            <div style={{ fontSize: "10px", color: "#94a3b8" }}>Optical Flag Detection • 0.1 ms Gate Resolution</div>
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
          <span className="ann-active">FLAG = 5.0 cm</span>
          <span className="ann-active">MASS = {(gliderMass * 1000).toFixed(0)} g</span>
          <span className="ann-unit">m/s</span>
        </div>

        <div className="dmm-screen-digits">
          <span className="digits-main">
            {gateMode === "gate1" ? v1.toFixed(3) : gateMode === "gate2" ? v2.toFixed(3) : p1.toFixed(4)}
          </span>
          <span className="digits-unit">{gateMode === "momentum" ? "kg·m/s" : "m/s"}</span>
        </div>

        <div className="dmm-uncertainty-bar">
          <span>
            {gateMode === "gate1"
              ? `Gate 1 Δt: ${tReading1.measuredValue.toFixed(4)} s`
              : gateMode === "gate2"
              ? `Gate 2 Δt: ${tReading2.measuredValue.toFixed(4)} s`
              : `Momentum: p₁ = ${p1.toFixed(4)} kg·m/s`}
          </span>
          <span style={{ color: "#34d399", fontSize: "10px" }}>Precision Gate</span>
        </div>
      </div>

      <div className="vail-dmm-controls">
        <button
          onClick={() => setGateMode("gate1")}
          className={`dmm-ctrl-btn ${gateMode === "gate1" ? "active" : ""}`}
        >
          Gate 1 (v₁)
        </button>

        <button
          onClick={() => setGateMode("gate2")}
          className={`dmm-ctrl-btn ${gateMode === "gate2" ? "active" : ""}`}
        >
          Gate 2 (v₂)
        </button>

        <button
          onClick={handleLog}
          className="dmm-log-btn"
          title="Send photogate velocities to observation table"
        >
          📥 Log Photogate Data
        </button>
      </div>

      <div style={{ padding: "8px 10px", background: "rgba(15, 23, 42, 0.6)", borderRadius: "8px", border: "1px solid #334155", fontSize: "11px", color: "#cbd5e1" }}>
        Velocity calculated via infrared interruption: <em>v = d_flag / Δt</em>. Momentum conservation compares <em>m₁v₁</em> before collision vs <em>(m₁+m₂)v₂</em> after.
      </div>
    </div>
  );
}
