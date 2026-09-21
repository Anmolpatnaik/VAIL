import React, { useState, useEffect } from "react";

/**
 * ValidatedParameterControl
 * 
 * Provides a synchronized numeric input and range slider with strict min/max validation.
 * When a user enters a value that exceeds the permissible range, it visually displays
 * an "Invalid Input" badge, highlights the input with an error border, shows an actionable
 * error message, and informs the parent component via onValidityChange.
 */
export default function ValidatedParameterControl({
  label,
  limitHint,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
  onValidityChange,
  accentColor,
  disabled = false,
  formatDecimals,
}) {
  const [inputText, setInputText] = useState(
    formatDecimals !== undefined && typeof value === "number"
      ? value.toFixed(formatDecimals)
      : String(value ?? "")
  );
  const [errorMessage, setErrorMessage] = useState(null);

  // Sync internal text when value prop updates from parent (e.g., reset, preset, or baseline)
  useEffect(() => {
    if (value !== undefined && value !== null) {
      const formatted =
        formatDecimals !== undefined && typeof value === "number"
          ? value.toFixed(formatDecimals)
          : String(value);
      
      // If currently not in an error state with a different typed text, sync
      if (!errorMessage) {
        setInputText(formatted);
      }
    }
  }, [value, formatDecimals]);

  const validateAndEmit = (rawStr) => {
    setInputText(rawStr);

    if (rawStr.trim() === "") {
      const err = `Invalid Input: Value is required (${min} – ${max} ${unit})`;
      setErrorMessage(err);
      if (onValidityChange) onValidityChange(false, err);
      return;
    }

    const parsed = parseFloat(rawStr);
    if (isNaN(parsed)) {
      const err = `Invalid Input: Must be a valid number`;
      setErrorMessage(err);
      if (onValidityChange) onValidityChange(false, err);
      return;
    }

    // Strict boundary checks
    if (parsed < min) {
      const err = `Invalid Input: Must be at least ${min} ${unit}`;
      setErrorMessage(err);
      if (onValidityChange) onValidityChange(false, err);
      return;
    }

    if (parsed > max) {
      const err = `Invalid Input: Cannot exceed ${max} ${unit}`;
      setErrorMessage(err);
      if (onValidityChange) onValidityChange(false, err);
      return;
    }

    // Valid value within [min, max]
    setErrorMessage(null);
    if (onValidityChange) onValidityChange(true, null);
    if (onChange) onChange(parsed);
  };

  const handleSliderChange = (e) => {
    const sliderVal = parseFloat(e.target.value);
    const formatted =
      formatDecimals !== undefined ? sliderVal.toFixed(formatDecimals) : String(sliderVal);
    setInputText(formatted);
    setErrorMessage(null);
    if (onValidityChange) onValidityChange(true, null);
    if (onChange) onChange(sliderVal);
  };

  const isInvalid = Boolean(errorMessage);

  // Slider value clamped strictly for the slider track
  const safeSliderValue =
    typeof value === "number" && !isNaN(value)
      ? Math.max(min, Math.min(max, value))
      : min;

  return (
    <div className={`sim-param-box ${isInvalid ? "param-box-error" : ""}`}>
      <div className="sim-param-header">
        <div className="sim-param-title">
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            {label}
            {isInvalid && <span className="sim-input-invalid-badge">⚠️ Invalid Input</span>}
          </span>
          {limitHint && (
            <span className="sim-param-limit" style={isInvalid ? { color: "#f87171" } : {}}>
              Range: {limitHint}
            </span>
          )}
        </div>

        <div className={`sim-param-input-wrap ${isInvalid ? "has-error" : ""}`}>
          <input
            type="number"
            className="sim-num-input"
            min={min}
            max={max}
            step={step}
            value={inputText}
            disabled={disabled}
            onChange={(e) => validateAndEmit(e.target.value)}
            onBlur={() => {
              // If empty on blur, revert to min or keep error visible
              if (inputText.trim() === "") {
                validateAndEmit(String(min));
              }
            }}
          />
          {unit && <span className="sim-param-unit">{unit}</span>}
        </div>
      </div>

      <input
        type="range"
        className="sim-param-slider"
        min={min}
        max={max}
        step={step}
        value={safeSliderValue}
        disabled={disabled}
        onChange={handleSliderChange}
        style={accentColor ? { accentColor } : {}}
      />

      {isInvalid && (
        <div className="sim-input-error-msg">
          <span>⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
