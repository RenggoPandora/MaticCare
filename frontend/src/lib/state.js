const SESSION_KEY = 'maticcare_state';

const defaultState = {
  selectedCategoryId: null,
  selectedKeluhanId: null,
  selectedGejalaCodes: [],
  diagnosticResults: null
};

// Initialize or load state
let currentState = { ...defaultState };

try {
  const stored = sessionStorage.getItem(SESSION_KEY);
  if (stored) {
    currentState = JSON.parse(stored);
  }
} catch (e) {
  console.error('Failed to load state from sessionStorage:', e);
}

/**
 * Gets the current state.
 * @returns {Object} Current state object
 */
export function getState() {
  return { ...currentState };
}

/**
 * Updates the state with new values and persists to sessionStorage.
 * @param {Object} updates - Object containing state changes
 */
export function updateState(updates) {
  currentState = { ...currentState, ...updates };
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(currentState));
  } catch (e) {
    console.error('Failed to save state to sessionStorage:', e);
  }
}

/**
 * Resets the state to defaults.
 */
export function resetState() {
  currentState = { ...defaultState };
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(currentState));
  } catch (e) {
    console.error('Failed to reset state in sessionStorage:', e);
  }
}

/**
 * Resets symptoms and results but keeps category and keluhan.
 * Useful for the "Ubah Pilihan Gejala" button flow.
 */
export function resetGejala() {
  currentState.selectedGejalaCodes = [];
  currentState.diagnosticResults = null;
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(currentState));
  } catch (e) {
    console.error('Failed to save state after resetting symptoms:', e);
  }
}
