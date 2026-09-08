import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei"; // Added for 360 Camera Controls
import * as THREE from "three";

function EDMScene({ isMachining, toolShape }) {
  // References to directly manipulate 3D objects without re-rendering
  const toolRef = useRef();
  const sparkLightRef = useRef();
  const sparkMeshRef = useRef();

  // The animation loop (runs every frame)
  useFrame((state, delta) => {
    if (!toolRef.current) return;

    if (isMachining) {
      // 1. Smoothly plunge the electrode DOWN into the workpiece
      toolRef.current.position.y = THREE.MathUtils.lerp(
        toolRef.current.position.y,
        0.6, // Machining depth
        2 * delta
      );

      // 2. Flicker the electric plasma spark
      if (sparkLightRef.current && sparkMeshRef.current) {
        sparkLightRef.current.intensity = Math.random() * 2 + 1; // Flicker light
        sparkLightRef.current.visible = true;

        sparkMeshRef.current.scale.setScalar(Math.random() * 0.5 + 0.6); // Flicker size
        sparkMeshRef.current.visible = true;
      }
    } else {
      // 1. Smoothly lift the electrode UP to the resting position
      toolRef.current.position.y = THREE.MathUtils.lerp(
        toolRef.current.position.y,
        2.5, // Resting height
        2 * delta
      );

      // 2. Hide the sparks when not machining
      if (sparkLightRef.current && sparkMeshRef.current) {
        sparkLightRef.current.visible = false;
        sparkMeshRef.current.visible = false;
      }
    }
  });

  return (
    <group>
      {/* Base Platform */}
      <mesh position={[0, -1, 0]}>
        <boxGeometry args={[4, 1, 4]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      {/* Workpiece (Steel Block) */}
      <mesh position={[0, -0.25, 0]}>
        <boxGeometry args={[2, 0.5, 2]} />
        <meshStandardMaterial color="#475569" />
      </mesh>

      {/* Dielectric Fluid Tank (Transparent) */}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[3.5, 1.5, 3.5]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.3} depthWrite={false} />
      </mesh>

      {/* Moving Tool Assembly (Electrode) */}
      <group ref={toolRef} position={[0, 2.5, 0]}>
        {/* Top Machine Holder (Yellow) */}
        <mesh position={[0, 1, 0]}>
          <boxGeometry args={[1.2, 1.2, 1.2]} />
          <meshStandardMaterial color="#eab308" />
        </mesh>

        {/* Dynamic Electrode Rod (Copper/Brown) - Changes based on Dropdown */}
        <mesh position={[0, 0, 0]}>
          {toolShape === "cubical" ? (
            <boxGeometry args={[0.6, 1.5, 0.6]} />
          ) : (
            <cylinderGeometry args={[0.3, 0.3, 1.5, 32]} />
          )}
          <meshStandardMaterial color="#78350f" />
        </mesh>

        {/* Electric Spark / Plasma Effects */}
        <pointLight ref={sparkLightRef} position={[0, -0.8, 0]} color="#38bdf8" distance={5} />
        <mesh ref={sparkMeshRef} position={[0, -0.8, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
        </mesh>
      </group>

      {/* Scene Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} />
    </group>
  );
}

// Main Export Component
export default function EDM3D({ isMachining, toolShape }) {
  return (
    <Canvas camera={{ position: [6, 5, 6], fov: 40 }}>
      <color attach="background" args={["#000000"]} />
      
      {/* Allows the user to rotate 360°, pan, and zoom! */}
      <OrbitControls makeDefault /> 
      
      {/* Pass the state from EDMSimulation directly into our animated Scene */}
      <EDMScene isMachining={isMachining} toolShape={toolShape} />
    </Canvas>
  );
}