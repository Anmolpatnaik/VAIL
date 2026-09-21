import { useEffect, useRef, useState, memo } from "react";
import RC3D from "./RC3D";
import ValidatedParameterControl from "./ValidatedParameterControl";

/*
 * ============================================================
 * RC CIRCUIT VIRTUAL LAB
 * ============================================================
 *
 * This component provides:
 * 1. Experimental controls
 * 2. RC simulation engine
 * 3. Live capacitor-voltage calculation
 * 4. Live current calculation
 * 5. Time-series recording
 * 6. Voltage vs time graph
 * 7. Current vs time graph
 * 8. Connection to RC3D.jsx
 * ============================================================
 */

export default function RCSimulation({ onSaveData }) {
  /*
   * ==========================================================
   * EXPERIMENTAL PARAMETERS
   * ==========================================================
   */
  const [voltage, setVoltage] = useState(5);
  const [resistance, setResistance] = useState(1000);
  const [capacitance, setCapacitance] = useState(1000);

  /*
   * ==========================================================
   * SIMULATION STATE
   * ==========================================================
   */
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState("charge");
  const [capacitorVoltage, setCapacitorVoltage] = useState(0);
  const [current, setCurrent] = useState(0);

  /*
   * ==========================================================
   * GRAPH DATA
   * ==========================================================
   */
  const [graphData, setGraphData] = useState([]);

  /*
   * ==========================================================
   * REFS
   * ==========================================================
   */
  const elapsedRef = useRef(0);
  const lastTimeRef = useRef(null);
  const dischargeInitialVoltageRef = useRef(0);
  const lastGraphUpdateRef = useRef(0);
  const lastStateUpdateRef = useRef(0);

  const safeR = Math.max(resistance || 0, 1);
  const safeC = Math.max(capacitance || 0, 1);
  const tau = (safeR * safeC) / 1000000;
  const fiveTau = tau * 5;
  const initialChargingCurrent = voltage / safeR;

  /*
   * ==========================================================
   * RECORD OBSERVATION TO TABLE
   * ==========================================================
   */
  const recordRCObservation = () => {
    if (onSaveData) {
      const tauVal = (resistance * (capacitance * 1e-6)).toFixed(3);
      onSaveData({
        voltage: voltage.toFixed(1),
        resistance: resistance.toFixed(0),
        capacitance: capacitance.toFixed(0),
        tau: `${tauVal} s`,
        vc: `${capacitorVoltage.toFixed(2)} V`,
        current: `${(current * 1000).toFixed(2)} mA`,
      });
    }
  };

  /*
   * ==========================================================
   * RC SIMULATION ENGINE
   * ==========================================================
   */
  useEffect(() => {
    if (!running) {
      lastTimeRef.current = null;
      lastStateUpdateRef.current = 0;
      return;
    }

    let animationFrame;

    const animate = (timestamp) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
      }

      const delta = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      const safeDelta = Math.min(delta, 0.1);
      elapsedRef.current += safeDelta;
      const t = elapsedRef.current;

      let vc = 0;
      let i = 0;

      // Charging
      if (mode === "charge") {
        vc = voltage * (1 - Math.exp(-t / tau));
        i = (voltage / safeR) * Math.exp(-t / tau);
        vc = Math.min(vc, voltage);

        if (t >= tau * 5) {
          vc = voltage;
          i = 0;
          setCapacitorVoltage(vc);
          setCurrent(i);
          setGraphData((previous) => [
            ...previous,
            { time: tau * 5, voltage: vc, current: 0 },
          ]);
          setRunning(false);
          return;
        }
      }

      // Discharging
      if (mode === "discharge") {
        const initialVoltage = dischargeInitialVoltageRef.current;
        vc = initialVoltage * Math.exp(-t / tau);
        i = -(initialVoltage / safeR) * Math.exp(-t / tau);
        vc = Math.max(vc, 0);

        if (t >= tau * 5) {
          vc = 0;
          i = 0;
          setCapacitorVoltage(0);
          setCurrent(0);
          setGraphData((previous) => [
            ...previous,
            { time: tau * 5, voltage: 0, current: 0 },
          ]);
          setRunning(false);
          return;
        }
      }

      // Throttle React state updates to ~30 FPS (every 33ms) to prevent UI thread lag
      if (timestamp - lastStateUpdateRef.current >= 33) {
        lastStateUpdateRef.current = timestamp;
        setCapacitorVoltage(vc);
        setCurrent(i);
      }

      // Record graph sample every 100ms (max 150 points for optimal SVG rendering)
      if (timestamp - lastGraphUpdateRef.current >= 100) {
        lastGraphUpdateRef.current = timestamp;
        setGraphData((previous) => {
          const next = [
            ...previous,
            { time: t, voltage: vc, current: i },
          ];
          return next.length > 150 ? next.slice(next.length - 150) : next;
        });
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [running, mode, voltage, resistance, capacitance, tau]);

  /*
   * ==========================================================
   * CONTROL HANDLERS
   * ==========================================================
   */
  const startCharging = () => {
    setRunning(false);
    setMode("charge");
    elapsedRef.current = 0;
    lastTimeRef.current = null;
    lastGraphUpdateRef.current = 0;
    setCapacitorVoltage(0);
    setCurrent(voltage / safeR);
    setGraphData([
      { time: 0, voltage: 0, current: voltage / safeR },
    ]);
    requestAnimationFrame(() => setRunning(true));
  };

  const startDischarging = () => {
    let initialVoltage = capacitorVoltage;
    if (initialVoltage <= 0) {
      initialVoltage = voltage;
      setCapacitorVoltage(initialVoltage);
    }
    dischargeInitialVoltageRef.current = initialVoltage;

    setRunning(false);
    setMode("discharge");
    elapsedRef.current = 0;
    lastTimeRef.current = null;
    lastGraphUpdateRef.current = 0;
    setCurrent(-initialVoltage / safeR);
    setGraphData([
      { time: 0, voltage: initialVoltage, current: -initialVoltage / safeR },
    ]);
    requestAnimationFrame(() => setRunning(true));
  };

  const stopSimulation = () => {
    setRunning(false);
    setCurrent(0);
  };

  const resetSimulation = () => {
    setRunning(false);
    elapsedRef.current = 0;
    lastTimeRef.current = null;
    lastGraphUpdateRef.current = 0;
    dischargeInitialVoltageRef.current = 0;
    setCapacitorVoltage(0);
    setCurrent(0);
    setMode("charge");
    setGraphData([]);
  };

  const handleFullReset = () => {
    resetSimulation();
    setVoltage(0);
    setResistance(1000);
    setCapacitance(1000);
  };

  const changeVoltage = (value) => {
    setVoltage(value);
    if (running) stopSimulation();
  };

  const changeResistance = (value) => {
    setResistance(value);
    if (running) stopSimulation();
  };

  const changeCapacitance = (value) => {
    setCapacitance(value);
    if (running) stopSimulation();
  };

  const [invalidInputs, setInvalidInputs] = useState({});
  const hasInvalid = Object.values(invalidInputs).some(Boolean);
  const setFieldInvalid = (field, isVal) => setInvalidInputs(p => ({ ...p, [field]: !isVal }));

  return (
    <div
      style={{
        width: "100%",
        boxSizing: "border-box",
        fontFamily: "Arial, Helvetica, sans-serif",
        color: "#ffffff",
      }}
    >
      {/* TITLE */}
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ margin: 0, fontSize: "28px", color: "#60a5fa" }}>
          ⚡ RC Circuit Simulation
        </h2>
        <p style={{ marginTop: "7px", marginBottom: 0, color: "#94a3b8" }}>
          Virtual laboratory experiment for studying capacitor charging, discharging, and transient response.
        </p>
      </div>

      {/* MAIN WORKSPACE GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(280px, 320px) minmax(0, 1fr)",
          gap: "20px",
          alignItems: "start",
        }}
      >
        {/* CONTROL PANEL */}
        <div className="sim-control-panel">
          {/* LABORATORY REAL-TIME CALIBRATION CAUTION */}
          <div className="lab-caution-banner">
            <span className="lab-caution-icon">⚠️</span>
            <div className="lab-caution-content">
              <div className="lab-caution-title">Real-Time Lab Calibration</div>
              <div className="lab-caution-text">
                All input ranges (0–30V DC, 50–50,000Ω, 1–5000μF) are strictly calibrated to real physical laboratory bench supplies and standard decade components. Values outside this range will be rejected.
              </div>
            </div>
          </div>

          <div className="sim-panel-title">
            Experimental Parameters
          </div>

          <ValidatedParameterControl
            label="Supply Voltage"
            limitHint="0 – 30 V (Dual Bench Supply)"
            value={voltage}
            unit="V"
            min={0}
            max={30}
            step={0.1}
            onChange={changeVoltage}
            onValidityChange={(isVal) => setFieldInvalid("voltage", isVal)}
          />

          <ValidatedParameterControl
            label="Resistance"
            limitHint="50 – 50,000 Ω (Decade Box)"
            value={resistance}
            unit="Ω"
            min={50}
            max={50000}
            step={50}
            onChange={changeResistance}
            onValidityChange={(isVal) => setFieldInvalid("resistance", isVal)}
          />

          <ValidatedParameterControl
            label="Capacitance"
            limitHint="1 – 5000 μF (Capacitor Range)"
            value={capacitance}
            unit="μF"
            min={1}
            max={5000}
            step={10}
            onChange={changeCapacitance}
            onValidityChange={(isVal) => setFieldInvalid("capacitance", isVal)}
          />

          {/* TIME CONSTANT CARD */}
          <div className="sim-highlight-card">
            <div className="sim-highlight-card-title">Time Constant</div>
            <div className="sim-highlight-card-val">
              τ = {tau.toFixed(3)} s
            </div>
            <div className="sim-highlight-card-sub">
              5τ = {fiveTau.toFixed(3)} s
            </div>
          </div>

          {hasInvalid && (
            <div className="sim-input-error-msg" style={{ marginTop: "12px", padding: "6px 10px" }}>
              ⚠️ Cannot simulate: One or more parameters exceed the permissible lab range. Please correct invalid inputs.
            </div>
          )}

          {/* ACTION BUTTONS */}
          <button
            onClick={startCharging}
            disabled={running || hasInvalid}
            className="sim-btn-primary"
            style={{ marginTop: "14px" }}
          >
            🔋 Charge Capacitor
          </button>

          <button
            onClick={startDischarging}
            disabled={running || hasInvalid}
            className="sim-btn-danger"
            style={{ marginTop: "10px" }}
          >
            ⚡ Discharge Capacitor
          </button>

          <button
            onClick={stopSimulation}
            disabled={!running}
            className="sim-btn-slate"
            style={{ marginTop: "10px" }}
          >
            ⏹ Stop Simulation
          </button>

          <button
            onClick={recordRCObservation}
            className="sim-btn-success"
            style={{ marginTop: "10px" }}
          >
            📥 Record to Observation Table
          </button>

          <button
            onClick={handleFullReset}
            className="sim-btn-reset"
            title="Reset parameters to 0 V defaults and clear simulation"
            style={{ marginTop: "10px" }}
          >
            <span>🔄</span> Reset to Baseline (0 V)
          </button>
        </div>

        {/* 3D VISUALIZATION VIEWPORT */}
        <div
          style={{
            minWidth: 0,
            height: "440px",
            borderRadius: "12px",
            overflow: "hidden",
            background: "#071321",
            border: "1px solid #1e3a5f",
          }}
        >
          <RC3D
            powerOn={running}
            mode={mode}
            capacitorVoltage={capacitorVoltage}
            current={current}
            voltage={voltage}
            resistance={resistance}
            capacitance={capacitance}
          />
        </div>
      </div>

      {/* LIVE RESULTS METRICS */}
      <div className="sim-metrics-grid">
        <ResultCard title="Time Constant" value={`${tau.toFixed(3)} s`} />
        <ResultCard title="Supply Voltage" value={`${voltage.toFixed(1)} V`} />
        <ResultCard title="Capacitor Voltage" value={`${capacitorVoltage.toFixed(2)} V`} />
        <ResultCard title="Current" value={`${(current * 1000).toFixed(2)} mA`} />
        <ResultCard title="Initial Current" value={`${(initialChargingCurrent * 1000).toFixed(2)} mA`} />
      </div>

      {/* GRAPH SECTION */}
      <div className="sim-graph-card">
        <div style={{ marginBottom: "18px" }}>
          <h3 className="sim-graph-title">
            Experimental Graphs
          </h3>
          <p className="sim-graph-subtitle">
            Live transient response plots of the RC circuit.
          </p>
        </div>

        {/* VOLTAGE GRAPH */}
        <RCGraph
          title="Capacitor Voltage vs Time"
          yLabel="Voltage (V)"
          xLabel="Time (s)"
          data={graphData}
          dataKey="voltage"
          colorType="voltage"
          maxY={voltage}
          tau={tau}
          finalValue={voltage}
        />

        {/* CURRENT GRAPH */}
        <div style={{ marginTop: "25px" }}>
          <RCGraph
            title="Current vs Time"
            yLabel="Current (mA)"
            xLabel="Time (s)"
            data={graphData}
            dataKey="current"
            colorType="current"
            maxY={Math.max(
              ((mode === "discharge" ? (dischargeInitialVoltageRef.current || voltage) : voltage) / safeR) * 1000,
              1.0
            )}
            tau={tau}
            finalValue={0}
            currentMode={mode}
          />
        </div>
      </div>

      {/* STATUS BANNER */}
      <div
        style={{
          marginTop: "20px",
          padding: "14px",
          borderRadius: "10px",
          textAlign: "center",
          background: running
            ? mode === "charge"
              ? "rgba(34, 197, 94, 0.15)"
              : "rgba(249, 115, 22, 0.15)"
            : "rgba(100, 116, 139, 0.15)",
          color: running
            ? mode === "charge"
              ? "#4ade80"
              : "#fb923c"
            : "#94a3b8",
          fontWeight: "bold",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        {running ? (
          mode === "charge"
            ? "🔋 Capacitor is charging — observing exponential rise"
            : "⚡ Capacitor is discharging — observing exponential decay"
        ) : graphData.length > 0 ? (
          "⏹ Experiment stopped — recorded graph data is retained"
        ) : (
          "Ready — select Charge or Discharge to begin"
        )}
      </div>
    </div>
  );
}

/*
 * ============================================================
 * PARAMETER CONTROL
 * ============================================================
 */
function ParameterControl({ label, limitHint, value, unit, min, max, step, onChange }) {
  return (
    <div className="sim-param-box">
      <div className="sim-param-header">
        <div className="sim-param-title">
          <span>{label}</span>
          {limitHint && <span className="sim-param-limit">Range: {limitHint}</span>}
        </div>
        <div className="sim-param-input-wrap">
          <input
            type="number"
            className="sim-num-input"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === "") {
                onChange(0);
                return;
              }
              const parsed = parseFloat(raw);
              onChange(isNaN(parsed) ? 0 : parsed);
            }}
          />
          <span className="sim-param-unit">{unit}</span>
        </div>
      </div>
      <input
        type="range"
        className="sim-param-slider"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
}

/*
 * ============================================================
 * BUTTON STYLE
 * ============================================================
 */
function buttonStyle(background, disabled) {
  return {
    width: "100%",
    padding: "12px",
    marginTop: "10px",
    border: "none",
    borderRadius: "8px",
    background,
    color: "white",
    fontWeight: "bold",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.55 : 1,
  };
}

/*
 * ============================================================
 * RESULT CARD
 * ============================================================
 */
function ResultCard({ title, value, unit }) {
  return (
    <div className="sim-metric-card">
      <div className="sim-metric-title">{title}</div>
      <div className="sim-metric-val">
        {value} {unit && <span className="sim-metric-unit">{unit}</span>}
      </div>
    </div>
  );
}

/*
 * ============================================================
 * RC GRAPH (SVG) - Robust Laboratory Scale & Accurate Trace
 * ============================================================
 */
const RCGraph = memo(function RCGraph({
  title,
  yLabel,
  xLabel,
  data,
  dataKey,
  maxY,
  tau,
  finalValue,
  colorType,
  currentMode,
}) {
  const width = 900;
  const height = 300;
  const paddingLeft = 65;
  const paddingRight = 25;
  const paddingTop = 35;
  const paddingBottom = 45;

  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  const maxTime =
    data && data.length > 0
      ? Math.max(tau * 5, data[data.length - 1].time, 1)
      : Math.max(tau * 5, 1);

  const yMax = Math.max(maxY > 0 ? maxY : (colorType === "voltage" ? 10 : 1), 0.001);

  const getX = (time) => paddingLeft + (Math.max(0, time) / maxTime) * plotWidth;

  const getY = (value) => {
    if (colorType === "current") {
      return (
        paddingTop +
        plotHeight / 2 -
        (value / yMax) * (plotHeight / 2)
      );
    }
    return paddingTop + plotHeight - (value / yMax) * plotHeight;
  };

  // Filter valid data points strictly to avoid any NaN or gap crashes
  const validData = (data || []).filter(
    (item) => item && typeof item.time === "number" && !isNaN(item.time) &&
      (dataKey === "current" ? !isNaN(item.current) : !isNaN(item.voltage))
  );

  const points = validData
    .map((item) => {
      const value = dataKey === "current" ? item.current * 1000 : item.voltage;
      return `${getX(item.time)},${getY(value)}`;
    })
    .join(" ");

  const lastPoint = validData.length > 0 ? validData[validData.length - 1] : null;
  const lastVal = lastPoint ? (dataKey === "current" ? lastPoint.current * 1000 : lastPoint.voltage) : 0;

  const yLabels =
    colorType === "current"
      ? [yMax, yMax / 2, 0, -yMax / 2, -yMax]
      : [yMax, yMax * 0.75, yMax * 0.5, yMax * 0.25, 0];

  const xLabels = [0, maxTime * 0.25, maxTime * 0.5, maxTime * 0.75, maxTime];

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <span style={{ fontWeight: "bold", fontSize: "16px", color: "#0f172a" }}>
          {title}
        </span>
        {lastPoint && (
          <span style={{ fontSize: "12px", fontFamily: "monospace", background: "#f1f5f9", padding: "3px 8px", borderRadius: "4px", color: "#0f172a", border: "1px solid #cbd5e1" }}>
            Live: t = {lastPoint.time.toFixed(2)}s | {dataKey === "current" ? "I" : "V"} = {lastVal.toFixed(2)} {dataKey === "current" ? "mA" : "V"}
          </span>
        )}
      </div>

      <div
        style={{
          width: "100%",
          overflowX: "auto",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          background: "#fbfdff",
        }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: "100%", minWidth: "650px", display: "block" }}
        >
          <rect x="0" y="0" width={width} height={height} fill="#fbfdff" />

          {/* GRID */}
          {yLabels.map((value, index) => {
            const y = getY(value);
            return (
              <g key={`y-${index}`}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#dbe3ec"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="#64748b"
                >
                  {value.toFixed(1)}
                </text>
              </g>
            );
          })}

          {xLabels.map((value, index) => {
            const x = getX(value);
            return (
              <g key={`x-${index}`}>
                <line
                  x1={x}
                  y1={paddingTop}
                  x2={x}
                  y2={height - paddingBottom}
                  stroke="#edf2f7"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={height - paddingBottom + 18}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#64748b"
                >
                  {value.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* AXES */}
          <line
            x1={paddingLeft}
            y1={paddingTop}
            x2={paddingLeft}
            y2={height - paddingBottom}
            stroke="#475569"
            strokeWidth="2"
          />

          <line
            x1={paddingLeft}
            y1={colorType === "current" ? getY(0) : height - paddingBottom}
            x2={width - paddingRight}
            y2={colorType === "current" ? getY(0) : height - paddingBottom}
            stroke="#475569"
            strokeWidth="2"
          />

          {/* TAU MARKER */}
          {tau <= maxTime && (
            <g>
              <line
                x1={getX(tau)}
                y1={paddingTop}
                x2={getX(tau)}
                y2={height - paddingBottom}
                stroke="#94a3b8"
                strokeWidth="1.5"
                strokeDasharray="5 5"
              />
              <text x={getX(tau) + 5} y={paddingTop + 15} fontSize="11" fill="#64748b" fontWeight="bold">
                τ ({tau.toFixed(2)}s)
              </text>
            </g>
          )}

          {/* THEORETICAL REFERENCE */}
          {colorType === "voltage" && finalValue > 0 && (
            <line
              x1={paddingLeft}
              y1={getY(finalValue)}
              x2={width - paddingRight}
              y2={getY(finalValue)}
              stroke="#94a3b8"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          )}

          {/* TRACE CURVE */}
          {validData.length > 1 && (
            <polyline
              points={points}
              fill="none"
              stroke={colorType === "voltage" ? "#1976d2" : "#16a34a"}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* ACTIVE POINT WITH COORDINATES */}
          {lastPoint && (
            <circle
              cx={getX(lastPoint.time)}
              cy={getY(lastVal)}
              r="4.5"
              fill={colorType === "voltage" ? "#1976d2" : "#16a34a"}
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          )}

          {/* ZERO LINE FOR CURRENT */}
          {colorType === "current" && (
            <text
              x={width - paddingRight - 5}
              y={getY(0) - 6}
              textAnchor="end"
              fontSize="10"
              fill="#64748b"
            >
              0 mA
            </text>
          )}

          {/* AXIS TITLES */}
          <text
            x={width / 2}
            y={height - 8}
            textAnchor="middle"
            fontSize="12"
            fontWeight="bold"
            fill="#475569"
          >
            {xLabel}
          </text>

          <text
            x="16"
            y={height / 2}
            textAnchor="middle"
            transform={`rotate(-90 16 ${height / 2})`}
            fontSize="12"
            fontWeight="bold"
            fill="#475569"
          >
            {yLabel}
          </text>
        </svg>
      </div>

      {/* GRAPH INFO */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "8px",
          marginTop: "7px",
          fontSize: "11px",
          color: "#64748b",
        }}
      >
        <span>Dashed line = theoretical reference</span>
        <span>Vertical marker = τ</span>
        {currentMode && (
          <span>
            Mode: {currentMode === "charge" ? "Charging" : "Discharging"}
          </span>
        )}
      </div>
    </div>
  );
});