import { useState, memo } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Text,
  Line,
  RoundedBox,
  Html,
} from "@react-three/drei";

/*
=========================================================
RC3D
Realistic Virtual Physics Laboratory
=========================================================
*/

export default memo(function RC3D({
  powerOn,
  mode,
  capacitorVoltage,
  current,
  voltage,
  resistance,
  capacitance,
}) {
  const [meterMode, setMeterMode] = useState("voltage");
  const [probesConnected, setProbesConnected] = useState(true);

  const capacitorPercentage =
    voltage > 0
      ? Math.min(100, (capacitorVoltage / voltage) * 100)
      : 0;

  /*
  -------------------------------------------------------
  MULTIMETER READING
  -------------------------------------------------------
  */

  let meterValue = 0;
  let meterUnit = "V";

  if (meterMode === "voltage") {
    meterValue = probesConnected ? capacitorVoltage : 0;
    meterUnit = "V";
  }

  if (meterMode === "current") {
    meterValue = probesConnected ? current * 1000 : 0;
    meterUnit = "mA";
  }

  /*
  -------------------------------------------------------
  STATUS
  -------------------------------------------------------
  */

  const statusText = powerOn
    ? mode === "charge"
      ? "CHARGING"
      : "DISCHARGING"
    : "STOPPED";

  return (
    <div
      style={{
        width: "100%",
        height: "440px",         // Set fixed compact height
        minHeight: "440px",      // Reduced from 620px
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(145deg,#06101d,#0b1929)",
        borderRadius: "12px",
      }}
    >
      {/* =================================================
          LAB HEADER
      ================================================= */}

      <div
        style={{
          position: "absolute",
          top: 14,
          left: 18,
          right: 18,
          zIndex: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pointerEvents: "none",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "20px",
              fontWeight: "700",
              color: "#ffffff",
            }}
          >
            ⚡ Virtual RC Physics Laboratory
          </div>

          <div
            style={{
              marginTop: 4,
              fontSize: "12px",
              color: "#91a4b8",
            }}
          >
            Interactive charging and discharging experiment
          </div>
        </div>

        <div
          style={{
            padding: "8px 15px",
            borderRadius: "20px",
            background: powerOn
              ? mode === "charge"
                ? "rgba(40,180,100,.2)"
                : "rgba(255,150,60,.2)"
              : "rgba(255,255,255,.08)",
            border: "1px solid rgba(255,255,255,.15)",
            color: powerOn
              ? mode === "charge"
                ? "#4ade80"
                : "#ffad66"
              : "#9aa8b7",
            fontSize: "12px",
            fontWeight: "700",
          }}
        >
          ● {statusText}
        </div>
      </div>

      {/* =================================================
          THREE.JS SCENE
      ================================================= */}

    

      <Canvas
        camera={{
          position: [0, 4.2, 7.5],
          fov: 38,
        }}
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        gl={{ powerPreference: "high-performance", antialias: true, alpha: false }}
        shadows
      >
        <color attach="background" args={["#071321"]} />

        <ambientLight intensity={1.4} />

        <directionalLight
          position={[4, 8, 5]}
          intensity={2.2}
          castShadow
          shadow-mapSize={[512, 512]}
          shadow-bias={-0.0001}
        />

        <directionalLight
          position={[-4, 5, 2]}
          intensity={1.0}
          color="#93c5fd"
        />

        <pointLight
          position={[-5, 4, 2]}
          intensity={1.2}
        />

        {/* =================================================
            SCALED LAB APPARATUS GROUP
        ================================================= */}
        <group scale={[1.25, 1.25, 1.25]} position={[0, -0.4, 0]}>

          {/* LAB TABLE */}
          <RoundedBox
            args={[13, 0.35, 7]}
            radius={0.15}
            smoothness={2}
            position={[0, -1.4, 0]}
            receiveShadow
          >
            <meshStandardMaterial
              color="#172638"
              metalness={0.35}
              roughness={0.55}
            />
          </RoundedBox>

          {/* BACK PANEL */}
          <RoundedBox
            args={[13, 6, 0.25]}
            radius={0.12}
            smoothness={2}
            position={[0, 1.4, -3.5]}
          >
            <meshStandardMaterial
              color="#0b1725"
              metalness={0.15}
              roughness={0.8}
            />
          </RoundedBox>

          {/* BATTERY */}
          <Battery voltage={voltage} powerOn={powerOn} />

          {/* RESISTOR */}
          <Resistor resistance={resistance} powerOn={powerOn} />

          {/* CAPACITOR */}
          <Capacitor
            voltage={capacitorVoltage}
            percentage={capacitorPercentage}
            capacitance={capacitance}
            powerOn={powerOn}
          />

          {/* WIRES */}
          <CircuitWires powerOn={powerOn} mode={mode} />

          {/* MOVING ELECTRIC CHARGES */}
          <ChargeParticles powerOn={powerOn} mode={mode} />

          {/* MULTIMETER */}
          <Multimeter
            value={meterValue}
            unit={meterUnit}
            mode={meterMode}
            setMode={setMeterMode}
            probesConnected={probesConnected}
          />

          {/* PROBES */}
          <Probe
            color="#ef4444"
            position={[3.9, 1.15, 0]}
            connected={probesConnected}
          />

          <Probe
            color="#111827"
            position={[3.9, 0.65, 0]}
            connected={probesConnected}
          />

          {/* GROUND */}
          <gridHelper
            args={[13, 26, "#26384c", "#17283a"]}
            position={[0, -1.2, 0]}
          />

        </group>

        {/* =================================================
            CAMERA CONTROLS
        ================================================= */}

        <OrbitControls
          enablePan={false}
          minDistance={4}
          maxDistance={14}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2.1}
        />
      </Canvas>

      {/* =================================================
          MULTIMETER CONTROLS
      ================================================= */}

      <div
        style={{
          position: "absolute",
          left: 20,
          bottom: 20,
          zIndex: 20,
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => setMeterMode("voltage")}
          style={meterButtonStyle(
            meterMode === "voltage"
          )}
        >
          V DC
        </button>

        <button
          onClick={() => setMeterMode("current")}
          style={meterButtonStyle(
            meterMode === "current"
          )}
        >
          A DC
        </button>

        <button
          onClick={() =>
            setProbesConnected((value) => !value)
          }
          style={{
            ...meterButtonStyle(probesConnected),
            background: probesConnected
              ? "rgba(40,180,100,.2)"
              : "rgba(220,60,60,.2)",
          }}
        >
          {probesConnected
            ? "● Probes Connected"
            : "○ Probes Disconnected"}
        </button>
      </div>

      {/* =================================================
          LIVE LAB DATA
      ================================================= */}

      <div
        style={{
          position: "absolute",
          top: 78,
          right: 18,
          zIndex: 20,
          width: 190,
          padding: 12,
          borderRadius: 10,
          background: "rgba(4,12,22,.82)",
          border: "1px solid rgba(255,255,255,.12)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "#8295aa",
            marginBottom: 8,
          }}
        >
          LIVE EXPERIMENT DATA
        </div>

        <DataRow
          label="Vc"
          value={`${capacitorVoltage.toFixed(2)} V`}
        />

        <DataRow
          label="Current"
          value={`${(current * 1000).toFixed(2)} mA`}
        />

        <DataRow
          label="Charge"
          value={`${capacitorPercentage.toFixed(1)} %`}
        />

        <DataRow
          label="Mode"
          value={mode.toUpperCase()}
        />
      </div>
    </div>
  );
});

/*
=========================================================
BATTERY
=========================================================
*/

function Battery({ voltage, powerOn }) {
  return (
    <group position={[-4.4, 0, 0]}>
      <RoundedBox
        args={[1.7, 2.2, 1.5]}
        radius={0.15}
        smoothness={2}
        castShadow
      >
        <meshStandardMaterial
          color="#26384d"
          metalness={0.65}
          roughness={0.35}
        />
      </RoundedBox>

      {/* Positive terminal */}

      <mesh position={[0.3, 1.25, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.25, 24]} />
        <meshStandardMaterial
          color="#dc3545"
          metalness={0.7}
        />
      </mesh>

      {/* Negative terminal */}

      <mesh position={[-0.3, 1.25, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.25, 24]} />
        <meshStandardMaterial
          color="#151a20"
          metalness={0.7}
        />
      </mesh>

      <Text
        position={[0, 0.25, 0.78]}
        fontSize={0.28}
        color="white"
        anchorX="center"
      >
        {voltage} V
      </Text>

      <Text
        position={[0, -0.2, 0.78]}
        fontSize={0.16}
        color="#91a4b8"
        anchorX="center"
      >
        DC SOURCE
      </Text>

      <Text
        position={[0.3, 1.55, 0]}
        fontSize={0.22}
        color="#ef4444"
      >
        +
      </Text>

      <Text
        position={[-0.3, 1.55, 0]}
        fontSize={0.22}
        color="#d1d5db"
      >
        −
      </Text>

      {powerOn && (
        <pointLight
          position={[0, 1.5, 0]}
          color="#4ade80"
          intensity={2}
          distance={3}
        />
      )}
    </group>
  );
}

/*
=========================================================
RESISTOR
=========================================================
*/

function Resistor({ resistance, powerOn }) {
  return (
    <group position={[0, 0, 0]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry
          args={[0.28, 0.28, 2.2, 24]}
        />

        <meshStandardMaterial
          color="#d19a42"
          metalness={0.25}
          roughness={0.5}
        />
      </mesh>

      {/* Resistor bands */}

      {[-0.6, -0.2, 0.2, 0.6].map(
        (x, index) => (
          <mesh
            key={index}
            position={[x, 0, 0]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry
              args={[0.295, 0.295, 0.08, 24]}
            />

            <meshStandardMaterial
              color={
                index % 2 === 0
                  ? "#351b0c"
                  : "#f2d16b"
              }
            />
          </mesh>
        )
      )}

      <Text
        position={[0, 0.65, 0]}
        fontSize={0.25}
        color="#f2c14e"
        anchorX="center"
      >
        R = {resistance} Ω
      </Text>

      {powerOn && (
        <pointLight
          position={[0, 0, 0]}
          color="#f2c14e"
          intensity={0.5}
          distance={2}
        />
      )}
    </group>
  );
}

/*
=========================================================
CAPACITOR
=========================================================
*/

function Capacitor({
  voltage,
  percentage,
  capacitance,
  powerOn,
}) {
  const glow =
    0.3 + percentage / 100;

  return (
    <group position={[4, 0, 0]}>
      {/* Left plate */}

      <mesh castShadow>
        <boxGeometry args={[0.12, 2.3, 1.7]} />

        <meshStandardMaterial
          color="#60a5fa"
          metalness={0.85}
          roughness={0.2}
          emissive="#1d4ed8"
          emissiveIntensity={glow}
        />
      </mesh>

      {/* Right plate */}

      <mesh position={[0.75, 0, 0]} castShadow>
        <boxGeometry args={[0.12, 2.3, 1.7]} />

        <meshStandardMaterial
          color="#60a5fa"
          metalness={0.85}
          roughness={0.2}
          emissive="#1d4ed8"
          emissiveIntensity={glow}
        />
      </mesh>

      {/* Dielectric */}

      <mesh position={[0.375, 0, 0]}>
        <boxGeometry args={[0.62, 2.15, 1.55]} />

        <meshStandardMaterial
          color="#102b4b"
          transparent
          opacity={0.65}
          roughness={0.3}
        />
      </mesh>

      {/* Static Spec Label */}
      <Text
        position={[0.38, 1.5, 0]}
        fontSize={0.25}
        color="#60a5fa"
        anchorX="center"
      >
        C = {capacitance} μF
      </Text>

      {/* Live Readout Badge via ultra-lightweight HTML overlay (Zero 3D font re-tessellation) */}
      <Html
        position={[0.38, 0, 0.88]}
        transform
        center
        distanceFactor={6.5}
        pointerEvents="none"
      >
        <div
          style={{
            background: "rgba(7, 19, 33, 0.92)",
            border: "1px solid #38bdf8",
            borderRadius: "6px",
            padding: "5px 9px",
            textAlign: "center",
            fontFamily: "monospace",
            whiteSpace: "nowrap",
            boxShadow: "0 4px 14px rgba(0,0,0,0.6)",
          }}
        >
          <div style={{ color: "#ffffff", fontSize: "13px", fontWeight: "bold" }}>
            Vc = {voltage.toFixed(2)} V
          </div>
          <div style={{ color: "#4ade80", fontSize: "11px", marginTop: "2px" }}>
            {percentage.toFixed(1)}% CHARGED
          </div>
        </div>
      </Html>

      {/* Positive charge marks (fast geometric meshes, 0 font overhead) */}
      {Array.from({ length: 8 }).map((_, index) => {
        const y = -0.8 + index * 0.23;
        return (
          <group key={`pos-${index}`} position={[-0.16, y, 0.88]}>
            <mesh>
              <boxGeometry args={[0.07, 0.02, 0.01]} />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
            <mesh>
              <boxGeometry args={[0.02, 0.07, 0.01]} />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
          </group>
        );
      })}

      {/* Negative charge marks (fast geometric meshes, 0 font overhead) */}
      {Array.from({ length: 8 }).map((_, index) => {
        const y = -0.8 + index * 0.23;
        return (
          <mesh key={`neg-${index}`} position={[0.91, y, 0.88]}>
            <boxGeometry args={[0.07, 0.02, 0.01]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        );
      })}

      {powerOn && (
        <pointLight
          position={[0.4, 0, 0]}
          color="#3b82f6"
          intensity={percentage / 35 + 0.3}
          distance={3}
        />
      )}
    </group>
  );
}

/*
=========================================================
CIRCUIT WIRES
=========================================================
*/

function CircuitWires({ powerOn, mode }) {
  const wireColor = powerOn
    ? mode === "charge"
      ? "#4ade80"
      : "#ff9f43"
    : "#60758a";

  return (
    <group>
      <Line
        points={[
          [-3.55, 0.8, 0],
          [-1.2, 0.8, 0],
        ]}
        color={wireColor}
        lineWidth={5}
      />

      <Line
        points={[
          [1.2, 0.8, 0],
          [4, 0.8, 0],
        ]}
        color={wireColor}
        lineWidth={5}
      />

      <Line
        points={[
          [4.75, 0.8, 0],
          [4.75, -0.8, 0],
          [-4.4, -0.8, 0],
          [-4.4, -1.05, 0],
        ]}
        color={wireColor}
        lineWidth={5}
      />
    </group>
  );
}

/*
=========================================================
MOVING CHARGE PARTICLES
=========================================================
*/

function ChargeParticles({ powerOn, mode }) {
  if (!powerOn) return null;

  return (
    <ChargeAnimation mode={mode} />
  );
}

function ChargeAnimation({ mode }) {
  /*
   * CSS animation is applied to several small spheres.
   * This gives the circuit a visible current-flow effect.
   */

  const positions = [
    [-2.8, 0.84, 0.15],
    [-2.0, 0.84, 0.15],
    [-1.2, 0.84, 0.15],
    [1.8, 0.84, 0.15],
    [2.7, 0.84, 0.15],
    [3.5, 0.84, 0.15],
  ];

  return (
    <group>
      {positions.map((position, index) => (
        <MovingParticle
          key={index}
          position={position}
          index={index}
          mode={mode}
        />
      ))}
    </group>
  );
}

function MovingParticle({
  position,
  index,
  mode,
}) {
  const color =
    mode === "charge"
      ? "#4ade80"
      : "#ff9f43";

  return (
    <mesh position={position}>
      <sphereGeometry args={[0.075, 16, 16]} />

      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={3}
      />
    </mesh>
  );
}

/*
=========================================================
MULTIMETER
=========================================================
*/

function Multimeter({
  value,
  unit,
  mode,
}) {
  return (
    <group position={[0, -0.15, 2.3]}>
      {/* Meter body */}

      <RoundedBox
        args={[3.3, 2.2, 0.55]}
        radius={0.2}
        smoothness={2}
        castShadow
      >
        <meshStandardMaterial
          color="#20252b"
          metalness={0.5}
          roughness={0.4}
        />
      </RoundedBox>

      {/* Screen */}

      <RoundedBox
        args={[2.35, 0.75, 0.08]}
        radius={0.08}
        smoothness={2}
        position={[0, 0.4, 0.32]}
      >
        <meshStandardMaterial
          color="#071b12"
          emissive="#0b3d24"
          emissiveIntensity={0.5}
        />
      </RoundedBox>

      {/* Digital reading using hardware-accelerated HTML (zero 3D font re-tessellation) */}
      <Html
        position={[0, 0.41, 0.38]}
        transform
        center
        distanceFactor={6}
        pointerEvents="none"
      >
        <div
          style={{
            fontFamily: "monospace",
            fontWeight: "bold",
            fontSize: "20px",
            color: "#4ade80",
            textShadow: "0 0 8px rgba(74, 222, 128, 0.7)",
            background: "transparent",
            whiteSpace: "nowrap",
            textAlign: "center",
            letterSpacing: "1.5px",
          }}
        >
          {value.toFixed(2)} {unit}
        </div>
      </Html>

      <Text
        position={[0, 0.0, 0.32]}
        fontSize={0.18}
        color="#9ca3af"
        anchorX="center"
      >
        DC {mode === "voltage" ? "VOLTAGE" : "CURRENT"}
      </Text>

      {/* Meter dial */}

      <mesh position={[0, -0.45, 0.32]}>
        <cylinderGeometry args={[0.28, 0.28, 0.08, 24]} />
        <meshStandardMaterial
          color="#111827"
          metalness={0.7}
        />
      </mesh>

      <Text
        position={[-1.15, -0.48, 0.32]}
        fontSize={0.16}
        color="#ef4444"
      >
        V
      </Text>

      <Text
        position={[1.15, -0.48, 0.32]}
        fontSize={0.16}
        color="#38bdf8"
      >
        A
      </Text>
    </group>
  );
}

/*
=========================================================
PROBE
=========================================================
*/

function Probe({
  color,
  position,
  connected,
}) {
  return (
    <group position={position}>
      {/* Probe handle */}

      <RoundedBox
        args={[0.3, 1.25, 0.3]}
        radius={0.08}
        smoothness={2}
        rotation={[0, 0, -0.3]}
      >
        <meshStandardMaterial
          color={color}
          metalness={0.4}
          roughness={0.35}
        />
      </RoundedBox>

      {/* Metal tip */}

      <mesh
        position={[0.15, 0.72, 0]}
        rotation={[0, 0, -0.3]}
      >
        <cylinderGeometry
          args={[0.045, 0.045, 0.65, 16]}
        />

        <meshStandardMaterial
          color="#cbd5e1"
          metalness={0.95}
          roughness={0.15}
        />
      </mesh>

      {connected && (
        <pointLight
          position={[0, 0.7, 0]}
          color={color}
          intensity={1}
          distance={1.5}
        />
      )}
    </group>
  );
}

/*
=========================================================
DATA ROW
=========================================================
*/

function DataRow({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "4px 0",
        borderBottom:
          "1px solid rgba(255,255,255,.06)",
      }}
    >
      <span
        style={{
          color: "#8195aa",
          fontSize: 11,
        }}
      >
        {label}
      </span>

      <strong
        style={{
          color: "#ffffff",
          fontSize: 12,
        }}
      >
        {value}
      </strong>
    </div>
  );
}

/*
=========================================================
METER BUTTON STYLE
=========================================================
*/

function meterButtonStyle(active) {
  return {
    border: "1px solid rgba(255,255,255,.18)",
    borderRadius: "7px",
    padding: "8px 12px",
    background: active
      ? "rgba(59,130,246,.25)"
      : "rgba(0,0,0,.55)",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: "600",
  };
}