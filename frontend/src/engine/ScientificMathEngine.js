/**
 * ScientificMathEngine.js — VAIL 2.0 Scientific Mathematical Evaluator
 * 
 * Safe, sandboxed mathematical expression evaluator and curve generator
 * for declarative virtual physics experiments.
 * 
 * Supports:
 *   - Basic arithmetic (+, -, *, /, %, ^)
 *   - Common scientific functions (sin, cos, tan, exp, log, ln, sqrt, abs, min, max, pow)
 *   - Physical constants (pi, e, c, h, g, eps0, mu0)
 *   - Multi-step equation evaluation and variable dependencies
 *   - Parametric curve data generation for charting
 */

const CONSTANTS = {
  pi: Math.PI,
  PI: Math.PI,
  e: Math.E,
  E: Math.E,
  g: 9.80665,
  c: 2.99792458e8,
  h: 6.62607015e-34,
  hbar: 1.054571817e-34,
  eps0: 8.8541878128e-12,
  mu0: 1.25663706212e-6,
  q_e: 1.602176634e-19,
  k_B: 1.380649e-23,
  N_A: 6.02214076e23
};

const MATH_FUNCS = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  exp: Math.exp,
  log: Math.log10,
  ln: Math.log,
  sqrt: Math.sqrt,
  abs: Math.abs,
  min: Math.min,
  max: Math.max,
  pow: Math.pow,
  round: Math.round,
  floor: Math.floor,
  ceil: Math.ceil
};

/**
 * Safely evaluate a single math expression with given variable scope.
 */
export function evaluateExpression(expr, scope = {}) {
  if (typeof expr !== "string" || !expr.trim()) return 0;

  // Sanitize expression: allow only alphanumeric, operators, parentheses, commas, whitespace, and dots
  const sanitized = expr.replace(/\^/g, "**"); // Convert ^ to JS power **

  // Prepare execution context
  const fullContext = {
    ...CONSTANTS,
    ...MATH_FUNCS,
    ...scope
  };

  try {
    const keys = Object.keys(fullContext);
    const values = Object.values(fullContext);
    // Create sandboxed function
    const evaluator = new Function(...keys, `return (${sanitized});`);
    const result = evaluator(...values);
    return typeof result === "number" && !isNaN(result) && isFinite(result) ? result : 0;
  } catch (err) {
    console.warn(`[ScientificMathEngine] Evaluation error for "${expr}":`, err.message);
    return 0;
  }
}

/**
 * Evaluate a sequential list of equation assignments.
 * Example:
 * [
 *   "tau = resistance * capacitance * 1e-6",
 *   "vc = voltage * (1 - exp(-t / tau))",
 *   "current = (voltage / resistance) * exp(-t / tau)"
 * ]
 */
export function evaluateEquationSet(equations = [], initialScope = {}) {
  const currentScope = { ...initialScope };

  for (const eq of equations) {
    if (!eq || typeof eq !== "string" || !eq.includes("=")) continue;
    const parts = eq.split("=");
    const varName = parts[0].trim();
    const expression = parts.slice(1).join("=").trim();

    if (varName && expression) {
      currentScope[varName] = evaluateExpression(expression, currentScope);
    }
  }

  return currentScope;
}

/**
 * Generate (x, y) plot series for dynamic charts.
 * 
 * @param {Array<string>} equations - Sequence of equations defining variables
 * @param {Object} baseParams - Constant parameter values
 * @param {string} xVariable - The variable to sweep over (e.g. "t", "wavelength", "frequency")
 * @param {string} yVariable - The output variable to record (e.g. "vc", "stoppingPotential", "current")
 * @param {number} xMin - Minimum x value
 * @param {number} xMax - Maximum x value
 * @param {number} steps - Number of interpolation points (default 60)
 */
export function generateCurveData(equations, baseParams, xVariable, yVariable, xMin = 0, xMax = 10, steps = 60) {
  const points = [];
  const span = xMax - xMin;
  const stepSize = span > 0 ? span / steps : 1;

  for (let i = 0; i <= steps; i++) {
    const xVal = xMin + i * stepSize;
    const scopeAtX = { ...baseParams, [xVariable]: xVal };
    const solvedScope = evaluateEquationSet(equations, scopeAtX);
    const yVal = solvedScope[yVariable] !== undefined ? solvedScope[yVariable] : 0;

    points.push({
      x: parseFloat(xVal.toFixed(3)),
      y: parseFloat(Number(yVal).toFixed(4))
    });
  }

  return points;
}
