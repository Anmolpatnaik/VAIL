/**
 * EngineAPI.js — VAIL 2.0 Frontend Engine API Client
 * 
 * Connects the frontend to the backend physics engine endpoints.
 * Provides standardized methods for:
 *   - Fetching experiment catalog (metadata for all experiments)
 *   - Fetching experiment schema & metadata
 *   - Checking validation status
 *   - Running physics computation
 */

import { API_BASE_URL, ENDPOINTS } from "../apiConfig";

/**
 * Fetch metadata for all registered experiments from the backend engine.
 * @returns {Promise<{success: boolean, count: number, experiments: Array}>}
 */
export async function fetchExperimentCatalog() {
  try {
    const response = await fetch(ENDPOINTS.experiments);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn("[EngineAPI] Failed to fetch catalog from backend, using local configs:", error.message);
    return null;
  }
}

/**
 * Fetch detailed info and parameter schema for a specific experiment.
 * @param {string} experimentId - The experiment identifier (e.g., "rc", "hysteresis")
 * @returns {Promise<{success: boolean, metadata: object, parameter_schema: object}>}
 */
export async function fetchExperimentInfo(experimentId) {
  try {
    const response = await fetch(ENDPOINTS.experimentInfo(experimentId));
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn(`[EngineAPI] Failed to fetch info for '${experimentId}':`, error.message);
    return null;
  }
}

/**
 * Check the validation status and rigor level of an experiment.
 * @param {string} experimentId
 * @returns {Promise<{success: boolean, experiment_id: string, validation_level: string, version: string}>}
 */
export async function fetchValidationStatus(experimentId) {
  try {
    const response = await fetch(`${ENDPOINTS.experimentInfo(experimentId)}/validate`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn(`[EngineAPI] Failed to fetch validation for '${experimentId}':`, error.message);
    return null;
  }
}

/**
 * Execute standardized physics computation for a registered experiment.
 * @param {string} experimentId - The experiment identifier
 * @param {object} params - Physics parameters (e.g., { voltage: 10, resistance: 1000, ... })
 * @returns {Promise<{success: boolean, experiment_id: string, results: object, validation: object}>}
 */
export async function computeExperiment(experimentId, params) {
  try {
    const response = await fetch(ENDPOINTS.experimentCompute(experimentId), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`[EngineAPI] Computation failed for '${experimentId}':`, error.message);
    throw error;
  }
}

/**
 * Fetch calibrated hardware reference benchmark dataset.
 * @param {string} experimentId
 * @returns {Promise<{success: boolean, reference_data: object}>}
 */
export async function fetchReferenceData(experimentId) {
  try {
    const response = await fetch(`${ENDPOINTS.experimentInfo(experimentId)}/reference-data`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn(`[EngineAPI] Failed to fetch reference data for '${experimentId}':`, error.message);
    return null;
  }
}

/**
 * Run full Level 1-3 validation audit against student parameters & results.
 * @param {string} experimentId
 * @param {object} params
 * @param {object} results
 * @returns {Promise<{success: boolean, report: object}>}
 */
export async function validateResults(experimentId, params, results = null) {
  try {
    const response = await fetch(`${ENDPOINTS.experimentInfo(experimentId)}/validate-results`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ params, results }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn(`[EngineAPI] Validation request failed for '${experimentId}':`, error.message);
    return null;
  }
}

/**
 * Request server-side instrument measurement with resolution, noise, and uncertainty.
 * @param {string} experimentId
 * @param {number} value
 * @param {string} instrumentType
 * @param {boolean} isRealistic
 * @param {number} tolerance
 */
export async function simulateMeasurement(experimentId, value, instrumentType = "multimeter_dcv", isRealistic = true, tolerance = 0.0) {
  try {
    const response = await fetch(`${ENDPOINTS.experimentInfo(experimentId)}/measure`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        value,
        instrument_type: instrumentType,
        is_realistic: isRealistic,
        component_tolerance: tolerance,
      }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn(`[EngineAPI] Measurement API failed for '${experimentId}':`, error.message);
    return null;
  }
}

/**
 * Check if the backend engine is healthy and reachable.
 * @returns {Promise<boolean>}
 */
export async function checkEngineHealth() {
  try {
    const response = await fetch(ENDPOINTS.health, { method: "GET" });
    return response.ok;
  } catch {
    return false;
  }
}

export default {
  fetchExperimentCatalog,
  fetchExperimentInfo,
  fetchValidationStatus,
  computeExperiment,
  fetchReferenceData,
  validateResults,
  simulateMeasurement,
  checkEngineHealth,
};
