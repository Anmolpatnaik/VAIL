import { useEffect, useRef, useState } from "react";
import Hysteresis3D from "./Hysteresis3D";
import ValidatedParameterControl from "./ValidatedParameterControl";
import { ENDPOINTS } from "./apiConfig";

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

export default function HysteresisSimulation({ onSaveData, onSimulationUpdate }) {
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
  const [invalidInputs, setInvalidInputs] = useState({});
  const hasInvalid = Object.values(invalidInputs).some(Boolean);
  const setFieldInvalid = (field, isVal) => setInvalidInputs(p => ({ ...p, [field]: !isVal }));

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
  const lastStateUpdateRef = useRef(0);

  // Maximum field calculations with safety guards for zero values
  const maximumCurrent = voltage / 100;
  const maximumField = magneticPath > 0 ? (turns * maximumCurrent) / magneticPath : 0;

  const safeDivisor = 2 * Math.PI * Math.max(frequency, 0.1) * Math.max(turns, 1) * Math.max(coreAreaM2, 1e-7);
  let maximumFluxDensity = voltage > 0 ? (voltage / safeDivisor) * material.saturationFactor : 0;
  maximumFluxDensity = Math.min(maximumFluxDensity || 0, 2.2);

  useEffect(() => {
    if (onSimulationUpdate) {
      onSimulationUpdate({
        maxH: Number(maximumField.toFixed(1)),
        maxB: Number(maximumFluxDensity.toFixed(2)),
        loopArea: Number((maximumField * maximumFluxDensity * 4 * material.coercivityRatio).toFixed(1)),
        loss: Number(loss.toFixed(1)),
        dcv: Number(voltage.toFixed(2)),
        acv: Number(voltage.toFixed(2)),
        field: Number(magneticField.toFixed(1)),
        fluxDensity: Number(fluxDensity.toFixed(2)),
      });
    }
  }, [maximumField, maximumFluxDensity, loss, voltage, magneticField, fluxDensity, material.coercivityRatio, onSimulationUpdate]);

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
      const H = magneticPath > 0 ? (turns * baseCurrent) / magneticPath : 0;
      const dH_dt = magneticPath > 0 ? (turns * maximumCurrent * omega * Math.cos(phase)) / magneticPath : 0;

      const B = maximumField > 0 ? computeFluxDensity(H, dH_dt) : 0;
      const phi = B * coreAreaM2;

      // Steinmetz loss calculation
      const hysteresisLoss =
        material.kh *
        frequency *
        Math.pow(Math.abs(maximumFluxDensity), 1.6) *
        (material.type === "rhombus" ? 2.4 : 1.0);

      // Throttle React state updates to ~30 FPS (every 33ms) to eliminate main-thread stutter
      if (!lastStateUpdateRef.current || timestamp - lastStateUpdateRef.current >= 33) {
        lastStateUpdateRef.current = timestamp;
        setMagneticField(H);
        setFluxDensity(B);
        setCurrent(baseCurrent);
        setFlux(phi);
        setLoss(hysteresisLoss);

        setLoopPoints((prev) => {
          const next = [...prev, { h: H, b: B }];
          return next.length > 200 ? next.slice(next.length - 200) : next;
        });
      }

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

  const handleFullReset = () => {
    resetExperiment();
    setVoltage(0);
    setFrequency(50);
    setTurns(200);
    setCoreArea(4);
    setMagneticPath(0.25);
    setBackendResults(null);
    setBackendStatus("");
  };

  const changeParameter = (setter, value) => {
    setter(value);
    resetExperiment();
  };

  const runBackendSimulation = async () => {
    try {
      setBackendStatus("Connecting to hysteresis backend...");
      const response = await fetch(ENDPOINTS.hysteresisSimulate, {
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
          alignItems: "stretch",
        }}
      >
        {/* CONTROLS PANEL */}
        <div className="sim-control-panel">
          {/* LABORATORY REAL-TIME CALIBRATION CAUTION */}
          <div className="lab-caution-banner">
            <span className="lab-caution-icon">⚠️</span>
            <div className="lab-caution-content">
              <div className="lab-caution-title">Real-Time Lab Calibration</div>
              <div className="lab-caution-text">
                Input ranges (0–30V AC, 10–200Hz, 20–1000 turns, 0.5–15.0 cm², 0.05–0.60 m) are strictly calibrated to physical transformer testing benches and standard magnetic specimen rings. Out-of-range inputs will be rejected.
              </div>
            </div>
          </div>

          {/* MATERIAL SELECTION */}
          <div style={{ marginBottom: "18px" }}>
            <label style={{ fontSize: "13px", fontWeight: "700", color: "#38bdf8", display: "block", marginBottom: "6px" }}>
              Core Material Selection:
            </label>
            <select
              value={selectedMaterialKey}
              onChange={(e) => changeParameter(setSelectedMaterialKey, e.target.value)}
              className="sim-select"
              style={{ border: `2px solid ${material.color}` }}
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

          <h3 className="sim-panel-title" style={{ marginTop: "16px", borderBottom: "1px solid rgba(148, 163, 184, 0.2)", paddingBottom: "6px" }}>
            Experimental Parameters
          </h3>

          <ValidatedParameterControl
            label="Excitation Voltage"
            limitHint="0 – 30 V (AC Source)"
            value={voltage}
            min={0}
            max={30}
            step={0.1}
            unit="V"
            onChange={(val) => changeParameter(setVoltage, val)}
            onValidityChange={(isVal) => setFieldInvalid("voltage", isVal)}
            accentColor={material.color}
          />

          <ValidatedParameterControl
            label="Frequency"
            limitHint="10 – 200 Hz"
            value={frequency}
            min={10}
            max={200}
            step={1}
            unit="Hz"
            onChange={(val) => changeParameter(setFrequency, val)}
            onValidityChange={(isVal) => setFieldInvalid("frequency", isVal)}
            accentColor={material.color}
          />

          <ValidatedParameterControl
            label="Coil Turns"
            limitHint="20 – 1000 turns"
            value={turns}
            min={20}
            max={1000}
            step={10}
            unit="turns"
            onChange={(val) => changeParameter(setTurns, val)}
            onValidityChange={(isVal) => setFieldInvalid("turns", isVal)}
            accentColor={material.color}
          />

          <ValidatedParameterControl
            label="Core Area"
            limitHint="0.5 – 15.0 cm²"
            value={coreArea}
            min={0.5}
            max={15}
            step={0.1}
            unit="cm²"
            onChange={(val) => changeParameter(setCoreArea, val)}
            onValidityChange={(isVal) => setFieldInvalid("coreArea", isVal)}
            accentColor={material.color}
          />

          <ValidatedParameterControl
            label="Magnetic Path Length"
            limitHint="0.05 – 0.60 m"
            value={magneticPath}
            min={0.05}
            max={0.6}
            step={0.01}
            unit="m"
            onChange={(val) => changeParameter(setMagneticPath, val)}
            onValidityChange={(isVal) => setFieldInvalid("magneticPath", isVal)}
            accentColor={material.color}
          />

          {/* CALCULATED VALUES */}
          <div className="sim-highlight-card" style={{ marginTop: "16px" }}>
            <div className="sim-highlight-card-title" style={{ marginBottom: "8px" }}>Calculated Magnetic Metrics</div>
            <div className="sim-calc-row">
              <span className="sim-calc-label">B<sub>max</sub>:</span>
              <b className="sim-calc-val-accent">{maximumFluxDensity.toFixed(3)} T</b>
            </div>
            <div className="sim-calc-row">
              <span className="sim-calc-label">H<sub>max</sub>:</span>
              <b className="sim-calc-val-accent">{maximumField.toFixed(1)} A/m</b>
            </div>
            <div className="sim-calc-row">
              <span className="sim-calc-label">Loop Shape:</span>
              <b className="sim-calc-val-tag" style={{ color: material.color }}>
                {material.type === "sigmoid" ? "Sigmoid S-Curve" : "Rhombus Wide-Loop"}
              </b>
            </div>
          </div>

          {hasInvalid && (
            <div className="sim-input-error-msg" style={{ marginTop: "12px", padding: "6px 10px" }}>
              ⚠️ Cannot start experiment: One or more parameters exceed permissible lab range. Please correct invalid inputs.
            </div>
          )}

          {/* BUTTONS */}
          <button
            onClick={startExperiment}
            disabled={running || hasInvalid}
            className="sim-btn-primary"
            style={{ marginTop: "14px" }}
          >
            ▶ Start Experiment
          </button>

          <button
            onClick={stopExperiment}
            disabled={!running}
            className="sim-btn-slate"
            style={{ marginTop: "10px" }}
          >
            ⏹ Stop & Record
          </button>

          <button
            onClick={handleFullReset}
            className="sim-btn-reset"
            title="Reset parameters to 0 V defaults and clear graphs"
            style={{ marginTop: "10px" }}
          >
            <span>🔄</span> Reset to Baseline (0 V)
          </button>
        </div>

        {/* 3D LABORATORY VIEW */}
        <div
          style={{
            height: "100%",
            minHeight: "560px",
            border: "1px solid #1e3a5f",
            borderRadius: "12px",
            overflow: "hidden",
            background: "#071321",
            display: "flex",
            flexDirection: "column",
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

        <HysteresisGraph 
          points={loopPoints} 
          material={material} 
          expectedMaxH={maximumField} 
          expectedMaxB={maximumFluxDensity}
          isLive={running}
        />
      </div>
    </div>
  );
}

function ParameterInput({ label, limitHint, value, min, max, step, unit, onChange, accentColor }) {
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
        style={accentColor ? { accentColor } : {}}
      />
    </div>
  );
}

function ResultCard({ title, value }) {
  return (
    <div className="sim-metric-card">
      <div className="sim-metric-title">{title}</div>
      <strong className="sim-metric-val">{value}</strong>
    </div>
  );
}

/*
=========================================================
HYSTERESIS GRAPH COMPONENT - Stable Physical Laboratory Grid
=========================================================
*/
function HysteresisGraph({ points, material, expectedMaxH, expectedMaxB, isLive }) {
  const width = 900;
  const height = 430;
  const paddingLeft = 75;
  const paddingRight = 30;
  const paddingTop = 30;
  const paddingBottom = 55;

  const cleanPoints = (points || []).filter(
    (p) => p && typeof p.h === "number" && !isNaN(p.h) && typeof p.b === "number" && !isNaN(p.b)
  );

  // Compute stable axis limits based on expected maximums to eliminate axis jumping
  let computedMaxH = expectedMaxH && expectedMaxH > 0 ? expectedMaxH : 100;
  let computedMaxB = expectedMaxB && expectedMaxB > 0 ? expectedMaxB : 1.0;

  if (cleanPoints.length > 0) {
    const pointMaxH = Math.max(...cleanPoints.map((p) => Math.abs(p.h)));
    const pointMaxB = Math.max(...cleanPoints.map((p) => Math.abs(p.b)));
    if (pointMaxH > computedMaxH) computedMaxH = pointMaxH;
    if (pointMaxB > computedMaxB) computedMaxB = pointMaxB;
  }

  const maxH = Math.max(computedMaxH * 1.15, 10);
  const maxB = Math.max(computedMaxB * 1.15, 0.2);

  const graphWidth = width - paddingLeft - paddingRight;
  const graphHeight = height - paddingTop - paddingBottom;

  const xToPixel = (h) => paddingLeft + ((h + maxH) / (2 * maxH)) * graphWidth;
  const yToPixel = (b) => paddingTop + ((maxB - b) / (2 * maxB)) * graphHeight;

  // Build SVG Path
  let path = "";
  cleanPoints.forEach((point, index) => {
    const x = xToPixel(point.h);
    const y = yToPixel(point.b);
    path += index === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  });

  const lastPoint = cleanPoints.length > 0 ? cleanPoints[cleanPoints.length - 1] : null;

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
        <div style={{ fontSize: "12px", color: "#64748b" }}>
          <span>Domain: [−{maxH.toFixed(1)}, +{maxH.toFixed(1)}] A/m</span>
          <span style={{ marginLeft: "14px" }}>Range: [−{maxB.toFixed(2)}, +{maxB.toFixed(2)}] T</span>
        </div>
        {lastPoint && (
          <div style={{ fontSize: "12px", fontFamily: "monospace", color: "#0f172a", background: "#f1f5f9", padding: "2px 8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}>
            Current: H = {lastPoint.h.toFixed(1)} A/m | B = {lastPoint.b.toFixed(3)} T
          </div>
        )}
      </div>

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
        {cleanPoints.length > 1 && (
          <path
            d={path}
            fill={material.type === "rhombus" ? "rgba(220, 38, 38, 0.08)" : "rgba(37, 99, 235, 0.08)"}
            stroke={material.color}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Active Point with Pulsing Ring when Live */}
        {lastPoint && (
          <g>
            <circle
              cx={xToPixel(lastPoint.h)}
              cy={yToPixel(lastPoint.b)}
              r="6"
              fill="#ef4444"
              stroke="#ffffff"
              strokeWidth="2"
            />
            {isLive && (
              <circle
                cx={xToPixel(lastPoint.h)}
                cy={yToPixel(lastPoint.b)}
                r="11"
                fill="none"
                stroke="#ef4444"
                strokeWidth="1.5"
                opacity="0.6"
              />
            )}
          </g>
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