import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * GlobalNavbar — VAIL 2.0 Permanent Upper Dashboard
 * Shown across all pages and contexts:
 * Virtual Lab Logo | Theme Toggle | Home | Degree Programs | About Lab | Subscriptions | Contact Us
 */
export default function GlobalNavbar({ isDark, toggleTheme }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Derive currentView from URL path for active-state styling
  const pathname = location.pathname;
  const currentView = pathname === "/" ? "home"
    : pathname === "/library" ? "library"
    : pathname.startsWith("/programs/btech") && pathname.split("/").length > 3 ? "branch_experiments"
    : pathname === "/programs/btech" ? "btech_branches"
    : pathname === "/programs/mtech" ? "mtech"
    : pathname === "/programs/phd" ? "phd"
    : pathname === "/subscriptions" ? "subscriptions"
    : pathname === "/contact" ? "contact"
    : pathname.startsWith("/experiment/") ? "experiment"
    : "home";

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

  const handleNavigateHome = () => {
    navigate("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavigateAbout = (e) => {
    if (e) e.preventDefault();
    if (currentView !== "home") {
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById("about");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const el = document.getElementById("about");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleProgramSelect = (program) => {
    setDropdownOpen(false);
    if (program === "btech") {
      navigate("/programs/btech");
    } else if (program === "mtech") {
      navigate("/programs/mtech");
    } else if (program === "phd") {
      navigate("/programs/phd");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
            onClick={handleNavigateHome}
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
            onClick={handleNavigateHome}
            className={currentView === "home" ? "nav-active" : ""}
            style={{
              color: currentView === "home" ? (isDark ? "#38bdf8" : "#0284c7") : (isDark ? "#cbd5e1" : "#334155"),
              fontWeight: currentView === "home" ? "700" : "500",
            }}
          >
            Home
          </button>

          {/* LIBRARY BUTTON */}
          <button
            onClick={() => { navigate("/library"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className={currentView === "library" ? "nav-active" : ""}
            style={{
              background: "transparent",
              border: "none",
              color: currentView === "library" ? (isDark ? "#38bdf8" : "#0284c7") : (isDark ? "#cbd5e1" : "#334155"),
              fontSize: "14px",
              fontWeight: currentView === "library" ? "700" : "600",
              cursor: "pointer",
              padding: "6px 0",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = isDark ? "#f8fafc" : "#0f172a")}
            onMouseLeave={(e) => (e.currentTarget.style.color = currentView === "library" ? (isDark ? "#38bdf8" : "#0284c7") : (isDark ? "#cbd5e1" : "#334155"))}
          >
            Experiment Library
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
                  onClick={() => handleProgramSelect("btech")}
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
                  onClick={() => handleProgramSelect("mtech")}
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
                  onClick={() => handleProgramSelect("phd")}
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

          <a href="#about" onClick={handleNavigateAbout}>
            About Lab
          </a>

          {/* Subscriptions Button */}
          <button
            onClick={() => { navigate("/subscriptions"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
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
            onClick={() => { navigate("/contact"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
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
