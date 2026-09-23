import React, { useState } from "react";
import { getExperimentConfig } from "../../engine/ExperimentRegistry";

export default function ProcedureSection({ experiment }) {
  const config = getExperimentConfig(experiment);
  const procedure = config?.procedure || [];
  const apparatus = config?.apparatus || [];

  const [completedSteps, setCompletedSteps] = useState({});

  const toggleStep = (index) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPercent = procedure.length > 0 ? Math.round((completedCount / procedure.length) * 100) : 0;

  return (
    <div className="info-section">
      {/* SECTION 1: APPARATUS ON LAB BENCH */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h2 style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px", fontSize: "20px", fontWeight: "800" }}>
              🔬 Apparatus & Equipment on Lab Bench
            </h2>
            <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--text-muted, #94a3b8)" }}>
              Physical instruments, sources, and hardware components calibrated and placed on the laboratory workbench for this experiment.
            </p>
          </div>
          <span
            style={{
              padding: "4px 12px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "700",
              background: "rgba(56, 189, 248, 0.12)",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              color: "#38bdf8",
            }}
          >
            {apparatus.length} Items Configured
          </span>
        </div>

        {apparatus.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "14px",
            }}
          >
            {apparatus.map((item, index) => (
              <div
                key={index}
                className="vail-apparatus-card"
                style={{
                  background: "var(--card-bg, #0f172a)",
                  border: "1px solid var(--border-color, rgba(255, 255, 255, 0.08))",
                  borderRadius: "12px",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "transform 0.2s ease, border-color 0.2s ease",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px", marginBottom: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "24px", lineHeight: 1 }}>{item.icon || "🔬"}</span>
                      <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: "var(--text-main, #f8fafc)" }}>
                        {item.name}
                      </h4>
                    </div>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "12px",
                        fontSize: "11px",
                        fontWeight: "700",
                        background: "rgba(255, 255, 255, 0.06)",
                        color: "var(--text-muted, #94a3b8)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.quantity}
                    </span>
                  </div>

                  <p
                    style={{
                      margin: "0 0 10px 0",
                      fontSize: "12px",
                      color: "var(--text-muted, #94a3b8)",
                      lineHeight: "1.45",
                    }}
                  >
                    <strong>Spec:</strong> {item.spec}
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: "10px",
                    borderTop: "1px solid var(--border-color, rgba(255, 255, 255, 0.06))",
                    fontSize: "11px",
                  }}
                >
                  <span style={{ color: "#22c55e", display: "flex", alignItems: "center", gap: "5px", fontWeight: "600" }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e", display: "inline-block" }}></span>
                    Bench Mounted & Calibrated
                  </span>
                  <span style={{ opacity: 0.5, color: "var(--text-muted, #94a3b8)" }}>#0{index + 1}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="info-card">
            <p style={{ margin: 0, color: "var(--text-muted, #94a3b8)", fontSize: "13px" }}>
              Standard laboratory apparatus mounted according to experimental schematics.
            </p>
          </div>
        )}
      </div>

      {/* SECTION 2: STEP-BY-STEP PROCEDURE WITH INTERACTIVE CHECKLIST */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h2 style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px", fontSize: "20px", fontWeight: "800" }}>
              📋 Experimental Procedure
            </h2>
            <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--text-muted, #94a3b8)" }}>
              Follow these sequential steps in order. Mark steps as completed to track laboratory progress.
            </p>
          </div>

          {procedure.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", color: progressPercent === 100 ? "#4ade80" : "#38bdf8" }}>
                  {completedCount} / {procedure.length} Steps
                </span>
                <div
                  style={{
                    width: "120px",
                    height: "6px",
                    background: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "3px",
                    overflow: "hidden",
                    marginTop: "4px",
                  }}
                >
                  <div
                    style={{
                      width: `${progressPercent}%`,
                      height: "100%",
                      background: progressPercent === 100 ? "linear-gradient(90deg, #22c55e, #4ade80)" : "linear-gradient(90deg, #0284c7, #38bdf8)",
                      borderRadius: "3px",
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="info-card" style={{ padding: "8px" }}>
          <ol className="procedure-list" style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {procedure.map((step, index) => {
              const isDone = !!completedSteps[index];
              return (
                <li
                  key={index}
                  onClick={() => toggleStep(index)}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "14px",
                    padding: "14px 16px",
                    marginBottom: "8px",
                    borderRadius: "10px",
                    background: isDone ? "rgba(34, 197, 94, 0.08)" : "var(--bg-card, rgba(255, 255, 255, 0.02))",
                    border: `1px solid ${isDone ? "rgba(34, 197, 94, 0.3)" : "var(--border-color, rgba(255, 255, 255, 0.06))"}`,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => {}}
                      style={{ cursor: "pointer", width: "16px", height: "16px", accentColor: "#22c55e" }}
                    />
                    <span
                      className="step-number"
                      style={{
                        background: isDone ? "#22c55e" : "#0284c7",
                        color: "#ffffff",
                        fontWeight: "800",
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                      }}
                    >
                      {index + 1}
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: "14px",
                      lineHeight: "1.5",
                      color: isDone ? "var(--text-muted, #94a3b8)" : "var(--text-main, #f8fafc)",
                      textDecoration: isDone ? "line-through" : "none",
                      transition: "color 0.2s ease",
                    }}
                  >
                    {step}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      {/* BENCH PRO-TIP */}
      <div
        style={{
          marginTop: "20px",
          padding: "14px 18px",
          borderRadius: "10px",
          background: "rgba(56, 189, 248, 0.06)",
          border: "1px dashed rgba(56, 189, 248, 0.3)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          fontSize: "13px",
          color: "var(--text-muted, #cbd5e1)",
        }}
      >
        <span style={{ fontSize: "20px" }}>💡</span>
        <div>
          <strong style={{ color: "#38bdf8" }}>Bench Setup Advisory:</strong> Verify all terminal connections and instrument zero-offsets before energizing circuits or starting mechanical actuators. Log measurements systematically in the <strong>Observations</strong> module.
        </div>
      </div>
    </div>
  );
}
