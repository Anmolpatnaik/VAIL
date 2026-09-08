import { useEffect, useRef, useState } from "react";
import RC3D from "./RC3D";

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

  /*
   * ==========================================================
   * TIME CONSTANT (τ = RC)
   * ==========================================================
   */
  const tau = (resistance * capacitance) / 1000000;
  const fiveTau = tau * 5;
  const initialChargingCurrent = voltage / resistance;

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
        i = (voltage / resistance) * Math.exp(-t / tau);
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
        i = -(initialVoltage / resistance) * Math.exp(-t / tau);
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

      setCapacitorVoltage(vc);
      setCurrent(i);

      // Record graph sample every 50ms
      if (timestamp - lastGraphUpdateRef.current >= 50) {
        lastGraphUpdateRef.current = timestamp;
        setGraphData((previous) => {
          const next = [
            ...previous,
            { time: t, voltage: vc, current: i },
          ];
          return next.length > 300 ? next.slice(next.length - 300) : next;
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
    setCurrent(voltage / resistance);
    setGraphData([
      { time: 0, voltage: 0, current: voltage / resistance },
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
    setCurrent(-initialVoltage / resistance);
    setGraphData([
      { time: 0, voltage: initialVoltage, current: -initialVoltage / resistance },
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

  const changeVoltage = (value) => {
    setVoltage(value);
    resetSimulation();
  };

  const changeResistance = (value) => {
    setResistance(value);
    resetSimulation();
  };

  const changeCapacitance = (value) => {
    setCapacitance(value);
    resetSimulation();
  };

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
        <div
          style={{
            padding: "20px",
            border: "1px solid #1e3a5f",
            borderRadius: "12px",
            background: "#08101d",
            boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
          }}
        >
          <div
            style={{
              fontSize: "17px",
              fontWeight: "bold",
              marginBottom: "18px",
              color: "#38bdf8",
            }}
          >
            Experimental Parameters
          </div>

          <ParameterControl
            label="Supply Voltage"
            value={voltage}
            unit="V"
            min={1}
            max={20}
            step={1}
            onChange={changeVoltage}
          />

          <ParameterControl
            label="Resistance"
            value={resistance}
            unit="Ω"
            min={100}
            max={10000}
            step={100}
            onChange={changeResistance}
          />

          <ParameterControl
            label="Capacitance"
            value={capacitance}
            unit="μF"
            min={100}
            max={5000}
            step={100}
            onChange={changeCapacitance}
          />

          {/* TIME CONSTANT CARD */}
          <div
            style={{
              marginTop: "18px",
              padding: "14px",
              borderRadius: "9px",
              background: "#030811",
              border: "1px solid #1e293b",
            }}
          >
            <div style={{ fontSize: "12px", color: "#64748b" }}>TIME CONSTANT</div>
            <div style={{ fontSize: "22px", fontWeight: "bold", marginTop: "3px", color: "#38bdf8" }}>
              τ = {tau.toFixed(3)} s
            </div>
            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "5px" }}>
              5τ = {fiveTau.toFixed(3)} s
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <button
            onClick={startCharging}
            disabled={running}
            style={buttonStyle("#1976d2", running)}
          >
            🔋 Charge Capacitor
          </button>

          <button
            onClick={startDischarging}
            disabled={running}
            style={buttonStyle("#d64545", running)}
          >
            ⚡ Discharge Capacitor
          </button>

          <button
            onClick={stopSimulation}
            disabled={!running}
            style={buttonStyle("#475569", !running)}
          >
            ⏹ Stop Simulation
          </button>

          <button
            onClick={resetSimulation}
            style={{
              width: "100%",
              padding: "11px",
              borderRadius: "8px",
              border: "1px solid #475569",
              background: "#0f172a",
              color: "#cbd5e1",
              cursor: "pointer",
              fontWeight: "bold",
              marginTop: "10px",
            }}
          >
            🔄 Reset Experiment
          </button>

          <button
            onClick={recordRCObservation}
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "10px",
              border: "none",
              borderRadius: "8px",
              background: "#059669",
              color: "white",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            📥 Record to Observation Table
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
      <div
        style={{
          marginTop: "20px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "12px",
        }}
      >
        <ResultCard title="Time Constant" value={`${tau.toFixed(3)} s`} />
        <ResultCard title="Supply Voltage" value={`${voltage.toFixed(1)} V`} />
        <ResultCard title="Capacitor Voltage" value={`${capacitorVoltage.toFixed(2)} V`} />
        <ResultCard title="Current" value={`${(current * 1000).toFixed(2)} mA`} />
        <ResultCard title="Initial Current" value={`${(initialChargingCurrent * 1000).toFixed(2)} mA`} />
      </div>

      {/* GRAPH SECTION */}
      <div
        style={{
          marginTop: "25px",
          padding: "20px",
          border: "1px solid #1e3a5f",
          borderRadius: "12px",
          background: "#ffffff",
          color: "#0f172a",
        }}
      >
        <div style={{ marginBottom: "18px" }}>
          <h3 style={{ margin: 0, fontSize: "20px", color: "#0f172a" }}>
            Experimental Graphs
          </h3>
          <p style={{ marginTop: "5px", color: "#64748b", fontSize: "13px" }}>
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
            maxY={Math.max(initialChargingCurrent * 1000, Math.abs(current) * 1000, 0.001)}
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
function ParameterControl({ label, value, unit, min, max, step, onChange }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "6px",
          fontSize: "13px",
          color: "#cbd5e1",
        }}
      >
        <span>{label}</span>
        <strong style={{ color: "#ffffff" }}>
          {value} {unit}
        </strong>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: "#38bdf8", cursor: "pointer" }}
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
function ResultCard({ title, value }) {
  return (
    <div
      style={{
        padding: "15px",
        border: "1px solid #1e3a5f",
        borderRadius: "10px",
        background: "#08101d",
      }}
    >
      <div style={{ fontSize: "12px", color: "#38bdf8", marginBottom: "6px" }}>
        {title}
      </div>
      <strong style={{ fontSize: "20px", color: "#ffffff" }}>{value}</strong>
    </div>
  );
}

/*
 * ============================================================
 * RC GRAPH (SVG)
 * ============================================================
 */
function RCGraph({
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
    data.length > 0
      ? Math.max(tau * 5, data[data.length - 1].time, 0.001)
      : Math.max(tau * 5, 1);

  const yMax = Math.max(maxY || 1, 0.001);

  const getX = (time) => paddingLeft + (time / maxTime) * plotWidth;

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

  const points = data
    .map((item) => {
      const value = dataKey === "current" ? item.current * 1000 : item.voltage;
      return `${getX(item.time)},${getY(value)}`;
    })
    .join(" ");

  const yLabels =
    colorType === "current"
      ? [yMax, yMax / 2, 0, -yMax / 2, -yMax]
      : [yMax, yMax * 0.75, yMax * 0.5, yMax * 0.25, 0];

  const xLabels = [0, maxTime * 0.25, maxTime * 0.5, maxTime * 0.75, maxTime];

  return (
    <div style={{ width: "100%" }}>
      <div style={{ fontWeight: "bold", marginBottom: "8px", fontSize: "16px", color: "#0f172a" }}>
        {title}
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
              <text x={getX(tau) + 5} y={paddingTop + 15} fontSize="11" fill="#64748b">
                τ
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
          {data.length > 1 && (
            <polyline
              points={points}
              fill="none"
              stroke={colorType === "voltage" ? "#1976d2" : "#16a34a"}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
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
}