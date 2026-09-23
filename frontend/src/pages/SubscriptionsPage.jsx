import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * SubscriptionsPage — VAIL 2.0 Pricing & Plans
 */
export default function SubscriptionsPage({ isDark }) {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Free",
      price: "₹0",
      duration: "/month",
      features: [
        "Free access to 2 experiments",
        "Valid for 1 week duration",
        "Upgrade to Standard required to explore further experiments",
      ],
      buttonText: "Start Free Trial",
      highlight: false,
    },
    {
      name: "Standard",
      price: "₹159",
      duration: "/month",
      features: [
        "Access to ALL experiments",
        "Anytime, anywhere, unlimited times",
        "Interactive 3D model explanations",
      ],
      buttonText: "Get Standard",
      highlight: true,
    },
    {
      name: "Pro",
      price: "₹599",
      duration: "/month",
      features: [
        "All features in the Standard subscription",
        "Advance Virtual Reality (VR) mode",
        "Chatbot assistance 24x7",
      ],
      buttonText: "Get Pro",
      highlight: false,
    },
    {
      name: "Colleges & Organisations",
      price: "Custom",
      duration: " License",
      features: [
        "Buy the license of the product",
        "Bulk deployment for student batches",
        "Contact us for queries and product details",
      ],
      buttonText: "Contact Us",
      isContact: true,
      highlight: false,
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
          Pricing & Plans
        </span>
        <h1 style={{ fontSize: "36px", margin: "14px 0 8px 0", color: isDark ? "#f8fafc" : "#0f172a" }}>
          Choose Your Subscription
        </h1>
        <p style={{ color: isDark ? "#94a3b8" : "#475569", fontSize: "15px", margin: 0 }}>
          Unlock the full potential of the Virtual Laboratory with a plan that suits you.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "22px",
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {plans.map((plan, idx) => (
          <div
            key={idx}
            style={{
              padding: "30px 24px",
              borderRadius: "18px",
              background: plan.highlight
                ? isDark
                  ? "linear-gradient(135deg, rgba(2, 132, 199, 0.2), rgba(37, 99, 235, 0.2))"
                  : "linear-gradient(135deg, #e0f2fe, #dbeafe)"
                : isDark
                ? "rgba(15, 23, 42, 0.6)"
                : "#ffffff",
              border: plan.highlight
                ? "1px solid #38bdf8"
                : isDark
                ? "1px solid #1e293b"
                : "1px solid #e2e8f0",
              display: "flex",
              flexDirection: "column",
              boxShadow: isDark ? "0 10px 30px rgba(0,0,0,0.3)" : "0 10px 30px rgba(0,0,0,0.06)",
              position: "relative",
            }}
          >
            {plan.highlight && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  background: "#38bdf8",
                  color: "#0f172a",
                  fontSize: "11px",
                  fontWeight: "800",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  textTransform: "uppercase",
                }}
              >
                Most Popular
              </div>
            )}
            <h3 style={{ margin: "0 0 10px 0", fontSize: "20px", color: isDark ? "#f8fafc" : "#0f172a" }}>
              {plan.name}
            </h3>
            <div style={{ marginBottom: "20px" }}>
              <span
                style={{
                  fontSize: "32px",
                  fontWeight: "800",
                  color: plan.highlight ? "#38bdf8" : isDark ? "#f8fafc" : "#0f172a",
                }}
              >
                {plan.price}
              </span>
              <span style={{ fontSize: "14px", color: isDark ? "#94a3b8" : "#64748b" }}>
                {plan.duration}
              </span>
            </div>

            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 30px 0", flex: 1 }}>
              {plan.features.map((feat, i) => (
                <li
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    marginBottom: "12px",
                    fontSize: "14px",
                    color: isDark ? "#cbd5e1" : "#475569",
                    lineHeight: "1.5",
                  }}
                >
                  <span style={{ color: "#22c55e", flexShrink: 0 }}>✓</span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => {
                if (plan.isContact) {
                  navigate("/contact");
                }
              }}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: plan.highlight ? "none" : isDark ? "1px solid #38bdf8" : "1px solid #0284c7",
                background: plan.highlight ? "#2563eb" : "transparent",
                color: plan.highlight ? "#ffffff" : isDark ? "#38bdf8" : "#0284c7",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (!plan.highlight) {
                  e.currentTarget.style.background = isDark ? "rgba(56, 189, 248, 0.1)" : "rgba(2, 132, 199, 0.1)";
                } else {
                  e.currentTarget.style.background = "#1d4ed8";
                }
              }}
              onMouseLeave={(e) => {
                if (!plan.highlight) {
                  e.currentTarget.style.background = "transparent";
                } else {
                  e.currentTarget.style.background = "#2563eb";
                }
              }}
            >
              {plan.buttonText}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
