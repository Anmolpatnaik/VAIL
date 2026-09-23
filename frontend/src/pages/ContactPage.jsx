import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * ContactPage — Help & Support contact information
 */
export default function ContactPage({ isDark }) {
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
          padding: "48px 36px",
          textAlign: "center",
          borderRadius: "22px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "18px",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: isDark ? "rgba(56, 189, 248, 0.15)" : "rgba(2, 132, 199, 0.15)",
            border: "1px solid #38bdf8",
            display: "grid",
            placeItems: "center",
            fontSize: "28px",
          }}
        >
          ✉️
        </div>

        <h1 style={{ margin: "6px 0 0 0", fontSize: "30px", color: isDark ? "#f8fafc" : "#0f172a" }}>
          Help & Support
        </h1>
        <p style={{ margin: 0, fontSize: "16px", color: isDark ? "#cbd5e1" : "#475569", lineHeight: "1.6" }}>
          For any query and support contact us on
        </p>

        <a
          href="mailto:hexascale6@gmail.com"
          style={{
            fontSize: "20px",
            fontWeight: "700",
            color: "#38bdf8",
            padding: "12px 24px",
            borderRadius: "12px",
            background: isDark ? "rgba(15, 23, 42, 0.8)" : "rgba(241, 245, 249, 0.9)",
            border: "1px solid rgba(56, 189, 248, 0.35)",
            display: "inline-block",
            letterSpacing: "0.5px",
            marginTop: "4px",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#ff8a3d")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.35)")}
        >
          hexascale6@gmail.com
        </a>
        <span style={{ fontSize: "12px", color: "#94a3b8", marginTop: "8px" }}>
          Official Virtual Laboratory Helpdesk
        </span>
      </div>
    </main>
  );
}
