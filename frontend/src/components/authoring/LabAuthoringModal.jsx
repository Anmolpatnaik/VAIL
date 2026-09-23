import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  saveDraftExperiment,
  synthesizeExperimentModel,
  PRESET_TEMPLATES
} from "../../engine/DraftSynthesizerEngine";
import { evaluateEquationSet } from "../../engine/ScientificMathEngine";

export const BTECH_PRESETS = [
  { key: "newtonrings", label: "⭕ Newton's Rings", subtitle: "Thin-Film Interference & Curvature" },
  { key: "diffractiongrating", label: "🌈 Diffraction Grating", subtitle: "Mercury Spectrum & Wavelength" },
  { key: "halleffect", label: "🧲 Hall Effect", subtitle: "Carrier Density & Hall Voltage" },
  { key: "bandgap", label: "⚡ Energy Band Gap", subtitle: "p-n Diode Reverse Saturation" },
  { key: "solarcell", label: "☀️ Solar Cell", subtitle: "I-V Curve, MPPT & Fill Factor" },
  { key: "laserna", label: "🔦 Laser NA & Fiber", subtitle: "Acceptance Cone & Numerical Aperture" },
  { key: "torsion", label: "⚙️ Torsional Pendulum", subtitle: "Shear Elasticity & Rigidity Modulus" },
  { key: "meterbridge", label: "📏 Meter Bridge", subtitle: "Wheatstone Null-Balance & Resistivity" },
  { key: "photoelectric", label: "💡 Photoelectric Effect", subtitle: "Stopping Potential & Planck's h" },
  { key: "hooke", label: "🧲 Hooke's Law", subtitle: "Helical Spring & Dynamic SHM" },
  { key: "pendulum", label: "⏱️ Simple Pendulum", subtitle: "Period vs Length & Local Gravity g" }
];

/**
 * LabAuthoringModal — VAIL 2.0 Scientific Laboratory Authoring Studio
 * 
 * Provides an ultra-efficient visual builder & JSON studio tailored for B.Tech Physics experiments.
 * Supports multi-parameter adjustment, real-time formula evaluation, and instant lab generation.
 */
export default function LabAuthoringModal({
  isOpen,
  onClose,
  initialQuery = "",
  onLabCreated
}) {
  const [activeTab, setActiveTab] = useState("guided"); // "guided" or "json"

  // Base experiment model
  const [currentModel, setCurrentModel] = useState(() => {
    if (initialQuery) {
      return synthesizeExperimentModel(initialQuery, "Engineering Physics");
    }
    return PRESET_TEMPLATES["newtonrings"] || synthesizeExperimentModel("Newton's Rings", "Physics");
  });

  // Guided Form State
  const [title, setTitle] = useState(currentModel.title);
  const [discipline, setDiscipline] = useState(currentModel.discipline || "Applied Physics");
  const [icon, setIcon] = useState(currentModel.icon || "🔬");
  const [parameters, setParameters] = useState(() => currentModel.simulation?.parameters || []);
  const [equationsText, setEquationsText] = useState(() => 
    (currentModel.simulation?.physicsModel?.equations || []).join("\n")
  );

  // JSON editor state
  const [jsonText, setJsonText] = useState(() => JSON.stringify(currentModel, null, 2));
  const [jsonError, setJsonError] = useState(null);

  // Load a B.Tech Physics Preset into both Guided & JSON editors
  const loadPresetByKey = useCallback((key) => {
    let model = PRESET_TEMPLATES[key];
    if (!model) {
      model = synthesizeExperimentModel(key, "Engineering Physics");
    }
    const cloned = JSON.parse(JSON.stringify(model));
    setCurrentModel(cloned);
    setTitle(cloned.title);
    setDiscipline(cloned.discipline || "Applied Physics");
    setIcon(cloned.icon || "🔬");
    setParameters(cloned.simulation?.parameters || []);
    setEquationsText((cloned.simulation?.physicsModel?.equations || []).join("\n"));
    setJsonText(JSON.stringify(cloned, null, 2));
    setJsonError(null);
  }, []);

  // Synchronize when initialQuery changes
  useEffect(() => {
    if (initialQuery) {
      loadPresetByKey(initialQuery);
    }
  }, [initialQuery, loadPresetByKey]);

  // Add new parameter to list
  const handleAddParameter = () => {
    const nextIdx = parameters.length + 1;
    const newParam = {
      id: `param_${nextIdx}`,
      label: `Control Parameter ${nextIdx}`,
      unit: "units",
      min: 1,
      max: 100,
      default: 20,
      step: 1
    };
    setParameters([...parameters, newParam]);
  };

  // Modify individual parameter field
  const handleUpdateParameter = (idx, field, value) => {
    setParameters((prev) => {
      const copy = [...prev];
      copy[idx] = {
        ...copy[idx],
        [field]: (field === "min" || field === "max" || field === "default" || field === "step")
          ? (value === "" ? "" : Number(value))
          : value
      };
      return copy;
    });
  };

  // Remove parameter
  const handleRemoveParameter = (idx) => {
    if (parameters.length <= 1) {
      alert("At least one control parameter is required for simulation.");
      return;
    }
    setParameters(parameters.filter((_, i) => i !== idx));
  };

  // Insert variable name into equations textarea
  const handleInsertVariable = (varName) => {
    setEquationsText((prev) => `${prev ? prev + "\n" : ""}${varName} = `);
  };

  // Live syntax checking of governing equations
  const formulaValidation = useMemo(() => {
    const lines = equationsText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith("//") && !l.startsWith("#"));

    if (lines.length === 0) {
      return { valid: false, message: "Please specify at least one governing equation." };
    }

    const testScope = {};
    parameters.forEach((p) => {
      testScope[p.id] = Number(p.default ?? p.min ?? 1);
    });
    testScope.t = 0;
    testScope.time = 0;

    try {
      const evaluated = evaluateEquationSet(lines, testScope);
      const outKeys = Object.keys(evaluated);
      return {
        valid: true,
        outputs: outKeys,
        preview: evaluated
      };
    } catch (err) {
      return { valid: false, message: err.message };
    }
  }, [equationsText, parameters]);

  // Save experiment from Visual Builder
  const handleSaveGuided = () => {
    const lines = equationsText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith("//") && !l.startsWith("#"));

    if (lines.length === 0) {
      alert("Please provide at least one governing mathematical equation.");
      return;
    }

    const slug = title.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
    const primaryParam = parameters[0] || { id: "x", label: "Parameter", min: 1, max: 100 };
    const firstOutput = formulaValidation.outputs?.[formulaValidation.outputs.length - 1] || "output";

    const assembledExperiment = {
      ...(currentModel || {}),
      id: currentModel?.id || `draft-${slug || "custom-lab"}`,
      title: title,
      subtitle: currentModel?.subtitle || `${discipline} Laboratory`,
      branch: currentModel?.branch || "cse",
      discipline: discipline,
      level: "B.Tech Year 1",
      icon: icon || "🔬",
      isDraft: true,
      author: currentModel?.author || "Custom Laboratory Author",
      description: currentModel?.description || `Virtual laboratory for ${title}. Customized with declarative mathematical formulas and interactive controls.`,
      simulation: {
        ...(currentModel?.simulation || {}),
        type: "parametric_rig",
        scene: currentModel?.simulation?.scene || "generic_physics",
        parameters: parameters.map((p) => ({
          ...p,
          min: Number(p.min),
          max: Number(p.max),
          default: Number(p.default),
          step: Number(p.step || 1)
        })),
        physicsModel: {
          ...(currentModel?.simulation?.physicsModel || {}),
          equations: lines,
          sweepVariable: primaryParam.id,
          sweepMin: Number(primaryParam.min),
          sweepMax: Number(primaryParam.max),
          plotX: primaryParam.id,
          plotY: firstOutput,
          xLabel: primaryParam.label,
          yLabel: firstOutput,
          instruments: currentModel?.simulation?.physicsModel?.instruments || {
            dmm: { mode: "DCV", variable: firstOutput }
          }
        }
      },
      video: currentModel?.video || {
        title: `${title} Briefing & Protocol`,
        summary: `Laboratory briefing and procedure instructions for ${title}.`,
        hasVideo: false
      },
      safety: currentModel?.safety || {
        protocol: "UPEM / Standard Physics Laboratory Protocol",
        isElectrical: false,
        precautions: [
          {
            title: "⚙️ Operating Range Verification",
            severity: "warning",
            borderColor: "#f59e0b",
            titleColor: "#fbbf24",
            description: "Maintain parameters within valid ranges to ensure physical validity."
          }
        ]
      },
      apparatus: currentModel?.apparatus || [
        { name: `${title} Instrumentation Rig`, spec: "Precision bench setup", quantity: "1 Unit", icon: icon || "🔬" },
        { name: "Digital Sensor / Transducer", spec: "Universal data acquisition interface", quantity: "1 Unit", icon: "📟" }
      ],
      theory: currentModel?.theory || {
        title: `Theoretical Principles — ${title}`,
        objective: `To experimentally evaluate the physics relationships governed by: ${lines[0]}`,
        formulaDetails: lines.map((eq, i) => ({
          name: `Governing Equation ${i + 1}`,
          formula: eq,
          description: "Declarative physical relationship."
        }))
      },
      procedure: currentModel?.procedure || [
        `1. Setup and calibrate apparatus for ${title}.`,
        "2. Adjust control parameters using the interactive sliders.",
        "3. Observe real-time response on the visualizer bench and meters.",
        "4. Log measurement data into the observation table."
      ],
      observations: currentModel?.observations || {
        name: `${slug}_Observations`,
        rows: [
          ...parameters.map((p) => ({ id: p.id, label: p.label, type: "input" })),
          { id: firstOutput, label: "Measured Output", type: "observed" }
        ]
      },
      calculations: currentModel?.calculations || {
        title: "Experimental Computations",
        overview: `Analyze measurements based on ${lines[0]}.`,
        steps: lines.map((eq, i) => ({ step: i + 1, title: `Equation ${i + 1}`, equation: eq }))
      },
      viva: currentModel?.viva || [
        [`What is the governing principle of ${title}?`, `It is governed by: ${lines[0]}`],
        ["What are the principal sources of experimental error?", "Parallax error in pointer readings and instrument calibration tolerance."]
      ]
    };

    saveDraftExperiment(assembledExperiment);
    if (onLabCreated) onLabCreated(assembledExperiment);
    onClose();
  };

  // Save experiment from JSON Studio
  const handleSaveJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed.id) parsed.id = `draft-${Date.now()}`;
      parsed.isDraft = true;
      saveDraftExperiment(parsed);
      if (onLabCreated) onLabCreated(parsed);
      onClose();
    } catch (err) {
      setJsonError("Invalid JSON syntax: " + err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(10px)",
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px"
      }}
    >
      <div
        style={{
          background: "linear-gradient(180deg, #090e1a 0%, #111827 100%)",
          border: "1px solid rgba(56, 189, 248, 0.4)",
          borderRadius: "20px",
          width: "880px",
          maxWidth: "96vw",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.85), 0 0 40px rgba(56, 189, 248, 0.2)",
          color: "#ffffff",
          overflow: "hidden"
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "rgba(15, 23, 42, 0.8)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "26px" }}>⚛️</span>
            <div>
              <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "700", color: "#f8fafc" }}>
                B.Tech Physics Laboratory Studio & Experiment Customizer
              </h3>
              <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>
                Customize any B.Tech 1st Year physics experiment or synthesize custom interactive models with zero latency
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
              color: "#94a3b8",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "16px"
            }}
          >
            ✕
          </button>
        </div>

        {/* B.Tech 1st Year Preset Quick Bar */}
        <div
          style={{
            padding: "10px 20px",
            background: "rgba(15, 23, 42, 0.95)",
            borderBottom: "1px solid rgba(56, 189, 248, 0.2)",
            display: "flex",
            flexDirection: "column",
            gap: "6px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              ⚡ 1-Click Load B.Tech 1st Year Physics Presets:
            </span>
            <span style={{ fontSize: "10px", color: "#64748b" }}>
              Select any experiment to customize its parameters and formulas
            </span>
          </div>
          <div
            style={{
              display: "flex",
              gap: "6px",
              overflowX: "auto",
              paddingBottom: "4px",
              scrollbarWidth: "thin"
            }}
          >
            {BTECH_PRESETS.map((p) => {
              const isSelected = currentModel?.title?.toLowerCase().includes(p.key);
              return (
                <button
                  key={p.key}
                  onClick={() => loadPresetByKey(p.key)}
                  title={p.subtitle}
                  style={{
                    padding: "6px 12px",
                    fontSize: "11px",
                    fontWeight: "600",
                    whiteSpace: "nowrap",
                    borderRadius: "8px",
                    background: isSelected ? "rgba(56, 189, 248, 0.25)" : "rgba(30, 41, 59, 0.6)",
                    color: isSelected ? "#38bdf8" : "#cbd5e1",
                    border: isSelected ? "1px solid #38bdf8" : "1px solid rgba(255, 255, 255, 0.08)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    transition: "all 0.15s ease"
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: "flex", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", background: "rgba(15, 23, 42, 0.6)" }}>
          <button
            onClick={() => setActiveTab("guided")}
            style={{
              flex: 1,
              padding: "10px",
              background: activeTab === "guided" ? "rgba(56, 189, 248, 0.12)" : "transparent",
              color: activeTab === "guided" ? "#38bdf8" : "#94a3b8",
              border: "none",
              borderBottom: activeTab === "guided" ? "2px solid #38bdf8" : "none",
              fontWeight: "700",
              cursor: "pointer",
              fontSize: "13px"
            }}
          >
            📋 Visual Lab Builder & Formula Tuner
          </button>
          <button
            onClick={() => {
              setActiveTab("json");
              setJsonText(JSON.stringify(currentModel, null, 2));
            }}
            style={{
              flex: 1,
              padding: "10px",
              background: activeTab === "json" ? "rgba(56, 189, 248, 0.12)" : "transparent",
              color: activeTab === "json" ? "#38bdf8" : "#94a3b8",
              border: "none",
              borderBottom: activeTab === "json" ? "2px solid #38bdf8" : "none",
              fontWeight: "700",
              cursor: "pointer",
              fontSize: "13px"
            }}
          >
            💻 JSON Schema Studio (Full Specification)
          </button>
        </div>

        {/* Body Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {activeTab === "guided" ? (
            <>
              {/* Metadata Details */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 0.8fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", color: "#cbd5e1", fontWeight: "600" }}>Experiment Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      background: "rgba(30, 41, 59, 0.8)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: "8px",
                      color: "#fff",
                      marginTop: "4px",
                      fontSize: "13px"
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "11px", color: "#cbd5e1", fontWeight: "600" }}>Discipline / Branch</label>
                  <input
                    type="text"
                    value={discipline}
                    onChange={(e) => setDiscipline(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      background: "rgba(30, 41, 59, 0.8)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: "8px",
                      color: "#fff",
                      marginTop: "4px",
                      fontSize: "13px"
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "11px", color: "#cbd5e1", fontWeight: "600" }}>Icon</label>
                  <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      background: "rgba(30, 41, 59, 0.8)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: "8px",
                      color: "#fff",
                      marginTop: "4px",
                      fontSize: "13px",
                      textAlign: "center"
                    }}
                  />
                </div>
              </div>

              {/* Dynamic Interactive Parameters List */}
              <div
                style={{
                  background: "rgba(30, 41, 59, 0.5)",
                  padding: "16px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontWeight: "700", fontSize: "13px", color: "#38bdf8" }}>
                      🎛️ Interactive Laboratory Parameters ({parameters.length})
                    </span>
                    <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#94a3b8" }}>
                      Each parameter renders an interactive precision slider control on the virtual workbench.
                    </p>
                  </div>
                  <button
                    onClick={handleAddParameter}
                    style={{
                      padding: "6px 12px",
                      fontSize: "11px",
                      fontWeight: "700",
                      background: "rgba(56, 189, 248, 0.15)",
                      border: "1px solid #38bdf8",
                      color: "#38bdf8",
                      borderRadius: "6px",
                      cursor: "pointer"
                    }}
                  >
                    + Add Parameter
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {parameters.map((p, idx) => (
                    <div
                      key={p.id || idx}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1.2fr 2fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr 36px",
                        gap: "8px",
                        alignItems: "center",
                        background: "#090d16",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        border: "1px solid rgba(255, 255, 255, 0.06)"
                      }}
                    >
                      <div>
                        <label style={{ fontSize: "9px", color: "#64748b" }}>Variable ID</label>
                        <input
                          type="text"
                          value={p.id}
                          onChange={(e) => handleUpdateParameter(idx, "id", e.target.value)}
                          style={{ width: "100%", padding: "5px 6px", background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", color: "#38bdf8", fontSize: "11px", fontFamily: "monospace" }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: "9px", color: "#64748b" }}>Label</label>
                        <input
                          type="text"
                          value={p.label}
                          onChange={(e) => handleUpdateParameter(idx, "label", e.target.value)}
                          style={{ width: "100%", padding: "5px 6px", background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", color: "#fff", fontSize: "11px" }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: "9px", color: "#64748b" }}>Unit</label>
                        <input
                          type="text"
                          value={p.unit}
                          onChange={(e) => handleUpdateParameter(idx, "unit", e.target.value)}
                          style={{ width: "100%", padding: "5px 6px", background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", color: "#fff", fontSize: "11px" }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: "9px", color: "#64748b" }}>Min</label>
                        <input
                          type="number"
                          value={p.min}
                          onChange={(e) => handleUpdateParameter(idx, "min", e.target.value)}
                          style={{ width: "100%", padding: "5px 6px", background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", color: "#fff", fontSize: "11px" }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: "9px", color: "#64748b" }}>Max</label>
                        <input
                          type="number"
                          value={p.max}
                          onChange={(e) => handleUpdateParameter(idx, "max", e.target.value)}
                          style={{ width: "100%", padding: "5px 6px", background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", color: "#fff", fontSize: "11px" }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: "9px", color: "#64748b" }}>Default</label>
                        <input
                          type="number"
                          value={p.default}
                          onChange={(e) => handleUpdateParameter(idx, "default", e.target.value)}
                          style={{ width: "100%", padding: "5px 6px", background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", color: "#fff", fontSize: "11px" }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: "9px", color: "#64748b" }}>Step</label>
                        <input
                          type="number"
                          value={p.step}
                          onChange={(e) => handleUpdateParameter(idx, "step", e.target.value)}
                          style={{ width: "100%", padding: "5px 6px", background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", color: "#fff", fontSize: "11px" }}
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveParameter(idx)}
                        title="Remove parameter"
                        style={{
                          marginTop: "14px",
                          height: "28px",
                          background: "rgba(239, 68, 68, 0.15)",
                          border: "1px solid rgba(239, 68, 68, 0.3)",
                          color: "#f87171",
                          borderRadius: "4px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Governing Mathematical Physics Formulas */}
              <div
                style={{
                  background: "rgba(30, 41, 59, 0.5)",
                  padding: "16px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontWeight: "700", fontSize: "13px", color: "#38bdf8" }}>
                      📐 Governing Physics Equations & Derived Variables
                    </span>
                    <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#94a3b8" }}>
                      Evaluated sequentially client-side. Supports pi, sqrt, sin, cos, asin, exp, ln, pow, min, max.
                    </p>
                  </div>
                  {/* Validation indicator */}
                  <div>
                    {formulaValidation.valid ? (
                      <span style={{ fontSize: "11px", color: "#4ade80", fontWeight: "600" }}>
                        ✓ Equations Valid ({formulaValidation.outputs?.length} outputs)
                      </span>
                    ) : (
                      <span style={{ fontSize: "11px", color: "#f87171", fontWeight: "600" }}>
                        ⚠️ {formulaValidation.message}
                      </span>
                    )}
                  </div>
                </div>

                {/* Available Variables Chips */}
                <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "10px", color: "#64748b" }}>Input Variables:</span>
                  {parameters.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleInsertVariable(p.id)}
                      style={{
                        padding: "2px 8px",
                        fontSize: "10px",
                        background: "rgba(56, 189, 248, 0.12)",
                        border: "1px solid rgba(56, 189, 248, 0.3)",
                        borderRadius: "4px",
                        color: "#7dd3fc",
                        cursor: "pointer",
                        fontFamily: "monospace"
                      }}
                    >
                      + {p.id}
                    </button>
                  ))}
                  <span style={{ fontSize: "10px", color: "#64748b", marginLeft: "6px" }}>Constants:</span>
                  {["pi", "g", "q_e", "k_B", "h"].map((c) => (
                    <span
                      key={c}
                      style={{
                        padding: "2px 6px",
                        fontSize: "10px",
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "4px",
                        color: "#94a3b8",
                        fontFamily: "monospace"
                      }}
                    >
                      {c}
                    </span>
                  ))}
                </div>

                <textarea
                  value={equationsText}
                  onChange={(e) => setEquationsText(e.target.value)}
                  placeholder="e.g.&#10;lambda_m = wavelength_nm * 1e-9&#10;ringDiameter_mm = sqrt(4 * ringNumber * lambda_m * R_m) * 1000"
                  style={{
                    width: "100%",
                    height: "120px",
                    background: "#090d16",
                    color: "#38bdf8",
                    border: formulaValidation.valid ? "1px solid rgba(56, 189, 248, 0.3)" : "1px solid #ef4444",
                    borderRadius: "8px",
                    padding: "10px",
                    fontFamily: "monospace",
                    fontSize: "12px",
                    lineHeight: "1.5",
                    resize: "vertical"
                  }}
                />

                {formulaValidation.valid && formulaValidation.preview && (
                  <div style={{ background: "rgba(15, 23, 42, 0.8)", padding: "8px 12px", borderRadius: "6px", display: "flex", gap: "14px", flexWrap: "wrap", fontSize: "11px", fontFamily: "monospace" }}>
                    <span style={{ color: "#94a3b8" }}>Live Output Sample:</span>
                    {Object.entries(formulaValidation.preview).slice(-4).map(([k, v]) => (
                      <span key={k} style={{ color: "#4ade80" }}>
                        {k} = {typeof v === "number" ? v.toFixed(3) : String(v)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* JSON Studio */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                  Complete Declarative Laboratory Schema (Vite + React 19 CSR Format):
                </span>
                <button
                  onClick={() => {
                    try {
                      const p = JSON.parse(jsonText);
                      setJsonText(JSON.stringify(p, null, 2));
                      setJsonError(null);
                    } catch (err) {
                      setJsonError(err.message);
                    }
                  }}
                  style={{
                    padding: "4px 10px",
                    fontSize: "11px",
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#cbd5e1",
                    borderRadius: "6px",
                    cursor: "pointer"
                  }}
                >
                  ✨ Format JSON
                </button>
              </div>

              {jsonError && (
                <div style={{ background: "rgba(239, 68, 68, 0.2)", border: "1px solid #ef4444", borderRadius: "8px", padding: "8px 12px", color: "#f87171", fontSize: "12px" }}>
                  ⚠️ {jsonError}
                </div>
              )}

              <textarea
                value={jsonText}
                onChange={(e) => {
                  setJsonText(e.target.value);
                  setJsonError(null);
                }}
                style={{
                  width: "100%",
                  height: "360px",
                  background: "#090d16",
                  color: "#7dd3fc",
                  border: jsonError ? "1px solid #ef4444" : "1px solid rgba(56, 189, 248, 0.25)",
                  borderRadius: "8px",
                  padding: "14px",
                  fontFamily: "monospace",
                  fontSize: "12px",
                  lineHeight: "1.4",
                  resize: "vertical"
                }}
              />
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "rgba(15, 23, 42, 0.85)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "11px", color: "#94a3b8" }}>
              Architecture: <strong style={{ color: "#38bdf8" }}>CSR</strong> (Client-Side Rendering)
            </span>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={onClose}
              style={{
                padding: "10px 18px",
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#cbd5e1",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "13px"
              }}
            >
              Cancel
            </button>
            <button
              onClick={activeTab === "guided" ? handleSaveGuided : handleSaveJson}
              style={{
                padding: "10px 22px",
                background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)",
                border: "none",
                color: "#ffffff",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "13px",
                boxShadow: "0 4px 15px rgba(2, 132, 199, 0.4)",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              🚀 Save & Launch Virtual Lab
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
