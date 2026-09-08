import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Line, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

/*
=========================================================
 HYSTERESIS3D.jsx
 COMPLETE DROP-IN 3D HYSTERESIS LAB
=========================================================

 Compatible with:

 <Hysteresis3D
   powerOn={running}
   field={magneticField}
   magnetization={fluxDensity}
   frequency={frequency}
   loss={loss}
   temperature={25}
   mode="normal"
   loopPoints={loopPoints}
 />

=========================================================
*/

export default function Hysteresis3D({
  powerOn = false,
  field = 0,
  magnetization = 0,
  frequency = 50,
  loss = 0,
  temperature = 25,
  mode = "normal",
  loopPoints = [],
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "620px",
        minHeight: "620px",
        position: "relative",
        overflow: "hidden",
        borderRadius: "12px",
        background: "#06101c",
      }}
    >
      {/* =================================================
          TOP INFORMATION
      ================================================= */}

      <div
        style={{
          position: "absolute",
          top: 14,
          left: 18,
          right: 18,
          zIndex: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          pointerEvents: "none",
        }}
      >
        <div>
          <div
            style={{
              color: "white",
              fontSize: "19px",
              fontWeight: "700",
            }}
          >
            🧲 3D B–H Hysteresis Laboratory
          </div>

          <div
            style={{
              color: "#8fa3b8",
              fontSize: "11px",
              marginTop: "4px",
            }}
          >
            AC source • magnetizing coil • magnetic core •
            search coil • CRO
          </div>
        </div>

        <div
          style={{
            padding: "8px 12px",
            borderRadius: "20px",
            background: powerOn
              ? "rgba(34,197,94,0.18)"
              : "rgba(100,116,139,0.18)",
            border: powerOn
              ? "1px solid rgba(74,222,128,0.5)"
              : "1px solid rgba(148,163,184,0.3)",
            color: powerOn ? "#4ade80" : "#94a3b8",
            fontSize: "11px",
            fontWeight: "700",
          }}
        >
          ● {powerOn ? "EXPERIMENT RUNNING" : "STANDBY"}
        </div>
      </div>

      {/* =================================================
          LIVE VALUES
      ================================================= */}

      <div
        style={{
          position: "absolute",
          right: 15,
          top: 65,
          zIndex: 10,
          width: "175px",
          padding: "12px",
          borderRadius: "10px",
          background: "rgba(2,8,16,0.88)",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "white",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            color: "#7f93a8",
            fontSize: "9px",
            letterSpacing: "1px",
            marginBottom: "8px",
          }}
        >
          LIVE MEASUREMENTS
        </div>

        <Measurement
          label="H"
          value={`${Number(field).toFixed(1)} A/m`}
        />

        <Measurement
          label="B"
          value={`${Number(magnetization).toFixed(3)} T`}
        />

        <Measurement
          label="Frequency"
          value={`${Number(frequency).toFixed(1)} Hz`}
        />

        <Measurement
          label="Loss"
          value={`${Number(loss).toFixed(3)} W`}
        />

        <Measurement
          label="Core"
          value={`${Number(temperature).toFixed(1)} °C`}
        />
      </div>

      {/* =================================================
          THREE.JS
      ================================================= */}

      <Canvas
        camera={{
          position: [10, 6.5, 11],
          fov: 45,
          near: 0.1,
          far: 100,
        }}
        dpr={[1, 2]}
      >
        <color attach="background" args={["#06101c"]} />

        {/* LIGHTING */}

        <ambientLight intensity={1.4} />

        <directionalLight
          position={[5, 10, 6]}
          intensity={2.5}
        />

        <directionalLight
          position={[-6, 5, -4]}
          intensity={1.5}
        />

        <pointLight
          position={[0, 4, 4]}
          intensity={2}
        />

        {/* FLOOR */}

        <LabFloor />

        {/* AC SOURCE */}

        <ACSource
          powerOn={powerOn}
          frequency={frequency}
        />

        {/* MAIN APPARATUS */}

        <MagneticApparatus
          powerOn={powerOn}
          field={field}
          magnetization={magnetization}
          frequency={frequency}
        />

        {/* CRO */}

        <CRO
          powerOn={powerOn}
          field={field}
          magnetization={magnetization}
          loopPoints={loopPoints}
        />

        {/* CAMERA */}

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          minDistance={6}
          maxDistance={18}
          target={[0, 1.2, 0]}
        />
      </Canvas>

      {/* =================================================
          BOTTOM STATUS
      ================================================= */}

      <div
        style={{
          position: "absolute",
          bottom: 14,
          left: 15,
          zIndex: 10,
          padding: "8px 12px",
          borderRadius: "8px",
          background: "rgba(2,8,16,0.88)",
          color: "#b9c7d6",
          fontSize: "10px",
          pointerEvents: "none",
        }}
      >
        <span
          style={{
            color: powerOn ? "#4ade80" : "#64748b",
          }}
        >
          ●
        </span>{" "}
        H = {Number(field).toFixed(1)} A/m
        {"   "}
        B = {Number(magnetization).toFixed(3)} T
        {"   "}
        • {loopPoints.length} samples
      </div>
    </div>
  );
}

/*
=========================================================
 MEASUREMENT ROW
=========================================================
*/

function Measurement({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "6px",
        fontSize: "11px",
      }}
    >
      <span style={{ color: "#8fa3b8" }}>{label}</span>

      <strong style={{ color: "#e2e8f0" }}>
        {value}
      </strong>
    </div>
  );
}

/*
=========================================================
 FLOOR
=========================================================
*/

function LabFloor() {
  return (
    <group>
      <RoundedBox
        args={[14, 0.35, 8]}
        radius={0.12}
        smoothness={4}
        position={[0, -0.35, 0]}
      >
        <meshStandardMaterial
          color="#172638"
          roughness={0.7}
          metalness={0.15}
        />
      </RoundedBox>

      <gridHelper
        args={[14, 28, "#294057", "#182b3d"]}
        position={[0, -0.16, 0]}
      />
    </group>
  );
}

/*
=========================================================
 AC SOURCE
=========================================================
*/

function ACSource({ powerOn, frequency }) {
  const lampRef = useRef();
  const waveRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (lampRef.current) {
      if (powerOn) {
        const pulse =
          0.9 +
          0.2 *
            Math.sin(
              t *
                Math.max(
                  1,
                  Number(frequency) * 0.15
                )
            );

        lampRef.current.scale.setScalar(pulse);
      } else {
        lampRef.current.scale.setScalar(0.75);
      }
    }

    if (waveRef.current && powerOn) {
      waveRef.current.rotation.z =
        Math.sin(t * 2) * 0.04;
    }
  });

  return (
    <group position={[-4.4, 1.15, 0]}>
      {/* BODY */}

      <RoundedBox
        args={[2.2, 2.3, 1.25]}
        radius={0.15}
        smoothness={5}
      >
        <meshStandardMaterial
          color="#263342"
          metalness={0.5}
          roughness={0.35}
        />
      </RoundedBox>

      {/* DISPLAY */}

      <RoundedBox
        args={[1.75, 0.8, 0.08]}
        radius={0.04}
        smoothness={3}
        position={[0, 0.35, 0.67]}
      >
        <meshStandardMaterial
          color="#06121d"
          emissive="#063452"
          emissiveIntensity={0.7}
        />
      </RoundedBox>

      <Text
        position={[0, 0.55, 0.73]}
        fontSize={0.16}
        color="#38bdf8"
        anchorX="center"
      >
        AC SOURCE
      </Text>

      <Text
        position={[0, 0.32, 0.73]}
        fontSize={0.13}
        color="white"
        anchorX="center"
      >
        6 V RMS
      </Text>

      <Text
        position={[0, 0.10, 0.73]}
        fontSize={0.11}
        color="#94a3b8"
        anchorX="center"
      >
        {Number(frequency).toFixed(0)} Hz
      </Text>

      {/* WAVEFORM */}

      <Line
        ref={waveRef}
        points={[
          [-0.7, -0.05, 0.72],
          [-0.5, 0.13, 0.72],
          [-0.3, 0.2, 0.72],
          [-0.1, 0.05, 0.72],
          [0.1, -0.17, 0.72],
          [0.3, -0.1, 0.72],
          [0.5, 0.15, 0.72],
          [0.7, 0.05, 0.72],
        ]}
        color={powerOn ? "#38bdf8" : "#334155"}
        lineWidth={2}
      />

      {/* POWER LAMP */}

      <mesh
        ref={lampRef}
        position={[0, -0.7, 0.67]}
      >
        <sphereGeometry args={[0.16, 20, 20]} />

        <meshStandardMaterial
          color={powerOn ? "#22c55e" : "#475569"}
          emissive={powerOn ? "#16a34a" : "#000000"}
          emissiveIntensity={powerOn ? 3 : 0}
        />
      </mesh>

      <Text
        position={[0, -0.98, 0.67]}
        fontSize={0.11}
        color={powerOn ? "#4ade80" : "#64748b"}
        anchorX="center"
      >
        {powerOn ? "OUTPUT ON" : "OUTPUT OFF"}
      </Text>
    </group>
  );
}

/*
=========================================================
 MAIN MAGNETIC APPARATUS
=========================================================
*/

function MagneticApparatus({
  powerOn,
  field,
  magnetization,
  frequency,
}) {
  return (
    <group position={[0, 1.25, 0]}>
      <MagneticCore
        magnetization={magnetization}
      />

      <MagnetizingCoil
        powerOn={powerOn}
        field={field}
        frequency={frequency}
      />

      <SearchCoil
        powerOn={powerOn}
        magnetization={magnetization}
      />

      <FluxLines
        powerOn={powerOn}
        field={field}
        magnetization={magnetization}
      />

      <Wires powerOn={powerOn} />
    </group>
  );
}

/*
=========================================================
 FERROMAGNETIC CORE
=========================================================
*/

function MagneticCore({ magnetization }) {
  const groupRef = useRef();

  const b = Math.abs(Number(magnetization) || 0);

  const glow =
    Math.min(1, b / 1.5);

  useFrame((state) => {
    if (!groupRef.current) return;

    if (glow > 0) {
      groupRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 1.2) *
        0.015 *
        glow;
    }
  });

  return (
    <group ref={groupRef}>
      {/* TOP */}

      <mesh position={[0, 1.05, 0]}>
        <boxGeometry args={[3.3, 0.6, 1.25]} />

        <meshStandardMaterial
          color="#475569"
          metalness={0.7}
          roughness={0.3}
          emissive="#17324a"
          emissiveIntensity={glow * 0.5}
        />
      </mesh>

      {/* BOTTOM */}

      <mesh position={[0, -1.05, 0]}>
        <boxGeometry args={[3.3, 0.6, 1.25]} />

        <meshStandardMaterial
          color="#475569"
          metalness={0.7}
          roughness={0.3}
          emissive="#17324a"
          emissiveIntensity={glow * 0.5}
        />
      </mesh>

      {/* LEFT */}

      <mesh position={[-1.35, 0, 0]}>
        <boxGeometry args={[0.6, 2.5, 1.25]} />

        <meshStandardMaterial
          color="#526274"
          metalness={0.7}
          roughness={0.3}
          emissive="#17324a"
          emissiveIntensity={glow * 0.5}
        />
      </mesh>

      {/* RIGHT */}

      <mesh position={[1.35, 0, 0]}>
        <boxGeometry args={[0.6, 2.5, 1.25]} />

        <meshStandardMaterial
          color="#526274"
          metalness={0.7}
          roughness={0.3}
          emissive="#17324a"
          emissiveIntensity={glow * 0.5}
        />
      </mesh>

      {/* CORE LABEL */}

      <Text
        position={[0, 0, 0.68]}
        rotation={[0, 0, 0]}
        fontSize={0.18}
        color="#cbd5e1"
        anchorX="center"
      >
        FERROMAGNETIC CORE
      </Text>
    </group>
  );
}

/*
=========================================================
 MAGNETIZING COIL
=========================================================
*/

function MagnetizingCoil({
  powerOn,
  field,
  frequency,
}) {
  const coilRef = useRef();

  const rotationSpeed =
    powerOn
      ? 0.4 +
        Math.min(
          2,
          Math.abs(Number(frequency)) / 40
        )
      : 0;

  useFrame((state, delta) => {
    if (!coilRef.current) return;

    if (powerOn) {
      coilRef.current.rotation.y +=
        delta * rotationSpeed;
    }
  });

  const rings = useMemo(() => {
    return Array.from(
      { length: 9 },
      (_, i) => -1 + i * 0.25
    );
  }, []);

  return (
    <group ref={coilRef}>
      {rings.map((x, index) => (
        <mesh
          key={index}
          position={[x * 1.15, 0, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry
            args={[
              1.45,
              0.055,
              12,
              32,
            ]}
          />

          <meshStandardMaterial
            color={powerOn ? "#f59e0b" : "#7c5a20"}
            emissive={
              powerOn ? "#b45309" : "#000000"
            }
            emissiveIntensity={
              powerOn
                ? 1.2 +
                  Math.min(
                    1,
                    Math.abs(Number(field)) / 500
                  )
                : 0
            }
            metalness={0.8}
            roughness={0.25}
          />
        </mesh>
      ))}

      <Text
        position={[0, -1.65, 0]}
        fontSize={0.16}
        color={powerOn ? "#fbbf24" : "#94a3b8"}
        anchorX="center"
      >
        MAGNETIZING COIL
      </Text>
    </group>
  );
}

/*
=========================================================
 SEARCH COIL
=========================================================
*/

function SearchCoil({
  powerOn,
  magnetization,
}) {
  const ref = useRef();

  useFrame((state) => {
    if (!ref.current) return;

    const b =
      Math.abs(Number(magnetization) || 0);

    const pulse =
      powerOn
        ? 1 +
          Math.sin(
            state.clock.elapsedTime * 6
          ) *
            0.08 *
            Math.min(1, b)
        : 1;

    ref.current.scale.set(
      pulse,
      pulse,
      pulse
    );
  });

  return (
    <group ref={ref}>
      <mesh
        position={[0, 0, 1.05]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry
          args={[1.7, 0.035, 10, 40]}
        />

        <meshStandardMaterial
          color={powerOn ? "#22d3ee" : "#155e75"}
          emissive={powerOn ? "#0891b2" : "#000000"}
          emissiveIntensity={powerOn ? 1.5 : 0}
        />
      </mesh>

      <Text
        position={[0, -1.85, 1.05]}
        fontSize={0.14}
        color="#67e8f9"
        anchorX="center"
      >
        SEARCH COIL
      </Text>
    </group>
  );
}

/*
=========================================================
 MAGNETIC FLUX
=========================================================
*/

function FluxLines({
  powerOn,
  field,
  magnetization,
}) {
  const groupRef = useRef();

  const strength = Math.min(
    1,
    Math.abs(Number(magnetization) || 0) /
      1.5
  );

  useFrame((state) => {
    if (!groupRef.current) return;

    if (powerOn) {
      groupRef.current.children.forEach(
        (child, index) => {
          child.position.x =
            Math.sin(
              state.clock.elapsedTime * 3 +
                index
            ) *
            0.05 *
            strength;
        }
      );
    }
  });

  const lines = useMemo(() => {
    return [-0.7, -0.35, 0, 0.35, 0.7].map(
      (x) => [
        [x, -0.85, 0.95],
        [x, -0.35, 1.15],
        [x, 0.35, 1.15],
        [x, 0.85, 0.95],
      ]
    );
  }, []);

  return (
    <group ref={groupRef}>
      {lines.map((points, index) => (
        <Line
          key={index}
          points={points}
          color={
            powerOn
              ? "#38bdf8"
              : "#1e3a5f"
          }
          lineWidth={
            powerOn ? 2 : 1
          }
        />
      ))}

      <Text
        position={[0, 1.65, 1.1]}
        fontSize={0.13}
        color={powerOn ? "#38bdf8" : "#64748b"}
        anchorX="center"
      >
        MAGNETIC FLUX
      </Text>
    </group>
  );
}

/*
=========================================================
 WIRES
=========================================================
*/

function Wires({ powerOn }) {
  const points1 = [
    [-5.5, 1.1, 0],
    [-3.3, 1.1, 0],
    [-2.2, 1.1, 0],
  ];

  const points2 = [
    [-2.2, 1.1, 0],
    [-1.5, 1.1, 0],
    [-1.1, 1.1, 0],
  ];

  return (
    <group>
      <Line
        points={points1}
        color={powerOn ? "#ef4444" : "#7f1d1d"}
        lineWidth={3}
      />

      <Line
        points={points2}
        color={powerOn ? "#22c55e" : "#14532d"}
        lineWidth={3}
      />
    </group>
  );
}

/*
=========================================================
 CRO
=========================================================
*/

function CRO({
  powerOn,
  field,
  magnetization,
  loopPoints,
}) {
  const screenPoints = useMemo(() => {
    /*
    If there are real simulation points,
    display them.
    */

    if (
      Array.isArray(loopPoints) &&
      loopPoints.length > 1
    ) {
      const points = loopPoints.slice(-300);

      let maxH = 1;
      let maxB = 1;

      points.forEach((p) => {
        maxH = Math.max(
          maxH,
          Math.abs(Number(p.h) || 0)
        );

        maxB = Math.max(
          maxB,
          Math.abs(Number(p.b) || 0)
        );
      });

      return points.map((p) => [
        ((Number(p.h) || 0) / maxH) * 1.8,
        ((Number(p.b) || 0) / maxB) * 1.25,
        0,
      ]);
    }

    /*
    Otherwise display a default small
    hysteresis loop.
    */

    const fallback = [];

    for (let i = 0; i <= 120; i++) {
      const t =
        (i / 120) *
        Math.PI *
        2;

      const x =
        Math.sin(t) * 1.75;

      const y =
        Math.tanh(
          1.8 *
            Math.sin(
              t - 0.35
            )
        ) *
        1.1;

      fallback.push([
        x,
        y,
        0,
      ]);
    }

    return fallback;
  }, [loopPoints]);

  return (
    <group position={[4.0, 1.55, 0]}>
      {/* CRO BODY */}

      <RoundedBox
        args={[3.3, 2.9, 1.25]}
        radius={0.18}
        smoothness={5}
      >
        <meshStandardMaterial
          color="#263442"
          metalness={0.5}
          roughness={0.35}
        />
      </RoundedBox>

      {/* SCREEN */}

      <mesh position={[0, 0.25, 0.68]}>
        <planeGeometry args={[2.55, 1.75]} />

        <meshStandardMaterial
          color="#02130d"
          emissive="#031f16"
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* SCREEN BORDER */}

      <Line
        points={[
          [-1.28, -0.63, 0.72],
          [-1.28, 1.13, 0.72],
          [1.28, 1.13, 0.72],
          [1.28, -0.63, 0.72],
          [-1.28, -0.63, 0.72],
        ]}
        color="#475569"
        lineWidth={2}
      />

      {/* GRID */}

      <Line
        points={[
          [-1.2, 0.25, 0.73],
          [1.2, 0.25, 0.73],
        ]}
        color="#164e3b"
        lineWidth={1}
      />

      <Line
        points={[
          [0, -0.55, 0.73],
          [0, 1.05, 0.73],
        ]}
        color="#164e3b"
        lineWidth={1}
      />

      {/* LOOP */}

      <Line
        points={screenPoints}
        color={powerOn ? "#4ade80" : "#315e49"}
        lineWidth={2.5}
      />

      {/* CURRENT POINT */}

      {powerOn && (
        <mesh
          position={[
            (Number(field) || 0) /
              Math.max(
                1,
                Math.abs(
                  Number(field) || 1
                )
              ) *
              1.6,
            (Number(magnetization) || 0) /
              Math.max(
                1,
                Math.abs(
                  Number(magnetization) || 1
                )
              ) *
              1.0 +
              0.25,
            0.78,
          ]}
        >
          <sphereGeometry args={[0.07, 12, 12]} />

          <meshBasicMaterial color="#f87171" />
        </mesh>
      )}

      <Text
        position={[0, 1.5, 0.7]}
        fontSize={0.2}
        color="#e2e8f0"
        anchorX="center"
      >
        CRO • X-Y MODE
      </Text>

      <Text
        position={[0, -1.48, 0.7]}
        fontSize={0.13}
        color="#4ade80"
        anchorX="center"
      >
        X = H     Y = B
      </Text>
    </group>
  );
}