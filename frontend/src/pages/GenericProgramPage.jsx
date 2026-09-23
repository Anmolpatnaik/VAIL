import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * GenericProgramPage — Placeholder page for M.Tech and Ph.D. programs
 */
export default function GenericProgramPage({ title, subtitle, isDark }) {
  const navigate = useNavigate();

  return (
    <main className="main-content" style={{ minHeight: "80vh", display: "flex", flexDirection: "column" }}>
      <button className="back-btn" onClick={() => navigate("/")} style={{ width: "fit-content" }}>
        ← Back to Home
      </button>
      <div
        className="info-card"
        style={{
          margin: "40px auto",
          maxWidth: "680px",
          width: "100%",
          padding: "50px 36px",
          textAlign: "center",
          borderRadius: "22px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "18px",
        }}
      >
        <div style={{ fontSize: "40px" }}>🏛️</div>
        <h1 style={{ margin: "6px 0 0 0", fontSize: "30px", color: isDark ? "#f8fafc" : "#0f172a" }}>
          {title}
        </h1>
        <p style={{ margin: 0, fontSize: "15px", color: isDark ? "#cbd5e1" : "#475569" }}>
          {subtitle}
        </p>
        <div
          style={{
            padding: "12px 20px",
            borderRadius: "10px",
            background: isDark ? "rgba(15, 23, 42, 0.7)" : "rgba(241, 245, 249, 0.9)",
            border: "1px solid #38bdf8",
            color: "#38bdf8",
            fontSize: "13px",
            fontWeight: "600",
          }}
        >
          Curriculum modules are currently being indexed by faculty coordinators.
        </div>

        {/* Highlighted Launching Soon Tag */}
        <div
          style={{
            marginTop: "6px",
            padding: "6px 18px",
            borderRadius: "20px",
            background: "rgba(245, 158, 11, 0.15)",
            border: "1px solid #f59e0b",
            color: "#f59e0b",
            fontSize: "12px",
            fontWeight: "700",
            letterSpacing: "1px",
            textTransform: "uppercase",
            boxShadow: "0 4px 12px rgba(245, 158, 11, 0.2)",
          }}
        >
          🚀 Launching Soon
        </div>
      </div>
    </main>
  );
}
