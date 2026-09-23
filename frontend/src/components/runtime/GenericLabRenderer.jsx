import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  evaluateEquationSet,
  generateCurveData
} from "../../engine/ScientificMathEngine";

/**
 * GenericLabRenderer — VAIL 2.0 Universal Declarative Laboratory Runtime
 * 
 * Takes ANY scientific experiment definition model and turns it into a complete,
 * interactive virtual laboratory bench:
 *   - Live numerical physics solver
 *   - Real-time animated 2D physics visualizer (Phototube, Spring, Pendulum, Generic)
 *   - Dynamic interactive scientific chart with moving operating point
 *   - Parameter slider controls with range bounds and units
 *   - Real-time instrument integration & observation logging
 */
export default function GenericLabRenderer({
  config,
  onLiveValuesChange,
  onLogMeasurement
}) {
  const simulation = config?.simulation || {};
  const paramsConfig = simulation?.parameters || [];
  const physicsModel = simulation?.physicsModel || {};
  const equations = physicsModel?.equations || [];

  // Initialize parameters state
  const initialParams = useMemo(() => {
    const p = {};
    paramsConfig.forEach((item) => {
      p[item.id] = item.default ?? item.min ?? 0;
    });
    return p;
  }, [paramsConfig]);

  const [params, setParams] = useState(initialParams);
  const [isRunning, setIsRunning] = useState(true);
  const [time, setTime] = useState(0);

  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  // Update params if config changes
  useEffect(() => {
    setParams(initialParams);
    setTime(0);
  }, [config?.id]);

  // Handle individual parameter slider change
  const handleParamChange = (id, val) => {
    setParams((prev) => ({
      ...prev,
      [id]: parseFloat(val)
    }));
  };

  // Evaluate live physics outputs based on current parameters
  const liveResults = useMemo(() => {
    const scope = {
      ...params,
      t: 0,
      time: 0
    };
    return evaluateEquationSet(equations, scope);
  }, [params, equations]);

  // Broadcast live values to parent (for multimeter, viva engine, calculations tab)
  useEffect(() => {
    if (onLiveValuesChange) {
      onLiveValuesChange({
        ...params,
        ...liveResults
      });
    }
  }, [params, liveResults, onLiveValuesChange]);

  const isRunningRef = useRef(isRunning);
  isRunningRef.current = isRunning;
  const paramsRef = useRef(params);
  paramsRef.current = params;
  const equationsRef = useRef(equations);
  equationsRef.current = equations;
  const timeRef = useRef(0);

  // Animation Loop (60 FPS on 2D physics rig canvas)
  useEffect(() => {
    let lastTime = performance.now();

    const animate = (now) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      if (isRunningRef.current) {
        timeRef.current += Math.min(dt, 0.1);
      }

      const scope = {
        ...paramsRef.current,
        t: timeRef.current,
        time: timeRef.current
      };
      const currentLive = evaluateEquationSet(equationsRef.current, scope);

      // Draw 2D Physics Rig
      drawPhysicsRig(canvasRef.current, simulation?.scene, paramsRef.current, currentLive, timeRef.current);

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [simulation?.scene]);

  // Generate theoretical curve points for graph
  const curvePoints = useMemo(() => {
    const sweepVar = physicsModel?.sweepVariable || paramsConfig[0]?.id || "x";
    const xMin = physicsModel?.sweepMin ?? 0;
    const xMax = physicsModel?.sweepMax ?? 100;
    const plotY = physicsModel?.plotY || Object.keys(liveResults)[0] || "output";

    return generateCurveData(equations, params, sweepVar, plotY, xMin, xMax, 50);
  }, [equations, params, physicsModel, paramsConfig, liveResults]);

  // Handle Log to Observation Table
  const handleLogClick = () => {
    if (onLogMeasurement) {
      onLogMeasurement({
        ...params,
        ...liveResults,
        timestamp: new Date().toLocaleTimeString()
      });
    }
  };

  // Convert wavelength nm to RGB approximation for phototube visualizer
  const nmToColor = (nm) => {
    if (nm < 400) return "#8b5cf6"; // Ultraviolet / Violet
    if (nm < 450) return "#3b82f6"; // Blue
    if (nm < 500) return "#06b6d4"; // Cyan
    if (nm < 570) return "#22c55e"; // Green
    if (nm < 590) return "#eab308"; // Yellow
    if (nm < 620) return "#f97316"; // Orange
    return "#ef4444"; // Red
  };

  return (
    <div className="generic-lab-workbench" style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "20px", width: "100%", margin: "0 auto" }}>
      {/* ─── LEFT: INTERACTIVE BENCH & CANVAS ─── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Visualizer Canvas Container */}
        <div
          style={{
            position: "relative",
            background: "linear-gradient(180deg, #0b132b 0%, #1c2541 100%)",
            border: "1px solid rgba(56, 189, 248, 0.3)",
            borderRadius: "16px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
            overflow: "hidden",
            height: "360px",
            display: "flex",
            flexDirection: "column"
          }}
        >
          {/* Canvas Header Pill */}
          <div
            style={{
              padding: "10px 16px",
              background: "rgba(15, 23, 42, 0.75)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "16px" }}>{config?.icon || "🔬"}</span>
              <span style={{ fontWeight: "700", fontSize: "13px", color: "#f8fafc" }}>
                Interactive Physics Bench: {config?.title}
              </span>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setIsRunning(!isRunning)}
                style={{
                  padding: "4px 10px",
                  fontSize: "11px",
                  borderRadius: "6px",
                  background: isRunning ? "rgba(239, 68, 68, 0.2)" : "rgba(34, 197, 94, 0.2)",
                  color: isRunning ? "#f87171" : "#4ade80",
                  border: isRunning ? "1px solid rgba(239, 68, 68, 0.4)" : "1px solid rgba(34, 197, 94, 0.4)",
                  cursor: "pointer"
                }}
              >
                {isRunning ? "⏸ Pause" : "▶ Resume"}
              </button>
              <button
                onClick={() => setTime(0)}
                style={{
                  padding: "4px 10px",
                  fontSize: "11px",
                  borderRadius: "6px",
                  background: "rgba(255, 255, 255, 0.08)",
                  color: "#cbd5e1",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  cursor: "pointer"
                }}
              >
                🔄 Reset
              </button>
            </div>
          </div>

          {/* HTML5 Canvas */}
          <canvas
            ref={canvasRef}
            width={600}
            height={300}
            style={{ width: "100%", height: "100%", display: "block" }}
          />
        </div>

        {/* Dynamic Physics Chart */}
        <div
          style={{
            background: "rgba(15, 23, 42, 0.8)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "16px",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "10px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: "700", fontSize: "13px", color: "#38bdf8" }}>
              📊 Characteristic Response Curve
            </span>
            <span style={{ fontSize: "11px", color: "#94a3b8" }}>
              {physicsModel?.xLabel || "X"} vs {physicsModel?.yLabel || "Y"}
            </span>
          </div>

          <svg width="100%" height="160" viewBox="0 0 500 160" style={{ overflow: "visible" }}>
            {/* Grid Lines */}
            <line x1="40" y1="20" x2="480" y2="20" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
            <line x1="40" y1="80" x2="480" y2="80" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
            <line x1="40" y1="140" x2="480" y2="140" stroke="rgba(255,255,255,0.2)" />
            <line x1="40" y1="10" x2="40" y2="140" stroke="rgba(255,255,255,0.2)" />

            {/* Theoretical Curve Path */}
            {curvePoints.length > 1 && (() => {
              const xVals = curvePoints.map((p) => p.x);
              const yVals = curvePoints.map((p) => p.y);
              const minX = Math.min(...xVals);
              const maxX = Math.max(...xVals) || 1;
              const minY = Math.min(0, ...yVals);
              const maxY = Math.max(...yVals) || 1;

              const scaleX = (x) => 40 + ((x - minX) / (maxX - minX || 1)) * 440;
              const scaleY = (y) => 140 - ((y - minY) / (maxY - minY || 1)) * 120;

              const pathData = curvePoints.reduce((acc, p, idx) => {
                const sx = scaleX(p.x);
                const sy = scaleY(p.y);
                return idx === 0 ? `M ${sx} ${sy}` : `${acc} L ${sx} ${sy}`;
              }, "");

              // Current operating point
              const currentSweepVal = params[physicsModel?.sweepVariable || paramsConfig[0]?.id] || minX;
              const currentOutputVal = liveResults[physicsModel?.plotY] || 0;
              const cx = scaleX(currentSweepVal);
              const cy = scaleY(currentOutputVal);

              return (
                <>
                  <path d={pathData} fill="none" stroke="#38bdf8" strokeWidth="2.5" />
                  {/* Current Operating Point Marker */}
                  <circle cx={cx} cy={cy} r="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="2">
                    <animate attributeName="r" values="5;7;5" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                  <text x={cx + 10} y={cy - 8} fill="#f59e0b" fontSize="10" fontWeight="700">
                    Operating Point ({currentSweepVal.toFixed(1)}, {currentOutputVal.toFixed(2)})
                  </text>
                </>
              );
            })()}
          </svg>
        </div>
      </div>

      {/* ─── RIGHT: CONTROL PANEL & LIVE INSTRUMENT READOUTS ─── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Sliders Panel */}
        <div
          style={{
            background: "rgba(15, 23, 42, 0.8)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "16px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "16px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "10px" }}>
            <span style={{ fontWeight: "700", fontSize: "14px", color: "#f8fafc" }}>
              🎛️ Simulation Parameters
            </span>
            <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "10px", background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8" }}>
              Dynamic Model
            </span>
          </div>

          {paramsConfig.map((p) => (
            <div key={p.id} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                <span style={{ color: "#cbd5e1", fontWeight: "600" }}>{p.label}</span>
                <span style={{ color: "#38bdf8", fontFamily: "monospace", fontWeight: "700" }}>
                  {params[p.id]} {p.unit}
                </span>
              </div>
              <input
                type="range"
                min={p.min}
                max={p.max}
                step={p.step || 1}
                value={params[p.id]}
                onChange={(e) => handleParamChange(p.id, e.target.value)}
                style={{
                  width: "100%",
                  cursor: "pointer",
                  accentColor: "#0284c7"
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#64748b" }}>
                <span>{p.min} {p.unit}</span>
                <span>{p.max} {p.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Live Physics Readouts */}
        <div
          style={{
            background: "rgba(15, 23, 42, 0.8)",
            border: "1px solid rgba(56, 189, 248, 0.25)",
            borderRadius: "16px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "14px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: "700", fontSize: "14px", color: "#38bdf8" }}>
              📟 Live Laboratory Readouts
            </span>
            <span style={{ fontSize: "11px", color: "#4ade80" }}>● Active Solver</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {Object.entries(liveResults).slice(0, 6).map(([key, val]) => (
              <div
                key={key}
                style={{
                  background: "rgba(30, 41, 59, 0.6)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  borderRadius: "10px",
                  padding: "10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px"
                }}
              >
                <span style={{ fontSize: "10px", color: "#94a3b8", textTransform: "capitalize" }}>
                  {key.replace(/([A-Z])/g, " $1")}
                </span>
                <span style={{ fontSize: "16px", fontWeight: "700", color: "#f8fafc", fontFamily: "monospace" }}>
                  {typeof val === "number" ? val.toFixed(3) : val}
                </span>
              </div>
            ))}
          </div>

          {/* Log Measurement Button */}
          <button
            onClick={handleLogClick}
            style={{
              marginTop: "8px",
              padding: "12px",
              background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              fontWeight: "700",
              fontSize: "13px",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(2, 132, 199, 0.35)",
              transition: "transform 0.15s ease"
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            📋 Log Reading to Observation Table
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── 2D PHYSICS VISUALIZATION PROCEDURAL RENDERER ─────────────────────────

function drawPhysicsRig(canvas, scene, params, live, time) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  // Background subtle grid
  ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 30) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += 30) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // 1. PHOTOTUBE SCENE (Photoelectric Effect)
  if (scene === "phototube") {
    const wavelength = params.wavelength || 400;
    const intensity = params.intensity || 50;
    const current = live.current_uA || 0;

    // Bench Surface
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(40, 240, w - 80, 10);

    // Light Source Housing
    ctx.fillStyle = "#334155";
    ctx.fillRect(60, 80, 50, 60);
    ctx.fillStyle = "#64748b";
    ctx.fillRect(110, 95, 20, 30);

    // Monochromatic Light Beam
    const beamColor = getWavelengthColor(wavelength);
    const grad = ctx.createLinearGradient(130, 110, 260, 150);
    grad.addColorStop(0, beamColor);
    grad.addColorStop(1, "rgba(255, 255, 255, 0.1)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(130, 95);
    ctx.lineTo(260, 130);
    ctx.lineTo(260, 170);
    ctx.lineTo(130, 125);
    ctx.closePath();
    ctx.fill();

    // Phototube Glass Envelope
    ctx.strokeStyle = "rgba(56, 189, 248, 0.6)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(320, 150, 70, 70, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Cathode (curved emitter plate)
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(320, 150, 50, Math.PI * 0.6, Math.PI * 1.4);
    ctx.stroke();

    // Anode (collector pin)
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(340, 110);
    ctx.lineTo(340, 190);
    ctx.stroke();

    // Ejected Photoelectrons Stream (if current > 0)
    if (current > 0) {
      const numElectrons = Math.min(18, Math.floor(intensity / 4));
      ctx.fillStyle = "#38bdf8";
      for (let i = 0; i < numElectrons; i++) {
        const progress = ((time * 2 + i * 0.25) % 1);
        const ex = 280 + progress * 60;
        const ey = 130 + Math.sin(time * 6 + i) * 18;
        ctx.beginPath();
        ctx.arc(ex, ey, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Circuit wires & Microammeter display
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(270, 180);
    ctx.lineTo(270, 220);
    ctx.lineTo(440, 220);
    ctx.lineTo(440, 150);
    ctx.lineTo(340, 150);
    ctx.stroke();

    // Meter Badge
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(410, 130, 60, 40);
    ctx.strokeStyle = "#38bdf8";
    ctx.strokeRect(410, 130, 60, 40);
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 11px monospace";
    ctx.fillText(`${current.toFixed(1)} μA`, 418, 154);
  }

  // 2. OSCILLATING SPRING SCENE (Hooke's Law)
  else if (scene === "oscillating_spring") {
    const k = params.k_spring || 25;
    const m = (params.mass || 200) / 1000;
    const staticExt = Math.min(100, (live.staticExtension_cm || 5) * 3);
    const omega = Math.sqrt(k / m);
    const dynOffset = Math.sin(time * omega) * 15;
    const totalY = 60 + staticExt + dynOffset;

    // Top Clamp Stand
    ctx.fillStyle = "#475569";
    ctx.fillRect(150, 20, 200, 12);
    ctx.fillRect(240, 20, 16, 40);

    // Spring Coils
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(248, 60);
    const coils = 14;
    const coilStep = totalY / coils;
    for (let i = 0; i < coils; i++) {
      const cx = i % 2 === 0 ? 230 : 266;
      ctx.lineTo(cx, 60 + i * coilStep);
    }
    ctx.lineTo(248, 60 + totalY);
    ctx.stroke();

    // Suspended Mass Bob
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.arc(248, 70 + totalY, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Millimeter Scale on side
    ctx.fillStyle = "#334155";
    ctx.fillRect(320, 40, 24, 220);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    for (let sy = 50; sy < 250; sy += 10) {
      ctx.beginPath();
      ctx.moveTo(320, sy);
      ctx.lineTo(sy % 20 === 0 ? 336 : 328, sy);
      ctx.stroke();
    }
  }

  // 3. PENDULUM SWING SCENE (Simple Pendulum)
  else if (scene === "pendulum_swing") {
    const L = params.length || 1.0;
    const angle0 = ((params.angle || 5) * Math.PI) / 180;
    const omega = Math.sqrt(9.8 / L);
    const currentAngle = angle0 * Math.cos(time * omega);

    const pivotX = w / 2;
    const pivotY = 40;
    const pixelL = 80 + L * 80;
    const bobX = pivotX + Math.sin(currentAngle) * pixelL;
    const bobY = pivotY + Math.cos(currentAngle) * pixelL;

    // Pivot Stand
    ctx.fillStyle = "#475569";
    ctx.fillRect(pivotX - 60, 20, 120, 10);
    ctx.beginPath();
    ctx.arc(pivotX, pivotY, 6, 0, Math.PI * 2);
    ctx.fill();

    // String
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(bobX, bobY);
    ctx.stroke();

    // Bob
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.arc(bobX, bobY, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();
  }

  // 4. METER BRIDGE SCENE (Wheatstone Null-Balance)
  else if (scene === "meter_bridge") {
    const l = params.jockeyPos || 40;
    const R = params.knownResistance || 5;
    const X = params.unknownResistance || 7.5;
    const defl = live.galvanoDeflection || 0;
    const isBalanced = Math.abs(defl) < 1.0;

    // Wooden Meter Bridge Board Base
    ctx.fillStyle = "#593122";
    ctx.strokeStyle = "#854d0e";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(30, 45, w - 60, 220, 12);
    ctx.fill();
    ctx.stroke();

    // Wood Grain Subtle Highlights
    ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
    ctx.fillRect(35, 65, w - 70, 3);
    ctx.fillRect(35, 140, w - 70, 2);
    ctx.fillRect(35, 210, w - 70, 3);

    // Thick Copper / Brass Connecting Strips (L-shaped and Central)
    ctx.fillStyle = "#eab308"; // Brass/Copper gold
    ctx.strokeStyle = "#ca8a04";
    ctx.lineWidth = 1.5;

    // Left L-strip
    ctx.fillRect(50, 65, 80, 16);
    ctx.fillRect(50, 65, 18, 130);

    // Right L-strip
    ctx.fillRect(w - 130, 65, 80, 16);
    ctx.fillRect(w - 68, 65, 18, 130);

    // Central Straight Strip (Terminal D)
    ctx.fillRect(170, 65, 260, 16);

    // Terminals / Binding Screws
    ctx.fillStyle = "#ffffff";
    const drawScrew = (x, y) => {
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    };
    drawScrew(59, 185); // Term A
    drawScrew(w - 59, 185); // Term B
    drawScrew(120, 73); // Left gap left
    drawScrew(180, 73); // Left gap right
    drawScrew(420, 73); // Right gap left
    drawScrew(w - 120, 73); // Right gap right
    drawScrew(300, 73); // Central terminal D

    // Left Gap Component: Resistance Box (R)
    ctx.fillStyle = "#1e293b";
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1.5;
    ctx.fillRect(122, 58, 56, 30);
    ctx.strokeRect(122, 58, 56, 30);
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 9px monospace";
    ctx.fillText(`R=${R}Ω`, 130, 76);

    // Right Gap Component: Unknown Resistance Wire Coil (X)
    ctx.fillStyle = "#1e293b";
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 1.5;
    ctx.fillRect(w - 178, 58, 56, 30);
    ctx.strokeRect(w - 178, 58, 56, 30);
    ctx.fillStyle = "#f59e0b";
    ctx.font = "bold 9px monospace";
    ctx.fillText(`X=${X}Ω`, w - 170, 76);

    // Stretched 1-Meter Resistance Wire (100 cm)
    const wireStartX = 59;
    const wireEndX = w - 59;
    const wireLengthPx = wireEndX - wireStartX;
    const wireY = 185;

    // 100 cm Wooden Ruler Scale under wire
    ctx.fillStyle = "#fef08a"; // Pale yellow wooden ruler
    ctx.fillRect(wireStartX, wireY + 4, wireLengthPx, 22);
    ctx.strokeStyle = "#713f12";
    ctx.strokeRect(wireStartX, wireY + 4, wireLengthPx, 22);

    ctx.fillStyle = "#000000";
    ctx.font = "8px sans-serif";
    for (let cm = 0; cm <= 100; cm += 10) {
      const markX = wireStartX + (cm / 100) * wireLengthPx;
      ctx.beginPath();
      ctx.moveTo(markX, wireY + 4);
      ctx.lineTo(markX, wireY + (cm % 50 === 0 ? 16 : 10));
      ctx.stroke();
      if (cm % 20 === 0) {
        ctx.fillText(`${cm}`, markX - 4, wireY + 22);
      }
    }

    // Taut Metallic Resistance Wire (Manganin)
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(wireStartX, wireY);
    ctx.lineTo(wireEndX, wireY);
    ctx.stroke();

    // Sliding Jockey Position & Contact
    const jockeyX = wireStartX + (Math.max(1, Math.min(99, l)) / 100) * wireLengthPx;
    // Red contact line from jockey to Central Terminal D
    ctx.strokeStyle = "rgba(239, 68, 68, 0.7)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(300, 105); // Bottom of galvanometer
    ctx.lineTo(jockeyX, wireY - 8);
    ctx.stroke();

    // Jockey Handle & Knife-Edge Contact
    ctx.fillStyle = "#f87171";
    ctx.fillRect(jockeyX - 4, wireY - 24, 8, 20);
    ctx.fillStyle = "#eab308";
    ctx.beginPath();
    ctx.moveTo(jockeyX, wireY);
    ctx.lineTo(jockeyX - 4, wireY - 6);
    ctx.lineTo(jockeyX + 4, wireY - 6);
    ctx.closePath();
    ctx.fill();

    // Jockey Label
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 9px sans-serif";
    ctx.fillText(`l = ${l.toFixed(1)} cm`, jockeyX - 18, wireY - 28);

    // ─── CENTER-ZERO GALVANOMETER (at top center) ───
    const galvX = 300;
    const galvY = 70;
    const galvR = 30;

    // Galvanometer Outer Rim
    ctx.fillStyle = "#0f172a";
    ctx.strokeStyle = isBalanced ? "#4ade80" : "#38bdf8";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(galvX, galvY, galvR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Dial Scale (-30 ... 0 ... +30)
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 7px sans-serif";
    ctx.fillText("-30", galvX - 22, galvY - 4);
    ctx.fillText("0", galvX - 2, galvY - 12);
    ctx.fillText("+30", galvX + 10, galvY - 4);

    // Galvanometer Needle
    const maxAngle = Math.PI / 4; // 45 degrees max swing
    const needleAngle = -Math.PI / 2 + (defl / 30) * maxAngle;
    const needleLen = galvR - 7;
    const needleEndX = galvX + Math.cos(needleAngle) * needleLen;
    const needleEndY = galvY + Math.sin(needleAngle) * needleLen;

    ctx.strokeStyle = isBalanced ? "#4ade80" : "#ef4444";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(galvX, galvY);
    ctx.lineTo(needleEndX, needleEndY);
    ctx.stroke();

    // Needle pivot
    ctx.fillStyle = "#e2e8f0";
    ctx.beginPath();
    ctx.arc(galvX, galvY, 3, 0, Math.PI * 2);
    ctx.fill();

    // Status Pill below Galvanometer
    ctx.fillStyle = isBalanced ? "rgba(34, 197, 94, 0.25)" : "rgba(239, 68, 68, 0.2)";
    ctx.strokeStyle = isBalanced ? "#22c55e" : "#ef4444";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(galvX - 60, galvY + 34, 120, 16, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isBalanced ? "#4ade80" : "#f87171";
    ctx.font = "bold 8.5px sans-serif";
    ctx.fillText(
      isBalanced ? "✓ NULL BALANCED (0 μA)" : `Deflection: ${defl.toFixed(1)} μA`,
      galvX - (isBalanced ? 50 : 44),
      galvY + 45
    );
  }

  // 5. NEWTON'S RINGS SCENE (Thin-Film Interference)
  else if (scene === "newtons_rings") {
    const n = Math.max(1, Math.min(25, params.ringNumber || 10));
    const diamMm = live.ringDiameter_mm || 4.5;
    const centerX = w / 2;
    const centerY = h / 2;
    const maxR = 120;

    // Microscope Circular Field-of-View Aperture
    ctx.fillStyle = "#020617";
    ctx.beginPath();
    ctx.arc(centerX, centerY, maxR + 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Concentric Newton's Rings (Dark & Bright Fringes)
    // Dark rings radii proportional to sqrt(k)
    for (let k = 1; k <= 22; k++) {
      const ringRadius = Math.sqrt(k / 22) * maxR;
      const isTargetRing = k === n;
      
      // Draw bright halo ring
      ctx.strokeStyle = isTargetRing ? "rgba(250, 204, 21, 0.95)" : "rgba(253, 224, 71, 0.35)"; // Sodium yellow (589.3nm)
      ctx.lineWidth = isTargetRing ? 3 : Math.max(1.2, 5 / Math.sqrt(k));
      ctx.beginPath();
      ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Central destructive interference spot (Dark center)
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
    ctx.fill();

    // Traveling Microscope Crosshairs
    ctx.strokeStyle = "rgba(239, 68, 68, 0.6)"; // Red optical crosshair
    ctx.lineWidth = 1;
    // Horizontal Crosshair
    ctx.beginPath();
    ctx.moveTo(centerX - maxR - 5, centerY);
    ctx.lineTo(centerX + maxR + 5, centerY);
    ctx.stroke();
    // Vertical Crosshair
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - maxR - 5);
    ctx.lineTo(centerX, centerY + maxR + 5);
    ctx.stroke();

    // Ring Diameter Caliper Overlay for selected ring n
    const targetR = Math.sqrt(n / 22) * maxR;
    ctx.strokeStyle = "#38bdf8";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(centerX - targetR, centerY - 15);
    ctx.lineTo(centerX - targetR, centerY + 15);
    ctx.moveTo(centerX + targetR, centerY - 15);
    ctx.lineTo(centerX + targetR, centerY + 15);
    ctx.moveTo(centerX - targetR, centerY);
    ctx.lineTo(centerX + targetR, centerY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Measurement Readout Badge
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(centerX - 95, h - 34, 190, 22, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#fef08a";
    ctx.font = "bold 10px monospace";
    ctx.fillText(`Ring n=${n}  |  D_n = ${diamMm.toFixed(3)} mm`, centerX - 82, h - 20);
  }

  // 6. DIFFRACTION GRATING SPECTROMETER SCENE
  else if (scene === "diffraction_grating") {
    const order = params.spectralOrder || 1;
    const angleDeg = live.diffractionAngle_deg || 18.5;
    const centerX = 160;
    const centerY = h / 2;

    // Collimator Tube (Left)
    ctx.fillStyle = "#334155";
    ctx.fillRect(20, centerY - 14, 120, 28);
    ctx.fillStyle = "#64748b";
    ctx.fillRect(135, centerY - 18, 10, 36);

    // Incident Monochromatic / Polychromatic Light Beam
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fillRect(145, centerY - 3, 40, 6);

    // Diffraction Grating Plate (Mounted vertically)
    ctx.fillStyle = "#1e293b";
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    ctx.fillRect(centerX + 25, centerY - 55, 12, 110);
    ctx.strokeRect(centerX + 25, centerY - 55, 12, 110);

    // Ruling Lines on Grating
    ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
    ctx.lineWidth = 1;
    for (let gy = centerY - 45; gy <= centerY + 45; gy += 6) {
      ctx.beginPath();
      ctx.moveTo(centerX + 26, gy);
      ctx.lineTo(centerX + 36, gy);
      ctx.stroke();
    }

    // Central Zero-Order Beam (Undiffracted white light)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(centerX + 37, centerY);
    ctx.lineTo(w - 40, centerY);
    ctx.stroke();
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "9px sans-serif";
    ctx.fillText("m = 0 (Central)", w - 100, centerY - 8);

    // Diffracted Spectral Beams (Mercury Lines: Violet, Blue, Green, Yellow)
    const spectralLines = [
      { name: "Violet", color: "#a855f7", nm: 404.7 },
      { name: "Blue", color: "#38bdf8", nm: 435.8 },
      { name: "Green", color: "#4ade80", nm: 546.1 },
      { name: "Yellow", color: "#facc15", nm: 579.0 }
    ];

    const rad = (angleDeg * Math.PI) / 180;
    const beamLength = 220;

    spectralLines.forEach((line, idx) => {
      const spreadAngle = rad * (line.nm / 546.1);
      // Upward diffracted beam (+order)
      const upX = centerX + 37 + Math.cos(spreadAngle) * beamLength;
      const upY = centerY - Math.sin(spreadAngle) * beamLength;

      ctx.strokeStyle = line.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX + 37, centerY);
      ctx.lineTo(upX, upY);
      ctx.stroke();

      // Downward diffracted beam (-order)
      const downX = centerX + 37 + Math.cos(spreadAngle) * beamLength;
      const downY = centerY + Math.sin(spreadAngle) * beamLength;

      ctx.beginPath();
      ctx.moveTo(centerX + 37, centerY);
      ctx.lineTo(downX, downY);
      ctx.stroke();

      ctx.fillStyle = line.color;
      ctx.font = "bold 8.5px monospace";
      if (idx === 2) {
        ctx.fillText(`${line.name} (θ = ${angleDeg.toFixed(1)}°)`, upX - 10, upY - 4);
      }
    });

    // Angular Vernier Protractor Arc
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(centerX + 37, centerY, 80, -rad, rad);
    ctx.stroke();
  }

  // 7. HALL EFFECT SCENE (Semiconductor in Transverse B-Field)
  else if (scene === "hall_effect") {
    const B = params.magneticField_kG || 2.5;
    const I = params.sampleCurrent_mA || 5;
    const vh = live.hallVoltage_mV || 0.65;
    const centerX = w / 2;
    const centerY = h / 2;

    // Electromagnet North Pole (Top)
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(centerX - 100, 25, 200, 30);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    ctx.strokeRect(centerX - 100, 25, 200, 30);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText("MAGNET NORTH POLE (N)", centerX - 75, 45);

    // Electromagnet South Pole (Bottom)
    ctx.fillStyle = "#3b82f6";
    ctx.fillRect(centerX - 100, h - 55, 200, 30);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    ctx.strokeRect(centerX - 100, h - 55, 200, 30);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText("MAGNET SOUTH POLE (S)", centerX - 75, h - 35);

    // Magnetic Field Flux Lines (Downwards: N -> S)
    ctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
    ctx.setLineDash([4, 4]);
    for (let fx = centerX - 80; fx <= centerX + 80; fx += 25) {
      ctx.beginPath();
      ctx.moveTo(fx, 55);
      ctx.lineTo(fx, h - 55);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Semiconductor Crystal Wafer (Central Grey/Blue Slab)
    ctx.fillStyle = "#1e293b";
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2.5;
    ctx.fillRect(centerX - 80, centerY - 35, 160, 70);
    ctx.strokeRect(centerX - 80, centerY - 35, 160, 70);

    // Flowing Charge Carriers (Electrons drifting right, pushed down by Lorentz force)
    ctx.fillStyle = "#facc15";
    for (let i = 0; i < 12; i++) {
      const ex = ((centerX - 70 + (i * 24) + time * 35) % 140) + (centerX - 70);
      const ey = centerY + 8 + Math.sin(ex * 0.1) * 6; // Deflected towards lower boundary
      ctx.beginPath();
      ctx.arc(ex, ey, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Current Terminals (Left & Right)
    ctx.fillStyle = "#22c55e";
    ctx.fillRect(centerX - 86, centerY - 12, 6, 24);
    ctx.fillRect(centerX + 80, centerY - 12, 6, 24);

    // Microvoltmeter Leads & Display (Top and Bottom Hall probes)
    ctx.strokeStyle = "#f87171";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 35);
    ctx.lineTo(centerX + 130, centerY - 35);
    ctx.lineTo(centerX + 130, centerY - 10);
    ctx.stroke();

    ctx.strokeStyle = "#60a5fa";
    ctx.beginPath();
    ctx.moveTo(centerX, centerY + 35);
    ctx.lineTo(centerX + 130, centerY + 35);
    ctx.lineTo(centerX + 130, centerY + 10);
    ctx.stroke();

    // Microvoltmeter Box
    ctx.fillStyle = "#0f172a";
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1.5;
    ctx.fillRect(centerX + 100, centerY - 25, 70, 50);
    ctx.strokeRect(centerX + 100, centerY - 25, 70, 50);

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 9px monospace";
    ctx.fillText("HALL DMV", centerX + 108, centerY - 10);
    ctx.fillStyle = "#4ade80";
    ctx.font = "bold 11px monospace";
    ctx.fillText(`${vh.toFixed(3)} mV`, centerX + 105, centerY + 12);
  }

  // 8. SEMICONDUCTOR ENERGY BAND GAP SCENE (Heating Oven & Diode)
  else if (scene === "band_gap") {
    const tempC = params.temperature_C || 45;
    const isUa = live.reverseCurrent_uA || 2.4;
    const centerX = 160;
    const centerY = h / 2;

    // Heating Chamber Oven (Left)
    ctx.fillStyle = "#1e293b";
    ctx.strokeStyle = "#f97316";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(50, 40, 220, 200, 14);
    ctx.fill();
    ctx.stroke();

    // Glowing Heater Coils at Bottom
    ctx.strokeStyle = "rgba(239, 68, 68, 0.7)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let hx = 70; hx < 250; hx += 16) {
      ctx.moveTo(hx, 225);
      ctx.lineTo(hx + 8, 215);
      ctx.lineTo(hx + 16, 225);
    }
    ctx.stroke();

    // Oil Bath Tube Inside Chamber
    ctx.fillStyle = "rgba(245, 158, 11, 0.2)";
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 2;
    ctx.fillRect(80, 80, 80, 120);
    ctx.strokeRect(80, 80, 80, 120);

    // Diode Glass Encapsulation Inside Oil
    ctx.fillStyle = "#38bdf8";
    ctx.fillRect(105, 130, 30, 16);
    ctx.fillStyle = "#000000";
    ctx.fillRect(105, 130, 8, 16); // Cathode band

    // Thermometer next to Diode
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(190, 60, 12, 140);
    ctx.strokeStyle = "#64748b";
    ctx.strokeRect(190, 60, 12, 140);

    // Red Mercury Column (Height proportional to tempC)
    const mercHeight = Math.max(15, Math.min(125, (tempC / 100) * 125));
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(192, 200 - mercHeight, 8, mercHeight);
    ctx.beginPath();
    ctx.arc(196, 205, 9, 0, Math.PI * 2);
    ctx.fill();

    // Thermometer Temperature Readout
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 10px monospace";
    ctx.fillText(`${tempC.toFixed(1)} °C`, 175, 52);

    // Right: Microammeter Instrument Reading Reverse Current
    ctx.fillStyle = "#0f172a";
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(320, 70, 180, 140, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText("REVERSE SATURATION CURRENT", 330, 95);

    ctx.fillStyle = "#4ade80";
    ctx.font = "bold 24px monospace";
    ctx.fillText(`${isUa.toFixed(2)} μA`, 345, 140);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "11px monospace";
    ctx.fillText(`ln(I_s) = ${(live.logCurrent || 0).toFixed(3)}`, 345, 175);
    ctx.fillText(`1000/T = ${(live.invTemp_1000K || 0).toFixed(3)} K⁻¹`, 345, 195);
  }

  // 9. SOLAR CELL PHOTOVOLTAIC SCENE
  else if (scene === "solar_cell") {
    const vCell = live.v_cell || 0.48;
    const iCell = live.i_cell_mA || 24;
    const power = live.power_mW || 11.5;
    const rLoad = params.loadResistance_ohm || 100;
    const centerX = 160;
    const centerY = h / 2;

    // Halogen Light Source (Top Left)
    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.arc(80, 60, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ca8a04";
    ctx.stroke();

    // Emitted Photon Rays Towards Solar Cell
    ctx.strokeStyle = "rgba(250, 204, 21, 0.45)";
    ctx.lineWidth = 2;
    for (let a = 0; a < 6; a++) {
      const rayAngle = 0.35 + a * 0.12;
      ctx.beginPath();
      ctx.moveTo(80 + Math.cos(rayAngle) * 26, 60 + Math.sin(rayAngle) * 26);
      ctx.lineTo(centerX - 40 + a * 20, centerY - 25);
      ctx.stroke();
    }

    // Solar Panel (Tilted Photovoltaic Cell)
    ctx.fillStyle = "#1e3a8a"; // Deep Blue Silicon
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(centerX - 50, centerY - 25, 140, 90, 8);
    ctx.fill();
    ctx.stroke();

    // Grid Busbars on Solar Cell
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 1;
    for (let gx = centerX - 35; gx <= centerX + 75; gx += 18) {
      ctx.beginPath();
      ctx.moveTo(gx, centerY - 25);
      ctx.lineTo(gx, centerY + 65);
      ctx.stroke();
    }

    // Variable Load Rheostat & Meters (Right side)
    ctx.fillStyle = "#0f172a";
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(330, 50, 200, 180, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText("PHOTOVOLTAIC OUTPUT BENCH", 345, 75);

    ctx.fillStyle = "#cbd5e1";
    ctx.font = "11px monospace";
    ctx.fillText(`Load R_L : ${rLoad.toFixed(0)} Ω`, 345, 105);
    ctx.fillText(`Voltage V : ${vCell.toFixed(3)} V`, 345, 130);
    ctx.fillText(`Current I : ${iCell.toFixed(1)} mA`, 345, 155);

    ctx.fillStyle = "#4ade80";
    ctx.font = "bold 14px monospace";
    ctx.fillText(`Power P  : ${power.toFixed(2)} mW`, 345, 190);
    ctx.fillStyle = "#facc15";
    ctx.font = "bold 10px monospace";
    ctx.fillText(`Fill Factor : ${(live.fillFactor || 72).toFixed(1)}%`, 345, 215);
  }

  // 10. SEMICONDUCTOR LASER & FIBER NUMERICAL APERTURE SCENE
  else if (scene === "laser_na") {
    const L = params.screenDist_cm || 20;
    const spotW = live.spotDiameter_cm || 6.2;
    const na = live.experimentalNA || 0.28;
    const thetaA = live.acceptanceAngle_deg || 16.5;

    // Laser Diode Module (Left)
    ctx.fillStyle = "#1e293b";
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 2;
    ctx.fillRect(30, h / 2 - 20, 60, 40);
    ctx.strokeRect(30, h / 2 - 20, 60, 40);
    ctx.fillStyle = "#ef4444";
    ctx.font = "bold 9px sans-serif";
    ctx.fillText("LASER 650nm", 33, h / 2 + 4);

    // Multimode Optical Fiber Cable (Flexible Loop)
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(90, h / 2);
    ctx.bezierCurveTo(140, h / 2 - 40, 180, h / 2 + 50, 240, h / 2);
    ctx.stroke();

    // Fiber Core (Red Laser Light Propagating inside)
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(90, h / 2);
    ctx.bezierCurveTo(140, h / 2 - 40, 180, h / 2 + 50, 240, h / 2);
    ctx.stroke();

    // Emergent Divergence Cone from Fiber Tip
    const screenX = 240 + Math.min(220, L * 5);
    const coneRadius = Math.min(80, (spotW * 8));

    ctx.fillStyle = "rgba(239, 68, 68, 0.25)";
    ctx.beginPath();
    ctx.moveTo(240, h / 2);
    ctx.lineTo(screenX, h / 2 - coneRadius);
    ctx.lineTo(screenX, h / 2 + coneRadius);
    ctx.closePath();
    ctx.fill();

    // Target Screen at Distance L
    ctx.fillStyle = "#334155";
    ctx.fillRect(screenX, 40, 14, h - 80);
    ctx.strokeStyle = "#cbd5e1";
    ctx.strokeRect(screenX, 40, 14, h - 80);

    // Circular Illuminated Laser Spot on Screen
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(screenX + 7, h / 2, coneRadius, 0, Math.PI * 2);
    ctx.fill();

    // Measurement Indicators
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 10px monospace";
    ctx.fillText(`Distance L = ${L.toFixed(1)} cm`, 240, h - 35);
    ctx.fillText(`Spot W = ${spotW.toFixed(2)} cm`, screenX - 50, h / 2 - coneRadius - 8);
    ctx.fillStyle = "#4ade80";
    ctx.fillText(`NA = ${na.toFixed(3)}  (θ_a = ${thetaA.toFixed(1)}°)`, 240, 35);
  }

  // 11. TORSIONAL PENDULUM SCENE (Modulus of Rigidity)
  else if (scene === "torsional_pendulum") {
    const L = params.wireLength_cm || 60;
    const wireR = params.wireRadius_mm || 0.45;
    const timePeriod = live.timePeriod || 3.8;
    const omega = (2 * Math.PI) / Math.max(0.1, timePeriod);
    const currentAngleRad = 0.35 * Math.sin(time * omega);
    const centerX = w / 2;

    // Top Rigid Wall-Mount Chuck
    ctx.fillStyle = "#475569";
    ctx.fillRect(centerX - 40, 20, 80, 16);
    ctx.strokeStyle = "#cbd5e1";
    ctx.strokeRect(centerX - 40, 20, 80, 16);

    // Vertical Specimen Wire (With Twist Markings)
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = Math.max(2, wireR * 5);
    ctx.beginPath();
    ctx.moveTo(centerX, 36);
    ctx.lineTo(centerX, 190);
    ctx.stroke();

    // Torsion Twist Helical Rings on Wire
    ctx.strokeStyle = "rgba(56, 189, 248, 0.6)";
    ctx.lineWidth = 1.5;
    for (let wy = 50; wy < 180; wy += 20) {
      const twistX = centerX + Math.sin(currentAngleRad + wy * 0.05) * 4;
      ctx.beginPath();
      ctx.moveTo(twistX - 4, wy);
      ctx.lineTo(twistX + 4, wy + 4);
      ctx.stroke();
    }

    // Heavy Circular Metal Inertia Disc (Drawn in perspective ellipse)
    const discY = 205;
    const radiusX = 110;
    const radiusY = 32;

    ctx.fillStyle = "#334155";
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(centerX, discY, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Disc Radial Reference Line Rotating in Rotational SHM
    const lineEndX = centerX + Math.cos(currentAngleRad) * radiusX;
    const lineEndY = discY + Math.sin(currentAngleRad) * radiusY;

    ctx.strokeStyle = "#f87171";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX, discY);
    ctx.lineTo(lineEndX, lineEndY);
    ctx.stroke();

    // Central Chuck Pin
    ctx.fillStyle = "#eab308";
    ctx.beginPath();
    ctx.arc(centerX, discY, 6, 0, Math.PI * 2);
    ctx.fill();

    // Readout Banner
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 11px monospace";
    ctx.fillText(`Torsional Period T = ${timePeriod.toFixed(2)} s`, centerX - 90, h - 25);
    ctx.fillStyle = "#4ade80";
    ctx.fillText(`Modulus η = ${(live.calc_rigidity_GPa || 78.5).toFixed(1)} GPa`, centerX - 80, h - 10);
  }

  // 12. GENERIC PHYSICS RIG SCENE
  else {
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText("Dynamic Scientific Model Visualizer", 40, 40);

    // Animated sine energy transfer stream
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 40; x < w - 40; x++) {
      const y = 140 + Math.sin(x * 0.03 + time * 4) * 35;
      if (x === 40) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

function getWavelengthColor(nm) {
  if (nm < 400) return "#a855f7";
  if (nm < 450) return "#3b82f6";
  if (nm < 500) return "#06b6d4";
  if (nm < 570) return "#22c55e";
  if (nm < 590) return "#eab308";
  if (nm < 630) return "#f97316";
  return "#ef4444";
}
