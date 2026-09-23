import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * Validation level badge color mapping
 */
const VALIDATION_STYLES = {
  draft: { bg: "rgba(148, 163, 184, 0.15)", color: "#94a3b8", border: "#64748b", label: "Draft" },
  tested: { bg: "rgba(251, 191, 36, 0.15)", color: "#fbbf24", border: "#f59e0b", label: "Tested" },
  verified: { bg: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", border: "#0284c7", label: "Verified" },
  validated: { bg: "rgba(34, 197, 94, 0.15)", color: "#4ade80", border: "#22c55e", label: "Validated" },
  experimentally_validated: { bg: "rgba(168, 85, 247, 0.15)", color: "#a855f7", border: "#7c3aed", label: "Exp. Validated" },
};

/**
 * ExperimentCard — Reusable experiment card for the library grid
 * Shows icon, title, subtitle, discipline, validation badge, and description.
 */
export default function ExperimentCard({ experiment, validationLevel, isDark }) {
  const navigate = useNavigate();

  const effectiveValLevel = experiment.isDraft ? "draft" : validationLevel;
  const valStyle = VALIDATION_STYLES[effectiveValLevel] || VALIDATION_STYLES.draft;

  return (
    <div
      className="library-experiment-card"
      onClick={() => {
        navigate(`/experiment/${experiment.id}`);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    >
      {/* Card Header */}
      <div className="library-card-header">
        <span className="library-card-icon">{experiment.icon}</span>
        <span
          className="library-validation-badge"
          style={{
            background: valStyle.bg,
            color: valStyle.color,
            border: `1px solid ${valStyle.border}`,
          }}
        >
          {valStyle.label}
        </span>
      </div>

      {/* Card Body */}
      <div className="library-card-body">
        <span className="library-card-discipline">{experiment.subtitle?.toUpperCase()}</span>
        <h3 className="library-card-title">{experiment.title}</h3>
        <p className="library-card-description">{experiment.description}</p>
      </div>

      {/* Card Footer */}
      <div className="library-card-footer">
        <span className="library-card-branch-tag">
          {experiment.branch?.toUpperCase()}
        </span>
        <span className="library-card-open">
          Open Lab <span>→</span>
        </span>
      </div>
    </div>
  );
}
