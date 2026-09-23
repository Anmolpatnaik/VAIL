import React, { useState, useEffect } from "react";
import { measureQuantity, InstrumentTypes } from "../../engine/MeasurementEngine";

/**
 * TensionGauge — VAIL 2.0 Virtual Instrument Engine (§10)
 * 
 * Specialized laboratory instrument for Vibrations on String / Mechanics:
 * - Digital load cell dynamometer for measuring string tension (N)
 * - Traveling optical rule mode for measuring standing wave wavelength λ (m)
 * - "Log to Observation Table" action
 */
export default function TensionGauge({
  liveTension = 4.9, // N
  liveWavelength = 0.8, // m
  onLogMeasurement,
  isOpen = true,
  onClose,
}) {
  const [mode, setMode] = useState("tension"); // 'tension' or 'wavelength'
  const [isRealistic, setIsRealistic] = useState(true);
  const [currentReading, setCurrentReading] = useState(null);

  const rawValue = mode === "tension" ? liveTension : liveWavelength;

  useEffect(() => {
    const spec = mode === "tension"
      ? { unit: "N", resolution: 0.01, gainAccuracy: 0.005, digitOffset: 1, noiseSd: 0.02 }
      : { unit: "m", resolution: 0.002, gainAccuracy: 0.002, digitOffset: 1, noiseSd: 0.003 };

    const reading = measureQuantity(
      rawValue,
      InstrumentTypes.GENERIC,
      isRealistic,
      isRealistic ? 0.01 : 0.0,
      spec
    );
    setCurrentReading(reading);
  }, [rawValue, mode, isRealistic]);

  const handleLog = () => {
    if (!currentReading || !onLogMeasurement) return;
    onLogMeasurement({
      quantity: mode === "tension" ? "TENSION" : "WAVELENGTH",
      field: mode === "tension" ? "tension" : "wavelength",
      measuredValue: currentReading.measuredValue,
      nominalValue: currentReading.nominalValue,
      uncertainty: currentReading.absoluteUncertainty,
      unit: currentReading.unit,
      isRealistic,
      timestamp: new Date().toLocaleTimeString(),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="vail-dmm-chassis">
      <div className="vail-dmm-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>{mode === "tension" ? "⚖️" : "📏"}</span>
          <div>
            <div style={{ fontWeight: "800", letterSpacing: "1px", fontSize: "13px", color: "#f8fafc" }}>
              {mode === "tension" ? "DIGITAL TENSION DYNAMOMETER" : "TRAVELING OPTICAL SCALE"}
            </div>
            <div style={{ fontSize: "10px", color: "#94a3b8" }}>
              {mode === "tension" ? "Piezoelectric Load Cell • N" : "Vernier Traveling Microscope • m"}
            </div>
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
          <span className="ann-active">{mode === "tension" ? "LOAD CELL" : "VERNIER MICROSCOPE"}</span>
          <span className={isRealistic ? "ann-active" : "ann-inactive"}>CALIBRATED</span>
          <span className="ann-unit">{currentReading?.unit || "N"}</span>
        </div>

        <div className="dmm-screen-digits">
          <span className="digits-main">
            {currentReading ? currentReading.measuredValue.toFixed(mode === "tension" ? 2 : 3) : "0.00"}
          </span>
          <span className="digits-unit">{currentReading?.unit || "N"}</span>
        </div>

        <div className="dmm-uncertainty-bar">
          <span>Uncertainty: <strong>± {currentReading?.absoluteUncertainty ?? 0.01} {currentReading?.unit}</strong></span>
          <span style={{ color: "#34d399", fontSize: "10px" }}>Least Count: {mode === "tension" ? "0.01 N" : "2 mm"}</span>
        </div>
      </div>

      <div className="vail-dmm-controls">
        <button
          onClick={() => setMode("tension")}
          className={`dmm-ctrl-btn ${mode === "tension" ? "active" : ""}`}
        >
          ⚖️ Tension (T)
        </button>

        <button
          onClick={() => setMode("wavelength")}
          className={`dmm-ctrl-btn ${mode === "wavelength" ? "active" : ""}`}
        >
          📏 Wavelength (λ)
        </button>

        <button
          onClick={handleLog}
          className="dmm-log-btn"
          title={`Send measured ${mode} to observation table`}
        >
          📥 Log {mode === "tension" ? "Tension" : "Wavelength"}
        </button>
      </div>

      <div style={{ padding: "8px 10px", background: "rgba(15, 23, 42, 0.6)", borderRadius: "8px", border: "1px solid #334155", fontSize: "11px", color: "#cbd5e1" }}>
        {mode === "tension" ? (
          <span>Tension generated by suspended weights: <em>T = m_hanging · g</em>. Higher tension increases transverse wave velocity <em>v = √(T/μ)</em>.</span>
        ) : (
          <span>Wavelength determined from the distance between adjacent stationary nodes: <em>λ = 2 · L_loop</em>.</span>
        )}
      </div>
    </div>
  );
}
