import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getExperimentCatalog } from "../engine/ExperimentRegistry";
import { fetchExperimentCatalog } from "../engine/EngineAPI";
import SearchBar from "../components/library/SearchBar";
import ExperimentCard from "../components/library/ExperimentCard";
import FilterPanel from "../components/library/FilterPanel";
import LabAuthoringModal from "../components/authoring/LabAuthoringModal";
import { synthesizeExperimentModel, saveDraftExperiment } from "../engine/DraftSynthesizerEngine";

/**
 * Validation level map from backend engine experiment metadata.
 * Falls back to "tested" for experiments without backend data.
 */
const KNOWN_VALIDATION_LEVELS = {
  rc: "experimentally_validated",
  hysteresis: "verified",
  string: "experimentally_validated",
  impulse: "verified",
  edm: "validated",
  opamp: "experimentally_validated",
};

/**
 * ExperimentLibraryPage — VAIL 2.0 Searchable Experiment Catalog (§4)
 * 
 * Features:
 * - Real-time search by title, discipline, tags, keywords
 * - On-demand generative AI virtual lab synthesizer when 0 matches found
 * - Custom laboratory authoring studio
 * - Filters by department and validation status
 * - Sort by title or discipline
 * - Responsive grid layout
 */
export default function ExperimentLibraryPage({ isDark }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [selectedValidations, setSelectedValidations] = useState([]);
  const [sortBy, setSortBy] = useState("title");
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"
  const [backendValidation, setBackendValidation] = useState({});
  const [isAuthoringOpen, setIsAuthoringOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [catalogVersion, setCatalogVersion] = useState(0);

  // Get experiments from registry (combines core + custom drafts)
  const allExperiments = useMemo(() => getExperimentCatalog(), [catalogVersion]);

  // Optionally enrich with backend validation data
  useEffect(() => {
    fetchExperimentCatalog().then((data) => {
      if (data?.experiments) {
        const validationMap = {};
        data.experiments.forEach((exp) => {
          validationMap[exp.id] = exp.validation_level;
        });
        setBackendValidation(validationMap);
      }
    });
  }, []);

  // Handle instant AI generation for search query
  const handleInstantGenerate = () => {
    if (!searchQuery.trim()) return;
    setIsGenerating(true);
    setTimeout(() => {
      const draft = synthesizeExperimentModel(searchQuery);
      saveDraftExperiment(draft);
      setCatalogVersion((v) => v + 1);
      setIsGenerating(false);
      navigate(`/experiment/${draft.id}`);
    }, 700);
  };

  // Get validation level for an experiment
  const getValidationLevel = (expId) => {
    return backendValidation[expId] || KNOWN_VALIDATION_LEVELS[expId] || "tested";
  };

  // Filter and search logic
  const filteredExperiments = useMemo(() => {
    let result = [...allExperiments];

    // Text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((exp) => {
        return (
          exp.title.toLowerCase().includes(q) ||
          (exp.subtitle && exp.subtitle.toLowerCase().includes(q)) ||
          (exp.description && exp.description.toLowerCase().includes(q)) ||
          exp.id.toLowerCase().includes(q) ||
          (exp.branch && exp.branch.toLowerCase().includes(q))
        );
      });
    }

    // Branch filter
    if (selectedBranches.length > 0) {
      result = result.filter((exp) => selectedBranches.includes(exp.branch));
    }

    // Validation filter
    if (selectedValidations.length > 0) {
      result = result.filter((exp) =>
        selectedValidations.includes(getValidationLevel(exp.id))
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "discipline") return (a.subtitle || "").localeCompare(b.subtitle || "");
      return 0;
    });

    return result;
  }, [allExperiments, searchQuery, selectedBranches, selectedValidations, sortBy, backendValidation]);

  const toggleBranch = (branchId) => {
    setSelectedBranches((prev) =>
      prev.includes(branchId)
        ? prev.filter((b) => b !== branchId)
        : [...prev, branchId]
    );
  };

  const toggleValidation = (level) => {
    setSelectedValidations((prev) =>
      prev.includes(level)
        ? prev.filter((v) => v !== level)
        : [...prev, level]
    );
  };

  return (
    <main className="main-content library-page">
      {/* Page Header */}
      <div className="library-page-header">
        <button className="back-btn" onClick={() => navigate("/")}>
          ← Back to Portal
        </button>
        <div className="library-hero">
          <span className="library-hero-badge">VAIL 2.0 ENGINE</span>
          <h1 className="library-hero-title">Experiment Library</h1>
          <p className="library-hero-subtitle">
            Search, explore, and launch validated virtual laboratories across all engineering disciplines—or synthesize your own.
          </p>
        </div>

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          isDark={isDark}
        />

        {/* Controls Bar */}
        <div className="library-controls-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="library-sort-controls">
            <label>Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="library-sort-select"
            >
              <option value="title">Title (A–Z)</option>
              <option value="discipline">Discipline</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={() => setIsAuthoringOpen(true)}
              style={{
                padding: "8px 14px",
                background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                fontWeight: "700",
                fontSize: "12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 2px 10px rgba(2, 132, 199, 0.3)"
              }}
            >
              ✨ + New Lab Draft
            </button>

            <div className="library-view-toggle">
              <button
                className={viewMode === "grid" ? "active" : ""}
                onClick={() => setViewMode("grid")}
                title="Grid view"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" />
                </svg>
              </button>
              <button
                className={viewMode === "list" ? "active" : ""}
                onClick={() => setViewMode("list")}
                title="List view"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="4" width="18" height="3" rx="1" />
                  <rect x="3" y="10.5" width="18" height="3" rx="1" />
                  <rect x="3" y="17" width="18" height="3" rx="1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="library-content-area">
        {/* Filter Panel */}
        <FilterPanel
          selectedBranches={selectedBranches}
          onToggleBranch={toggleBranch}
          selectedValidations={selectedValidations}
          onToggleValidation={toggleValidation}
          totalCount={allExperiments.length}
          filteredCount={filteredExperiments.length}
          isDark={isDark}
        />

        {/* Experiment Grid / List */}
        <div className={`library-experiments-container ${viewMode}`}>
          {filteredExperiments.length === 0 ? (
            searchQuery.trim() ? (
              /* ─── ON-DEMAND GENERATIVE DRAFT CARD ─── */
              <div
                style={{
                  gridColumn: "1 / -1",
                  background: "linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.8) 100%)",
                  border: "1px solid rgba(56, 189, 248, 0.4)",
                  borderRadius: "20px",
                  padding: "36px 28px",
                  textAlign: "center",
                  boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(56, 189, 248, 0.15)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "14px"
                }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "16px",
                    background: "linear-gradient(135deg, #0284c7, #38bdf8)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "28px",
                    boxShadow: "0 4px 20px rgba(56, 189, 248, 0.4)"
                  }}
                >
                  ⚡
                </div>

                <div style={{ maxWidth: "560px" }}>
                  <h3 style={{ margin: "0 0 8px 0", fontSize: "20px", color: "#f8fafc" }}>
                    Experiment Not In Official Catalog: <span style={{ color: "#38bdf8" }}>"{searchQuery}"</span>
                  </h3>
                  <p style={{ margin: 0, fontSize: "14px", color: "#94a3b8", lineHeight: "1.6" }}>
                    The <strong>VAIL Engine</strong> can synthesize a complete, interactive virtual laboratory bench from scientific principles for this experiment right now.
                  </p>
                </div>

                {/* Generative Action Buttons */}
                <div style={{ display: "flex", gap: "12px", marginTop: "10px", flexWrap: "wrap", justifyContent: "center" }}>
                  <button
                    onClick={handleInstantGenerate}
                    disabled={isGenerating}
                    style={{
                      padding: "12px 24px",
                      background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "12px",
                      fontWeight: "700",
                      fontSize: "14px",
                      cursor: isGenerating ? "not-allowed" : "pointer",
                      boxShadow: "0 4px 20px rgba(2, 132, 199, 0.45)",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "transform 0.15s ease"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  >
                    {isGenerating ? (
                      <>
                        <span>Synthesizing Physics Model...</span>
                        <span className="vail-pulse-dots">● ● ●</span>
                      </>
                    ) : (
                      <>
                        <span>⚡ Generate Lab with VAIL AI</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setIsAuthoringOpen(true)}
                    style={{
                      padding: "12px 20px",
                      background: "rgba(255, 255, 255, 0.08)",
                      color: "#cbd5e1",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      borderRadius: "12px",
                      fontWeight: "600",
                      fontSize: "14px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    ✏️ Author Custom Lab Draft
                  </button>

                  <a
                    href={`mailto:hexascale6@gmail.com?subject=VAIL Virtual Lab Request: ${encodeURIComponent(searchQuery)}&body=Hello VAIL Engineering Team,%0D%0A%0D%0AI would like to request an official validated virtual laboratory module for:%0D%0AExperiment: ${encodeURIComponent(searchQuery)}%0D%0A%0D%0AThank you!`}
                    style={{
                      padding: "12px 20px",
                      background: "rgba(244, 63, 94, 0.12)",
                      color: "#fb7185",
                      border: "1px solid rgba(244, 63, 94, 0.3)",
                      borderRadius: "12px",
                      fontWeight: "600",
                      fontSize: "14px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      textDecoration: "none"
                    }}
                  >
                    ✉️ Request Lab from Team
                  </a>
                </div>

                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                  Need an accredited experiment for your curriculum? Contact our team at <a href="mailto:hexascale6@gmail.com" style={{ color: "#38bdf8" }}>hexascale6@gmail.com</a>
                </div>

                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedBranches([]);
                    setSelectedValidations([]);
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#64748b",
                    fontSize: "12px",
                    cursor: "pointer",
                    textDecoration: "underline",
                    marginTop: "6px"
                  }}
                >
                  Clear search and reset filters
                </button>
              </div>
            ) : (
              <div className="library-empty-state">
                <div className="library-empty-icon">🔬</div>
                <h3>No experiments found</h3>
                <p>Try adjusting your search or filters.</p>
                <button
                  className="library-empty-reset"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedBranches([]);
                    setSelectedValidations([]);
                  }}
                >
                  Reset All Filters
                </button>
              </div>
            )
          ) : (
            filteredExperiments.map((exp) => (
              <ExperimentCard
                key={exp.id}
                experiment={exp}
                validationLevel={getValidationLevel(exp.id)}
                isDark={isDark}
              />
            ))
          )}
        </div>
      </div>

      {/* Lab Authoring Studio Modal */}
      <LabAuthoringModal
        isOpen={isAuthoringOpen}
        onClose={() => setIsAuthoringOpen(false)}
        initialQuery={searchQuery}
        onLabCreated={(newLab) => {
          setCatalogVersion((v) => v + 1);
          navigate(`/experiment/${newLab.id}`);
        }}
      />
    </main>
  );
}

