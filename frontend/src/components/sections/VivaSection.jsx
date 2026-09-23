import React, { useState, useCallback, useRef, useEffect } from "react";
import { getExperimentConfig } from "../../engine/ExperimentRegistry";
import {
  createVivaSession,
  submitAnswer,
  nextQuestion,
  getVivaSummary,
  generateHint,
  AdaptiveDifficultyManager,
} from "../../engine/VivaEngine";

/**
 * Rehydrate session object from localStorage, restoring class instances.
 */
function rehydrateVivaSession(raw) {
  if (!raw) return null;
  const manager = new AdaptiveDifficultyManager();
  if (raw.difficulty) {
    manager.recentScores = Array.isArray(raw.difficulty.recentScores) ? raw.difficulty.recentScores : [];
    manager.difficultyLevel = raw.difficulty.difficultyLevel || "normal";
    manager.consecutiveHigh = raw.difficulty.consecutiveHigh || 0;
    manager.consecutiveLow = raw.difficulty.consecutiveLow || 0;
  }
  return {
    ...raw,
    difficulty: manager,
  };
}

/**
 * VivaSection — VAIL 2.0 AI-Powered Interactive Viva Voce
 *
 * Conversational chat-style viva with:
 *   - Sequential question presentation by a virtual examiner
 *   - Free-text answer evaluation with fuzzy keyword matching
 *   - Color-coded feedback (green/amber/red)
 *   - Progressive hints after incorrect attempts
 *   - Final performance summary with score breakdown
 *   - Persistent chat and session memory via localStorage
 */
export default function VivaSection({ experiment, onVivaComplete }) {
  const config = getExperimentConfig(experiment);
  const questions = config?.viva || [];
  const storageKey = `vail_viva_session_${experiment || "default"}`;

  const [session, setSession] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [currentEvaluation, setCurrentEvaluation] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [vivaSummary, setVivaSummary] = useState(null);
  const [isStarted, setIsStarted] = useState(false);

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Restore previous viva examination on mount or experiment change
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.session && Array.isArray(parsed.chatMessages) && parsed.chatMessages.length > 0) {
          const rehydrated = rehydrateVivaSession(parsed.session);
          setSession(rehydrated);
          setChatMessages(parsed.chatMessages);
          setIsStarted(Boolean(parsed.isStarted));
          setVivaSummary(parsed.vivaSummary || null);
          setCurrentEvaluation(parsed.currentEvaluation || null);
          return;
        }
      }
    } catch (err) {
      console.warn("Could not restore viva session from localStorage:", err);
    }
    // If no saved session, reset to initial unstarted state
    setSession(null);
    setChatMessages([]);
    setIsStarted(false);
    setVivaSummary(null);
    setCurrentEvaluation(null);
  }, [storageKey]);

  // Persist viva session whenever relevant state changes
  useEffect(() => {
    if (isStarted && session) {
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            session,
            chatMessages,
            isStarted,
            vivaSummary,
            currentEvaluation,
          })
        );
      } catch (err) {
        console.warn("Could not persist viva session:", err);
      }
    }
  }, [storageKey, isStarted, session, chatMessages, vivaSummary, currentEvaluation]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleRetake = () => {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
    setIsStarted(false);
    setSession(null);
    setChatMessages([]);
    setVivaSummary(null);
    setCurrentEvaluation(null);
  };

  // Start viva session
  const handleStart = useCallback(() => {
    if (questions.length === 0) return;

    const newSession = createVivaSession(questions);
    setSession(newSession);
    setIsStarted(true);
    setChatMessages([
      {
        type: "system",
        text: "Viva Voce examination is now in session. Answer each question to the best of your understanding.",
      },
      {
        type: "examiner",
        text: `Q1. ${newSession.questions[0].question}`,
        questionIndex: 0,
      },
    ]);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [questions]);

  // Submit answer
  const handleSubmit = useCallback(() => {
    if (!inputValue.trim() || !session || session.isComplete) return;

    const answerText = inputValue.trim();
    setInputValue("");

    // Add student message
    setChatMessages((prev) => [
      ...prev,
      { type: "student", text: answerText },
    ]);

    // Evaluate
    const { evaluation, session: updatedSession } = submitAnswer(
      { ...session },
      answerText
    );
    setSession(updatedSession);
    setCurrentEvaluation(evaluation);
    setShowHint(false);
    setShowModelAnswer(false);

    const attempts = updatedSession.attemptsPerQuestion[
      updatedSession.questions[updatedSession.currentIndex].id
    ];

    // Add evaluation feedback
    setChatMessages((prev) => [
      ...prev,
      {
        type: "evaluation",
        text: evaluation.feedback,
        percentage: evaluation.percentage,
        grade: evaluation.grade,
        matchedKeywords: evaluation.matchedKeywords,
        missedKeywords: evaluation.missedKeywords,
        attempts,
      },
    ]);

    // If poor score and first attempt, offer hint
    if (evaluation.percentage < 60 && attempts < 2) {
      // Don't auto-advance, let student retry
    } else {
      // Auto-advance after good answer or second attempt
      setTimeout(() => advanceToNext(updatedSession), 1200);
    }
  }, [inputValue, session]);

  // Advance to next question
  const advanceToNext = useCallback(
    (currentSession) => {
      const updated = nextQuestion({ ...currentSession });
      setSession(updated);
      setCurrentEvaluation(null);
      setShowHint(false);
      setShowModelAnswer(false);

      if (updated.isComplete) {
        const summary = getVivaSummary(updated);
        setVivaSummary(summary);
        setChatMessages((prev) => [
          ...prev,
          {
            type: "system",
            text: `Viva examination complete! You scored ${summary.averageScore}% overall (Grade: ${summary.overallGrade}).`,
          },
        ]);
        if (onVivaComplete) onVivaComplete(summary);
      } else {
        const q = updated.questions[updated.currentIndex];
        setChatMessages((prev) => [
          ...prev,
          {
            type: "examiner",
            text: `Q${updated.currentIndex + 1}. ${q.question}`,
            questionIndex: updated.currentIndex,
          },
        ]);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    },
    [onVivaComplete]
  );

  // Skip / force advance
  const handleSkip = useCallback(() => {
    if (!session) return;
    const q = session.questions[session.currentIndex];
    setChatMessages((prev) => [
      ...prev,
      {
        type: "model-answer",
        text: `Model Answer: ${q.modelAnswer}`,
      },
    ]);
    advanceToNext(session);
  }, [session, advanceToNext]);

  // Show hint
  const handleHint = useCallback(() => {
    if (!session) return;
    const q = session.questions[session.currentIndex];
    const attempts = session.attemptsPerQuestion[q.id] || 0;
    const hint = generateHint(q.question, q.modelAnswer, attempts);
    setShowHint(true);
    setChatMessages((prev) => [
      ...prev,
      { type: "hint", text: hint },
    ]);
  }, [session]);

  // Retry current question
  const handleRetry = useCallback(() => {
    setCurrentEvaluation(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // ─── Pre-start Screen ──────────────────────────────────────
  if (!isStarted) {
    return (
      <div className="info-section">
        <h2>💡 Viva Voce — Interactive Examination</h2>
        <div className="viva-start-card">
          <div className="viva-start-icon">🎓</div>
          <h3>AI-Powered Viva Session</h3>
          <p>
            You will be asked {questions.length} questions by the virtual
            examiner. Type your answers in your own words — the AI will evaluate
            your understanding using keyword matching and semantic analysis.
          </p>
          <div className="viva-start-rules">
            <div className="viva-rule">
              <span className="viva-rule-icon">📝</span>
              <span>Answer in your own words — no exact match required</span>
            </div>
            <div className="viva-rule">
              <span className="viva-rule-icon">💡</span>
              <span>Hints available after your first attempt</span>
            </div>
            <div className="viva-rule">
              <span className="viva-rule-icon">🔄</span>
              <span>Up to 2 attempts per question</span>
            </div>
            <div className="viva-rule">
              <span className="viva-rule-icon">📊</span>
              <span>Score contributes 25% to your overall grade</span>
            </div>
          </div>
          <button className="viva-start-btn" onClick={handleStart} disabled={questions.length === 0}>
            {questions.length > 0
              ? `Begin Viva (${questions.length} Questions)`
              : "No Questions Available"}
          </button>
        </div>
      </div>
    );
  }

  // ─── Summary Screen ────────────────────────────────────────
  if (vivaSummary) {
    const gradeColor =
      vivaSummary.averageScore >= 80
        ? "#22c55e"
        : vivaSummary.averageScore >= 60
        ? "#38bdf8"
        : vivaSummary.averageScore >= 40
        ? "#fbbf24"
        : "#ef4444";

    return (
      <div className="info-section">
        <h2>💡 Viva Voce — Results</h2>
        <div className="viva-summary-card">
          <div className="viva-summary-score" style={{ borderColor: gradeColor }}>
            <span className="viva-score-number" style={{ color: gradeColor }}>
              {vivaSummary.averageScore}%
            </span>
            <span className="viva-score-grade" style={{ color: gradeColor }}>
              Grade: {vivaSummary.overallGrade}
            </span>
          </div>

          <div className="viva-summary-stats">
            <div className="viva-stat">
              <span className="viva-stat-label">Questions</span>
              <span className="viva-stat-value">
                {vivaSummary.answered}/{vivaSummary.totalQuestions}
              </span>
            </div>
            <div className="viva-stat">
              <span className="viva-stat-label">Excellent</span>
              <span className="viva-stat-value" style={{ color: "#22c55e" }}>
                {vivaSummary.excellent}
              </span>
            </div>
            <div className="viva-stat">
              <span className="viva-stat-label">Good</span>
              <span className="viva-stat-value" style={{ color: "#38bdf8" }}>
                {vivaSummary.good}
              </span>
            </div>
            <div className="viva-stat">
              <span className="viva-stat-label">Needs Review</span>
              <span className="viva-stat-value" style={{ color: "#ef4444" }}>
                {vivaSummary.weak}
              </span>
            </div>
            <div className="viva-stat">
              <span className="viva-stat-label">Time</span>
              <span className="viva-stat-value">
                {vivaSummary.timeSpentMinutes} min
              </span>
            </div>
          </div>

          {/* Per-question breakdown */}
          <div className="viva-results-breakdown">
            <h4>Question Breakdown</h4>
            {vivaSummary.results.map((r, i) => (
              <div className="viva-result-row" key={i}>
                <div className="viva-result-q">
                  <span className="viva-result-num">Q{i + 1}</span>
                  <span className="viva-result-text">{r.question}</span>
                </div>
                <div className="viva-result-score">
                  <div
                    className="viva-result-bar"
                    style={{
                      width: `${r.percentage}%`,
                      background:
                        r.percentage >= 80
                          ? "#22c55e"
                          : r.percentage >= 60
                          ? "#38bdf8"
                          : r.percentage >= 40
                          ? "#fbbf24"
                          : "#ef4444",
                    }}
                  />
                  <span className="viva-result-pct">{r.percentage}%</span>
                </div>
              </div>
            ))}
          </div>

          {vivaSummary.weaknesses.length > 0 && (
            <div className="viva-review-topics">
              <h4>📚 Topics to Review</h4>
              <ul>
                {vivaSummary.weaknesses.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            className="viva-start-btn"
            onClick={handleRetake}
          >
            🔄 Retake Viva
          </button>
        </div>
      </div>
    );
  }

  // ─── Chat Interface ────────────────────────────────────────
  const currentQ = session?.questions[session.currentIndex];
  const currentAttempts = currentQ
    ? session.attemptsPerQuestion[currentQ.id] || 0
    : 0;
  const canRetry = currentEvaluation && currentAttempts < 2 && currentEvaluation.percentage < 60;
  const progressPct = session
    ? Math.round((session.currentIndex / session.questions.length) * 100)
    : 0;

  return (
    <div className="info-section">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h2 style={{ margin: 0 }}>💡 Viva Voce — Interactive Examination</h2>
        <button
          onClick={handleRetake}
          style={{
            padding: "6px 14px",
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.35)",
            color: "#f87171",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "600",
          }}
          title="Restart this examination session"
        >
          🔄 Restart Viva
        </button>
      </div>

      {/* Progress Bar */}
      <div className="viva-progress-bar-container">
        <div className="viva-progress-info">
          <span>
            Question {(session?.currentIndex || 0) + 1} of {session?.questions?.length || 1}
          </span>
          <span>
            Difficulty:{" "}
            <strong
              style={{
                color:
                  session?.difficulty?.getDifficulty?.() === "hard"
                    ? "#ef4444"
                    : session?.difficulty?.getDifficulty?.() === "easy"
                    ? "#22c55e"
                    : "#38bdf8",
              }}
            >
              {(session?.difficulty?.getDifficulty?.() || "NORMAL").toUpperCase()}
            </strong>
          </span>
          <span>
            Avg Score:{" "}
            <strong>{session?.difficulty?.getAverageScore?.() || 0}%</strong>
          </span>
        </div>
        <div className="viva-progress-track">
          <div
            className="viva-progress-fill"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Chat Window */}
      <div className="viva-chat-window">
        {chatMessages.map((msg, i) => (
          <div key={i} className={`viva-chat-bubble viva-chat-${msg.type}`}>
            {msg.type === "examiner" && (
              <div className="viva-chat-avatar">🎓</div>
            )}
            {msg.type === "student" && (
              <div className="viva-chat-avatar">👤</div>
            )}
            {msg.type === "system" && (
              <div className="viva-chat-avatar">⚙️</div>
            )}
            {msg.type === "hint" && (
              <div className="viva-chat-avatar">💡</div>
            )}
            {msg.type === "model-answer" && (
              <div className="viva-chat-avatar">📖</div>
            )}
            {msg.type === "evaluation" && (
              <div className="viva-chat-avatar">📊</div>
            )}

            <div className="viva-chat-content">
              <div className="viva-chat-text">{msg.text}</div>

              {msg.type === "evaluation" && (
                <div className="viva-eval-details">
                  <div
                    className="viva-eval-badge"
                    style={{
                      background:
                        msg.percentage >= 80
                          ? "rgba(34,197,94,0.15)"
                          : msg.percentage >= 40
                          ? "rgba(251,191,36,0.15)"
                          : "rgba(239,68,68,0.15)",
                      color:
                        msg.percentage >= 80
                          ? "#22c55e"
                          : msg.percentage >= 40
                          ? "#fbbf24"
                          : "#ef4444",
                      borderColor:
                        msg.percentage >= 80
                          ? "#22c55e"
                          : msg.percentage >= 40
                          ? "#fbbf24"
                          : "#ef4444",
                    }}
                  >
                    {msg.percentage}% — {msg.grade.charAt(0).toUpperCase() + msg.grade.slice(1)}
                  </div>
                  {msg.matchedKeywords?.length > 0 && (
                    <div className="viva-keywords-matched">
                      ✓ Key terms covered:{" "}
                      {msg.matchedKeywords.slice(0, 5).join(", ")}
                    </div>
                  )}
                  {msg.missedKeywords?.length > 0 && (
                    <div className="viva-keywords-missed">
                      ✗ Missing concepts:{" "}
                      {msg.missedKeywords.slice(0, 4).join(", ")}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      {!session.isComplete && (
        <div className="viva-input-area">
          <div className="viva-input-row">
            <textarea
              ref={inputRef}
              className="viva-input"
              placeholder="Type your answer here..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              disabled={canRetry}
            />
            <button
              className="viva-send-btn"
              onClick={handleSubmit}
              disabled={!inputValue.trim() || canRetry}
            >
              Send ↵
            </button>
          </div>

          <div className="viva-action-btns">
            {canRetry && (
              <button className="viva-action-btn viva-retry-btn" onClick={handleRetry}>
                🔄 Try Again ({2 - currentAttempts} attempt left)
              </button>
            )}
            {currentAttempts > 0 && !showHint && (
              <button className="viva-action-btn viva-hint-btn" onClick={handleHint}>
                💡 Get Hint
              </button>
            )}
            <button className="viva-action-btn viva-skip-btn" onClick={handleSkip}>
              ⏭ Skip (Show Answer)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
