import React, { useRef, useMemo, Suspense, useEffect, Component } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, QuadraticBezierLine, RoundedBox, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useLabPerformance } from './utils/useLabPerformance';

/*
=========================================================
CANVAS LABEL (Zero Network Requests, High-DPI Local Texture)
=========================================================
*/
function CanvasLabel({ text, color = "#10b981", bgColor = null, fontSize = 26, position = [0, 0, 0], scale = [1.2, 0.45, 1] }) {
  const canvasRef = useRef(null);
  const textureRef = useRef(null);

  if (!canvasRef.current) {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 96;
    canvasRef.current = canvas;
    const tex = new THREE.CanvasTexture(canvas);
    tex.generateMipmaps = false;
    tex.minFilter = THREE.LinearFilter;
    textureRef.current = tex;
  }

  // Update existing canvas pixels without reallocating GPU texture!
  useEffect(() => {
    const canvas = canvasRef.current;
    const tex = textureRef.current;
    if (!canvas || !tex) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 256, 96);

    if (bgColor) {
      ctx.fillStyle = bgColor;
      ctx.beginPath();
      ctx.roundRect(8, 8, 240, 80, 12);
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    ctx.fillStyle = color;
    ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(text), 128, 48);
    tex.needsUpdate = true;
  }, [text, color, bgColor, fontSize]);

  // Clean disposal on unmount
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
    console.warn("WebGL 3D Context Error in Vibration String:", err);
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
2D STANDING WAVE SCHEMATIC (Zero GPU Overhead)
=========================================================
*/
function VibrationString2D({ params, results, isPlaying }) {
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

      // Dark Laboratory Bench Background
      ctx.fillStyle = "#030c17";
      ctx.fillRect(0, 0, w, h);

      // Lab Blueprint Grid
      ctx.strokeStyle = "rgba(56, 189, 248, 0.08)";
      ctx.lineWidth = 1;
      const gridSpacing = 28;
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

      // Physics parameters
      const n = results?.physics?.harmonic_number_n || params?.mode || 1;
      const freq = results?.physics?.frequency_hz || 0;
      const tension = params?.tension || 4.0;
      const massGrams = Math.round((tension / 9.8) * 1000);
      const isResonant = Boolean(results?.physics?.is_resonant);

      // Title & Telemetry Header
      ctx.fillStyle = "#94a3b8";
      ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`MELDE'S STRING EXPERIMENT • STANDING WAVE HARMONIC n = ${n}`, 24, 30);

      // Left: Signal Generator & Driver Peg
      const genX = 40;
      const genY = 130;
      const genW = 90;
      const genH = 120;

      ctx.fillStyle = "#1e293b";
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 2;
      ctx.fillRect(genX, genY, genW, genH);
      ctx.strokeRect(genX, genY, genW, genH);

      // Generator Screen
      ctx.fillStyle = "#090d16";
      ctx.fillRect(genX + 10, genY + 14, genW - 20, 36);
      ctx.fillStyle = isPlaying ? "#10b981" : "#64748b";
      ctx.font = "bold 13px monospace";
      ctx.textAlign = "center";
      ctx.fillText(isPlaying ? `${freq.toFixed(1)} Hz` : "OFF", genX + genW / 2, genY + 38);

      // Generator Knobs
      ctx.fillStyle = "#334155";
      ctx.beginPath();
      ctx.arc(genX + 28, genY + 75, 12, 0, Math.PI * 2);
      ctx.arc(genX + 62, genY + 75, 12, 0, Math.PI * 2);
      ctx.fill();

      // Driver Vibrator Peg
      const pegX = genX + genW;
      const pegY = 190;
      ctx.fillStyle = "#475569";
      ctx.fillRect(pegX, pegY - 14, 25, 28);
      ctx.fillStyle = "#e2e8f0";
      ctx.fillRect(pegX + 25, pegY - 4, 10, 8);

      // Right: Pulley & Slotted Weights
      const pulleyX = w - 90;
      const pulleyY = 190;
      const pulleyR = 18;

      ctx.fillStyle = "#d97706";
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pulleyX, pulleyY, pulleyR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.arc(pulleyX, pulleyY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Hanging cord and weight carrier
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(pulleyX + pulleyR, pulleyY);
      ctx.lineTo(pulleyX + pulleyR, pulleyY + 70);
      ctx.stroke();

      // Slotted Mass Discs
      const numDiscs = Math.min(6, Math.max(1, Math.round(massGrams / 50)));
      for (let i = 0; i < numDiscs; i++) {
        ctx.fillStyle = "#94a3b8";
        ctx.strokeStyle = "#cbd5e1";
        ctx.fillRect(pulleyX + pulleyR - 15, pulleyY + 70 + i * 8, 30, 6);
        ctx.strokeRect(pulleyX + pulleyR - 15, pulleyY + 70 + i * 8, 30, 6);
      }

      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 11px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`${massGrams} g (${tension.toFixed(1)} N)`, pulleyX + pulleyR, pulleyY + 130);

      // Center: The Vibrating String
      const strStartX = pegX + 35;
      const strEndX = pulleyX;
      const strLen = strEndX - strStartX;
      const strY = 190;

      // Animate phase if playing
      if (isPlaying) {
        phase += 0.12;
      }

      // Draw Standing Wave envelope & dynamic string
      const numPoints = 200;
      const baseAmp = isPlaying ? (isResonant ? 32 : 18) : 0;
      const timeFactor = isPlaying ? Math.cos(phase) : 0;

      // Outer ghost envelopes (antinode envelope bounds)
      if (isPlaying && baseAmp > 0) {
        ctx.strokeStyle = "rgba(56, 189, 248, 0.22)";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);

        // Upper envelope
        ctx.beginPath();
        for (let i = 0; i <= numPoints; i++) {
          const u = i / numPoints;
          const x = strStartX + u * strLen;
          const y = strY - Math.abs(Math.sin(n * Math.PI * u)) * baseAmp;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Lower envelope
        ctx.beginPath();
        for (let i = 0; i <= numPoints; i++) {
          const u = i / numPoints;
          const x = strStartX + u * strLen;
          const y = strY + Math.abs(Math.sin(n * Math.PI * u)) * baseAmp;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Dynamic Vibrating String
      ctx.strokeStyle = isResonant ? "#38bdf8" : "#94a3b8";
      ctx.shadowColor = isResonant ? "#38bdf8" : "transparent";
      ctx.shadowBlur = isResonant ? 10 : 0;
      ctx.lineWidth = isResonant ? 2.8 : 2.0;

      ctx.beginPath();
      for (let i = 0; i <= numPoints; i++) {
        const u = i / numPoints;
        const x = strStartX + u * strLen;
        const envelope = Math.sin(n * Math.PI * u);
        const y = strY + envelope * baseAmp * timeFactor;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Label Nodes (N) and Antinodes (A)
      ctx.font = "bold 11px monospace";
      for (let k = 0; k <= n; k++) {
        // Node at k / n
        const nodeX = strStartX + (k / n) * strLen;
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(nodeX, strY, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillText("N", nodeX, strY - 14);

        // Antinode between k and k + 1
        if (k < n) {
          const antiX = strStartX + ((k + 0.5) / n) * strLen;
          ctx.fillStyle = "#38bdf8";
          ctx.fillText("A", antiX, strY + 44);
        }
      }

      // Calibrated Meter Ruler at bottom of string
      const rulerY = 270;
      ctx.fillStyle = "#fef08a";
      ctx.fillRect(strStartX, rulerY, strLen, 24);
      ctx.strokeStyle = "#ca8a04";
      ctx.lineWidth = 1;
      ctx.strokeRect(strStartX, rulerY, strLen, 24);

      // Ruler ticks
      ctx.fillStyle = "#000000";
      ctx.font = "9px monospace";
      ctx.textAlign = "center";
      const totalTicks = 10;
      for (let t = 0; t <= totalTicks; t++) {
        const tx = strStartX + (t / totalTicks) * strLen;
        ctx.beginPath();
        ctx.moveTo(tx, rulerY);
        ctx.lineTo(tx, rulerY + 8);
        ctx.stroke();
        ctx.fillText(`${(t * 10).toFixed(0)}cm`, tx, rulerY + 18);
      }

      // Status Pill
      ctx.textAlign = "left";
      ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
      ctx.strokeStyle = isResonant ? "#38bdf8" : "#475569";
      ctx.fillRect(24, h - 60, 160, 42);
      ctx.strokeRect(24, h - 60, 160, 42);

      ctx.fillStyle = isResonant ? "#38bdf8" : "#94a3b8";
      ctx.font = "bold 11px monospace";
      ctx.fillText(isResonant ? "● RESONANCE ACHIEVED" : "○ OFF RESONANCE", 36, h - 42);
      ctx.fillStyle = "#64748b";
      ctx.font = "9px monospace";
      ctx.fillText(`v = ${results?.physics?.wave_speed_m_per_s?.toFixed(1) || "63.2"} m/s`, 36, h - 26);

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [params, results, isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      width={720}
      height={440}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        background: "#030c17",
      }}
    />
  );
}

// --- 3D LAB EQUIPMENT COMPONENTS ---

const DigitalFunctionGenerator = ({ frequency, isResonant, isPlaying }) => (
  <group position={[-5.8, 0.72, -1.3]}>
    {/* Main Benchtop Instrument Housing */}
    <RoundedBox args={[2.0, 1.4, 1.3]} radius={0.08} smoothness={4}>
      <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.35} />
    </RoundedBox>

    {/* Protective Corner Rubber Bumpers */}
    {[-0.98, 0.98].map((x, xi) =>
      [-0.68, 0.68].map((y, yi) => (
        <mesh key={`${xi}-${yi}`} position={[x, y, 0]}>
          <boxGeometry args={[0.08, 0.14, 1.34]} />
          <meshStandardMaterial color="#0f172a" roughness={0.9} />
        </mesh>
      ))
    )}

    {/* Carrying Handle on Top */}
    <mesh position={[0, 0.78, 0]}>
      <boxGeometry args={[1.2, 0.06, 0.12]} />
      <meshStandardMaterial color="#475569" metalness={0.8} />
    </mesh>

    {/* Front Control Faceplate */}
    <mesh position={[0, 0, 0.66]}>
      <planeGeometry args={[1.88, 1.28]} />
      <meshStandardMaterial color="#0f172a" metalness={0.6} roughness={0.3} />
    </mesh>

    {/* Digital OLED/LCD Frequency Display Window */}
    <RoundedBox args={[1.2, 0.55, 0.04]} radius={0.03} smoothness={2} position={[-0.25, 0.28, 0.67]}>
      <meshStandardMaterial color="#021a12" roughness={0.2} />
    </RoundedBox>

    <CanvasLabel
      text={isPlaying && frequency ? `${frequency.toFixed(1)} Hz` : "0.0 Hz"}
      color="#10b981"
      bgColor="rgba(2, 26, 18, 0.85)"
      position={[-0.25, 0.35, 0.71]}
      fontSize={26}
      scale={[0.95, 0.35, 1]}
    />

    <CanvasLabel
      text={isResonant ? "● LOCKED RESONANCE" : "∿ SINE • 5.0 Vpp"}
      color={isResonant ? "#38bdf8" : "#6ee7b7"}
      position={[-0.25, 0.15, 0.71]}
      fontSize={18}
      scale={[0.9, 0.28, 1]}
    />

    {/* Rotary Frequency Adjustment Knob */}
    <group position={[0.55, 0.28, 0.68]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.24, 0.14, 28]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Aluminum Knob Face Cap with Pointer */}
      <mesh position={[0, 0, 0.075]}>
        <cylinderGeometry args={[0.18, 0.18, 0.02, 24]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.11, 0.08]}>
        <boxGeometry args={[0.02, 0.06, 0.02]} />
        <meshStandardMaterial color="#38bdf8" />
      </mesh>
    </group>

    {/* Lower Control Section: Push Buttons & Range Selector */}
    {[-0.65, -0.35, -0.05, 0.25].map((bx, bi) => (
      <mesh key={bi} position={[bx, -0.2, 0.67]}>
        <boxGeometry args={[0.14, 0.1, 0.04]} />
        <meshStandardMaterial color="#334155" roughness={0.6} />
      </mesh>
    ))}

    {/* Dual BNC Output Connectors (Main Out 50Ω and Ground) */}
    <group position={[0.55, -0.32, 0.68]}>
      {/* Outer Metal Collar */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.12, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.15} />
      </mesh>
      {/* Red Insulator Ring */}
      <mesh position={[0, 0, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.04, 16]} />
        <meshStandardMaterial color="#ef4444" roughness={0.4} />
      </mesh>
    </group>

    <group position={[0.25, -0.32, 0.68]}>
      {/* Ground BNC */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.12, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.15} />
      </mesh>
      <mesh position={[0, 0, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.04, 16]} />
        <meshStandardMaterial color="#0f172a" roughness={0.4} />
      </mesh>
    </group>

    {/* Power Switch & Green Pilot LED */}
    <mesh position={[-0.7, -0.42, 0.67]}>
      <sphereGeometry args={[0.04, 16, 16]} />
      <meshStandardMaterial
        color={isPlaying ? "#10b981" : "#064e3b"}
        emissive={isPlaying ? "#10b981" : "#022c22"}
        emissiveIntensity={isPlaying ? 1.0 : 0.2}
      />
    </mesh>
  </group>
);

const MechanicalWaveDriver = ({ isPlaying, isResonant }) => {
  const armatureRef = useRef();

  useFrame((state) => {
    if (!armatureRef.current) return;
    const t = isPlaying ? state.clock.getElapsedTime() : 0;
    // Driver pin vibrates slightly vertically
    const vibeAmp = isPlaying ? (isResonant ? 0.04 : 0.02) : 0;
    armatureRef.current.position.y = 0.48 + Math.sin(t * 30) * vibeAmp;
  });

  return (
    <group position={[-4.8, 0, 0]}>
      {/* Heavy Die-Cast Tripod Mounting Base */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.42, 0.46, 0.22, 24]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Bench Clamp Rod */}
      <mesh position={[0, 0.04, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.2, 16]} />
        <meshStandardMaterial color="#64748b" metalness={0.9} />
      </mesh>

      {/* Wave Driver Permanent Magnet Housing */}
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.35, 0.38, 0.34, 28]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Heat Dissipation Ring Grooves */}
      {[-0.05, 0.05].map((yOffset, i) => (
        <mesh key={i} position={[0, 0.32 + yOffset, 0]}>
          <cylinderGeometry args={[0.36, 0.36, 0.02, 28]} />
          <meshStandardMaterial color="#38bdf8" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}

      {/* Dual Binding Posts on Rear (Receiving Signal from Generator) */}
      <mesh position={[-0.15, 0.34, -0.38]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.1, 16]} />
        <meshStandardMaterial color="#ef4444" roughness={0.3} />
      </mesh>
      <mesh position={[0.15, 0.34, -0.38]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.1, 16]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} />
      </mesh>

      {/* Oscillating Armature & String Clamp Collet */}
      <group ref={armatureRef} position={[0, 0.48, 0]}>
        {/* Stainless Steel Drive Shaft */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.24, 16]} />
          <meshStandardMaterial color="#f1f5f9" metalness={0.95} roughness={0.1} />
        </mesh>
        {/* Brass String Clamp Block */}
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[0.12, 0.08, 0.12]} />
          <meshStandardMaterial color="#d97706" metalness={0.85} roughness={0.3} />
        </mesh>
        {/* Brass Clamping Thumb Screw */}
        <mesh position={[0, 0.1, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.06, 16]} />
          <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
};

const SonometerTrack = () => (
  <group position={[0, 0, 0]}>
    {/* Heavy Extruded Aluminum Sonometer Rail */}
    <RoundedBox args={[11.0, 0.18, 0.9]} radius={0.03} smoothness={3} position={[0, 0.09, 0]}>
      <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.25} />
    </RoundedBox>

    {/* Center T-Slot Channel */}
    <mesh position={[0, 0.182, 0]}>
      <boxGeometry args={[10.8, 0.01, 0.12]} />
      <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.6} />
    </mesh>

    {/* Laser-Etched Metric Calibration Scale */}
    <mesh position={[0, 0.183, 0.3]}>
      <planeGeometry args={[10.6, 0.08]} />
      <meshBasicMaterial color="#fef08a" />
    </mesh>

    {/* Vibration Isolation Rubber Support Feet */}
    {[-5.0, -2.5, 0, 2.5, 5.0].map((fx, i) => (
      <mesh key={i} position={[fx, -0.04, 0]}>
        <cylinderGeometry args={[0.14, 0.16, 0.08, 16]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} />
      </mesh>
    ))}

    {/* Movable Knife-Edge Bridge Wedges (supporting string at nodes) */}
    {[-4.2, 4.4].map((bx, i) => (
      <group key={i} position={[bx, 0.18, 0]}>
        {/* Triangular Prism Wooden/Alloy Body */}
        <mesh position={[0, 0.16, 0]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.22, 0.22, 0.7]} />
          <meshStandardMaterial color="#78350f" roughness={0.7} />
        </mesh>
        {/* Polished Brass Knife Edge Apex */}
        <mesh position={[0, 0.32, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.015, 0.015, 0.68, 12]} />
          <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>
    ))}
  </group>
);

const PrecisionBenchPulley = () => (
  <group position={[4.9, 0, 0]}>
    {/* Sturdy Table Clamp Bracket */}
    <mesh position={[0, 0.16, 0]}>
      <boxGeometry args={[0.3, 0.32, 0.4]} />
      <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
    </mesh>
    {/* Clamping Thumb Screw Underneath Bench */}
    <mesh position={[0, -0.22, 0]}>
      <cylinderGeometry args={[0.04, 0.04, 0.2, 16]} />
      <meshStandardMaterial color="#94a3b8" metalness={0.95} />
    </mesh>
    <mesh position={[0, -0.32, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.12, 0.12, 0.04, 16]} />
      <meshStandardMaterial color="#64748b" metalness={0.9} />
    </mesh>

    {/* Pulley Yoke Arm */}
    <mesh position={[0.22, 0.42, 0]}>
      <boxGeometry args={[0.16, 0.38, 0.28]} />
      <meshStandardMaterial color="#334155" metalness={0.7} />
    </mesh>

    {/* Low-Friction Brass Ball-Bearing Pulley Wheel */}
    <group position={[0.32, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
      <mesh>
        <cylinderGeometry args={[0.28, 0.28, 0.1, 32]} />
        <meshStandardMaterial color="#d97706" metalness={0.88} roughness={0.25} />
      </mesh>
      {/* Perimeter String Guide Groove */}
      <mesh>
        <cylinderGeometry args={[0.24, 0.24, 0.04, 32]} />
        <meshStandardMaterial color="#b45309" metalness={0.9} />
      </mesh>
      {/* Center Stainless Steel Axle Pin */}
      <mesh>
        <cylinderGeometry args={[0.06, 0.06, 0.14, 16]} />
        <meshStandardMaterial color="#f1f5f9" metalness={0.95} />
      </mesh>
    </group>
  </group>
);

const SlottedMassHanger = ({ tension }) => {
  const massGrams = Math.round((tension / 9.8) * 1000);
  const numDiscs = Math.min(8, Math.max(1, Math.round(massGrams / 50)));

  return (
    <group position={[5.22, -0.3, 0]}>
      {/* Polished Brass Top Suspension Eyelet */}
      <mesh position={[0, 0.78, 0]}>
        <torusGeometry args={[0.07, 0.018, 12, 24]} />
        <meshStandardMaterial color="#d97706" metalness={0.88} roughness={0.25} />
      </mesh>

      {/* Brass Hanger Vertical Stem */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1.0, 16]} />
        <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Bottom Retention Disc of Hanger */}
      <mesh position={[0, -0.25, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.05, 24]} />
        <meshStandardMaterial color="#d97706" metalness={0.88} roughness={0.25} />
      </mesh>

      {/* Stacked Machined Brass Slotted Mass Discs */}
      {Array.from({ length: numDiscs }).map((_, i) => (
        <group key={i} position={[0, -0.2 + i * 0.075, 0]}>
          <mesh>
            <cylinderGeometry args={[0.25, 0.25, 0.065, 28]} />
            <meshStandardMaterial color="#eab308" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Radial Slot Cutout */}
          <mesh position={[0.12, 0, 0]}>
            <boxGeometry args={[0.15, 0.07, 0.04]} />
            <meshStandardMaterial color="#ca8a04" metalness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Live Mass & Tension Readout Badge */}
      <CanvasLabel
        text={`T = ${tension.toFixed(1)} N (${massGrams} g)`}
        color="#fbbf24"
        bgColor="rgba(15, 23, 42, 0.9)"
        position={[0.9, 0.1, 0]}
        fontSize={22}
        scale={[1.4, 0.45, 1]}
      />
    </group>
  );
};

const VibratingHarmonicString = ({ params, results, isPlaying }) => {
  const lineRef = useRef();
  const envUpperRef = useRef();
  const envLowerRef = useRef();

  const numPoints = 120;
  const startX = -4.8;
  const endX = 4.9;
  const totalLength = endX - startX;

  const n = results?.physics?.harmonic_number_n || params?.mode || 1;
  const angularFreq = results?.physics?.angular_frequency_rad_per_s || 30;
  const isResonant = Boolean(results?.physics?.is_resonant);
  const baseAmplitude = isPlaying ? (isResonant ? 0.22 : 0.1) : 0;

  const positions = useMemo(() => new Float32Array(numPoints * 3), [numPoints]);
  const upperPositions = useMemo(() => new Float32Array(numPoints * 3), [numPoints]);
  const lowerPositions = useMemo(() => new Float32Array(numPoints * 3), [numPoints]);

  useFrame((state) => {
    if (!lineRef.current) return;
    const time = state.clock.getElapsedTime();
    const posAttr = lineRef.current.geometry.attributes.position;
    const array = posAttr.array;

    const phase = isPlaying ? Math.cos(angularFreq * time) : 0;

    for (let i = 0; i < numPoints; i++) {
      const u = i / (numPoints - 1);
      const x = startX + u * totalLength;
      const envelope = Math.sin(n * Math.PI * u);
      const y = 0.58 + baseAmplitude * envelope * phase;

      array[i * 3] = x;
      array[i * 3 + 1] = y;
      array[i * 3 + 2] = 0;
    }
    posAttr.needsUpdate = true;

    // Update standing wave envelope outlines
    if (envUpperRef.current && envLowerRef.current) {
      const upArray = envUpperRef.current.geometry.attributes.position.array;
      const lowArray = envLowerRef.current.geometry.attributes.position.array;

      for (let i = 0; i < numPoints; i++) {
        const u = i / (numPoints - 1);
        const x = startX + u * totalLength;
        const envelope = Math.abs(Math.sin(n * Math.PI * u));

        upArray[i * 3] = x;
        upArray[i * 3 + 1] = 0.58 + baseAmplitude * envelope;
        upArray[i * 3 + 2] = 0;

        lowArray[i * 3] = x;
        lowArray[i * 3 + 1] = 0.58 - baseAmplitude * envelope;
        lowArray[i * 3 + 2] = 0;
      }
      envUpperRef.current.geometry.attributes.position.needsUpdate = true;
      envLowerRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const stringColor = isResonant ? "#38bdf8" : "#e2e8f0";

  return (
    <group>
      {/* 1. Core Dynamic Vibrating Wire */}
      <line ref={lineRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={numPoints} array={positions} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color={stringColor} linewidth={isResonant ? 3 : 2} />
      </line>

      {/* 2. Standing Wave Upper & Lower Harmonic Persistence Envelopes */}
      {isPlaying && (
        <>
          <line ref={envUpperRef}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" count={numPoints} array={upperPositions} itemSize={3} />
            </bufferGeometry>
            <lineBasicMaterial color={isResonant ? "#38bdf8" : "#94a3b8"} transparent opacity={0.4} linewidth={1} />
          </line>

          <line ref={envLowerRef}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" count={numPoints} array={lowerPositions} itemSize={3} />
            </bufferGeometry>
            <lineBasicMaterial color={isResonant ? "#38bdf8" : "#94a3b8"} transparent opacity={0.4} linewidth={1} />
          </line>
        </>
      )}

      {/* 3. Node (N) Pin Indicators along the vibrating string */}
      {Array.from({ length: n + 1 }).map((_, k) => {
        const nodeX = startX + (k / n) * totalLength;
        return (
          <group key={k} position={[nodeX, 0.58, 0]}>
            <mesh>
              <sphereGeometry args={[0.035, 12, 12]} />
              <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.8} />
            </mesh>
            <CanvasLabel text="N" color="#ef4444" position={[0, 0.16, 0]} fontSize={18} scale={[0.4, 0.3, 1]} />
          </group>
        );
      })}

      {/* 4. String section curving over pulley and dropping to weight hanger */}
      <Line
        points={[
          [4.9, 0.58, 0],
          [5.1, 0.56, 0],
          [5.22, 0.48, 0],
          [5.22, 0.48, 0],
          [5.22, -0.3, 0],
        ]}
        color="#e2e8f0"
        lineWidth={2}
      />
    </group>
  );
};

/*
=========================================================
MAIN SCENE COMPONENT WITH 2D/3D PERFORMANCE SWITCHER
=========================================================
*/
const Scene3D = React.memo(function Scene3D({ params, results, isPlaying }) {
  const displayFreq = results?.physics?.frequency_hz || 0;
  const isResonant = Boolean(results?.physics?.is_resonant);
  const { mode: viewMode, setMode: setViewMode } = useLabPerformance();

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", borderRadius: "12px", overflow: "hidden", background: "#1e293b" }}>
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
          title="Interactive 3D Workbench"
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
        <VibrationString2D params={params} results={results} isPlaying={isPlaying} />
      ) : (
        <CanvasErrorBoundary
          fallback={<VibrationString2D params={params} results={results} isPlaying={isPlaying} />}
        >
          <Canvas
            camera={{ position: [0, 3.8, 9.5], fov: 42 }}
            dpr={1}
            performance={{ min: 0.5 }}
            gl={{ powerPreference: "default", antialias: true, failIfMajorPerformanceCaveat: false, preserveDrawingBuffer: false }}
            shadows={false}
            onCreated={({ gl }) => {
              const handleContextLost = (e) => {
                e.preventDefault();
                console.warn("WebGL Context Lost in Vibration String — Retaining 3D view");
              };
              gl.domElement.addEventListener("webglcontextlost", handleContextLost, false);
            }}
          >
            <color attach="background" args={['#1e293b']} />

            {/* Studio Lighting Rig */}
            <ambientLight intensity={1.4} />
            <directionalLight position={[6, 12, 6]} intensity={2.2} />
            <directionalLight position={[-6, 6, -4]} intensity={1.3} color="#93c5fd" />
            <directionalLight position={[0, -4, 6]} intensity={0.5} color="#cbd5e1" />

            <Suspense fallback={null}>
              {/* Heavy Lab Workbench Table */}
              <mesh position={[0, -0.32, 0]}>
                <boxGeometry args={[18, 0.4, 7]} />
                <meshStandardMaterial color="#0f172a" roughness={0.7} metalness={0.2} />
              </mesh>

              {/* Anti-Static ESD Workmat */}
              <mesh position={[0, -0.115, 0]}>
                <boxGeometry args={[16.5, 0.01, 5.5]} />
                <meshStandardMaterial color="#1e293b" roughness={0.85} metalness={0.15} />
              </mesh>

              {/* Digital Benchtop Signal Generator */}
              <DigitalFunctionGenerator
                frequency={displayFreq}
                isResonant={isResonant}
                isPlaying={isPlaying}
              />

              {/* Coaxial Silicone Signal Leads from Generator to Wave Driver */}
              <QuadraticBezierLine
                start={[-5.25, 0.4, -0.62]}
                mid={[-5.1, 0.18, -0.4]}
                end={[-4.95, 0.34, -0.38]}
                color="#ef4444"
                lineWidth={2.8}
              />
              <QuadraticBezierLine
                start={[-5.55, 0.4, -0.62]}
                mid={[-5.3, 0.14, -0.4]}
                end={[-4.65, 0.34, -0.38]}
                color="#0f172a"
                lineWidth={2.8}
              />

              {/* Sonometer Rail & Knife-Edge Bridges */}
              <SonometerTrack />

              {/* Mechanical Electromagnetic Wave Driver */}
              <MechanicalWaveDriver isPlaying={isPlaying} isResonant={isResonant} />

              {/* Precision Bench Clamp Pulley */}
              <PrecisionBenchPulley />

              {/* Slotted Brass Mass Discs & Weight Carrier */}
              <SlottedMassHanger tension={params.tension} />

              {/* Multi-Harmonic Dynamic Vibrating String with Envelopes */}
              <VibratingHarmonicString params={params} results={results} isPlaying={isPlaying} />

              {/* Smooth 360° View Controls with Damping and comfortable Zoom */}
              <OrbitControls
                makeDefault
                enableZoom={true}
                zoomSpeed={1.2}
                enableDamping={true}
                dampingFactor={0.08}
                minDistance={2.5}
                maxDistance={25}
                minPolarAngle={0.05}
                maxPolarAngle={Math.PI / 2 - 0.05}
              />
            </Suspense>
          </Canvas>
        </CanvasErrorBoundary>
      )}
    </div>
  );
});

export default Scene3D;