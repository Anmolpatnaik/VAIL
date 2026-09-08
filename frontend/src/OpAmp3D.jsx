import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';

function OpAmpScene({ vin, vout, isSaturated, config, isRunning }) {
  const chipRef = useRef();
  const ledRef = useRef();
  const pulseRef = useRef();

  useFrame((state) => {
    try {
      const time = state.clock.getElapsedTime();
      
      if (chipRef.current) {
        // Stop floating if not running
        chipRef.current.position.y = isRunning ? (0.05 + Math.sin(time * 2) * 0.015) : 0.05;
      }
      
      if (ledRef.current && ledRef.current.material) {
        // Dim LED pulse when stopped
        ledRef.current.material.opacity = isRunning ? (0.6 + Math.sin(time * 12) * 0.4) : 0.2;
      }
      
      if (pulseRef.current) {
        // Hide signal flow particle when stopped
        pulseRef.current.visible = isRunning;
        if (isRunning) {
          pulseRef.current.position.x = -1.5 + ((time * 3) % 3.0);
        }
      }
    } catch (e) {
      // Prevents frame drops or WebGL crashes from locking the UI thread
    }
  });

  const ledColor = !isRunning ? "#64748b" : (isSaturated ? "#ef4444" : "#22c55e");

  return (
    <>
      <ambientLight intensity={1.0} />
      <directionalLight position={[6, 12, 6]} intensity={1.8} castShadow />
      <pointLight position={[-4, 4, -4]} intensity={0.8} color="#38bdf8" />
      <OrbitControls makeDefault maxPolarAngle={Math.PI / 2 + 0.02} minDistance={3} maxDistance={10} />

      {/* PCB Base Board */}
      <mesh position={[0, -0.6, 0]} receiveShadow>
        <boxGeometry args={[5.5, 0.2, 4.2]} />
        <meshStandardMaterial color="#064e3b" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Gold Copper Traces */}
      <group position={[0, -0.48, 0]}>
        <mesh>
          <boxGeometry args={[4.8, 0.01, 3.5]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.1} />
        </mesh>
      </group>

      {/* Capacitors */}
      <mesh position={[-1.8, -0.35, -1.2]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.4, 16]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[1.8, -0.35, -1.2]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.4, 16]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Resistor Component Block */}
      <mesh position={[0, -0.38, -1.3]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshStandardMaterial color="#ca8a04" roughness={0.4} />
      </mesh>

      {/* IC 741 Op-Amp Chip Package */}
      <group ref={chipRef} position={[0, 0.05, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.8, 0.3, 1.0]} />
          <meshStandardMaterial color="#0f172a" roughness={0.25} metalness={0.6} />
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
              <meshStandardMaterial color="#e2e8f0" metalness={0.98} roughness={0.05} />
            </mesh>
            <mesh position={[x, -0.15, 0.55]}>
              <boxGeometry args={[0.1, 0.05, 0.4]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.98} roughness={0.05} />
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

      <ContactShadows position={[0, -0.7, 0]} opacity={0.6} scale={9} blur={2.5} resolution={256} />
    </>
  );
}

export default function OpAmp3D({ vin, vout, isSaturated, config, isRunning }) {
  return (
    <div style={{ width: "100%", height: "550px", position: "relative", borderRadius: "12px", overflow: "hidden" }}>
      <Canvas gl={{ preserveDrawingBuffer: true }} camera={{ position: [3, 3.5, 4.5], fov: 45 }} style={{ background: "#030712" }}>
        <OpAmpScene vin={vin} vout={vout} isSaturated={isSaturated} config={config} isRunning={isRunning} />
      </Canvas>
    </div>
  );
}