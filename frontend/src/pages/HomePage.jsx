import React, { useState, useEffect } from "react";

/**
 * HomePage — VAIL 2.0 Landing Page
 * Hero section with atom animation, lab equipment visuals, and About section.
 */
export default function HomePage({ isDark }) {
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
