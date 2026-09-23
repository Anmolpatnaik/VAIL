import React, { useState, useEffect, useRef } from "react";
import { measureQuantity, InstrumentTypes } from "../../engine/MeasurementEngine";

/**
 * VirtualStopwatch — VAIL 2.0 Virtual Instrument Engine (§10)
 * 
 * High-precision digital bench chronometer with millisecond resolution,
 * human reaction time uncertainty estimation, lap splits, and log to table.
 */
export default function VirtualStopwatch({
  onLogMeasurement,
  isOpen = true,
  onClose,
}) {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [laps, setLaps] = useState([]);
  const [isRealistic, setIsRealistic] = useState(true);
  const startRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      startRef.current = Date.now() - elapsedMs;
      timerRef.current = setInterval(() => {
        setElapsedMs(Date.now() - startRef.current);
      }, 10);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedMs(0);
    setLaps([]);
  };

  const handleLap = () => {
    if (isRunning) {
      setLaps((prev) => [...prev, elapsedMs]);
    }
  };

  const seconds = elapsedMs / 1000.0;
  const measurement = measureQuantity(
    seconds,
    InstrumentTypes.STOPWATCH,
    isRealistic
  );

  const formatTime = (ms) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    const centis = Math.floor((ms % 1000) / 10);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${String(centis).padStart(2, "0")}`;
  };

  const handleLog = () => {
    if (!onLogMeasurement) return;
    onLogMeasurement({
      quantity: "TIME (t)",
      measuredValue: Number(seconds.toFixed(2)),
      uncertainty: measurement.absoluteUncertainty,
      unit: "s",
      isRealistic,
      timestamp: new Date().toLocaleTimeString(),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="vail-stopwatch-chassis">
      <div className="vail-dmm-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>⏱️</span>
          <div>
            <div style={{ fontWeight: "800", letterSpacing: "1px", fontSize: "13px", color: "#f8fafc" }}>
              VAIL 2.0 DIGITAL BENCH TIMER
            </div>
            <div style={{ fontSize: "10px", color: "#94a3b8" }}>10 ms Crystal Oscillator • Reflex Compensation</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <button
            onClick={() => setIsRealistic(!isRealistic)}
            className={`dmm-mode-btn ${isRealistic ? "realistic" : "ideal"}`}
          >
            {isRealistic ? "🔬 Human Reflex (±0.15s)" : "⚡ Ideal Gate"}
          </button>
          {onClose && (
            <button onClick={onClose} className="dmm-close-btn" title="Close Stopwatch">
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="vail-stopwatch-display">
        <div className="stopwatch-digits">{formatTime(elapsedMs)}</div>
        <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
          Estimated Uncertainty: <strong>± {measurement.absoluteUncertainty} s</strong> (95% CL)
        </div>
      </div>

      <div className="vail-stopwatch-controls">
        <button
          onClick={handleStartStop}
          className="stopwatch-btn"
          style={{ background: isRunning ? "#ef4444" : "#22c55e", color: "#ffffff" }}
        >
          {isRunning ? "STOP" : "START"}
        </button>

        <button
          onClick={handleLap}
          className="stopwatch-btn"
          disabled={!isRunning}
          style={{ background: "#334155", color: "#f8fafc" }}
        >
          SPLIT / LAP
        </button>

        <button
          onClick={handleReset}
          className="stopwatch-btn"
          style={{ background: "#1e293b", color: "#94a3b8" }}
        >
          RESET
        </button>

        <button
          onClick={handleLog}
          className="stopwatch-btn log"
          title="Send elapsed time to active observation table slot"
        >
          📥 Log Time
        </button>
      </div>

      {laps.length > 0 && (
        <div className="stopwatch-laps">
          <div style={{ fontSize: "11px", fontWeight: "700", color: "#38bdf8", marginBottom: "4px" }}>Recorded Splits:</div>
          <div style={{ maxHeight: "80px", overflowY: "auto", fontSize: "11px" }}>
            {laps.map((lapMs, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", color: "#cbd5e1" }}>
                <span>Lap {idx + 1}:</span>
                <strong style={{ fontFamily: "monospace" }}>{formatTime(lapMs)}</strong>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
