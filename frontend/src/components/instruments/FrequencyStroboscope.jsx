import React, { useState, useEffect } from "react";
import { measureQuantity, InstrumentTypes } from "../../engine/MeasurementEngine";

/**
 * FrequencyStroboscope — VAIL 2.0 Virtual Instrument Engine (§10)
 * 
 * Specialized laboratory instrument for Vibrations on String / Acoustic resonance:
 * - High-precision digital frequency counter (0.1 Hz resolution)
 * - Optical stroboscope flash frequency synchronization
 * - Harmonic node tracking (n = 1, 2, 3, 4...)
 * - "Log Frequency to Observation Table" action
 */
export default function FrequencyStroboscope({
  liveFrequency = 50.0,
  harmonicMode = 1,
  onLogMeasurement,
  isOpen = true,
  onClose,
}) {
  const [frequency, setFrequency] = useState(liveFrequency);
  const [isRealistic, setIsRealistic] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [currentReading, setCurrentReading] = useState(null);

  useEffect(() => {
    setFrequency(liveFrequency);
  }, [liveFrequency]);

  useEffect(() => {
    if (isLocked) return;

    const interval = setInterval(() => {
      const reading = measureQuantity(
        frequency,
        InstrumentTypes.GENERIC,
        isRealistic,
        isRealistic ? 0.02 : 0.0,
        { unit: "Hz", resolution: 0.1, gainAccuracy: 0.002, digitOffset: 1, noiseSd: 0.05 }
      );
      setCurrentReading(reading);
    }, isRealistic ? 300 : 150);

    return () => clearInterval(interval);
  }, [frequency, isRealistic, isLocked]);

  const handleLog = () => {
    if (!currentReading || !onLogMeasurement) return;
    onLogMeasurement({
      quantity: "FREQUENCY",
      field: "frequency",
      measuredValue: currentReading.measuredValue,
      nominalValue: currentReading.nominalValue,
      uncertainty: currentReading.absoluteUncertainty,
      unit: "Hz",
      isRealistic,
      timestamp: new Date().toLocaleTimeString(),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="vail-dmm-chassis">
      <div className="vail-dmm-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>🎛️</span>
          <div>
            <div style={{ fontWeight: "800", letterSpacing: "1px", fontSize: "13px", color: "#f8fafc" }}>
              VAIL 2.0 FREQUENCY COUNTER
            </div>
            <div style={{ fontSize: "10px", color: "#94a3b8" }}>Digital Stroboscope &amp; Resonance Meter</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <button
            onClick={() => setIsRealistic(!isRealistic)}
            className={`dmm-mode-btn ${isRealistic ? "realistic" : "ideal"}`}
          >
            {isRealistic ? "🔬 Realistic Jitter" : "⚡ Ideal Gate"}
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
          <span className={isLocked ? "ann-active" : "ann-inactive"}>SYNC LOCK</span>
          <span className="ann-active">MODE n={harmonicMode}</span>
          <span className={isRealistic ? "ann-active" : "ann-inactive"}>OPTICAL GATE</span>
          <span className="ann-unit">Hz</span>
        </div>

        <div className="dmm-screen-digits">
          <span className="digits-main">
            {currentReading ? currentReading.measuredValue.toFixed(1) : frequency.toFixed(1)}
          </span>
          <span className="digits-unit">Hz</span>
        </div>

        <div className="dmm-uncertainty-bar">
          <span>Uncertainty: <strong>± {currentReading?.absoluteUncertainty ?? 0.1} Hz</strong> (95% CL)</span>
          <span style={{ color: "#34d399", fontSize: "10px" }}>T = {(1 / (frequency || 1)).toFixed(4)} s</span>
        </div>
      </div>

      <div className="vail-dmm-controls">
        <button
          onClick={() => setIsLocked(!isLocked)}
          className={`dmm-ctrl-btn ${isLocked ? "active" : ""}`}
        >
          {isLocked ? "UNLOCK" : "STROBE LOCK"}
        </button>

        <button
          onClick={() => setFrequency((f) => Math.max(1, f - 5))}
          className="dmm-ctrl-btn"
          title="Decrease frequency by 5 Hz"
        >
          -5 Hz
        </button>

        <button
          onClick={handleLog}
          className="dmm-log-btn"
          title="Send measured frequency to observation table"
        >
          📥 Log Frequency
        </button>
      </div>

      <div style={{ padding: "8px 10px", background: "rgba(15, 23, 42, 0.6)", borderRadius: "8px", border: "1px solid #334155", fontSize: "11px", color: "#cbd5e1" }}>
        💡 <strong>Standing Wave Tuning:</strong> Adjust string tension or driving frequency until nodes become sharply stationary with maximum antinode envelope.
      </div>
    </div>
  );
}
