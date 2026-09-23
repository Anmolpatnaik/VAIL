import React, { useRef, useEffect, useState, Suspense, Component } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useLabPerformance } from './utils/useLabPerformance';

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
    console.warn("WebGL 3D Context Error in OpAmp:", err);
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
2D HIGH-PERFORMANCE OP-AMP SCHEMATIC (Zero GPU Overhead)
=========================================================
*/
function OpAmpSchematic2D({ vin = 0, vout = 0, isSaturated = false, config = "inverting", isRunning = false }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let phase = 0;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;

      // Dark PCB Background
      ctx.fillStyle = "#030c14";
      ctx.fillRect(0, 0, w, h);

      // Subtle engineering blueprint grid
      ctx.strokeStyle = "rgba(56, 189, 248, 0.08)";
      ctx.lineWidth = 1;
      const step = 30;
      for (let x = 0; x < w; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Title & Telemetry Header
      ctx.fillStyle = "#94a3b8";
      ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText(`IC 741 OPERATIONAL AMPLIFIER • ${config ? config.toUpperCase() : "INVERTING"} MODE`, 24, 32);

      // Op-Amp Triangle Geometry
      const triX = w * 0.52;
      const triY = h * 0.5;
      const triW = 140;
      const triH = 150;

      // Draw Triangle body
      ctx.fillStyle = "#0f1f33";
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(triX - triW / 2, triY - triH / 2); // Top left
      ctx.lineTo(triX - triW / 2, triY + triH / 2); // Bottom left
      ctx.lineTo(triX + triW / 2, triY);            // Output apex
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Op-Amp Symbol Label
      ctx.fillStyle = "#f8fafc";
      ctx.font = "bold 15px monospace";
      ctx.textAlign = "center";
      ctx.fillText("μA741", triX - 15, triY - 5);
      ctx.font = "11px monospace";
      ctx.fillStyle = "#64748b";
      ctx.fillText("OP-AMP", triX - 15, triY + 14);

      // Input Terminals
      // Inverting (-) at top
      const invY = triY - 40;
      // Non-Inverting (+) at bottom
      const nonInvY = triY + 40;
      const inputX = triX - triW / 2;

      // Terminal Signs
      ctx.font = "bold 20px monospace";
      ctx.fillStyle = "#ef4444";
      ctx.fillText("−", inputX + 16, invY + 6);
      ctx.fillStyle = "#22c55e";
      ctx.fillText("+", inputX + 16, nonInvY + 6);

      // Input Wires & Components
      const isInv = config !== "non-inverting";
      const activeInputY = isInv ? invY : nonInvY;
      const gndInputY = isInv ? nonInvY : invY;

      // Active Input Line with Resistor Rin
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(80, activeInputY);
      ctx.lineTo(inputX - 120, activeInputY);
      ctx.stroke();

      // Rin Resistor box
      const rinX = inputX - 100;
      ctx.fillStyle = "#d97706";
      ctx.strokeStyle = "#fbbf24";
      ctx.fillRect(rinX, activeInputY - 12, 50, 24);
      ctx.strokeRect(rinX, activeInputY - 12, 50, 24);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 10px monospace";
      ctx.fillText("Rin", rinX + 25, activeInputY + 4);

      ctx.beginPath();
      ctx.moveTo(rinX + 50, activeInputY);
      ctx.lineTo(inputX, activeInputY);
      ctx.stroke();

      // Ground connected to passive terminal
      ctx.beginPath();
      ctx.moveTo(inputX, gndInputY);
      ctx.lineTo(inputX - 40, gndInputY);
      ctx.lineTo(inputX - 40, gndInputY + 30);
      ctx.stroke();

      // Ground Symbol
      const gx = inputX - 40;
      const gy = gndInputY + 30;
      ctx.beginPath();
      ctx.moveTo(gx - 14, gy);
      ctx.lineTo(gx + 14, gy);
      ctx.moveTo(gx - 9, gy + 5);
      ctx.lineTo(gx + 9, gy + 5);
      ctx.moveTo(gx - 4, gy + 10);
      ctx.lineTo(gx + 4, gy + 10);
      ctx.stroke();

      // Feedback Loop (Rf) from Output to Inverting Terminal
      const outX = triX + triW / 2;
      const outY = triY;
      const loopY = triY - 95;

      ctx.strokeStyle = "#e2e8f0";
      ctx.beginPath();
      ctx.moveTo(inputX - 25, invY);
      ctx.lineTo(inputX - 25, loopY);
      ctx.lineTo(triX - 25, loopY);
      ctx.stroke();

      // Rf Resistor Box
      ctx.fillStyle = "#0284c7";
      ctx.strokeStyle = "#38bdf8";
      ctx.fillRect(triX - 25, loopY - 12, 50, 24);
      ctx.strokeRect(triX - 25, loopY - 12, 50, 24);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 10px monospace";
      ctx.fillText("Rf", triX, loopY + 4);

      ctx.beginPath();
      ctx.moveTo(triX + 25, loopY);
      ctx.lineTo(outX + 40, loopY);
      ctx.lineTo(outX + 40, outY);
      ctx.lineTo(outX, outY);
      ctx.stroke();

      // Output wire to terminal
      ctx.beginPath();
      ctx.moveTo(outX, outY);
      ctx.lineTo(w - 90, outY);
      ctx.stroke();

      // Live animated signal particles if running
      if (isRunning) {
        phase += 0.08;
        const particleX = 80 + ((phase * 25) % (inputX - 80));
        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.arc(particleX, activeInputY, 4, 0, Math.PI * 2);
        ctx.fill();

        const outParticleX = outX + ((phase * 35) % (w - 90 - outX));
        ctx.fillStyle = isSaturated ? "#ef4444" : "#22c55e";
        ctx.beginPath();
        ctx.arc(outParticleX, outY, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Input Source Gauge Box
      ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
      ctx.strokeStyle = "#475569";
      ctx.fillRect(20, activeInputY - 35, 60, 70);
      ctx.strokeRect(20, activeInputY - 35, 60, 70);
      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 11px monospace";
      ctx.fillText("Vin", 50, activeInputY - 15);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 13px monospace";
      ctx.fillText(`${Number(vin).toFixed(2)}V`, 50, activeInputY + 8);
      ctx.fillStyle = "#64748b";
      ctx.font = "9px sans-serif";
      ctx.fillText("SIGNAL", 50, activeInputY + 24);

      // Output Meter & LED Indicator
      const ledColor = !isRunning ? "#64748b" : (isSaturated ? "#ef4444" : "#22c55e");
      ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
      ctx.strokeStyle = isSaturated ? "#ef4444" : "#22c55e";
      ctx.fillRect(w - 85, outY - 45, 75, 90);
      ctx.strokeRect(w - 85, outY - 45, 75, 90);

      // Status LED Circle
      ctx.fillStyle = ledColor;
      ctx.shadowColor = ledColor;
      ctx.shadowBlur = isRunning ? 10 : 0;
      ctx.beginPath();
      ctx.arc(w - 48, outY - 25, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = "#94a3b8";
      ctx.font = "bold 10px monospace";
      ctx.fillText("Vout", w - 48, outY - 5);
      ctx.fillStyle = isSaturated ? "#fca5a5" : "#86efac";
      ctx.font = "bold 15px monospace";
      ctx.fillText(`${Number(vout).toFixed(2)}V`, w - 48, outY + 16);
      ctx.fillStyle = "#64748b";
      ctx.font = "8px sans-serif";
      ctx.fillText(isSaturated ? "SATURATED" : (isRunning ? "LINEAR" : "IDLE"), w - 48, outY + 32);

      // Bottom Mini Waveform Scope
      const scopeX = 40;
      const scopeY = h - 90;
      const scopeW = w - 80;
      const scopeH = 65;

      ctx.fillStyle = "#02120e";
      ctx.strokeStyle = "rgba(34, 197, 94, 0.3)";
      ctx.fillRect(scopeX, scopeY, scopeW, scopeH);
      ctx.strokeRect(scopeX, scopeY, scopeW, scopeH);

      // Zero axis line
      ctx.strokeStyle = "rgba(52, 211, 153, 0.25)";
      ctx.beginPath();
      ctx.moveTo(scopeX, scopeY + scopeH / 2);
      ctx.lineTo(scopeX + scopeW, scopeY + scopeH / 2);
      ctx.stroke();

      // Live sine waves
      if (isRunning) {
        // Input trace (Cyan)
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = 0; x < scopeW; x++) {
          const t = (x / scopeW) * 4 * Math.PI + phase;
          const y = (scopeY + scopeH / 2) - Math.sin(t) * Math.min(22, Math.abs(vin) * 8);
          if (x === 0) ctx.moveTo(scopeX + x, y);
          else ctx.lineTo(scopeX + x, y);
        }
        ctx.stroke();

        // Output trace (Green or Clamped Red)
        ctx.strokeStyle = isSaturated ? "#ef4444" : "#4ade80";
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        for (let x = 0; x < scopeW; x++) {
          const t = (x / scopeW) * 4 * Math.PI + phase + (isInv ? Math.PI : 0);
          let val = Math.sin(t) * Math.abs(vout) * 3;
          if (isSaturated) {
            val = Math.max(-26, Math.min(26, val)); // Clamped flat tops
          }
          const y = (scopeY + scopeH / 2) - val;
          if (x === 0) ctx.moveTo(scopeX + x, y);
          else ctx.lineTo(scopeX + x, y);
        }
        ctx.stroke();
      }

      ctx.fillStyle = "#38bdf8";
      ctx.font = "9px monospace";
      ctx.textAlign = "left";
      ctx.fillText("CH1: Vin", scopeX + 8, scopeY + 14);
      ctx.fillStyle = isSaturated ? "#ef4444" : "#4ade80";
      ctx.fillText("CH2: Vout", scopeX + 70, scopeY + 14);

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [vin, vout, isSaturated, config, isRunning]);

  return (
    <canvas
      ref={canvasRef}
      width={720}
      height={480}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        background: "#030c14",
      }}
    />
  );
}

/*
=========================================================
3D OP-AMP SCENE (Optimized & Zero Unneeded Passes)
=========================================================
*/
function OpAmpScene({ vin, vout, isSaturated, config, isRunning }) {
  const chipRef = useRef();
  const ledRef = useRef();
  const pulseRef = useRef();

  useFrame((state) => {
    try {
      const time = state.clock.getElapsedTime();
      if (chipRef.current) {
        chipRef.current.position.y = isRunning ? (0.05 + Math.sin(time * 2) * 0.015) : 0.05;
      }
      if (ledRef.current && ledRef.current.material) {
        ledRef.current.material.opacity = isRunning ? (0.6 + Math.sin(time * 12) * 0.4) : 0.2;
      }
      if (pulseRef.current) {
        pulseRef.current.visible = isRunning;
        if (isRunning) {
          pulseRef.current.position.x = -1.5 + ((time * 3) % 3.0);
        }
      }
    } catch (e) {
      // Ignored: animation frame errors during unmount
    }
  });

  const ledColor = !isRunning ? "#64748b" : (isSaturated ? "#ef4444" : "#22c55e");

  return (
    <>
      <ambientLight intensity={1.3} />
      <directionalLight position={[6, 12, 6]} intensity={2.0} />
      <pointLight position={[-4, 4, -4]} intensity={0.9} color="#38bdf8" />
      <OrbitControls makeDefault enableZoom={true} zoomSpeed={1.2} enableDamping={true} dampingFactor={0.08} maxPolarAngle={Math.PI / 2 + 0.02} minDistance={2.5} maxDistance={20} />

      {/* PCB Base Board */}
      <mesh position={[0, -0.6, 0]}>
        <boxGeometry args={[5.5, 0.2, 4.2]} />
        <meshStandardMaterial color="#064e3b" roughness={0.4} metalness={0.1} />
      </mesh>

      {/* Gold Copper Traces */}
      <group position={[0, -0.48, 0]}>
        <mesh>
          <boxGeometry args={[4.8, 0.01, 3.5]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* Capacitors */}
      <mesh position={[-1.8, -0.35, -1.2]}>
        <cylinderGeometry args={[0.15, 0.15, 0.4, 16]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[1.8, -0.35, -1.2]}>
        <cylinderGeometry args={[0.15, 0.15, 0.4, 16]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Resistor Component Block */}
      <mesh position={[0, -0.38, -1.3]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshStandardMaterial color="#ca8a04" roughness={0.4} />
      </mesh>

      {/* IC 741 Op-Amp Chip Package */}
      <group ref={chipRef} position={[0, 0.05, 0]}>
        <mesh>
          <boxGeometry args={[1.8, 0.3, 1.0]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.5} />
        </mesh>
        <mesh position={[-0.7, 0.16, 0]}>
          <boxGeometry args={[0.2, 0.05, 0.3]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        <mesh position={[0, 0.16, 0]}>
          <boxGeometry args={[1.0, 0.01, 0.5]} />
          <meshBasicMaterial color="#e2e8f0" />
        </mesh>

        {/* Metal Pins */}
        {[-0.6, -0.2, 0.2, 0.6].map((x, i) => (
          <React.Fragment key={i}>
            <mesh position={[x, -0.15, -0.55]}>
              <boxGeometry args={[0.1, 0.05, 0.4]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.1} />
            </mesh>
            <mesh position={[x, -0.15, 0.55]}>
              <boxGeometry args={[0.1, 0.05, 0.4]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.1} />
            </mesh>
          </React.Fragment>
        ))}
      </group>

      {/* Signal Flow Particle */}
      <mesh ref={pulseRef} position={[-1.5, -0.4, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>

      {/* Status LED Indicator */}
      <group position={[1.8, -0.4, 1.2]}>
        <mesh>
          <cylinderGeometry args={[0.18, 0.18, 0.25, 16]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        <mesh ref={ledRef} position={[0, 0.14, 0]}>
          <sphereGeometry args={[0.13, 16, 16]} />
          <meshBasicMaterial color={ledColor} />
        </mesh>
        <pointLight position={[0, 0.3, 0]} color={ledColor} intensity={!isRunning ? 0.1 : (isSaturated ? 1.5 : 0.8)} distance={2.5} />
      </group>
    </>
  );
}

/*
=========================================================
MAIN OPAMP COMPONENT WITH 2D/3D PERFORMANCE SWITCHER
=========================================================
*/
const OpAmp3D = React.memo(function OpAmp3D({ vin, vout, isSaturated, config, isRunning }) {
  const { mode: viewMode, setMode: setViewMode } = useLabPerformance();

  return (
    <div style={{ width: "100%", height: "550px", position: "relative", borderRadius: "12px", overflow: "hidden", background: "#030712" }}>
      {/* Performance & View Toolbar */}
      <div
        style={{
          position: "absolute",
          top: 12,
          right: 14,
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "rgba(15, 23, 42, 0.85)",
          padding: "4px 8px",
          borderRadius: "8px",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(6px)",
        }}
      >
        <button
          onClick={() => setViewMode("3d")}
          title="Interactive 3D Hardware Board"
          style={{
            padding: "3px 8px",
            fontSize: "10px",
            fontWeight: "600",
            borderRadius: "5px",
            border: "none",
            background: viewMode === "3d" ? "linear-gradient(135deg, #0284c7, #2563eb)" : "transparent",
            color: viewMode === "3d" ? "#ffffff" : "#94a3b8",
            cursor: "pointer",
          }}
        >
          🎮 3D View
        </button>
        <button
          onClick={() => setViewMode("2d")}
          title="Ultra-fast, zero-GPU overhead 2D schematic mode"
          style={{
            padding: "3px 8px",
            fontSize: "10px",
            fontWeight: "600",
            borderRadius: "5px",
            border: "none",
            background: viewMode === "2d" ? "linear-gradient(135deg, #0284c7, #2563eb)" : "transparent",
            color: viewMode === "2d" ? "#ffffff" : "#94a3b8",
            cursor: "pointer",
          }}
        >
          ⚡ 2D Schematic
        </button>
      </div>

      {viewMode === "2d" ? (
        <OpAmpSchematic2D vin={vin} vout={vout} isSaturated={isSaturated} config={config} isRunning={isRunning} />
      ) : (
        <CanvasErrorBoundary
          fallback={<OpAmpSchematic2D vin={vin} vout={vout} isSaturated={isSaturated} config={config} isRunning={isRunning} />}
        >
          <Canvas
            gl={{ powerPreference: "default", antialias: true, failIfMajorPerformanceCaveat: false, preserveDrawingBuffer: false }}
            dpr={1}
            performance={{ min: 0.5 }}
            camera={{ position: [3, 3.5, 4.5], fov: 45 }}
            style={{ background: "#030712" }}
            shadows={false}
            onCreated={({ gl }) => {
              const handleContextLost = (e) => {
                e.preventDefault();
                console.warn("WebGL Context Lost in OpAmp — Retaining 3D view");
              };
              gl.domElement.addEventListener("webglcontextlost", handleContextLost, false);
            }}
          >
            <Suspense fallback={null}>
              <OpAmpScene vin={vin} vout={vout} isSaturated={isSaturated} config={config} isRunning={isRunning} />
            </Suspense>
          </Canvas>
        </CanvasErrorBoundary>
      )}
    </div>
  );
});

export default OpAmp3D;