import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, Text } from '@react-three/drei';
import * as THREE from 'three';

// --- LAB EQUIPMENT COMPONENTS ---

// 1. Photogate Sensor
const Photogate = ({ position }) => (
  <group position={position}>
    {/* Legs */}
    <mesh position={[0, 0.75, 0.7]} castShadow>
      <boxGeometry args={[0.2, 1.5, 0.2]} />
      <meshStandardMaterial color="#1f2937" />
    </mesh>
    <mesh position={[0, 0.75, -0.7]} castShadow>
      <boxGeometry args={[0.2, 1.5, 0.2]} />
      <meshStandardMaterial color="#1f2937" />
    </mesh>
    {/* Bridge / Sensor Laser area */}
    <mesh position={[0, 1.6, 0]} castShadow>
      <boxGeometry args={[0.3, 0.2, 1.6]} />
      <meshStandardMaterial color="#374151" />
    </mesh>
    {/* Red LED indicator */}
    <mesh position={[0, 1.6, 0.82]}>
      <circleGeometry args={[0.05, 16]} />
      <meshBasicMaterial color="#ef4444" />
    </mesh>
  </group>
);

// 2. Dynamics Cart with Hooke's Weights and Bumpers
const DynamicsCart = React.forwardRef(({ color, mass, isLeft, restitution }, ref) => {
  // Determine if bumper is magnetic (elastic) or velcro (inelastic)
  const isElastic = restitution > 0.5;
  const bumperColor = isElastic ? "#ef4444" : "#374151"; // Red magnet or dark grey velcro
  const dir = isLeft ? 1 : -1;

  // Calculate how many slotted weights to stack based on mass
  // Assuming base cart is 1kg, add a weight for every extra kg
  const extraWeights = Math.max(0, Math.floor(mass - 1));

  return (
    <group ref={ref}>
      {/* Main Aluminum Body */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[1.2, 0.3, 0.8]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Low-Friction Wheels */}
      {[-0.4, 0.4].map((x, i) => (
        <group key={i}>
          <mesh position={[x, 0.1, 0.42]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.05, 16]} />
            <meshStandardMaterial color="#111827" roughness={0.8} />
          </mesh>
          <mesh position={[x, 0.1, -0.42]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.05, 16]} />
            <meshStandardMaterial color="#111827" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Force Sensor Box (Mounted on top) */}
      <mesh position={[-0.3 * dir, 0.5, 0]} castShadow>
        <boxGeometry args={[0.4, 0.2, 0.3]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>

      {/* Velcro / Magnet Bumper */}
      <mesh position={[0.62 * dir, 0.25, 0]}>
        <boxGeometry args={[0.05, 0.2, 0.4]} />
        <meshStandardMaterial color={bumperColor} metalness={isElastic ? 0.8 : 0.1} />
      </mesh>

      {/* Hooke's Slotted Weights */}
      {Array.from({ length: extraWeights }).map((_, i) => (
        <mesh key={i} position={[0.2 * dir, 0.45 + (i * 0.15), 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.25, 0.1, 32]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
});

// 3. Track End Bumper with Rubber Shock Absorber
const TrackBumper = ({ position, isLeft }) => (
  <group position={position}>
    {/* Metal Bracket */}
    <mesh position={[0, 0.35, 0]} castShadow>
      <boxGeometry args={[0.3, 0.6, 1.18]} />
      <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
    </mesh>
    {/* High-density Rubber Stopper */}
    <mesh position={[(isLeft ? 0.2 : -0.2), 0.35, 0]}>
      <boxGeometry args={[0.15, 0.45, 0.9]} />
      <meshStandardMaterial color="#0f172a" roughness={0.9} />
    </mesh>
    {/* Safety Warning Yellow Stripes */}
    <mesh position={[0, 0.66, 0]}>
      <boxGeometry args={[0.3, 0.04, 1.18]} />
      <meshBasicMaterial color="#eab308" />
    </mesh>
  </group>
);

// --- MAIN SCENE LOGIC ---

function CollisionScene({ params, results, isPlaying }) {
  const cart1Ref = useRef();
  const cart2Ref = useRef();
  const timeRef = useRef(0);

  const initialDist = 12; // Start positions at x = -6 and x = +6
  const trackLimit = 13.75; // Boundary at bumpers (cart half-width 0.6 + bumper offset)

  // Initialize and reset cart positions
  React.useEffect(() => {
    timeRef.current = 0;
    if (cart1Ref.current && cart2Ref.current) {
      cart1Ref.current.position.x = -initialDist / 2;
      cart2Ref.current.position.x = initialDist / 2;
    }
  }, [params, results, isPlaying]);

  useFrame((state, delta) => {
    if (!cart1Ref.current || !cart2Ref.current) return;

    if (!isPlaying || !results) {
      // Keep carts stationary at their starting launch points
      cart1Ref.current.position.x = -initialDist / 2;
      cart2Ref.current.position.x = initialDist / 2;
      return;
    }

    const dt = Math.min(delta, 0.05);
    timeRef.current += dt;
    const t = timeRef.current;

    const relativeVelocity = params.initial_velocity_1 - params.initial_velocity_2;
    const tCollide = relativeVelocity > 0 ? initialDist / relativeVelocity : Infinity;

    let x1 = -initialDist / 2;
    let x2 = initialDist / 2;

    if (t < tCollide) {
      // Pre-collision (approaching)
      x1 = -initialDist / 2 + params.initial_velocity_1 * t;
      x2 = initialDist / 2 + params.initial_velocity_2 * t;
    } else {
      // Post-collision (after impact with cart separation offset)
      const tPost = t - tCollide;
      const collisionX = -initialDist / 2 + params.initial_velocity_1 * tCollide;
      
      x1 = collisionX - 0.6 + results.object_1.final_velocity_m_per_s * tPost;
      x2 = collisionX + 0.6 + results.object_2.final_velocity_m_per_s * tPost;
    }

    // Safely clamp within the physical track bumper limits (stops at bumper pads)
    cart1Ref.current.position.x = Math.max(-trackLimit, Math.min(trackLimit, x1));
    cart2Ref.current.position.x = Math.max(-trackLimit, Math.min(trackLimit, x2));
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
      
      {/* Aluminum Dynamics Track */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[30, 0.1, 1.2]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.3} />
      </mesh>
      
      {/* Measurement Tape / Scale on track */}
      <mesh position={[0, 0.11, 0.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 0.05]} />
        <meshBasicMaterial color="#eab308" /> 
      </mesh>

      {/* Track End Bumpers with rubber shock absorbers at both ends */}
      <TrackBumper position={[-14.5, 0.05, 0]} isLeft={true} />
      <TrackBumper position={[14.5, 0.05, 0]} isLeft={false} />

      {/* Photogates placed at ±4.5 meters */}
      <Photogate position={[-4.5, 0.1, 0]} />
      <Photogate position={[4.5, 0.1, 0]} />

      {/* Dynamics Carts */}
      <DynamicsCart 
        ref={cart1Ref} 
        color="#3b82f6" 
        mass={params.mass_1} 
        isLeft={true} 
        restitution={params.restitution_coefficient} 
      />
      <DynamicsCart 
        ref={cart2Ref} 
        color="#10b981" 
        mass={params.mass_2} 
        isLeft={false} 
        restitution={params.restitution_coefficient} 
      />

      {/* Environment lighting to make metals pop */}
      <Environment preset="city" />
      <Grid 
        infiniteGrid 
        fadeDistance={40} 
        sectionColor={"#666666"} 
        cellColor={"#222222"} 
        position={[0, -0.1, 0]} 
      />
      <OrbitControls 
        makeDefault 
        minPolarAngle={0} 
        maxPolarAngle={Math.PI / 2 - 0.05} // Prevent camera going under floor
      />
    </>
  );
}

export default function Scene3D({ params, results, isPlaying }) {
  return (
    <Canvas camera={{ position: [0, 5, 12], fov: 40 }} shadows>
      <color attach="background" args={['#1e293b']} />
      <CollisionScene params={params} results={results} isPlaying={isPlaying} />
    </Canvas>
  );
}