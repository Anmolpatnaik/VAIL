import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, Text, QuadraticBezierLine } from '@react-three/drei';
import * as THREE from 'three';

// --- LAB EQUIPMENT COMPONENTS ---

const SignalGenerator = ({ frequency }) => (
  <group position={[-6, 0.6, -1.5]}>
    {/* Main Body */}
    <mesh castShadow>
      <boxGeometry args={[1.5, 1.2, 1.2]} />
      <meshStandardMaterial color="#cbd5e1" metalness={0.4} />
    </mesh>
    {/* Screen Display */}
    <mesh position={[0, 0.2, 0.61]}>
      <planeGeometry args={[1.2, 0.5]} />
      <meshBasicMaterial color="#111827" />
    </mesh>
    <Text position={[0, 0.2, 0.62]} fontSize={0.2} color="#10b981">
      {frequency ? `${frequency.toFixed(1)} Hz` : "OFF"}
    </Text>
    {/* Knobs */}
    <mesh position={[-0.3, -0.3, 0.61]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
      <meshStandardMaterial color="#374151" />
    </mesh>
    <mesh position={[0.3, -0.3, 0.61]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
      <meshStandardMaterial color="#374151" />
    </mesh>
  </group>
);

const StringVibrator = () => (
  <group position={[-5, 0.25, 0]}>
    <mesh castShadow>
      <boxGeometry args={[0.8, 0.5, 0.6]} />
      <meshStandardMaterial color="#1e293b" />
    </mesh>
    {/* Vibrator Peg (The part that drives the string) */}
    <mesh position={[0, 0.4, 0]}>
      <cylinderGeometry args={[0.05, 0.05, 0.3, 16]} />
      <meshStandardMaterial color="#94a3b8" metalness={0.8} />
    </mesh>
  </group>
);

const BenchPulley = () => (
  <group position={[5.2, 0.5, 0]}>
    {/* Support Stand Clamp */}
    <mesh position={[-0.2, -0.5, 0]} castShadow>
      <boxGeometry args={[0.4, 1, 0.2]} />
      <meshStandardMaterial color="#374151" metalness={0.8} />
    </mesh>
    {/* Pulley Wheel */}
    <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
      <cylinderGeometry args={[0.2, 0.2, 0.1, 32]} />
      <meshStandardMaterial color="#f1f5f9" metalness={0.5} />
    </mesh>
  </group>
);

const SlottedMasses = ({ tension }) => {
  // Assuming 1 slotted mass = 1 N (approx 100g) for visualization purposes
  const numMasses = Math.min(10, Math.max(1, Math.floor(tension / 5))); 
  
  return (
    <group position={[5.4, 0.3, 0]}>
      {/* Vertical Hanger Rod */}
      <mesh position={[0, -1, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 2.5, 8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} />
      </mesh>
      {/* Base of Hanger */}
      <mesh position={[0, -2.2, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.05, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} />
      </mesh>
      {/* Stacked Masses */}
      {Array.from({ length: numMasses }).map((_, i) => (
        <mesh key={i} position={[0, -2.1 + (i * 0.12), 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.1, 32]} />
          <meshStandardMaterial color="#eab308" metalness={0.7} roughness={0.4} /> {/* Brass look */}
        </mesh>
      ))}
    </group>
  );
};

// The Live Animating String
const VibratingString = ({ mode, amplitude, isPlaying, angularFreq, linearDensity }) => {
  const lineRef = useRef();
  const numPoints = 150;
  const visualLength = 10; // Spans from x=-5 to x=5 in the 3D scene
  
  // Create an initial flat line
  const positions = useMemo(() => new Float32Array(numPoints * 3), [numPoints]);

  useFrame((state) => {
    if (!lineRef.current) return;
    const t = isPlaying ? state.clock.elapsedTime : 0;
    const posAttribute = lineRef.current.geometry.attributes.position;
    
    // Animate the wave equation using a buffer geometry for maximum performance
    for (let i = 0; i < numPoints; i++) {
      const x = (i / (numPoints - 1)) * visualLength; 
      const ratio = x / visualLength; // 0 to 1
      
      // y = A * sin(n * pi * x/L) * cos(omega * t)
      // Visual amplitude is scaled up slightly for 3D visibility
      const y = isPlaying 
        ? (amplitude * 5) * Math.sin(mode * Math.PI * ratio) * Math.cos(angularFreq * t * 0.5) 
        : 0;

      // Center the string between -5 and 5
      posAttribute.setXYZ(i, x - 5, y + 0.5, 0); 
    }
    posAttribute.needsUpdate = true;
  });

  // Thicker string for higher density
  const thickness = linearDensity > 0.005 ? 4 : 2;
  const stringColor = linearDensity > 0.005 ? "#ffffff" : "#f59e0b"; // White thick string vs copper wire

  return (
    <line ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={numPoints} array={positions} itemSize={3} />
      </bufferGeometry>
      <lineBasicMaterial color={stringColor} linewidth={thickness} />
    </line>
  );
};

// --- MAIN SCENE ---

export default function Scene3D({ params, results, isPlaying }) {
  const angularFreq = results?.physics?.angular_frequency_rad_per_s || 0;
  const displayFreq = results?.physics?.frequency_hz || 0;

  return (
    <Canvas camera={{ position: [0, 4, 10], fov: 45 }} shadows>
      <color attach="background" args={['#1e293b']} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />

      {/* Lab Bench / Table */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[18, 1, 8]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>

      {/* Lab Equipment */}
      <SignalGenerator frequency={displayFreq} />
      <StringVibrator />
      <BenchPulley />
      <SlottedMasses tension={params.tension} />
      
      {/* Connecting Patch Cords (Banana Plugs) */}
      <QuadraticBezierLine start={[-5.8, 0.4, -0.9]} mid={[-5.5, 0.1, -0.5]} end={[-5.2, 0.3, -0.2]} color="red" lineWidth={3} />
      <QuadraticBezierLine start={[-5.6, 0.4, -0.9]} mid={[-5.3, 0.1, -0.5]} end={[-5.0, 0.3, -0.2]} color="black" lineWidth={3} />

      {/* Meter Stick */}
      <mesh position={[0, 0.01, 0.5]} rotation={[-Math.PI/2, 0, 0]}>
        <planeGeometry args={[10, 0.3]} />
        <meshStandardMaterial color="#fcd34d" />
      </mesh>

      {/* Electronic Balance (Side of table) */}
      <group position={[-7, 0.1, 2]}>
        <mesh castShadow>
          <boxGeometry args={[1.5, 0.2, 1.5]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
        <mesh position={[0, 0.11, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.05, 32]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} />
        </mesh>
      </group>

      {/* The Physics Driven String */}
      <VibratingString 
        mode={params.mode} 
        amplitude={params.amplitude} 
        isPlaying={isPlaying} 
        angularFreq={angularFreq} 
        linearDensity={params.linear_density}
      />

      <Environment preset="city" />
      <Grid infiniteGrid fadeDistance={40} sectionColor={"#444"} cellColor={"#222"} position={[0, -0.49, 0]} />
      <OrbitControls makeDefault maxPolarAngle={Math.PI / 2 + 0.1} />
    </Canvas>
  );
}