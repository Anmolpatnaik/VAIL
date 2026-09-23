import React from "react";
import { getExperimentConfig } from "../../engine/ExperimentRegistry";

export default function VideoGuideSection({ experiment, onVideoComplete, isCompleted, onNext }) {
  const config = getExperimentConfig(experiment);
  const video = config?.video || {
    title: `${config?.title || "Virtual Lab"} Tutorial & Briefing`,
    summary: `Interactive laboratory briefing and demonstration protocol for ${config?.title || "this experiment"}. Review guidelines to proceed to the simulation workbench.`,
    hasVideo: false
  };

  return (
    <div className="info-section">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
        <h2 style={{ margin: 0 }}>🎥 Experiment Video Guide</h2>
        <span
          style={{
            padding: "5px 12px",
            borderRadius: "6px",
            background: isCompleted ? "rgba(34, 197, 94, 0.15)" : "rgba(234, 179, 8, 0.15)",
            border: `1px solid ${isCompleted ? "#22c55e" : "#eab308"}`,
            color: isCompleted ? "#4ade80" : "#facc15",
            fontSize: "12px",
            fontWeight: "700",
          }}
        >
          {isCompleted ? "✓ Tutorial Completed" : video.hasVideo ? "⏳ Watch Video to Completion to Unlock Modules" : "📋 Review Briefing to Proceed"}
        </span>
      </div>

      <div className="info-card" style={{ padding: "20px", background: "#08101d", border: "1px solid #1e3a5f", borderRadius: "12px" }}>
        <h3 style={{ marginTop: 0, color: "#38bdf8" }}>{video.title}</h3>
        <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "16px", lineHeight: "1.6" }}>{video.summary}</p>

        {video.hasVideo && video.src ? (
          <div style={{ width: "100%", borderRadius: "10px", overflow: "hidden", border: "1px solid #1e3a5f", background: "#000000" }}>
            <video
              controls
              playsInline
              key={video.src}
              src={video.src}
              onEnded={onVideoComplete}
              style={{ width: "100%", maxHeight: "520px", display: "block", outline: "none" }}
            >
              Your browser does not support HTML5 video playback.
            </video>
          </div>
        ) : (
          <div style={{ padding: "36px 20px", borderRadius: "10px", border: "1px dashed #38bdf8", background: "rgba(15, 23, 42, 0.6)", textAlign: "center" }}>
            <div style={{ fontSize: "42px", marginBottom: "12px" }}>🔬</div>
            <h4 style={{ margin: "0 0 8px 0", color: "#f8fafc", fontSize: "18px" }}>Interactive 3D Lab Ready</h4>
            <p style={{ margin: "0 auto 18px", maxWidth: "560px", color: "#94a3b8", fontSize: "14px", lineHeight: "1.6" }}>
              The interactive 3D laboratory workbench is pre-configured and ready. You can review the theory, execute live simulations, and record experimental observation slots.
            </p>
            {!isCompleted && (
              <button
                onClick={onVideoComplete}
                style={{ padding: "10px 22px", borderRadius: "8px", border: "1px solid #38bdf8", background: "#0284c7", color: "#ffffff", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}
              >
                Acknowledge & Unlock Laboratory Modules →
              </button>
            )}
          </div>
        )}

        <div style={{ marginTop: "18px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", paddingTop: "14px", borderTop: "1px solid #1e293b" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "18px" }}>{isCompleted ? "🎉" : "💡"}</span>
            <span style={{ fontSize: "13px", color: isCompleted ? "#4ade80" : "#94a3b8" }}>
              {isCompleted ? "All experiment modules are now fully unlocked!" : "Watch the video until it ends, or verify completion once watched."}
            </span>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            {!isCompleted && (
              <button
                onClick={onVideoComplete}
                style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid #38bdf8", background: "rgba(56, 189, 248, 0.1)", color: "#38bdf8", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
              >
                Mark as Watched
              </button>
            )}

            <button
              onClick={onNext}
              disabled={!isCompleted}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                background: isCompleted ? "#2563eb" : "#334155",
                color: isCompleted ? "#ffffff" : "#64748b",
                fontSize: "13px",
                fontWeight: "700",
                cursor: isCompleted ? "pointer" : "not-allowed",
                transition: "all 0.2s ease",
              }}
            >
              Continue to Theory →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
