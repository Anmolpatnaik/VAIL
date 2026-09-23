import React from "react";
import { useNavigate, useParams } from "react-router-dom";

// VAIL 2.0 Engine
import { getExperimentCatalog, getExperimentConfig, EXPERIMENT_PARTS } from "../engine/ExperimentRegistry";
import { useExperimentState } from "../engine/ExperimentStateMachine";
import { useLabPerformance } from "../utils/useLabPerformance";

// VAIL 2.0 Modular Section Components
import VideoGuideSection from "../components/sections/VideoGuideSection";
import SafetySection from "../components/sections/SafetySection";
import TheorySection from "../components/sections/TheorySection";
import ProcedureSection from "../components/sections/ProcedureSection";
import ObservationsSection from "../components/sections/ObservationsSection";
import CalculationsSection from "../components/sections/CalculationsSection";
import AnalysisSection from "../components/sections/AnalysisSection";
import VivaSection from "../components/sections/VivaSection";
import AssessmentSection from "../components/sections/AssessmentSection";
import InstrumentDock from "../components/instruments/InstrumentDock";

// Simulation components (lazy-loaded for high performance & isolated chunking)
const RCSimulation = React.lazy(() => import("../RCsimulation"));
const HysteresisSimulation = React.lazy(() => import("../Hysteresissimulation"));
const VibrationStringSimulation = React.lazy(() => import("../vibrationstringsimulation"));
const ImpulseMomentum = React.lazy(() => import("../impulsemomentum"));
const EDMSimulation = React.lazy(() => import("../EDMSimulation"));
const OpAmpSimulation = React.lazy(() => import("../OpAmpSimulation"));
import LabReportModal from "../LabReportModal";
import AIAssistantWidget from "../components/assistant/AIAssistantWidget";
import GenericLabRenderer from "../components/runtime/GenericLabRenderer";
import GlobalErrorBoundary from "../components/common/GlobalErrorBoundary";

function SimulationLoader() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "420px",
        background: "rgba(15, 23, 42, 0.45)",
        backdropFilter: "blur(8px)",
        borderRadius: "16px",
        border: "1px dashed rgba(56, 189, 248, 0.35)",
        color: "#38bdf8",
        gap: "18px",
        padding: "32px",
      }}
    >
      <div
        style={{
          width: "44px",
          height: "44px",
          border: "3px solid rgba(56, 189, 248, 0.2)",
          borderTopColor: "#38bdf8",
          borderRadius: "50%",
          animation: "spin 0.9s linear infinite",
        }}
      />
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "16px", fontWeight: "700", color: "#f8fafc", marginBottom: "4px" }}>
          Loading Virtual Physics Rig...
        </div>
        <div style={{ fontSize: "13px", color: "#94a3b8" }}>
          Initializing 3D simulation canvas & instrument telemetry
        </div>
      </div>
    </div>
  );
}

/**
 * ExperimentPage — VAIL 2.0 Core Experiment Workspace
 * 
 * The main experiment workspace with sidebar navigation and section rendering.
 * Uses the ExperimentStateMachine for state management and EXPERIMENT_PARTS
 * for the standard workflow tabs.
 */
export default function ExperimentPage() {
  const navigate = useNavigate();
  const { experimentId } = useParams();
  const experiment = experimentId;

  const experiments = getExperimentCatalog();

  const {
    activeTab,
    safetyAcknowledged,
    videoCompleted,
    observations,
    vivaResults,
    simulationLiveValues,
    showOverflowModal,
    showReportModal,
    acknowledgeSafety,
    completeVideo,
    saveObservation,
    eraseObservation,
    setActiveTab,
    setShowOverflowModal,
    setShowReportModal,
    completeViva,
    updateLiveValues,
    isTabUnlocked,
  } = useExperimentState();

  const currentConfig = getExperimentConfig(experiment);
  const currentExperiment = experiments.find((e) => e.id === experiment) || currentConfig;
  const isDraftExp = Boolean(currentExperiment?.isDraft || experiment?.startsWith("draft-"));
  const { mode: graphicsMode, setMode: setGraphicsMode } = useLabPerformance();

  // Physical safety agreement check state (must be ticked manually before Next unlocks)
  const [safetyAgreed, setSafetyAgreed] = React.useState(false);
  const isSafetyAccepted = Boolean(safetyAcknowledged || safetyAgreed);

  const tabs = EXPERIMENT_PARTS.map((part) => ({
    ...part,
    unlocked: isDraftExp ? true : isSafetyAccepted || isTabUnlocked(part.id),
  }));

  // Auto-switch to experiment workbench for drafts so user sees the working simulation immediately
  React.useEffect(() => {
    if (isDraftExp && (activeTab === "safety" || activeTab === "video")) {
      setActiveTab("experiment");
    }
  }, [isDraftExp, experiment, activeTab, setActiveTab]);

  // Step navigation across experiment workflow tabs and catalog
  const currentTabIndex = EXPERIMENT_PARTS.findIndex((p) => p.id === activeTab);
  const nextTab = currentTabIndex >= 0 && currentTabIndex < EXPERIMENT_PARTS.length - 1
    ? EXPERIMENT_PARTS[currentTabIndex + 1]
    : null;
  const prevTab = currentTabIndex > 0
    ? EXPERIMENT_PARTS[currentTabIndex - 1]
    : null;

  // Next experiment in catalog
  const currentExpIndex = experiments.findIndex((e) => e.id === experiment);
  const nextExperiment = currentExpIndex >= 0 && currentExpIndex < experiments.length - 1
    ? experiments[currentExpIndex + 1]
    : (experiments.length > 1 ? experiments[0] : null);

  // Safety lock guard: Next is disabled on safety tab unless checkbox is physically ticked
  const isSafetyLocked = activeTab === "safety" && !isSafetyAccepted;
  const isNextDisabled = isSafetyLocked;

  const handleNextStep = () => {
    // If on safety tab, user MUST have physically clicked and checked the safety agreement box!
    if (activeTab === "safety") {
      if (!isSafetyAccepted) {
        return; // LOCKED: User must physically tick the agreement checkbox first!
      }
      if (!safetyAcknowledged) {
        acknowledgeSafety();
      }
      setActiveTab("video");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // If on video and not yet completed, complete video tutorial
    if (activeTab === "video") {
      if (!videoCompleted) {
        completeVideo();
      }
      setActiveTab("theory");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (nextTab) {
      setActiveTab(nextTab.id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (nextExperiment) {
      navigate(`/experiment/${nextExperiment.id}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/library");
    }
  };

  const handlePrevStep = () => {
    if (prevTab) {
      setActiveTab(prevTab.id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Live values: use simulation state if available, fallback to defaults
  const getExperimentLiveValues = () => {
    if (simulationLiveValues && Object.keys(simulationLiveValues).length > 0) {
      return simulationLiveValues;
    }
    switch (experiment) {
      case "string":
        return { frequency: 50.0, tension: 4.9, wavelength: 0.8, harmonicMode: 2 };
      case "impulse":
        return { v1: 0.52, v2: 0.49, mass: 0.25 };
      case "hysteresis":
        return { maxH: 500.0, maxB: 1.45, loopArea: 1420.0 };
      case "edm":
        return { depth: 1.25, mrr: 24.5, current: 15.0 };
      case "opamp":
        return { dcv: 10.0, acv: 1.5, res: 10000 };
      case "rc":
      default:
        return { dcv: 6.32, acv: 0.12, dca: 6.32, res: 1000, cap: 1000 };
    }
  };

  const handleInstrumentLog = (data) => {
    if (experiment === "rc") {
      saveObservation({
        voltage: "10.0",
        resistance: "1000",
        capacitance: "1000",
        tau: data.quantity.includes("TIME") ? `${data.measuredValue} s` : "1.000 s",
        vc: data.quantity === "DCV" ? `${data.measuredValue} V` : "6.32 V",
        current: "6.32 mA",
      });
    } else if (experiment === "string") {
      saveObservation({
        tension: data.field === "tension" ? `${data.measuredValue} N` : "4.90 N",
        frequency: data.field === "frequency" ? `${data.measuredValue} Hz` : "50.0 Hz",
        wavelength: data.field === "wavelength" ? `${data.measuredValue} m` : "0.80 m",
      });
    } else if (experiment === "hysteresis") {
      saveObservation({
        maxH: data.field === "maxH" ? data.measuredValue : 500,
        freq: 50,
        maxB: data.field === "maxB" ? data.measuredValue : 1.45,
        loopArea: data.field === "loopArea" ? data.measuredValue : 1420,
        loss: 71.0,
      });
    } else if (experiment === "impulse") {
      saveObservation({
        v1: data.v1 ?? 0.52,
        v2: data.v2 ?? 0.49,
        p1: data.p1 ?? 0.13,
        p2: data.p2 ?? 0.123,
      });
    } else if (experiment === "edm") {
      saveObservation({
        current: 15,
        voltage: 45,
        pulseOn: 100,
        mrr: data.field === "mrr" ? data.measuredValue : 24.5,
        depth: data.field === "depth" ? data.measuredValue : 1.25,
      });
    } else if (experiment === "opamp") {
      saveObservation({
        vin: 1.5,
        vout: data.quantity === "DCV" ? data.measuredValue : 10.0,
        gain: 6.67,
      });
    } else {
      saveObservation({
        ...data,
      });
    }
  };

  return (
    <main className="main-content">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", gap: "12px", flexWrap: "wrap" }}>
        <button className="back-btn" onClick={() => navigate(-1)}>← Back to Experiments</button>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          {/* Graphics & GPU Load Manager */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "rgba(15, 23, 42, 0.75)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "20px",
              padding: "2px 4px",
              gap: "4px",
            }}
          >
            <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", paddingLeft: "8px", paddingRight: "4px" }}>
              Graphics:
            </span>
            <button
              onClick={() => setGraphicsMode("3d")}
              title="Hardware-accelerated 3D environment"
              style={{
                padding: "3px 10px",
                fontSize: "11px",
                fontWeight: "700",
                borderRadius: "14px",
                border: "none",
                background: graphicsMode === "3d" ? "linear-gradient(135deg, #0284c7, #2563eb)" : "transparent",
                color: graphicsMode === "3d" ? "#ffffff" : "#94a3b8",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              🎮 3D View
            </button>
            <button
              onClick={() => setGraphicsMode("2d")}
              title="Ultra-low GPU load, fast 2D schematic mode for all experiments (ideal for low-end GPUs and laptops)"
              style={{
                padding: "3px 10px",
                fontSize: "11px",
                fontWeight: "700",
                borderRadius: "14px",
                border: "none",
                background: graphicsMode === "2d" ? "linear-gradient(135deg, #10b981, #059669)" : "transparent",
                color: graphicsMode === "2d" ? "#ffffff" : "#94a3b8",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              ⚡ Eco Mode (0% GPU)
            </button>
          </div>

          <span
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              background: isSafetyAccepted ? "rgba(34, 197, 94, 0.12)" : "rgba(239, 68, 68, 0.12)",
              border: `1px solid ${isSafetyAccepted ? "#22c55e" : "#ef4444"}`,
              color: isSafetyAccepted ? "#4ade80" : "#f87171",
              fontSize: "12px",
              fontWeight: "700",
              letterSpacing: "0.5px",
            }}
          >
            {isSafetyAccepted
              ? "✅ Modules & Workbench Unlocked"
              : "🔒 Step 1: Check Safety Precautions Box to Unlock"}
          </span>
        </div>
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
            <SafetySection
              experiment={experiment}
              onProceed={() => {
                acknowledgeSafety();
                setActiveTab("video");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              isAcknowledged={safetyAcknowledged}
              agreed={isSafetyAccepted}
              onAgreeChange={setSafetyAgreed}
            />
          )}

          {activeTab === "video" && (
            <VideoGuideSection experiment={experiment} onVideoComplete={completeVideo} isCompleted={videoCompleted} onNext={() => setActiveTab("theory")} />
          )}

          {activeTab === "theory" && <TheorySection experiment={experiment} />}
          {activeTab === "procedure" && <ProcedureSection experiment={experiment} />}

          {activeTab === "experiment" && (
            <>
              <GlobalErrorBoundary isDark={true}>
                <React.Suspense fallback={<SimulationLoader />}>
                  {experiment === "rc" && <RCSimulation onSaveData={saveObservation} onSimulationUpdate={updateLiveValues} />}
                  {experiment === "hysteresis" && <HysteresisSimulation onSaveData={saveObservation} onSimulationUpdate={updateLiveValues} />}
                  {experiment === "string" && <VibrationStringSimulation onSaveData={saveObservation} onSimulationUpdate={updateLiveValues} />}
                  {experiment === "impulse" && <ImpulseMomentum onSaveData={saveObservation} onSimulationUpdate={updateLiveValues} />}
                  {experiment === "edm" && <EDMSimulation onSaveData={saveObservation} onSimulationUpdate={updateLiveValues} />}
                  {experiment === "opamp" && <OpAmpSimulation onSaveData={saveObservation} onSimulationUpdate={updateLiveValues} />}
                  {!["rc", "hysteresis", "string", "impulse", "edm", "opamp"].includes(experiment) && (
                    <GenericLabRenderer
                      config={getExperimentConfig(experiment)}
                      onLiveValuesChange={updateLiveValues}
                      onLogMeasurement={saveObservation}
                    />
                  )}
                </React.Suspense>
              </GlobalErrorBoundary>

              {/* VAIL 2.0 Virtual Instrument Dock (§10) */}
              <InstrumentDock
                experiment={experiment}
                liveValues={getExperimentLiveValues()}
                onLogMeasurement={handleInstrumentLog}
              />
            </>
          )}

          {activeTab === "observations" && (
            <ObservationsSection
              experiment={experiment}
              observations={observations}
              onEraseSlot={eraseObservation}
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
          {activeTab === "analysis" && (
            <AnalysisSection
              experiment={experiment}
              observations={observations}
            />
          )}
          {activeTab === "viva" && <VivaSection experiment={experiment} onVivaComplete={completeViva} />}
          {activeTab === "assessment" && (
            <AssessmentSection
              experiment={experiment}
              experimentTitle={currentExperiment?.title || "Virtual Experiment"}
              observations={observations}
              safetyAcknowledged={safetyAcknowledged}
              vivaResults={vivaResults}
            />
          )}

          {/* BOTTOM STEP NAVIGATION FOOTER */}
          <div className="workspace-nav-footer">
            <button
              className="workspace-nav-btn workspace-nav-btn-prev"
              onClick={handlePrevStep}
              disabled={!prevTab}
              style={{ visibility: prevTab ? "visible" : "hidden" }}
              aria-label="Previous step"
            >
              <span>←</span>
              <span>{prevTab ? prevTab.label : "Previous"}</span>
            </button>

            <div className="workspace-nav-progress">
              <div className="workspace-nav-step-label">
                <span>Step {currentTabIndex + 1} of {EXPERIMENT_PARTS.length}: </span>
                <strong>{EXPERIMENT_PARTS[currentTabIndex]?.label}</strong>
              </div>
              <div className="workspace-nav-pills">
                {EXPERIMENT_PARTS.map((part, idx) => {
                  const isCurrent = idx === currentTabIndex;
                  const isPassed = idx < currentTabIndex;
                  const isLocked = !isDraftExp && !isTabUnlocked(part.id);
                  return (
                    <button
                      key={part.id}
                      className={`workspace-nav-pill ${isCurrent ? "active" : ""} ${isPassed ? "completed" : ""}`}
                      onClick={() => {
                        if (!isLocked) {
                          setActiveTab(part.id);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }
                      }}
                      disabled={isLocked}
                      title={`${part.label} (Step ${idx + 1})${isLocked ? " - Complete prior steps to unlock" : ""}`}
                      aria-label={`Go to step ${idx + 1}: ${part.label}`}
                    />
                  );
                })}
              </div>
            </div>

            <button
              className="workspace-nav-btn workspace-nav-btn-next"
              onClick={handleNextStep}
              disabled={isNextDisabled}
              title={
                isSafetyLocked
                  ? "Please check the safety agreement box above to unlock Next"
                  : nextTab
                    ? `Proceed to ${nextTab.label}`
                    : nextExperiment
                      ? `Proceed to ${nextExperiment.title}`
                      : "Return to Library"
              }
              aria-label="Next step"
            >
              <span>Next</span>
              <span className="workspace-nav-btn-next-sub">
                ({isSafetyLocked ? "Check Box to Unlock" : nextTab ? nextTab.label : nextExperiment ? nextExperiment.title : "Library"})
              </span>
              <span>{isSafetyLocked ? "🔒" : nextTab ? "→" : "🚀"}</span>
            </button>
          </div>
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
                  onClick={() => eraseObservation(idx)}
                  style={{ padding: "10px 0", background: "#1e293b", border: "1px solid #38bdf8", color: "#38bdf8", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}
                >
                  Exp {num}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowOverflowModal(false)}
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

      {/* VAIL AI COPILOT & VIRTUAL DEMONSTRATOR */}
      <AIAssistantWidget
        experimentId={experiment}
        activeTab={activeTab}
        liveValues={getExperimentLiveValues()}
        observations={observations}
      />
    </main>
  );
}
