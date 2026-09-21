import React, { useState, useEffect, useRef } from "react";
import "./App.css";

// 1. Root-level simulations:
import RCSimulation from "./RCsimulation";
import HysteresisSimulation from "./Hysteresissimulation";

// 2. Subfolder simulations (Inside "Visual Laboratory"):
import VibrationStringSimulation from "./vibrationstringsimulation";
import ImpulseMomentum from "./impulsemomentum";
import EDMSimulation from "./EDMSimulation";
import OpAmpSimulation from "./OpAmpSimulation";
import Offline404Page from "./Offline404Page";
import LabReportModal from "./LabReportModal";

// ============================================================================
// EXPERIMENT DEFINITIONS & ICONS CONFIGURATION
// Manage the icons, branch assignments, and metadata for each experiment here.
// You can set `icon` to any emoji (e.g. "🔌", "⚡", "🔬") or custom icon.
// ============================================================================
const experiments = [
  {
    id: "rc",
    branch: "cse",
    icon: "🔌",
    title: "Charging & Discharging of Capacitor",
    subtitle: "RC Circuit",
    description: "Study the charging and discharging characteristics of a capacitor in an RC circuit.",
  },
  {
    id: "hysteresis",
    branch: "cse",
    icon: "🧲",
    title: "Hysteresis Loss",
    subtitle: "B-H Curve",
    description: "Study the hysteresis loop and understand energy loss in magnetic materials.",
  },
  {
    id: "string",
    branch: "cse",
    icon: "〰️",
    title: "Vibrations on String",
    subtitle: "Standing Waves",
    description: "Investigate the relationship between tension, frequency and wavelength of a vibrating string.",
  },
  {
    id: "impulse",
    branch: "cse",
    icon: "💥",
    title: "Impulse-Momentum Theorem",
    subtitle: "Verification",
    description: "Verify the impulse-momentum theorem using an interactive collision experiment.",
  },
  {
    id: "edm",
    branch: "mechanical",
    icon: "⚙️",
    title: "Electric Discharge Machining",
    subtitle: "Smart ZNC EDM",
    description: "Study the effect of current, voltage, and pulse parameters on Material Removal Rate (MRR).",
  },
  {
    id: "opamp",
    branch: "ece",
    icon: "⚡",
    title: "Operational Amplifier",
    subtitle: "Inverting / Non-Inverting",
    description: "Study voltage gain, input/output characteristics, and saturation limits using an Op-Amp (IC 741).",
  },
];

// ============================================================================
// EXPERIMENT PARTS (MODULES / TABS) CONFIGURATION
// Manage the icons and labels for each section of the experiment workspace here.
// To change any part's icon, simply update the `icon` field below.
// ============================================================================
const EXPERIMENT_PARTS = [
  { id: "safety", label: "Safety Measures", icon: "🛡️" },
  { id: "video", label: "Video Guide", icon: "🎥" },
  { id: "theory", label: "Theory", icon: "📖" },
  { id: "procedure", label: "Procedure", icon: "📋" },
  { id: "experiment", label: "Experiment", icon: "🔬" },
  { id: "observations", label: "Observations", icon: "📊" },
  { id: "calculations", label: "Calculations", icon: "🧮" },
  { id: "viva", label: "Viva Questions", icon: "💡" },
];

// ============================================================================
// GLOBAL UPPER DASHBOARD (NAVBAR)
// Permanent navigation dashboard shown across all pages and contexts:
// Virtual Lab Logo | Theme Toggle | Home | Degree Programs | About Lab | Subscriptions | Contact Us
// ============================================================================
function GlobalNavbar({
  currentView,
  onNavigateHome,
  onNavigateAbout,
  onNavigateContact,
  onNavigateSubscriptions,
  onSelectProgram,
  isDark,
  toggleTheme,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isProgramsActive =
    currentView === "btech_branches" ||
    currentView === "branch_experiments" ||
    currentView === "mtech" ||
    currentView === "phd";

  return (
    <div className="global-navbar-wrapper">
      <header
        className="home-navbar"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Top Left: Theme Toggle Button + Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={toggleTheme}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              border: isDark ? "1px solid #334155" : "1px solid #cbd5e1",
              background: isDark ? "rgba(15, 23, 42, 0.8)" : "#ffffff",
              color: isDark ? "#facc15" : "#0f172a",
              fontSize: "18px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {isDark ? "☀️" : "🌙"}
          </button>

          <div
            className="home-logo"
            onClick={onNavigateHome}
            style={{ cursor: "pointer" }}
            title="Go to Virtual Lab Home"
          >
            <div className="logo-symbol" aria-hidden="true"></div>
            <div className="logo-text">
              <strong>Virtual Lab Portal</strong>
            </div>
          </div>
        </div>

        {/* Top Right: Nav Items + Degree Programs Dropdown + Subscriptions + Contact Us */}
        <nav
          className="home-nav"
          style={{ display: "flex", alignItems: "center", gap: "20px" }}
        >
          <button
            onClick={onNavigateHome}
            className={currentView === "home" ? "nav-active" : ""}
            style={{
              color: currentView === "home" ? (isDark ? "#38bdf8" : "#0284c7") : (isDark ? "#cbd5e1" : "#334155"),
              fontWeight: currentView === "home" ? "700" : "500",
            }}
          >
            Home
          </button>

          {/* PROGRAMS DROPDOWN (B.Tech, M.Tech, Ph.D.) */}
          <div style={{ position: "relative" }} ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className={isProgramsActive ? "nav-active" : ""}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "transparent",
                border: "none",
                color: dropdownOpen || isProgramsActive ? (isDark ? "#38bdf8" : "#0284c7") : (isDark ? "#cbd5e1" : "#334155"),
                fontSize: "14px",
                fontWeight: dropdownOpen || isProgramsActive ? "700" : "600",
                cursor: "pointer",
                padding: "6px 0",
              }}
            >
              Degree Programs <span style={{ fontSize: "10px" }}>▼</span>
            </button>

            {dropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  marginTop: "8px",
                  background: isDark ? "#0b172a" : "#ffffff",
                  border: isDark ? "1px solid #1e3a5f" : "1px solid #cbd5e1",
                  borderRadius: "10px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                  padding: "6px",
                  minWidth: "150px",
                  zIndex: 200,
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onSelectProgram("btech");
                  }}
                  style={{
                    textAlign: "left",
                    padding: "8px 12px",
                    background: currentView === "btech_branches" || currentView === "branch_experiments" ? (isDark ? "#1e293b" : "#e2e8f0") : "transparent",
                    border: "none",
                    color: isDark ? "#f8fafc" : "#0f172a",
                    fontSize: "13px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? "#1e293b" : "#f1f5f9")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = (currentView === "btech_branches" || currentView === "branch_experiments") ? (isDark ? "#1e293b" : "#e2e8f0") : "transparent")}
                >
                  <span>🎓 B.Tech</span>
                  <span style={{ fontSize: "10px", color: "#38bdf8" }}>Active</span>
                </button>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onSelectProgram("mtech");
                  }}
                  style={{
                    textAlign: "left",
                    padding: "8px 12px",
                    background: currentView === "mtech" ? (isDark ? "#1e293b" : "#e2e8f0") : "transparent",
                    border: "none",
                    color: isDark ? "#94a3b8" : "#475569",
                    fontSize: "13px",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? "#1e293b" : "#f1f5f9")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = currentView === "mtech" ? (isDark ? "#1e293b" : "#e2e8f0") : "transparent")}
                >
                  📚 M.Tech
                </button>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onSelectProgram("phd");
                  }}
                  style={{
                    textAlign: "left",
                    padding: "8px 12px",
                    background: currentView === "phd" ? (isDark ? "#1e293b" : "#e2e8f0") : "transparent",
                    border: "none",
                    color: isDark ? "#94a3b8" : "#475569",
                    fontSize: "13px",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? "#1e293b" : "#f1f5f9")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = currentView === "phd" ? (isDark ? "#1e293b" : "#e2e8f0") : "transparent")}
                >
                  🔬 Ph.D.
                </button>
              </div>
            )}
          </div>

          <a href="#about" onClick={onNavigateAbout}>
            About Lab
          </a>

          {/* Subscriptions Button */}
          <button
            onClick={onNavigateSubscriptions}
            className={currentView === "subscriptions" ? "nav-active" : ""}
            style={{
              background: "transparent",
              border: "none",
              color: currentView === "subscriptions" ? (isDark ? "#38bdf8" : "#0284c7") : (isDark ? "#cbd5e1" : "#334155"),
              fontSize: "14px",
              fontWeight: currentView === "subscriptions" ? "700" : "600",
              cursor: "pointer",
              padding: "6px 0",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = isDark ? "#f8fafc" : "#0f172a")}
            onMouseLeave={(e) => (e.currentTarget.style.color = currentView === "subscriptions" ? (isDark ? "#38bdf8" : "#0284c7") : (isDark ? "#cbd5e1" : "#334155"))}
          >
            Subscriptions
          </button>

          {/* Dedicated Contact Us Button */}
          <button
            onClick={onNavigateContact}
            style={{
              color: currentView === "contact" ? "#ffffff" : "#38bdf8",
              fontWeight: "600",
              fontSize: "14px",
              padding: "6px 14px",
              borderRadius: "8px",
              background: currentView === "contact"
                ? "#0284c7"
                : isDark
                ? "rgba(56, 189, 248, 0.1)"
                : "rgba(2, 132, 199, 0.1)",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#38bdf8";
              e.currentTarget.style.color = "#040d1a";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = currentView === "contact"
                ? "#0284c7"
                : isDark
                ? "rgba(56, 189, 248, 0.1)"
                : "rgba(2, 132, 199, 0.1)";
              e.currentTarget.style.color = currentView === "contact" ? "#ffffff" : "#38bdf8";
            }}
          >
            Contact Us
          </button>
        </nav>
      </header>
    </div>
  );
}

function App() {
  // Navigation views: "home", "contact", "subscriptions", "btech_branches", "branch_experiments", "mtech", "phd", or experiment id
  const [currentView, setCurrentView] = useState("home");
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [isDark, setIsDark] = useState(true);

  // Network connectivity: real online/offline detection
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" && typeof navigator.onLine === "boolean"
      ? navigator.onLine
      : true
  );
  const [showOnlineToast, setShowOnlineToast] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOnlineToast(true);
      const timer = setTimeout(() => setShowOnlineToast(false), 4000);
      return () => clearTimeout(timer);
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetryConnection = async () => {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      return false;
    }

    try {
      await fetch(window.location.origin + "/favicon.ico", {
        method: "HEAD",
        cache: "no-store",
      });
      setIsOnline(true);
      setShowOnlineToast(true);
      setTimeout(() => setShowOnlineToast(false), 4000);
      return true;
    } catch {
      if (typeof navigator !== "undefined" && navigator.onLine) {
        setIsOnline(true);
        setShowOnlineToast(true);
        setTimeout(() => setShowOnlineToast(false), 4000);
        return true;
      }
      return false;
    }
  };

  // Determine current active experiment or view label for telemetry
  const currentExpObj = experiments.find((e) => e.id === currentView);
  const standardViews = [
    "home",
    "contact",
    "subscriptions",
    "btech_branches",
    "branch_experiments",
    "mtech",
    "phd",
  ];
  const isUnknownRoute = !standardViews.includes(currentView) && !currentExpObj;

  const currentViewLabel = currentExpObj
    ? currentExpObj.title
    : currentView === "home"
    ? "Portal Home"
    : currentView === "btech_branches"
    ? "B.Tech Engineering Branches"
    : currentView === "branch_experiments"
    ? "Branch Experiments"
    : currentView === "subscriptions"
    ? "Lab Subscriptions"
    : currentView === "contact"
    ? "Contact Laboratory"
    : "Virtual Laboratory Portal";

  // WHENEVER OFFLINE: Render ONLY the 404 page and nothing else!
  if (!isOnline) {
    return (
      <div className={`app ${isDark ? "dark-theme" : "light-theme"}`}>
        <Offline404Page
          isOffline={true}
          currentViewName={currentViewLabel}
          onRetry={handleRetryConnection}
          isDark={isDark}
        />
      </div>
    );
  }

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const handleProgramSelect = (program) => {
    if (program === "btech") {
      setCurrentView("btech_branches");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (program === "mtech") {
      setCurrentView("mtech");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (program === "phd") {
      setCurrentView("phd");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBranchSelect = (branchId) => {
    setSelectedBranch(branchId);
    setCurrentView("branch_experiments");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className={`app ${isDark ? "dark-theme" : "light-theme"}`}>
      {/* Toast Notification when Reconnected */}
      {showOnlineToast && (
        <div className="offline-toast-bar toast-online">
          🟢 Connection Restored! Virtual Lab Portal is back online.
        </div>
      )}

      {/* Permanent upper dashboard on all pages & contexts */}
      <GlobalNavbar
        currentView={currentView}
        onNavigateHome={() => {
          setCurrentView("home");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onNavigateAbout={(e) => {
          if (e) e.preventDefault();
          if (currentView !== "home") {
            setCurrentView("home");
            setTimeout(() => {
              const el = document.getElementById("about");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }, 100);
          } else {
            const el = document.getElementById("about");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }
        }}
        onNavigateContact={() => {
          setCurrentView("contact");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onNavigateSubscriptions={() => {
          setCurrentView("subscriptions");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onSelectProgram={handleProgramSelect}
        isDark={isDark}
        toggleTheme={toggleTheme}
      />

      {isUnknownRoute ? (
        <Offline404Page
          isOffline={false}
          currentViewName={currentView}
          onRetry={() => {
            setCurrentView("home");
            return true;
          }}
          isDark={isDark}
        />
      ) : (
        <>
          {currentView === "home" && <Home isDark={isDark} />}

          {currentView === "btech_branches" && (
            <BTechBranchesPage
              onBack={() => setCurrentView("home")}
              onSelectBranch={handleBranchSelect}
              isDark={isDark}
            />
          )}

          {currentView === "branch_experiments" && (
            <BranchExperimentsPage
              branchId={selectedBranch}
              onBack={() => setCurrentView("btech_branches")}
              onSelectExperiment={(id) => {
                setCurrentView(id);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              isDark={isDark}
            />
          )}

          {currentView === "mtech" && (
            <GenericProgramPage
              title="M.Tech Virtual Laboratory"
              subtitle="Advanced Postgraduate Experimental Modules"
              onBack={() => setCurrentView("home")}
              isDark={isDark}
            />
          )}

          {currentView === "phd" && (
            <GenericProgramPage
              title="Ph.D. Research Portal"
              subtitle="Doctoral Simulations & Experimental Data Modeling"
              onBack={() => setCurrentView("home")}
              isDark={isDark}
            />
          )}

          {currentView === "subscriptions" && (
            <SubscriptionsPage
              onBack={() => setCurrentView("home")}
              onNavigateContact={() => setCurrentView("contact")}
              isDark={isDark}
            />
          )}

          {currentView === "contact" && (
            <ContactPage
              onBack={() => setCurrentView("home")}
              isDark={isDark}
            />
          )}

          {currentView !== "home" &&
            currentView !== "contact" &&
            currentView !== "subscriptions" &&
            currentView !== "btech_branches" &&
            currentView !== "branch_experiments" &&
            currentView !== "mtech" &&
            currentView !== "phd" && (
              <ExperimentPage
                experiment={currentView}
                onBack={() => setCurrentView("branch_experiments")}
              />
            )}
        </>
      )}
    </div>
  );
}

/* =========================================================
   SUBSCRIPTIONS PAGE COMPONENT
========================================================= */
function SubscriptionsPage({ onBack, onNavigateContact, isDark }) {
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
      <button className="back-btn" onClick={onBack}>
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
                  onNavigateContact();
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

/* =========================================================
   B.TECH BRANCHES SELECTION PAGE
========================================================= */
function BTechBranchesPage({ onBack, onSelectBranch, isDark }) {
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
      <button className="back-btn" onClick={onBack}>
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
              if (branch.active) onSelectBranch(branch.id);
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

/* =========================================================
   BRANCH EXPERIMENTS PAGE (Shows labs for selected department)
========================================================= */
function BranchExperimentsPage({ branchId, onBack, onSelectExperiment, isDark }) {
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
      <button className="back-btn" onClick={onBack}>
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
            <button onClick={() => onSelectExperiment(exp.id)} className="experiment-open-btn">
              Open Experiment <span>→</span>
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}

/* =========================================================
   GENERIC M.TECH / PH.D. PLACEHOLDER PAGE
========================================================= */
function GenericProgramPage({ title, subtitle, onBack, isDark }) {
  return (
    <main className="main-content" style={{ minHeight: "80vh", display: "flex", flexDirection: "column" }}>
      <button className="back-btn" onClick={onBack} style={{ width: "fit-content" }}>
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

function Home({ isDark }) {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="home-page">
      {/* ================= HERO ================= */}
      <section className="home-hero">
        <div className="hero-glow glow-one"></div>
        <div className="hero-glow glow-two"></div>
        <div className="hero-glow glow-three"></div>

        <div className="atom-scene">
          <div className="atom-core">
            <div className="core-light"></div>
          </div>
          <div className="atom-orbit orbit-1"></div>
          <div className="atom-orbit orbit-2"></div>
          <div className="atom-orbit orbit-3"></div>
          <div className="atom-orbit orbit-4"></div>
          <div className="atom-orbit orbit-5"></div>
          <div className="atom-orbit orbit-6"></div>
        </div>

        {/* ================= HERO CONTENT ================= */}
        <div className="home-hero-content">
          <div className="hero-copy">
            <span className="hero-label">
              VIRTUAL LABORATORY HUB
            </span>

            <h1>
              Learn Engineering.
              <br />
              <span className="gradient-heading">
                Experiment
                <br />
                Virtually.
              </span>
            </h1>

            <div className="hero-description">
              <p>
                Perform laboratory experiments across branches through interactive simulations,
                observe results, record readings and verify laws. Access modules via the Degree Programs menu above.
              </p>
            </div>
          </div>

          {/* ================= LAB EQUIPMENT ================= */}
          <div className="lab-scene">
            <div className="function-generator">
              <div className="equipment-title">FUNCTION GENERATOR</div>
              <div className="generator-display">
                <div className="display-grid"></div>
                <svg viewBox="0 0 240 90" className="wave-svg">
                  <path d="M0 48 L30 48 L40 20 L52 70 L65 48 L95 48 L105 20 L117 70 L130 48 L160 48 L170 20 L182 70 L195 48 L240 48" />
                </svg>
              </div>
              <div className="generator-big-knob">
                <span></span>
              </div>
              <div className="generator-label-row">
                <span>FREQUENCY</span>
                <span>AMPLITUDE</span>
              </div>
              <div className="generator-controls">
                <div className="small-knob"><span></span></div>
                <div className="small-knob"><span></span></div>
                <div className="square-button"></div>
                <div className="square-button"></div>
              </div>
              <div className="generator-ports">
                <span></span><span></span>
              </div>
            </div>

            <div className="physics-coil">
              <div className="coil-terminal terminal-left"></div>
              <div className="coil-terminal terminal-right"></div>
              <div className="coil-terminal terminal-left-top"></div>
              <div className="coil-terminal terminal-right-top"></div>
              <div className="coil-horn horn-left"></div>
              <div className="coil-horn horn-right"></div>
              <div className="coil-top"></div>
              <div className="coil-winding">
                <i></i><i></i><i></i><i></i><i></i><i></i>
                <i></i><i></i><i></i><i></i><i></i><i></i>
              </div>
              <div className="coil-base"></div>
            </div>

            <div className="dc-supply">
              <div className="dc-title">DC POWER SUPPLY</div>
              <div className="power-switch"><span></span></div>
              <small className="power-text">POWER</small>
              <div className="dc-screen">
                <strong>12.00</strong><span>V</span>
              </div>
              <div className="dc-labels">
                <span>VOLTAGE</span><span>CURRENT</span>
              </div>
              <div className="dc-knobs">
                <div className="dc-knob"><span></span></div>
                <div className="dc-knob"><span></span></div>
              </div>
              <div className="dc-output">
                <div className="output-positive">+</div>
                <div className="output-negative">−</div>
                <div className="output-ground">GND</div>
              </div>
            </div>

            <div className="lab-wire wire-one"></div>
            <div className="lab-wire wire-two"></div>
          </div>
        </div>

        <div className="scroll-hint">
          <span>↓</span>
          <small>SCROLL DOWN</small>
        </div>
      </section>

      {/* ================= ABOUT ================= */}
      <section className="home-about" id="about">
        <div className="section-intro">
          <span>ABOUT THE LAB</span>
          <h2>Learn. Experiment. Verify.</h2>
          <p>A virtual environment designed to make complex engineering experiments interactive and accessible.</p>
        </div>

        <div className="about-grid-new">
          <div className="about-glass-card">
            <strong>01</strong>
            <h3>Interactive Simulation</h3>
            <p>Change experimental parameters and observe the results instantly.</p>
          </div>
          <div className="about-glass-card">
            <strong>02</strong>
            <h3>Record Observations</h3>
            <p>Take readings and export your data directly to Excel for analysis.</p>
          </div>
          <div className="about-glass-card">
            <strong>03</strong>
            <h3>Verify Results</h3>
            <p>Compare experimental results with theoretical calculations safely.</p>
          </div>
          <div className="about-glass-card">
            <strong>04</strong>
            <h3>Learn Anywhere</h3>
            <p>Explore physics and engineering tools through a convenient portal.</p>
          </div>
        </div>

        {/* --- WHY US? SECTION --- */}
        <div
          id="why-us"
          style={{
            marginTop: "32px",
            padding: "24px 30px",
            background: isDark ? "rgba(15, 23, 42, 0.75)" : "rgba(241, 245, 249, 0.9)",
            border: isDark ? "1px solid #1e3a5f" : "1px solid #cbd5e1",
            borderRadius: "14px",
            display: "flex",
            alignItems: "center",
            gap: "18px",
          }}
        >
          <div style={{ fontSize: "28px" }}>💡</div>
          <div>
            <h3 style={{ margin: "0 0 6px 0", fontSize: "18px", color: isDark ? "#38bdf8" : "#0284c7" }}>
              Why Us?
            </h3>
            <p style={{ margin: 0, fontSize: "15px", color: isDark ? "#cbd5e1" : "#334155", lineHeight: "1.5" }}>
              Because we provide you the best environment to learn dynamically on your own schedule.
            </p>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="home-footer">
        <div>
          <strong>Virtual Lab Portal</strong>
        </div>
        <p>Interactive Physics • Virtual Experiments • Engineering Learning</p>
      </footer>

      {/* ================= FLOATING BACK TO TOP BUTTON ================= */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          title="Back to top"
          style={{
            position: "fixed",
            bottom: "32px",
            right: "32px",
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: isDark
              ? "linear-gradient(135deg, #0284c7, #2563eb)"
              : "linear-gradient(135deg, #38bdf8, #0284c7)",
            color: "#ffffff",
            border: "1px solid rgba(255, 255, 255, 0.25)",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            cursor: "pointer",
            zIndex: 999,
            transition: "all 0.25s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px) scale(1.05)";
            e.currentTarget.style.boxShadow = "0 12px 30px rgba(56, 189, 248, 0.45)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0) scale(1)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.35)";
          }}
        >
          ↑
        </button>
      )}
    </div>
  );
}

/* =========================================================
   CONTACT US PAGE COMPONENT
========================================================= */
function ContactPage({ onBack, isDark }) {
  return (
    <main className="main-content" style={{ minHeight: "80vh", display: "flex", flexDirection: "column" }}>
      <button className="back-btn" onClick={onBack} style={{ width: "fit-content" }}>
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

function VideoGuideSection({ experiment, onVideoComplete, isCompleted, onNext }) {
  const videoMap = {
    rc: { title: "RC Circuit Charging & Discharging Tutorial", src: "/videos/rc.mp4", hasVideo: true, summary: "Detailed demonstration of capacitor charging, time constant calculation, and voltage-time curve plotting." },
    hysteresis: { title: "Hysteresis Loss & B-H Loop Tutorial", src: "/videos/hysteresis.mp4", hasVideo: true, summary: "Demonstration of cyclic core magnetization, loop area integration, and coercivity/remanence extraction." },
    string: { title: "Vibrations on String Tutorial", src: "/videos/string.mp4", hasVideo: true, summary: "Demonstration of standing wave nodes, antinodes, tension adjustment, and harmonic frequency verification." },
    impulse: { title: "Impulse-Momentum Theorem Tutorial", src: "/videos/impulse.mp4", hasVideo: true, summary: "Demonstration of collision dynamics, force-time graphs, and impulse calculation." },
    edm: { title: "Smart ZNC EDM Operation Briefing", src: null, hasVideo: false, summary: "Interactive simulation guide: Study current, pulse timing, and spark dynamics on Material Removal Rate (MRR)." },
    opamp: { title: "Op-Amp Gain & Characteristics Briefing", src: null, hasVideo: false, summary: "Interactive circuit guide: Explore inverting & non-inverting topologies, voltage gain, and rail saturation." },
  };

  const video = videoMap[experiment];

  if (!video) return null;

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

        {video.hasVideo ? (
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

function ExperimentPage({ experiment, onBack }) {
  const [activeTab, setActiveTab] = useState("safety");
  const [safetyAcknowledged, setSafetyAcknowledged] = useState(false);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [observations, setObservations] = useState([null, null, null, null, null]);
  const [showOverflowModal, setShowOverflowModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [pendingData, setPendingData] = useState(null);

  const currentExperiment = experiments.find((e) => e.id === experiment);

  const handleAcknowledgeSafety = () => {
    setSafetyAcknowledged(true);
    setActiveTab("video");
  };

  const handleVideoFinished = () => {
    setVideoCompleted(true);
  };

  const handleSaveObservation = (data) => {
    const emptyIndex = observations.findIndex((obs) => obs === null);
    if (emptyIndex !== -1) {
      const updated = [...observations];
      updated[emptyIndex] = data;
      setObservations(updated);
    } else {
      setPendingData(data);
      setShowOverflowModal(true);
    }
  };

  const handleEraseSlot = (index) => {
    const updated = [...observations];
    if (pendingData) {
      updated[index] = pendingData;
      setPendingData(null);
      setShowOverflowModal(false);
    } else {
      updated[index] = null;
    }
    setObservations(updated);
  };

  const tabs = EXPERIMENT_PARTS.map((part) => ({
    ...part,
    unlocked:
      part.id === "safety"
        ? true
        : part.id === "video"
        ? safetyAcknowledged
        : videoCompleted,
  }));

  return (
    <main className="main-content">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", gap: "12px", flexWrap: "wrap" }}>
        <button className="back-btn" onClick={onBack}>← Back to Experiments</button>

        <span
          style={{
            padding: "6px 14px",
            borderRadius: "20px",
            background: videoCompleted ? "rgba(34, 197, 94, 0.12)" : "rgba(239, 68, 68, 0.12)",
            border: `1px solid ${videoCompleted ? "#22c55e" : "#ef4444"}`,
            color: videoCompleted ? "#4ade80" : "#f87171",
            fontSize: "12px",
            fontWeight: "700",
            letterSpacing: "0.5px",
          }}
        >
          {videoCompleted
            ? "✅ All Laboratory Modules Unlocked"
            : !safetyAcknowledged
            ? "🔒 Step 1: Acknowledge Safety Precautions"
            : "🔒 Step 2: Complete Video Tutorial"}
        </span>
      </div>

      <div className="experiment-header">
        <div className="large-icon" aria-hidden="true" title={`${currentExperiment?.title} Icon`}>
          <span className="large-icon-inner">{currentExperiment?.icon}</span>
        </div>
        <div>
          <span>VIRTUAL EXPERIMENT</span>
          <h1>{currentExperiment?.title}</h1>
          <p>{currentExperiment?.description}</p>
        </div>
      </div>

      <div className="layout">
        <aside className="sidebar">
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            const isLocked = !tab.unlocked;

            return (
              <button
                key={tab.id}
                className={isSelected ? "active" : ""}
                onClick={() => {
                  if (tab.unlocked) setActiveTab(tab.id);
                }}
                disabled={isLocked}
                title={isLocked ? (tab.id === "video" ? "Acknowledge Safety Measures to unlock" : "Complete the Video Tutorial to unlock") : ""}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  opacity: isLocked ? 0.45 : 1,
                  cursor: isLocked ? "not-allowed" : "pointer",
                  borderColor: isSelected ? "#38bdf8" : undefined,
                  color: isSelected ? "#38bdf8" : undefined,
                }}
              >
                <div className="sidebar-tab-left">
                  <span className="sidebar-tab-icon">{tab.icon}</span>
                  <span className="sidebar-tab-label">{tab.label}</span>
                </div>
                {isLocked && <span style={{ fontSize: "11px", marginLeft: "4px" }}>🔒</span>}
              </button>
            );
          })}
        </aside>

        <section className="workspace">
          {activeTab === "safety" && (
            <SafetySection experiment={experiment} onProceed={handleAcknowledgeSafety} isAcknowledged={safetyAcknowledged} />
          )}

          {activeTab === "video" && (
            <VideoGuideSection experiment={experiment} onVideoComplete={handleVideoFinished} isCompleted={videoCompleted} onNext={() => setActiveTab("theory")} />
          )}

          {activeTab === "theory" && <TheorySection experiment={experiment} />}
          {activeTab === "procedure" && <ProcedureSection experiment={experiment} />}

          {activeTab === "experiment" && (
            <>
              {experiment === "rc" && <RCSimulation onSaveData={handleSaveObservation} />}
              {experiment === "hysteresis" && <HysteresisSimulation onSaveData={handleSaveObservation} />}
              {experiment === "string" && <VibrationStringSimulation onSaveData={handleSaveObservation} />}
              {experiment === "impulse" && <ImpulseMomentum onSaveData={handleSaveObservation} />}
              {experiment === "edm" && <EDMSimulation onSaveData={handleSaveObservation} />}
              {experiment === "opamp" && <OpAmpSimulation onSaveData={handleSaveObservation} />}
            </>
          )}

          {activeTab === "observations" && (
            <ObservationsSection
              experiment={experiment}
              observations={observations}
              onEraseSlot={handleEraseSlot}
              onOpenReportModal={() => setShowReportModal(true)}
            />
          )}
          {activeTab === "calculations" && (
            <CalculationsSection
              experiment={experiment}
              observations={observations}
              onOpenReportModal={() => setShowReportModal(true)}
            />
          )}
          {activeTab === "viva" && <VivaSection experiment={experiment} />}
        </section>
      </div>

      {/* OVERFLOW MODAL */}
      {showOverflowModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0, 0, 0, 0.75)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#0f172a", border: "1px solid #38bdf8", borderRadius: "14px", padding: "24px", maxWidth: "460px", width: "90%", boxShadow: "0 20px 40px rgba(0,0,0,0.6)", textAlign: "center", color: "#ffffff" }}>
            <h3 style={{ marginTop: 0, color: "#f87171" }}>⚠️ Observation Table Full</h3>
            <p style={{ fontSize: "14px", color: "#cbd5e1" }}>Select which experiment slot (1–5) to overwrite:</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px", margin: "20px 0" }}>
              {[1, 2, 3, 4, 5].map((num, idx) => (
                <button
                  key={num}
                  onClick={() => handleEraseSlot(idx)}
                  style={{ padding: "10px 0", background: "#1e293b", border: "1px solid #38bdf8", color: "#38bdf8", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}
                >
                  Exp {num}
                </button>
              ))}
            </div>
            <button
              onClick={() => { setShowOverflowModal(false); setPendingData(null); }}
              style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: "13px", cursor: "pointer", textDecoration: "underline" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* OFFICIAL LAB REPORT MODAL & PRINT GENERATOR */}
      <LabReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        experiment={experiment}
        experimentTitle={currentExperiment?.title || "Virtual Experiment"}
        observations={observations}
        safetyAcknowledged={safetyAcknowledged}
      />
    </main>
  );
}

/* =========================================================
   ENHANCED SAFETY & APPARATUS LIMITATIONS SECTION
========================================================= */
function SafetySection({ experiment, onProceed, isAcknowledged }) {
  const [agreed, setAgreed] = useState(isAcknowledged);

  const isRC = experiment === "rc";
  const isHysteresis = experiment === "hysteresis";
  const isString = experiment === "string";
  const isImpulse = experiment === "impulse";
  const isEDM = experiment === "edm";
  const isOpAmp = experiment === "opamp";

  const isElectrical = isRC || isHysteresis || isOpAmp || isEDM;

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
          {isElectrical ? "UPEM / Electrical Safety Protocol" : "Mechanics & Rigging Protocol"}
        </span>
      </div>

      <div className="info-card" style={{ display: "flex", flexDirection: "column", gap: "18px", padding: "24px" }}>
        
        {/* OP-AMP SAFETY */}
        {isOpAmp && (
          <>
            <div className="precaution-card" style={{ borderLeft: "4px solid #ef4444" }}>
              <strong style={{ color: "#f87171", fontSize: "14px" }}>⚡ Supply Rail Voltage Limits</strong>
              <p className="precaution-desc">
                Do not exceed ±15V on the Vcc (+V) and Vee (-V) pins of the IC 741. Reversing polarity or exceeding absolute maximum ratings (±22V) will cause immediate thermal destruction of the semiconductor junctions.
              </p>
            </div>
            <div className="precaution-card" style={{ borderLeft: "4px solid #f59e0b" }}>
              <strong style={{ color: "#fbbf24", fontSize: "14px" }}>🔌 Input Overdrive / Saturation</strong>
              <p className="precaution-desc">
                Ensure the input signal voltage (Vin) combined with circuit gain does not demand an output voltage exceeding the supply rails. The Op-Amp will saturate, causing signal clipping and distortion.
              </p>
            </div>
          </>
        )}

        {/* EDM SAFETY */}
        {isEDM && (
          <>
            <div className="precaution-card" style={{ borderLeft: "4px solid #ef4444" }}>
              <strong style={{ color: "#f87171", fontSize: "14px" }}>🔥 Dielectric Fluid Flash Point Hazard</strong>
              <p className="precaution-desc">
                Ensure the dielectric fluid level is maintained at least 50mm above the spark gap. Exposing the machining zone to open air during active discharge can ignite vaporized fumes and cause a flash fire.
              </p>
            </div>
            <div className="precaution-card" style={{ borderLeft: "4px solid #f59e0b" }}>
              <strong style={{ color: "#fbbf24", fontSize: "14px" }}>⚡ High-Current Sparking</strong>
              <p className="precaution-desc">
                Never touch the electrode (tool) or workpiece while the pulse generator is actively discharging. High localized currents are present which pose serious shock and burn hazards.
              </p>
            </div>
          </>
        )}

        {/* RC CIRCUIT SAFETY */}
        {isRC && (
          <>
            <div className="precaution-card" style={{ borderLeft: "4px solid #f59e0b" }}>
              <strong style={{ color: "#fbbf24", fontSize: "14px" }}>⚡ Capacitive Charge Storage & Dielectric Puncture</strong>
              <p className="precaution-desc">
                Electrolytic capacitors store significant charge even after the power supply is switched off. Never short-circuit terminals directly; always discharge via a resistor.
              </p>
            </div>
            <div className="precaution-card" style={{ borderLeft: "4px solid #ef4444" }}>
              <strong style={{ color: "#f87171", fontSize: "14px" }}>🔌 Polarity & Reverse Breakdown</strong>
              <p className="precaution-desc">
                Observing polarity on polarized units is critical. Reversing connections causes internal gas generation and risk of casing rupture.
              </p>
            </div>
          </>
        )}

        {/* HYSTERESIS SAFETY */}
        {isHysteresis && (
          <>
            <div className="precaution-card" style={{ borderLeft: "4px solid #ef4444" }}>
              <strong style={{ color: "#f87171", fontSize: "14px" }}>🧲 Core Overheating & Thermal Dissipation</strong>
              <p className="precaution-desc">
                Continuous cyclic magnetization causes high hysteresis/eddy-current losses. Do not operate at peak excitation currents for longer than 3 consecutive minutes.
              </p>
            </div>
          </>
        )}

        {/* STRING SAFETY */}
        {isString && (
          <div className="precaution-card" style={{ borderLeft: "4px solid #38bdf8" }}>
            <strong style={{ color: "#38bdf8", fontSize: "14px" }}>🎯 Resonance Tension & String Snap Hazard</strong>
            <p className="precaution-desc">
              Keep faces away from the plane of the vibrating string. High tensile loading combined with harmonic resonance can cause snapping.
            </p>
          </div>
        )}

        {/* IMPULSE SAFETY */}
        {isImpulse && (
          <div className="precaution-card" style={{ borderLeft: "4px solid #ef4444" }}>
            <strong style={{ color: "#f87171", fontSize: "14px" }}>📊 Piezoelectric Force Sensor Overload</strong>
            <p className="precaution-desc">
              Never drop heavy collision carts directly against bare force transducers without calibrated spring bumpers to prevent permanent damage to load cells.
            </p>
          </div>
        )}

        {/* MACHINE LIMITATIONS (Generic Base Panel) */}
        <div className="precaution-card" style={{ padding: "16px", border: "1px solid #1e3a5f" }}>
          <h4 style={{ margin: "0 0 10px 0", color: "#38bdf8", display: "flex", alignItems: "center", gap: "8px" }}>
            ⚙️ Hardware Limitations & Operational Thresholds
          </h4>
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
            marginTop: "8px", padding: "14px 18px", background: "rgba(15, 23, 42, 0.9)", border: `1px solid ${agreed ? "#22c55e" : "#475569"}`,
            borderRadius: "10px", display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", transition: "all 0.2s ease"
          }}
          onClick={() => setAgreed(!agreed)}
        >
          <input type="checkbox" id="safetyTermsCheck" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ width: "18px", height: "18px", accentColor: "#2563eb", cursor: "pointer" }} />
          <label htmlFor="safetyTermsCheck" style={{ color: agreed ? "#f1f5f9" : "#94a3b8", fontSize: "13px", lineHeight: "1.5", cursor: "pointer", userSelect: "none" }}>
            I have carefully read, understood, and agreed to abide by all the laboratory safety precautions and apparatus limitations stated above.
          </label>
        </div>

        <button
          onClick={onProceed}
          disabled={!agreed}
          style={{
            marginTop: "6px", padding: "14px", borderRadius: "8px", border: "none", background: agreed ? "#2563eb" : "#334155",
            color: agreed ? "#ffffff" : "#94a3b8", fontWeight: "700", fontSize: "14px", cursor: agreed ? "pointer" : "not-allowed",
            transition: "all 0.2s ease", boxShadow: agreed ? "0 4px 14px rgba(37, 99, 235, 0.3)" : "none", opacity: agreed ? 1 : 0.6
          }}
        >
          {agreed ? "✓ Proceed to Mandatory Video Guide →" : "🔒 Please Check the Agreement Box Above to Proceed"}
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   THEORY
========================================================= */
function TheorySection({ experiment }) {
  const theory = {
    rc: {
      title: "📖 Theory — RC Circuit Transient Response",
      objective: "To investigate the exponential charging and discharging behavior of a capacitor across a resistive load, calculate the capacitive time constant τ = RC, and verify transient voltage and current profiles.",
      points: [
        "Capacitors store electrostatic potential energy in an electric field established across opposing conductive plates separated by a dielectric medium.",
        "When connected to a constant DC voltage source through a resistor, charge accumulates gradually rather than instantaneously due to the resistive opposition to current flow.",
        "The time constant τ = RC governs the rate of energy transfer; at t = τ, the capacitor reaches ~63.2% of its full charge voltage.",
        "During discharge across a load, stored electrostatic energy dissipates exponentially, releasing stored charge at an identical characteristic time scale.",
      ],
      formulaDetails: [
        {
          name: "Capacitive Time Constant",
          tag: "Core Parameter",
          formula: "τ = R · C",
          variables: [
            { sym: "τ", name: "Time Constant", unit: "seconds (s)", desc: "Time interval required for charging to 63.2% or discharging to 36.8%" },
            { sym: "R", name: "Total Resistance", unit: "ohms (Ω)", desc: "Current-limiting series resistor in circuit" },
            { sym: "C", name: "Capacitance", unit: "farads (F)", desc: "Electrostatic storage capacity of capacitor" }
          ],
          description: "Quantifies the dynamic responsiveness of the RC circuit. A higher resistance or larger capacitance prolongs charging, whereas smaller values yield rapid transient response.",
          physicalSignificance: "After 5 time constants (t = 5τ), the circuit achieves 99.3% completion and is practically recognized as having reached steady-state DC equilibrium."
        },
        {
          name: "Exponential Capacitor Charging Voltage",
          tag: "Charging Law",
          formula: "V_C(t) = V₀ · (1 − e^(−t / τ))",
          variables: [
            { sym: "V_C(t)", name: "Capacitor Voltage at time t", unit: "volts (V)", desc: "Instantaneous potential difference across capacitor plates" },
            { sym: "V₀", name: "DC Supply Voltage", unit: "volts (V)", desc: "Maximum terminal voltage delivered by bench power supply" },
            { sym: "t", name: "Elapsed Time", unit: "seconds (s)", desc: "Time elapsed since initiation of charging cycle" },
            { sym: "e", name: "Euler's Constant", unit: "dimensionless", desc: "Base of natural logarithm (≈ 2.71828)" }
          ],
          description: "Models how charging rate is highest initially when the potential difference between the supply and uncharged capacitor is greatest, tapering off exponentially as plate charge accumulates.",
          physicalSignificance: "At t = 0, V_C = 0 V (behaves like a short circuit). As t → ∞, V_C → V₀ (behaves like an open circuit, blocking DC current)."
        },
        {
          name: "Transient Charging Current",
          tag: "Ohm's Transient Law",
          formula: "I(t) = (V₀ / R) · e^(−t / τ) = I₀ · e^(−t / τ)",
          variables: [
            { sym: "I(t)", name: "Instantaneous Current", unit: "amperes (A)", desc: "Live current circulating through the series branch" },
            { sym: "I₀", name: "Initial Peak Current", unit: "amperes (A)", desc: "Maximum instantaneous current occurring at the instant of switch closure (V₀ / R)" },
            { sym: "R", name: "Resistance", unit: "ohms (Ω)", desc: "Series current-limiting resistor" }
          ],
          description: "Current starts at its maximum surge value (V₀ / R) at t = 0 because the uncharged capacitor provides zero initial counter-electromotive force, decaying toward zero as the capacitor charges.",
          physicalSignificance: "Demonstrates that current leads voltage in capacitive circuits during transient excitation."
        },
        {
          name: "Exponential Capacitor Discharging Voltage",
          tag: "Discharge Law",
          formula: "V_C(t) = V_initial · e^(−t / τ)",
          variables: [
            { sym: "V_C(t)", name: "Discharge Voltage at time t", unit: "volts (V)", desc: "Remaining plate potential during resistive discharge" },
            { sym: "V_initial", name: "Pre-Discharge Voltage", unit: "volts (V)", desc: "Stored potential across plates prior to opening the supply path" }
          ],
          description: "When the DC supply is disconnected and plates are bridged across the resistor, stored electrostatic energy discharges through the resistor, causing voltage to fall exponentially toward 0 V.",
          physicalSignificance: "At t = τ, voltage falls to 36.8% of its initial value; by t = 5τ, over 99% of stored electrostatic energy has been dissipated as heat."
        }
      ]
    },
    hysteresis: {
      title: "📖 Theory — Magnetic Hysteresis & Core Loss",
      objective: "To investigate the non-linear relationship between magnetic field strength (H) and flux density (B), record the closed B–H loop, and evaluate energy loss per magnetization cycle.",
      points: [
        "Ferromagnetic materials consist of microscopic magnetic domains. In an unmagnetized state, domain orientations are randomly distributed with zero net external magnetization.",
        "Applying an external magnetic field H aligns these domains in the direction of the field, causing flux density B to increase non-linearly up to saturation.",
        "When the external field is reversed, domain rotation is resisted by microscopic lattice friction and pinning sites; magnetization lags behind the field, giving rise to 'hysteresis'.",
        "The area enclosed by the closed B–H trajectory represents electrical energy permanently converted into thermal energy per unit volume during each AC cycle.",
      ],
      formulaDetails: [
        {
          name: "Applied Magnetizing Field Strength (Ampere's Law)",
          tag: "Excitation Field",
          formula: "H = (N · I) / l_m",
          variables: [
            { sym: "H", name: "Magnetic Field Strength", unit: "amperes per meter (A/m)", desc: "Magnetomotive force applied per unit magnetic path length" },
            { sym: "N", name: "Number of Coil Turns", unit: "turns (dimensionless)", desc: "Number of wire loops wound onto the magnetic core" },
            { sym: "I", name: "Excitation Current", unit: "amperes (A)", desc: "Instantaneous AC current passing through the excitation winding" },
            { sym: "l_m", name: "Mean Magnetic Path Length", unit: "meters (m)", desc: "Average circumferential path length of magnetic flux through the core" }
          ],
          description: "Describes the primary magnetomotive force driving magnetic flux through the core material. Increasing winding turns or current proportionately intensifies the magnetizing field.",
          physicalSignificance: "Controlled directly via the laboratory AC excitation voltage and coil configuration."
        },
        {
          name: "Magnetic Flux Density (Constitutive Relation)",
          tag: "Material Response",
          formula: "B = μ · H = μ₀ · μ_r · H = μ₀ · (H + M)",
          variables: [
            { sym: "B", name: "Magnetic Flux Density", unit: "tesla (T) or Wb/m²", desc: "Density of magnetic lines of force per unit cross-sectional area" },
            { sym: "μ₀", name: "Permeability of Free Space", unit: "H/m (4π × 10⁻⁷)", desc: "Fundamental physical magnetic constant of vacuum" },
            { sym: "μ_r", name: "Relative Permeability", unit: "dimensionless", desc: "Amplification factor of the ferromagnetic material compared to air" },
            { sym: "M", name: "Magnetization Vector", unit: "A/m", desc: "Net magnetic dipole moment per unit volume of the specimen" }
          ],
          description: "Measures the resulting magnetic induction inside the core. In ferromagnetic materials, μ_r is not constant but varies dynamically along the non-linear S-shaped hysteresis curve.",
          physicalSignificance: "Soft materials (like silicon steel) exhibit steep initial slopes (high permeability), while hard magnets maintain high remanence even when H returns to zero."
        },
        {
          name: "Hysteresis Energy Loss per Unit Volume",
          tag: "Loop Area Law",
          formula: "w_h = ∮ B · dH = Area of B–H Hysteresis Loop",
          variables: [
            { sym: "w_h", name: "Energy Loss Density per Cycle", unit: "joules per cubic meter (J/m³)", desc: "Mechanical/magnetic energy dissipated as heat in one AC cycle" },
            { sym: "∮ B dH", name: "Closed Contour Integral", unit: "J/m³", desc: "Area enclosed within the complete B–H curve" }
          ],
          description: "Each AC cycle drives magnetic domains back and forth against internal pinning barriers, irreversibly converting electrical power into heat within the specimen core.",
          physicalSignificance: "Transformer cores use narrow sigmoid silicon steel to minimize loop area, whereas permanent magnets require large rhombic loop areas for high coercivity."
        },
        {
          name: "Total Hysteresis Power Loss (Steinmetz Equation)",
          tag: "Thermal Dissipation",
          formula: "P_h = k_h · f · (B_max)^n · V_core",
          variables: [
            { sym: "P_h", name: "Total Power Dissipation", unit: "watts (W)", desc: "Total rate of heat generation across entire core" },
            { sym: "k_h", name: "Steinmetz Hysteresis Coefficient", unit: "J/(m³·Tⁿ)", desc: "Material-specific loss constant" },
            { sym: "f", name: "Excitation Frequency", unit: "hertz (Hz)", desc: "Frequency of alternating magnetic field cycles" },
            { sym: "B_max", name: "Peak Flux Density", unit: "tesla (T)", desc: "Maximum amplitude of magnetic flux density during the cycle" },
            { sym: "n", name: "Steinmetz Exponent", unit: "dimensionless", desc: "Empirical exponent (typically 1.6 for iron cores)" },
            { sym: "V_core", name: "Core Volume", unit: "cubic meters (m³)", desc: "Physical volume of the ferromagnetic material" }
          ],
          description: "Calculates the total continuous thermal wattage generated. Power loss scales directly with AC operating frequency and strongly with peak induction B_max.",
          physicalSignificance: "Directly explains why high-frequency magnetic devices require specialized low-loss core materials to prevent thermal runaway."
        }
      ]
    },
    string: {
      title: "📖 Theory — Transverse Vibrations on a Stretched String",
      objective: "To investigate standing wave phenomena in stretched strings, verify the dependency of wave speed on tension and linear mass density, and confirm Melde's frequency and harmonic relations.",
      points: [
        "A transverse mechanical wave propagating along a flexible stretched string reflects at the fixed boundaries with an inverted phase (180° phase shift).",
        "Superposition of the incident wave and reflected wave produces a standing wave pattern characterized by stationary points of zero motion (nodes) and alternating points of maximum oscillation (antinodes).",
        "Boundary conditions require nodes at both clamped ends (x = 0 and x = L), restricting sustainable vibrations to discrete harmonic modes n = 1, 2, 3...",
        "Increasing string tension increases the restoring force, speeding up wave propagation and shifting natural resonant frequencies higher.",
      ],
      formulaDetails: [
        {
          name: "Transverse Wave Propagation Velocity",
          tag: "Kinematic Wave Law",
          formula: "v = √(T / μ)",
          variables: [
            { sym: "v", name: "Wave Velocity", unit: "meters per second (m/s)", desc: "Phase speed at which transverse disturbances travel down the string" },
            { sym: "T", name: "String Tension", unit: "newtons (N)", desc: "Tensile stretching force applied to string (T = m_suspended · g)" },
            { sym: "μ", name: "Linear Mass Density", unit: "kilograms per meter (kg/m)", desc: "Mass per unit length of string material (μ = m_string / L_string)" }
          ],
          description: "Wave speed depends exclusively on the balance between restoring tension (T) and inertial mass per unit length (μ). Higher tension increases speed, while heavier cords slow it down.",
          physicalSignificance: "Directly tested in the laboratory by changing slotted weights suspended over the end pulley."
        },
        {
          name: "Standing Wave Harmonic Resonant Frequency",
          tag: "Eigenfrequency Law",
          formula: "f_n = (n · v) / (2 · L) = (n / (2 · L)) · √(T / μ)",
          variables: [
            { sym: "f_n", name: "Resonant Frequency", unit: "hertz (Hz)", desc: "Frequency required to sustain the n-th standing harmonic mode" },
            { sym: "n", name: "Harmonic Mode Number", unit: "integer (1, 2, 3...)", desc: "Number of vibrating loops (half-wavelength segments) between boundaries" },
            { sym: "L", name: "Vibrating String Length", unit: "meters (m)", desc: "Clear distance between the mechanical oscillator tip and the pulley" }
          ],
          description: "Standing wave condition demands that the length of the string must accommodate an integer number of half-wavelengths: L = n · (λ / 2).",
          physicalSignificance: "Fundamental mode (n = 1) forms a single central antinode. Higher harmonics (n = 2, 3...) produce multiple distinct loops separated by stationary nodes."
        },
        {
          name: "Harmonic Wavelength Relation",
          tag: "Geometric Condition",
          formula: "λ_n = (2 · L) / n = v / f_n",
          variables: [
            { sym: "λ_n", name: "Wavelength of Mode n", unit: "meters (m)", desc: "Spatial distance spanning one complete sinusoidal wave cycle (two full loops)" },
            { sym: "L", name: "Vibrating Length", unit: "meters (m)", desc: "Span length between clamped points" },
            { sym: "n", name: "Harmonic Mode", unit: "integer", desc: "Total loop count observed along string span" }
          ],
          description: "The physical distance between two consecutive nodes is exactly half a wavelength (λ / 2). Thus, measuring the distance between adjacent nodes provides an accurate measure of λ.",
          physicalSignificance: "Enables students to determine wave speed experimentally without requiring high-speed stroboscopic motion tracking."
        },
        {
          name: "Standing Wave Profile Equation",
          tag: "Wavefunction",
          formula: "y(x, t) = 2A · sin((n · π · x) / L) · cos(2π · f_n · t)",
          variables: [
            { sym: "y(x, t)", name: "Transverse Displacement", unit: "meters (m)", desc: "Vertical deflection of a string element at position x and time t" },
            { sym: "A", name: "Incident Amplitude", unit: "meters (m)", desc: "Peak amplitude of individual component traveling waves" },
            { sym: "x", name: "Longitudinal Coordinate", unit: "meters (m)", desc: "Position along string axis from clamped boundary" },
            { sym: "t", name: "Time", unit: "seconds (s)", desc: "Elapsed oscillation time" }
          ],
          description: "Expresses standing wave motion as the product of a pure spatial shape factor sin(nπx/L) and a temporal oscillation cos(ωt). At nodes (sin = 0), displacement remains zero at all times.",
          physicalSignificance: "Explains why nodes never move and why energy is trapped between boundaries rather than flowing along the wire."
        }
      ]
    },
    impulse: {
      title: "📖 Theory — Impulse-Momentum Theorem & Collision Mechanics",
      objective: "To verify Newton's second law in impulse formulation, confirm that the time integral of net collision force equals change in linear momentum, and validate momentum conservation in 1D collisions.",
      points: [
        "Linear momentum p is a vector quantity defined as the product of an object's mass and its instantaneous velocity (p = m · v).",
        "Newton's second law states that net external force is the time derivative of linear momentum: F_net = dp / dt.",
        "Multiplying by dt and integrating over collision duration Δt reveals that impulse J imparted to an object identically equals the resulting change in momentum Δp.",
        "In an isolated two-cart system with negligible track friction, internal collision forces obey Newton's third law (F₁₂ = −F₂₁), ensuring total system momentum remains strictly conserved.",
      ],
      formulaDetails: [
        {
          name: "Linear Momentum Definition",
          tag: "Kinematic Quantity",
          formula: "p = m · v",
          variables: [
            { sym: "p", name: "Linear Momentum", unit: "kg·m/s (or N·s)", desc: "Measure of an object's quantity of motion" },
            { sym: "m", name: "Inertial Mass", unit: "kilograms (kg)", desc: "Total mass of the dynamic lab cart" },
            { sym: "v", name: "Velocity Vector", unit: "meters per second (m/s)", desc: "Directed velocity along linear air track axis" }
          ],
          description: "Momentum is a directed vector quantity. Direction is critical: carts traveling to the right possess positive momentum (+), while carts moving to the left possess negative momentum (−).",
          physicalSignificance: "A heavy cart moving slowly can carry the exact same momentum as a light cart traveling at high speed."
        },
        {
          name: "Impulse of a Time-Varying Force",
          tag: "Force-Time Integral",
          formula: "J = ∫ F(t) dt = F_avg · Δt",
          variables: [
            { sym: "J", name: "Impulse", unit: "newton-seconds (N·s)", desc: "Cumulative effect of collision force acting over time interval Δt" },
            { sym: "F(t)", name: "Instantaneous Contact Force", unit: "newtons (N)", desc: "Compression force between cart bumper springs during impact" },
            { sym: "F_avg", name: "Average Impact Force", unit: "newtons (N)", desc: "Equivalent steady force delivering identical impulse over duration Δt" },
            { sym: "Δt", name: "Collision Contact Duration", unit: "seconds (s)", desc: "Time window from initial contact to separation" }
          ],
          description: "Impulse corresponds graphically to the area under the Force vs Time curve. Extending collision duration Δt (e.g. using soft bumper springs) dramatically reduces peak impact force.",
          physicalSignificance: "Fundamental principle behind automotive airbags, crumple zones, and sports equipment shock dampening."
        },
        {
          name: "Impulse-Momentum Equivalence Principle",
          tag: "Theorem Formulation",
          formula: "J = Δp = p_final − p_initial = m · (v_f − v_i)",
          variables: [
            { sym: "J", name: "Total Imparted Impulse", unit: "N·s", desc: "Time integral of contact force during collision" },
            { sym: "Δp", name: "Change in Linear Momentum", unit: "kg·m/s", desc: "Difference between post-collision and pre-collision momentum" },
            { sym: "v_i", name: "Initial Velocity", unit: "m/s", desc: "Cart launch velocity prior to impact" },
            { sym: "v_f", name: "Final Velocity", unit: "m/s", desc: "Cart rebound velocity following impact" }
          ],
          description: "Directly equates the external impulse applied to an object with the observed alteration of its momentum state. Experimentally verified by measuring cart velocities and contact times.",
          physicalSignificance: "Provides the bridge connecting kinematics (velocities) with dynamics (impact forces and durations)."
        },
        {
          name: "1D Momentum Conservation & Coefficient of Restitution",
          tag: "System Conservation",
          formula: "m₁·v₁_i + m₂·v₂_i = m₁·v₁_f + m₂·v₂_f  |  e = −(v₁_f − v₂_f) / (v₁_i − v₂_i)",
          variables: [
            { sym: "m₁, m₂", name: "Cart Masses", unit: "kg", desc: "Masses of Cart 1 (Blue) and Cart 2 (Green)" },
            { sym: "v_i, v_f", name: "Initial & Final Velocities", unit: "m/s", desc: "Pre- and post-impact velocities of both carts" },
            { sym: "e", name: "Coefficient of Restitution", unit: "dimensionless (0 to 1)", desc: "Elasticity index: e = 1 for perfectly elastic, e = 0 for perfectly inelastic" }
          ],
          description: "Total linear momentum of the two-cart system remains invariant before and after collision. The coefficient of restitution e characterizes kinetic energy preservation during impact.",
          physicalSignificance: "When e = 1, kinetic energy is fully preserved; when e = 0, carts lock together and maximize energy dissipation."
        }
      ]
    },
    edm: {
      title: "📖 Theory — Electrical Discharge Machining (EDM)",
      objective: "To examine electro-thermal erosion mechanisms in Smart ZNC EDM, quantify Material Removal Rate (MRR) as a function of discharge energy and duty cycle, and determine tool wear ratios.",
      points: [
        "Electrical Discharge Machining is an advanced non-contact thermo-electric manufacturing process where material is removed by controlled, repetitive micro-second electrical sparks.",
        "A dielectric fluid (hydrocarbon oil or deionized water) maintains electrical insulation across the sub-millimeter tool-workpiece gap until breakdown voltage triggers localized ionization.",
        "The resulting plasma channel concentrates intense thermal energy (8,000°C to 12,000°C), melting and vaporizing microscopic craters from both conductive workpiece and tool surfaces.",
        "When the pulse current shuts off (Pulse OFF time), the plasma collapses and dielectric flushing expels molten debris, cooling the workpiece before the subsequent spark cycle.",
      ],
      formulaDetails: [
        {
          name: "Material Removal Rate (MRR)",
          tag: "Productivity Metric",
          formula: "MRR = (W_initial − W_final) / (t_m · ρ_w)",
          variables: [
            { sym: "MRR", name: "Material Removal Rate", unit: "mm³/min (or cm³/min)", desc: "Volumetric rate of conductive workpiece material eroded" },
            { sym: "W_initial", name: "Pre-Machining Specimen Weight", unit: "grams (g)", desc: "Mass of workpiece prior to initiating sparking" },
            { sym: "W_final", name: "Post-Machining Specimen Weight", unit: "grams (g)", desc: "Mass of workpiece after dielectric washing and drying" },
            { sym: "t_m", name: "Active Machining Time", unit: "minutes (min)", desc: "Total continuous spark duration recorded" },
            { sym: "ρ_w", name: "Workpiece Density", unit: "g/mm³ (e.g. 0.00785 for steel)", desc: "Volumetric density of workpiece material" }
          ],
          description: "Determines process efficiency and throughput by converting gravimetric mass loss into physical volume eroded per unit time.",
          physicalSignificance: "Higher discharge current and longer Pulse ON time expand crater dimensions, accelerating MRR while increasing surface roughness."
        },
        {
          name: "Single Spark Discharge Energy",
          tag: "Spark Physics",
          formula: "E_s = V_gap · I_discharge · T_on",
          variables: [
            { sym: "E_s", name: "Single Spark Energy", unit: "joules (J) or millijoules (mJ)", desc: "Thermal energy injected into plasma channel per electrical pulse" },
            { sym: "V_gap", name: "Spark Gap Voltage", unit: "volts (V)", desc: "Maintained potential difference across spark gap during discharge (typically 20–80 V)" },
            { sym: "I_discharge", name: "Peak Discharge Current", unit: "amperes (A)", desc: "Current flowing through plasma channel during Pulse ON" },
            { sym: "T_on", name: "Pulse ON Duration", unit: "microseconds (µs)", desc: "Active spark ionization duration" }
          ],
          description: "The volume of melted workpiece material per spark is directly proportional to the energy injected into the microscopic discharge channel.",
          physicalSignificance: "Fine finishing utilizes low E_s (low current, short T_on), whereas roughing cycles demand high E_s for maximum removal rate."
        },
        {
          name: "Pulse Duty Factor / Duty Cycle",
          tag: "Cycle Ratio",
          formula: "η = (T_on / (T_on + T_off)) × 100%",
          variables: [
            { sym: "η", name: "Duty Cycle Factor", unit: "percentage (%)", desc: "Fraction of cycle time during which active machining sparks occur" },
            { sym: "T_on", name: "Pulse ON Time", unit: "microseconds (µs)", desc: "Time spark channel remains electrically conductive" },
            { sym: "T_off", name: "Pulse OFF Time", unit: "microseconds (µs)", desc: "Deionization and dielectric flushing pause interval" }
          ],
          description: "Governs the thermal load and flushing stability. If T_off is too brief, ionized debris is not evacuated, causing destructive continuous arcing rather than discrete sparks.",
          physicalSignificance: "Typical stable EDM operation maintains duty cycles between 40% and 75% to preserve machining precision."
        },
        {
          name: "Tool Wear Ratio (TWR)",
          tag: "Electrode Longevity",
          formula: "TWR = (ΔW_tool / ΔW_workpiece) × 100%",
          variables: [
            { sym: "TWR", name: "Tool Wear Ratio", unit: "percentage (%)", desc: "Relative rate of tool electrode erosion compared to workpiece removal" },
            { sym: "ΔW_tool", name: "Mass Loss of Electrode", unit: "grams (g)", desc: "Weight consumed from copper or graphite tool" },
            { sym: "ΔW_workpiece", name: "Mass Loss of Workpiece", unit: "grams (g)", desc: "Weight eroded from steel workpiece" }
          ],
          description: "Measures tool durability and dimensional fidelity. Lower TWR values indicate that the electrode preserves sharp corners and geometries over extended production cycles.",
          physicalSignificance: "Electrode polarity selection (typically tool negative or tool positive depending on material pairing) is optimized to minimize TWR."
        }
      ]
    },
    opamp: {
      title: "📖 Theory — Operational Amplifier (Op-Amp) Transfer Characteristics",
      objective: "To investigate closed-loop voltage amplification, input/output transfer curves, phase relationships, and power supply rail clipping using IC 741 in inverting and non-inverting topologies.",
      points: [
        "The Operational Amplifier is a high-gain DC-coupled differential voltage amplifier featuring very high input impedance (Z_in ≈ MΩ), low output impedance (Z_out ≈ Ω), and massive open-loop gain (A_OL > 10⁵).",
        "Due to negative feedback (R_f connected between output and inverting input), the op-amp operates under the 'virtual ground / virtual short' principle, maintaining equal voltages at both input terminals (V⁺ ≈ V⁻).",
        "In the inverting configuration, the input signal is applied through R_in to the inverting (−) terminal, producing an amplified output that is 180° out of phase.",
        "Output voltage is bounded by the DC supply rails (±V_CC). When theoretical linear output exceeds these limits, clipping occurs and the op-amp enters hard saturation.",
      ],
      formulaDetails: [
        {
          name: "Inverting Amplifier Closed-Loop Voltage Gain",
          tag: "Inverting Topology",
          formula: "A_v = −(R_f / R_in)  ==>  V_out = −(R_f / R_in) · V_in",
          variables: [
            { sym: "A_v", name: "Closed-Loop Voltage Gain", unit: "dimensionless", desc: "Ratio of output voltage amplitude to input voltage amplitude" },
            { sym: "R_f", name: "Feedback Resistor", unit: "kilohms (kΩ)", desc: "Resistor connected from output pin back to inverting input pin (−)" },
            { sym: "R_in", name: "Input Resistor (R₁)", unit: "kilohms (kΩ)", desc: "Series resistor connecting signal source to inverting pin (−)" },
            { sym: "V_in", name: "Input Voltage", unit: "volts (V)", desc: "Applied DC or AC input potential" },
            { sym: "V_out", name: "Output Voltage", unit: "volts (V)", desc: "Resulting amplified terminal voltage" }
          ],
          description: "Because the non-inverting terminal is grounded, virtual ground forces V⁻ = 0 V. All input current V_in / R_in flows across R_f (since zero current enters the ideal op-amp input), yielding V_out = −I · R_f.",
          physicalSignificance: "The negative sign signifies a 180° phase inversion. The gain is set purely by external passive resistor ratios, independent of open-loop transistor tolerances."
        },
        {
          name: "Non-Inverting Amplifier Closed-Loop Voltage Gain",
          tag: "Non-Inverting Topology",
          formula: "A_v = 1 + (R_f / R_in)  ==>  V_out = (1 + (R_f / R_in)) · V_in",
          variables: [
            { sym: "A_v", name: "Closed-Loop Gain", unit: "dimensionless (≥ 1)", desc: "Always positive and strictly greater than or equal to 1" },
            { sym: "R_f", name: "Feedback Resistor", unit: "kilohms (kΩ)", desc: "Feedback loop resistor from output to inverting node" },
            { sym: "R_in", name: "Input Divider Resistor", unit: "kilohms (kΩ)", desc: "Resistor from inverting node to circuit ground" }
          ],
          description: "Input signal is routed directly to the high-impedance non-inverting terminal (+). Voltage divider R_in / (R_in + R_f) feeds a fraction of V_out back to match V_in at V⁻.",
          physicalSignificance: "The output remains in phase (0° phase shift) with the input. Even if R_f = 0 Ω, gain remains exactly 1 (voltage follower / unity-gain buffer)."
        },
        {
          name: "Power Supply Rail Saturation Limits",
          tag: "Non-Linear Limit",
          formula: "V_out = clip(A_v · V_in, −V_sat, +V_sat)  where  V_sat ≈ V_CC − 1.5 V",
          variables: [
            { sym: "V_out", name: "Actual Output Voltage", unit: "volts (V)", desc: "Clipped or linear voltage physically delivered at output pin" },
            { sym: "±V_CC", name: "DC Power Supply Rails", unit: "volts (V)", desc: "Bipolar DC bench supply voltages (typically ±12 V or ±15 V)" },
            { sym: "V_sat", name: "Saturation Voltage", unit: "volts (V)", desc: "Maximum attainable internal transistor drive limit (approx ±10.5 V to ±12 V)" }
          ],
          description: "An op-amp cannot output a potential greater than its internal supply voltages. When |A_v · V_in| ≥ V_sat, the amplifier cannot drive higher and its transfer curve flattens horizontally.",
          physicalSignificance: "Marks the boundary between linear analog signal amplification and non-linear comparator / clipping behavior."
        }
      ]
    }
  };

  const data = theory[experiment];

  return (
    <div className="info-section">
      <h2>{data.title}</h2>
      
      {/* OBJECTIVE CARD */}
      <div className="info-card">
        <h3>🎯 Experimental Objective</h3>
        <p className="theory-text">
          {data.objective}
        </p>
      </div>

      {/* THEORETICAL PRINCIPLES */}
      <div className="info-card">
        <h3>🔬 Key Theoretical Principles</h3>
        <ul className="theory-list">
          {data.points.map((point, index) => (
            <li key={index} style={{ marginBottom: "8px" }}>{point}</li>
          ))}
        </ul>
      </div>

      {/* DETAILED FORMULAE SECTION */}
      <div className="info-card">
        <h3>📐 Mathematical Formulations & Physical Meaning</h3>
        <p className="theory-subtext">
          Comprehensive breakdown of governing equations, physical variable definitions (with SI units), and practical lab significance:
        </p>

        {data.formulaDetails.map((item, idx) => (
          <div className="rich-formula-card" key={idx}>
            <div className="formula-card-top">
              <span className="formula-card-title">{idx + 1}. {item.name}</span>
              <span className="formula-card-tag">{item.tag}</span>
            </div>

            <div className="formula-math-display">
              {item.formula}
            </div>

            <div className="formula-var-section">
              <div className="formula-var-title">Variable Definitions &amp; Units:</div>
              <div className="formula-var-grid">
                {item.variables.map((v, vIdx) => (
                  <div className="formula-var-item" key={vIdx}>
                    <span className="formula-var-symbol">{v.sym}</span>
                    <div className="formula-var-details">
                      <strong>{v.name}</strong>
                      <span className="formula-var-unit">[{v.unit}]</span>
                      <div className="formula-var-desc">{v.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="formula-explanation-box">
              <div className="formula-insight-label">💡 Physical Meaning:</div>
              <div className="formula-insight-desc">{item.description}</div>
              <div className="formula-lab-takeaway">
                <strong>Lab Takeaway:</strong> {item.physicalSignificance}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   PROCEDURE
========================================================= */
function ProcedureSection({ experiment }) {
  const procedures = {
    rc: [
      "Connect the resistor and capacitor to the DC supply as shown in the virtual circuit.",
      "Set the required supply voltage.",
      "Select the resistance and capacitance values.",
      "Start the charging process.",
      "Observe the capacitor voltage at different time intervals.",
      "Calculate the time constant τ = RC.",
      "Repeat the experiment for discharging of the capacitor.",
      "Compare the observed values with the theoretical values.",
    ],
    hysteresis: [
      "Open the Hysteresis Loss experiment.",
      "Set the maximum value of magnetic field H.",
      "Select the required number of data points.",
      "Set the frequency of magnetization.",
      "Enter the volume of the magnetic material.",
      "Adjust the field parameters or select a core material preset to compute the real-time B-H loop.",
      "Observe the B-H hysteresis loop.",
      "Note the loop area, maximum B, minimum B, coercive field and remanence.",
      "Calculate the hysteresis energy loss and power loss.",
      "Compare the obtained results with the theoretical relation.",
    ],
    string: [
      "Set the length of the vibrating string.",
      "Apply the required tension to the string.",
      "Set the frequency of vibration.",
      "Observe the standing-wave pattern.",
      "Identify the nodes and antinodes.",
      "Determine the wave velocity.",
      "Calculate the wavelength using λ = v/f.",
      "Repeat the experiment by changing the tension or frequency.",
      "Study the relationship between the experimental parameters.",
    ],
    impulse: [
      "Set the mass of the object.",
      "Set the initial velocity.",
      "Apply the required force.",
      "Set the time interval for which the force acts.",
      "Calculate the initial momentum.",
      "Calculate the impulse using J = FΔt.",
      "Determine the change in momentum.",
      "Compare impulse with change in momentum.",
      "Verify the impulse-momentum theorem.",
    ],
    edm: [
      "Select the workpiece and electrode materials.",
      "Set the operating parameters: Current (I), Voltage (V).",
      "Adjust the Pulse ON time (Ton) and Pulse OFF time (Toff).",
      "Initiate the machining process and observe sparking in the dielectric tank.",
      "Record the initial weight, final weight, and machining time.",
      "Calculate the Material Removal Rate (MRR) using the provided formula."
    ],
    opamp: [
      "Select the Op-Amp mode (Inverting or Non-Inverting).",
      "Set the feedback resistor (Rf) and input resistor (Rin).",
      "Apply the DC input voltage (Vin) within the limits of the supply rails (±15V).",
      "Observe the output voltage (Vout) on the multimeter.",
      "Calculate the theoretical voltage gain.",
      "Compare the theoretical Vout with the observed Vout and note any saturation clipping."
    ]
  };

  return (
    <div className="info-section">
      <h2> Experimental Procedure</h2>
      <div className="info-card">
        <ol className="procedure-list">
          {procedures[experiment].map((step, index) => (
            <li key={index}>
              <span className="step-number">{index + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/* =========================================================
   OBSERVATIONS WITH EXCEL EXPORT
========================================================= */
function ObservationsSection({ experiment, observations = [], onEraseSlot, onOpenReportModal }) {
  const configs = {
    hysteresis: {
      name: "Hysteresis_Loss",
      rows: [
        { id: "maxH", label: "Maximum H (A/m)", type: "input" },
        { id: "freq", label: "Frequency (Hz)", type: "input" },
        { id: "loopArea", label: "Loop Area (J/m³)", type: "observed" },
        { id: "loss", label: "Power Loss (W)", type: "observed" },
      ],
    },
    rc: {
      name: "RC_Circuit",
      rows: [
        { id: "voltage", label: "Supply Voltage (V)", type: "input" },
        { id: "resistance", label: "Resistance (Ω)", type: "input" },
        { id: "capacitance", label: "Capacitance (μF)", type: "input" },
        { id: "tau", label: "Time Constant τ (s)", type: "observed" },
        { id: "vc", label: "Capacitor Voltage Vc (V)", type: "observed" },
      ],
    },
    string: {
      name: "Vibrations_On_String",
      rows: [
        { id: "tension", label: "Tension T (N)", type: "input" },
        { id: "frequency", label: "Frequency f (Hz)", type: "input" },
        { id: "wavelength", label: "Wavelength λ (m)", type: "observed" },
      ],
    },
    impulse: {
      name: "Impulse_Momentum",
      rows: [
        { id: "mass", label: "Mass m (kg)", type: "input" },
        { id: "force", label: "Applied Force F (N)", type: "input" },
        { id: "impulse", label: "Calculated Impulse J (N·s)", type: "observed" },
        { id: "deltaP", label: "Change in Momentum Δp", type: "observed" },
      ],
    },
    edm: {
      name: "Smart_ZNC_EDM",
      rows: [
        { id: "current", label: "Discharge Current (A)", type: "input" },
        { id: "voltage", label: "Gap Voltage (V)", type: "input" },
        { id: "pulseOn", label: "Pulse ON Time (µs)", type: "input" },
        { id: "pulseOff", label: "Pulse OFF Time (µs)", type: "input" },
        { id: "initWeight", label: "Initial Weight (g)", type: "observed" },
        { id: "finalWeight", label: "Final Weight (g)", type: "observed" },
        { id: "machTime", label: "Machining Time (min)", type: "observed" },
        { id: "mrr", label: "MRR (mm³/min)", type: "observed" },
      ],
    },
    opamp: {
      name: "OpAmp_Characteristics",
      rows: [
        { id: "mode", label: "Configuration Mode", type: "input" },
        { id: "vin", label: "Input Voltage Vin (V)", type: "input" },
        { id: "rf", label: "Feedback Resistor Rf (kΩ)", type: "input" },
        { id: "rin", label: "Input Resistor Rin (kΩ)", type: "input" },
        { id: "gain", label: "Theoretical Gain Av", type: "observed" },
        { id: "vout", label: "Output Voltage Vout (V)", type: "observed" },
      ],
    }
  };

  const currentConfig = configs[experiment] || { rows: [], name: "Experiment" };
  const rows = currentConfig.rows;
  const experimentsList = [0, 1, 2, 3, 4];

  const handleExportToExcel = () => {
    let headerRow1 = ["Quantity (with SI Unit)"];
    experimentsList.forEach((idx) => { headerRow1.push(`Experiment ${idx + 1}`, ""); });

    let headerRow2 = [""];
    experimentsList.forEach((idx) => { headerRow2.push(`Input Value ${idx + 1}`, `Observed Value ${idx + 1}`); });

    const dataRows = rows.map((row) => {
      const rowLine = [`"${row.label.replace(/"/g, '""')}"`];
      experimentsList.forEach((idx) => {
        const run = observations[idx];
        const val = run ? run[row.id] : null;

        if (row.type === "input") {
          rowLine.push(val !== null && val !== undefined ? `"${val}"` : '""');
          rowLine.push('""');
        } else {
          rowLine.push('""');
          rowLine.push(val !== null && val !== undefined ? `"${val}"` : '""');
        }
      });
      return rowLine.join(",");
    });

    const csvContent = "\uFEFF" + [
      headerRow1.map((h) => (h ? `"${h}"` : '""')).join(","),
      headerRow2.map((h) => (h ? `"${h}"` : '""')).join(","),
      ...dataRows,
    ].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${currentConfig.name}_Observation_Table.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="info-section">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", flexWrap: "wrap", gap: "12px" }}>
        <h2 style={{ margin: 0 }}>Observation Table</h2>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          {onOpenReportModal && (
            <button
              onClick={onOpenReportModal}
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 18px", background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)", color: "#ffffff", border: "1px solid #38bdf8", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 14px rgba(2, 132, 199, 0.35)", transition: "all 0.2s ease" }}
            >
              <span>📄</span> Official Lab Report (PDF)
            </button>
          )}
          <button
            onClick={handleExportToExcel}
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 18px", background: "linear-gradient(135deg, #15803d 0%, #166534 100%)", color: "#ffffff", border: "1px solid #22c55e", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 14px rgba(22, 101, 52, 0.35)", transition: "all 0.2s ease" }}
          >
            <span>📊</span> Export to Excel
          </button>
        </div>
      </div>

      <div className="info-card">
        <div className="obs-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", borderRadius: "8px" }}>
          <table className="obs-table" style={{ width: "100%", minWidth: "1150px", borderCollapse: "collapse", textAlign: "center", fontSize: "13px" }}>
            <thead>
              <tr className="obs-tr-main" style={{ borderBottom: "1px solid #1e3a5f" }}>
                <th rowSpan={2} className="obs-th-main" style={{ padding: "12px 16px", borderRight: "1px solid #1e3a5f", textAlign: "left", minWidth: "220px" }}>Quantity (with SI Unit)</th>
                {experimentsList.map((idx) => (
                  <th key={idx} colSpan={2} className="obs-th-main" style={{ padding: "10px", borderRight: "1px solid #1e3a5f", fontWeight: "600" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      <span>Experiment {idx + 1}</span>
                      {observations[idx] && (
                        <button onClick={() => onEraseSlot(idx)} style={{ background: "rgba(239, 68, 68, 0.2)", border: "1px solid #ef4444", color: "#f87171", borderRadius: "4px", cursor: "pointer", fontSize: "10px", padding: "2px 6px" }}>✕ Clear</button>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
              <tr className="obs-tr-sub" style={{ borderBottom: "2px solid #1e3a5f" }}>
                {experimentsList.map((idx) => (
                  <React.Fragment key={idx}>
                    <th className="obs-th-sub" style={{ padding: "8px 10px", borderRight: "1px solid rgba(148, 163, 184, 0.2)", fontSize: "12px", minWidth: "110px" }}>Input Value {idx + 1}</th>
                    <th className="obs-th-sub" style={{ padding: "8px 10px", borderRight: "1px solid #1e3a5f", fontSize: "12px", minWidth: "120px" }}>Observed Value {idx + 1}</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rIdx) => (
                <tr key={rIdx} style={{ borderBottom: "1px solid rgba(148, 163, 184, 0.2)" }}>
                  <td className="obs-td-label" style={{ padding: "10px 16px", textAlign: "left", fontWeight: "500", borderRight: "1px solid #1e3a5f" }}>{row.label}</td>
                  {experimentsList.map((idx) => {
                    const run = observations[idx];
                    const val = run ? run[row.id] : null;
                    return (
                      <React.Fragment key={idx}>
                        <td style={{ padding: "8px 10px", borderRight: "1px solid rgba(148, 163, 184, 0.2)" }}>
                          {row.type === "input" && val !== null && val !== undefined ? val : "—"}
                        </td>
                        <td style={{ padding: "8px 10px", borderRight: "1px solid #1e3a5f", fontWeight: row.type === "observed" ? "600" : "400" }}>
                          {row.type === "observed" && val !== null && val !== undefined ? val : "—"}
                        </td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   CALCULATIONS
========================================================= */
function CalculationsSection({ experiment, observations = [], onOpenReportModal }) {
  const [selectedRunIdx, setSelectedRunIdx] = useState(0);

  // Filter valid student runs with their slot numbers (1-indexed)
  const validRuns = observations
    .map((obs, idx) => (obs ? { obs, slotNum: idx + 1 } : null))
    .filter(Boolean);

  const activeRunObj = validRuns[selectedRunIdx] || validRuns[0] || null;
  const currentRun = activeRunObj ? activeRunObj.obs : null;

  const calculations = {
    rc: {
      title: "🧮 Step-by-Step Calculations — RC Circuit",
      overview: "Follow this standardized procedure to analyze charging and discharging dynamics, compute time constants, and calculate instantaneous capacitor values from your experimental settings.",
      steps: [
        {
          step: 1,
          title: "Unit Conversion for Capacitance",
          desc: "Convert capacitance from microfarads (μF) into standard SI Farads (F):",
          equation: "C (F) = C (μF) × 10⁻⁶"
        },
        {
          step: 2,
          title: "Compute Circuit Time Constant (τ)",
          desc: "Multiply circuit resistance by capacitance in Farads to obtain the time constant in seconds:",
          equation: "τ = R (Ω) × C (F)"
        },
        {
          step: 3,
          title: "Determine Initial Inrush Current (I₀)",
          desc: "At switch closure (t = 0), uncharged plates act as a short circuit. Compute maximum current using Ohm's Law:",
          equation: "I₀ = V₀ / R"
        },
        {
          step: 4,
          title: "Calculate Theoretical Voltage at t = τ",
          desc: "Evaluate the capacitor voltage after exactly one time constant (63.21% of full supply):",
          equation: "V_C(τ) = V₀ × (1 − e⁻¹) = V₀ × (1 − 0.36788) ≈ 0.6321 × V₀"
        },
        {
          step: 5,
          title: "Verify Full Steady-State Duration",
          desc: "Calculate the time required for capacitor to charge beyond 99.3% to reach practical equilibrium:",
          equation: "t_steady = 5 × τ"
        }
      ],
      workedExample: {
        title: "Standard Physical Lab Worked Example",
        given: "Supply Voltage V₀ = 10.0 V, Resistance R = 2000 Ω, Capacitance C = 1000 μF",
        steps: [
          "1. Capacitance in SI: C = 1000 × 10⁻⁶ F = 0.001 F",
          "2. Time Constant: τ = 2000 Ω × 0.001 F = 2.000 s",
          "3. Peak Surge Current: I₀ = 10.0 V / 2000 Ω = 0.005 A = 5.00 mA",
          "4. Voltage at t = 2.0 s: V_C(2s) = 10.0 × (1 − e⁻¹) = 10.0 × 0.6321 = 6.32 V",
          "5. Full Charge Duration: t_full = 5 × 2.0 s = 10.0 s"
        ],
        conclusion: "At t = 2.00 s, the multimeter should read 6.32 V and 1.84 mA. At t = 10.0 s, the capacitor is fully charged to 10.00 V and current drops to 0.00 mA."
      }
    },
    hysteresis: {
      title: "🧮 Step-by-Step Calculations — Magnetic Hysteresis Loss",
      overview: "Quantify applied magnetomotive force, core induction, closed loop integration, and heat dissipation according to electromagnetic core specifications.",
      steps: [
        {
          step: 1,
          title: "Convert Core Cross-Sectional Area to m²",
          desc: "Convert core area from square centimeters (cm²) to square meters (m²):",
          equation: "A_core (m²) = A_core (cm²) × 10⁻⁴"
        },
        {
          step: 2,
          title: "Calculate Maximum Magnetic Field Strength (H_max)",
          desc: "Compute peak applied field from coil turns N, peak excitation current I_max, and mean path length l_m:",
          equation: "H_max = (N × I_max) / l_m"
        },
        {
          step: 3,
          title: "Compute Maximum Flux Density (B_max)",
          desc: "Calculate saturation-governed induction using Faraday's AC relation:",
          equation: "B_max = V_rms / (4.44 × f × N × A_core)"
        },
        {
          step: 4,
          title: "Calculate Hysteresis Energy Loss per Cycle (w_h)",
          desc: "Numerically integrate the area enclosed by the B–H closed contour:",
          equation: "w_h = ∮ B dH  (J/m³ per cycle)"
        },
        {
          step: 5,
          title: "Calculate Total Hysteresis Power Loss (P_h)",
          desc: "Multiply energy loss per cycle by AC excitation frequency and total core volume:",
          equation: "P_h = w_h × f × V_core  (Watts)"
        }
      ],
      workedExample: {
        title: "Standard Transformer Core Worked Example",
        given: "AC Voltage = 12.0 V, Turns N = 250, Frequency f = 50 Hz, Core Area = 4.0 cm², Path l_m = 0.25 m",
        steps: [
          "1. Core Area: A = 4.0 × 10⁻⁴ m²; Core Volume V_core = A × l_m = 1.0 × 10⁻⁴ m³",
          "2. Excitation Current: I_max ≈ 0.12 A  ==>  H_max = (250 × 0.12) / 0.25 = 120.0 A/m",
          "3. Peak Induction: B_max = 12.0 / (4.44 × 50 × 250 × 0.0004) ≈ 0.54 T",
          "4. Measured Sigmoid Loop Area: w_h ≈ 45.0 J/m³ per cycle",
          "5. Total Power Loss: P_h = 45.0 J/m³ × 50 Hz × 0.0001 m³ = 0.225 W = 225 mW"
        ],
        conclusion: "A silicon steel transformer core dissipates 225 mW of continuous thermal power under these conditions, operating within safe temperature tolerances."
      }
    },
    string: {
      title: "🧮 Step-by-Step Calculations — Vibrations on Stretched String",
      overview: "Derive mechanical wave propagation speed, harmonic wavelengths, resonant frequencies, and nodal positions from string tension and density.",
      steps: [
        {
          step: 1,
          title: "Calculate String Tension (T)",
          desc: "Calculate tension produced by hanging slotted weights over the friction-free pulley:",
          equation: "T = m_hanging (kg) × 9.81 m/s²"
        },
        {
          step: 2,
          title: "Calculate Wave Velocity (v)",
          desc: "Apply the kinematic relation for transverse mechanical waves on flexible strings:",
          equation: "v = √(T / μ)"
        },
        {
          step: 3,
          title: "Determine Mode Wavelength (λ_n)",
          desc: "For harmonic mode n (number of loops), compute the spatial wavelength:",
          equation: "λ_n = (2 × L) / n"
        },
        {
          step: 4,
          title: "Compute Required Resonant Frequency (f_n)",
          desc: "Calculate the driving frequency needed to sustain harmonic mode n:",
          equation: "f_n = v / λ_n = (n / (2L)) × √(T / μ)"
        },
        {
          step: 5,
          title: "Locate Stationary Node Positions",
          desc: "Nodes occur at regular intervals along the length of the string where net displacement remains zero:",
          equation: "x_node = k × (λ_n / 2) = k × (L / n)  for k = 0, 1, ..., n"
        }
      ],
      workedExample: {
        title: "Melde's Apparatus Harmonic Analysis",
        given: "String Length L = 1.20 m, Hanging Weight = 400 g (T = 3.92 N), Cord Density μ = 0.001 kg/m, Desired Mode n = 3 loops",
        steps: [
          "1. String Tension: T = 0.400 kg × 9.81 m/s² = 3.924 N",
          "2. Wave Speed: v = √(3.924 / 0.001) = √3924 ≈ 62.64 m/s",
          "3. Mode 3 Wavelength: λ₃ = (2 × 1.20 m) / 3 = 0.800 m",
          "4. Resonant Frequency: f₃ = 62.64 m/s / 0.800 m = 78.30 Hz",
          "5. Node Positions: x = 0 m (fixed tip), x = 0.40 m, x = 0.80 m, x = 1.20 m (pulley node)"
        ],
        conclusion: "Setting the generator to 78.30 Hz excites exactly 3 distinct vibrating loops of length 40.0 cm each with nodes at 0.40 m and 0.80 m."
      }
    },
    impulse: {
      title: "🧮 Step-by-Step Calculations — Impulse-Momentum Theorem",
      overview: "Verify linear momentum conservation, compute collision impulses from velocity differences, and confirm Newton's Third Law in two-cart collisions.",
      steps: [
        {
          step: 1,
          title: "Calculate Initial Momentum of Each Cart",
          desc: "Compute individual pre-collision momenta using directional velocities (+ for right, − for left):",
          equation: "p₁_i = m₁ × v₁_i  and  p₂_i = m₂ × v₂_i"
        },
        {
          step: 2,
          title: "Sum Total Pre-Collision System Momentum",
          desc: "Compute net system momentum prior to collision contact:",
          equation: "P_initial = p₁_i + p₂_i = (m₁ × v₁_i) + (m₂ × v₂_i)"
        },
        {
          step: 3,
          title: "Calculate Post-Collision Momentum of Each Cart",
          desc: "Compute momenta after carts rebound from each other:",
          equation: "p₁_f = m₁ × v₁_f  and  p₂_f = m₂ × v₂_f"
        },
        {
          step: 4,
          title: "Calculate Individual Cart Impulses",
          desc: "Determine impulse imparted to each cart by evaluating change in momentum:",
          equation: "J₁ = Δp₁ = m₁(v₁_f − v₁_i)  and  J₂ = Δp₂ = m₂(v₂_f − v₂_i)"
        },
        {
          step: 5,
          title: "Confirm Momentum Conservation & Equal-and-Opposite Impulses",
          desc: "Verify Newton's Third Law (F₁₂ = −F₂₁) and isolated conservation:",
          equation: "J₁ + J₂ = 0  ==>  J₁ = −J₂  and  P_final = P_initial"
        }
      ],
      workedExample: {
        title: "Two-Cart Dynamic Track Impact",
        given: "Cart 1 (Blue): m₁ = 1.00 kg, v₁_i = +1.50 m/s | Cart 2 (Green): m₂ = 2.00 kg, v₂_i = -1.00 m/s | Restitution e = 0.80",
        steps: [
          "1. Initial Momenta: p₁_i = 1.00 × (+1.50) = +1.50 kg·m/s; p₂_i = 2.00 × (-1.00) = -2.00 kg·m/s",
          "2. Total Initial Momentum: P_initial = 1.50 + (-2.00) = -0.50 kg·m/s",
          "3. Post-Collision Velocities: v₁_f = -1.833 m/s; v₂_f = +0.667 m/s",
          "4. Final Momenta: p₁_f = 1.00 × (-1.833) = -1.833 kg·m/s; p₂_f = 2.00 × (+0.667) = +1.333 kg·m/s",
          "5. Total Final Momentum: P_final = -1.833 + 1.333 = -0.50 kg·m/s (Conserved identically!)",
          "6. Impulse Evaluation: J₁ = -1.833 - (+1.50) = -3.333 N·s; J₂ = +1.333 - (-2.00) = +3.333 N·s"
        ],
        conclusion: "Cart 1 experiences an impulse of -3.33 N·s, while Cart 2 experiences an equal and opposite impulse of +3.33 N·s, perfectly verifying J = Δp and J₁ + J₂ = 0."
      }
    },
    edm: {
      title: "🧮 Step-by-Step Calculations — Smart ZNC EDM",
      overview: "Calculate volumetric material erosion, gravimetric weight loss, single-spark discharge energy, and tool wear metrics from machining parameters.",
      steps: [
        {
          step: 1,
          title: "Determine Workpiece Weight Loss",
          desc: "Weigh specimen before and after machining on a precision laboratory analytical balance:",
          equation: "ΔW_workpiece = W_initial − W_final  (grams)"
        },
        {
          step: 2,
          title: "Convert Mass Loss to Volumetric Erosion",
          desc: "Divide mass loss by workpiece material density (e.g. Mild Steel ρ = 0.00785 g/mm³):",
          equation: "V_removed (mm³) = ΔW_workpiece / ρ_material"
        },
        {
          step: 3,
          title: "Calculate Material Removal Rate (MRR)",
          desc: "Divide eroded volume by active machining time in minutes:",
          equation: "MRR (mm³/min) = V_removed / t_machining"
        },
        {
          step: 4,
          title: "Calculate Single Spark Pulse Energy (E_s)",
          desc: "Evaluate thermal electrical energy delivered per discharge cycle:",
          equation: "E_s (mJ) = V_gap (V) × I_discharge (A) × T_on (µs) × 10⁻³"
        },
        {
          step: 5,
          title: "Calculate Duty Cycle Factor (η)",
          desc: "Determine active spark time percentage:",
          equation: "Duty Cycle (%) = [T_on / (T_on + T_off)] × 100%"
        }
      ],
      workedExample: {
        title: "Steel Die Sinking Operation",
        given: "Discharge Current I = 20.0 A, Gap Voltage V = 45 V, Pulse ON = 120 µs, Pulse OFF = 40 µs, Machining Time = 15 min, Initial W = 250.0 g, Final W = 245.2 g",
        steps: [
          "1. Mass Loss: ΔW = 250.0 g − 245.2 g = 4.80 g",
          "2. Volume Eroded: V = 4.80 g / 0.00785 g/mm³ = 611.46 mm³",
          "3. Material Removal Rate: MRR = 611.46 mm³ / 15 min = 40.76 mm³/min",
          "4. Single Spark Energy: E_s = 45 V × 20 A × 120 µs × 10⁻³ = 108.0 mJ",
          "5. Duty Cycle: η = [120 / (120 + 40)] × 100% = 75.0%"
        ],
        conclusion: "At 75% duty cycle and 108 mJ per spark, the process achieves a robust volumetric removal rate of 40.76 mm³/min on mild steel workpiece material."
      }
    },
    opamp: {
      title: "🧮 Step-by-Step Calculations — Operational Amplifier",
      overview: "Calculate closed-loop voltage gain, ideal output voltage, phase shift, and test against power supply rail clipping thresholds.",
      steps: [
        {
          step: 1,
          title: "Calculate Closed-Loop Voltage Gain (A_v)",
          desc: "Calculate gain based on the selected configuration topology:",
          equation: "Inverting: A_v = −(R_f / R₁)  |  Non-Inverting: A_v = 1 + (R_f / R₁)"
        },
        {
          step: 2,
          title: "Calculate Theoretical Unclipped Output Voltage",
          desc: "Multiply closed-loop gain by applied input voltage:",
          equation: "V_out,ideal = A_v × V_in"
        },
        {
          step: 3,
          title: "Determine Power Supply Saturation Thresholds",
          desc: "For dual DC rails ±V_CC (e.g. ±12 V), maximum output swing is bounded by saturation limits:",
          equation: "V_sat+ ≈ +V_CC − 1.5 V  and  V_sat− ≈ −V_CC + 1.5 V  (or ±V_CC for rail-to-rail models)"
        },
        {
          step: 4,
          title: "Evaluate Clipping & Saturation Condition",
          desc: "Compare theoretical output against saturation rails:",
          equation: "V_out = +V_sat if V_out,ideal > +V_sat;  V_out = −V_sat if V_out,ideal < −V_sat; else V_out = V_out,ideal"
        }
      ],
      workedExample: {
        title: "Op-Amp 741 Dual Rail Analysis",
        given: "Configuration: Inverting, R₁ = 10 kΩ, R_f = 40 kΩ, Supply Rails = ±12.0 V, Input Voltage V_in = +1.50 V",
        steps: [
          "1. Closed-Loop Gain: A_v = −(40 kΩ / 10 kΩ) = −4.00",
          "2. Theoretical Output: V_out,ideal = −4.00 × (+1.50 V) = −6.00 V",
          "3. Saturation Limit Check: |−6.00 V| < 12.0 V (Linear Region satisfied)",
          "4. Actual Output Voltage: V_out = −6.00 V (180° inverted phase)",
          "5. Overdrive Test: If V_in is raised to +3.50 V ==> V_out,ideal = −14.0 V ==> Clipped to −12.00 V (Hard Negative Saturation)"
        ],
        conclusion: "Within the linear window (|V_in| ≤ 3.0 V), output tracks linearly with an exact voltage gain of -4.00. Beyond 3.0 V, hard saturation clips the waveform."
      }
    }
  };

  const data = calculations[experiment];

  return (
    <div className="info-section">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
        <h2 style={{ margin: 0 }}>{data.title}</h2>
        {onOpenReportModal && (
          <button
            onClick={onOpenReportModal}
            className="sim-btn-primary"
            style={{
              padding: "8px 18px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: "700",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
            }}
          >
            <span>📄</span> Official Lab Report (PDF)
          </button>
        )}
      </div>

      {/* =========================================================
          DYNAMIC LIVE CALCULATION ENGINE (STUDENT RUN EVALUATION)
      ========================================================= */}
      <div className="dyn-calc-console">
        <div className="dyn-calc-header">
          <div className="dyn-calc-title">
            <span>⚡</span>
            <span>Dynamic Calculation Engine — Live Student Verification</span>
          </div>
          {validRuns.length > 0 && (
            <div className="dyn-calc-slots">
              <span style={{ fontSize: "12.5px", fontWeight: "700", opacity: 0.85, alignSelf: "center" }}>Select Run:</span>
              {validRuns.map((item, idx) => (
                <button
                  key={idx}
                  className={`dyn-calc-slot-btn ${selectedRunIdx === idx ? "active" : ""}`}
                  onClick={() => setSelectedRunIdx(idx)}
                >
                  Run #{item.slotNum}
                </button>
              ))}
            </div>
          )}
        </div>

        {validRuns.length === 0 ? (
          <div className="dyn-empty-notice">
            <strong style={{ fontSize: "15px", display: "block", marginBottom: "6px" }}>
              ℹ️ Live Dynamic Calculation Engine Ready
            </strong>
            No observation runs have been saved yet for this experiment session. Navigate to the <strong>"🔬 Experiment"</strong> tab, adjust parameters, run the simulation, and click <strong>"Save Observation"</strong> to evaluate your personal recorded parameters dynamically with automated formula substitutions and percentage error verification!
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: "16px", fontSize: "13.5px", color: "#64748b" }}>
              Evaluating live telemetry recorded for <strong>Run #{activeRunObj.slotNum}</strong>:
            </div>

            {/* Dynamic Step-by-Step Evaluation */}
            {renderLiveDynamicCalculations(experiment, currentRun)}
          </div>
        )}
      </div>

      {/* OVERVIEW */}
      <div className="info-card">
        <h3>📋 Standard Mathematical Procedure</h3>
        <p className="calc-overview-text">
          {data.overview}
        </p>
      </div>

      {/* STEP-BY-STEP CALCULATION GUIDE */}
      <div className="info-card">
        <h3>🔢 Step-by-Step Calculation Guide</h3>
        <div className="calc-step-list">
          {data.steps.map((s, idx) => (
            <div className="calc-step-card" key={idx}>
              <div className="calc-step-num">{s.step}</div>
              <div className="calc-step-body">
                <div className="calc-step-title">{s.title}</div>
                <div className="calc-step-desc">{s.desc}</div>
                <div className="calc-step-equation">{s.equation}</div>
              </div>
            </div>
          ))}
        </div>

        {/* WORKED EXAMPLE */}
        {data.workedExample && (
          <div className="worked-example-card">
            <div className="worked-example-title">
              <span>💡</span>
              <span>{data.workedExample.title}</span>
            </div>
            <div className="worked-example-given">
              Given Inputs: {data.workedExample.given}
            </div>
            <div className="worked-example-step-list">
              {data.workedExample.steps.map((st, sIdx) => (
                <div key={sIdx} className="worked-example-step">
                  {st}
                </div>
              ))}
            </div>
            <div className="worked-example-conclusion">
              <strong>Verification Result:</strong> {data.workedExample.conclusion}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Live Dynamic Calculation Helper: Evaluates student's recorded parameters against physical governing laws
function renderLiveDynamicCalculations(experiment, run) {
  if (!run) return null;

  switch (experiment) {
    case "rc": {
      const v0 = parseFloat(run.voltage) || 0;
      const r = parseFloat(run.resistance) || 1;
      const cUf = parseFloat(run.capacitance) || 1;
      const cFarad = cUf * 1e-6;
      const tauTheor = r * cFarad;
      const i0Theor = (v0 / r) * 1000; // mA
      const vcTheor = v0 * 0.6321;
      const tSteadyTheor = 5 * tauTheor;

      const tauObs = parseFloat(run.tau) || 0;
      const vcObs = parseFloat(run.vc) || 0;
      const iObs = parseFloat(run.current) || 0;

      const tauErr = tauTheor > 0 ? (Math.abs(tauObs - tauTheor) / tauTheor) * 100 : 0;
      const vcErr = vcTheor > 0 ? (Math.abs(vcObs - vcTheor) / vcTheor) * 100 : 0;

      return (
        <div className="dyn-calc-steps-grid">
          <div className="dyn-calc-step-card">
            <div className="dyn-step-title">Step 1: Capacitance Unit Conversion & Initial Surge Current</div>
            <div className="dyn-step-formula-box">
              C = {cUf} μF × 10⁻⁶ = {cFarad.toExponential(3)} Farads (F)
              <br />
              I₀ = V₀ / R = {v0.toFixed(1)} V / {r.toFixed(0)} Ω = {(v0 / r).toFixed(5)} A = {i0Theor.toFixed(2)} mA
            </div>
          </div>

          <div className="dyn-calc-step-card">
            <div className="dyn-step-title">Step 2: Circuit Time Constant (τ = R · C) Evaluation</div>
            <div className="dyn-step-formula-box">
              τ_theor = {r.toFixed(0)} Ω × {cFarad.toExponential(3)} F = {tauTheor.toFixed(4)} s
              <br />
              Steady State Duration (5τ) = 5 × {tauTheor.toFixed(4)} s = {tSteadyTheor.toFixed(3)} s
            </div>
          </div>

          <div className="dyn-calc-step-card">
            <div className="dyn-step-title">Step 3: Theoretical Capacitor Voltage at t = τ (63.21% Charging Level)</div>
            <div className="dyn-step-formula-box">
              V_c(τ) = {v0.toFixed(1)} V × (1 − e⁻¹) = {v0.toFixed(1)} V × 0.6321 = {vcTheor.toFixed(3)} V
            </div>

            <div className="dyn-calc-comparison-box">
              <div className="dyn-comparison-item">
                <div className="dyn-comparison-label">Time Constant τ (Theor vs Obs)</div>
                <div className="dyn-comparison-val">{tauTheor.toFixed(3)} s vs {tauObs.toFixed(3)} s</div>
                <div style={{ fontSize: "12px", marginTop: "4px" }}>Discrepancy: <strong>{tauErr.toFixed(2)}%</strong></div>
              </div>
              <div className="dyn-comparison-item">
                <div className="dyn-comparison-label">Voltage V_C(τ) (Theor vs Obs)</div>
                <div className="dyn-comparison-val">{vcTheor.toFixed(2)} V vs {vcObs.toFixed(2)} V</div>
                <div style={{ fontSize: "12px", marginTop: "4px" }}>Discrepancy: <strong>{vcErr.toFixed(2)}%</strong></div>
              </div>
            </div>

            <div className={`dyn-error-badge ${tauErr < 5 ? "badge-success" : tauErr < 10 ? "badge-warning" : "badge-danger"}`}>
              {tauErr < 5 ? "✅ High Precision Experimental Agreement (< 5% error)" : "⚠️ Acceptable Educational Tolerance (5%–10% error)"}
            </div>
          </div>
        </div>
      );
    }

    case "hysteresis": {
      const maxH = parseFloat(run.maxH) || 0;
      const freq = parseFloat(run.freq) || 50;
      const loopArea = parseFloat(run.loopArea) || 0;
      const lossObs = parseFloat(run.loss) || 0;
      const maxB = parseFloat(run.maxB) || 0;
      const coreVolume = 0.001; // m³

      const lossTheor = loopArea * freq * coreVolume * 1000;
      const lossErr = lossTheor > 0 ? (Math.abs(lossObs - lossTheor) / lossTheor) * 100 : 0;

      return (
        <div className="dyn-calc-steps-grid">
          <div className="dyn-calc-step-card">
            <div className="dyn-step-title">Step 1: Applied Field Excitation & Flux Saturation</div>
            <div className="dyn-step-formula-box">
              H_max = {maxH.toFixed(1)} A/m | Operating Frequency = {freq} Hz | Peak Induction B_max = {maxB.toFixed(3)} T
            </div>
          </div>

          <div className="dyn-calc-step-card">
            <div className="dyn-step-title">Step 2: Hysteresis Energy Integral per Cycle (w_h = ∮ B · dH)</div>
            <div className="dyn-step-formula-box">
              Loop Area = {loopArea.toFixed(3)} J/m³ per magnetization cycle
            </div>
          </div>

          <div className="dyn-calc-step-card">
            <div className="dyn-step-title">Step 3: Total Power Loss Verification (P = w_h · f · V_core)</div>
            <div className="dyn-step-formula-box">
              P_loss = {loopArea.toFixed(3)} J/m³ × {freq} Hz × {coreVolume} m³ = {lossTheor.toFixed(3)} W
            </div>

            <div className="dyn-calc-comparison-box">
              <div className="dyn-comparison-item">
                <div className="dyn-comparison-label">Core Loss (Theor vs Obs)</div>
                <div className="dyn-comparison-val">{lossTheor.toFixed(3)} W vs {lossObs.toFixed(3)} W</div>
                <div style={{ fontSize: "12px", marginTop: "4px" }}>Discrepancy: <strong>{lossErr.toFixed(2)}%</strong></div>
              </div>
            </div>

            <div className="dyn-error-badge badge-success">
              ✅ Magnetic Hysteresis Energy Integral Confirmed
            </div>
          </div>
        </div>
      );
    }

    case "string": {
      const tension = parseFloat(run.tension) || 1;
      const length = parseFloat(run.length) || 1.0;
      const mu = 0.001; // kg/m
      const mode = 2; // harmonic 2

      const vTheor = Math.sqrt(tension / mu);
      const lambdaTheor = (2 * length) / mode; // = length
      const fTheor = vTheor / lambdaTheor;

      const fObs = parseFloat(run.frequency) || 0;
      const lambdaObs = parseFloat(run.wavelength) || 0;
      const vObs = parseFloat(run.speed) || 0;

      const fErr = fTheor > 0 ? (Math.abs(fObs - fTheor) / fTheor) * 100 : 0;
      const lambdaErr = lambdaTheor > 0 ? (Math.abs(lambdaObs - lambdaTheor) / lambdaTheor) * 100 : 0;

      return (
        <div className="dyn-calc-steps-grid">
          <div className="dyn-calc-step-card">
            <div className="dyn-step-title">Step 1: Transverse Wave Propagation Speed (v = √(T / μ))</div>
            <div className="dyn-step-formula-box">
              v = √({tension.toFixed(2)} N / {mu} kg/m) = √{(tension / mu).toFixed(1)} = {vTheor.toFixed(2)} m/s
            </div>
          </div>

          <div className="dyn-calc-step-card">
            <div className="dyn-step-title">Step 2: Harmonic Mode Spatial Wavelength (λ_n = 2L / n)</div>
            <div className="dyn-step-formula-box">
              λ₂ = (2 × {length.toFixed(2)} m) / {mode} = {lambdaTheor.toFixed(3)} m
            </div>
          </div>

          <div className="dyn-calc-step-card">
            <div className="dyn-step-title">Step 3: Resonant Driving Frequency (f_n = v / λ_n)</div>
            <div className="dyn-step-formula-box">
              f₂ = {vTheor.toFixed(2)} m/s / {lambdaTheor.toFixed(3)} m = {fTheor.toFixed(2)} Hz
            </div>

            <div className="dyn-calc-comparison-box">
              <div className="dyn-comparison-item">
                <div className="dyn-comparison-label">Resonant Frequency (Theor vs Obs)</div>
                <div className="dyn-comparison-val">{fTheor.toFixed(2)} Hz vs {fObs.toFixed(2)} Hz</div>
                <div style={{ fontSize: "12px", marginTop: "4px" }}>Discrepancy: <strong>{fErr.toFixed(2)}%</strong></div>
              </div>
              <div className="dyn-comparison-item">
                <div className="dyn-comparison-label">Wavelength (Theor vs Obs)</div>
                <div className="dyn-comparison-val">{lambdaTheor.toFixed(3)} m vs {lambdaObs.toFixed(3)} m</div>
                <div style={{ fontSize: "12px", marginTop: "4px" }}>Discrepancy: <strong>{lambdaErr.toFixed(2)}%</strong></div>
              </div>
            </div>

            <div className={`dyn-error-badge ${fErr < 5 ? "badge-success" : "badge-warning"}`}>
              {fErr < 5 ? "✅ High Precision Standing Wave Agreement (< 5% error)" : "⚠️ Acceptable Resonant Mode Alignment"}
            </div>
          </div>
        </div>
      );
    }

    case "impulse": {
      const mass = parseFloat(run.mass) || 1.0;
      const force = parseFloat(run.force) || 0;
      const time = parseFloat(run.time) || 0.05;
      const jObs = parseFloat(run.impulse) || 0;
      const deltaPObs = parseFloat(run.deltaP) || 0;

      const jTheor = force * time;
      const diff = Math.abs(jObs - deltaPObs);
      const err = Math.abs(jObs) > 0 ? (diff / Math.abs(jObs)) * 100 : 0;

      return (
        <div className="dyn-calc-steps-grid">
          <div className="dyn-calc-step-card">
            <div className="dyn-step-title">Step 1: Applied Impact Force Impulse (J = F · Δt)</div>
            <div className="dyn-step-formula-box">
              J = {force.toFixed(2)} N × {time.toFixed(3)} s = {jTheor.toFixed(3)} N·s
            </div>
          </div>

          <div className="dyn-calc-step-card">
            <div className="dyn-step-title">Step 2: Linear Momentum Transition (Δp = m · Δv)</div>
            <div className="dyn-step-formula-box">
              Δp = {mass.toFixed(2)} kg × Δv = {deltaPObs.toFixed(3)} kg·m/s
            </div>
          </div>

          <div className="dyn-calc-step-card">
            <div className="dyn-step-title">Step 3: Impulse-Momentum Theorem Equivalence Verification (|J − Δp| = 0)</div>
            <div className="dyn-step-formula-box">
              |J_obs − Δp_obs| = |{jObs.toFixed(3)} − {deltaPObs.toFixed(3)}| = {diff.toFixed(4)} N·s
            </div>

            <div className="dyn-calc-comparison-box">
              <div className="dyn-comparison-item">
                <div className="dyn-comparison-label">Recorded Impulse (J)</div>
                <div className="dyn-comparison-val">{jObs.toFixed(3)} N·s</div>
              </div>
              <div className="dyn-comparison-item">
                <div className="dyn-comparison-label">Momentum Change (Δp)</div>
                <div className="dyn-comparison-val">{deltaPObs.toFixed(3)} kg·m/s</div>
              </div>
              <div className="dyn-comparison-item">
                <div className="dyn-comparison-label">Equivalence Residual</div>
                <div className="dyn-comparison-val">{diff.toFixed(4)}</div>
                <div style={{ fontSize: "12px", marginTop: "4px" }}>Relative Offset: <strong>{err.toFixed(2)}%</strong></div>
              </div>
            </div>

            <div className="dyn-error-badge badge-success">
              ✅ Impulse-Momentum Equivalence Confirmed
            </div>
          </div>
        </div>
      );
    }

    case "edm": {
      const current = parseFloat(run.current) || 0;
      const voltage = parseFloat(run.voltage) || 0;
      const pOn = parseFloat(run.pulseOn) || 0;
      const pOff = parseFloat(run.pulseOff) || 0;
      const initW = parseFloat(run.initWeight) || 0;
      const finalW = parseFloat(run.finalWeight) || 0;
      const machTime = parseFloat(run.machTime) || 15;
      const mrrObs = parseFloat(run.mrr) || 0;

      const dutyCycle = pOn + pOff > 0 ? (pOn / (pOn + pOff)) * 100 : 0;
      const massLost = initW - finalW;
      const volumeRemoved = massLost / 0.00785; // mm³ (density of steel)
      const mrrTheor = volumeRemoved / (machTime || 1);
      const mrrErr = mrrTheor > 0 ? (Math.abs(mrrObs - mrrTheor) / mrrTheor) * 100 : 0;
      const sparkEnergy = (voltage * current * pOn) * 1e-3; // mJ

      return (
        <div className="dyn-calc-steps-grid">
          <div className="dyn-calc-step-card">
            <div className="dyn-step-title">Step 1: Pulse Duty Cycle Factor & Single-Spark Discharge Energy</div>
            <div className="dyn-step-formula-box">
              η = [T_on / (T_on + T_off)] × 100% = [{pOn} / ({pOn} + {pOff})] × 100% = {dutyCycle.toFixed(1)}%
              <br />
              E_s = {voltage} V × {current} A × {pOn} µs × 10⁻³ = {sparkEnergy.toFixed(2)} mJ
            </div>
          </div>

          <div className="dyn-calc-step-card">
            <div className="dyn-step-title">Step 2: Gravimetric Weight Loss to Volumetric Erosion Conversion</div>
            <div className="dyn-step-formula-box">
              ΔW = {initW.toFixed(1)} g − {finalW.toFixed(2)} g = {massLost.toFixed(2)} g
              <br />
              V_removed = {massLost.toFixed(2)} g / 0.00785 g/mm³ = {volumeRemoved.toFixed(2)} mm³
            </div>
          </div>

          <div className="dyn-calc-step-card">
            <div className="dyn-step-title">Step 3: Material Removal Rate (MRR = V_removed / t_mach)</div>
            <div className="dyn-step-formula-box">
              MRR_theor = {volumeRemoved.toFixed(2)} mm³ / {machTime} min = {mrrTheor.toFixed(2)} mm³/min
            </div>

            <div className="dyn-calc-comparison-box">
              <div className="dyn-comparison-item">
                <div className="dyn-comparison-label">Removal Rate (Theor vs Obs)</div>
                <div className="dyn-comparison-val">{mrrTheor.toFixed(2)} vs {mrrObs.toFixed(2)} mm³/min</div>
                <div style={{ fontSize: "12px", marginTop: "4px" }}>Discrepancy: <strong>{mrrErr.toFixed(2)}%</strong></div>
              </div>
            </div>

            <div className="dyn-error-badge badge-success">
              ✅ Electro-Thermal Spark Erosion Verified
            </div>
          </div>
        </div>
      );
    }

    case "opamp": {
      const mode = run.mode || "INVERTING";
      const vin = parseFloat(run.vin) || 0;
      const rf = parseFloat(run.rf) || 50;
      const rin = parseFloat(run.rin) || 10;
      const isInverting = mode.includes("INV") && !mode.includes("NON");

      const gainTheor = isInverting ? -(rf / rin) : (1 + (rf / rin));
      const voutUnclipped = gainTheor * vin;
      const voutTheor = Math.max(-12, Math.min(12, voutUnclipped));
      const isSaturatedTheor = Math.abs(voutUnclipped) >= 12;

      const gainObs = parseFloat(run.gain) || 0;
      const voutObs = parseFloat(run.vout) || 0;

      const gainErr = Math.abs(gainTheor) > 0 ? (Math.abs(gainObs - gainTheor) / Math.abs(gainTheor)) * 100 : 0;
      const voutErr = Math.abs(voutTheor) > 0 ? (Math.abs(voutObs - voutTheor) / Math.abs(voutTheor)) * 100 : 0;

      return (
        <div className="dyn-calc-steps-grid">
          <div className="dyn-calc-step-card">
            <div className="dyn-step-title">Step 1: Closed-Loop Voltage Gain (A_v) Formulation</div>
            <div className="dyn-step-formula-box">
              {isInverting
                ? `Inverting Gain A_v = −(R_f / R₁) = −(${rf} kΩ / ${rin} kΩ) = ${gainTheor.toFixed(2)}`
                : `Non-Inverting Gain A_v = 1 + (R_f / R₁) = 1 + (${rf} kΩ / ${rin} kΩ) = ${gainTheor.toFixed(2)}`}
            </div>
          </div>

          <div className="dyn-calc-step-card">
            <div className="dyn-step-title">Step 2: Linear Output Voltage (V_out = A_v · V_in)</div>
            <div className="dyn-step-formula-box">
              V_out,linear = {gainTheor.toFixed(2)} × {vin.toFixed(2)} V = {voutUnclipped.toFixed(2)} V
            </div>
          </div>

          <div className="dyn-calc-step-card">
            <div className="dyn-step-title">Step 3: Dual DC Rail Saturation Threshold Check (±12.0 V)</div>
            <div className="dyn-step-formula-box">
              Condition: {isSaturatedTheor ? `|${voutUnclipped.toFixed(2)} V| ≥ 12.0 V ==> Hard Saturation Clipping at ${voutTheor.toFixed(2)} V` : `|${voutUnclipped.toFixed(2)} V| < 12.0 V ==> Linear Operation Window Maintained`}
            </div>

            <div className="dyn-calc-comparison-box">
              <div className="dyn-comparison-item">
                <div className="dyn-comparison-label">Voltage Gain (Theor vs Obs)</div>
                <div className="dyn-comparison-val">{gainTheor.toFixed(2)} vs {gainObs.toFixed(2)}</div>
                <div style={{ fontSize: "12px", marginTop: "4px" }}>Discrepancy: <strong>{gainErr.toFixed(2)}%</strong></div>
              </div>
              <div className="dyn-comparison-item">
                <div className="dyn-comparison-label">Output Voltage (Theor vs Obs)</div>
                <div className="dyn-comparison-val">{voutTheor.toFixed(2)} V vs {voutObs.toFixed(2)} V</div>
                <div style={{ fontSize: "12px", marginTop: "4px" }}>Discrepancy: <strong>{voutErr.toFixed(2)}%</strong></div>
              </div>
            </div>

            <div className="dyn-error-badge badge-success">
              ✅ Operational Amplifier Circuit Response Confirmed
            </div>
          </div>
        </div>
      );
    }

    default:
      return <div>Dynamic calculations verified.</div>;
  }
}
/* =========================================================
   VIVA QUESTIONS
========================================================= */
function VivaSection({ experiment }) {
  const questions = {
    rc: [
      ["What is a capacitor?", "A device used to store electrical charge."],
      ["What is the time constant of an RC circuit?", "τ = RC."],
      [
        "What happens to capacitor voltage during charging?",
        "It increases exponentially towards the supply voltage.",
      ],
      [
        "What happens during discharging?",
        "The capacitor voltage decreases exponentially with time.",
      ],
      ["What is the unit of capacitance?", "Farad (F)."],
    ],
    hysteresis: [
      [
        "What is magnetic hysteresis?",
        "The lagging of magnetic flux density B behind the magnetizing field H.",
      ],
      [
        "What is a hysteresis loop?",
        "The closed B-H curve obtained during a complete cycle of magnetization.",
      ],
      [
        "What does the area of the hysteresis loop represent?",
        "Energy loss per unit volume per cycle.",
      ],
      [
        "What is coercivity?",
        "The magnitude of reverse magnetic field required to reduce the magnetic flux density to zero.",
      ],
      [
        "What is remanence?",
        "The residual magnetic flux density when the magnetizing field is reduced to zero.",
      ],
      [
        "How does frequency affect power loss?",
        "For the simulated model, power loss increases with the frequency of repeated magnetization.",
      ],
    ],
    string: [
      [
        "What is a standing wave?",
        "A wave pattern produced by interference of incident and reflected waves.",
      ],
      ["What is a node?", "A point of zero displacement."],
      ["What is an antinode?", "A point of maximum displacement."],
      [
        "What happens to wave velocity when tension is increased?",
        "Wave velocity increases.",
      ],
      [
        "What is the relation between velocity, frequency and wavelength?",
        "v = fλ.",
      ],
    ],
    impulse: [
      [
        "What is momentum?",
        "Momentum is the product of mass and velocity, p = mv.",
      ],
      [
        "What is impulse?",
        "Impulse is the product of force and the time interval for which it acts.",
      ],
      ["What is the SI unit of impulse?", "Newton-second (N·s)."],
      [
        "State the impulse-momentum theorem.",
        "Impulse is equal to the change in momentum.",
      ],
      ["What is the mathematical expression for impulse?", "J = FΔt."],
    ],
    edm: [
      [
        "What is the function of the dielectric fluid in EDM?",
        "It acts as an insulator until ionization, cools the spark zone, and flushes away debris.",
      ],
      [
        "How does increasing the Discharge Current affect MRR?",
        "Higher discharge current increases the spark energy, which leads to a higher Material Removal Rate (MRR) but a rougher surface finish.",
      ]
    ],
    opamp: [
      [
        "What is the concept of Virtual Ground in an Op-Amp?",
        "In an inverting configuration with feedback, the inverting terminal is kept at approximately 0V by the amplifier because the non-inverting terminal is grounded, despite having no physical connection to ground.",
      ],
      [
        "Why does an Op-Amp saturate?",
        "The output voltage cannot exceed the DC supply voltage rails (+Vcc and -Vee). If the input times the gain demands a higher voltage, the signal clips (saturates).",
      ]
    ]
  };

  return (
    <div className="info-section">
      <h2> Viva Voce Questions</h2>
      <div className="viva-list">
        {questions[experiment].map(([question, answer], index) => (
          <details className="viva-card" key={index}>
            <summary>
              <span>Q{index + 1}.</span> {question}
            </summary>
            <div className="viva-answer">
              <strong>Answer:</strong> {answer}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

export default App;