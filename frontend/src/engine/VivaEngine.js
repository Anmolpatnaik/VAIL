/**
 * VivaEngine.js — VAIL 2.0 AI Viva Voce Engine
 * Blueprint Reference: Phase 3
 *
 * Client-side intelligent answer evaluation system.
 * Features:
 *   - Fuzzy keyword matching with Levenshtein distance tolerance
 *   - Jaccard + token-overlap similarity scoring
 *   - Adaptive difficulty management
 *   - Progressive hint generation
 *   - Session state tracking with performance analytics
 */

// ─── Text Utilities ──────────────────────────────────────────────────

/**
 * Normalize text for comparison: lowercase, strip punctuation, collapse whitespace.
 */
function normalizeText(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Tokenize text into meaningful words, filtering out common stop words.
 */
const STOP_WORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "shall",
  "should", "may", "might", "can", "could", "must", "to", "of", "in",
  "for", "on", "with", "at", "by", "from", "as", "into", "through",
  "during", "before", "after", "and", "but", "or", "nor", "not", "so",
  "yet", "both", "either", "neither", "each", "every", "all", "any",
  "few", "more", "most", "other", "some", "such", "no", "only", "own",
  "same", "than", "too", "very", "just", "because", "if", "when",
  "where", "how", "what", "which", "who", "whom", "this", "that",
  "these", "those", "it", "its", "they", "them", "their", "we", "us",
  "our", "he", "him", "his", "she", "her", "i", "me", "my", "you",
  "your", "also", "then", "about", "up", "out", "there", "here",
]);

function tokenize(text) {
  const normalized = normalizeText(text);
  return normalized
    .split(" ")
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

// ─── Levenshtein Distance ────────────────────────────────────────────

/**
 * Compute edit distance between two strings (for fuzzy matching).
 */
function levenshteinDistance(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

/**
 * Check if two words are fuzzy-equal (within Levenshtein tolerance).
 * Tolerance: 1 edit for words ≤ 5 chars, 2 edits for longer words.
 */
function fuzzyMatch(word1, word2) {
  if (word1 === word2) return true;
  const tolerance = Math.max(word1.length, word2.length) <= 5 ? 1 : 2;
  return levenshteinDistance(word1, word2) <= tolerance;
}

// ─── Similarity Scoring ─────────────────────────────────────────────

/**
 * Extract key scientific terms from model answer text.
 * Returns an array of important keywords that should appear in student answers.
 */
export function extractKeyTerms(text) {
  const tokens = tokenize(text);
  // Scientific terms tend to be longer and less common
  const scienceTerms = tokens.filter((t) => t.length >= 3);
  // Deduplicate
  return [...new Set(scienceTerms)];
}

/**
 * Calculate Jaccard similarity between two token sets.
 * J(A, B) = |A ∩ B| / |A ∪ B|
 */
function jaccardSimilarity(tokensA, tokensB) {
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  let intersection = 0;

  for (const token of setA) {
    for (const other of setB) {
      if (fuzzyMatch(token, other)) {
        intersection++;
        break;
      }
    }
  }

  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Calculate token overlap: what fraction of model answer keywords appear in student answer.
 * This is recall-oriented — did the student cover the key points?
 */
function tokenOverlap(studentTokens, modelTokens) {
  if (modelTokens.length === 0) return 1;

  let matched = 0;
  for (const modelToken of modelTokens) {
    for (const studentToken of studentTokens) {
      if (fuzzyMatch(modelToken, studentToken)) {
        matched++;
        break;
      }
    }
  }

  return matched / modelTokens.length;
}

/**
 * Combined similarity score between student answer and model answer.
 * Blends Jaccard similarity (30%) and keyword overlap recall (70%).
 *
 * @param {string} studentAnswer - The student's typed answer
 * @param {string} modelAnswer - The expected model answer
 * @returns {number} Score between 0 and 1
 */
export function calculateSimilarity(studentAnswer, modelAnswer) {
  const studentTokens = tokenize(studentAnswer);
  const modelTokens = tokenize(modelAnswer);

  if (studentTokens.length === 0) return 0;
  if (modelTokens.length === 0) return 1;

  const jaccard = jaccardSimilarity(studentTokens, modelTokens);
  const overlap = tokenOverlap(studentTokens, modelTokens);

  // Weighted blend: overlap (recall) matters more than jaccard for assessment
  return 0.3 * jaccard + 0.7 * overlap;
}

// ─── Answer Evaluation ──────────────────────────────────────────────

/**
 * Evaluate a student's free-text answer against the model answer.
 *
 * @param {string} studentAnswer - The student's typed answer
 * @param {string} modelAnswer - The expected model answer from config.json
 * @param {string[]} [keywords] - Optional explicit keywords to check for
 * @returns {{ score: number, percentage: number, grade: string, feedback: string, matchedKeywords: string[], missedKeywords: string[] }}
 */
export function evaluateAnswer(studentAnswer, modelAnswer, keywords = null) {
  const student = normalizeText(studentAnswer);
  const model = normalizeText(modelAnswer);

  // Edge cases
  if (!student || student.length < 3) {
    return {
      score: 0,
      percentage: 0,
      grade: "unanswered",
      feedback: "Please provide an answer to the question.",
      matchedKeywords: [],
      missedKeywords: keywords || extractKeyTerms(modelAnswer),
    };
  }

  // Extract key terms from model answer
  const keyTerms = keywords || extractKeyTerms(modelAnswer);
  const studentTokens = tokenize(studentAnswer);

  // Find matched and missed keywords
  const matchedKeywords = [];
  const missedKeywords = [];

  for (const term of keyTerms) {
    let found = false;
    for (const st of studentTokens) {
      if (fuzzyMatch(term, st)) {
        found = true;
        break;
      }
    }
    if (found) matchedKeywords.push(term);
    else missedKeywords.push(term);
  }

  // Calculate composite similarity
  const similarity = calculateSimilarity(studentAnswer, modelAnswer);

  // Keyword coverage bonus
  const keywordCoverage =
    keyTerms.length > 0 ? matchedKeywords.length / keyTerms.length : 1;

  // Final score: 60% similarity + 40% keyword coverage
  const rawScore = 0.6 * similarity + 0.4 * keywordCoverage;

  // Clamp and convert to percentage
  const percentage = Math.round(Math.min(100, Math.max(0, rawScore * 100)));

  // Grade and feedback
  let grade, feedback;
  if (percentage >= 80) {
    grade = "excellent";
    feedback =
      "Excellent! Your answer demonstrates strong understanding of the concept.";
  } else if (percentage >= 60) {
    grade = "good";
    feedback =
      "Good answer! You covered most key points. Review the highlighted areas for completeness.";
  } else if (percentage >= 40) {
    grade = "partial";
    feedback =
      "Partial understanding shown. Focus on the key concepts you missed.";
  } else if (percentage >= 20) {
    grade = "weak";
    feedback =
      "Your answer needs significant improvement. Review the theory section for this topic.";
  } else {
    grade = "incorrect";
    feedback =
      "The answer does not address the question. Please review the material and try again.";
  }

  return {
    score: rawScore,
    percentage,
    grade,
    feedback,
    matchedKeywords,
    missedKeywords,
  };
}

// ─── Hint Generation ────────────────────────────────────────────────

/**
 * Generate a progressive hint for a question.
 * Attempt 1: General topic hint.
 * Attempt 2+: Reveal partial keywords from the model answer.
 *
 * @param {string} question - The viva question
 * @param {string} modelAnswer - The model answer
 * @param {number} attempt - Current attempt number (1-based)
 * @returns {string} Hint text
 */
export function generateHint(question, modelAnswer, attempt) {
  const keyTerms = extractKeyTerms(modelAnswer);

  if (attempt <= 1) {
    // General conceptual hint
    const firstFewWords = modelAnswer.split(/\s+/).slice(0, 5).join(" ");
    return `Hint: Think about ${firstFewWords}...`;
  }

  // Reveal some keywords
  const revealCount = Math.min(
    Math.ceil(keyTerms.length * 0.4),
    keyTerms.length
  );
  const revealed = keyTerms.slice(0, revealCount);
  return `Key concepts to include: ${revealed.join(", ")}`;
}

// ─── Adaptive Difficulty ────────────────────────────────────────────

/**
 * Adaptive difficulty manager.
 * Tracks performance across questions and adjusts difficulty level.
 */
export class AdaptiveDifficultyManager {
  constructor() {
    this.recentScores = []; // Last N scores for trend analysis
    this.difficultyLevel = "normal"; // "easy", "normal", "hard"
    this.consecutiveHigh = 0;
    this.consecutiveLow = 0;
  }

  /**
   * Record a score and update difficulty.
   * @param {number} percentage - Score 0-100
   */
  recordScore(percentage) {
    this.recentScores.push(percentage);

    if (percentage >= 80) {
      this.consecutiveHigh++;
      this.consecutiveLow = 0;
    } else if (percentage < 40) {
      this.consecutiveLow++;
      this.consecutiveHigh = 0;
    } else {
      this.consecutiveHigh = 0;
      this.consecutiveLow = 0;
    }

    // Advance difficulty
    if (this.consecutiveHigh >= 3 && this.difficultyLevel !== "hard") {
      this.difficultyLevel =
        this.difficultyLevel === "easy" ? "normal" : "hard";
      this.consecutiveHigh = 0;
    }

    // Ease difficulty
    if (this.consecutiveLow >= 2 && this.difficultyLevel !== "easy") {
      this.difficultyLevel =
        this.difficultyLevel === "hard" ? "normal" : "easy";
      this.consecutiveLow = 0;
    }
  }

  getDifficulty() {
    return this.difficultyLevel;
  }

  getAverageScore() {
    if (this.recentScores.length === 0) return 0;
    const sum = this.recentScores.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.recentScores.length);
  }
}

// ─── Viva Session ───────────────────────────────────────────────────

/**
 * Create a new viva session from experiment config questions.
 *
 * @param {Array} questions - Array of {question, answer} or [question, answer] pairs
 * @returns {object} Session state object
 */
export function createVivaSession(questions) {
  const normalizedQuestions = questions.map((q, i) => ({
    id: i,
    question: Array.isArray(q) ? q[0] : q.question,
    modelAnswer: Array.isArray(q) ? q[1] : q.answer,
    keywords: extractKeyTerms(Array.isArray(q) ? q[1] : q.answer),
  }));

  return {
    questions: normalizedQuestions,
    currentIndex: 0,
    results: [],
    attemptsPerQuestion: {},
    startTime: Date.now(),
    isComplete: false,
    difficulty: new AdaptiveDifficultyManager(),
  };
}

/**
 * Submit an answer for the current question.
 *
 * @param {object} session - Viva session state
 * @param {string} answer - Student's answer text
 * @returns {{ evaluation: object, session: object }} Updated session and evaluation result
 */
export function submitAnswer(session, answer) {
  const question = session.questions[session.currentIndex];
  if (!question) return { evaluation: null, session };

  const attemptNum = (session.attemptsPerQuestion[question.id] || 0) + 1;
  const evaluation = evaluateAnswer(answer, question.modelAnswer, question.keywords);

  // Record attempt
  session.attemptsPerQuestion[question.id] = attemptNum;

  // Record result (take best score if multiple attempts)
  const existingResult = session.results.find((r) => r.questionId === question.id);
  if (existingResult) {
    if (evaluation.percentage > existingResult.percentage) {
      existingResult.percentage = evaluation.percentage;
      existingResult.grade = evaluation.grade;
      existingResult.feedback = evaluation.feedback;
      existingResult.studentAnswer = answer;
    }
    existingResult.attempts = attemptNum;
  } else {
    session.results.push({
      questionId: question.id,
      question: question.question,
      modelAnswer: question.modelAnswer,
      studentAnswer: answer,
      percentage: evaluation.percentage,
      grade: evaluation.grade,
      feedback: evaluation.feedback,
      attempts: attemptNum,
    });
  }

  // Update adaptive difficulty
  session.difficulty.recordScore(evaluation.percentage);

  return { evaluation, session };
}

/**
 * Advance to the next question.
 */
export function nextQuestion(session) {
  if (session.currentIndex < session.questions.length - 1) {
    session.currentIndex++;
  } else {
    session.isComplete = true;
  }
  return session;
}

/**
 * Generate the final viva summary.
 *
 * @param {object} session - Completed viva session
 * @returns {object} Summary with overall score, time, strengths, weaknesses
 */
export function getVivaSummary(session) {
  const totalQuestions = session.questions.length;
  const answered = session.results.length;
  const totalScore = session.results.reduce((sum, r) => sum + r.percentage, 0);
  const averageScore = answered > 0 ? Math.round(totalScore / answered) : 0;

  const excellent = session.results.filter((r) => r.grade === "excellent").length;
  const good = session.results.filter((r) => r.grade === "good").length;
  const weak = session.results.filter(
    (r) => r.grade === "weak" || r.grade === "incorrect"
  ).length;

  const timeSpentMs = Date.now() - session.startTime;
  const timeSpentMinutes = Math.round(timeSpentMs / 60000);

  // Identify strong and weak areas
  const strengths = session.results
    .filter((r) => r.percentage >= 70)
    .map((r) => r.question);
  const weaknesses = session.results
    .filter((r) => r.percentage < 50)
    .map((r) => r.question);

  let overallGrade;
  if (averageScore >= 85) overallGrade = "A";
  else if (averageScore >= 75) overallGrade = "B+";
  else if (averageScore >= 65) overallGrade = "B";
  else if (averageScore >= 50) overallGrade = "C";
  else overallGrade = "F";

  return {
    totalQuestions,
    answered,
    averageScore,
    overallGrade,
    excellent,
    good,
    weak,
    timeSpentMinutes,
    strengths,
    weaknesses,
    results: session.results,
    difficultyReached: session.difficulty.getDifficulty(),
  };
}

export default {
  evaluateAnswer,
  calculateSimilarity,
  extractKeyTerms,
  generateHint,
  createVivaSession,
  submitAnswer,
  nextQuestion,
  getVivaSummary,
  AdaptiveDifficultyManager,
};
