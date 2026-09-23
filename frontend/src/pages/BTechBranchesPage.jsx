import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * BTechBranchesPage — Department Selection for B.Tech
 */
export default function BTechBranchesPage({ isDark }) {
  const navigate = useNavigate();

  const branches = [
    {
      id: "cse",
      name: "Computer Science & Engineering (CSE)",
      code: "CSE",
      icon: "💻",
      status: "Available",
      description: "Physics Lab modules: Circuit analysis, Magnetism, Standing waves, and Dynamics.",
      active: true,
    },
    {
      id: "mechanical",
      name: "Mechanical Engineering (ME)",
      code: "ME",
      icon: "⚙️",
      status: "Available",
      description: "Thermodynamics, Fluid Mechanics, EDM, Kinematics & Strength of Materials.",
      active: true,
    },
    {
      id: "ece",
      name: "Electronics & Communication (ECE)",
      code: "ECE",
      icon: "📡",
      status: "Available",
      description: "Semiconductor devices, Op-Amp, Signals & Systems, Analog & Digital communications.",
      active: true,
    },
    {
      id: "ee",
      name: "Electrical Engineering (EE)",
      code: "EE",
      icon: "⚡",
      status: "Curriculum In Progress",
      description: "Electrical Machines, Power Systems, High-Voltage engineering & Drives.",
      active: false,
    },
    {
      id: "civil",
      name: "Civil Engineering (CE)",
      code: "CE",
      icon: "🏗️",
      status: "Curriculum In Progress",
      description: "Structural Analysis, Concrete Technology, Surveying & Geotechnical lab.",
      active: false,
    },
  ];

  return (
    <main className="main-content" style={{ minHeight: "85vh", padding: "40px 0" }}>
      <button className="back-btn" onClick={() => navigate("/")}>
        ← Back to Main Portal
      </button>

      <div style={{ textAlign: "center", margin: "20px auto 40px", maxWidth: "720px" }}>
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
          Undergraduate Programs
        </span>
        <h1 style={{ fontSize: "36px", margin: "14px 0 8px 0", color: isDark ? "#f8fafc" : "#0f172a" }}>
          Select Your B.Tech Department
        </h1>
        <p style={{ color: isDark ? "#94a3b8" : "#475569", fontSize: "15px", margin: 0 }}>
          Click on an active department to access laboratory modules.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "22px",
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {branches.map((branch) => (
          <div
            key={branch.id}
            onClick={() => {
              if (branch.active) {
                navigate(`/programs/btech/${branch.id}`);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            style={{
              padding: "26px",
              borderRadius: "18px",
              background: isDark
                ? "linear-gradient(135deg, rgba(22, 46, 72, .75), rgba(7, 20, 36, .85))"
                : "#ffffff",
              border: branch.active
                ? "1px solid #38bdf8"
                : isDark
                ? "1px solid rgba(148, 163, 184, 0.2)"
                : "1px solid #e2e8f0",
              cursor: branch.active ? "pointer" : "not-allowed",
              transition: "all 0.25s ease",
              boxShadow: isDark
                ? "0 10px 30px rgba(0,0,0,0.3)"
                : "0 10px 30px rgba(0,0,0,0.06)",
              opacity: branch.active ? 1 : 0.65,
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              if (branch.active) {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.borderColor = "#ff8a3d";
              }
            }}
            onMouseLeave={(e) => {
              if (branch.active) {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "#38bdf8";
              }
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <span style={{ fontSize: "36px" }}>{branch.icon}</span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  padding: "4px 10px",
                  borderRadius: "20px",
                  background: branch.active
                    ? "rgba(34, 197, 94, 0.15)"
                    : "rgba(148, 163, 184, 0.15)",
                  color: branch.active ? "#4ade80" : "#94a3b8",
                  border: `1px solid ${branch.active ? "#22c55e" : "#64748b"}`,
                }}
              >
                {branch.status}
              </span>
            </div>

            <h3 style={{ margin: "0 0 8px 0", fontSize: "19px", color: isDark ? "#f8fafc" : "#0f172a" }}>
              {branch.name}
            </h3>
            <p style={{ margin: 0, fontSize: "13px", color: isDark ? "#94a3b8" : "#475569", lineHeight: "1.6" }}>
              {branch.description}
            </p>

            <div style={{ marginTop: "20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "12px", color: branch.active ? "#38bdf8" : "#64748b", fontWeight: "700" }}>
                {branch.active ? "Access Labs →" : "Launching Soon"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
