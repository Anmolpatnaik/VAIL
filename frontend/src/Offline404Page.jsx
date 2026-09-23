import React, { useState } from "react";

export default function Offline404Page({
  isOffline = true,
  currentViewName = "Virtual Laboratory",
  onRetry,
  isDark = true,
}) {
  const [checking, setChecking] = useState(false);
  const [checkMessage, setCheckMessage] = useState("");
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  const handleRetryClick = async () => {
    setChecking(true);
    setCheckMessage("Checking internet connection...");

    try {
      if (onRetry) {
        const success = await onRetry();
        if (!success) {
          setCheckMessage("❌ Still offline. Please check your internet connection.");
        } else {
          setCheckMessage("✅ Internet connection restored!");
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 800));
        if (navigator.onLine) {
          setCheckMessage("✅ Internet connection restored!");
          window.location.reload();
        } else {
          setCheckMessage("❌ No internet detected. Please reconnect to Wi-Fi or Ethernet.");
        }
      }
    } catch (err) {
      setCheckMessage("❌ Connection check failed. Still offline.");
    } finally {
      setTimeout(() => {
        setChecking(false);
      }, 1200);
    }
  };

  return (
    <div className={`offline-404-container ${isDark ? "dark-theme" : "light-theme"}`}>
      <div className="offline-404-card">
        {/* Top Status Pill */}
        <div className="offline-status-pill">
          <span className="offline-pulse-dot" />
          <span className="offline-status-text">
            {isOffline ? "404 ERROR • INTERNET NOT WORKING" : "404 ERROR • PAGE NOT FOUND"}
          </span>
        </div>

        {/* Animated Radar / Disconnected Graphic */}
        <div className="offline-radar-wrapper" aria-hidden="true">
          <div className="offline-radar-ring ring-3" />
          <div className="offline-radar-ring ring-2" />
          <div className="offline-radar-ring ring-1" />
          <div className="offline-center-icon">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="offline-svg-icon"
            >
              <line x1="1" y1="1" x2="23" y2="23" stroke="#f43f5e" strokeWidth="2.5" />
              <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
              <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
              <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
              <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
              <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="3" />
            </svg>
          </div>
        </div>

        {/* 404 Heading */}
        <h1 className="offline-glitch-404">404</h1>

        {/* Headings */}
        <h2 className="offline-title">
          {isOffline ? "Internet Connection Not Found" : "Laboratory Resource Not Found"}
        </h2>
        <p className="offline-desc">
          {isOffline
            ? "Your device is currently offline. The Virtual Lab Portal requires an active internet connection to run laboratory simulations, load 3D apparatus, and compute real-time analytical calculations."
            : "The experimental module or laboratory section you requested could not be located. Please check the URL or return to the Virtual Lab home."}
        </p>

        {/* Live Diagnostics Card */}
        <div className="offline-diagnostics-box">
          <div className="offline-diag-header" onClick={() => setShowDiagnostics((p) => !p)}>
            <span>🛠️ Network Diagnostics</span>
            <span style={{ fontSize: "12px", opacity: 0.8 }}>
              {showDiagnostics ? "▲ Hide" : "▼ Details"}
            </span>
          </div>

          <div className="offline-diag-body">
            <div className="offline-diag-row">
              <span className="offline-diag-label">Connection Status:</span>
              <span className="offline-diag-val-danger">
                🔴 {isOffline ? "Offline (No Internet Connection)" : "Connected"}
              </span>
            </div>
            <div className="offline-diag-row">
              <span className="offline-diag-label">Target Module:</span>
              <span className="offline-diag-val">{currentViewName}</span>
            </div>
            <div className="offline-diag-row">
              <span className="offline-diag-label">Simulation State:</span>
              <span className="offline-diag-val-warning">⏸️ Paused (Data Saved)</span>
            </div>

            {showDiagnostics && (
              <div className="offline-troubleshoot-steps">
                <div className="troubleshoot-title">Troubleshooting Checklist:</div>
                <ul>
                  <li>1. Check whether your Wi-Fi router or mobile hotspot is turned on.</li>
                  <li>2. Ensure Airplane Mode is disabled on your device.</li>
                  <li>3. Verify that your network cables are properly connected.</li>
                  <li>4. Once internet is back, click <strong>"Retry Connection"</strong> below.</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Status Check Message Feedback */}
        {checkMessage && (
          <div
            className={`offline-feedback-msg ${
              checkMessage.startsWith("✅") ? "msg-success" : "msg-error"
            }`}
          >
            {checkMessage}
          </div>
        )}

        {/* Action Button */}
        <div className="offline-actions">
          <button
            className="offline-btn offline-btn-primary"
            onClick={handleRetryClick}
            disabled={checking}
          >
            {checking ? (
              <>
                <span className="offline-spinner" /> Checking Connection...
              </>
            ) : (
              <>🔄 Retry Connection</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
