import React, { useState } from "react";
import { getExperimentConfig } from "../../engine/ExperimentRegistry";

export default function SafetySection({ 
  experiment, 
  onProceed, 
  isAcknowledged,
  agreed: controlledAgreed,
  onAgreeChange,
}) {
  const [internalAgreed, setInternalAgreed] = useState(Boolean(isAcknowledged));
  const agreed = controlledAgreed !== undefined ? controlledAgreed : internalAgreed;

  const handleToggle = (newVal) => {
    setInternalAgreed(newVal);
    if (onAgreeChange) onAgreeChange(newVal);
  };
  const config = getExperimentConfig(experiment);
  const safety = config?.safety;

  const isElectrical = safety?.isElectrical ?? (
    experiment === "rc" || experiment === "hysteresis" || experiment === "opamp" || experiment === "edm"
  );
  const protocolName = safety?.protocol || (
    isElectrical ? "UPEM / Electrical Safety Protocol" : "Mechanics & Rigging Protocol"
  );

  return (
    <div className="info-section">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h2 style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
          🛡️ Laboratory Safety Precautions & Apparatus Limits
        </h2>
        <span
          style={{
            padding: "5px 14px",
            borderRadius: "6px",
            background: isElectrical ? "rgba(239, 68, 68, 0.15)" : "rgba(14, 165, 233, 0.15)",
            border: isElectrical ? "1px solid #ef4444" : "1px solid #0ea5e9",
            color: isElectrical ? "#f87171" : "#38bdf8",
            fontSize: "12px",
            fontWeight: "700",
            letterSpacing: "0.5px",
          }}
        >
          {protocolName}
        </span>
      </div>

      <div className="info-card" style={{ display: "flex", flexDirection: "column", gap: "18px", padding: "24px" }}>
        {safety?.precautions?.length > 0 ? (
          safety.precautions.map((p, idx) => (
            <div
              key={idx}
              className="precaution-card"
              style={{ borderLeft: `4px solid ${p.borderColor || (p.severity === "danger" ? "#ef4444" : "#f59e0b")}` }}
            >
              <strong style={{ color: p.titleColor || (p.severity === "danger" ? "#f87171" : "#fbbf24"), fontSize: "14px" }}>
                {p.title}
              </strong>
              <p className="precaution-desc">{p.description}</p>
            </div>
          ))
        ) : (
          <div className="precaution-card" style={{ borderLeft: "4px solid #ef4444" }}>
            <strong style={{ color: "#f87171", fontSize: "14px" }}>⚠️ General Laboratory Safety</strong>
            <p className="precaution-desc">
              Operate the apparatus within rated operating parameters and observe all safety instructions.
            </p>
          </div>
        )}

        <div>
          <h4 style={{ margin: "0 0 10px 0", color: "#e2e8f0" }}>Bench Rating & Threshold Limits:</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px" }}>
            <div className="precaution-limit-box">
              <span style={{ color: "#94a3b8", fontSize: "11px", textTransform: "uppercase", display: "block" }}>DC Supply Limits</span>
              <strong style={{ color: "#38bdf8", fontSize: "13px" }}>Max Voltage: 20.0 V DC</strong>
              <span style={{ color: "#64748b", fontSize: "12px", display: "block" }}>Max Continuous Current: 2.0 A</span>
            </div>
            <div className="precaution-limit-box">
              <span style={{ color: "#94a3b8", fontSize: "11px", textTransform: "uppercase", display: "block" }}>ADC Input Limits</span>
              <strong style={{ color: "#38bdf8", fontSize: "13px" }}>Input Vpp ≤ 50 V Max</strong>
              <span style={{ color: "#64748b", fontSize: "12px", display: "block" }}>Shared Earth GND</span>
            </div>
          </div>
        </div>

        <div>
          <h4 style={{ margin: "0 0 8px 0", color: "#e2e8f0" }}>Standard Pre-Experiment Checklist (Dos & Don'ts):</h4>
          <ul style={{ margin: 0, paddingLeft: "20px", color: "#94a3b8", fontSize: "13px", lineHeight: "1.8" }}>
            <li>Verify all main bench supply toggles are set to <b>OFF</b> prior to altering circuit leads.</li>
            <li>Confirm multi-meter dial settings match the measured parameter.</li>
            <li>Inspect all wire insulation and banana plugs for looseness or exposed core wiring.</li>
            <li>Ensure total lab station power is isolated immediately upon detecting odor, smoke, or excessive component heat.</li>
          </ul>
        </div>

        {/* Terms & Conditions Acceptance Box */}
        <div
          style={{
            marginTop: "8px",
            padding: "14px 18px",
            background: "rgba(15, 23, 42, 0.9)",
            border: `1px solid ${agreed ? "#22c55e" : "#475569"}`,
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            cursor: "pointer",
            transition: "all 0.2s ease"
          }}
          onClick={() => handleToggle(!agreed)}
        >
          <input
            type="checkbox"
            id="safetyTermsCheck"
            checked={agreed}
            onChange={(e) => {
              e.stopPropagation();
              handleToggle(e.target.checked);
            }}
            style={{ width: "18px", height: "18px", accentColor: "#2563eb", cursor: "pointer" }}
          />
          <label
            htmlFor="safetyTermsCheck"
            style={{ color: agreed ? "#f1f5f9" : "#94a3b8", fontSize: "13px", lineHeight: "1.5", cursor: "pointer", userSelect: "none" }}
          >
            I have carefully read, understood, and agreed to abide by all the laboratory safety precautions and apparatus limitations stated above.
          </label>
        </div>

        <button
          onClick={onProceed}
          disabled={!agreed}
          style={{
            marginTop: "6px",
            padding: "14px",
            borderRadius: "8px",
            border: "none",
            background: agreed ? "#2563eb" : "#334155",
            color: agreed ? "#ffffff" : "#94a3b8",
            fontWeight: "700",
            fontSize: "14px",
            cursor: agreed ? "pointer" : "not-allowed",
            transition: "all 0.2s ease",
            boxShadow: agreed ? "0 4px 14px rgba(37, 99, 235, 0.3)" : "none",
            opacity: agreed ? 1 : 0.6
          }}
        >
          {agreed ? "✓ Proceed to Video Guide →" : "🔒 Please Check the Agreement Box Above to Proceed"}
        </button>
      </div>
    </div>
  );
}
