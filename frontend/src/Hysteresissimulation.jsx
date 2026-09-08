//export default function HysteresisSimulation({ onSaveData }) {
import { useEffect, useRef, useState } from "react";
import Hysteresis3D from "./Hysteresis3D";

/*
=========================================================
MATERIAL DATABASE
=========================================================
*/
const MATERIALS = {
  iron: {
    name: "Soft Iron (Fe)",
    category: "Soft Ferromagnetic",
    type: "sigmoid",
    color: "#2563eb",
    saturationFactor: 1.0,
    coercivityRatio: 0.10, // Narrow coercivity
    remanenceRatio: 0.25,
    steepness: 3.2,
    kh: 1.2,
    description: "High permeability, low coercivity, slender sigmoid loop."
  },
  silicon_iron: {
    name: "Silicon Steel (Transformer Core)",
    category: "Soft Ferromagnetic",
    type: "sigmoid",
    color: "#0284c7",
    saturationFactor: 1.05,
    coercivityRatio: 0.06,
    remanenceRatio: 0.20,
    steepness: 3.8,
    kh: 0.9,
    description: "Ultra-thin sigmoid curve tailored for minimal hysteresis transformer loss."
  },
  cobalt: {
    name: "Cobalt (Co)",
    category: "Soft Ferromagnetic",
    type: "sigmoid",
    color: "#4f46e5",
    saturationFactor: 0.92,
    coercivityRatio: 0.16,
    remanenceRatio: 0.35,
    steepness: 2.8,
    kh: 1.6,
    description: "High saturation magnetization with smooth S-shaped hysteresis."
  },
  nickel: {
    name: "Nickel (Ni)",
    category: "Soft Ferromagnetic",
    type: "sigmoid",
    color: "#0d9488",
    saturationFactor: 0.65,
    coercivityRatio: 0.14,
    remanenceRatio: 0.30,
    steepness: 2.9,
    kh: 1.4,
    description: "Low saturation flux density, rapid sigmoid inflection."
  },
  carbon_steel: {
    name: "Carbon Steel",
    category: "Hard Ferromagnetic",
    type: "rhombus",
    color: "#dc2626",
    saturationFactor: 0.95,
    coercivityRatio: 0.45, // Wide coercivity (Rhombus shape)
    remanenceRatio: 0.72,  // High remanence
    steepness: 1.8,
    kh: 3.8,
    description: "High coercivity and remanence forming a wide rhombus hysteresis loop."
  },
  alnico: {
    name: "Alnico Alloy",
    category: "Hard Ferromagnetic",
    type: "rhombus",
    color: "#ea580c",
    saturationFactor: 0.88,
    coercivityRatio: 0.52,
    remanenceRatio: 0.78,
    steepness: 1.6,
    kh: 4.5,
    description: "Permanent magnet material with pronounced rhombus profile and massive loop area."
  }
};

export default function HysteresisSimulation({ onSaveData }) {
  /*
  -------------------------------------------------------
  EXPERIMENTAL & MATERIAL PARAMETERS
  -------------------------------------------------------
  */
  const [selectedMaterialKey, setSelectedMaterialKey] = useState("iron");
  const material = MATERIALS[selectedMaterialKey];

  const [voltage, setVoltage] = useState(6);
  const [frequency, setFrequency] = useState(50);
  const [turns, setTurns] = useState(200);
  const [coreArea, setCoreArea] = useState(4);
  const [magneticPath, setMagneticPath] = useState(0.25);

  const coreAreaM2 = coreArea * 0.0001;

  /*
  -------------------------------------------------------
  SIMULATION STATE
  -------------------------------------------------------
  */
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [magneticField, setMagneticField] = useState(0);
  const [fluxDensity, setFluxDensity] = useState(0);
  const [current, setCurrent] = useState(0);
  const [flux, setFlux] = useState(0);
  const [loss, setLoss] = useState(0);
  const [loopPoints, setLoopPoints] = useState([]);
  const [backendResults, setBackendResults] = useState(null);
  const [backendStatus, setBackendStatus] = useState("");

  const lastTimeRef = useRef(null);
  const elapsedRef = useRef(0);

  // Maximum field calculations
  const maximumCurrent = voltage / 100;
  const maximumField = (turns * maximumCurrent) / magneticPath;

  let maximumFluxDensity =
    (voltage / (2 * Math.PI * frequency * turns * coreAreaM2)) *
    material.saturationFactor;
  maximumFluxDensity = Math.min(maximumFluxDensity, 2.2);

  /*
  -------------------------------------------------------
  PHYSICAL HYSTERESIS CALCULATION (Sigmoid vs Rhombus)
  -------------------------------------------------------
  */
  const computeFluxDensity = (H_val, dH_dt) => {
    const Hc = maximumField * material.coercivityRatio;
    const direction = dH_dt >= 0 ? -1 : 1; // Lower branch when increasing, upper branch when decreasing
    const Heff = H_val + direction * Hc;

    let B_calculated = 0;

    if (material.type === "sigmoid") {
      // Smooth Sigmoid curve using hyperbolic tangent
      const normH = Heff / Math.max(maximumField * 0.45, 0.001);
      B_calculated = maximumFluxDensity * Math.tanh(normH * (material.steepness / 2.5));
    } else {
      // Rhombus / Hard Ferromagnetic shape (Linear slopes + wide saturation thresholds)
      const normH = Heff / Math.max(maximumField * 0.75, 0.001);
      // Rhombic blend: 70% linear piecewise slope + 30% saturation rounded corners
      const linearBranch = Math.max(-1, Math.min(1, normH * 1.35));
      const curvedBranch = Math.tanh(normH * material.steepness);
      B_calculated = maximumFluxDensity * (0.65 * linearBranch + 0.35 * curvedBranch);
    }

    return Math.max(-maximumFluxDensity, Math.min(maximumFluxDensity, B_calculated));
  };

  /*
  -------------------------------------------------------
  ANIMATION LOOP
  -------------------------------------------------------
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
      const dt = Math.min(delta, 0.03);

      elapsedRef.current += dt;
      const t = elapsedRef.current;
      setTime(t);

      const omega = 2 * Math.PI * frequency;
      const phase = omega * t;

      const baseCurrent = maximumCurrent * Math.sin(phase);
      const H = (turns * baseCurrent) / magneticPath;
      const dH_dt = (turns * maximumCurrent * omega * Math.cos(phase)) / magneticPath;

      const B = computeFluxDensity(H, dH_dt);
      const phi = B * coreAreaM2;

      // Steinmetz loss calculation
      const hysteresisLoss =
        material.kh *
        frequency *
        Math.pow(Math.abs(maximumFluxDensity), 1.6) *
        (material.type === "rhombus" ? 2.4 : 1.0);

      setMagneticField(H);
      setFluxDensity(B);
      setCurrent(baseCurrent);
      setFlux(phi);
      setLoss(hysteresisLoss);

      setLoopPoints((prev) => {
        const next = [...prev, { h: H, b: B }];
        return next.length > 500 ? next.slice(next.length - 500) : next;
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [
    running,
    voltage,
    frequency,
    turns,
    coreAreaM2,
    magneticPath,
    maximumCurrent,
    maximumField,
    maximumFluxDensity,
    selectedMaterialKey
  ]);
  /*
  -------------------------------------------------------
  RECORD OBSERVATION TO TABLE
  -------------------------------------------------------
  */
  const recordCurrentObservation = () => {
    if (onSaveData) {
      onSaveData({
        maxH: maximumField.toFixed(1),
        freq: frequency,
        maxB: maximumFluxDensity.toFixed(3),
        minB: (-maximumFluxDensity).toFixed(3),
        remanence: (maximumFluxDensity * 0.12).toFixed(3),
        coercivity: (maximumField * 0.15).toFixed(1),
        loopArea: (loss / frequency).toFixed(3),
        loss: loss.toFixed(3),
      });
    }
  };

  /*
  -------------------------------------------------------
  CONTROLS
  -------------------------------------------------------
  */
  const startExperiment = () => {
    elapsedRef.current = 0;
    lastTimeRef.current = null;
    setLoopPoints([]);
    setRunning(true);
  };

  const stopExperiment = () => {
    setRunning(false);
    setCurrent(0);
    recordCurrentObservation(); // <-- Automatically saves when stopped
  };

  const resetExperiment = () => {
    setRunning(false);
    elapsedRef.current = 0;
    lastTimeRef.current = null;
    setTime(0);
    setMagneticField(0);
    setFluxDensity(0);
    setCurrent(0);
    setFlux(0);
    setLoss(0);
    setLoopPoints([]);
  };

  const changeParameter = (setter, value) => {
    setter(value);
    resetExperiment();
  };

  const runBackendSimulation = async () => {
    try {
      setBackendStatus("Connecting to hysteresis backend...");
      const response = await fetch("http://127.0.0.1:8000/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          max_H: maximumField,
          points: 1000,
          frequency: frequency,
          volume: 0.001,
          material: selectedMaterialKey
        }),
      });

      if (!response.ok) throw new Error(`Backend error: ${response.status}`);
      const data = await response.json();
      setBackendResults(data);
      setBackendStatus("Backend simulation completed successfully.");

      if (data.curve?.H && data.curve?.B) {
        const backendPoints = data.curve.H.map((h, i) => ({
          h: h,
          b: data.curve.B[i],
        }));
        setLoopPoints(backendPoints);
      }
      if (data.results?.power_loss) setLoss(data.results.power_loss);
    } catch (error) {
      setBackendStatus(`Backend simulation offline (simulating locally)`);
    }
  };

  return (
    <div style={{ width: "100%", fontFamily: "sans-serif", boxSizing: "border-box" }}>
      <h2 style={{ marginTop: 0, marginBottom: 5 }}>
        🧲 Hysteresis Loss Virtual Laboratory
      </h2>
      <p style={{ color: "#94a3b8", marginTop: 0, fontSize: "14px" }}>
        Compare <b>Soft Ferromagnetic Materials</b> (smooth sigmoid loops) vs <b>Hard Ferromagnetic Materials</b> (wide rhombus loops).
      </p>

      {/* ================= MAIN LAB GRID ================= */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(280px, 340px) 1fr",
          gap: "20px",
          marginTop: "16px",
          alignItems: "start",
        }}
      >
        {/* CONTROLS PANEL */}
        <div
          style={{
            padding: "18px",
            border: "1px solid #1e3a5f",
            borderRadius: "12px",
            background: "#08101d",
            color: "#ffffff"
          }}
        >
          {/* MATERIAL SELECTION */}
          <div style={{ marginBottom: "18px" }}>
            <label style={{ fontSize: "13px", fontWeight: "700", color: "#38bdf8", display: "block", marginBottom: "6px" }}>
              Core Material Selection:
            </label>
            <select
              value={selectedMaterialKey}
              onChange={(e) => changeParameter(setSelectedMaterialKey, e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px",
                background: "#0f1f38",
                border: `2px solid ${material.color}`,
                borderRadius: "8px",
                color: "#ffffff",
                fontWeight: "600",
                fontSize: "13px",
                outline: "none",
                cursor: "pointer"
              }}
            >
              <optgroup label="🟢 Soft Ferromagnetic (Sigmoid S-Curve)">
                <option value="iron">Soft Iron (Fe) — Low Loss</option>
                <option value="silicon_iron">Silicon Steel — Transformer Core</option>
                <option value="cobalt">Cobalt (Co) — High Saturation</option>
                <option value="nickel">Nickel (Ni) — Sensitive Permeability</option>
              </optgroup>
              <optgroup label="🔴 Hard Ferromagnetic (Rhombus Wide Loop)">
                <option value="carbon_steel">Carbon Steel — High Coercivity</option>
                <option value="alnico">Alnico Alloy — Permanent Magnet</option>
              </optgroup>
            </select>

            <div
              style={{
                marginTop: "8px",
                padding: "8px 10px",
                borderRadius: "6px",
                background: "rgba(255,255,255,0.04)",
                borderLeft: `3px solid ${material.color}`,
                fontSize: "11px",
                color: "#94a3b8"
              }}
            >
              <b>{material.category}:</b> {material.description}
            </div>
          </div>

          <h3 style={{ marginTop: 0, fontSize: "15px", borderBottom: "1px solid #1e293b", paddingBottom: "6px" }}>
            Experimental Parameters
          </h3>

          <Parameter label="Excitation Voltage" value={`${voltage} V`} />
          <input
            type="range"
            min="1"
            max="20"
            step="1"
            value={voltage}
            onChange={(e) => changeParameter(setVoltage, Number(e.target.value))}
            style={{ width: "100%", accentColor: material.color }}
          />

          <Parameter label="Frequency" value={`${frequency} Hz`} />
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={frequency}
            onChange={(e) => changeParameter(setFrequency, Number(e.target.value))}
            style={{ width: "100%", accentColor: material.color }}
          />

          <Parameter label="Coil Turns" value={`${turns}`} />
          <input
            type="range"
            min="50"
            max="500"
            step="10"
            value={turns}
            onChange={(e) => changeParameter(setTurns, Number(e.target.value))}
            style={{ width: "100%", accentColor: material.color }}
          />

          <Parameter label="Core Area" value={`${coreArea} cm²`} />
          <input
            type="range"
            min="1"
            max="10"
            step="0.5"
            value={coreArea}
            onChange={(e) => changeParameter(setCoreArea, Number(e.target.value))}
            style={{ width: "100%", accentColor: material.color }}
          />

          <Parameter label="Magnetic Path Length" value={`${magneticPath.toFixed(2)} m`} />
          <input
            type="range"
            min="0.1"
            max="0.6"
            step="0.01"
            value={magneticPath}
            onChange={(e) => changeParameter(setMagneticPath, Number(e.target.value))}
            style={{ width: "100%", accentColor: material.color }}
          />

          {/* CALCULATED VALUES */}
          <div
            style={{
              marginTop: "16px",
              padding: "10px",
              borderRadius: "8px",
              background: "#030811",
              border: "1px solid #1e293b",
              fontSize: "12px",
              lineHeight: 1.7,
            }}
          >
            <div>B<sub>max</sub>: <b style={{ color: "#38bdf8" }}>{maximumFluxDensity.toFixed(3)} T</b></div>
            <div>H<sub>max</sub>: <b style={{ color: "#38bdf8" }}>{maximumField.toFixed(1)} A/m</b></div>
            <div>Loop Shape: <b style={{ color: material.color }}>{material.type === "sigmoid" ? "Sigmoid S-Curve" : "Rhombus Wide-Loop"}</b></div>
          </div>

          {/* BUTTONS */}
          <button
            onClick={startExperiment}
            disabled={running}
            style={{
              width: "100%",
              padding: "11px",
              marginTop: "14px",
              border: "none",
              borderRadius: "8px",
              background: "#1565c0",
              color: "white",
              fontWeight: "700",
              cursor: running ? "not-allowed" : "pointer",
            }}
          >
            ▶ Start Experiment
          </button>

          <button
            onClick={stopExperiment}
            disabled={!running}
            style={{
              width: "100%",
              padding: "11px",
              marginTop: "8px",
              border: "none",
              borderRadius: "8px",
              background: "#475569",
              color: "white",
              fontWeight: "700",
              cursor: !running ? "not-allowed" : "pointer",
            }}
          >
            ⏹ Stop & Record
          </button>

          <button
            onClick={resetExperiment}
            style={{
              width: "100%",
              padding: "11px",
              marginTop: "8px",
              border: "1px solid #475569",
              borderRadius: "8px",
              background: "#0f172a",
              color: "#cbd5e1",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            🔄 Reset
          </button>

          <button
            onClick={runBackendSimulation}
            style={{
              width: "100%",
              padding: "11px",
              marginTop: "8px",
              border: "none",
              borderRadius: "8px",
              background: "#7c3aed",
              color: "white",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            🧲 Run Backend B–H Simulation
          </button>

          {backendStatus && (
            <div
              style={{
                marginTop: "10px",
                padding: "8px",
                borderRadius: "6px",
                background: "#0f1f38",
                color: "#60a5fa",
                fontSize: "11px",
              }}
            >
              {backendStatus}
            </div>
          )}
        </div>

        {/* 3D LABORATORY VIEW */}
        <div
          style={{
            height: "460px",
            border: "1px solid #1e3a5f",
            borderRadius: "12px",
            overflow: "hidden",
            background: "#071321",
          }}
        >
          <Hysteresis3D
            powerOn={running}
            field={magneticField}
            magnetization={fluxDensity}
            frequency={frequency}
            loss={loss}
            temperature={25}
            mode="normal"
            loopPoints={loopPoints}
          />
        </div>
      </div>

      {/* ================= LIVE METRICS ================= */}
      <div
        style={{
          marginTop: "18px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "12px",
        }}
      >
        <ResultCard title="Magnetic Field H" value={`${magneticField.toFixed(1)} A/m`} />
        <ResultCard title="Flux Density B" value={`${fluxDensity.toFixed(3)} T`} />
        <ResultCard title="Magnetizing Current" value={`${(current * 1000).toFixed(2)} mA`} />
        <ResultCard title="Magnetic Flux" value={`${flux.toExponential(3)} Wb`} />
        <ResultCard title="Hysteresis Loss" value={`${loss.toFixed(3)} W`} />
      </div>

      {/* ================= B-H GRAPH ================= */}
      <div
        style={{
          marginTop: "20px",
          padding: "18px",
          border: "1px solid #1e3a5f",
          borderRadius: "12px",
          background: "#ffffff",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div>
            <h3 style={{ margin: 0, color: "#0f172a" }}>
              B–H Hysteresis Loop ({material.name})
            </h3>
            <div style={{ color: material.color, fontSize: "13px", marginTop: "4px", fontWeight: "600" }}>
              {material.category} — {material.type === "sigmoid" ? "Sigmoid Curve" : "Rhombus Wide Loop"}
            </div>
          </div>

          <div
            style={{
              padding: "6px 12px",
              borderRadius: "20px",
              background: running ? "rgba(34, 197, 94, 0.15)" : "rgba(100, 116, 139, 0.15)",
              color: running ? "#16a34a" : "#475569",
              fontSize: "12px",
              fontWeight: "700",
            }}
          >
            {running ? "● Active Recording" : "● Waiting"}
          </div>
        </div>

        <HysteresisGraph points={loopPoints} material={material} />
      </div>
    </div>
  );
}

function Parameter({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", fontSize: "12px", color: "#cbd5e1" }}>
      <span>{label}</span>
      <strong style={{ color: "#ffffff" }}>{value}</strong>
    </div>
  );
}

function ResultCard({ title, value }) {
  return (
    <div style={{ padding: "14px", border: "1px solid #1e3a5f", borderRadius: "10px", background: "#08101d" }}>
      <div style={{ color: "#38bdf8", fontSize: "12px", marginBottom: "6px" }}>{title}</div>
      <strong style={{ fontSize: "18px", color: "#ffffff" }}>{value}</strong>
    </div>
  );
}

/*
=========================================================
HYSTERESIS GRAPH COMPONENT
=========================================================
*/
function HysteresisGraph({ points, material }) {
  const width = 900;
  const height = 430;
  const paddingLeft = 75;
  const paddingRight = 30;
  const paddingTop = 30;
  const paddingBottom = 55;

  let maxH = 100;
  let maxB = 1;

  if (points.length > 0) {
    maxH = Math.max(...points.map((p) => Math.abs(p.h))) || 100;
    maxB = Math.max(...points.map((p) => Math.abs(p.b))) || 1;
  }

  maxH *= 1.15;
  maxB *= 1.15;

  const graphWidth = width - paddingLeft - paddingRight;
  const graphHeight = height - paddingTop - paddingBottom;

  const xToPixel = (h) => paddingLeft + ((h + maxH) / (2 * maxH)) * graphWidth;
  const yToPixel = (b) => paddingTop + ((maxB - b) / (2 * maxB)) * graphHeight;

  // Build SVG Path
  let path = "";
  points.forEach((point, index) => {
    const x = xToPixel(point.h);
    const y = yToPixel(point.b);
    path += index === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  });

  const gridElements = [];
  const coordinateLabels = [];
  const divisions = 4;

  for (let i = -divisions; i <= divisions; i++) {
    const h = (maxH * i) / divisions;
    const b = (maxB * i) / divisions;
    const xPos = xToPixel(h);
    const yPos = yToPixel(b);

    // Grid Lines
    gridElements.push(
      <line
        key={`vg-${i}`}
        x1={xPos}
        y1={paddingTop}
        x2={xPos}
        y2={height - paddingBottom}
        stroke="#e2e8f0"
        strokeWidth="1"
        strokeDasharray="4 4"
      />
    );
    gridElements.push(
      <line
        key={`hg-${i}`}
        x1={paddingLeft}
        y1={yPos}
        x2={width - paddingRight}
        y2={yPos}
        stroke="#e2e8f0"
        strokeWidth="1"
        strokeDasharray="4 4"
      />
    );

    // Coordinate Numbers
    if (i !== 0) {
      coordinateLabels.push(
        <text key={`lx-${i}`} x={xPos} y={yToPixel(0) + 16} textAnchor="middle" fontSize="11" fill="#475569" fontWeight="500">
          {h.toFixed(1)}
        </text>
      );
      coordinateLabels.push(
        <text key={`ly-${i}`} x={xToPixel(0) - 8} y={yPos + 4} textAnchor="end" fontSize="11" fill="#475569" fontWeight="500">
          {b.toFixed(2)}
        </text>
      );
    }
  }

  // Origin 0
  coordinateLabels.push(
    <text key="l-origin" x={xToPixel(0) - 8} y={yToPixel(0) + 15} textAnchor="end" fontSize="11" fill="#475569" fontWeight="600">
      0
    </text>
  );

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", minWidth: "650px", display: "block" }}>
        <rect x="0" y="0" width={width} height={height} fill="#f8fafc" rx="10" />

        {/* Grid Layer */}
        {gridElements}

        {/* Axes */}
        <line x1={paddingLeft} y1={yToPixel(0)} x2={width - paddingRight} y2={yToPixel(0)} stroke="#1e293b" strokeWidth="2" />
        <line x1={xToPixel(0)} y1={paddingTop} x2={xToPixel(0)} y2={height - paddingBottom} stroke="#1e293b" strokeWidth="2" />

        {/* Numbers Layer */}
        {coordinateLabels}

        {/* Hysteresis Trace with Material Accent Color */}
        {points.length > 1 && (
          <path
            d={path}
            fill={material.type === "rhombus" ? "rgba(220, 38, 38, 0.08)" : "rgba(37, 99, 235, 0.08)"}
            stroke={material.color}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Active Point */}
        {points.length > 0 && (
          <circle
            cx={xToPixel(points[points.length - 1].h)}
            cy={yToPixel(points[points.length - 1].b)}
            r="6"
            fill="#ef4444"
          />
        )}

        {/* Axis Titles */}
        <text x={width / 2} y={height - 14} textAnchor="middle" fontSize="13" fill="#334155" fontWeight="600">
          X-axis — Magnetic Field Strength H (A/m)
        </text>
        <text
          x="20"
          y={height / 2}
          textAnchor="middle"
          fontSize="13"
          fill="#334155"
          fontWeight="600"
          transform={`rotate(-90 20 ${height / 2})`}
        >
          Y-axis — Flux Density B (T)
        </text>
      </svg>
    </div>
  );
}