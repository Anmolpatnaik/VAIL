import React, { useState } from "react";
import DigitalMultimeter from "./DigitalMultimeter";
import VirtualOscilloscope from "./VirtualOscilloscope";
import VirtualStopwatch from "./VirtualStopwatch";
import FrequencyStroboscope from "./FrequencyStroboscope";
import TensionGauge from "./TensionGauge";
import PhotogateTimer from "./PhotogateTimer";
import FluxmeterBHTool from "./FluxmeterBHTool";
import EDMDepthGauge from "./EDMDepthGauge";

/**
 * EXPERIMENT_INSTRUMENTS_MAP
 * Maps each laboratory experiment to ONLY the instruments relevant to that domain.
 */
const EXPERIMENT_INSTRUMENTS = {
  string: [
    { id: "strobe", label: "Frequency Counter", icon: "🎛️", title: "Launch Digital Stroboscope & Frequency Counter" },
    { id: "tension", label: "Tension & Wavelength", icon: "⚖️", title: "Launch Tension Dynamometer & Wavelength Scale" },
    { id: "timer", label: "Stopwatch", icon: "⏱️", title: "Launch Precision Bench Timer" },
  ],
  rc: [
    { id: "dmm", label: "Digital Multimeter", icon: "📟", title: "Launch Digital Multimeter" },
    { id: "timer", label: "Stopwatch", icon: "⏱️", title: "Launch Precision Bench Timer" },
  ],
  impulse: [
    { id: "photogate", label: "Photogate Timer", icon: "⏱️", title: "Launch Dual Photogate Timer & Velocity Sensor" },
    { id: "timer", label: "Stopwatch", icon: "⏱️", title: "Launch Precision Bench Timer" },
  ],
  hysteresis: [
    { id: "fluxmeter", label: "Digital Fluxmeter", icon: "🧲", title: "Launch Hall Effect Gaussmeter & Fluxmeter" },
    { id: "scope", label: "B-H Loop Tracer", icon: "📈", title: "Launch B-H Curve Oscilloscope" },
    { id: "dmm", label: "Digital Multimeter", icon: "📟", title: "Launch Multimeter" },
  ],
  edm: [
    { id: "edm_gauge", label: "Spark & Depth Gauge", icon: "⚡", title: "Launch Spark Monitor & Depth Micrometer" },
    { id: "timer", label: "Machining Timer", icon: "⏱️", title: "Launch Duty Cycle Timer" },
  ],
  opamp: [
    { id: "dmm", label: "Digital Multimeter", icon: "📟", title: "Launch Digital Multimeter" },
    { id: "scope", label: "Oscilloscope", icon: "📈", title: "Launch Dual-Trace Oscilloscope" },
  ],
};

/**
 * InstrumentDock — VAIL 2.0 Virtual Instrument Engine (§10)
 * 
 * Collapsible laboratory instrument rack allowing students to dock/undock
 * virtual instruments specific to the currently active laboratory experiment.
 */
export default function InstrumentDock({
  experiment = "rc",
  experimentParams = {},
  liveValues = {},
  onLogMeasurement,
}) {
  const [activeInstrument, setActiveInstrument] = useState(null);

  // Get instruments specific to the current experiment
  const availableTools = EXPERIMENT_INSTRUMENTS[experiment] || EXPERIMENT_INSTRUMENTS.rc;

  return (
    <div className="vail-instrument-dock-container">
      {/* Workbench Toolbar */}
      <div className="vail-instrument-bar">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "16px" }}>🧰</span>
          <span style={{ fontSize: "13px", fontWeight: "700", color: "#f1f5f9" }}>
            Virtual Lab Bench Instruments (§10)
          </span>
          <span className="vail-engine-tag">{experiment.toUpperCase()} Lab Tools</span>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          {availableTools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveInstrument(activeInstrument === tool.id ? null : tool.id)}
              className={`dock-tool-btn ${activeInstrument === tool.id ? "active" : ""}`}
              title={tool.title}
            >
              <span>{tool.icon}</span> {tool.label}
            </button>
          ))}

          {activeInstrument && (
            <button
              onClick={() => setActiveInstrument(null)}
              className="dock-tool-btn close"
              title="Close active instrument"
            >
              ✕ Hide Tool
            </button>
          )}
        </div>
      </div>

      {/* Render Active Instrument Chassis */}
      {activeInstrument && (
        <div className="vail-active-instrument-stage">
          {/* Vibration String Instruments */}
          {activeInstrument === "strobe" && (
            <FrequencyStroboscope
              liveFrequency={liveValues.frequency ?? 50.0}
              harmonicMode={liveValues.harmonicMode ?? 1}
              onLogMeasurement={onLogMeasurement}
              isOpen={true}
              onClose={() => setActiveInstrument(null)}
            />
          )}

          {activeInstrument === "tension" && (
            <TensionGauge
              liveTension={liveValues.tension ?? 4.9}
              liveWavelength={liveValues.wavelength ?? 0.8}
              onLogMeasurement={onLogMeasurement}
              isOpen={true}
              onClose={() => setActiveInstrument(null)}
            />
          )}

          {/* Impulse-Momentum Instruments */}
          {activeInstrument === "photogate" && (
            <PhotogateTimer
              liveVelocity1={liveValues.v1 ?? 0.5}
              liveVelocity2={liveValues.v2 ?? 0.48}
              gliderMass={liveValues.mass ?? 0.25}
              onLogMeasurement={onLogMeasurement}
              isOpen={true}
              onClose={() => setActiveInstrument(null)}
            />
          )}

          {/* Hysteresis Instruments */}
          {activeInstrument === "fluxmeter" && (
            <FluxmeterBHTool
              liveH={liveValues.maxH ?? 500.0}
              liveB={liveValues.maxB ?? 1.45}
              liveLoopArea={liveValues.loopArea ?? 1420.0}
              onLogMeasurement={onLogMeasurement}
              isOpen={true}
              onClose={() => setActiveInstrument(null)}
            />
          )}

          {/* EDM Instruments */}
          {activeInstrument === "edm_gauge" && (
            <EDMDepthGauge
              liveDepth={liveValues.depth ?? 1.25}
              liveMRR={liveValues.mrr ?? 24.5}
              liveCurrent={liveValues.current ?? 15.0}
              onLogMeasurement={onLogMeasurement}
              isOpen={true}
              onClose={() => setActiveInstrument(null)}
            />
          )}

          {/* Generic Electrical & Timing Instruments */}
          {activeInstrument === "dmm" && (
            <DigitalMultimeter
              liveValues={liveValues}
              onLogMeasurement={onLogMeasurement}
              isOpen={true}
              onClose={() => setActiveInstrument(null)}
            />
          )}

          {activeInstrument === "scope" && (
            <VirtualOscilloscope
              experiment={experiment}
              experimentParams={experimentParams}
              isOpen={true}
              onClose={() => setActiveInstrument(null)}
            />
          )}

          {activeInstrument === "timer" && (
            <VirtualStopwatch
              onLogMeasurement={onLogMeasurement}
              isOpen={true}
              onClose={() => setActiveInstrument(null)}
            />
          )}
        </div>
      )}
    </div>
  );
}
