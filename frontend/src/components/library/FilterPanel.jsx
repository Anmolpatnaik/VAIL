import React from "react";

/**
 * FilterPanel — Sidebar filter panel for the Experiment Library
 * Provides checkboxes for branch, discipline, and validation status filtering.
 */

const BRANCHES = [
  { id: "cse", label: "CSE", icon: "💻" },
  { id: "mechanical", label: "Mechanical", icon: "⚙️" },
  { id: "ece", label: "ECE", icon: "📡" },
];

const VALIDATION_LEVELS = [
  { id: "experimentally_validated", label: "Exp. Validated", color: "#a855f7" },
  { id: "validated", label: "Validated", color: "#4ade80" },
  { id: "verified", label: "Verified", color: "#38bdf8" },
  { id: "tested", label: "Tested", color: "#fbbf24" },
  { id: "draft", label: "Draft", color: "#94a3b8" },
];

export default function FilterPanel({
  selectedBranches,
  onToggleBranch,
  selectedValidations,
  onToggleValidation,
  totalCount,
  filteredCount,
  isDark,
}) {
  return (
    <aside className="library-filter-panel">
      <div className="library-filter-header">
        <h3>Filters</h3>
        <span className="library-filter-count">
          {filteredCount} of {totalCount}
        </span>
      </div>

      {/* Branch Filter */}
      <div className="library-filter-section">
        <h4>Department</h4>
        {BRANCHES.map((branch) => (
          <label key={branch.id} className="library-filter-checkbox">
            <input
              type="checkbox"
              checked={selectedBranches.includes(branch.id)}
              onChange={() => onToggleBranch(branch.id)}
            />
            <span className="library-filter-checkmark"></span>
            <span className="library-filter-label">
              {branch.icon} {branch.label}
            </span>
          </label>
        ))}
      </div>

      {/* Validation Level Filter */}
      <div className="library-filter-section">
        <h4>Validation Level</h4>
        {VALIDATION_LEVELS.map((level) => (
          <label key={level.id} className="library-filter-checkbox">
            <input
              type="checkbox"
              checked={selectedValidations.includes(level.id)}
              onChange={() => onToggleValidation(level.id)}
            />
            <span className="library-filter-checkmark"></span>
            <span className="library-filter-label">
              <span className="library-filter-dot" style={{ background: level.color }}></span>
              {level.label}
            </span>
          </label>
        ))}
      </div>

      {/* Clear All */}
      {(selectedBranches.length > 0 || selectedValidations.length > 0) && (
        <button
          className="library-filter-clear-btn"
          onClick={() => {
            selectedBranches.forEach(b => onToggleBranch(b));
            selectedValidations.forEach(v => onToggleValidation(v));
          }}
        >
          Clear All Filters
        </button>
      )}
    </aside>
  );
}
