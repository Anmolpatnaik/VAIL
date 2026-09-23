import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getExperimentCatalog } from "../engine/ExperimentRegistry";

/**
 * BranchExperimentsPage — Shows experiment labs for a selected B.Tech department
 */
export default function BranchExperimentsPage({ isDark }) {
  const navigate = useNavigate();
  const { branchId } = useParams();

  const experiments = getExperimentCatalog();

  const branchNames = {
    cse: "Computer Science & Engineering (CSE) - Physics Laboratory",
    mechanical: "Mechanical Engineering (ME) - Advanced Machining Lab",
    ece: "Electronics & Communication (ECE) - Analog Electronics Lab",
  };

  const branchExps = experiments.filter((exp) => exp.branch === branchId);

  const renderVisual = (id) => {
    if (id === "rc") {
      return (
        <div className="experiment-visual rc-visual-new">
          <svg viewBox="0 0 500 220" className="rc-svg">
            <line x1="70" y1="110" x2="145" y2="110" />
            <polyline points="145,110 165,85 185,135 205,85 225,135 245,110" />
            <line x1="245" y1="110" x2="310" y2="110" />
            <line x1="310" y1="70" x2="310" y2="150" />
            <line x1="330" y1="70" x2="330" y2="150" />
            <line x1="330" y1="110" x2="430" y2="110" />
            <circle cx="70" cy="110" r="8" />
          </svg>
        </div>
      );
    }
    if (id === "hysteresis") {
      return (
        <div className="experiment-visual bh-visual-new">
          <svg viewBox="0 0 500 220" className="bh-svg">
            <line x1="80" y1="180" x2="440" y2="180" />
            <line x1="120" y1="205" x2="120" y2="25" />
            <path d="M120 125 C160 30 300 20 365 70 C420 110 395 160 325 170 C235 182 145 160 120 95" />
          </svg>
        </div>
      );
    }
    if (id === "string") {
      return (
        <div className="experiment-visual string-visual-new">
          <svg viewBox="0 0 500 220" className="string-svg">
            <path d="M20 110 C70 20 110 200 160 110 S250 20 300 110 S390 200 440 110" />
          </svg>
        </div>
      );
    }
    if (id === "impulse") {
      return (
        <div className="experiment-visual impulse-visual-new">
          <div className="collision-ball blue-ball"></div>
          <div className="collision-line"></div>
          <div className="collision-ball orange-ball"></div>
          <div className="collision-arrow">→</div>
        </div>
      );
    }
    if (id === "edm") {
      return (
        <div className="experiment-visual" style={{ background: "#1e293b", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "50px" }}>
          ⚙️🔩
        </div>
      );
    }
    if (id === "opamp") {
      return (
        <div className="experiment-visual" style={{ background: "#1e293b", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "50px" }}>
          📐⚡
        </div>
      );
    }
    return null;
  };

  return (
    <main className="main-content" style={{ minHeight: "85vh", padding: "40px 20px" }}>
      <button className="back-btn" onClick={() => navigate("/programs/btech")}>
        ← Back to Departments
      </button>

      <div style={{ textAlign: "center", margin: "20px auto 40px", maxWidth: "800px" }}>
        <span
          style={{
            padding: "5px 14px",
            borderRadius: "20px",
            background: "rgba(56, 189, 248, 0.12)",
            border: "1px solid #38bdf8",
            color: "#38bdf8",
            fontSize: "12px",
            fontWeight: "700",
            letterSpacing: "1px",
            textTransform: "uppercase",
          }}
        >
          Departmental Laboratory
        </span>
        <h1 style={{ fontSize: "32px", margin: "14px 0 8px 0", color: isDark ? "#f8fafc" : "#0f172a" }}>
          {branchNames[branchId] || "Virtual Laboratory Modules"}
        </h1>
        <p style={{ color: isDark ? "#94a3b8" : "#475569", fontSize: "15px", margin: 0 }}>
          Select an experiment below to launch the simulation workspace.
        </p>
      </div>

      <div className="experiment-grid" style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {branchExps.map((exp) => (
          <div className="glass-experiment-card" key={exp.id}>
            {renderVisual(exp.id)}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span className="experiment-tag" style={{ margin: 0 }}>{exp.subtitle.toUpperCase()}</span>
              <span className="card-icon-pill" title={`${exp.title} Icon`}>{exp.icon}</span>
            </div>
            <h3>{exp.title}</h3>
            <p>{exp.description}</p>
            <button
              onClick={() => {
                navigate(`/experiment/${exp.id}`);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="experiment-open-btn"
            >
              Open Experiment <span>→</span>
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
