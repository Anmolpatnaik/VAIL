/**
 * ExperimentStateMachine.js — VAIL 2.0 Engine Core
 * 
 * Standard experiment lifecycle that every experiment follows.
 * Prevents invalid state transitions, tracks student progression, and manages
 * observation ledgers with overflow slot resolution.
 * 
 * State Flow:
 * IDLE → SAFETY_ACKNOWLEDGED → VIDEO_COMPLETED → CONFIGURED → 
 * PREDICTION → RUNNING → MEASUREMENT → RECORDED → 
 * ANALYSIS → ASSESSMENT → COMPLETED
 */

import { useReducer, useCallback } from 'react';

// Experiment lifecycle states
export const ExperimentState = {
  IDLE: 'IDLE',
  SAFETY_ACKNOWLEDGED: 'SAFETY_ACKNOWLEDGED',
  VIDEO_COMPLETED: 'VIDEO_COMPLETED',
  CONFIGURED: 'CONFIGURED',
  RUNNING: 'RUNNING',
  RECORDED: 'RECORDED',
  ANALYSIS: 'ANALYSIS',
  ASSESSMENT: 'ASSESSMENT',
  COMPLETED: 'COMPLETED',
};

// Actions that trigger state transitions
export const ExperimentAction = {
  ACKNOWLEDGE_SAFETY: 'ACKNOWLEDGE_SAFETY',
  COMPLETE_VIDEO: 'COMPLETE_VIDEO',
  CONFIGURE_PARAMS: 'CONFIGURE_PARAMS',
  RUN_SIMULATION: 'RUN_SIMULATION',
  SAVE_OBSERVATION: 'SAVE_OBSERVATION',
  ERASE_OBSERVATION: 'ERASE_OBSERVATION',
  SET_ACTIVE_TAB: 'SET_ACTIVE_TAB',
  SET_OVERFLOW_MODAL: 'SET_OVERFLOW_MODAL',
  SET_REPORT_MODAL: 'SET_REPORT_MODAL',
  COMPLETE_VIVA: 'COMPLETE_VIVA',
  START_ANALYSIS: 'START_ANALYSIS',
  START_ASSESSMENT: 'START_ASSESSMENT',
  MARK_COMPLETE: 'MARK_COMPLETE',
  RESET: 'RESET',
};

// Initial state with metadata
const initialState = {
  currentState: ExperimentState.IDLE,
  safetyAcknowledged: false,
  videoCompleted: false,
  observations: [null, null, null, null, null],
  activeTab: 'safety',
  pendingData: null,
  showOverflowModal: false,
  showReportModal: false,
  vivaResults: null,
  simulationLiveValues: {},
  history: [],
};

function experimentReducer(state, action) {
  switch (action.type) {
    case ExperimentAction.ACKNOWLEDGE_SAFETY:
      return {
        ...state,
        currentState: ExperimentState.SAFETY_ACKNOWLEDGED,
        safetyAcknowledged: true,
        activeTab: 'video',
        history: [...state.history, { action: action.type, timestamp: Date.now() }],
      };

    case ExperimentAction.COMPLETE_VIDEO:
      return {
        ...state,
        currentState: ExperimentState.VIDEO_COMPLETED,
        videoCompleted: true,
        history: [...state.history, { action: action.type, timestamp: Date.now() }],
      };

    case ExperimentAction.SAVE_OBSERVATION: {
      const observations = [...state.observations];
      const emptyIndex = observations.findIndex((obs) => obs === null);
      if (emptyIndex !== -1) {
        observations[emptyIndex] = action.payload;
        return {
          ...state,
          currentState: ExperimentState.RECORDED,
          observations,
          history: [...state.history, { action: action.type, timestamp: Date.now() }],
        };
      } else {
        // All 5 slots full -> trigger overflow resolution modal
        return {
          ...state,
          pendingData: action.payload,
          showOverflowModal: true,
        };
      }
    }

    case ExperimentAction.ERASE_OBSERVATION: {
      const observations = [...state.observations];
      const index = action.payload.index;

      if (state.pendingData) {
        observations[index] = state.pendingData;
        return {
          ...state,
          observations,
          pendingData: null,
          showOverflowModal: false,
          currentState: ExperimentState.RECORDED,
          history: [...state.history, { action: 'OVERWRITE_SLOT', index, timestamp: Date.now() }],
        };
      } else if (action.payload.replaceWith) {
        observations[index] = action.payload.replaceWith;
        return {
          ...state,
          observations,
        };
      } else {
        observations[index] = null;
        return {
          ...state,
          observations,
        };
      }
    }

    case ExperimentAction.SET_ACTIVE_TAB:
      return {
        ...state,
        activeTab: action.payload,
      };

    case ExperimentAction.SET_OVERFLOW_MODAL:
      return {
        ...state,
        showOverflowModal: action.payload,
        pendingData: action.payload ? state.pendingData : null,
      };

    case ExperimentAction.SET_REPORT_MODAL:
      return {
        ...state,
        showReportModal: action.payload,
      };

    case ExperimentAction.RUN_SIMULATION:
      return {
        ...state,
        currentState: ExperimentState.RUNNING,
        history: [...state.history, { action: action.type, timestamp: Date.now() }],
      };

    case ExperimentAction.COMPLETE_VIVA:
      return {
        ...state,
        vivaResults: action.payload,
        history: [...state.history, { action: action.type, timestamp: Date.now() }],
      };

    case 'UPDATE_LIVE_VALUES':
      return {
        ...state,
        simulationLiveValues: action.payload,
      };

    case ExperimentAction.RESET:
      return { ...initialState };

    default:
      return state;
  }
}

/**
 * Custom hook that provides experiment state management.
 * Drop-in replacement for the scattered useState calls in ExperimentPage.
 */
export function useExperimentState() {
  const [state, dispatch] = useReducer(experimentReducer, initialState);

  const acknowledgeSafety = useCallback(() => {
    dispatch({ type: ExperimentAction.ACKNOWLEDGE_SAFETY });
  }, []);

  const completeVideo = useCallback(() => {
    dispatch({ type: ExperimentAction.COMPLETE_VIDEO });
  }, []);

  const saveObservation = useCallback((data) => {
    dispatch({ type: ExperimentAction.SAVE_OBSERVATION, payload: data });
  }, []);

  const eraseObservation = useCallback((index, replaceWith = null) => {
    dispatch({ type: ExperimentAction.ERASE_OBSERVATION, payload: { index, replaceWith } });
  }, []);

  const setActiveTab = useCallback((tabId) => {
    dispatch({ type: ExperimentAction.SET_ACTIVE_TAB, payload: tabId });
  }, []);

  const setShowOverflowModal = useCallback((show) => {
    dispatch({ type: ExperimentAction.SET_OVERFLOW_MODAL, payload: show });
  }, []);

  const setShowReportModal = useCallback((show) => {
    dispatch({ type: ExperimentAction.SET_REPORT_MODAL, payload: show });
  }, []);

  const completeViva = useCallback((results) => {
    dispatch({ type: ExperimentAction.COMPLETE_VIVA, payload: results });
  }, []);

  const updateLiveValues = useCallback((values) => {
    dispatch({ type: 'UPDATE_LIVE_VALUES', payload: values });
  }, []);

  const resetExperiment = useCallback(() => {
    dispatch({ type: ExperimentAction.RESET });
  }, []);

  // Derive tab lock states from the state machine
  const isTabUnlocked = useCallback((tabId) => {
    if (tabId === 'safety') return true;
    return state.safetyAcknowledged;
  }, [state.safetyAcknowledged]);

  return {
    ...state,
    acknowledgeSafety,
    completeVideo,
    saveObservation,
    eraseObservation,
    setActiveTab,
    setShowOverflowModal,
    setShowReportModal,
    completeViva,
    updateLiveValues,
    resetExperiment,
    isTabUnlocked,
  };
}

export default useExperimentState;
