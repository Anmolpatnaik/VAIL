import React, { useRef, useEffect, useMemo, Suspense, Component } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, RoundedBox, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useLabPerformance } from './utils/useLabPerformance';

/*
=========================================================
CANVAS LABEL (Zero Network Requests, High-DPI Local Texture)
=========================================================
*/
function CanvasLabel({ text, color = "#38bdf8", bgColor = null, fontSize = 24, position = [0, 0, 0], scale = [1.2, 0.45, 1] }) {
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
    console.warn("WebGL 3D Context Error in Impulse Momentum:", err);
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
2D HIGH-PERFORMANCE DYNAMICS TRACK SCHEMATIC (Zero GPU Load)
=========================================================
*/
function ImpulseMomentum2D({ params, results, isPlaying }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let t = 0;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;

      // Dark Precision Track Background
      ctx.fillStyle = "#030c17";
      ctx.fillRect(0, 0, w, h);

      // Blueprint Chamber Grid
      ctx.strokeStyle = "rgba(56, 189, 248, 0.08)";
      ctx.lineWidth = 1;
      const step = 28;
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
      ctx.textAlign = "left";
      ctx.fillText(
        `LINEAR COLLISION & IMPULSE-MOMENTUM BENCH • ${
          (params?.restitution_coefficient || 1) > 0.5 ? "ELASTIC COLLISION" : "INELASTIC COLLISION"
        }`,
        24,
        30
      );

      // Main Air Track
      const trackX = 50;
      const trackY = 200;
      const trackW = w - 100;
      const trackH = 36;

      ctx.fillStyle = "#1e293b";
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 2;
      ctx.fillRect(trackX, trackY, trackW, trackH);
      ctx.strokeRect(trackX, trackY, trackW, trackH);

      // End Bumpers
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(trackX - 14, trackY - 15, 14, trackH + 30);
      ctx.fillRect(trackX + trackW, trackY - 15, 14, trackH + 30);
      ctx.strokeStyle = "#64748b";
      ctx.strokeRect(trackX - 14, trackY - 15, 14, trackH + 30);
      ctx.strokeRect(trackX + trackW, trackY - 15, 14, trackH + 30);

      // Yellow Measurement Scale
      const scaleY = trackY + 8;
      ctx.fillStyle = "#eab308";
      ctx.fillRect(trackX, scaleY, trackW, 10);
      ctx.fillStyle = "#000000";
      ctx.font = "8px monospace";
      ctx.textAlign = "center";
      const totalMarks = 20;
      for (let m = 0; m <= totalMarks; m++) {
        const mx = trackX + (m / totalMarks) * trackW;
        ctx.beginPath();
        ctx.moveTo(mx, scaleY);
        ctx.lineTo(mx, scaleY + 4);
        ctx.stroke();
        if (m % 5 === 0) {
          ctx.fillText(`${m * 5}cm`, mx, scaleY + 9);
        }
      }

      // Photogate Sensors (at 25% and 75% along track)
      const gate1X = trackX + trackW * 0.25;
      const gate2X = trackX + trackW * 0.75;
      const gateY = trackY - 55;
      const gateW = 20;
      const gateH = 65;

      [gate1X, gate2X].forEach((gx, idx) => {
        // Gate Arch
        ctx.fillStyle = "#0f172a";
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2;
        ctx.strokeRect(gx - gateW / 2, gateY, gateW, gateH);

        // Laser beam
        ctx.strokeStyle = "rgba(239, 68, 68, 0.6)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(gx - gateW / 2, gateY + 30);
        ctx.lineTo(gx + gateW / 2, gateY + 30);
        ctx.stroke();
        ctx.setLineDash([]);

        // Status LED
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(gx, gateY + 8, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#94a3b8";
        ctx.font = "bold 9px monospace";
        ctx.textAlign = "center";
        ctx.fillText(`GATE ${idx + 1}`, gx, gateY - 6);
      });

      // Calculate Cart positions based on physics
      const m1 = params?.mass_1 || 1.0;
      const m2 = params?.mass_2 || 1.0;
      const u1 = params?.initial_velocity_1 || 0.6;
      const u2 = params?.initial_velocity_2 || -0.4;
      const v1 = results?.object_1?.final_velocity_m_per_s ?? ((m1 - m2) / (m1 + m2)) * u1;
      const v2 = results?.object_2?.final_velocity_m_per_s ?? ((2 * m1) / (m1 + m2)) * u1;

      if (isPlaying) {
        t += 0.02;
      }

      const centerTrackX = trackX + trackW / 2;
      const scalePixels = 120; // 1 meter = 120 px
      const initialSep = 3.0;
      const relativeSpeed = Math.abs(u1 - u2) || 0.001;
      const tCollide = initialSep / relativeSpeed;

      let pos1, pos2;
      let curV1, curV2;

      if (t < tCollide) {
        pos1 = centerTrackX - (initialSep / 2) * scalePixels + u1 * t * scalePixels;
        pos2 = centerTrackX + (initialSep / 2) * scalePixels + u2 * t * scalePixels;
        curV1 = u1;
        curV2 = u2;
      } else {
        const tPost = t - tCollide;
        const colX = centerTrackX - (initialSep / 2) * scalePixels + u1 * tCollide * scalePixels;
        pos1 = colX - 35 + v1 * tPost * scalePixels;
        pos2 = colX + 35 + v2 * tPost * scalePixels;
        curV1 = v1;
        curV2 = v2;
      }

      // Clamp within track boundaries
      pos1 = Math.max(trackX + 35, Math.min(trackX + trackW - 75, pos1));
      pos2 = Math.max(trackX + 75, Math.min(trackX + trackW - 35, pos2));

      // Draw Cart 1 (Blue)
      const cartW = 60;
      const cartH = 26;
      const wheelR = 5;
      const wheelY = trackY - wheelR;
      const cartY = wheelY - cartH + 4;

      ctx.fillStyle = "#2563eb";
      ctx.strokeStyle = "#60a5fa";
      ctx.lineWidth = 2;
      ctx.fillRect(pos1 - cartW / 2, cartY, cartW, cartH);
      ctx.strokeRect(pos1 - cartW / 2, cartY, cartW, cartH);

      // Cart 1 Wheels
      [-cartW / 2 + 12, cartW / 2 - 12].forEach((wx) => {
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.arc(pos1 + wx, wheelY, wheelR, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 1;
        ctx.stroke();

        const spinAngle = -(pos1 / wheelR);
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(pos1 + wx, wheelY);
        ctx.lineTo(pos1 + wx + Math.cos(spinAngle) * (wheelR - 1), wheelY + Math.sin(spinAngle) * (wheelR - 1));
        ctx.stroke();
      });

      // Cart 1 Bumper
      ctx.fillStyle = (params?.restitution_coefficient || 1) > 0.5 ? "#ef4444" : "#475569";
      ctx.fillRect(pos1 + cartW / 2, cartY + 5, 8, cartH - 10);

      // Cart 1 Label
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 10px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`C1: ${m1.toFixed(1)}kg`, pos1, cartY + 16);

      // Cart 1 Velocity Vector Arrow
      if (Math.abs(curV1) > 0.05) {
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2.5;
        const arrowLen = curV1 * 50;
        ctx.beginPath();
        ctx.moveTo(pos1, cartY - 14);
        ctx.lineTo(pos1 + arrowLen, cartY - 14);
        ctx.stroke();

        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 9px monospace";
        ctx.fillText(`v1: ${curV1.toFixed(2)} m/s`, pos1, cartY - 20);
      }

      // Draw Cart 2 (Green)
      ctx.fillStyle = "#059669";
      ctx.strokeStyle = "#34d399";
      ctx.lineWidth = 2;
      ctx.fillRect(pos2 - cartW / 2, cartY, cartW, cartH);
      ctx.strokeRect(pos2 - cartW / 2, cartY, cartW, cartH);

      // Cart 2 Wheels
      [-cartW / 2 + 12, cartW / 2 - 12].forEach((wx) => {
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.arc(pos2 + wx, wheelY, wheelR, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 1;
        ctx.stroke();

        const spinAngle = -(pos2 / wheelR);
        ctx.strokeStyle = "#4ade80";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(pos2 + wx, wheelY);
        ctx.lineTo(pos2 + wx + Math.cos(spinAngle) * (wheelR - 1), wheelY + Math.sin(spinAngle) * (wheelR - 1));
        ctx.stroke();
      });

      // Cart 2 Bumper
      ctx.fillStyle = (params?.restitution_coefficient || 1) > 0.5 ? "#ef4444" : "#475569";
      ctx.fillRect(pos2 - cartW / 2 - 8, cartY + 5, 8, cartH - 10);

      // Cart 2 Label
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 10px monospace";
      ctx.fillText(`C2: ${m2.toFixed(1)}kg`, pos2, cartY + 18);

      // Cart 2 Velocity Vector Arrow
      if (Math.abs(curV2) > 0.05) {
        ctx.strokeStyle = "#4ade80";
        ctx.lineWidth = 2.5;
        const arrowLen = curV2 * 50;
        ctx.beginPath();
        ctx.moveTo(pos2, cartY - 14);
        ctx.lineTo(pos2 + arrowLen, cartY - 14);
        ctx.stroke();

        ctx.fillStyle = "#4ade80";
        ctx.font = "bold 9px monospace";
        ctx.fillText(`v2: ${curV2.toFixed(2)} m/s`, pos2, cartY - 20);
      }

      // Live Telemetry Cards at bottom
      const p1 = m1 * curV1;
      const p2 = m2 * curV2;
      const pTotal = p1 + p2;

      ctx.textAlign = "left";
      ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
      ctx.strokeStyle = "#38bdf8";
      ctx.fillRect(24, h - 85, w - 48, 65);
      ctx.strokeRect(24, h - 85, w - 48, 65);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "9px monospace";
      ctx.fillText("MOMENTUM TELEMETRY (P = m · v)", 36, h - 68);

      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 12px monospace";
      ctx.fillText(`p1 = ${p1.toFixed(3)} kg·m/s`, 36, h - 48);

      ctx.fillStyle = "#4ade80";
      ctx.fillText(`p2 = ${p2.toFixed(3)} kg·m/s`, 220, h - 48);

      ctx.fillStyle = "#facc15";
      ctx.fillText(`Total p = ${pTotal.toFixed(3)} kg·m/s (CONSERVED)`, 400, h - 48);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "10px monospace";
      ctx.fillText(
        `e = ${params?.restitution_coefficient || 1.0} • Kinetic Energy = ${(
          0.5 * m1 * curV1 * curV1 +
          0.5 * m2 * curV2 * curV2
        ).toFixed(3)} J`,
        36,
        h - 30
      );

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

const PhotogateUnit = ({ position, label, gateIndex }) => (
  <group position={position}>
    {/* Track Rail Clamp Base */}
    <mesh position={[0, -0.05, 0]}>
      <boxGeometry args={[0.35, 0.18, 1.4]} />
      <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
    </mesh>
    <mesh position={[0, -0.05, 0.78]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.08, 0.08, 0.14, 16]} />
      <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
    </mesh>

    {/* Vertical Support Columns (U-arch sides) */}
    <mesh position={[0, 0.85, 0.62]}>
      <boxGeometry args={[0.18, 1.7, 0.16]} />
      <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
    </mesh>
    <mesh position={[0, 0.85, -0.62]}>
      <boxGeometry args={[0.18, 1.7, 0.16]} />
      <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
    </mesh>

    {/* Top Crossbar */}
    <mesh position={[0, 1.72, 0]}>
      <boxGeometry args={[0.26, 0.18, 1.4]} />
      <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
    </mesh>

    {/* Infrared Transmitter & Detector Lenses */}
    <mesh position={[0, 0.72, 0.52]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.04, 0.04, 0.06, 16]} />
      <meshStandardMaterial color="#dc2626" emissive="#ef4444" emissiveIntensity={0.8} />
    </mesh>
    <mesh position={[0, 0.72, -0.52]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.04, 0.04, 0.06, 16]} />
      <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.5} />
    </mesh>

    {/* Active Infrared Optical Beam Line across track */}
    <Line
      points={[[0, 0.72, 0.49], [0, 0.72, -0.49]]}
      color="#ef4444"
      lineWidth={1.8}
      transparent
      opacity={0.65}
    />

    {/* Status Indicator LED on Top */}
    <mesh position={[0, 1.83, 0]}>
      <sphereGeometry args={[0.05, 16, 16]} />
      <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.0} />
    </mesh>

    {/* Digital Gate Display Box on Top */}
    <mesh position={[0, 2.05, 0]}>
      <boxGeometry args={[0.5, 0.28, 0.6]} />
      <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.3} />
    </mesh>
    <mesh position={[0.26, 2.05, 0]}>
      <planeGeometry args={[0.45, 0.2]} />
      <meshBasicMaterial color="#021526" />
    </mesh>
    <CanvasLabel
      text={`GATE ${gateIndex}`}
      color="#38bdf8"
      position={[0, 2.24, 0]}
      fontSize={22}
      scale={[0.9, 0.35, 1]}
    />
  </group>
);

/*
=========================================================
PRECISION LOW-FRICTION CART WHEEL ASSEMBLY
=========================================================
*/
function CartWheel({ isFront = true }) {
  // isFront: facing +Z (front) vs facing -Z (back)
  const rotX = isFront ? Math.PI / 2 : -Math.PI / 2;
  const flangeZ = isFront ? -0.016 : 0.016; // Flange on inner side towards track center
  const faceZ = isFront ? 0.021 : -0.021; // Details on outer side towards viewer

  return (
    <group>
      {/* Precision Wheel Rim / Delrin Body */}
      <mesh rotation={[rotX, 0, 0]}>
        <cylinderGeometry args={[0.095, 0.095, 0.036, 32]} />
        <meshStandardMaterial color="#334155" metalness={0.82} roughness={0.25} />
      </mesh>

      {/* Low-Friction Track Guide Flange (rides inside rail groove to prevent derailment) */}
      <mesh position={[0, 0, flangeZ]} rotation={[rotX, 0, 0]}>
        <cylinderGeometry args={[0.103, 0.103, 0.008, 32]} />
        <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Chrome Ball Bearing Outer Race */}
      <mesh position={[0, 0, faceZ * 0.45]} rotation={[rotX, 0, 0]}>
        <cylinderGeometry args={[0.046, 0.046, 0.038, 24]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.12} />
      </mesh>

      {/* Central Stainless Bearing Hub & Cap */}
      <mesh position={[0, 0, faceZ * 1.05]} rotation={[rotX, 0, 0]}>
        <cylinderGeometry args={[0.028, 0.028, 0.012, 20]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.98} roughness={0.08} />
      </mesh>

      {/* Center Brass Axle Retainer Nut */}
      <mesh position={[0, 0, faceZ * 1.18]} rotation={[rotX, 0, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.008, 6]} />
        <meshStandardMaterial color="#d97706" metalness={0.88} roughness={0.3} />
      </mesh>

      {/* High-Visibility 4-Spoke Radial Markers & Velocity Strobe Dot */}
      <group position={[0, 0, faceZ * 0.95]}>
        {/* Horizontal Spoke Bar */}
        <mesh>
          <boxGeometry args={[0.14, 0.016, 0.004]} />
          <meshStandardMaterial color="#38bdf8" metalness={0.7} roughness={0.25} />
        </mesh>
        {/* Vertical Spoke Bar */}
        <mesh>
          <boxGeometry args={[0.016, 0.14, 0.004]} />
          <meshStandardMaterial color="#38bdf8" metalness={0.7} roughness={0.25} />
        </mesh>
        {/* Visual Optical Velocity Strobe Dot on Rim */}
        <mesh position={[0.068, 0, 0.002]}>
          <cylinderGeometry args={[0.012, 0.012, 0.005, 16]} />
          <meshBasicMaterial color="#facc15" />
        </mesh>
      </group>
    </group>
  );
}

const DynamicsCart = React.forwardRef(({ color, mass, isLeft, restitution }, ref) => {
  const isElastic = restitution > 0.5;
  const dir = isLeft ? 1 : -1;
  const extraWeights = Math.max(0, Math.floor(mass - 1));

  return (
    <group ref={ref}>
      {/* Aerodynamic Extruded Aluminum Cart Chassis */}
      <RoundedBox args={[1.35, 0.23, 0.66]} radius={0.04} smoothness={4} position={[0, 0.285, 0]}>
        <meshStandardMaterial color={color} metalness={0.78} roughness={0.22} />
      </RoundedBox>

      {/* Cart Top Deck Plate */}
      <mesh position={[0, 0.408, 0]}>
        <boxGeometry args={[1.12, 0.015, 0.56]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Optical Timing Interrupt Flag on Top (PASCO style dual-fin) */}
      <group position={[0, 0.57, 0]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.06, 0.32, 0.08]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.13, 0]}>
          <boxGeometry args={[0.38, 0.16, 0.02]} />
          <meshStandardMaterial color="#0f172a" metalness={0.4} roughness={0.6} />
        </mesh>
      </group>

      {/* Precision Low-Friction Stainless Ball-Bearing Wheel Assemblies */}
      {[-0.42, 0.42].map((x, i) => (
        <group key={i} name={`wheelAxle_${i}`}>
          {/* Wheel Axle Rod across track */}
          <mesh position={[x, 0.243, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.78, 16]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.15} />
          </mesh>

          {/* Machined Chassis Axle Pillow Block Mounts (connecting axle to chassis) */}
          <mesh position={[x, 0.25, 0.33]}>
            <boxGeometry args={[0.09, 0.08, 0.03]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.35} />
          </mesh>
          <mesh position={[x, 0.25, -0.33]}>
            <boxGeometry args={[0.09, 0.08, 0.03]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.35} />
          </mesh>

          {/* Wheel Front (Z = +0.38, rests on front rail) */}
          <group position={[x, 0.243, 0.38]} name={`wheelFront_${i}`}>
            <CartWheel isFront={true} />
          </group>

          {/* Wheel Back (Z = -0.38, rests on back rail) */}
          <group position={[x, 0.243, -0.38]} name={`wheelBack_${i}`}>
            <CartWheel isFront={false} />
          </group>
        </group>
      ))}

      {/* Collision Bumper System with Dynamic Compression Subgroup */}
      {isElastic ? (
        /* Elastic Collision: Spring Plunger & Magnetic Disc with Coiled Spring */
        <group position={[0.675 * dir, 0.285, 0]}>
          {/* Fixed Outer Plunger Sleeve */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.08, 0.08, 0.12, 16]} />
            <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
          </mesh>

          {/* Movable Spring Plunger Assembly */}
          <group name="bumperPlunger" position={[0, 0, 0]}>
            {/* Chrome Spring Plunger Shaft */}
            <mesh position={[0.07 * dir, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.035, 0.035, 0.14, 16]} />
              <meshStandardMaterial color="#f1f5f9" metalness={0.95} roughness={0.1} />
            </mesh>

            {/* Coiled Stainless Steel Spring Rings around shaft */}
            {[0.03, 0.06, 0.09, 0.12].map((sx, idx) => (
              <mesh key={idx} position={[sx * dir, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <torusGeometry args={[0.055, 0.012, 8, 20]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.1} />
              </mesh>
            ))}

            {/* Neodymium Magnetic Contact Puck */}
            <mesh position={[0.155 * dir, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.095, 0.095, 0.04, 20]} />
              <meshStandardMaterial color="#ef4444" metalness={0.85} roughness={0.2} />
            </mesh>
          </group>
        </group>
      ) : (
        /* Inelastic Collision: Velcro Interlock Coupler Block */
        <group position={[0.675 * dir, 0.285, 0]}>
          <mesh name="bumperPlunger" position={[0.04 * dir, 0, 0]}>
            <boxGeometry args={[0.08, 0.18, 0.38]} />
            <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.8} />
          </mesh>
          <mesh position={[0.085 * dir, 0, 0]}>
            <boxGeometry args={[0.03, 0.14, 0.34]} />
            <meshStandardMaterial color="#334155" roughness={0.95} />
          </mesh>
        </group>
      )}

      {/* Stacked Machined Brass Mass Discs */}
      {Array.from({ length: extraWeights }).map((_, i) => (
        <group key={i} position={[0, 0.44 + i * 0.11, 0]}>
          <mesh>
            <cylinderGeometry args={[0.22, 0.22, 0.1, 32]} />
            <meshStandardMaterial color="#d97706" metalness={0.88} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0.052, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.01, 16]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
        </group>
      ))}

      {/* Staggered Identification Badge (Offset to Left/Right so badges never overlap upon impact!) */}
      <CanvasLabel
        text={`${isLeft ? "CART 1" : "CART 2"} • ${mass.toFixed(1)}kg`}
        color={color}
        bgColor="rgba(15, 23, 42, 0.9)"
        position={[isLeft ? -0.38 : 0.38, 1.05 + extraWeights * 0.11, 0]}
        fontSize={22}
        scale={[1.25, 0.42, 1]}
      />
    </group>
  );
});

const TrackExtrusion = () => {
  // Generate leveling feet locations along the 30-meter track
  const feetPositions = [-13, -6.5, 0, 6.5, 13];

  return (
    <group position={[0, 0, 0]}>
      {/* Heavy Extruded Aluminum Dynamics Track Profile */}
      <mesh position={[0, 0.07, 0]}>
        <boxGeometry args={[30, 0.14, 1.25]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.25} />
      </mesh>

      {/* Precision Center Guide Channel Groove */}
      <mesh position={[0, 0.142, 0]}>
        <boxGeometry args={[29.8, 0.01, 0.15]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.5} />
      </mesh>

      {/* Dual Low-Friction Wheel Guide Rails */}
      <mesh position={[0, 0.142, 0.38]}>
        <boxGeometry args={[29.8, 0.012, 0.08]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.142, -0.38]}>
        <boxGeometry args={[29.8, 0.012, 0.08]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Laser-Etched Metric Ruler Strips on Side Flanges */}
      <mesh position={[0, 0.143, 0.52]}>
        <planeGeometry args={[29.6, 0.06]} />
        <meshBasicMaterial color="#fef08a" />
      </mesh>
      <mesh position={[0, 0.143, -0.52]}>
        <planeGeometry args={[29.6, 0.06]} />
        <meshBasicMaterial color="#fef08a" />
      </mesh>

      {/* Track End Stop Dampers with Springs */}
      {[-14.9, 14.9].map((x, idx) => {
        const isL = idx === 0;
        return (
          <group key={idx} position={[x, 0.18, 0]}>
            <mesh position={[0, 0.12, 0]}>
              <boxGeometry args={[0.3, 0.45, 1.24]} />
              <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
            </mesh>
            <mesh position={[isL ? 0.2 : -0.2, 0.18, 0.25]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.03, 0.03, 0.25, 16]} />
              <meshStandardMaterial color="#f1f5f9" metalness={0.95} />
            </mesh>
            <mesh position={[isL ? 0.2 : -0.2, 0.18, -0.25]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.03, 0.03, 0.25, 16]} />
              <meshStandardMaterial color="#f1f5f9" metalness={0.95} />
            </mesh>
            <mesh position={[isL ? 0.32 : -0.32, 0.18, 0]}>
              <boxGeometry args={[0.06, 0.28, 0.85]} />
              <meshStandardMaterial color="#ef4444" metalness={0.5} roughness={0.4} />
            </mesh>
          </group>
        );
      })}

      {/* Cast Track Leveling Feet with Knurled Brass Thumb Screws */}
      {feetPositions.map((fx, idx) => (
        <group key={idx} position={[fx, -0.05, 0]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.4, 0.1, 1.6]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, -0.08, 0.72]}>
            <cylinderGeometry args={[0.1, 0.1, 0.08, 20]} />
            <meshStandardMaterial color="#d97706" metalness={0.85} roughness={0.3} />
          </mesh>
          <mesh position={[0, -0.08, -0.72]}>
            <cylinderGeometry args={[0.1, 0.1, 0.08, 20]} />
            <meshStandardMaterial color="#d97706" metalness={0.85} roughness={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

/*
=========================================================
DYNAMIC COLLISION IMPACT EFFECT (Energy Flash & Shockwave)
=========================================================
*/
function CollisionShockwave({ active, x, isElastic, age }) {
  if (!active || age > 0.35) return null;
  const progress = age / 0.35; // 0 to 1
  const radius = 0.12 + progress * 0.95;
  const opacity = Math.max(0, (1 - progress) ** 1.6);
  const color = isElastic ? "#38bdf8" : "#f59e0b";

  return (
    <group position={[x, 0.28, 0]}>
      {/* Expanding Kinetic Energy Shockwave Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 0.8, radius, 32]} />
        <meshBasicMaterial color={color} transparent opacity={opacity * 0.85} side={THREE.DoubleSide} />
      </mesh>

      {/* Vertical Impact Ripple Disc */}
      <mesh rotation={[0, 0, 0]}>
        <ringGeometry args={[radius * 0.7, radius * 0.9, 32]} />
        <meshBasicMaterial color={color} transparent opacity={opacity * 0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* Intense Center Contact Spark Flash */}
      <mesh>
        <sphereGeometry args={[Math.max(0.01, 0.09 * (1 - progress)), 16, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={opacity} />
      </mesh>
    </group>
  );
}

function CollisionScene({ params, results, isPlaying }) {
  const cart1Ref = useRef();
  const cart2Ref = useRef();
  const shockwaveRef = useRef({ active: false, x: 0, age: 1.0 });

  const isElastic = (params?.restitution_coefficient ?? 1.0) > 0.5;

  useFrame((state) => {
    if (!cart1Ref.current || !cart2Ref.current) return;

    const t = isPlaying ? state.clock.getElapsedTime() : 0;
    const delta = state.clock.getDelta() || 0.016;

    const initialDist = 8.0;
    const trackLimit = 13.8;
    // Physical contact distance: cart bodies are 1.35 each, bumpers extend 0.17 each => 1.70 distance between centers
    const contactDist = 1.70;

    const u1 = params?.initial_velocity_1 ?? 0.6;
    const u2 = params?.initial_velocity_2 ?? -0.4;
    const v1 = results?.object_1?.final_velocity_m_per_s ?? -0.4;
    const v2 = results?.object_2?.final_velocity_m_per_s ?? 0.6;
    const m1 = params?.mass_1 ?? 1.0;
    const m2 = params?.mass_2 ?? 1.0;

    const vRel = u1 - u2;
    const travelDist = initialDist - contactDist;
    const tContact = vRel > 0.001 ? travelDist / vRel : 999999;
    // Compression duration in seconds (physical spring rebound time)
    const tDuration = isElastic ? 0.16 : 0.12;
    const tRelease = tContact + tDuration;

    let x1, x2, curV1, curV2, compression = 0, shudder1 = 0, shudder2 = 0;

    if (t < tContact) {
      x1 = -initialDist / 2 + u1 * t;
      x2 = initialDist / 2 + u2 * t;
      curV1 = u1;
      curV2 = u2;
      compression = 0;
    } else if (t >= tContact && t < tRelease) {
      // ─── ACTIVE COLLISION CONTACT WITH SPRING COMPRESSION ───
      const s = (t - tContact) / tDuration; // 0 -> 1
      const compNorm = Math.sin(Math.PI * s); // 0 -> 1 -> 0
      compression = compNorm;

      // Center of mass motion during impact
      const vCM = (m1 * u1 + m2 * u2) / (m1 + m2);
      const contactCenter0 = -initialDist / 2 + u1 * tContact + contactDist / 2;
      const currentCenter = contactCenter0 + vCM * (t - tContact);

      // Spring compression squishes distance inwards by maxSquish
      const maxSquish = isElastic ? 0.15 : 0.07;
      const currentSep = contactDist - maxSquish * compNorm;

      x1 = currentCenter - currentSep / 2;
      x2 = currentCenter + currentSep / 2;

      // Smooth velocity blend
      const blend = 0.5 - 0.5 * Math.cos(Math.PI * s);
      curV1 = u1 * (1 - blend) + v1 * blend;
      curV2 = u2 * (1 - blend) + v2 * blend;

      // Micro physical chassis impact recoil shudder
      const shudderAmp = Math.sin(s * Math.PI * 4) * (1 - s) * 0.02;
      shudder1 = -shudderAmp;
      shudder2 = shudderAmp;

      // Trigger impact shockwave
      shockwaveRef.current.active = true;
      shockwaveRef.current.x = currentCenter;
      shockwaveRef.current.age = t - tContact;
    } else {
      // ─── POST-COLLISION REBOUND ───
      const tPost = t - tRelease;
      const vCM = (m1 * u1 + m2 * u2) / (m1 + m2);
      const contactCenter0 = -initialDist / 2 + u1 * tContact + contactDist / 2;
      const contactCenterEnd = contactCenter0 + vCM * tDuration;

      x1 = contactCenterEnd - contactDist / 2 + v1 * tPost;
      x2 = contactCenterEnd + contactDist / 2 + v2 * tPost;
      curV1 = v1;
      curV2 = v2;
      compression = 0;

      shockwaveRef.current.age = t - tContact;
    }

    // Clamp within dynamics track end limits
    const clampedX1 = Math.max(-trackLimit, Math.min(trackLimit, x1));
    const clampedX2 = Math.max(-trackLimit, Math.min(trackLimit, x2));
    cart1Ref.current.position.x = clampedX1;
    cart2Ref.current.position.x = clampedX2;

    // Apply micro chassis recoil shudder on pitch
    cart1Ref.current.rotation.z = shudder1;
    cart2Ref.current.rotation.z = shudder2;

    // Dynamically compress bumper plungers on contact
    const p1 = cart1Ref.current.getObjectByName("bumperPlunger");
    const p2 = cart2Ref.current.getObjectByName("bumperPlunger");
    if (p1) p1.position.x = -compression * (isElastic ? 0.09 : 0.04);
    if (p2) p2.position.x = compression * (isElastic ? 0.09 : 0.04);

    // Physically spin wheels according to exact no-slip distance rolled along the track
    const wheelRadius = 0.095;
    const startX1 = -initialDist / 2;
    const startX2 = initialDist / 2;
    const angle1 = -(clampedX1 - startX1) / wheelRadius;
    const angle2 = -(clampedX2 - startX2) / wheelRadius;

    [0, 1].forEach((idx) => {
      const w1F = cart1Ref.current.getObjectByName(`wheelFront_${idx}`);
      const w1B = cart1Ref.current.getObjectByName(`wheelBack_${idx}`);
      const w2F = cart2Ref.current.getObjectByName(`wheelFront_${idx}`);
      const w2B = cart2Ref.current.getObjectByName(`wheelBack_${idx}`);
      if (w1F) w1F.rotation.z = angle1;
      if (w1B) w1B.rotation.z = angle1;
      if (w2F) w2F.rotation.z = angle2;
      if (w2B) w2B.rotation.z = angle2;
    });
  });

  return (
    <>
      {/* Studio Lighting Rig */}
      <ambientLight intensity={1.4} />
      <directionalLight position={[10, 16, 10]} intensity={2.4} />
      <directionalLight position={[-10, 8, -6]} intensity={1.5} color="#93c5fd" />
      <directionalLight position={[0, -6, 8]} intensity={0.6} color="#cbd5e1" />

      {/* Heavy Laboratory Workbench Table */}
      <mesh position={[0, -0.35, 0]}>
        <boxGeometry args={[34, 0.4, 6]} />
        <meshStandardMaterial color="#0f172a" roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Anti-Static ESD Workmat */}
      <mesh position={[0, -0.145, 0]}>
        <boxGeometry args={[32, 0.01, 4.5]} />
        <meshStandardMaterial color="#1e293b" roughness={0.85} metalness={0.15} />
      </mesh>

      {/* High-Precision Extruded Aluminum Dynamics Track */}
      <TrackExtrusion />

      {/* Smart Infrared Photogates */}
      <PhotogateUnit position={[-4.5, 0.08, 0]} label="GATE 1" gateIndex={1} />
      <PhotogateUnit position={[4.5, 0.08, 0]} label="GATE 2" gateIndex={2} />

      {/* Collision Kinetic Impact Effect */}
      <CollisionShockwave
        active={shockwaveRef.current.active}
        x={shockwaveRef.current.x}
        isElastic={isElastic}
        age={shockwaveRef.current.age}
      />

      {/* Dynamics Carts */}
      <DynamicsCart
        ref={cart1Ref}
        color="#2563eb"
        mass={params.mass_1}
        isLeft={true}
        restitution={params.restitution_coefficient}
      />
      <DynamicsCart
        ref={cart2Ref}
        color="#059669"
        mass={params.mass_2}
        isLeft={false}
        restitution={params.restitution_coefficient}
      />

      {/* Smooth 360° View Controls with Damping and comfortable Zoom */}
      <OrbitControls
        makeDefault
        enableZoom={true}
        zoomSpeed={1.2}
        enableDamping={true}
        dampingFactor={0.08}
        minDistance={2.5}
        maxDistance={28}
        minPolarAngle={0.05}
        maxPolarAngle={Math.PI / 2 - 0.05}
      />
    </>
  );
}

/*
=========================================================
MAIN IMPULSE MOMENTUM EXPORT COMPONENT
=========================================================
*/
const Scene3D = React.memo(function Scene3D({ params, results, isPlaying }) {
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
          title="Interactive 3D Track"
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
        <ImpulseMomentum2D params={params} results={results} isPlaying={isPlaying} />
      ) : (
        <CanvasErrorBoundary
          fallback={<ImpulseMomentum2D params={params} results={results} isPlaying={isPlaying} />}
        >
          <Canvas
            camera={{ position: [0, 5, 12], fov: 40 }}
            dpr={1}
            performance={{ min: 0.5 }}
            gl={{ powerPreference: "default", antialias: true, failIfMajorPerformanceCaveat: false, preserveDrawingBuffer: false }}
            shadows={false}
            onCreated={({ gl }) => {
              const handleContextLost = (e) => {
                e.preventDefault();
                console.warn("WebGL Context Lost in Impulse Momentum — Retaining 3D view");
              };
              gl.domElement.addEventListener("webglcontextlost", handleContextLost, false);
            }}
          >
            <color attach="background" args={['#1e293b']} />
            <Suspense fallback={null}>
              <CollisionScene params={params} results={results} isPlaying={isPlaying} />
            </Suspense>
          </Canvas>
        </CanvasErrorBoundary>
      )}
    </div>
  );
});

export default Scene3D;