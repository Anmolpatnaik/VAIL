import React, { useState, useRef, useEffect, useMemo, memo, Suspense, Component } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { useLabPerformance } from "./utils/useLabPerformance";

/*
=========================================================
HIGH-DPI SHARP CANVAS LABEL (Retina Scaling, Zero Network)
=========================================================
*/
function CanvasLabel({
  text,
  subtext,
  color = "#ffffff",
  bgColor = "rgba(10, 25, 45, 0.85)",
  borderColor = "rgba(56, 189, 248, 0.4)",
  fontSize = 28,
  subFontSize = 18,
  position = [0, 0, 0],
  scale = [1.4, 0.7, 1],
}) {
  const canvasRef = useRef(null);
  const textureRef = useRef(null);

  if (!canvasRef.current) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    canvasRef.current = canvas;
    const tex = new THREE.CanvasTexture(canvas);
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    textureRef.current = tex;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const tex = textureRef.current;
    if (!canvas || !tex) return;
    const ctx = canvas.getContext("2d");
    const w = 512;
    const h = 256;

    ctx.clearRect(0, 0, w, h);

    if (bgColor) {
      // Rounded pill badge
      const r = 36;
      ctx.beginPath();
      ctx.moveTo(r, 16);
      ctx.lineTo(w - r, 16);
      ctx.quadraticCurveTo(w - 16, 16, w - 16, r);
      ctx.lineTo(w - 16, h - r);
      ctx.quadraticCurveTo(w - 16, h - 16, w - r, h - 16);
      ctx.lineTo(r, h - 16);
      ctx.quadraticCurveTo(16, h - 16, 16, h - r);
      ctx.lineTo(16, r);
      ctx.quadraticCurveTo(16, 16, r, 16);
      ctx.closePath();

      ctx.fillStyle = bgColor;
      ctx.fill();

      if (borderColor) {
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 6;
        ctx.stroke();
      }
    }

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (subtext) {
      ctx.fillStyle = color;
      ctx.font = `bold ${fontSize * 1.8}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace`;
      ctx.fillText(String(text), w / 2, h / 2 - 24);

      ctx.fillStyle = "#94a3b8";
      ctx.font = `600 ${subFontSize * 1.7}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.fillText(String(subtext), w / 2, h / 2 + 54);
    } else {
      ctx.fillStyle = color;
      ctx.font = `bold ${fontSize * 2.0}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace`;
      ctx.fillText(String(text), w / 2, h / 2);
    }

    tex.needsUpdate = true;
  }, [text, subtext, color, bgColor, borderColor, fontSize, subFontSize]);

  useEffect(() => {
    return () => {
      textureRef.current?.dispose();
    };
  }, []);

  return (
    <sprite position={position} scale={scale}>
      <spriteMaterial map={textureRef.current} transparent depthWrite={false} />
    </sprite>
  );
}

/*
=========================================================
ERROR BOUNDARY (Prevents White Screen if WebGL Crashes)
=========================================================
*/
class CanvasErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err) {
    console.warn("WebGL 3D Context Error in RC3D:", err);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

/*
=========================================================
2D HIGH-PERFORMANCE SCHEMATIC CANVAS (Zero GPU Overhead)
=========================================================
*/
function RCSchematic2D({
  powerOn,
  mode,
  capacitorVoltage,
  current,
  voltage,
  resistance,
  capacitance,
  meterMode,
  probesConnected,
  meterValue,
  meterUnit,
}) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let t = 0;

    const render = () => {
      t += 0.03;
      const w = canvas.width;
      const h = canvas.height;

      // Dark workbench gradient
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, "#050e1a");
      grad.addColorStop(1, "#0a1829");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Subtle Grid
      ctx.strokeStyle = "rgba(56, 189, 248, 0.07)";
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

      // Circuit Loop Coordinates
      const left = 90;
      const right = w - 90;
      const top = 100;
      const bottom = h - 100;

      // Circuit Wire Path
      const wireColor = powerOn
        ? mode === "charge"
          ? "#10b981"
          : "#f59e0b"
        : "#475569";

      ctx.strokeStyle = wireColor;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(left, top);
      ctx.lineTo(right, top);
      ctx.lineTo(right, bottom);
      ctx.lineTo(left, bottom);
      ctx.closePath();
      ctx.stroke();

      // Animated Current Flow Dots
      if (powerOn && current > 0) {
        ctx.fillStyle = mode === "charge" ? "#34d399" : "#fbbf24";
        const totalPerimeter = (right - left) * 2 + (bottom - top) * 2;
        const numDots = 16;
        for (let i = 0; i < numDots; i++) {
          const offset =
            ((i * (totalPerimeter / numDots) +
              (mode === "charge" ? t * 65 : -t * 65)) %
              totalPerimeter +
              totalPerimeter) %
            totalPerimeter;
          let px = left;
          let py = top;

          const topLen = right - left;
          const rightLen = bottom - top;
          const botLen = right - left;

          if (offset < topLen) {
            px = left + offset;
            py = top;
          } else if (offset < topLen + rightLen) {
            px = right;
            py = top + (offset - topLen);
          } else if (offset < topLen + rightLen + botLen) {
            px = right - (offset - topLen - rightLen);
            py = bottom;
          } else {
            px = left;
            py = bottom - (offset - topLen - rightLen - botLen);
          }

          ctx.beginPath();
          ctx.arc(px, py, 4.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ─── 1. DC POWER SOURCE (Left Leg) ───
      const vY = (top + bottom) / 2;
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(left - 26, vY - 40, 52, 80);
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      ctx.strokeRect(left - 26, vY - 40, 52, 80);

      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 13px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`${voltage.toFixed(1)}V`, left, vY - 8);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "10px sans-serif";
      ctx.fillText("SUPPLY", left, vY + 12);

      // Terminal Signs
      ctx.fillStyle = "#ef4444";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText("+", left, vY - 48);
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("−", left, vY + 58);

      // ─── 2. RESISTOR (Top Leg) ───
      const rX = (left + right) / 2;
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(rX - 40, top - 20, 80, 40);
      ctx.strokeStyle = "#facc15";
      ctx.lineWidth = 2;
      ctx.strokeRect(rX - 40, top - 20, 80, 40);

      // Resistor Color Bands
      const bandColors = ["#ef4444", "#000000", "#ef4444", "#ca8a04"];
      bandColors.forEach((bColor, bIdx) => {
        ctx.fillStyle = bColor;
        ctx.fillRect(rX - 25 + bIdx * 14, top - 19, 7, 38);
      });

      ctx.fillStyle = "#facc15";
      ctx.font = "bold 12px monospace";
      ctx.fillText(`R = ${resistance} Ω`, rX, top - 28);

      // ─── 3. CAPACITOR (Right Leg) ───
      const cY = (top + bottom) / 2;
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(right - 32, cY - 50, 64, 100);
      ctx.strokeStyle = "#60a5fa";
      ctx.lineWidth = 2;
      ctx.strokeRect(right - 32, cY - 50, 64, 100);

      // Capacitor Plates
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(right - 20, cY - 40, 9, 80);
      ctx.fillRect(right + 11, cY - 40, 9, 80);

      // Charge Accumulation Fill in dielectric
      const pct = Math.min(
        100,
        Math.max(0, (capacitorVoltage / Math.max(0.1, voltage)) * 100)
      );
      ctx.fillStyle = `rgba(59, 130, 246, ${0.15 + (pct / 100) * 0.6})`;
      ctx.fillRect(right - 11, cY - 40, 22, 80);

      ctx.fillStyle = "#60a5fa";
      ctx.font = "bold 12px monospace";
      ctx.fillText(`C = ${capacitance} μF`, right, cY - 60);
      ctx.fillStyle = "#34d399";
      ctx.fillText(`Vc = ${capacitorVoltage.toFixed(2)}V`, right, cY + 70);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "10px sans-serif";
      ctx.fillText(`${pct.toFixed(0)}% Charged`, right, cY + 86);

      // ─── 4. DIGITAL MULTIMETER (Bottom Leg) ───
      const mX = (left + right) / 2;
      const mY = bottom;
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(mX - 75, mY - 38, 150, 76);
      ctx.strokeStyle = probesConnected ? "#22c55e" : "#ef4444";
      ctx.lineWidth = 2;
      ctx.strokeRect(mX - 75, mY - 38, 150, 76);

      // Multimeter LCD Screen
      ctx.fillStyle = "#022c22";
      ctx.fillRect(mX - 62, mY - 26, 124, 34);
      ctx.strokeStyle = "#059669";
      ctx.lineWidth = 1;
      ctx.strokeRect(mX - 62, mY - 26, 124, 34);

      ctx.fillStyle = "#34d399";
      ctx.font = "bold 16px monospace";
      ctx.fillText(`${meterValue.toFixed(2)} ${meterUnit}`, mX, mY - 4);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "9px sans-serif";
      ctx.fillText(
        `MULTIMETER (${meterMode.toUpperCase()})`,
        mX,
        mY + 24
      );

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animRef.current);
  }, [
    powerOn,
    mode,
    capacitorVoltage,
    current,
    voltage,
    resistance,
    capacitance,
    meterMode,
    probesConnected,
    meterValue,
    meterUnit,
  ]);

  return (
    <canvas
      ref={canvasRef}
      width={760}
      height={520}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        borderRadius: "12px",
      }}
    />
  );
}

/*
=========================================================
MAIN RC3D COMPONENT WITH PERFORMANCE MANAGEMENT
=========================================================
*/
export default memo(function RC3D({
  powerOn,
  mode,
  capacitorVoltage,
  current,
  voltage,
  resistance,
  capacitance,
}) {
  const [meterMode, setMeterMode] = useState("voltage");
  const [probesConnected, setProbesConnected] = useState(true);
  const { mode: viewMode, setMode: setViewMode } = useLabPerformance();
  const controlsRef = useRef();

  const handleZoomIn = () => {
    if (controlsRef.current) {
      controlsRef.current.dollyIn(1.25);
      controlsRef.current.update();
    }
  };

  const handleZoomOut = () => {
    if (controlsRef.current) {
      controlsRef.current.dollyOut(1.25);
      controlsRef.current.update();
    }
  };

  const handleResetView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const capacitorPercentage =
    voltage > 0 ? Math.min(100, (capacitorVoltage / voltage) * 100) : 0;

  let meterValue = 0;
  let meterUnit = "V";

  if (meterMode === "voltage") {
    meterValue = probesConnected ? capacitorVoltage : 0;
    meterUnit = "V";
  }

  if (meterMode === "current") {
    meterValue = probesConnected ? current * 1000 : 0;
    meterUnit = "mA";
  }

  const statusText = powerOn
    ? mode === "charge"
      ? "CHARGING"
      : "DISCHARGING"
    : "STANDBY";

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: "580px",
        flex: 1,
        position: "relative",
        overflow: "hidden",
        background: "radial-gradient(circle at 50% 30%, #0d1e34 0%, #040911 100%)",
        borderRadius: "12px",
      }}
    >
      {/* ─── LAB HEADER ─── */}
      <div
        style={{
          position: "absolute",
          top: 14,
          left: 18,
          right: 18,
          zIndex: 30,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "8px",
          pointerEvents: "none",
        }}
      >
        <div style={{ maxWidth: "55%" }}>
          <div
            style={{
              fontSize: "15px",
              fontWeight: "800",
              color: "#ffffff",
              letterSpacing: "0.5px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ color: "#38bdf8" }}>⚡</span> RC Transient Physics Laboratory
          </div>
          <div style={{ marginTop: 3, fontSize: "11px", color: "#94a3b8" }}>
            Precision 3D benchtop apparatus & real-time transient solver
          </div>
        </div>

        {/* Status Pill & Mode Toggle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            pointerEvents: "auto",
            flexWrap: "wrap",
          }}
        >
          {/* 2D / 3D Mode Switcher */}
          <div
            style={{
              display: "flex",
              background: "rgba(11, 23, 42, 0.85)",
              border: "1px solid rgba(56, 189, 248, 0.25)",
              borderRadius: "8px",
              padding: "2px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(8px)",
            }}
          >
            <button
              onClick={() => setViewMode("3d")}
              title="Interactive Realistic 3D Rig"
              style={{
                padding: "4px 10px",
                fontSize: "11px",
                fontWeight: "600",
                borderRadius: "6px",
                border: "none",
                background:
                  viewMode === "3d"
                    ? "linear-gradient(135deg, #0284c7, #2563eb)"
                    : "transparent",
                color: viewMode === "3d" ? "#ffffff" : "#94a3b8",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              🎮 3D Lab
            </button>
            <button
              onClick={() => setViewMode("2d")}
              title="Fast 2D schematic mode"
              style={{
                padding: "4px 10px",
                fontSize: "11px",
                fontWeight: "600",
                borderRadius: "6px",
                border: "none",
                background:
                  viewMode === "2d"
                    ? "linear-gradient(135deg, #0284c7, #2563eb)"
                    : "transparent",
                color: viewMode === "2d" ? "#ffffff" : "#94a3b8",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              ⚡ 2D Schematic
            </button>
          </div>

          {/* Status Badge */}
          <div
            style={{
              padding: "5px 12px",
              borderRadius: "20px",
              background: powerOn
                ? mode === "charge"
                  ? "rgba(16, 185, 129, 0.2)"
                  : "rgba(245, 158, 11, 0.2)"
                : "rgba(148, 163, 184, 0.15)",
              border: `1px solid ${
                powerOn
                  ? mode === "charge"
                    ? "rgba(16, 185, 129, 0.5)"
                    : "rgba(245, 158, 11, 0.5)"
                  : "rgba(148, 163, 184, 0.3)"
              }`,
              color: powerOn
                ? mode === "charge"
                  ? "#34d399"
                : "#fbbf24"
                : "#94a3b8",
              fontSize: "11px",
              fontWeight: "700",
              letterSpacing: "0.5px",
              boxShadow: powerOn ? "0 0 12px rgba(16, 185, 129, 0.2)" : "none",
            }}
          >
            ● {statusText}
          </div>
        </div>
      </div>

      {/* ─── WORKBENCH VIEWPORT ─── */}
      {viewMode === "2d" ? (
        <RCSchematic2D
          powerOn={powerOn}
          mode={mode}
          capacitorVoltage={capacitorVoltage}
          current={current}
          voltage={voltage}
          resistance={resistance}
          capacitance={capacitance}
          meterMode={meterMode}
          probesConnected={probesConnected}
          meterValue={meterValue}
          meterUnit={meterUnit}
        />
      ) : (
        <CanvasErrorBoundary
          fallback={
            <RCSchematic2D
              powerOn={powerOn}
              mode={mode}
              capacitorVoltage={capacitorVoltage}
              current={current}
              voltage={voltage}
              resistance={resistance}
              capacitance={capacitance}
              meterMode={meterMode}
              probesConnected={probesConnected}
              meterValue={meterValue}
              meterUnit={meterUnit}
            />
          }
        >
          <Canvas
            camera={{ position: [0, 4.8, 13.2], fov: 42, near: 0.5, far: 50 }}
            dpr={[1, 2]}
            gl={{
              powerPreference: "high-performance",
              antialias: true,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.15,
            }}
            shadows={false}
          >
            {/* Studio Environment Lighting */}
            <color attach="background" args={["#050c18"]} />
            <ambientLight intensity={1.1} color="#cde3ff" />
            <directionalLight position={[6, 12, 8]} intensity={2.6} color="#ffffff" />
            <directionalLight position={[-8, 6, -3]} intensity={2.2} color="#38bdf8" />
            <pointLight position={[0, 6, 4]} intensity={1.2} color="#93c5fd" />
            <pointLight position={[0, -0.5, 0]} intensity={0.6} color="#0284c7" />

            <Suspense fallback={null}>
              <group scale={[0.96, 0.96, 0.96]} position={[0, -0.35, 0]}>
                {/* ─── PREMIUM LAB WORKBENCH ─── */}
                {/* Main Table Surface */}
                <RoundedBox args={[14.2, 0.45, 7.6]} radius={0.16} smoothness={4} position={[0, -1.45, 0]}>
                  <meshStandardMaterial
                    color="#0e1726"
                    metalness={0.35}
                    roughness={0.5}
                  />
                </RoundedBox>

                {/* Table Edge Bevel Trim (Anodized Cyan/Blue Aluminum) */}
                <RoundedBox args={[14.3, 0.06, 7.7]} radius={0.03} smoothness={2} position={[0, -1.24, 0]}>
                  <meshStandardMaterial color="#38bdf8" metalness={0.85} roughness={0.2} emissive="#0284c7" emissiveIntensity={0.3} />
                </RoundedBox>

                {/* Back Instrument Wall Panel */}
                <RoundedBox args={[14.2, 6.2, 0.3]} radius={0.12} smoothness={2} position={[0, 1.45, -3.7]}>
                  <meshStandardMaterial color="#0b1523" metalness={0.25} roughness={0.7} />
                </RoundedBox>

                {/* Wall Ambient Neon Strip */}
                <RoundedBox args={[13.6, 0.06, 0.08]} radius={0.03} smoothness={2} position={[0, 4.3, -3.52]}>
                  <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1.5} />
                </RoundedBox>

                {/* Stable, Zero Z-Fighting Workbench Grid */}
                <LaboratoryBenchGrid />

                {/* ─── 1. BENCHTOP DC POWER SUPPLY (LEFT) ─── */}
                <BenchPowerSupply voltage={voltage} current={current} powerOn={powerOn} />

                {/* ─── 2. PRECISION RESISTOR ASSEMBLY (CENTER) ─── */}
                <ResistorAssembly resistance={resistance} powerOn={powerOn} current={current} />

                {/* ─── 3. PARALLEL-PLATE CAPACITOR (RIGHT) ─── */}
                <PrecisionCapacitor
                  voltage={capacitorVoltage}
                  percentage={capacitorPercentage}
                  capacitance={capacitance}
                  powerOn={powerOn}
                />

                {/* ─── 4. CIRCUIT WIRING & TERMINALS ─── */}
                <CircuitWiring powerOn={powerOn} mode={mode} />

                {/* ─── 5. DYNAMIC CURRENT / ELECTRON FLOW ─── */}
                <CurrentFlowParticles powerOn={powerOn} mode={mode} current={current} />

                {/* ─── 6. FLUKE DIGITAL MULTIMETER (FOREGROUND) ─── */}
                <BenchMultimeter
                  value={meterValue}
                  unit={meterUnit}
                  mode={meterMode}
                  setMode={setMeterMode}
                />

                {/* ─── 7. MULTIMETER VOLTAGE SENSING PROBES (CONNECTS DMM TO CAPACITOR) ─── */}
                <MultimeterProbes probesConnected={probesConnected} />
              </group>

              {/* CAMERA CONTROLS */}
              <OrbitControls
                ref={controlsRef}
                makeDefault
                enablePan={true}
                enableZoom={true}
                zoomSpeed={1.2}
                rotateSpeed={0.9}
                enableDamping={true}
                dampingFactor={0.08}
                minDistance={2.5}
                maxDistance={32}
                target={[0, 0.2, 0]}
                minPolarAngle={0.05}
                maxPolarAngle={Math.PI / 2.05}
              />
            </Suspense>
          </Canvas>
        </CanvasErrorBoundary>
      )}

      {/* ─── MULTIMETER CONTROLS ─── */}
      <div
        style={{
          position: "absolute",
          left: 20,
          bottom: 20,
          zIndex: 20,
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => setMeterMode("voltage")}
          style={meterButtonStyle(meterMode === "voltage")}
        >
          ⚡ V DC (Volts)
        </button>
        <button
          onClick={() => setMeterMode("current")}
          style={meterButtonStyle(meterMode === "current")}
        >
          〰️ A DC (Current)
        </button>
        <button
          onClick={() => setProbesConnected((value) => !value)}
          style={{
            ...meterButtonStyle(probesConnected),
            background: probesConnected
              ? "rgba(16, 185, 129, 0.25)"
              : "rgba(239, 68, 68, 0.25)",
            borderColor: probesConnected
              ? "rgba(16, 185, 129, 0.5)"
              : "rgba(239, 68, 68, 0.5)",
            color: probesConnected ? "#34d399" : "#f87171",
          }}
        >
          {probesConnected ? "● Probes Attached" : "○ Probes Disconnected"}
        </button>
      </div>

      {/* ─── LIVE DATA HUD ─── */}
      <div
        style={{
          position: "absolute",
          top: 76,
          right: 18,
          zIndex: 20,
          width: 205,
          padding: "14px 16px",
          borderRadius: 12,
          background: "rgba(8, 18, 33, 0.88)",
          border: "1px solid rgba(56, 189, 248, 0.25)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            color: "#38bdf8",
            fontSize: "11px",
            fontWeight: "800",
            letterSpacing: "1.2px",
            marginBottom: "10px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#38bdf8" }} />
          BENCH TELEMETRY
        </div>
        <DataRow label="Capacitor Vc" value={`${capacitorVoltage.toFixed(2)} V`} highlight="#38bdf8" />
        <DataRow label="Loop Current" value={`${(current * 1000).toFixed(2)} mA`} highlight="#34d399" />
        <DataRow label="Charge Level" value={`${capacitorPercentage.toFixed(1)} %`} highlight="#fbbf24" />
        <DataRow label="Resistance" value={`${resistance} Ω`} />
        <DataRow label="Capacitance" value={`${capacitance} μF`} />
        <DataRow label="Circuit Mode" value={mode.toUpperCase()} highlight={mode === "charge" ? "#34d399" : "#fbbf24"} />
      </div>
    </div>
  );
});

/*
=========================================================
1. REALISTIC BENCHTOP DC POWER SUPPLY (LEFT RIG)
=========================================================
*/
function BenchPowerSupply({ voltage, current, powerOn }) {
  return (
    <group position={[-4.2, 0.25, 0]}>
      {/* Heavy-duty Instrument Housing */}
      <RoundedBox args={[2.0, 3.0, 2.2]} radius={0.14} smoothness={4}>
        <meshStandardMaterial color="#1e293b" metalness={0.4} roughness={0.35} />
      </RoundedBox>

      {/* Front Faceplate (Brushed Metal) */}
      <RoundedBox args={[1.86, 2.82, 0.1]} radius={0.08} smoothness={2} position={[0, 0, 1.1]}>
        <meshStandardMaterial color="#0f172a" metalness={0.65} roughness={0.25} />
      </RoundedBox>

      {/* Chassis Carrying Handle */}
      <mesh position={[0, 1.62, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 1.4, 16]} />
        <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* Voltage Display Bezel */}
      <RoundedBox args={[1.5, 0.65, 0.08]} radius={0.06} smoothness={2} position={[0, 0.95, 1.16]}>
        <meshStandardMaterial color="#050a12" roughness={0.2} metalness={0.8} />
      </RoundedBox>
      <CanvasLabel
        text={`${voltage.toFixed(2)} V`}
        subtext="DC VOLTAGE"
        color="#ef4444"
        bgColor={null}
        fontSize={22}
        subFontSize={11}
        position={[0, 0.95, 1.22]}
        scale={[1.4, 0.6, 1]}
      />

      {/* Current Display Bezel */}
      <RoundedBox args={[1.5, 0.65, 0.08]} radius={0.06} smoothness={2} position={[0, 0.22, 1.16]}>
        <meshStandardMaterial color="#050a12" roughness={0.2} metalness={0.8} />
      </RoundedBox>
      <CanvasLabel
        text={`${(powerOn ? current * 1000 : 0).toFixed(1)} mA`}
        subtext="CURRENT LIMIT"
        color="#10b981"
        bgColor={null}
        fontSize={22}
        subFontSize={11}
        position={[0, 0.22, 1.22]}
        scale={[1.4, 0.6, 1]}
      />

      {/* Dual Rotary Precision Knobs */}
      <Knob position={[-0.45, -0.42, 1.18]} label="V-ADJ" />
      <Knob position={[0.45, -0.42, 1.18]} label="I-LIMIT" />

      {/* Heavy-Duty Banana Binding Posts */}
      {/* Positive Terminal (+) RED */}
      <BindingPost position={[0.5, -0.92, 1.18]} color="#dc2626" label="+" />

      {/* Ground (GND) GREEN */}
      <BindingPost position={[0, -0.92, 1.18]} color="#16a34a" label="GND" />

      {/* Negative Terminal (-) BLACK */}
      <BindingPost position={[-0.5, -0.92, 1.18]} color="#18181b" label="−" />

      {/* Illuminated Power Rocker Switch */}
      <mesh position={[0, -1.25, 1.16]}>
        <boxGeometry args={[0.42, 0.22, 0.08]} />
        <meshStandardMaterial
          color={powerOn ? "#10b981" : "#ef4444"}
          emissive={powerOn ? "#10b981" : "#ef4444"}
          emissiveIntensity={powerOn ? 0.9 : 0.3}
        />
      </mesh>

      {/* Active Output Glow */}
      {powerOn && (
        <pointLight position={[0.5, -0.9, 1.4]} color="#38bdf8" intensity={1.5} distance={2.5} />
      )}
    </group>
  );
}

function Knob({ position, label }) {
  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.24, 0.16, 24]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Metallic Pointer Notch */}
      <mesh position={[0, 0.16, 0.09]}>
        <boxGeometry args={[0.04, 0.08, 0.04]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.9} />
      </mesh>
    </group>
  );
}

function BindingPost({ position, color, label }) {
  return (
    <group position={position}>
      {/* Threaded Collar */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.22, 20]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Banana Jack Center Core */}
      <mesh position={[0, 0, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.065, 0.065, 0.06, 16]} />
        <meshStandardMaterial color="#fef08a" metalness={0.95} roughness={0.1} />
      </mesh>
    </group>
  );
}

/*
=========================================================
2. PRECISION RESISTOR ASSEMBLY (CENTER STATION)
=========================================================
*/
function ResistorAssembly({ resistance, powerOn, current }) {
  // Determine standard 4-band color code for visual accuracy
  const bandColors = useMemo(() => {
    if (resistance <= 100) return ["#78350f", "#000000", "#78350f", "#d97706"];
    if (resistance <= 1000) return ["#78350f", "#000000", "#dc2626", "#d97706"];
    if (resistance <= 10000) return ["#78350f", "#000000", "#ea580c", "#d97706"];
    if (resistance <= 100000) return ["#78350f", "#000000", "#eab308", "#d97706"];
    return ["#78350f", "#000000", "#16a34a", "#d97706"];
  }, [resistance]);

  return (
    <group position={[0, 0.85, 0]}>
      {/* Insulated Laboratory Breadboard / Component Carrier */}
      <RoundedBox args={[3.2, 0.35, 1.2]} radius={0.1} smoothness={2} position={[0, -0.65, 0]}>
        <meshStandardMaterial color="#0f172a" metalness={0.3} roughness={0.4} />
      </RoundedBox>

      {/* Gold-Plated Terminal Clamps (Left & Right) */}
      <TerminalClamp position={[-1.2, -0.3, 0]} />
      <TerminalClamp position={[1.2, -0.3, 0]} />

      {/* Tinned Copper Leads bending up from clamps */}
      <Line points={[[-1.2, -0.2, 0], [-0.9, 0, 0], [-0.75, 0, 0]]} color="#cbd5e1" lineWidth={5} />
      <Line points={[[0.75, 0, 0], [0.9, 0, 0], [1.2, -0.2, 0]]} color="#cbd5e1" lineWidth={5} />

      {/* Ceramic High-Tolerance Resistor Body */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.26, 0.26, 1.5, 32]} />
        <meshStandardMaterial
          color="#f5e6cc"
          metalness={0.15}
          roughness={0.35}
        />
      </mesh>

      {/* Metallic Nickel End Caps */}
      {[-0.75, 0.75].map((x, idx) => (
        <mesh key={idx} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.27, 0.27, 0.14, 24]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}

      {/* High-Gloss Resistor Color Bands */}
      {bandColors.map((color, idx) => {
        const xPos = -0.45 + idx * 0.28;
        return (
          <mesh key={idx} position={[xPos, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.268, 0.268, 0.1, 24]} />
            <meshStandardMaterial color={color} roughness={0.25} metalness={0.2} />
          </mesh>
        );
      })}

      {/* Precision Measurement Floating HUD Badge */}
      <CanvasLabel
        text={`R = ${resistance} Ω`}
        subtext={`I = ${(current * 1000).toFixed(1)} mA`}
        color="#fbbf24"
        bgColor="rgba(15, 23, 42, 0.9)"
        borderColor="rgba(250, 204, 21, 0.4)"
        fontSize={24}
        subFontSize={16}
        position={[0, 0.85, 0]}
        scale={[1.6, 0.75, 1]}
      />

      {/* Dynamic Thermal / Dissipation Energy Glow */}
      {powerOn && (
        <pointLight position={[0, 0, 0.4]} color="#fbbf24" intensity={Math.min(1.5, (current * 1000) / 4)} distance={2.5} />
      )}
    </group>
  );
}

function TerminalClamp({ position }) {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.15, 0.15, 0.4, 20]} />
        <meshStandardMaterial color="#facc15" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.24, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.12, 20]} />
        <meshStandardMaterial color="#ca8a04" metalness={0.95} roughness={0.15} />
      </mesh>
    </group>
  );
}

/*
=========================================================
3. PARALLEL-PLATE PRECISION CAPACITOR (RIGHT RIG)
=========================================================
*/
function PrecisionCapacitor({ voltage, percentage, capacitance, powerOn }) {
  const glowIntensity = Math.min(1.0, 0.2 + (percentage / 100) * 0.8);

  return (
    <group position={[4.2, 0.35, 0]}>
      {/* Heavy Cast-Iron Lab Base Rail */}
      <RoundedBox args={[2.8, 0.35, 2.2]} radius={0.1} smoothness={2} position={[0, -1.35, 0]}>
        <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.3} />
      </RoundedBox>

      {/* Millimeter Gauge Optical Slide Rail */}
      <mesh position={[0, -1.14, 0]}>
        <boxGeometry args={[2.5, 0.08, 0.45]} />
        <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Positive Aluminum Capacitor Plate (Left Plate) */}
      <group position={[-0.45, 0, 0]}>
        <RoundedBox args={[0.15, 2.4, 1.8]} radius={0.06} smoothness={3}>
          <meshStandardMaterial
            color="#38bdf8"
            metalness={0.88}
            roughness={0.15}
            emissive="#0284c7"
            emissiveIntensity={glowIntensity * 0.4}
          />
        </RoundedBox>
        {/* Terminal Post */}
        <mesh position={[-0.12, 1.25, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.2, 16]} />
          <meshStandardMaterial color="#ef4444" metalness={0.8} />
        </mesh>
      </group>

      {/* Negative Aluminum Capacitor Plate (Right Plate) */}
      <group position={[0.45, 0, 0]}>
        <RoundedBox args={[0.15, 2.4, 1.8]} radius={0.06} smoothness={3}>
          <meshStandardMaterial
            color="#38bdf8"
            metalness={0.88}
            roughness={0.15}
            emissive="#0284c7"
            emissiveIntensity={glowIntensity * 0.4}
          />
        </RoundedBox>
        {/* Terminal Post */}
        <mesh position={[0.12, 1.25, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.2, 16]} />
          <meshStandardMaterial color="#18181b" metalness={0.8} />
        </mesh>
      </group>

      {/* Translucent Dielectric Slab (Acrylic / Mica) */}
      <RoundedBox args={[0.62, 2.25, 1.65]} radius={0.05} smoothness={2} position={[0, 0, 0]}>
        <meshPhysicalMaterial
          color="#38bdf8"
          transmission={0.85}
          opacity={0.65}
          transparent={true}
          roughness={0.15}
          ior={1.45}
        />
      </RoundedBox>

      {/* Dynamic Electrostatic Field Glow inside Dielectric */}
      {percentage > 0 && (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.6, 2.2, 1.6]} />
          <meshBasicMaterial
            color="#38bdf8"
            transparent={true}
            opacity={Math.min(0.7, (percentage / 100) * 0.65)}
          />
        </mesh>
      )}

      {/* High-Resolution Telemetry Floating Plate */}
      <CanvasLabel
        text={`Vc = ${voltage.toFixed(2)} V`}
        subtext={`${percentage.toFixed(0)}% CHARGED • ${capacitance} μF`}
        color="#38bdf8"
        bgColor="rgba(11, 23, 42, 0.9)"
        borderColor={percentage >= 95 ? "rgba(52, 211, 153, 0.6)" : "rgba(56, 189, 248, 0.4)"}
        fontSize={24}
        subFontSize={14}
        position={[0, 1.7, 0]}
        scale={[1.8, 0.8, 1]}
      />

      {/* Blue Electric Field Glow */}
      {powerOn && (
        <pointLight position={[0, 0, 0.5]} color="#38bdf8" intensity={glowIntensity * 2.2} distance={3.5} />
      )}
    </group>
  );
}

/*
=========================================================
4. CONTINUOUS 3D CIRCUIT WIRING
=========================================================
*/
function CircuitWiring({ powerOn, mode }) {
  const wireColor = powerOn
    ? mode === "charge"
      ? "#10b981"
      : "#f59e0b"
    : "#475569";

  return (
    <group>
      {/* 1. Power Supply (+) at [-3.7, 0.85, 0] to Resistor Left at [-1.2, 0.85, 0] */}
      <Line
        points={[
          [-3.7, -0.67, 1.18],
          [-3.5, 0.85, 0.8],
          [-2.5, 0.85, 0],
          [-1.2, 0.85, 0],
        ]}
        color={wireColor}
        lineWidth={5}
      />

      {/* 2. Resistor Right at [1.2, 0.85, 0] to Capacitor Plate at [3.75, 0.85, 0] */}
      <Line
        points={[
          [1.2, 0.85, 0],
          [2.5, 0.85, 0],
          [3.75, 0.85, 0],
        ]}
        color={wireColor}
        lineWidth={5}
      />

      {/* 3. Capacitor Negative Plate at [4.65, 0.85, 0] down and return to Power Supply (-) */}
      <Line
        points={[
          [4.65, 0.85, 0],
          [5.4, 0.85, 0],
          [5.4, -0.95, 0],
          [-4.7, -0.95, 0],
          [-4.7, -0.67, 1.18],
        ]}
        color={wireColor}
        lineWidth={5}
      />
    </group>
  );
}

/*
=========================================================
5. CURRENT / CHARGE PARTICLES ANIMATION
=========================================================
*/
function CurrentFlowParticles({ powerOn, mode, current }) {
  if (!powerOn || current <= 0.00001) return null;

  return (
    <group>
      {Array.from({ length: 14 }).map((_, idx) => (
        <MovingParticle key={idx} index={idx} total={14} mode={mode} current={current} />
      ))}
    </group>
  );
}

function MovingParticle({ index, total, mode, current }) {
  const meshRef = useRef();

  // Closed loop keyframes along the real circuit wiring
  const pathPoints = useMemo(() => [
    new THREE.Vector3(-3.5, 0.85, 0.8),
    new THREE.Vector3(-1.2, 0.85, 0),
    new THREE.Vector3(0, 0.85, 0),
    new THREE.Vector3(1.2, 0.85, 0),
    new THREE.Vector3(3.75, 0.85, 0),
    new THREE.Vector3(4.65, 0.85, 0),
    new THREE.Vector3(5.4, 0.85, 0),
    new THREE.Vector3(5.4, -0.95, 0),
    new THREE.Vector3(0, -0.95, 0),
    new THREE.Vector3(-4.7, -0.95, 0),
    new THREE.Vector3(-4.7, -0.67, 1.18),
    new THREE.Vector3(-3.7, -0.67, 1.18),
  ], []);

  const curve = useMemo(() => new THREE.CatmullRomCurve3(pathPoints, true), [pathPoints]);
  const initialOffset = index / total;
  const progressRef = useRef(initialOffset);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const speed = (mode === "charge" ? 0.35 : -0.35) * Math.min(2.5, Math.max(0.4, current * 800));
    progressRef.current = (progressRef.current + speed * delta) % 1;
    if (progressRef.current < 0) progressRef.current += 1;

    const pt = curve.getPoint(progressRef.current);
    meshRef.current.position.copy(pt);
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.07, 12, 12]} />
      <meshBasicMaterial
        color={mode === "charge" ? "#34d399" : "#fbbf24"}
      />
    </mesh>
  );
}

/*
=========================================================
6. RUGGED BENCHTOP DIGITAL MULTIMETER (FOREGROUND)
=========================================================
*/
function BenchMultimeter({ value, unit, mode, setMode, probesConnected }) {
  return (
    <group position={[0, -0.22, 2.0]} rotation={[-0.22, 0, 0]}>
      {/* Outer High-Visibility Bumper (Fluke Yellow / Amber) */}
      <RoundedBox args={[3.2, 2.1, 0.62]} radius={0.2} smoothness={4}>
        <meshStandardMaterial color="#f59e0b" metalness={0.2} roughness={0.4} />
      </RoundedBox>

      {/* Inner Charcoal Instrument Core */}
      <RoundedBox args={[2.95, 1.88, 0.63]} radius={0.14} smoothness={3} position={[0, 0, 0.02]}>
        <meshStandardMaterial color="#1e293b" metalness={0.4} roughness={0.3} />
      </RoundedBox>

      {/* Recessed High-Contrast Backlit LCD Display */}
      <RoundedBox args={[2.4, 0.8, 0.08]} radius={0.08} smoothness={2} position={[0, 0.42, 0.34]}>
        <meshStandardMaterial
          color="#022c22"
          emissive="#064e3b"
          emissiveIntensity={0.65}
          roughness={0.2}
        />
      </RoundedBox>

      {/* LCD Text Readout */}
      <CanvasLabel
        text={`${value.toFixed(2)} ${unit}`}
        subtext={`DC ${mode === "voltage" ? "VOLTS [V]" : "CURRENT [mA]"}`}
        color="#34d399"
        bgColor={null}
        fontSize={28}
        subFontSize={12}
        position={[0, 0.42, 0.41]}
        scale={[2.1, 0.75, 1]}
      />

      {/* Rotary Selector Dial */}
      <group position={[0, -0.34, 0.36]} rotation={[0, 0, mode === "voltage" ? 0.4 : -0.4]}>
        <mesh>
          <cylinderGeometry args={[0.32, 0.32, 0.12, 32]} />
          <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.25} />
        </mesh>
        {/* Dial Pointer Line */}
        <mesh position={[0, 0.2, 0.07]}>
          <boxGeometry args={[0.05, 0.16, 0.02]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* Range Indicator Labels */}
      <CanvasLabel text="V⎓" color="#38bdf8" bgColor={null} position={[-0.65, -0.2, 0.36]} fontSize={18} scale={[0.6, 0.6, 1]} />
      <CanvasLabel text="A⎓" color="#fbbf24" bgColor={null} position={[0.65, -0.2, 0.36]} fontSize={18} scale={[0.6, 0.6, 1]} />
      <CanvasLabel text="OFF" color="#94a3b8" bgColor={null} position={[0, -0.78, 0.36]} fontSize={16} scale={[0.6, 0.6, 1]} />

      {/* Safety Banana Input Jacks */}
      <mesh position={[-0.75, -0.58, 0.34]}>
        <cylinderGeometry args={[0.09, 0.09, 0.1, 16]} />
        <meshStandardMaterial color="#ef4444" metalness={0.7} />
      </mesh>
      <mesh position={[-0.25, -0.58, 0.34]}>
        <cylinderGeometry args={[0.09, 0.09, 0.1, 16]} />
        <meshStandardMaterial color="#18181b" metalness={0.7} />
      </mesh>
      <mesh position={[0.25, -0.58, 0.34]}>
        <cylinderGeometry args={[0.09, 0.09, 0.1, 16]} />
        <meshStandardMaterial color="#eab308" metalness={0.7} />
      </mesh>

    </group>
  );
}

/*
=========================================================
7. MULTIMETER VOLTAGE SENSING PROBES
Connects Digital Multimeter to Capacitor Plates
=========================================================
*/
function MultimeterProbes({ probesConnected }) {
  // Red Probe coordinates:
  // Starts at DMM red terminal [-0.75, -0.76, 2.45]
  // Ends at Capacitor Positive Plate Terminal [3.63, 1.60, 0]
  const redPathConnected = useMemo(() => [
    [-0.75, -0.76, 2.45],
    [-0.5, -1.0, 2.1],
    [0.8, -0.85, 1.6],
    [2.2, -0.2, 1.1],
    [3.1, 0.9, 0.5],
    [3.55, 1.55, 0.1],
  ], []);

  // Black Probe coordinates:
  // Starts at DMM black/COM terminal [-0.25, -0.76, 2.45]
  // Ends at Capacitor Negative Plate Terminal [4.77, 1.60, 0]
  const blackPathConnected = useMemo(() => [
    [-0.25, -0.76, 2.45],
    [0.0, -1.05, 2.0],
    [1.4, -0.9, 1.5],
    [2.8, -0.1, 1.0],
    [3.9, 0.9, 0.5],
    [4.68, 1.55, 0.1],
  ], []);

  // Disconnected probe paths (resting on bench ESD mat)
  const redPathResting = useMemo(() => [
    [-0.75, -0.76, 2.45],
    [-0.4, -1.05, 2.0],
    [0.4, -1.15, 1.8],
    [1.1, -1.18, 1.8],
  ], []);

  const blackPathResting = useMemo(() => [
    [-0.25, -0.76, 2.45],
    [0.1, -1.08, 1.9],
    [0.8, -1.16, 1.7],
    [1.5, -1.18, 1.7],
  ], []);

  return (
    <group>
      {/* ─── RED POSITIVE PROBE LEAD (+) ─── */}
      <Line
        points={probesConnected ? redPathConnected : redPathResting}
        color="#ef4444"
        lineWidth={4}
      />
      {probesConnected ? (
        <AlligatorClip
          position={[3.63, 1.60, 0]}
          rotation={[0.4, 0, 0.25]}
          color="#dc2626"
          label="+ Vc"
        />
      ) : (
        <ProbePen
          position={[1.1, -1.18, 1.8]}
          rotation={[0, 0.3, Math.PI / 2]}
          color="#dc2626"
        />
      )}

      {/* ─── BLACK COMMON PROBE LEAD (−/COM) ─── */}
      <Line
        points={probesConnected ? blackPathConnected : blackPathResting}
        color="#1e293b"
        lineWidth={4}
      />
      {probesConnected ? (
        <AlligatorClip
          position={[4.77, 1.60, 0]}
          rotation={[-0.4, 0, -0.25]}
          color="#0f172a"
          label="− COM"
        />
      ) : (
        <ProbePen
          position={[1.5, -1.18, 1.7]}
          rotation={[0, -0.2, Math.PI / 2]}
          color="#0f172a"
        />
      )}
    </group>
  );
}

function AlligatorClip({ position, rotation, color, label }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Insulated Alligator Boot / Handle */}
      <RoundedBox args={[0.18, 0.55, 0.18]} radius={0.05} smoothness={2} position={[0, -0.22, 0]}>
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
      </RoundedBox>
      {/* Serrated Metallic Alligator Jaw clamping onto terminal */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.14, 0.22, 0.14]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.15} />
      </mesh>
      {/* Label Badge */}
      <CanvasLabel
        text={label}
        color="#ffffff"
        bgColor={color === "#dc2626" ? "rgba(220, 38, 38, 0.85)" : "rgba(30, 41, 59, 0.85)"}
        borderColor="rgba(255, 255, 255, 0.4)"
        fontSize={18}
        position={[0, 0.32, 0]}
        scale={[0.8, 0.4, 1]}
      />
    </group>
  );
}

function ProbePen({ position, rotation, color }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <cylinderGeometry args={[0.07, 0.07, 0.65, 16]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.3} />
      </mesh>
      {/* Gold Needle Tip */}
      <mesh position={[0, 0.38, 0]}>
        <coneGeometry args={[0.035, 0.16, 16]} />
        <meshStandardMaterial color="#facc15" metalness={0.95} roughness={0.1} />
      </mesh>
    </group>
  );
}

/* Stable, Zero Z-Fighting Grid with depthWrite disabled */
function LaboratoryBenchGrid() {
  const gridRef = useRef();

  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.material.depthWrite = false;
      gridRef.current.material.transparent = true;
      gridRef.current.material.opacity = 0.35;
      gridRef.current.renderOrder = 2;
    }
  }, []);

  return (
    <gridHelper
      ref={gridRef}
      args={[13.6, 28, "#38bdf8", "#1e3a5f"]}
      position={[0, -1.22, 0.1]}
    />
  );
}

/* ─── HELPER COMPONENTS & STYLES ─── */

function DataRow({ label, value, highlight }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "5px 0",
        borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
      }}
    >
      <span style={{ color: "#94a3b8", fontSize: "11px", fontWeight: "500" }}>{label}</span>
      <strong style={{ color: highlight || "#ffffff", fontSize: "12px", fontFamily: "monospace" }}>
        {value}
      </strong>
    </div>
  );
}

function meterButtonStyle(active) {
  return {
    border: `1px solid ${active ? "rgba(56, 189, 248, 0.5)" : "rgba(255, 255, 255, 0.15)"}`,
    borderRadius: "8px",
    padding: "8px 14px",
    background: active
      ? "linear-gradient(135deg, rgba(2, 132, 199, 0.35), rgba(37, 99, 235, 0.35))"
      : "rgba(15, 23, 42, 0.75)",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: "600",
    backdropFilter: "blur(8px)",
    boxShadow: active ? "0 0 14px rgba(56, 189, 248, 0.25)" : "0 4px 10px rgba(0, 0, 0, 0.3)",
    transition: "all 0.15s ease",
  };
}