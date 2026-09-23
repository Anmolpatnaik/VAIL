import React, { useState, useEffect, useRef } from "react";
import {
  generateAssistantResponse,
  getContextualSuggestions,
  EXPERIMENT_KNOWLEDGE
} from "../../engine/AIAssistantEngine";
import { ENDPOINTS } from "../../apiConfig";

/**
 * AIAssistantWidget — VAIL 2.0 AI Lab Copilot & Virtual Demonstrator
 * 
 * Non-intrusive floating glassmorphic assistant widget providing real-time
 * context-aware physics guidance, live math calculations, diagnostics, and viva prep.
 * Features persistent conversation storage via localStorage.
 */
export default function AIAssistantWidget({
  experimentId = "rc",
  activeTab = "experiment",
  liveValues = {},
  observations = []
}) {
  const [isOpen, setIsOpen] = useState(false);
  const getStorageKey = (expId) => `vail_assistant_chat_${expId || "general"}`;

  // Initialize messages from localStorage or default greeting
  const [messages, setMessages] = useState(() => {
    try {
      const key = `vail_assistant_chat_${experimentId || "general"}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn("Could not load chat history from localStorage:", err);
    }
    const expTitle = EXPERIMENT_KNOWLEDGE[experimentId]?.title || "Virtual Lab";
    return [
      {
        id: "welcome",
        sender: "assistant",
        text: `👋 Greetings! I am your **VAIL Virtual Lab Demonstrator** for **${expTitle}**.\n\nI can calculate theoretical values from your live sliders, explain apparatus, diagnose errors, or quiz you for viva exams.\n\nHow can I help you today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ];
  });

  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Reload conversation when switching experiments
  useEffect(() => {
    try {
      const key = getStorageKey(experimentId);
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch (err) {
      console.warn("Could not load chat history from localStorage:", err);
    }

    const expTitle = EXPERIMENT_KNOWLEDGE[experimentId]?.title || "Virtual Lab";
    setMessages([
      {
        id: "welcome",
        sender: "assistant",
        text: `👋 Greetings! I am your **VAIL Virtual Lab Demonstrator** for **${expTitle}**.\n\nI can calculate theoretical values from your live sliders, explain apparatus, diagnose errors, or quiz you for viva exams.\n\nHow can I help you today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
  }, [experimentId]);

  // Persist messages to localStorage whenever updated
  useEffect(() => {
    if (messages.length > 0) {
      try {
        const key = getStorageKey(experimentId);
        localStorage.setItem(key, JSON.stringify(messages));
      } catch (err) {
        console.warn("Could not save chat history to localStorage:", err);
      }
    }
  }, [messages, experimentId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
      setHasUnread(false);
    }
  }, [isOpen]);

  // Contextual suggestions based on active experiment & tab
  const suggestions = getContextualSuggestions(experimentId, activeTab);

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    const userMessage = {
      id: "u_" + Date.now(),
      sender: "user",
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Realistic pedagogical thinking delay (250ms)
    setTimeout(async () => {
      try {
        let replyText = "";
        let replyType = "LOCAL_PHYSICS";

        // Try backend if reachable (with 1.5s timeout)
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 1500);
          const endpointUrl = ENDPOINTS.assistantChat || "/api/assistant/chat";

          const res = await fetch(endpointUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: text,
              experiment_id: experimentId,
              active_tab: activeTab,
              live_values: liveValues
            }),
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (res.ok) {
            const data = await res.json();
            if (data && data.response && data.type === "LLM_GENERATED") {
              replyText = data.response;
              replyType = data.type;
            }
          }
        } catch {
          // Backend offline or timeout: seamlessly continue to local physics engine
        }

        // If no LLM reply, use instant local physics engine
        if (!replyText) {
          const response = await generateAssistantResponse(text, {
            experimentId,
            activeTab,
            liveValues,
            observations
          });
          replyText = response?.text || "I have analyzed your parameters. What would you like to compute?";
          replyType = response?.type || "LOCAL_PHYSICS";
        }

        const assistantMessage = {
          id: "a_" + Date.now(),
          sender: "assistant",
          text: replyText,
          type: replyType,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };

        setMessages((prev) => [...prev, assistantMessage]);
        if (!isOpen) setHasUnread(true);
      } catch (err) {
        console.error("AI Assistant Error:", err);
        setMessages((prev) => [
          ...prev,
          {
            id: "err_" + Date.now(),
            sender: "assistant",
            text: "⚠️ I encountered an issue calculating that explanation. Please try again.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }
        ]);
      } finally {
        setIsTyping(false);
      }
    }, 250);
  };

  const handleClearChat = () => {
    const expTitle = EXPERIMENT_KNOWLEDGE[experimentId]?.title || "Virtual Lab";
    try {
      const key = getStorageKey(experimentId);
      localStorage.removeItem(key);
    } catch (err) {
      console.warn("Could not clear chat history from localStorage:", err);
    }

    setMessages([
      {
        id: "reset_" + Date.now(),
        sender: "assistant",
        text: `🧹 Chat cleared! Ready to help with **${expTitle}**. What would you like to explore?`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
  };

  const handleCopyText = (text) => {
    if (text) {
      navigator.clipboard.writeText(text);
    }
  };

  // Simple formatting helper for markdown-style bold, code, bullets, and line breaks
  const renderFormattedText = (rawText) => {
    if (!rawText || typeof rawText !== "string") {
      return null;
    }

    // If it contains html details/summary, render dangerously or split
    if (rawText.includes("<details")) {
      return <div dangerouslySetInnerHTML={{ __html: rawText.replace(/\n/g, "<br/>") }} />;
    }

    const lines = rawText.split("\n");
    return lines.map((line, idx) => {
      let content = line;

      // Handle headers
      if (content.startsWith("### ")) {
        return (
          <h4 key={idx} style={{ margin: "10px 0 6px 0", color: "#38bdf8", fontSize: "14px", fontWeight: "700" }}>
            {content.replace("### ", "")}
          </h4>
        );
      }

      // Convert inline **bold** and `code`
      const parts = content.split(/(\*\*.*?\*\*|`.*?`)/g);
      const renderedParts = parts.map((part, pIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={pIdx} style={{ color: "#f8fafc" }}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={pIdx}
              style={{
                background: "rgba(56, 189, 248, 0.15)",
                color: "#7dd3fc",
                padding: "2px 6px",
                borderRadius: "4px",
                fontFamily: "monospace",
                fontSize: "12px"
              }}
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return part;
      });

      return (
        <div key={idx} style={{ marginBottom: line.trim() === "" ? "6px" : "3px", minHeight: line.trim() === "" ? "8px" : "auto" }}>
          {renderedParts}
        </div>
      );
    });
  };

  return (
    <>
      {/* ─── FLOATING ACTION BUTTON (FAB) ─── */}
      <button
        id="vail-assistant-fab"
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: isOpen ? "12px 16px" : "12px 18px",
          background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)",
          color: "#ffffff",
          border: "1px solid rgba(255, 255, 255, 0.25)",
          borderRadius: "30px",
          boxShadow: "0 8px 30px rgba(2, 132, 199, 0.45), 0 0 15px rgba(56, 189, 248, 0.3)",
          cursor: "pointer",
          backdropFilter: "blur(12px)",
          transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          transform: isOpen ? "scale(0.95)" : "scale(1)"
        }}
        title="VAIL AI Lab Copilot & Virtual Demonstrator"
      >
        <span style={{ fontSize: "20px", display: "inline-block", transform: "translateY(-1px)" }}>
          {isOpen ? "✕" : "🤖"}
        </span>
        <span style={{ fontWeight: "700", fontSize: "14px", letterSpacing: "0.4px" }}>
          {isOpen ? "Close Assistant" : "AI Copilot"}
        </span>
        {hasUnread && !isOpen && (
          <span
            style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: "#ef4444",
              border: "2px solid #0f172a"
            }}
          />
        )}
      </button>

      {/* ─── SLIDE-OUT CHAT DRAWER / POPOVER ─── */}
      {isOpen && (
        <div
          id="vail-assistant-panel"
          style={{
            position: "fixed",
            bottom: "84px",
            right: "24px",
            width: "410px",
            maxWidth: "calc(100vw - 32px)",
            height: "580px",
            maxHeight: "calc(100vh - 120px)",
            zIndex: 9998,
            display: "flex",
            flexDirection: "column",
            background: "rgba(15, 23, 42, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(56, 189, 248, 0.35)",
            borderRadius: "20px",
            boxShadow: "0 25px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(56, 189, 248, 0.2)",
            overflow: "hidden",
            color: "#e2e8f0",
            animation: "vailSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "14px 18px",
              background: "linear-gradient(180deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.8) 100%)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #0284c7, #38bdf8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  boxShadow: "0 2px 10px rgba(56, 189, 248, 0.4)"
                }}
              >
                🔬
              </div>
              <div>
                <div style={{ fontWeight: "700", fontSize: "14px", color: "#f8fafc", display: "flex", alignItems: "center", gap: "6px" }}>
                  VAIL Demonstrator
                  <span
                    style={{
                      fontSize: "10px",
                      padding: "1px 6px",
                      borderRadius: "10px",
                      background: "rgba(34, 197, 94, 0.2)",
                      color: "#4ade80",
                      fontWeight: "600",
                      border: "1px solid rgba(74, 222, 128, 0.3)"
                    }}
                  >
                    ● Physics Engine Active
                  </span>
                </div>
                <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                  Context: <strong style={{ color: "#38bdf8" }}>{experimentId.toUpperCase()}</strong> · Tab: <strong style={{ color: "#cbd5e1" }}>{activeTab}</strong>
                </div>
              </div>
            </div>

            <button
              onClick={handleClearChat}
              title="Clear Conversation"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#94a3b8",
                padding: "6px 8px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "12px",
                transition: "all 0.15s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#f87171";
                e.currentTarget.style.borderColor = "rgba(248, 113, 113, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#94a3b8";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
              }}
            >
              🗑️ Clear
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "14px"
            }}
          >
            {messages.map((msg) => {
              const isUser = msg.sender === "user";
              return (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isUser ? "flex-end" : "flex-start",
                    maxWidth: "100%"
                  }}
                >
                  <div
                    style={{
                      maxWidth: "88%",
                      padding: "12px 14px",
                      borderRadius: isUser ? "16px 16px 2px 16px" : "16px 16px 16px 2px",
                      background: isUser
                        ? "linear-gradient(135deg, #0284c7 0%, #1d4ed8 100%)"
                        : "rgba(30, 41, 59, 0.8)",
                      border: isUser
                        ? "1px solid rgba(56, 189, 248, 0.4)"
                        : "1px solid rgba(255, 255, 255, 0.08)",
                      color: isUser ? "#ffffff" : "#cbd5e1",
                      fontSize: "13px",
                      lineHeight: "1.55",
                      boxShadow: isUser
                        ? "0 4px 15px rgba(2, 132, 199, 0.25)"
                        : "0 4px 15px rgba(0, 0, 0, 0.3)",
                      position: "relative",
                      wordBreak: "break-word"
                    }}
                  >
                    {renderFormattedText(msg.text)}

                    {!isUser && (
                      <button
                        onClick={() => handleCopyText(msg.text)}
                        style={{
                          marginTop: "8px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "2px 8px",
                          fontSize: "11px",
                          background: "rgba(255, 255, 255, 0.06)",
                          border: "1px solid rgba(255, 255, 255, 0.12)",
                          borderRadius: "4px",
                          color: "#94a3b8",
                          cursor: "pointer"
                        }}
                      >
                        📋 Copy
                      </button>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: "10px",
                      color: "#64748b",
                      marginTop: "4px",
                      padding: "0 4px"
                    }}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}

            {isTyping && (
              <div
                style={{
                  alignSelf: "flex-start",
                  padding: "10px 14px",
                  borderRadius: "16px 16px 16px 2px",
                  background: "rgba(30, 41, 59, 0.8)",
                  border: "1px solid rgba(56, 189, 248, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "#38bdf8",
                  fontSize: "12px"
                }}
              >
                <span>Evaluating physics equations...</span>
                <span className="vail-pulse-dots">● ● ●</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Contextual Suggestions Chips */}
          <div
            style={{
              padding: "8px 14px",
              background: "rgba(15, 23, 42, 0.9)",
              borderTop: "1px solid rgba(255, 255, 255, 0.06)",
              display: "flex",
              gap: "6px",
              overflowX: "auto",
              scrollbarWidth: "none"
            }}
          >
            {suggestions.map((suggestion, sIdx) => (
              <button
                key={sIdx}
                onClick={() => handleSendMessage(suggestion)}
                style={{
                  flexShrink: 0,
                  fontSize: "11px",
                  padding: "5px 10px",
                  background: "rgba(56, 189, 248, 0.08)",
                  border: "1px solid rgba(56, 189, 248, 0.25)",
                  borderRadius: "20px",
                  color: "#38bdf8",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(56, 189, 248, 0.2)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(56, 189, 248, 0.08)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                ⚡ {suggestion}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{
              padding: "12px 14px",
              background: "rgba(15, 23, 42, 0.98)",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about formulas, steps, or viva..."
              style={{
                flex: 1,
                background: "rgba(30, 41, 59, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "12px",
                padding: "10px 14px",
                color: "#ffffff",
                fontSize: "13px",
                outline: "none",
                transition: "border-color 0.15s ease"
              }}
              onFocus={(e) => (e.target.style.borderColor = "#38bdf8")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255, 255, 255, 0.15)")}
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              style={{
                background: inputValue.trim()
                  ? "linear-gradient(135deg, #0284c7, #2563eb)"
                  : "rgba(255, 255, 255, 0.08)",
                border: "none",
                borderRadius: "12px",
                padding: "10px 16px",
                color: inputValue.trim() ? "#ffffff" : "#64748b",
                fontWeight: "700",
                fontSize: "13px",
                cursor: inputValue.trim() ? "pointer" : "not-allowed",
                transition: "all 0.2s ease",
                boxShadow: inputValue.trim() ? "0 4px 12px rgba(2, 132, 199, 0.3)" : "none"
              }}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
