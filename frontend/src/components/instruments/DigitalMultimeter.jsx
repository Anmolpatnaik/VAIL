import React, { useState, useEffect, useRef } from "react";
import { measureQuantity, InstrumentTypes } from "../../engine/MeasurementEngine";

/**
 * DigitalMultimeter (DMM) — VAIL 2.0 Virtual Instrument Engine (§10)
 * 
 * Provides an authentic bench multimeter with:
 * - 3.5-digit / 4.5-digit LCD display with annunciators
 * - Rotary selector for DCV, ACV, DCA, Resistance (Ω), and Capacitance (μF)
 * - Ideal vs. Realistic mode toggle with GUM uncertainty budget
 * - HOLD, MIN/MAX, Range selection
 * - "Log to Observation Table" action
 */
export default function DigitalMultimeter({
  liveValues = {}, // e.g., { dcv: 6.32, acv: 0, dca: 6.32, res: 1000, cap: 1000 }
  onLogMeasurement,
  isOpen = true,
  onClose,
}) {
  const [functionMode, setFunctionMode] = useState("dcv"); // dcv, acv, dca, res, cap
  const [isRealistic, setIsRealistic] = useState(true);
  const [isHeld, setIsHeld] = useState(false);
  const [minMaxMode, setMinMaxMode] = useState(null); // null, 'min', 'max'
  const [minVal, setMinVal] = useState(null);
  const [maxVal, setMaxVal] = useState(null);
  const [currentReading, setCurrentReading] = useState(null);
  const [heldReading, setHeldReading] = useState(null);
  const [showUncertaintyBudget, setShowUncertaintyBudget] = useState(false);

  // Map function mode to InstrumentType
  const modeMap = {
    dcv: InstrumentTypes.MULTIMETER_DCV,
    acv: InstrumentTypes.MULTIMETER_ACV,
    dca: InstrumentTypes.MULTIMETER_DCA,
    res: InstrumentTypes.MULTIMETER_RESISTANCE,
    cap: InstrumentTypes.MULTIMETER_CAPACITANCE,
  };

  // Get current raw value from props based on selected function
  const rawValue = liveValues[functionMode] ?? 0.0;

  // Update measurement with noise/resolution tick
  useEffect(() => {
    if (isHeld) return;

    const interval = setInterval(() => {
      const reading = measureQuantity(
        rawValue,
        modeMap[functionMode] || InstrumentTypes.MULTIMETER_DCV,
        isRealistic,
        isRealistic ? 0.05 : 0.0 // 5% component tolerance in realistic mode
      );

      setCurrentReading(reading);

      // Track min/max
      setMinVal((prev) => (prev === null ? reading.measuredValue : Math.min(prev, reading.measuredValue)));
      setMaxVal((prev) => (prev === null ? reading.measuredValue : Math.max(prev, reading.measuredValue)));
    }, isRealistic ? 350 : 200);

    return () => clearInterval(interval);
  }, [rawValue, functionMode, isRealistic, isHeld]);

  const activeReading = isHeld && heldReading ? heldReading : currentReading;

  const handleHoldToggle = () => {
    if (!isHeld) {
      setHeldReading(currentReading);
      setIsHeld(true);
    } else {
      setIsHeld(false);
      setHeldReading(null);
    }
  };

  const handleMinMaxToggle = () => {
    if (minMaxMode === null) setMinMaxMode("max");
    else if (minMaxMode === "max") setMinMaxMode("min");
    else {
      setMinMaxMode(null);
      setMinVal(null);
      setMaxVal(null);
    }
  };

  const displayedNumeric = () => {
    if (!activeReading) return "0.000";
    if (minMaxMode === "max" && maxVal !== null) return maxVal.toFixed(3);
    if (minMaxMode === "min" && minVal !== null) return minVal.toFixed(3);
    return activeReading.measuredValue;
  };

  const handleLog = () => {
    if (!activeReading || !onLogMeasurement) return;
    onLogMeasurement({
      quantity: functionMode.toUpperCase(),
      measuredValue: activeReading.measuredValue,
      nominalValue: activeReading.nominalValue,
      uncertainty: activeReading.absoluteUncertainty,
      unit: activeReading.unit,
      isRealistic,
      timestamp: new Date().toLocaleTimeString(),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="vail-dmm-chassis">
      {/* Top Banner */}
      <div className="vail-dmm-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>📟</span>
          <div>
            <div style={{ fontWeight: "800", letterSpacing: "1px", fontSize: "13px", color: "#f8fafc" }}>
              VAIL 2.0 BENCH DMM
            </div>
            <div style={{ fontSize: "10px", color: "#94a3b8" }}>True RMS Precision Instrument</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <button
            onClick={() => setIsRealistic(!isRealistic)}
            className={`dmm-mode-btn ${isRealistic ? "realistic" : "ideal"}`}
            title="Toggle between Ideal Mathematical and Realistic Lab Mode"
          >
            {isRealistic ? "🔬 Realistic (Noise/Tol)" : "⚡ Ideal Math"}
          </button>
          {onClose && (
            <button onClick={onClose} className="dmm-close-btn" title="Close DMM">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* LCD Screen Display */}
      <div className="vail-dmm-screen">
        <div className="dmm-screen-annunciators">
          <span className={isHeld ? "ann-active" : "ann-inactive"}>HOLD</span>
          <span className={minMaxMode ? "ann-active" : "ann-inactive"}>{minMaxMode ? minMaxMode.toUpperCase() : "AUTO"}</span>
          <span className={isRealistic ? "ann-active" : "ann-inactive"}>REALISTIC</span>
          <span className="ann-unit">{activeReading?.unit || "V"}</span>
        </div>

        <div className="dmm-screen-digits">
          <span className="digits-main">{displayedNumeric()}</span>
          <span className="digits-unit">{activeReading?.unit || "V"}</span>
        </div>

        {/* Real-time uncertainty readout */}
        <div className="dmm-uncertainty-bar">
          <span>Uncertainty: <strong>± {activeReading?.absoluteUncertainty ?? 0.001} {activeReading?.unit}</strong> (k=2, 95% CL)</span>
          <button
            onClick={() => setShowUncertaintyBudget(!showUncertaintyBudget)}
            className="dmm-budget-toggle-btn"
          >
            {showUncertaintyBudget ? "Hide Budget" : "View ISO Budget"}
          </button>
        </div>
      </div>

      {/* Uncertainty Budget Dropdown */}
      {showUncertaintyBudget && activeReading?.uncertaintyBudget && (
        <div className="dmm-budget-panel">
          <div style={{ fontSize: "11px", fontWeight: "700", marginBottom: "6px", color: "#38bdf8" }}>
            ISO / GUM Uncertainty Evaluation:
          </div>
          <table style={{ width: "100%", fontSize: "10px", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ color: "#94a3b8", textAlign: "left", borderBottom: "1px solid #334155" }}>
                <th>Component</th>
                <th>Type</th>
                <th>Standard u</th>
              </tr>
            </thead>
            <tbody>
              {activeReading.uncertaintyBudget.map((comp, i) => (
                <tr key={i} style={{ borderBottom: "1px solid rgba(51, 65, 85, 0.4)" }}>
                  <td style={{ padding: "3px 0", color: "#e2e8f0" }}>{comp.name}</td>
                  <td style={{ color: "#94a3b8" }}>{comp.type}</td>
                  <td style={{ color: "#38bdf8", fontWeight: "600" }}>{comp.standardUncertainty}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ fontSize: "10px", marginTop: "6px", color: "#a5f3fc" }}>
            Relative Expanded Uncertainty: <strong>{activeReading.relativeUncertaintyPercent}%</strong>
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="vail-dmm-controls">
        <button
          onClick={handleHoldToggle}
          className={`dmm-ctrl-btn ${isHeld ? "active" : ""}`}
        >
          {isHeld ? "UNHOLD" : "HOLD"}
        </button>

        <button
          onClick={handleMinMaxToggle}
          className={`dmm-ctrl-btn ${minMaxMode ? "active" : ""}`}
        >
          {minMaxMode ? `MIN/MAX (${minMaxMode.toUpperCase()})` : "MIN/MAX"}
        </button>

        <button
          onClick={handleLog}
          className="dmm-log-btn"
          title="Send current measured reading to the active observation table slot"
        >
          📥 Log to Observation
        </button>
      </div>

      {/* Rotary Function Selector */}
      <div className="vail-dmm-dial-section">
        <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "6px", textAlign: "center" }}>
          Measurement Function:
        </div>
        <div className="vail-dmm-dial-grid">
          {[
            { id: "dcv", label: "DC V", icon: "⎓" },
            { id: "acv", label: "AC V", icon: "∿" },
            { id: "dca", label: "DC mA", icon: "A" },
            { id: "res", label: "Ω (Ohm)", icon: "Ω" },
            { id: "cap", label: "μF (Cap)", icon: "⫣⫢" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setFunctionMode(item.id);
                setIsHeld(false);
              }}
              className={`dmm-dial-btn ${functionMode === item.id ? "active" : ""}`}
            >
              <span style={{ fontSize: "12px" }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Probe Terminals */}
      <div className="vail-dmm-terminals">
        <div className="terminal-socket black" title="Common Ground (COM)">
          <span className="socket-hole"></span>
          <span className="socket-label">COM</span>
        </div>
        <div className="terminal-socket red" title="Voltage / Resistance / Capacitance Input">
          <span className="socket-hole"></span>
          <span className="socket-label">V / Ω / C</span>
        </div>
        <div className="terminal-socket yellow" title="Current Input (mA / A)">
          <span className="socket-hole"></span>
          <span className="socket-label">mA / A</span>
        </div>
      </div>
    </div>
  );
}
