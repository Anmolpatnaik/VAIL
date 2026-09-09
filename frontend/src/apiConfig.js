/**
 * VAIL API Configuration
 * Supports dynamic production backends via VITE_API_BASE_URL
 * Defaults to local development at http://localhost:8000
 */

const isDev = import.meta.env.DEV;
const envBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const API_BASE_URL = envBaseUrl !== undefined 
  ? envBaseUrl.replace(/\/+$/, "")
  : (isDev ? "http://localhost:8000" : "");

export const ENDPOINTS = {
  // Hysteresis
  hysteresisSimulate: `${API_BASE_URL}/api/hysteresis/simulate`,
  hysteresisHealth: `${API_BASE_URL}/api/hysteresis/health`,

  // Vibration String
  stringSimulate: `${API_BASE_URL}/api/string/simulate`,
  stringFrequency: `${API_BASE_URL}/api/string/frequency`,
  stringModes: `${API_BASE_URL}/api/string/modes`,

  // Impulse & Momentum
  impulseSimulate: `${API_BASE_URL}/api/impulse/simulate`,
  impulseCollision: `${API_BASE_URL}/api/impulse/collision`,

  // RC Circuit
  rcSimulate: `${API_BASE_URL}/api/rc/simulate`,

  // EDM
  edmSimulate: `${API_BASE_URL}/api/edm/simulate`,

  // Op-Amp
  opampSimulate: `${API_BASE_URL}/api/opamp/simulate`,

  // Master health check
  health: `${API_BASE_URL}/health`,
};
