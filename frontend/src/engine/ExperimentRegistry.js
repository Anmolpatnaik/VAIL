/**
 * ExperimentRegistry.js — VAIL 2.0 Engine Core
 * 
 * Central registry that discovers and loads experiment definitions.
 * Each experiment is defined by a config.json alongside its React components.
 * The registry provides a unified API for the rest of the application.
 */

// Import experiment configs
import impulseConfig from '../experiments/impulse-momentum/config.json';
import rcConfig from '../experiments/rc-circuit/config.json';
import hysteresisConfig from '../experiments/hysteresis/config.json';
import stringConfig from '../experiments/vibration-string/config.json';
import edmConfig from '../experiments/edm/config.json';
import opampConfig from '../experiments/opamp/config.json';

// Import experiment simulation components (lazy-loaded for performance)
import React from 'react';

// All 6 experiment configs collected for catalog generation
const allConfigs = [rcConfig, hysteresisConfig, stringConfig, impulseConfig, edmConfig, opampConfig];

import { getDraftExperiments, findPresetOrSynthesize } from './DraftSynthesizerEngine';

const experimentModules = {
  'impulse': {
    config: impulseConfig,
    Simulation: React.lazy(() => import('../impulsemomentum')),
  },
  'rc': {
    config: rcConfig,
    Simulation: React.lazy(() => import('../RCsimulation')),
  },
  'hysteresis': {
    config: hysteresisConfig,
    Simulation: React.lazy(() => import('../Hysteresissimulation')),
  },
  'string': {
    config: stringConfig,
    Simulation: React.lazy(() => import('../vibrationstringsimulation')),
  },
  'edm': {
    config: edmConfig,
    Simulation: React.lazy(() => import('../EDMSimulation')),
  },
  'opamp': {
    config: opampConfig,
    Simulation: React.lazy(() => import('../OpAmpSimulation')),
  },
};

/**
 * EXPERIMENT_PARTS — Standard experiment workflow tabs
 * These define the universal student journey through any experiment.
 * 
 * VAIL 2.0 Target Workflow:
 * Search → Understand → Predict → Configure → Run → Measure → Record → Calculate → Compare → Viva → Assess
 */
export const EXPERIMENT_PARTS = [
  { id: "safety", label: "Safety Measures", icon: "🛡️" },
  { id: "video", label: "Video Guide", icon: "🎥" },
  { id: "theory", label: "Theory", icon: "📖" },
  { id: "procedure", label: "Procedure", icon: "📋" },
  { id: "experiment", label: "Experiment", icon: "🔬" },
  { id: "observations", label: "Observations", icon: "📊" },
  { id: "calculations", label: "Calculations", icon: "🧮" },
  { id: "analysis", label: "Analysis & Validation", icon: "📈" },
  { id: "viva", label: "Viva Questions", icon: "💡" },
  { id: "assessment", label: "Assessment & Grade", icon: "🎓" },
];

/**
 * Get the full experiment catalog for display in the UI.
 * Combines core validated experiments with any user-created or AI-generated drafts.
 */
export function getExperimentCatalog() {
  const core = allConfigs.map(config => ({
    id: config.id,
    branch: config.branch,
    icon: config.icon,
    title: config.title,
    subtitle: config.subtitle,
    description: config.description,
    isDraft: false
  }));

  const drafts = getDraftExperiments().map(draft => ({
    id: draft.id,
    branch: draft.branch || "cse",
    icon: draft.icon || "🔬",
    title: draft.title,
    subtitle: draft.subtitle || "Draft Laboratory",
    description: draft.description || "Custom user-generated laboratory experiment.",
    isDraft: true
  }));

  return [...core, ...drafts];
}

/**
 * Get experiment config by ID.
 * Returns core config or searches custom drafts store.
 */
export function getExperimentConfig(experimentId) {
  const module = experimentModules[experimentId];
  if (module?.config) return module.config;

  return findPresetOrSynthesize(experimentId);
}

/**
 * Get the experiment module (components) by ID.
 */
export function getExperimentModule(experimentId) {
  if (experimentModules[experimentId]) {
    return experimentModules[experimentId];
  }
  const draftConfig = getExperimentConfig(experimentId);
  if (draftConfig) {
    return {
      config: draftConfig,
      isGeneric: true
    };
  }
  return null;
}

/**
 * Get all experiments for a given branch/department.
 */
export function getExperimentsByBranch(branchId) {
  return getExperimentCatalog().filter(exp => exp.branch === branchId);
}

/**
 * Check if an experiment has been fully migrated to the engine architecture.
 */
export function isExperimentMigrated(experimentId) {
  const module = experimentModules[experimentId];
  return module?.config !== null && module?.config !== undefined;
}

export default {
  getExperimentCatalog,
  getExperimentConfig,
  getExperimentModule,
  getExperimentsByBranch,
  isExperimentMigrated,
  EXPERIMENT_PARTS,
};
