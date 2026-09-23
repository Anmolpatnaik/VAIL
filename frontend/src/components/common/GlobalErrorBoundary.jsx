import React, { Component } from "react";

/**
 * GlobalErrorBoundary — VAIL 2.0 Top-Level Application Error Boundary
 *
 * Catches any unhandled JavaScript runtime exceptions in child component trees,
 * prevents the application from unmounting completely (white screen of death),
 * logs diagnostics, and provides a polished recovery UI.
 */
export default class GlobalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("VAIL Global Application Crash Caught:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetState = () => {
    try {
      // Clear potentially corrupt session keys if needed
      window.sessionStorage?.clear();
    } catch {
      // ignore
    }
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      const errorMsg = this.state.error?.message || "An unexpected rendering error occurred.";
      const isDark = this.props.isDark !== false;

      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: isDark
              ? "radial-gradient(ellipse at top, #0f172a 0%, #020617 100%)"
              : "#f8fafc",
            color: isDark ? "#f8fafc" : "#0f172a",
            padding: "24px",
            fontFamily: "system-ui, -apple-system, sans-serif",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              maxWidth: "560px",
              width: "100%",
              background: isDark ? "rgba(15, 23, 42, 0.85)" : "#ffffff",
              border: isDark ? "1px solid rgba(239, 68, 68, 0.35)" : "1px solid #fee2e2",
              borderRadius: "18px",
              padding: "36px 28px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(12px)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "60px",
                height: "60px",
                margin: "0 auto 20px",
                borderRadius: "50%",
                background: "rgba(239, 68, 68, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
              }}
            >
              ⚠️
            </div>

            <h1
              style={{
                fontSize: "22px",
                fontWeight: "800",
                margin: "0 0 10px",
                color: "#ef4444",
              }}
            >
              Virtual Laboratory Encountered an Error
            </h1>

            <p
              style={{
                fontSize: "14px",
                color: isDark ? "#94a3b8" : "#64748b",
                margin: "0 0 20px",
                lineHeight: "1.6",
              }}
            >
              The application recovered from an unexpected error to protect your active laboratory
              data and observations.
            </p>

            <div
              style={{
                background: isDark ? "#090d16" : "#f1f5f9",
                border: isDark ? "1px solid #1e293b" : "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "12px 14px",
                textAlign: "left",
                fontFamily: "monospace",
                fontSize: "12px",
                color: "#f87171",
                marginBottom: "24px",
                wordBreak: "break-word",
                maxHeight: "120px",
                overflowY: "auto",
              }}
            >
              {errorMsg}
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={this.handleReload}
                style={{
                  padding: "10px 22px",
                  background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: "700",
                  fontSize: "14px",
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(2, 132, 199, 0.35)",
                }}
              >
                🔄 Reload Page
              </button>

              <button
                onClick={this.handleResetState}
                style={{
                  padding: "10px 22px",
                  background: "transparent",
                  color: isDark ? "#38bdf8" : "#0284c7",
                  border: isDark ? "1px solid #38bdf8" : "1px solid #0284c7",
                  borderRadius: "10px",
                  fontWeight: "600",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                🏠 Return to Portal Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
