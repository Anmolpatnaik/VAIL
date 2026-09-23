import React, { useRef, useEffect, Suspense, Component } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useLabPerformance } from "./utils/useLabPerformance";

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
    console.warn("WebGL 3D Context Error in EDM:", err);
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
2D HIGH-PERFORMANCE EDM SCHEMATIC (Zero GPU Overhead)
=========================================================
*/
function EDMSchematic2D({ isMachining, toolShape }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let toolY = 120; // 120 is resting, 240 is plunging
    let targetToolY = isMachining ? 240 : 120;
    let bubbleList = Array.from({ length: 15 }, () => ({
      x: 200 + Math.random() * 320,
      y: 180 + Math.random() * 180,
      r: 2 + Math.random() * 4,
      speed: 1 + Math.random() * 2,
    }));

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;

      // Animate tool plunge
      targetToolY = isMachining ? 230 : 120;
      toolY += (targetToolY - toolY) * 0.08;

      // Dark Chamber Background
      ctx.fillStyle = "#030811";
      ctx.fillRect(0, 0, w, h);

      // Blueprint Chamber Grid
      ctx.strokeStyle = "rgba(56, 189, 248, 0.07)";
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
      ctx.fillText(`ELECTRO-DISCHARGE MACHINING (EDM) • ${toolShape ? toolShape.toUpperCase() : "CYLINDRICAL"} ELECTRODE`, 24, 30);

      // Dielectric Tank Container
      const tankX = 140;
      const tankY = 130;
      const tankW = 440;
      const tankH = 260;

      // Fluid Fill
      ctx.fillStyle = "rgba(14, 116, 144, 0.28)";
      ctx.fillRect(tankX + 10, tankY + 40, tankW - 20, tankH - 45);

      // Fluid Level Line
      ctx.strokeStyle = "rgba(56, 189, 248, 0.7)";
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.moveTo(tankX + 10, tankY + 40);
      ctx.lineTo(tankX + tankW - 10, tankY + 40);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#38bdf8";
      ctx.font = "10px monospace";
      ctx.fillText("DIELECTRIC HYDROCARBON OIL LEVEL", tankX + 16, tankY + 34);

      // Dielectric bubbles if machining
      if (isMachining) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        bubbleList.forEach((b) => {
          b.y -= b.speed;
          if (b.y < tankY + 40) b.y = tankY + tankH - 30;
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // Tank Walls
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 4;
      ctx.strokeRect(tankX, tankY, tankW, tankH);

      // Workpiece (Steel Block at Tank Bottom)
      const wpW = 260;
      const wpH = 70;
      const wpX = (w - wpW) / 2;
      const wpY = tankY + tankH - wpH - 15;

      ctx.fillStyle = "#334155";
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 2;
      ctx.fillRect(wpX, wpY, wpW, wpH);
      ctx.strokeRect(wpX, wpY, wpW, wpH);

      // Workpiece Label
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 12px monospace";
      ctx.textAlign = "center";
      ctx.fillText("WORKPIECE (ANODE +)", w / 2, wpY + 45);

      // Crater / Machining Cavity
      const craterDepth = Math.max(0, (toolY - 180) * 0.18);
      if (craterDepth > 0) {
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(w / 2 - 40, wpY, 80, craterDepth);
        ctx.strokeStyle = "#fbbf24";
        ctx.strokeRect(w / 2 - 40, wpY, 80, craterDepth);
      }

      // Moving Tool Assembly (Electrode & Servo Ram)
      const holderW = 90;
      const holderH = 60;
      const holderX = (w - holderW) / 2;
      const holderY = toolY - 80;

      // Servo Ram
      ctx.fillStyle = "#eab308";
      ctx.strokeStyle = "#ca8a04";
      ctx.lineWidth = 2;
      ctx.fillRect(holderX, holderY, holderW, holderH);
      ctx.strokeRect(holderX, holderY, holderW, holderH);

      ctx.fillStyle = "#000000";
      ctx.font = "bold 10px monospace";
      ctx.fillText("SERVO FEED", w / 2, holderY + 25);
      ctx.fillText("CATHODE (−)", w / 2, holderY + 42);

      // Electrode Tip (Copper)
      const elecW = toolShape === "cubical" ? 50 : 36;
      const elecH = 65;
      const elecX = (w - elecW) / 2;
      const elecY = holderY + holderH;

      ctx.fillStyle = "#b45309";
      ctx.strokeStyle = "#f59e0b";
      ctx.fillRect(elecX, elecY, elecW, elecH);
      ctx.strokeRect(elecX, elecY, elecW, elecH);

      ctx.fillStyle = "#fef08a";
      ctx.font = "bold 9px monospace";
      ctx.fillText("Cu TOOL", w / 2, elecY + elecH / 2 + 3);

      // Electric Spark / Plasma Channel
      if (isMachining && Math.abs(elecY + elecH - wpY) < 35) {
        const sparkGapY = elecY + elecH;
        // Dynamic spark arcs
        ctx.strokeStyle = "#38bdf8";
        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 12;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          const arcStartX = elecX + 6 + Math.random() * (elecW - 12);
          const arcEndX = arcStartX + (Math.random() - 0.5) * 16;
          ctx.moveTo(arcStartX, sparkGapY);
          ctx.lineTo(arcStartX + (Math.random() - 0.5) * 10, sparkGapY + 8);
          ctx.lineTo(arcEndX, wpY + craterDepth);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Central white plasma flash
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(w / 2 + (Math.random() - 0.5) * 10, sparkGapY + 5, 5 + Math.random() * 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Live Telemetry Sidebar / Cards
      ctx.textAlign = "left";
      ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
      ctx.strokeStyle = isMachining ? "#38bdf8" : "#475569";
      ctx.fillRect(24, 75, 100, 110);
      ctx.strokeRect(24, 75, 100, 110);

      ctx.fillStyle = "#64748b";
      ctx.font = "9px monospace";
      ctx.fillText("STATUS", 34, 94);
      ctx.fillStyle = isMachining ? "#38bdf8" : "#94a3b8";
      ctx.font = "bold 13px monospace";
      ctx.fillText(isMachining ? "SPARKING" : "STANDBY", 34, 112);

      ctx.fillStyle = "#64748b";
      ctx.font = "9px monospace";
      ctx.fillText("GAP VOLTAGE", 34, 134);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px monospace";
      ctx.fillText(isMachining ? "45.0 V" : "0.0 V", 34, 150);

      ctx.fillStyle = "#64748b";
      ctx.font = "9px monospace";
      ctx.fillText("DISCHARGE", 34, 168);
      ctx.fillStyle = isMachining ? "#4ade80" : "#64748b";
      ctx.font = "bold 11px monospace";
      ctx.fillText(isMachining ? "ACTIVE ARC" : "OPEN GAP", 34, 180);

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isMachining, toolShape]);

  return (
    <canvas
      ref={canvasRef}
      width={720}
      height={480}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        background: "#030811",
      }}
    />
  );
}

/*
=========================================================
3D EDM SCENE (Optimized)
=========================================================
*/
function EDMScene({ isMachining, toolShape }) {
  const toolRef = useRef();
  const sparkLightRef = useRef();
  const sparkMeshRef = useRef();

  useFrame((state, delta) => {
    if (!toolRef.current) return;

    if (isMachining) {
      toolRef.current.position.y = THREE.MathUtils.lerp(toolRef.current.position.y, 0.6, 2 * delta);
      if (sparkLightRef.current && sparkMeshRef.current) {
        sparkLightRef.current.intensity = Math.random() * 2 + 1;
        sparkLightRef.current.visible = true;
        sparkMeshRef.current.scale.setScalar(Math.random() * 0.5 + 0.6);
        sparkMeshRef.current.visible = true;
      }
    } else {
      toolRef.current.position.y = THREE.MathUtils.lerp(toolRef.current.position.y, 2.5, 2 * delta);
      if (sparkLightRef.current && sparkMeshRef.current) {
        sparkLightRef.current.visible = false;
        sparkMeshRef.current.visible = false;
      }
    }
  });

  return (
    <group>
      <mesh position={[0, -1, 0]}>
        <boxGeometry args={[4, 1, 4]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      <mesh position={[0, -0.25, 0]}>
        <boxGeometry args={[2, 0.5, 2]} />
        <meshStandardMaterial color="#475569" />
      </mesh>

      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[3.5, 1.5, 3.5]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.3} depthWrite={false} />
      </mesh>

      <group ref={toolRef} position={[0, 2.5, 0]}>
        <mesh position={[0, 1, 0]}>
          <boxGeometry args={[1.2, 1.2, 1.2]} />
          <meshStandardMaterial color="#eab308" />
        </mesh>

        <mesh position={[0, 0, 0]}>
          {toolShape === "cubical" ? (
            <boxGeometry args={[0.6, 1.5, 0.6]} />
          ) : (
            <cylinderGeometry args={[0.3, 0.3, 1.5, 32]} />
          )}
          <meshStandardMaterial color="#78350f" />
        </mesh>

        <pointLight ref={sparkLightRef} position={[0, -0.8, 0]} color="#38bdf8" distance={5} />
        <mesh ref={sparkMeshRef} position={[0, -0.8, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
        </mesh>
      </group>

      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} />
    </group>
  );
}

/*
=========================================================
MAIN EDM EXPORT COMPONENT
=========================================================
*/
const EDM3D = React.memo(function EDM3D({ isMachining, toolShape }) {
  const { mode: viewMode, setMode: setViewMode } = useLabPerformance();

  return (
    <div style={{ width: "100%", height: "100%", minHeight: "520px", position: "relative", borderRadius: "12px", overflow: "hidden", background: "#000000" }}>
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
          title="Interactive 3D Machining Chamber"
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
        <EDMSchematic2D isMachining={isMachining} toolShape={toolShape} />
      ) : (
        <CanvasErrorBoundary
          fallback={<EDMSchematic2D isMachining={isMachining} toolShape={toolShape} />}
        >
          <Canvas
            camera={{ position: [6, 5, 6], fov: 40 }}
            dpr={1}
            performance={{ min: 0.5 }}
            gl={{ powerPreference: "default", antialias: true, failIfMajorPerformanceCaveat: false, preserveDrawingBuffer: false }}
            shadows={false}
            onCreated={({ gl }) => {
              const handleContextLost = (e) => {
                e.preventDefault();
                console.warn("WebGL Context Lost in EDM — Retaining 3D view");
              };
              gl.domElement.addEventListener("webglcontextlost", handleContextLost, false);
            }}
          >
            <color attach="background" args={["#000000"]} />
            <OrbitControls makeDefault enableZoom={true} zoomSpeed={1.2} enableDamping={true} dampingFactor={0.08} minDistance={2.5} maxDistance={25} />
            <Suspense fallback={null}>
              <EDMScene isMachining={isMachining} toolShape={toolShape} />
            </Suspense>
          </Canvas>
        </CanvasErrorBoundary>
      )}
    </div>
  );
});

export default EDM3D;