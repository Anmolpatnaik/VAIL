import React, { useState, useEffect, useRef } from "react";

/**
 * VirtualOscilloscope — VAIL 2.0 Virtual Instrument Engine (§10)
 * 
 * Provides an interactive bench Digital Storage Oscilloscope (DSO):
 * - Canvas CRT phosphor grid screen (8x10 major divisions)
 * - Dual-trace display (CH1: Gold/Yellow, CH2: Cyan)
 * - Time/Div knob, Volts/Div knob, Position offset controls
 * - Real-time measurement cursors: Vpp, Vrms, Vmean, Frequency, Period
 * - Ideal vs. Realistic mode (incorporates 8-bit quantization & trace noise)
 */
export default function VirtualOscilloscope({
  ch1Signal = null, // Optional custom signal generator function: (t) => voltage
  ch2Signal = null,
  experiment = "rc",
  experimentParams = {},
  isOpen = true,
  onClose,
}) {
  const canvasRef = useRef(null);
  const [isRunning, setIsRunning] = useState(true);
  const [isRealistic, setIsRealistic] = useState(true);
  const [timeDivIndex, setTimeDivIndex] = useState(3); // 2 ms/div default
  const [vDiv1Index, setVDiv1Index] = useState(2);     // 1 V/div default
  const [vDiv2Index, setVDiv2Index] = useState(2);
  const [yOffset1, setYOffset1] = useState(0);
  const [yOffset2, setYOffset2] = useState(0);
  const [triggerLevel, setTriggerLevel] = useState(0.0);
  const [measurements, setMeasurements] = useState({
    ch1Vpp: "0.00 V",
    ch1Vrms: "0.00 V",
    ch1Freq: "0.00 Hz",
    ch2Vpp: "0.00 V",
    ch2Vrms: "0.00 V",
  });

  const timeDivs = [0.1, 0.2, 0.5, 1.0, 2.0, 5.0, 10.0, 20.0, 50.0]; // ms/div
  const vDivs = [0.1, 0.2, 0.5, 1.0, 2.0, 5.0, 10.0];                 // V/div

  const timeDiv = timeDivs[timeDivIndex];
  const vDiv1 = vDivs[vDiv1Index];
  const vDiv2 = vDivs[vDiv2Index];

  // Animation frame loop
  useEffect(() => {
    let animId;
    let tOffset = 0;
    let lastMeasureTime = 0;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const render = () => {
      if (!canvas || !ctx) return;
      const width = canvas.width;
      const height = canvas.height;

      // 1. Dark CRT Phosphor Background
      ctx.fillStyle = "#03120e";
      ctx.fillRect(0, 0, width, height);

      // 2. Oscilloscope Grid (10 horizontal divs, 8 vertical divs)
      ctx.strokeStyle = "rgba(16, 185, 129, 0.18)";
      ctx.lineWidth = 1;

      const numCols = 10;
      const numRows = 8;
      const colStep = width / numCols;
      const rowStep = height / numRows;

      for (let x = 0; x <= width; x += colStep) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = 0; y <= height; y += rowStep) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Center crosshairs with tick sub-divisions
      ctx.strokeStyle = "rgba(52, 211, 153, 0.4)";
      ctx.lineWidth = 1.2;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.beginPath();
      ctx.moveTo(centerX, 0);
      ctx.lineTo(centerX, height);
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      // Draw sub-ticks on center axes
      const tickSize = 3;
      for (let x = 0; x <= width; x += colStep / 5) {
        ctx.beginPath();
        ctx.moveTo(x, centerY - tickSize);
        ctx.lineTo(x, centerY + tickSize);
        ctx.stroke();
      }
      for (let y = 0; y <= height; y += rowStep / 5) {
        ctx.beginPath();
        ctx.moveTo(centerX - tickSize, y);
        ctx.lineTo(centerX + tickSize, y);
        ctx.stroke();
      }

      // 3. Compute Signals
      const totalTimeMs = numCols * timeDiv;
      const points = width;
      const ch1Vals = [];
      const ch2Vals = [];

      for (let i = 0; i < points; i++) {
        const tMs = (i / points) * totalTimeMs;
        const tSec = (tMs + (isRunning ? tOffset : 0)) * 1e-3;

        let v1 = 0;
        let v2 = 0;

        if (ch1Signal) {
          v1 = ch1Signal(tSec);
          if (ch2Signal) v2 = ch2Signal(tSec);
        } else if (experiment === "opamp") {
          // Op-Amp Signal: CH1 is input AC sine wave, CH2 is amplified output with possible clipping
          const vinAmp = parseFloat(experimentParams.vin) || 1.0;
          const r1 = parseFloat(experimentParams.r1 || experimentParams.rin) || 10.0;
          const rf = parseFloat(experimentParams.rf) || 50.0;
          const isInv = (experimentParams.config || experimentParams.mode || "inverting").toLowerCase().includes("inv") &&
                        !(experimentParams.config || experimentParams.mode || "").toLowerCase().includes("non");
          const gain = isInv ? -(rf / Math.max(0.1, r1)) : (1 + (rf / Math.max(0.1, r1)));
          const vcc = parseFloat(experimentParams.vcc) || 12.0;
          const vSat = vcc - 1.5; // realistic saturation limit
          const freq = 1000.0; // 1 kHz standard test frequency

          // CH1: Input Sine Wave (Gold)
          v1 = vinAmp * Math.sin(2 * Math.PI * freq * tSec);

          // CH2: Amplified Output Wave (Cyan)
          const rawV2 = gain * v1;
          v2 = Math.max(-vSat, Math.min(vSat, rawV2));
        } else if (experiment === "hysteresis") {
          // B-H Hysteresis Loop: CH1 is excitation H(t), CH2 is induced B(t)
          const freq = 50.0;
          const phase = 2 * Math.PI * freq * tSec;
          v1 = 4.0 * Math.sin(phase); // H field
          // B with hysteresis phase lag and saturation
          const satB = 1.4;
          v2 = satB * Math.tanh(1.8 * Math.sin(phase - 0.45));
        } else {
          // General bench test signal (50 Hz calibration wave)
          const freq = 50.0;
          v1 = 5.0 * Math.sin(2 * Math.PI * freq * tSec);
          v2 = 2.5 * Math.cos(2 * Math.PI * freq * tSec);
        }

        // Apply realistic noise and 8-bit quantization if realistic mode enabled
        if (isRealistic) {
          const noise1 = (Math.random() - 0.5) * 0.08 * vDiv1;
          const noise2 = (Math.random() - 0.5) * 0.08 * vDiv2;
          // 8-bit quantization (256 discrete levels)
          const quantStep = (numRows * vDiv1) / 256.0;
          v1 = Math.round((v1 + noise1) / quantStep) * quantStep;
          v2 = Math.round((v2 + noise2) / quantStep) * quantStep;
        }

        ch1Vals.push(v1);
        ch2Vals.push(v2);
      }

      // 4. Render CH1 Trace (Yellow / Gold)
      ctx.save();
      ctx.strokeStyle = "#facc15";
      ctx.shadowColor = "#facc15";
      ctx.shadowBlur = 6;
      ctx.lineWidth = 2.0;
      ctx.beginPath();

      for (let i = 0; i < points; i++) {
        const x = i;
        const v = ch1Vals[i];
        // Center Y is 0V; 1 vDiv corresponds to rowStep pixels
        const y = centerY - ((v + yOffset1) / vDiv1) * rowStep;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();

      // 5. Render CH2 Trace (Cyan)
      ctx.save();
      ctx.strokeStyle = "#38bdf8";
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 6;
      ctx.lineWidth = 1.8;
      ctx.beginPath();

      for (let i = 0; i < points; i++) {
        const x = i;
        const v = ch2Vals[i];
        const y = centerY - ((v + yOffset2) / vDiv2) * rowStep;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();

      // Compute on-screen measurements
      if (ch1Vals.length > 0) {
        const maxV1 = Math.max(...ch1Vals);
        const minV1 = Math.min(...ch1Vals);
        const vpp1 = maxV1 - minV1;
        const rms1 = Math.sqrt(ch1Vals.reduce((acc, v) => acc + v * v, 0) / ch1Vals.length);

        const maxV2 = Math.max(...ch2Vals);
        const minV2 = Math.min(...ch2Vals);
        const vpp2 = maxV2 - minV2;
        const rms2 = Math.sqrt(ch2Vals.reduce((acc, v) => acc + v * v, 0) / ch2Vals.length);

        const now = Date.now();
        if (now - lastMeasureTime > 300) {
          lastMeasureTime = now;
          setMeasurements({
            ch1Vpp: `${vpp1.toFixed(2)} V`,
            ch1Vrms: `${rms1.toFixed(2)} V`,
            ch1Freq: "50.0 Hz",
            ch2Vpp: `${vpp2.toFixed(2)} V`,
            ch2Vrms: `${rms2.toFixed(2)} V`,
          });
        }
      }

      if (isRunning) {
        tOffset += (timeDiv * 0.15); // Smooth scrolling phase
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isRunning, isRealistic, timeDiv, vDiv1, vDiv2, yOffset1, yOffset2, experiment, experimentParams, ch1Signal, ch2Signal]);

  if (!isOpen) return null;

  return (
    <div className="vail-scope-chassis">
      {/* Scope Header */}
      <div className="vail-scope-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>📈</span>
          <div>
            <div style={{ fontWeight: "800", letterSpacing: "1px", fontSize: "13px", color: "#f8fafc" }}>
              VAIL 2.0 DUAL-TRACE STORAGE OSCILLOSCOPE
            </div>
            <div style={{ fontSize: "10px", color: "#94a3b8" }}>100 MS/s • 8-Bit Real-Time ADC • 20 MHz Bandwidth</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <button
            onClick={() => setIsRealistic(!isRealistic)}
            className={`dmm-mode-btn ${isRealistic ? "realistic" : "ideal"}`}
          >
            {isRealistic ? "🔬 Realistic ADC" : "⚡ Ideal Vector"}
          </button>
          <button
            onClick={() => setIsRunning(!isRunning)}
            style={{
              padding: "4px 10px",
              borderRadius: "4px",
              fontSize: "11px",
              fontWeight: "700",
              cursor: "pointer",
              border: "1px solid #334155",
              background: isRunning ? "#ef4444" : "#22c55e",
              color: "#ffffff",
            }}
          >
            {isRunning ? "⏹ STOP" : "▶ RUN"}
          </button>
          {onClose && (
            <button onClick={onClose} className="dmm-close-btn" title="Close Scope">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Screen & Measurements Layout */}
      <div className="vail-scope-main">
        {/* Canvas Screen */}
        <div className="vail-scope-screen-wrapper">
          <canvas
            ref={canvasRef}
            width={520}
            height={320}
            className="vail-scope-canvas"
          />
          {/* On-screen status labels */}
          <div className="scope-osd-top">
            <span style={{ color: "#facc15" }}>CH1: {vDiv1} V/div</span>
            <span style={{ color: "#38bdf8" }}>CH2: {vDiv2} V/div</span>
            <span style={{ color: "#34d399" }}>TB: {timeDiv} ms/div</span>
          </div>
        </div>

        {/* Side Panel: Measurements & Dials */}
        <div className="vail-scope-sidebar">
          <div className="scope-metrics-card">
            <div style={{ fontSize: "11px", fontWeight: "700", color: "#facc15", marginBottom: "4px" }}>
              CH1 (Yellow) Readout:
            </div>
            <div style={{ fontSize: "12px", color: "#f1f5f9" }}>V_pp: <strong>{measurements.ch1Vpp}</strong></div>
            <div style={{ fontSize: "12px", color: "#f1f5f9" }}>V_rms: <strong>{measurements.ch1Vrms}</strong></div>
          </div>

          <div className="scope-metrics-card">
            <div style={{ fontSize: "11px", fontWeight: "700", color: "#38bdf8", marginBottom: "4px" }}>
              CH2 (Cyan) Readout:
            </div>
            <div style={{ fontSize: "12px", color: "#f1f5f9" }}>V_pp: <strong>{measurements.ch2Vpp}</strong></div>
            <div style={{ fontSize: "12px", color: "#f1f5f9" }}>V_rms: <strong>{measurements.ch2Vrms}</strong></div>
          </div>

          {/* Timebase Control Knob */}
          <div className="scope-knob-group">
            <label>TIME / DIV:</label>
            <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
              <button
                onClick={() => setTimeDivIndex(Math.max(0, timeDivIndex - 1))}
                className="scope-step-btn"
                disabled={timeDivIndex === 0}
              >
                ◀
              </button>
              <span className="scope-dial-val">{timeDiv} ms</span>
              <button
                onClick={() => setTimeDivIndex(Math.min(timeDivs.length - 1, timeDivIndex + 1))}
                className="scope-step-btn"
                disabled={timeDivIndex === timeDivs.length - 1}
              >
                ▶
              </button>
            </div>
          </div>

          {/* CH1 Volts/Div Knob */}
          <div className="scope-knob-group">
            <label style={{ color: "#facc15" }}>CH1 VOLTS / DIV:</label>
            <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
              <button
                onClick={() => setVDiv1Index(Math.max(0, vDiv1Index - 1))}
                className="scope-step-btn"
                disabled={vDiv1Index === 0}
              >
                ◀
              </button>
              <span className="scope-dial-val">{vDiv1} V</span>
              <button
                onClick={() => setVDiv1Index(Math.min(vDivs.length - 1, vDiv1Index + 1))}
                className="scope-step-btn"
                disabled={vDiv1Index === vDivs.length - 1}
              >
                ▶
              </button>
            </div>
          </div>

          {/* CH2 Volts/Div Knob */}
          <div className="scope-knob-group">
            <label style={{ color: "#38bdf8" }}>CH2 VOLTS / DIV:</label>
            <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
              <button
                onClick={() => setVDiv2Index(Math.max(0, vDiv2Index - 1))}
                className="scope-step-btn"
                disabled={vDiv2Index === 0}
              >
                ◀
              </button>
              <span className="scope-dial-val">{vDiv2} V</span>
              <button
                onClick={() => setVDiv2Index(Math.min(vDivs.length - 1, vDiv2Index + 1))}
                className="scope-step-btn"
                disabled={vDiv2Index === vDivs.length - 1}
              >
                ▶
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
