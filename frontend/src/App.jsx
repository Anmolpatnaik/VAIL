import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import "./App.css";

// VAIL 2.0 Layout Components
import GlobalNavbar from "./components/layout/GlobalNavbar";

// VAIL 2.0 Page Components
import HomePage from "./pages/HomePage";
import ExperimentLibraryPage from "./pages/ExperimentLibraryPage";
import BTechBranchesPage from "./pages/BTechBranchesPage";
import BranchExperimentsPage from "./pages/BranchExperimentsPage";
import GenericProgramPage from "./pages/GenericProgramPage";
import SubscriptionsPage from "./pages/SubscriptionsPage";
import ContactPage from "./pages/ContactPage";
import ExperimentPage from "./pages/ExperimentPage";
import Offline404Page from "./Offline404Page";
import GlobalErrorBoundary from "./components/common/GlobalErrorBoundary";

// ============================================================================
// SCROLL RESTORATION ON ROUTE CHANGE
// ============================================================================
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

// ============================================================================
// APP ROOT — ROUTING SHELL
// ============================================================================
function AppContent() {
  const [isDark, setIsDark] = useState(true);
  const location = useLocation();

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
      await fetch(window.location.origin + "/favicon.svg", {
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

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  // Derive view label for 404 page
  const currentViewLabel =
    location.pathname === "/" ? "Portal Home"
    : location.pathname === "/library" ? "Experiment Library"
    : location.pathname.startsWith("/programs/btech") ? "B.Tech Programs"
    : location.pathname === "/subscriptions" ? "Lab Subscriptions"
    : location.pathname === "/contact" ? "Contact Laboratory"
    : location.pathname.startsWith("/experiment/") ? "Virtual Experiment"
    : "Virtual Laboratory Portal";

  return (
    <div className={`app ${isDark ? "dark-theme" : "light-theme"}`}>
      <ScrollToTop />

      {/* Toast Notification when Reconnected */}
      {showOnlineToast && (
        <div className="offline-toast-bar toast-online">
          🟢 Connection Restored! Virtual Lab Portal is back online.
        </div>
      )}

      {/* Permanent upper dashboard on all pages & contexts */}
      <GlobalNavbar isDark={isDark} toggleTheme={toggleTheme} />

      {!isOnline ? (
        <Offline404Page
          isOffline={true}
          currentViewName={currentViewLabel}
          onRetry={handleRetryConnection}
          isDark={isDark}
        />
      ) : (
        /* Route-based page rendering */
        <Routes>
          <Route path="/" element={<HomePage isDark={isDark} />} />
          <Route path="/library" element={<ExperimentLibraryPage isDark={isDark} />} />
          <Route path="/programs/btech" element={<BTechBranchesPage isDark={isDark} />} />
          <Route path="/programs/btech/:branchId" element={<BranchExperimentsPage isDark={isDark} />} />
          <Route path="/programs/mtech" element={<GenericProgramPage title="M.Tech Virtual Laboratory" subtitle="Advanced Postgraduate Experimental Modules" isDark={isDark} />} />
          <Route path="/programs/phd" element={<GenericProgramPage title="Ph.D. Research Portal" subtitle="Doctoral Simulations & Experimental Data Modeling" isDark={isDark} />} />
          <Route path="/subscriptions" element={<SubscriptionsPage isDark={isDark} />} />
          <Route path="/contact" element={<ContactPage isDark={isDark} />} />
          <Route path="/experiment/:experimentId" element={<ExperimentPage />} />
          <Route
            path="*"
            element={
              <Offline404Page
                isOffline={false}
                currentViewName={currentViewLabel}
                onRetry={() => true}
                isDark={isDark}
              />
            }
          />
        </Routes>
      )}
    </div>
  );
}

function App() {
  return (
    <GlobalErrorBoundary>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </GlobalErrorBoundary>
  );
}

export default App;
