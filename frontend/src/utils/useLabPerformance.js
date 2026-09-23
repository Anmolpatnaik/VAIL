import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "vail_graphics_mode";
const EVENT_NAME = "vail_graphics_mode_change";

/**
 * useLabPerformance
 * 
 * Provides unified graphics performance management across all virtual lab experiments:
 * - "2d" (Eco Mode): Lightweight Canvas 2D schematics with 0% GPU load, instant load times, zero WebGL overhead.
 * - "3d" (Full 3D Mode): Three.js WebGL scenes optimized for minimal fill-rate and no context crashes.
 * 
 * Synchronizes across components via localStorage and custom Window events.
 */
export function useLabPerformance() {
  const [mode, setModeState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || "3d";
    } catch {
      return "3d";
    }
  });

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        setModeState(e.newValue);
      }
    };

    const handleCustomChange = (e) => {
      if (e.detail?.mode) {
        setModeState(e.detail.mode);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(EVENT_NAME, handleCustomChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(EVENT_NAME, handleCustomChange);
    };
  }, []);

  const setMode = useCallback((newMode) => {
    const validMode = newMode === "2d" ? "2d" : "3d";
    setModeState(validMode);
    try {
      localStorage.setItem(STORAGE_KEY, validMode);
    } catch (e) {
      console.warn("Could not save graphics mode to localStorage:", e);
    }
    window.dispatchEvent(
      new CustomEvent(EVENT_NAME, { detail: { mode: validMode } })
    );
  }, []);

  const toggleMode = useCallback(() => {
    setMode(mode === "3d" ? "2d" : "3d");
  }, [mode, setMode]);

  return {
    mode,
    isEco: mode === "2d",
    is3D: mode === "3d",
    setMode,
    toggleMode,
  };
}
