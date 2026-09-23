import React from "react";

/**
 * SearchBar — Glassmorphism search input with live filtering
 * Used in the Experiment Library for real-time search.
 */
export default function SearchBar({ value, onChange, isDark, placeholder = "Search experiments by name, discipline, or keyword..." }) {
  return (
    <div className="library-search-wrapper">
      <div className="library-search-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
      <input
        type="text"
        className="library-search-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck="false"
      />
      {value && (
        <button
          className="library-search-clear"
          onClick={() => onChange("")}
          title="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}
