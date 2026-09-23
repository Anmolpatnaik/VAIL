/**
 * AssessmentEngine.js — VAIL 2.0 Assessment & Grading Engine
 * Blueprint Reference: Phase 3
 *
 * Comprehensive experiment-wide scoring rubric.
 * Components weighted:
 *   - Safety Compliance:     10%
 *   - Observations Quality:  20%
 *   - Calculations Accuracy: 25%
 *   - Analysis Depth:        20%
 *   - Viva Performance:      25%
 *
 * Grade Bands:
 *   A+ (≥95%), A (≥85%), B+ (≥75%), B (≥65%), C (≥50%), F (<50%)
 */

// ─── Grade Bands ────────────────────────────────────────────────────

const GRADE_BANDS = [
  { min: 95, grade: "A+", label: "Outstanding", color: "#22c55e" },
  { min: 85, grade: "A",  label: "Excellent",    color: "#4ade80" },
  { min: 75, grade: "B+", label: "Very Good",    color: "#38bdf8" },
  { min: 65, grade: "B",  label: "Good",         color: "#60a5fa" },
  { min: 50, grade: "C",  label: "Satisfactory", color: "#fbbf24" },
  { min: 0,  grade: "F",  label: "Needs Work",   color: "#ef4444" },
];

/**
 * Map a percentage score to a letter grade.
 */
export function getGrade(percentage) {
  for (const band of GRADE_BANDS) {
    if (percentage >= band.min) return band;
  }
  return GRADE_BANDS[GRADE_BANDS.length - 1];
}

// ─── Component Weights ──────────────────────────────────────────────

export const RUBRIC_WEIGHTS = {
  safety:       0.10,
  observations: 0.20,
  calculations: 0.25,
  analysis:     0.20,
  viva:         0.25,
};

// ─── Safety Evaluation (10%) ────────────────────────────────────────

/**
 * Evaluate safety compliance.
 * Binary: 100% if acknowledged, 0% if not.
 *
 * @param {boolean} safetyAcknowledged
 * @returns {{ score: number, maxScore: number, percentage: number, feedback: string }}
 */
export function evaluateSafety(safetyAcknowledged) {
  const percentage = safetyAcknowledged ? 100 : 0;
  return {
    score: percentage,
    maxScore: 100,
    percentage,
    feedback: safetyAcknowledged
      ? "Safety protocols acknowledged before experimentation."
      : "Safety protocols were NOT acknowledged. This is a critical requirement in any laboratory.",
    details: {
      acknowledged: safetyAcknowledged,
    },
  };
}

// ─── Observations Evaluation (20%) ──────────────────────────────────

/**
 * Evaluate observation quality.
 * Checks: completeness (slots filled), data reasonableness, measurement count.
 *
 * @param {Array} observations - Array of 5 observation slots (null = empty)
 * @param {string} experiment - Experiment ID
 * @returns {{ score: number, maxScore: number, percentage: number, feedback: string, details: object }}
 */
export function evaluateObservations(observations, experiment) {
  const totalSlots = 5;
  const filledSlots = observations.filter((obs) => obs !== null).length;

  // Completeness score (0-50%)
  const completenessScore = (filledSlots / totalSlots) * 50;

  // Data quality score (0-50%): check if values are non-empty and numeric where expected
  let qualityScore = 0;
  const filledObs = observations.filter((obs) => obs !== null);

  if (filledObs.length > 0) {
    let validValues = 0;
    let totalValues = 0;

    for (const obs of filledObs) {
      for (const [key, value] of Object.entries(obs)) {
        totalValues++;
        // Check if value is present and looks reasonable
        const strVal = String(value).trim();
        if (strVal && strVal !== "0" && strVal !== "undefined" && strVal !== "null") {
          validValues++;
        }
      }
    }

    qualityScore = totalValues > 0 ? (validValues / totalValues) * 50 : 0;
  }

  const percentage = Math.round(completenessScore + qualityScore);

  let feedback;
  if (filledSlots === 0) {
    feedback = "No observations recorded. Complete at least 3 experimental runs for meaningful analysis.";
  } else if (filledSlots < 3) {
    feedback = `Only ${filledSlots} of 5 observation slots filled. More data points improve statistical reliability.`;
  } else if (filledSlots < 5) {
    feedback = `${filledSlots} observations recorded. Consider filling all 5 slots for comprehensive data.`;
  } else {
    feedback = "All 5 observation slots filled. Excellent data collection practice.";
  }

  return {
    score: percentage,
    maxScore: 100,
    percentage,
    feedback,
    details: {
      filledSlots,
      totalSlots,
      completenessPercent: Math.round((filledSlots / totalSlots) * 100),
      qualityPercent: Math.round(qualityScore * 2),
    },
  };
}

// ─── Calculations Evaluation (25%) ──────────────────────────────────

/**
 * Evaluate calculation accuracy.
 * Checks if student has performed calculations and if they have reasonable observation data.
 *
 * @param {Array} observations
 * @param {string} experiment
 * @returns {{ score: number, maxScore: number, percentage: number, feedback: string, details: object }}
 */
export function evaluateCalculations(observations, experiment) {
  const filledObs = observations.filter((obs) => obs !== null);

  if (filledObs.length === 0) {
    return {
      score: 0,
      maxScore: 100,
      percentage: 0,
      feedback: "No calculations possible without observation data. Record experimental readings first.",
      details: { hasData: false, calculationsPerformed: false },
    };
  }

  // Check data fields present per experiment
  const expectedFields = getExpectedFields(experiment);
  let fieldsPresent = 0;
  let fieldsTotal = expectedFields.length;

  if (fieldsTotal > 0 && filledObs.length > 0) {
    const firstObs = filledObs[0];
    for (const field of expectedFields) {
      if (firstObs[field] !== undefined && firstObs[field] !== null) {
        fieldsPresent++;
      }
    }
  }

  const dataCompleteness = fieldsTotal > 0 ? fieldsPresent / fieldsTotal : 0.5;

  // Score based on: observation count (40%) + data field completeness (60%)
  const obsCountScore = Math.min(filledObs.length / 3, 1) * 40;
  const fieldScore = dataCompleteness * 60;
  const percentage = Math.round(obsCountScore + fieldScore);

  let feedback;
  if (percentage >= 80) {
    feedback = "Calculations are comprehensive with well-recorded data fields.";
  } else if (percentage >= 50) {
    feedback = "Calculations partially complete. Ensure all required fields are filled.";
  } else {
    feedback = "Insufficient data for reliable calculations. Record more observations.";
  }

  return {
    score: percentage,
    maxScore: 100,
    percentage,
    feedback,
    details: {
      hasData: true,
      observationCount: filledObs.length,
      expectedFields,
      fieldsPresent,
      dataCompleteness: Math.round(dataCompleteness * 100),
    },
  };
}

/**
 * Get expected observation fields for each experiment.
 */
function getExpectedFields(experiment) {
  switch (experiment) {
    case "rc":
      return ["voltage", "resistance", "capacitance", "tau", "vc", "current"];
    case "hysteresis":
      return ["maxH", "freq", "maxB", "loopArea", "loss"];
    case "string":
      return ["tension", "frequency", "wavelength"];
    case "impulse":
      return ["v1", "v2", "p1", "p2"];
    case "edm":
      return ["current", "voltage", "pulseOn", "mrr", "depth"];
    case "opamp":
      return ["vin", "vout", "gain"];
    default:
      return [];
  }
}

// ─── Analysis Evaluation (20%) ──────────────────────────────────────

/**
 * Evaluate analysis depth.
 * Checks if the student has sufficient data for meaningful analysis.
 *
 * @param {Array} observations
 * @param {string} experiment
 * @returns {{ score: number, maxScore: number, percentage: number, feedback: string, details: object }}
 */
export function evaluateAnalysis(observations, experiment) {
  const filledObs = observations.filter((obs) => obs !== null);

  if (filledObs.length === 0) {
    return {
      score: 0,
      maxScore: 100,
      percentage: 0,
      feedback: "No analysis possible without observation data. Complete the experiment first.",
      details: { hasData: false },
    };
  }

  // Analysis score based on observation count and data quality
  // 3+ observations enables meaningful comparison → base score
  const obsScore = Math.min(filledObs.length / 3, 1) * 60;

  // Check for variety in measurements (not all identical values)
  let varietyScore = 0;
  if (filledObs.length >= 2) {
    const firstObs = JSON.stringify(filledObs[0]);
    const hasVariety = filledObs.some((obs) => JSON.stringify(obs) !== firstObs);
    varietyScore = hasVariety ? 40 : 20;
  } else {
    varietyScore = 15;
  }

  const percentage = Math.round(obsScore + varietyScore);

  let feedback;
  if (percentage >= 80) {
    feedback = "Strong analytical foundation with sufficient data for theoretical comparison.";
  } else if (percentage >= 50) {
    feedback = "Adequate data for basic analysis. More varied observations would strengthen conclusions.";
  } else {
    feedback = "Insufficient observations for meaningful analysis. Record more data points.";
  }

  return {
    score: percentage,
    maxScore: 100,
    percentage,
    feedback,
    details: {
      hasData: true,
      observationCount: filledObs.length,
      hasVariety: filledObs.length >= 2,
    },
  };
}

// ─── Viva Evaluation (25%) ──────────────────────────────────────────

/**
 * Evaluate viva performance from viva session results.
 *
 * @param {object|null} vivaResults - From VivaEngine.getVivaSummary()
 * @returns {{ score: number, maxScore: number, percentage: number, feedback: string, details: object }}
 */
export function evaluateViva(vivaResults) {
  if (!vivaResults || !vivaResults.results || vivaResults.results.length === 0) {
    return {
      score: 0,
      maxScore: 100,
      percentage: 0,
      feedback: "Viva voce not completed. Answer the viva questions to receive your full assessment.",
      details: { completed: false },
    };
  }

  const percentage = vivaResults.averageScore || 0;

  let feedback;
  if (percentage >= 80) {
    feedback = `Excellent viva performance (${vivaResults.overallGrade}). Strong conceptual understanding demonstrated.`;
  } else if (percentage >= 60) {
    feedback = `Good viva performance. ${vivaResults.weak || 0} question(s) need review.`;
  } else if (percentage >= 40) {
    feedback = "Partial understanding in viva. Review theory for the topics you struggled with.";
  } else {
    feedback = "Viva performance needs significant improvement. Revisit the theory section.";
  }

  return {
    score: percentage,
    maxScore: 100,
    percentage,
    feedback,
    details: {
      completed: true,
      averageScore: vivaResults.averageScore,
      totalQuestions: vivaResults.totalQuestions,
      answered: vivaResults.answered,
      overallGrade: vivaResults.overallGrade,
      excellent: vivaResults.excellent,
      good: vivaResults.good,
      weak: vivaResults.weak,
    },
  };
}

// ─── Overall Grade ──────────────────────────────────────────────────

/**
 * Compute the overall experiment grade from all component evaluations.
 *
 * @param {object} components - { safety, observations, calculations, analysis, viva }
 * @returns {{ overallPercentage: number, overallGrade: object, components: object, recommendations: string[] }}
 */
export function computeOverallGrade(components) {
  const safetyResult = components.safety || { percentage: 0 };
  const obsResult = components.observations || { percentage: 0 };
  const calcResult = components.calculations || { percentage: 0 };
  const analysisResult = components.analysis || { percentage: 0 };
  const vivaResult = components.viva || { percentage: 0 };

  const weightedScore =
    safetyResult.percentage * RUBRIC_WEIGHTS.safety +
    obsResult.percentage * RUBRIC_WEIGHTS.observations +
    calcResult.percentage * RUBRIC_WEIGHTS.calculations +
    analysisResult.percentage * RUBRIC_WEIGHTS.analysis +
    vivaResult.percentage * RUBRIC_WEIGHTS.viva;

  const overallPercentage = Math.round(weightedScore);
  const overallGrade = getGrade(overallPercentage);

  // Generate recommendations based on weak areas
  const recommendations = [];
  const componentScores = [
    { name: "Safety", pct: safetyResult.percentage, weight: "10%" },
    { name: "Observations", pct: obsResult.percentage, weight: "20%" },
    { name: "Calculations", pct: calcResult.percentage, weight: "25%" },
    { name: "Analysis", pct: analysisResult.percentage, weight: "20%" },
    { name: "Viva", pct: vivaResult.percentage, weight: "25%" },
  ];

  for (const comp of componentScores) {
    if (comp.pct < 50) {
      recommendations.push(
        `Improve ${comp.name} (currently ${comp.pct}%, weight: ${comp.weight}): This is significantly below the passing threshold.`
      );
    } else if (comp.pct < 70) {
      recommendations.push(
        `Strengthen ${comp.name} (currently ${comp.pct}%): There is room for improvement.`
      );
    }
  }

  if (recommendations.length === 0) {
    recommendations.push("Excellent work across all components! Keep it up.");
  }

  return {
    overallPercentage,
    overallGrade,
    components: {
      safety: safetyResult,
      observations: obsResult,
      calculations: calcResult,
      analysis: analysisResult,
      viva: vivaResult,
    },
    recommendations,
    timestamp: new Date().toISOString(),
  };
}

// ─── Certificate Data ───────────────────────────────────────────────

/**
 * Generate structured certificate data for rendering.
 *
 * @param {string} experiment - Experiment ID
 * @param {string} experimentTitle - Human-readable experiment title
 * @param {object} studentInfo - { name, rollNumber, institution, branch, year }
 * @param {object} gradeResult - From computeOverallGrade()
 * @returns {object} Certificate data
 */
export function generateCertificateData(
  experiment,
  experimentTitle,
  studentInfo,
  gradeResult
) {
  const date = new Date();
  const formattedDate = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Simple verification hash
  const hashInput = `${studentInfo.name}-${studentInfo.rollNumber}-${experiment}-${gradeResult.overallPercentage}-${date.toISOString().split("T")[0]}`;
  const verificationCode = btoa(hashInput).slice(0, 16).toUpperCase();

  return {
    title: "Virtual Laboratory Experiment Completion Certificate",
    institution: studentInfo.institution || "Faculty of Engineering & Technology",
    experimentTitle,
    experimentId: experiment,
    student: {
      name: studentInfo.name || "Student",
      rollNumber: studentInfo.rollNumber || "N/A",
      branch: studentInfo.branch || "Engineering",
      year: studentInfo.year || "B.Tech",
    },
    grade: gradeResult.overallGrade,
    percentage: gradeResult.overallPercentage,
    components: gradeResult.components,
    date: formattedDate,
    verificationCode,
    platform: "VAIL 2.0 — Virtual AI Instrumentation Laboratory",
  };
}

// ─── Full Assessment Runner ─────────────────────────────────────────

/**
 * Run the full assessment for an experiment.
 *
 * @param {object} params
 * @param {boolean} params.safetyAcknowledged
 * @param {Array} params.observations
 * @param {string} params.experiment
 * @param {object|null} params.vivaResults
 * @returns {object} Complete assessment result
 */
export function runFullAssessment({
  safetyAcknowledged,
  observations,
  experiment,
  vivaResults,
}) {
  const safety = evaluateSafety(safetyAcknowledged);
  const obs = evaluateObservations(observations, experiment);
  const calc = evaluateCalculations(observations, experiment);
  const analysis = evaluateAnalysis(observations, experiment);
  const viva = evaluateViva(vivaResults);

  return computeOverallGrade({
    safety,
    observations: obs,
    calculations: calc,
    analysis,
    viva,
  });
}

export default {
  evaluateSafety,
  evaluateObservations,
  evaluateCalculations,
  evaluateAnalysis,
  evaluateViva,
  computeOverallGrade,
  generateCertificateData,
  runFullAssessment,
  getGrade,
  RUBRIC_WEIGHTS,
  GRADE_BANDS,
};
