import React, { useMemo, useRef, memo, useState, useEffect, Suspense, Component } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { useLabPerformance } from "./utils/useLabPerformance";

/*
=========================================================
HIGH-DPI RETINA CANVAS LABEL (Zero Network, Sharp Fonts)
=========================================================
*/
function CanvasLabel({
  text,
  subtext,
  color = "#ffffff",
  bgColor = "rgba(10, 25, 45, 0.85)",
  borderColor = "rgba(56, 189, 248, 0.4)",
  fontSize = 24,
  subFontSize = 14,
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
      const r = 32;
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
        ctx.lineWidth = 5;
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
      ctx.fillText(String(subtext), w / 2, h / 2 + 50);
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
    console.warn("WebGL 3D Context Error in Hysteresis:", err);
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
2D HIGH-PERFORMANCE CRO OSCILLOSCOPE (Zero GPU Overhead)
=========================================================
*/
function HysteresisScope2D({ powerOn, field, magnetization, frequency, loss, temperature, loopPoints }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;

    // Dark oscilloscope background
    ctx.fillStyle = "#03140e";
    ctx.fillRect(0, 0, w, h);

    // Green CRT Graticule Grid
    ctx.strokeStyle = "rgba(16, 185, 129, 0.15)";
    ctx.lineWidth = 1;
    const gridSpacing = 35;
    for (let x = 0; x < w; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Main Axes
    const cx = w / 2;
    const cy = h / 2;
    ctx.strokeStyle = "rgba(16, 185, 129, 0.45)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, 10);
    ctx.lineTo(cx, h - 10);
    ctx.moveTo(10, cy);
    ctx.lineTo(w - 10, cy);
    ctx.stroke();

    // Axis Labels
    ctx.fillStyle = "#34d399";
    ctx.font = "bold 11px monospace";
    ctx.fillText("+B (Flux Density)", cx + 10, 22);
    ctx.fillText("−B", cx + 10, h - 16);
    ctx.fillText("+H (Field)", w - 75, cy - 8);
    ctx.fillText("−H", 15, cy - 8);

    // Draw Hysteresis Loop
    let points = [];
    if (Array.isArray(loopPoints) && loopPoints.length > 1) {
      const slice = loopPoints.slice(-250);
      let maxH = 1;
      let maxB = 1;
      slice.forEach((p) => {
        maxH = Math.max(maxH, Math.abs(Number(p.h) || 0));
        maxB = Math.max(maxB, Math.abs(Number(p.b) || 0));
      });
      points = slice.map((p) => ({
        x: cx + ((Number(p.h) || 0) / maxH) * (w * 0.38),
        y: cy - ((Number(p.b) || 0) / maxB) * (h * 0.38),
      }));
    } else {
      for (let i = 0; i <= 100; i++) {
        const t = (i / 100) * Math.PI * 2;
        const x = Math.sin(t);
        const y = Math.tanh(1.8 * Math.sin(t - 0.35));
        points.push({
          x: cx + x * (w * 0.36),
          y: cy - y * (h * 0.36),
        });
      }
    }

    if (points.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = powerOn ? "#34d399" : "#065f46";
      ctx.lineWidth = 2.5;
      ctx.shadowColor = powerOn ? "#10b981" : "transparent";
      ctx.shadowBlur = powerOn ? 10 : 0;
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Telemetry stamp
    ctx.fillStyle = "rgba(16, 185, 129, 0.8)";
    ctx.font = "10px monospace";
    ctx.fillText(`FREQ: ${frequency.toFixed(0)} Hz`, 16, h - 36);
    ctx.fillText(`LOSS: ${loss.toFixed(3)} W`, 16, h - 20);
    ctx.fillText(`TEMP: ${temperature.toFixed(1)} °C`, 16, h - 6);
  }, [powerOn, field, magnetization, frequency, loss, temperature, loopPoints]);

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
MAIN HYSTERESIS 3D COMPONENT
=========================================================
*/
export default memo(function Hysteresis3D({
  powerOn = false,
  field = 0,
  magnetization = 0,
  frequency = 50,
  loss = 0,
  temperature = 25,
  loopPoints = [],
}) {
  const { mode: viewMode, setMode: setViewMode } = useLabPerformance();
  const controlsRef = useRef();

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: "580px",
        flex: 1,
        position: "relative",
        overflow: "hidden",
        borderRadius: "12px",
        background: "radial-gradient(circle at 50% 30%, #0d1e34 0%, #040911 100%)",
      }}
    >
      {/* ─── TOP HEADER ─── */}
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
          pointerEvents: "none",
        }}
      >
        <div>
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
            <span style={{ color: "#38bdf8" }}>🧲</span> B–H Hysteresis Physics Laboratory
          </div>
          <div style={{ color: "#94a3b8", fontSize: "11px", marginTop: "3px" }}>
            Ferromagnetic closed-core excitation, dynamic flux & energy loss rig
          </div>
        </div>

        {/* Mode Switcher & Status */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", pointerEvents: "auto" }}>
          {/* 2D / 3D Mode Switcher */}
          <div
            style={{
              display: "flex",
              background: "rgba(11, 23, 42, 0.85)",
              border: "1px solid rgba(56, 189, 248, 0.25)",
              borderRadius: "8px",
              padding: "2px",
              backdropFilter: "blur(8px)",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
            }}
          >
            <button
              onClick={() => setViewMode("3d")}
              style={{
                padding: "4px 10px",
                fontSize: "11px",
                fontWeight: "600",
                borderRadius: "6px",
                border: "none",
                background: viewMode === "3d" ? "linear-gradient(135deg, #0284c7, #2563eb)" : "transparent",
                color: viewMode === "3d" ? "#ffffff" : "#94a3b8",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              🎮 3D Lab
            </button>
            <button
              onClick={() => setViewMode("2d")}
              style={{
                padding: "4px 10px",
                fontSize: "11px",
                fontWeight: "600",
                borderRadius: "6px",
                border: "none",
                background: viewMode === "2d" ? "linear-gradient(135deg, #0284c7, #2563eb)" : "transparent",
                color: viewMode === "2d" ? "#ffffff" : "#94a3b8",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              ⚡ 2D Scope
            </button>
          </div>

          <div
            style={{
              padding: "5px 12px",
              borderRadius: "20px",
              background: powerOn ? "rgba(16, 185, 129, 0.2)" : "rgba(148, 163, 184, 0.15)",
              border: `1px solid ${powerOn ? "rgba(16, 185, 129, 0.5)" : "rgba(148, 163, 184, 0.3)"}`,
              color: powerOn ? "#34d399" : "#94a3b8",
              fontSize: "11px",
              fontWeight: "700",
              letterSpacing: "0.5px",
              boxShadow: powerOn ? "0 0 12px rgba(16, 185, 129, 0.2)" : "none",
            }}
          >
            ● {powerOn ? "CORE ENERGIZED" : "STANDBY"}
          </div>
        </div>
      </div>

      {/* ─── LIVE MEASUREMENTS HUD ─── */}
      <div
        style={{
          position: "absolute",
          right: 18,
          top: 76,
          zIndex: 20,
          width: "205px",
          padding: "14px 16px",
          borderRadius: 12,
          background: "rgba(8, 18, 33, 0.88)",
          border: "1px solid rgba(56, 189, 248, 0.25)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
          color: "white",
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
          MAGNETIC TELEMETRY
        </div>
        <Measurement label="Magnetic Field (H)" value={`${Number(field).toFixed(1)} A/m`} highlight="#fbbf24" />
        <Measurement label="Flux Density (B)" value={`${Number(magnetization).toFixed(3)} T`} highlight="#34d399" />
        <Measurement label="AC Frequency" value={`${Number(frequency).toFixed(0)} Hz`} highlight="#38bdf8" />
        <Measurement label="Core Power Loss" value={`${Number(loss).toFixed(3)} W`} highlight="#f87171" />
        <Measurement label="Core Temp" value={`${Number(temperature).toFixed(1)} °C`} />
      </div>

      {/* ─── VIEWPORT ─── */}
      {viewMode === "2d" ? (
        <HysteresisScope2D
          powerOn={powerOn}
          field={field}
          magnetization={magnetization}
          frequency={frequency}
          loss={loss}
          temperature={temperature}
          loopPoints={loopPoints}
        />
      ) : (
        <CanvasErrorBoundary
          fallback={
            <HysteresisScope2D
              powerOn={powerOn}
              field={field}
              magnetization={magnetization}
              frequency={frequency}
              loss={loss}
              temperature={temperature}
              loopPoints={loopPoints}
            />
          }
        >
          <Canvas
            camera={{ position: [8, 5.0, 11.5], fov: 42, near: 0.5, far: 60 }}
            dpr={[1, 2]}
            gl={{
              powerPreference: "high-performance",
              antialias: true,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.15,
            }}
            shadows={false}
          >
            <color attach="background" args={["#050c18"]} />
            <ambientLight intensity={1.1} color="#cde3ff" />
            <directionalLight position={[6, 12, 8]} intensity={2.6} color="#ffffff" />
            <directionalLight position={[-8, 6, -3]} intensity={2.2} color="#38bdf8" />
            <pointLight position={[0, 5, 4]} intensity={1.4} color="#93c5fd" />
            <pointLight position={[0, -0.5, 0]} intensity={0.6} color="#0284c7" />

            <Suspense fallback={null}>
              <group scale={[0.96, 0.96, 0.96]} position={[0, -0.3, 0]}>
                {/* ─── LABORATORY WORKBENCH ─── */}
                <LaboratoryBench />

                {/* ─── 1. PRECISION AC VARIAC POWER SOURCE (LEFT) ─── */}
                <BenchVariac powerOn={powerOn} frequency={frequency} field={field} />

                {/* ─── 2. LAMINATED FERROMAGNETIC CORE RIG (CENTER) ─── */}
                <MagneticApparatus
                  powerOn={powerOn}
                  field={field}
                  magnetization={magnetization}
                  frequency={frequency}
                />

                {/* ─── 3. DYNAMIC CIRCULATING MAGNETIC FLUX ─── */}
                <CirculatingFluxBeams powerOn={powerOn} magnetization={magnetization} frequency={frequency} />

                {/* ─── 4. LABORATORY CATHODE RAY OSCILLOSCOPE (RIGHT) ─── */}
                <LaboratoryCRO
                  powerOn={powerOn}
                  field={field}
                  magnetization={magnetization}
                  loopPoints={loopPoints}
                />

                {/* ─── 5. INTERCONNECTING TEST LEADS ─── */}
                <InterconnectWiring powerOn={powerOn} />
              </group>

              {/* SMOOTH UNRESTRICTED 360° ORBIT CONTROLS */}
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
                target={[0, 1.0, 0]}
                minPolarAngle={0.05}
                maxPolarAngle={Math.PI / 2.05}
              />
            </Suspense>
          </Canvas>
        </CanvasErrorBoundary>
      )}
    </div>
  );
});

/* ─── THREE.JS SUBCOMPONENTS ─── */

function Measurement({ label, value, highlight }) {
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

/*
=========================================================
LABORATORY BENCH WITH STABLE GRID (ZERO Z-FIGHTING)
=========================================================
*/
function LaboratoryBench() {
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
    <group position={[0, -0.6, 0]}>
      {/* Main Table Surface */}
      <RoundedBox args={[16.2, 0.45, 8.2]} radius={0.16} smoothness={4} position={[0, -0.85, 0]}>
        <meshStandardMaterial color="#0e1726" metalness={0.35} roughness={0.5} />
      </RoundedBox>

      {/* Table Edge Bevel Trim (Anodized Aluminum) */}
      <RoundedBox args={[16.3, 0.06, 8.3]} radius={0.03} smoothness={2} position={[0, -0.64, 0]}>
        <meshStandardMaterial color="#38bdf8" metalness={0.85} roughness={0.2} emissive="#0284c7" emissiveIntensity={0.3} />
      </RoundedBox>

      {/* Non-Depth-Writing Floor Grid */}
      <gridHelper ref={gridRef} args={[15.6, 28, "#38bdf8", "#1e3a5f"]} position={[0, -0.62, 0.1]} />
    </group>
  );
}

/*
=========================================================
1. BENCHTOP AC VARIAC POWER SUPPLY (LEFT RIG)
=========================================================
*/
function BenchVariac({ powerOn, frequency, field }) {
  const excitationVoltage = field > 0 ? (field / 12).toFixed(1) : "0.0";

  return (
    <group position={[-5.4, 0.5, 0]}>
      {/* Outer Heavy-Duty Instrument Casing */}
      <RoundedBox args={[2.6, 2.7, 2.2]} radius={0.14} smoothness={4}>
        <meshStandardMaterial color="#1e293b" metalness={0.4} roughness={0.35} />
      </RoundedBox>

      {/* Front Faceplate */}
      <RoundedBox args={[2.44, 2.52, 0.1]} radius={0.08} smoothness={2} position={[0, 0, 1.1]}>
        <meshStandardMaterial color="#0f172a" metalness={0.65} roughness={0.25} />
      </RoundedBox>

      {/* Chassis Top Carrying Handle */}
      <mesh position={[0, 1.48, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 1.6, 16]} />
        <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* AC Voltage Digital Display */}
      <RoundedBox args={[1.8, 0.62, 0.08]} radius={0.06} smoothness={2} position={[0, 0.82, 1.16]}>
        <meshStandardMaterial color="#050a12" roughness={0.2} metalness={0.8} />
      </RoundedBox>
      <CanvasLabel
        text={`${powerOn ? excitationVoltage : "0.0"} V AC`}
        subtext="EXCITATION VOLTAGE"
        color="#ef4444"
        bgColor={null}
        fontSize={22}
        subFontSize={10}
        position={[0, 0.82, 1.22]}
        scale={[1.6, 0.6, 1]}
      />

      {/* Frequency Digital Display */}
      <RoundedBox args={[1.8, 0.55, 0.08]} radius={0.06} smoothness={2} position={[0, 0.16, 1.16]}>
        <meshStandardMaterial color="#050a12" roughness={0.2} metalness={0.8} />
      </RoundedBox>
      <CanvasLabel
        text={`${frequency.toFixed(0)} Hz`}
        subtext="LINE FREQUENCY"
        color="#fbbf24"
        bgColor={null}
        fontSize={20}
        subFontSize={10}
        position={[0, 0.16, 1.22]}
        scale={[1.6, 0.55, 1]}
      />

      {/* Large Rotary Variac Knob */}
      <group position={[0, -0.48, 1.18]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.36, 0.38, 0.18, 32]} />
          <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Calibrated Dial Pointer */}
        <mesh position={[0, 0.28, 0.1]}>
          <boxGeometry args={[0.05, 0.14, 0.04]} />
          <meshStandardMaterial color="#38bdf8" />
        </mesh>
      </group>

      {/* Output Banana Binding Posts (Red + / Black -) */}
      <mesh position={[-0.6, -1.05, 1.18]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.22, 16]} />
        <meshStandardMaterial color="#dc2626" metalness={0.6} />
      </mesh>
      <mesh position={[0.6, -1.05, 1.18]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.22, 16]} />
        <meshStandardMaterial color="#18181b" metalness={0.6} />
      </mesh>

      {/* Power Rocker Switch */}
      <mesh position={[0, -1.05, 1.16]}>
        <boxGeometry args={[0.38, 0.22, 0.08]} />
        <meshStandardMaterial
          color={powerOn ? "#10b981" : "#ef4444"}
          emissive={powerOn ? "#10b981" : "#ef4444"}
          emissiveIntensity={powerOn ? 0.9 : 0.3}
        />
      </mesh>

      {powerOn && <pointLight position={[0, 0, 1.4]} color="#38bdf8" intensity={1.2} distance={3.0} />}
    </group>
  );
}

/*
=========================================================
2. LAMINATED FERROMAGNETIC CORE RIG & WINDINGS
=========================================================
*/
function MagneticApparatus({ powerOn, field, magnetization, frequency }) {
  const b = Math.abs(Number(magnetization) || 0);
  const glow = Math.min(1, b / 1.5);

  return (
    <group position={[-0.2, 1.25, 0]}>
      {/* Insulated Mounting Pedestal Stand */}
      <RoundedBox args={[4.4, 0.3, 2.2]} radius={0.08} smoothness={2} position={[0, -1.6, 0]}>
        <meshStandardMaterial color="#1e293b" metalness={0.4} roughness={0.4} />
      </RoundedBox>

      {/* ─── LAMINATED CLOSED TRANSFORMER CORE (SILICON STEEL) ─── */}
      {/* Top Limb */}
      <mesh position={[0, 1.15, 0]}>
        <boxGeometry args={[3.8, 0.65, 1.3]} />
        <meshStandardMaterial
          color="#475569"
          metalness={0.75}
          roughness={0.3}
          emissive="#1e3a5f"
          emissiveIntensity={powerOn ? glow * 0.4 : 0}
        />
      </mesh>

      {/* Bottom Limb */}
      <mesh position={[0, -1.15, 0]}>
        <boxGeometry args={[3.8, 0.65, 1.3]} />
        <meshStandardMaterial
          color="#475569"
          metalness={0.75}
          roughness={0.3}
          emissive="#1e3a5f"
          emissiveIntensity={powerOn ? glow * 0.4 : 0}
        />
      </mesh>

      {/* Left Limb (Carries Primary Magnetizing Coil) */}
      <mesh position={[-1.55, 0, 0]}>
        <boxGeometry args={[0.7, 2.95, 1.3]} />
        <meshStandardMaterial
          color="#526274"
          metalness={0.75}
          roughness={0.3}
          emissive="#1e3a5f"
          emissiveIntensity={powerOn ? glow * 0.4 : 0}
        />
      </mesh>

      {/* Right Limb (Carries Secondary Search Coil) */}
      <mesh position={[1.55, 0, 0]}>
        <boxGeometry args={[0.7, 2.95, 1.3]} />
        <meshStandardMaterial
          color="#526274"
          metalness={0.75}
          roughness={0.3}
          emissive="#1e3a5f"
          emissiveIntensity={powerOn ? glow * 0.4 : 0}
        />
      </mesh>

      {/* Core Corner Compression Bolts (Mechanical Realism) */}
      {[
        [-1.6, 1.2],
        [1.6, 1.2],
        [-1.6, -1.2],
        [1.6, -1.2],
      ].map(([x, y], idx) => (
        <mesh key={idx} position={[x, y, 0.68]}>
          <cylinderGeometry args={[0.08, 0.08, 0.12, 16]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#facc15" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}

      {/* ─── PRIMARY MAGNETIZING COIL (LEFT LIMB) ─── */}
      <PrimaryMagnetizingWinding powerOn={powerOn} field={field} />

      {/* ─── SECONDARY SEARCH COIL (RIGHT LIMB) ─── */}
      <SecondarySearchWinding powerOn={powerOn} magnetization={magnetization} />

      {/* Floating Laser-Etched Telemetry Badge */}
      <CanvasLabel
        text="LAMINATED FERROMAGNETIC CORE"
        subtext={`B = ${b.toFixed(3)} T • H = ${Number(field).toFixed(1)} A/m`}
        color="#38bdf8"
        bgColor="rgba(11, 23, 42, 0.9)"
        borderColor="rgba(56, 189, 248, 0.4)"
        fontSize={20}
        subFontSize={14}
        position={[0, 1.9, 0]}
        scale={[2.2, 0.85, 1]}
      />
    </group>
  );
}

function PrimaryMagnetizingWinding({ powerOn, field }) {
  // Spool of 10 tightly packed copper wire turns
  const turns = useMemo(() => Array.from({ length: 10 }, (_, i) => -0.7 + i * 0.155), []);

  return (
    <group position={[-1.55, 0, 0]}>
      {/* Insulated Spool Bobbin */}
      <RoundedBox args={[0.9, 1.8, 1.48]} radius={0.06} smoothness={2}>
        <meshStandardMaterial color="#0f172a" metalness={0.2} roughness={0.6} />
      </RoundedBox>

      {/* Enamelled Copper Magnet Wire Turns */}
      {turns.map((y, idx) => (
        <mesh key={idx} position={[0, y, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.82, 0.065, 12, 28]} />
          <meshStandardMaterial
            color={powerOn ? "#f59e0b" : "#b45309"}
            metalness={0.9}
            roughness={0.2}
            emissive={powerOn ? "#d97706" : "#000000"}
            emissiveIntensity={powerOn ? 0.8 : 0}
          />
        </mesh>
      ))}

      {/* Terminal Binding Posts on Bobbin */}
      <mesh position={[-0.52, 0.7, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 0.18, 16]} />
        <meshStandardMaterial color="#ef4444" metalness={0.8} />
      </mesh>
      <mesh position={[-0.52, -0.7, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 0.18, 16]} />
        <meshStandardMaterial color="#18181b" metalness={0.8} />
      </mesh>

      <CanvasLabel text="PRIMARY (N₁ = 500T)" color="#f59e0b" bgColor={null} position={[0, -1.2, 0.8]} fontSize={18} scale={[1.4, 0.5, 1]} />
    </group>
  );
}

function SecondarySearchWinding({ powerOn, magnetization }) {
  const turns = useMemo(() => Array.from({ length: 8 }, (_, i) => -0.55 + i * 0.155), []);
  const b = Math.abs(Number(magnetization) || 0);

  return (
    <group position={[1.55, 0, 0]}>
      {/* Insulated Bobbin */}
      <RoundedBox args={[0.9, 1.55, 1.48]} radius={0.06} smoothness={2}>
        <meshStandardMaterial color="#0f172a" metalness={0.2} roughness={0.6} />
      </RoundedBox>

      {/* Fine Secondary Wire Turns */}
      {turns.map((y, idx) => (
        <mesh key={idx} position={[0, y, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.82, 0.055, 12, 28]} />
          <meshStandardMaterial
            color={powerOn ? "#38bdf8" : "#0284c7"}
            metalness={0.85}
            roughness={0.25}
            emissive={powerOn ? "#0284c7" : "#000000"}
            emissiveIntensity={powerOn ? Math.min(1.2, b * 0.9) : 0}
          />
        </mesh>
      ))}

      {/* Secondary Pick-up Output Posts */}
      <mesh position={[0.52, 0.55, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 0.18, 16]} />
        <meshStandardMaterial color="#38bdf8" metalness={0.8} />
      </mesh>
      <mesh position={[0.52, -0.55, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 0.18, 16]} />
        <meshStandardMaterial color="#64748b" metalness={0.8} />
      </mesh>

      <CanvasLabel text="SEARCH (N₂ = 200T)" color="#38bdf8" bgColor={null} position={[0, -1.1, 0.8]} fontSize={18} scale={[1.4, 0.5, 1]} />
    </group>
  );
}

/*
=========================================================
3. DYNAMIC CIRCULATING MAGNETIC FLUX BEAMS
=========================================================
*/
function CirculatingFluxBeams({ powerOn, magnetization, frequency }) {
  if (!powerOn) return null;

  return (
    <group position={[-0.2, 1.25, 0]}>
      {Array.from({ length: 8 }).map((_, idx) => (
        <FluxParticle key={idx} index={idx} total={8} magnetization={magnetization} frequency={frequency} />
      ))}
    </group>
  );
}

function FluxParticle({ index, total, magnetization, frequency }) {
  const meshRef = useRef();

  // Closed rectangular core flux loop
  const pathPoints = useMemo(() => [
    new THREE.Vector3(-1.55, -1.15, 0),
    new THREE.Vector3(-1.55, 1.15, 0),
    new THREE.Vector3(0, 1.15, 0),
    new THREE.Vector3(1.55, 1.15, 0),
    new THREE.Vector3(1.55, -1.15, 0),
    new THREE.Vector3(0, -1.15, 0),
  ], []);

  const curve = useMemo(() => new THREE.CatmullRomCurve3(pathPoints, true), [pathPoints]);
  const progressRef = useRef(index / total);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const speed = 0.5 * Math.min(2.5, Math.max(0.5, (frequency / 50)));
    progressRef.current = (progressRef.current + speed * delta) % 1;
    const pt = curve.getPoint(progressRef.current);
    meshRef.current.position.copy(pt);
  });

  const b = Math.abs(Number(magnetization) || 0);

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.075, 12, 12]} />
      <meshBasicMaterial color={b > 0.8 ? "#38bdf8" : "#818cf8"} />
    </mesh>
  );
}

/*
=========================================================
4. LABORATORY CATHODE RAY OSCILLOSCOPE (CRO) (RIGHT RIG)
=========================================================
*/
function LaboratoryCRO({ powerOn, field, magnetization, loopPoints }) {
  const screenPoints = useMemo(() => {
    if (Array.isArray(loopPoints) && loopPoints.length > 1) {
      const points = loopPoints.slice(-160);
      let maxH = 1;
      let maxB = 1;
      points.forEach((p) => {
        maxH = Math.max(maxH, Math.abs(Number(p.h) || 0));
        maxB = Math.max(maxB, Math.abs(Number(p.b) || 0));
      });
      return points.map((p) => [
        ((Number(p.h) || 0) / maxH) * 1.55,
        ((Number(p.b) || 0) / maxB) * 1.15,
        0,
      ]);
    }
    const fallback = [];
    for (let i = 0; i <= 64; i++) {
      const t = (i / 64) * Math.PI * 2;
      const x = Math.sin(t) * 1.5;
      const y = Math.tanh(1.8 * Math.sin(t - 0.35)) * 1.1;
      fallback.push([x, y, 0]);
    }
    return fallback;
  }, [loopPoints]);

  return (
    <group position={[4.6, 0.75, 0]}>
      {/* Heavy Benchtop Oscilloscope Housing */}
      <RoundedBox args={[3.2, 3.1, 2.2]} radius={0.16} smoothness={4}>
        <meshStandardMaterial color="#1e293b" metalness={0.4} roughness={0.35} />
      </RoundedBox>

      {/* Front Control Panel */}
      <RoundedBox args={[3.02, 2.92, 0.1]} radius={0.08} smoothness={2} position={[0, 0, 1.1]}>
        <meshStandardMaterial color="#0f172a" metalness={0.65} roughness={0.25} />
      </RoundedBox>

      {/* Oscilloscope Handle */}
      <mesh position={[0, 1.66, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 1.8, 16]} />
        <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* Recessed CRT Glass Screen Bezel */}
      <RoundedBox args={[2.7, 1.9, 0.12]} radius={0.1} smoothness={3} position={[0, 0.42, 1.14]}>
        <meshStandardMaterial color="#021c13" emissive="#032d1e" emissiveIntensity={0.6} roughness={0.15} />
      </RoundedBox>

      {/* CRT Screen Graticule / Divisions Plane */}
      <mesh position={[0, 0.42, 1.21]}>
        <planeGeometry args={[2.55, 1.75]} />
        <meshStandardMaterial color="#021810" roughness={0.1} />
      </mesh>

      {/* Graticule Crosshairs */}
      <Line points={[[-1.25, 0.42, 1.215], [1.25, 0.42, 1.215]]} color="rgba(16, 185, 129, 0.35)" lineWidth={1.5} />
      <Line points={[[0, -0.42, 1.215], [0, 1.26, 1.215]]} color="rgba(16, 185, 129, 0.35)" lineWidth={1.5} />

      {/* ─── LIVE HYSTERESIS B-H TRACE ON SCREEN ─── */}
      <group position={[0, 0.42, 1.22]}>
        <Line
          points={screenPoints}
          color={powerOn ? "#34d399" : "#065f46"}
          lineWidth={3.5}
        />
        {/* Animated Sweep / Focus Glow Point */}
        {powerOn && (
          <mesh position={[screenPoints[0][0], screenPoints[0][1], 0.01]}>
            <circleGeometry args={[0.045, 16]} />
            <meshBasicMaterial color="#a7f3d0" />
          </mesh>
        )}
      </group>

      {/* Screen Labels */}
      <CanvasLabel text="CRO • X-Y B-H TRACE" color="#34d399" bgColor={null} position={[0, 1.18, 1.22]} fontSize={16} scale={[1.6, 0.45, 1]} />
      <CanvasLabel text="X: FIELD (H) • Y: FLUX (B)" color="#6ee7b7" bgColor={null} position={[0, -0.32, 1.22]} fontSize={14} scale={[1.6, 0.4, 1]} />

      {/* Lower Control Section: Knobs & BNC Inputs */}
      <group position={[0, -0.92, 1.18]}>
        {/* Volts/Div and Time/Div Knobs */}
        <Knob position={[-1.0, 0.1, 0]} label="V/DIV" />
        <Knob position={[-0.4, 0.1, 0]} label="TIME" />
        <Knob position={[0.2, 0.1, 0]} label="INTEN" />
        <Knob position={[0.8, 0.1, 0]} label="FOCUS" />

        {/* Dual BNC Inputs (Channel X & Channel Y) */}
        <BNCConnector position={[-0.8, -0.35, 0]} color="#ef4444" label="CH1-X" />
        <BNCConnector position={[0.6, -0.35, 0]} color="#38bdf8" label="CH2-Y" />
      </group>
    </group>
  );
}

function Knob({ position }) {
  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.2, 0.12, 24]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Pointer Notch */}
      <mesh position={[0, 0.12, 0.07]}>
        <boxGeometry args={[0.03, 0.08, 0.03]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
    </group>
  );
}

function BNCConnector({ position, color, label }) {
  return (
    <group position={position}>
      {/* Metal BNC Outer Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.18, 20]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.15} />
      </mesh>
      {/* Insulated Inner Collar */}
      <mesh position={[0, 0, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.06, 16]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
      </mesh>
    </group>
  );
}

/*
=========================================================
5. INTERCONNECTING TEST LEADS & COAXIAL CABLES
=========================================================
*/
function InterconnectWiring({ powerOn }) {
  const acWireColor = powerOn ? "#ef4444" : "#7f1d1d";
  const returnWireColor = powerOn ? "#10b981" : "#064e3b";
  const croSignalColor = powerOn ? "#38bdf8" : "#1e3a5f";

  return (
    <group>
      {/* 1. AC Variac (+) to Primary Coil (+) */}
      <Line
        points={[
          [-4.8, -0.55, 1.18],
          [-3.8, -0.4, 0.8],
          [-2.8, 0.5, 0.4],
          [-2.07, 1.95, 0],
        ]}
        color={acWireColor}
        lineWidth={4.5}
      />

      {/* 2. AC Variac (-) to Primary Coil (-) */}
      <Line
        points={[
          [-6.0, -0.55, 1.18],
          [-4.5, -0.9, 0.8],
          [-3.0, -0.3, 0.4],
          [-2.07, 0.55, 0],
        ]}
        color={returnWireColor}
        lineWidth={4.5}
      />

      {/* 3. Primary Sampling Resistor to CRO CH1 (X - Field) */}
      <Line
        points={[
          [-2.07, 0.55, 0],
          [-1.5, -0.4, 0.9],
          [1.5, -0.3, 1.3],
          [3.8, -0.17, 1.18],
        ]}
        color="#fbbf24"
        lineWidth={3.5}
      />

      {/* 4. Secondary Search Coil to CRO CH2 (Y - Flux through Integrator) */}
      <Line
        points={[
          [1.87, 1.8, 0],
          [2.6, 1.4, 0.5],
          [3.5, 0.4, 0.9],
          [5.2, -0.17, 1.18],
        ]}
        color={croSignalColor}
        lineWidth={3.5}
      />
    </group>
  );
}