import React, { useState, useEffect } from "react";
import "./App.css";

// 1. Root-level simulations:
import RCSimulation from "./RCsimulation";
import HysteresisSimulation from "./Hysteresissimulation";

// 2. Subfolder simulations (Inside "Visual Laboratory"):
import VibrationStringSimulation from "./vibrationstringsimulation";
import ImpulseMomentum from "./impulsemomentum";
import EDMSimulation from "./EDMSimulation";
import OpAmpSimulation from "./OpAmpSimulation";

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

function App() {
  // Navigation views: "home", "contact", "subscriptions", "btech_branches", "branch_experiments", "mtech", "phd", or experiment id
  const [currentView, setCurrentView] = useState("home");
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const handleProgramSelect = (program) => {
    if (program === "btech") {
      setCurrentView("btech_branches");
    } else if (program === "mtech") {
      setCurrentView("mtech");
    } else if (program === "phd") {
      setCurrentView("phd");
    }
  };

  const handleBranchSelect = (branchId) => {
    setSelectedBranch(branchId);
    setCurrentView("branch_experiments");
  };

  return (
    <div className={`app ${isDark ? "dark-theme" : "light-theme"}`}>
      {currentView === "home" && (
        <Home
          onNavigateContact={() => setCurrentView("contact")}
          onNavigateSubscriptions={() => setCurrentView("subscriptions")}
          onSelectProgram={handleProgramSelect}
          isDark={isDark}
          toggleTheme={toggleTheme}
        />
      )}

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
          onSelectExperiment={(id) => setCurrentView(id)}
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
            <span className="experiment-tag">{exp.subtitle.toUpperCase()}</span>
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

function Home({ onNavigateContact, onNavigateSubscriptions, onSelectProgram, isDark, toggleTheme }) {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

        {/* ================= NAVBAR ================= */}
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

            <div className="home-logo">
              <div className="logo-symbol" aria-hidden="true"></div>
              <div className="logo-text">
                <strong>Virtual Lab</strong>
                <span>B.TECH LABORATORY PORTAL</span>
              </div>
            </div>
          </div>

          {/* Top Right: Nav Items + Degree Programs Dropdown + Subscriptions + Contact Us */}
          <nav
            className="home-nav"
            style={{ display: "flex", alignItems: "center", gap: "20px" }}
          >
            <button
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                })
              }
            >
              Home
            </button>

            {/* PROGRAMS DROPDOWN (B.Tech, M.Tech, Ph.D.) */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "transparent",
                  border: "none",
                  color: dropdownOpen ? "#38bdf8" : (isDark ? "#cbd5e1" : "#334155"),
                  fontSize: "14px",
                  fontWeight: "600",
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
                      background: "transparent",
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
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
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
                      background: "transparent",
                      border: "none",
                      color: isDark ? "#94a3b8" : "#475569",
                      fontSize: "13px",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? "#1e293b" : "#f1f5f9")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
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
                      background: "transparent",
                      border: "none",
                      color: isDark ? "#94a3b8" : "#475569",
                      fontSize: "13px",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? "#1e293b" : "#f1f5f9")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    🔬 Ph.D.
                  </button>
                </div>
              )}
            </div>

            <a href="#about">About Lab</a>

            {/* Subscriptions Button */}
            <button
              onClick={onNavigateSubscriptions}
              style={{
                background: "transparent",
                border: "none",
                color: isDark ? "#cbd5e1" : "#334155",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                padding: "6px 0",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = isDark ? "#f8fafc" : "#0f172a")}
              onMouseLeave={(e) => (e.currentTarget.style.color = isDark ? "#cbd5e1" : "#334155")}
            >
              Subscriptions
            </button>

            {/* Dedicated Contact Us Button */}
            <button
              onClick={onNavigateContact}
              style={{
                color: "#38bdf8",
                fontWeight: "600",
                fontSize: "14px",
                padding: "6px 14px",
                borderRadius: "8px",
                background: isDark
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
                e.currentTarget.style.background = isDark
                  ? "rgba(56, 189, 248, 0.1)"
                  : "rgba(2, 132, 199, 0.1)";
                e.currentTarget.style.color = "#38bdf8";
              }}
            >
              Contact Us
            </button>
          </nav>
        </header>

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
          <strong>Virtual Lab</strong>
          <span>B.Tech Laboratory Portal</span>
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
    rc: { title: "RC Circuit Charging & Discharging Tutorial", src: "/videos/rc.mp4", summary: "Detailed demonstration of capacitor charging, time constant calculation, and voltage-time curve plotting." },
    hysteresis: { title: "Hysteresis Loss & B-H Loop Tutorial", src: "/videos/hysteresis.mp4", summary: "Demonstration of cyclic core magnetization, loop area integration, and coercivity/remanence extraction." },
    string: { title: "Vibrations on String Tutorial", src: "/videos/string.mp4", summary: "Demonstration of standing wave nodes, antinodes, tension adjustment, and harmonic frequency verification." },
    impulse: { title: "Impulse-Momentum Theorem Tutorial", src: "/videos/impulse.mp4", summary: "Demonstration of collision dynamics, force-time graphs, and impulse calculation." },
    edm: { title: "Smart ZNC EDM Operation Tutorial", src: "/videos/edm.mp4", summary: "Detailed demonstration of parameter setup, pulse timing configuration, and calculating the Material Removal Rate (MRR)." },
    opamp: { title: "Op-Amp Gain & Characteristics Tutorial", src: "/videos/opamp.mp4", summary: "Learn to configure inverting/non-inverting modes, measure voltage gain, and observe saturation limits." },
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
          {isCompleted ? "✓ Tutorial Completed" : "⏳ Watch Video to Completion to Unlock Modules"}
        </span>
      </div>

      <div className="info-card" style={{ padding: "20px", background: "#08101d", border: "1px solid #1e3a5f", borderRadius: "12px" }}>
        <h3 style={{ marginTop: 0, color: "#38bdf8" }}>{video.title}</h3>
        <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "16px", lineHeight: "1.6" }}>{video.summary}</p>

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

  const tabs = [
    { id: "safety", label: "🛡️ Safety Measures", unlocked: true },
    { id: "video", label: "🎥 Video Guide", unlocked: safetyAcknowledged },
    { id: "theory", label: "📖 Theory", unlocked: videoCompleted },
    { id: "procedure", label: "📋 Procedure", unlocked: videoCompleted },
    { id: "experiment", label: "🔬 Experiment", unlocked: videoCompleted },
    { id: "observations", label: "📊 Observations", unlocked: videoCompleted },
    { id: "calculations", label: "🧮 Calculations", unlocked: videoCompleted },
    { id: "viva", label: "💡 Viva Questions", unlocked: videoCompleted },
  ];

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
        <div className={`large-icon`} aria-hidden="true">{currentExperiment?.icon}</div>
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
                <span>{tab.label}</span>
                {isLocked && <span style={{ fontSize: "11px" }}>🔒</span>}
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
            <ObservationsSection experiment={experiment} observations={observations} onEraseSlot={handleEraseSlot} />
          )}
          {activeTab === "calculations" && <CalculationsSection experiment={experiment} />}
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
            <div style={{ padding: "14px", background: "#0b172a", borderRadius: "8px", borderLeft: "4px solid #ef4444" }}>
              <strong style={{ color: "#f87171", fontSize: "14px" }}>⚡ Supply Rail Voltage Limits</strong>
              <p style={{ margin: "6px 0 0 0", color: "#cbd5e1", fontSize: "13px", lineHeight: "1.6" }}>
                Do not exceed ±15V on the Vcc (+V) and Vee (-V) pins of the IC 741. Reversing polarity or exceeding absolute maximum ratings (±22V) will cause immediate thermal destruction of the semiconductor junctions.
              </p>
            </div>
            <div style={{ padding: "14px", background: "#0b172a", borderRadius: "8px", borderLeft: "4px solid #f59e0b" }}>
              <strong style={{ color: "#fbbf24", fontSize: "14px" }}>🔌 Input Overdrive / Saturation</strong>
              <p style={{ margin: "6px 0 0 0", color: "#cbd5e1", fontSize: "13px", lineHeight: "1.6" }}>
                Ensure the input signal voltage (Vin) combined with circuit gain does not demand an output voltage exceeding the supply rails. The Op-Amp will saturate, causing signal clipping and distortion.
              </p>
            </div>
          </>
        )}

        {/* EDM SAFETY */}
        {isEDM && (
          <>
            <div style={{ padding: "14px", background: "#0b172a", borderRadius: "8px", borderLeft: "4px solid #ef4444" }}>
              <strong style={{ color: "#f87171", fontSize: "14px" }}>🔥 Dielectric Fluid Flash Point Hazard</strong>
              <p style={{ margin: "6px 0 0 0", color: "#cbd5e1", fontSize: "13px", lineHeight: "1.6" }}>
                Ensure the dielectric fluid level is maintained at least 50mm above the spark gap. Exposing the machining zone to open air during active discharge can ignite vaporized fumes and cause a flash fire.
              </p>
            </div>
            <div style={{ padding: "14px", background: "#0b172a", borderRadius: "8px", borderLeft: "4px solid #f59e0b" }}>
              <strong style={{ color: "#fbbf24", fontSize: "14px" }}>⚡ High-Current Sparking</strong>
              <p style={{ margin: "6px 0 0 0", color: "#cbd5e1", fontSize: "13px", lineHeight: "1.6" }}>
                Never touch the electrode (tool) or workpiece while the pulse generator is actively discharging. High localized currents are present which pose serious shock and burn hazards.
              </p>
            </div>
          </>
        )}

        {/* RC CIRCUIT SAFETY */}
        {isRC && (
          <>
            <div style={{ padding: "14px", background: "#0b172a", borderRadius: "8px", borderLeft: "4px solid #f59e0b" }}>
              <strong style={{ color: "#fbbf24", fontSize: "14px" }}>⚡ Capacitive Charge Storage & Dielectric Puncture</strong>
              <p style={{ margin: "6px 0 0 0", color: "#cbd5e1", fontSize: "13px", lineHeight: "1.6" }}>
                Electrolytic capacitors store significant charge even after the power supply is switched off. Never short-circuit terminals directly; always discharge via a resistor.
              </p>
            </div>
            <div style={{ padding: "14px", background: "#0b172a", borderRadius: "8px", borderLeft: "4px solid #ef4444" }}>
              <strong style={{ color: "#f87171", fontSize: "14px" }}>🔌 Polarity & Reverse Breakdown</strong>
              <p style={{ margin: "6px 0 0 0", color: "#cbd5e1", fontSize: "13px", lineHeight: "1.6" }}>
                Observing polarity on polarized units is critical. Reversing connections causes internal gas generation and risk of casing rupture.
              </p>
            </div>
          </>
        )}

        {/* HYSTERESIS SAFETY */}
        {isHysteresis && (
          <>
            <div style={{ padding: "14px", background: "#0b172a", borderRadius: "8px", borderLeft: "4px solid #ef4444" }}>
              <strong style={{ color: "#f87171", fontSize: "14px" }}>🧲 Core Overheating & Thermal Dissipation</strong>
              <p style={{ margin: "6px 0 0 0", color: "#cbd5e1", fontSize: "13px", lineHeight: "1.6" }}>
                Continuous cyclic magnetization causes high hysteresis/eddy-current losses. Do not operate at peak excitation currents for longer than 3 consecutive minutes.
              </p>
            </div>
          </>
        )}

        {/* STRING SAFETY */}
        {isString && (
          <div style={{ padding: "14px", background: "#0b172a", borderRadius: "8px", borderLeft: "4px solid #38bdf8" }}>
            <strong style={{ color: "#38bdf8", fontSize: "14px" }}>🎯 Resonance Tension & String Snap Hazard</strong>
            <p style={{ margin: "6px 0 0 0", color: "#cbd5e1", fontSize: "13px", lineHeight: "1.6" }}>
              Keep faces away from the plane of the vibrating string. High tensile loading combined with harmonic resonance can cause snapping.
            </p>
          </div>
        )}

        {/* IMPULSE SAFETY */}
        {isImpulse && (
          <div style={{ padding: "14px", background: "#0b172a", borderRadius: "8px", borderLeft: "4px solid #ef4444" }}>
            <strong style={{ color: "#f87171", fontSize: "14px" }}>📊 Piezoelectric Force Sensor Overload</strong>
            <p style={{ margin: "6px 0 0 0", color: "#cbd5e1", fontSize: "13px", lineHeight: "1.6" }}>
              Never drop heavy collision carts directly against bare force transducers without calibrated spring bumpers to prevent permanent damage to load cells.
            </p>
          </div>
        )}

        {/* MACHINE LIMITATIONS (Generic Base Panel) */}
        <div style={{ padding: "16px", background: "rgba(15, 23, 42, 0.75)", border: "1px solid #1e293b", borderRadius: "8px" }}>
          <h4 style={{ margin: "0 0 10px 0", color: "#f1f5f9", display: "flex", alignItems: "center", gap: "8px" }}>
            ⚙️ Hardware Limitations & Operational Thresholds
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px" }}>
            <div style={{ padding: "10px", background: "#020617", borderRadius: "6px", border: "1px solid #334155" }}>
              <span style={{ color: "#94a3b8", fontSize: "11px", textTransform: "uppercase", display: "block" }}>DC Supply Limits</span>
              <strong style={{ color: "#38bdf8", fontSize: "13px" }}>Max Voltage: 20.0 V DC</strong>
              <span style={{ color: "#64748b", fontSize: "12px", display: "block" }}>Max Continuous Current: 2.0 A</span>
            </div>
            <div style={{ padding: "10px", background: "#020617", borderRadius: "6px", border: "1px solid #334155" }}>
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
      title: " Theory — RC Circuit",
      objective: "To study the charging and discharging characteristics of a capacitor in an RC circuit and determine the time constant.",
      points: [
        "A capacitor stores electrical energy in the form of electric charge.",
        "When connected to a DC source through a resistor, the capacitor charges gradually.",
        "The time constant of an RC circuit is τ = RC.",
        "During charging, the capacitor voltage approaches the supply voltage exponentially.",
      ],
      formulas: ["τ = RC", "Charging: V(t) = V₀(1 − e⁻ᵗ⧸ᴿᶜ)", "Discharging: V(t) = V₀e⁻ᵗ⧸ᴿᶜ"],
    },
    hysteresis: {
      title: " Theory — Hysteresis Loss",
      objective: "To study the B-H hysteresis loop and understand energy loss in a magnetic material.",
      points: [
        "When a magnetic material is subjected to a changing magnetic field, its magnetization lags behind.",
        "The closed B-H curve obtained during a complete cycle is called the hysteresis loop.",
        "The area enclosed by the hysteresis loop represents energy loss per unit volume per cycle.",
      ],
      formulas: ["Energy loss = Area of B-H loop", "Power loss = Energy loss per cycle × Frequency × Volume"],
    },
    string: {
      title: " Theory — Vibrations on String",
      objective: "To study standing waves on a stretched string and investigate the relationship between tension, frequency and wavelength.",
      points: [
        "When reflected waves interfere with incident waves, standing waves are produced.",
        "Points of zero displacement are called nodes, maximum are antinodes.",
        "For a stretched string, increasing tension increases the wave velocity.",
      ],
      formulas: ["v = √(T/μ)", "λ = v/f"],
    },
    impulse: {
      title: " Theory — Impulse-Momentum Theorem",
      objective: "To verify the impulse-momentum theorem.",
      points: [
        "A force acting on an object for a finite time produces an impulse.",
        "Impulse is equal to the product of force and time interval.",
        "The impulse-momentum theorem states that impulse is equal to the change in momentum.",
      ],
      formulas: ["p = mv", "J = FΔt", "J = Δp"],
    },
    edm: {
      title: " Theory — Smart ZNC EDM",
      objective: "To study the effect of current, voltage, and pulse parameters on Material Removal Rate (MRR) during Electrical Discharge Machining.",
      points: [
        "EDM is a non-traditional machining process based on removing material from a part by means of a series of repeated electrical discharges.",
        "The tool (electrode) and workpiece must be electrically conductive.",
        "A dielectric fluid acts as an insulator until ionization, flushes debris, and cools the sparking zone.",
        "Increasing the Pulse ON time typically increases the MRR but may degrade surface finish.",
      ],
      formulas: [
        "MRR (mm³/min) = (Initial Weight - Final Weight) / (Time × Density of material)",
        "Wear Ratio = Tool Wear Rate (TWR) / Material Removal Rate (MRR)"
      ]
    },
    opamp: {
      title: " Theory — Operational Amplifier (Op-Amp)",
      objective: "To study voltage gain, input/output characteristics, and saturation limits using an Op-Amp (IC 741) in Inverting and Non-Inverting configurations.",
      points: [
        "An Op-Amp is a high-gain electronic voltage amplifier with a differential input and, usually, a single-ended output.",
        "An ideal op-amp has infinite open-loop gain, infinite input impedance, and zero output impedance.",
        "In the inverting configuration, the output voltage is 180 degrees out of phase with the input.",
        "In the non-inverting configuration, the output voltage is in phase with the input.",
      ],
      formulas: [
        "Inverting Gain (Av) = -(Rf / Rin)",
        "Non-Inverting Gain (Av) = 1 + (Rf / Rin)",
        "Vout = Av × Vin"
      ]
    }
  };

  const data = theory[experiment];

  return (
    <div className="info-section">
      <h2>{data.title}</h2>
      <div className="info-card"><h3> Objective</h3><p>{data.objective}</p></div>
      <div className="info-card">
        <h3> Theory</h3>
        <ul>{data.points.map((point, index) => (<li key={index}>{point}</li>))}</ul>
      </div>
      <div className="info-card">
        <h3> Important Formulae</h3>
        {data.formulas.map((formula, index) => (<div className="formula-line" key={index}>{formula}</div>))}
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
      "Click 'Run Backend Simulation'.",
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
function ObservationsSection({ experiment, observations = [], onEraseSlot }) {
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
        <button
          onClick={handleExportToExcel}
          style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 18px", background: "linear-gradient(135deg, #15803d 0%, #166534 100%)", color: "#ffffff", border: "1px solid #22c55e", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 14px rgba(22, 101, 52, 0.35)", transition: "all 0.2s ease" }}
        >
          <span>📊</span> Export to Excel
        </button>
      </div>

      <div className="info-card">
        <div style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", borderRadius: "8px", border: "1px solid #1e293b", background: "#08101d" }}>
          <table style={{ width: "100%", minWidth: "1150px", borderCollapse: "collapse", textAlign: "center", fontSize: "13px", color: "#e2e8f0" }}>
            <thead>
              <tr style={{ background: "#0f1f38", borderBottom: "1px solid #1e3a5f" }}>
                <th rowSpan={2} style={{ padding: "12px 16px", borderRight: "1px solid #1e3a5f", textAlign: "left", minWidth: "220px", color: "#38bdf8" }}>Quantity (with SI Unit)</th>
                {experimentsList.map((idx) => (
                  <th key={idx} colSpan={2} style={{ padding: "10px", borderRight: "1px solid #1e3a5f", color: "#60a5fa", fontWeight: "600" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      <span>Experiment {idx + 1}</span>
                      {observations[idx] && (
                        <button onClick={() => onEraseSlot(idx)} style={{ background: "rgba(239, 68, 68, 0.2)", border: "1px solid #ef4444", color: "#f87171", borderRadius: "4px", cursor: "pointer", fontSize: "10px", padding: "2px 6px" }}>✕ Clear</button>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
              <tr style={{ background: "#0b172a", borderBottom: "2px solid #1e3a5f" }}>
                {experimentsList.map((idx) => (
                  <React.Fragment key={idx}>
                    <th style={{ padding: "8px 10px", borderRight: "1px solid #1e293b", fontSize: "12px", color: "#94a3b8", minWidth: "110px" }}>Input Value {idx + 1}</th>
                    <th style={{ padding: "8px 10px", borderRight: "1px solid #1e3a5f", fontSize: "12px", color: "#94a3b8", minWidth: "120px" }}>Observed Value {idx + 1}</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rIdx) => (
                <tr key={rIdx} style={{ background: rIdx % 2 === 0 ? "rgba(15, 23, 42, 0.6)" : "transparent", borderBottom: "1px solid #1e293b" }}>
                  <td style={{ padding: "10px 16px", textAlign: "left", fontWeight: "500", borderRight: "1px solid #1e3a5f", color: "#f8fafc" }}>{row.label}</td>
                  {experimentsList.map((idx) => {
                    const run = observations[idx];
                    const val = run ? run[row.id] : null;
                    return (
                      <React.Fragment key={idx}>
                        <td style={{ padding: "8px 10px", borderRight: "1px solid #1e293b", color: row.type === "input" && val !== null && val !== undefined ? "#cbd5e1" : "#475569" }}>
                          {row.type === "input" && val !== null && val !== undefined ? val : "—"}
                        </td>
                        <td style={{ padding: "8px 10px", borderRight: "1px solid #1e3a5f", color: row.type === "observed" && val !== null && val !== undefined ? "#38bdf8" : "#475569", fontWeight: row.type === "observed" ? "600" : "400" }}>
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
function CalculationsSection({ experiment }) {
  const calculations = {
    rc: {
      title: " Calculations — RC Circuit",
      equations: [
        "Time constant: τ = RC",
        "Charging voltage: Vc = V₀(1 − e⁻ᵗ⧸ᴿᶜ)",
        "Discharging voltage: Vc = V₀e⁻ᵗ⧸ᴿᶜ",
      ],
    },
    hysteresis: {
      title: " Calculations — Hysteresis Loss",
      equations: [
        "Energy loss per unit volume per cycle = Area of B-H loop",
        "Power loss = Energy loss per cycle × Frequency × Volume",
      ],
    },
    string: {
      title: " Calculations — Vibrations on String",
      equations: [
        "Wave velocity: v = √(T/μ)",
        "Wavelength: λ = v/f",
      ],
    },
    impulse: {
      title: " Calculations — Impulse-Momentum",
      equations: [
        "Initial momentum: p = mv",
        "Impulse: J = FΔt",
        "Change in momentum: Δp = p₂ − p₁",
        "For verification: J ≈ Δp",
      ],
    },
    edm: {
      title: " Calculations — Smart ZNC EDM",
      equations: [
        "Material Removal Rate (MRR) = (Initial Weight - Final Weight) / (Time × Density)",
        "Ensure machining time is in minutes and weight difference is converted to volume using the density of the workpiece material.",
      ],
    },
    opamp: {
      title: " Calculations — Operational Amplifier",
      equations: [
        "Inverting Gain (Av) = -(Rf / Rin)",
        "Non-Inverting Gain (Av) = 1 + (Rf / Rin)",
        "Output Voltage: Vout = Av × Vin",
      ],
    },
  };

  const data = calculations[experiment];

  return (
    <div className="info-section">
      <h2>{data.title}</h2>
      <div className="info-card">
        <h3> Calculation Formulae</h3>
        {data.equations.map((equation, index) => (
          <div className="calculation-box" key={index}>
            {equation}
          </div>
        ))}
      </div>
    </div>
  );
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