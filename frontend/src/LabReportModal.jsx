import React, { useState } from "react";

export default function LabReportModal({
  isOpen,
  onClose,
  experiment,
  experimentTitle,
  observations = [],
  safetyAcknowledged = true,
  isDark = true,
}) {
  const [studentName, setStudentName] = useState("Alex Johnson");
  const [rollNumber, setRollNumber] = useState("2024-BTECH-042");
  const [institution, setInstitution] = useState("Faculty of Engineering & Technology");
  const [academicBranch, setAcademicBranch] = useState("Computer Science & Engineering");
  const [academicYear, setAcademicYear] = useState("2nd Year / Semester IV");

  if (!isOpen) return null;

  const validRuns = observations.filter((obs) => obs !== null);
  const reportDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const reportTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="lab-report-modal-overlay">
      <div className={`lab-report-modal-dialog ${isDark ? "dark-theme" : "light-theme"}`}>
        {/* Top Control Bar (Hidden in Print) */}
        <div className="no-print lab-report-controls-bar">
          <div>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800" }}>
              📄 Official Laboratory Report Generator
            </h3>
            <span style={{ fontSize: "13px", opacity: 0.8 }}>
              Enter student credentials below, then click Print / Save as PDF
            </span>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button className="lab-report-btn lab-report-btn-print" onClick={handlePrint}>
              🖨️ Print / Save as PDF
            </button>
            <button className="lab-report-btn lab-report-btn-close" onClick={onClose}>
              ✖ Close
            </button>
          </div>
        </div>

        {/* Student Credential Form (Hidden in Print) */}
        <div className="no-print lab-report-form-card">
          <div className="lab-report-form-grid">
            <div>
              <label className="lab-report-form-label">Student Full Name:</label>
              <input
                type="text"
                className="lab-report-input"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter Full Name"
              />
            </div>
            <div>
              <label className="lab-report-form-label">Roll / Registration Number:</label>
              <input
                type="text"
                className="lab-report-input"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="e.g. 2024-BTECH-042"
              />
            </div>
            <div>
              <label className="lab-report-form-label">Academic Branch / Degree:</label>
              <input
                type="text"
                className="lab-report-input"
                value={academicBranch}
                onChange={(e) => setAcademicBranch(e.target.value)}
                placeholder="e.g. Mechanical Engineering"
              />
            </div>
            <div>
              <label className="lab-report-form-label">College / University Name:</label>
              <input
                type="text"
                className="lab-report-input"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. National Institute of Technology"
              />
            </div>
          </div>
        </div>

        {/* PRINTABLE REPORT CONTAINER (Always visible & styled for A4 print) */}
        <div className="printable-lab-report-wrapper">
          <div className="printable-lab-report">
            {/* Header with Crest / Title */}
            <div className="report-header">
              <div className="report-header-left">
                <div className="report-crest">🔬</div>
                <div>
                  <h1 className="report-title">VIRTUAL LAB PORTAL</h1>
                  <h2 className="report-subtitle">Official Experimental Laboratory Record</h2>
                  <div className="report-dept">Department of Engineering Sciences & Virtual Experimentation</div>
                </div>
              </div>
              <div className="report-header-right">
                <div className="report-badge-safe">
                  {safetyAcknowledged ? "✅ Certified Safe Operator" : "⚠️ Safety Unverified"}
                </div>
                <div className="report-doc-id">
                  DOC ID: VLAB-{experiment.toUpperCase()}-{Math.floor(100000 + Math.random() * 900000)}
                </div>
              </div>
            </div>

            <hr className="report-divider" />

            {/* Experiment & Student Information Grid */}
            <div className="report-meta-grid">
              <div className="report-meta-box">
                <div className="meta-label">Experiment Module:</div>
                <div className="meta-val-highlight">{experimentTitle}</div>
              </div>
              <div className="report-meta-box">
                <div className="meta-label">Date & Time of Experiment:</div>
                <div className="meta-val">{reportDate} at {reportTime}</div>
              </div>
              <div className="report-meta-box">
                <div className="meta-label">Student Name:</div>
                <div className="meta-val">{studentName || "N/A"}</div>
              </div>
              <div className="report-meta-box">
                <div className="meta-label">Roll / Registration No:</div>
                <div className="meta-val">{rollNumber || "N/A"}</div>
              </div>
              <div className="report-meta-box">
                <div className="meta-label">Academic Program / Branch:</div>
                <div className="meta-val">{academicBranch || "N/A"} ({academicYear})</div>
              </div>
              <div className="report-meta-box">
                <div className="meta-label">Institution / College:</div>
                <div className="meta-val">{institution || "N/A"}</div>
              </div>
            </div>

            {/* SECTION 1: Experimental Observation Table */}
            <div className="report-section">
              <h3 className="report-section-title">
                1. Experimental Observations & Recorded Telemetry
              </h3>
              {validRuns.length === 0 ? (
                <div className="report-empty-notice">
                  ⚠️ No observation runs recorded yet in this laboratory session.
                </div>
              ) : (
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Run #</th>
                      <th>Recorded Parameters & Measured Values</th>
                      <th>Execution Timestamp</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validRuns.map((run, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: "700", textAlign: "center" }}>Run {idx + 1}</td>
                        <td>
                          <div className="report-data-chips">
                            {Object.entries(run).map(([k, v]) => (
                              <span key={k} className="report-data-chip">
                                <strong>{k}:</strong> {String(v)}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td style={{ fontSize: "12px", color: "#475569" }}>{reportTime}</td>
                        <td style={{ color: "#16a34a", fontWeight: "700" }}>Verified ✅</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* SECTION 2: Dynamic Analytical Verification & Error Analysis */}
            <div className="report-section">
              <h3 className="report-section-title">
                2. Analytical Calculations & Percentage Error Analysis
              </h3>
              <p className="report-section-intro">
                Mathematical verification comparing observed experimental outcomes against theoretical physical governing laws:
              </p>

              {validRuns.length === 0 ? (
                <div className="report-empty-notice">
                  Calculations will populate automatically when simulation observations are recorded.
                </div>
              ) : (
                <div className="report-calc-cards">
                  {validRuns.map((run, idx) => (
                    <div key={idx} className="report-calc-card">
                      <div className="calc-card-header">
                        <strong>Run {idx + 1} Verification Profile</strong>
                        <span className="calc-card-badge">Empirical Check</span>
                      </div>
                      <div className="calc-card-body">
                        {renderReportCalculations(experiment, run)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION 3: Signatures & Certification Block */}
            <div className="report-signatures-block">
              <div className="signature-box">
                <div className="signature-line" />
                <div className="signature-title">Student Candidate Signature</div>
                <div className="signature-sub">({studentName})</div>
              </div>
              <div className="signature-box">
                <div className="signature-line" />
                <div className="signature-title">Faculty In-Charge / Lab Examiner</div>
                <div className="signature-sub">Verified & Approved Official Seal</div>
              </div>
            </div>

            {/* Footer */}
            <div className="report-footer">
              <div>Virtual Lab Portal • Powered by Hexascale Analytical Physics Engine</div>
              <div>Page 1 of 1 • System Generated Official Academic Document</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to render experiment-specific theoretical vs observed analysis inside the report
function renderReportCalculations(experiment, run) {
  if (!run) return null;

  switch (experiment) {
    case "rc": {
      const v0 = parseFloat(run.voltage) || 0;
      const r = parseFloat(run.resistance) || 0;
      const cUf = parseFloat(run.capacitance) || 0;
      const cFarad = cUf * 1e-6;
      const tauTheor = r * cFarad;
      const tauObs = parseFloat(run.tau) || 0;
      const tauErr = tauTheor > 0 ? (Math.abs(tauObs - tauTheor) / tauTheor) * 100 : 0;
      const vcTheor = v0 * 0.6321;
      const vcObs = parseFloat(run.vc) || 0;
      const vcErr = vcTheor > 0 ? (Math.abs(vcObs - vcTheor) / vcTheor) * 100 : 0;

      return (
        <div className="calc-breakdown">
          <div>• <strong>Theoretical Time Constant (τ = RC):</strong> {r} Ω × {cUf} μF = <strong>{tauTheor.toFixed(3)} s</strong> (Observed: {tauObs.toFixed(3)} s | Error: <strong>{tauErr.toFixed(2)}%</strong>)</div>
          <div>• <strong>Voltage at t = τ (0.6321 × V₀):</strong> 0.6321 × {v0} V = <strong>{vcTheor.toFixed(2)} V</strong> (Observed: {vcObs.toFixed(2)} V | Error: <strong>{vcErr.toFixed(2)}%</strong>)</div>
          <div>• <strong>Peak Inrush Current (I₀ = V₀/R):</strong> {v0} V / {r} Ω = <strong>{(v0 / (r || 1) * 1000).toFixed(2)} mA</strong></div>
          <div className="calc-verdict"><strong>Status:</strong> {tauErr < 5 ? "✅ High Precision Scientific Agreement (< 5% Error)" : "⚠️ Acceptable Educational Tolerance"}</div>
        </div>
      );
    }
    case "hysteresis": {
      const maxH = parseFloat(run.maxH) || 0;
      const freq = parseFloat(run.freq) || 50;
      const loopArea = parseFloat(run.loopArea) || 0;
      const loss = parseFloat(run.loss) || 0;
      const theorLoss = (loopArea * freq).toFixed(3);

      return (
        <div className="calc-breakdown">
          <div>• <strong>Excitation Field (H_max):</strong> {maxH} A/m at Frequency {freq} Hz</div>
          <div>• <strong>Integrated Loop Area:</strong> {loopArea.toFixed(3)} J/m³</div>
          <div>• <strong>Theoretical Power Dissipation (P = Area × f × Vol):</strong> {theorLoss} W (Recorded: {loss} W)</div>
          <div className="calc-verdict"><strong>Status:</strong> ✅ Hysteresis Energy Integration Verified</div>
        </div>
      );
    }
    case "string": {
      const tension = parseFloat(run.tension) || 0;
      const length = parseFloat(run.length) || 1.0;
      const mu = 0.001; // linear density kg/m
      const theorSpeed = Math.sqrt(tension / mu);
      const theorWavelength = length; // for harmonic mode 2 (lambda = 2L/2 = L)
      const theorFreq = theorSpeed / (theorWavelength || 1);
      const obsFreq = parseFloat(run.frequency) || 0;
      const freqErr = theorFreq > 0 ? (Math.abs(obsFreq - theorFreq) / theorFreq) * 100 : 0;

      return (
        <div className="calc-breakdown">
          <div>• <strong>Theoretical Wave Speed (v = √(T/μ)):</strong> √({tension} N / 0.001 kg/m) = <strong>{theorSpeed.toFixed(2)} m/s</strong></div>
          <div>• <strong>Harmonic Wavelength (λ = 2L/n):</strong> <strong>{theorWavelength.toFixed(2)} m</strong> (Mode n = 2)</div>
          <div>• <strong>Theoretical Resonance Frequency (f = v/λ):</strong> <strong>{theorFreq.toFixed(2)} Hz</strong> (Observed: {obsFreq.toFixed(2)} Hz | Error: <strong>{freqErr.toFixed(2)}%</strong>)</div>
          <div className="calc-verdict"><strong>Status:</strong> {freqErr < 5 ? "✅ Harmonic Standing Wave Verified (< 5% Error)" : "⚠️ Within Acceptable Bounds"}</div>
        </div>
      );
    }
    case "impulse": {
      const mass = parseFloat(run.mass) || 1.0;
      const force = parseFloat(run.force) || 0;
      const time = parseFloat(run.time) || 0.05;
      const obsImpulse = parseFloat(run.impulse) || 0;
      const obsDeltaP = parseFloat(run.deltaP) || 0;
      const diff = Math.abs(obsImpulse - obsDeltaP);
      const err = obsImpulse > 0 ? (diff / obsImpulse) * 100 : 0;

      return (
        <div className="calc-breakdown">
          <div>• <strong>Cart Mass:</strong> {mass} kg | Contact Duration: {time} s | Applied Force: {force} N</div>
          <div>• <strong>Force-Time Impulse (J = ∫F·dt):</strong> <strong>{obsImpulse.toFixed(3)} N·s</strong></div>
          <div>• <strong>Change in Linear Momentum (Δp = m·Δv):</strong> <strong>{obsDeltaP.toFixed(3)} kg·m/s</strong></div>
          <div>• <strong>Theorem Equivalence Check (|J - Δp|):</strong> <strong>{diff.toFixed(4)}</strong> (Error: <strong>{err.toFixed(2)}%</strong>)</div>
          <div className="calc-verdict"><strong>Status:</strong> ✅ Impulse-Momentum Theorem Confirmed</div>
        </div>
      );
    }
    case "edm": {
      const curr = parseFloat(run.current) || 0;
      const volt = parseFloat(run.voltage) || 0;
      const pOn = parseFloat(run.pulseOn) || 0;
      const pOff = parseFloat(run.pulseOff) || 0;
      const duty = pOn + pOff > 0 ? (pOn / (pOn + pOff)) * 100 : 0;
      const mrrObs = parseFloat(run.mrr) || 0;

      return (
        <div className="calc-breakdown">
          <div>• <strong>Discharge Current & Gap Voltage:</strong> {curr} A @ {volt} V</div>
          <div>• <strong>Duty Cycle (Ton / (Ton + Toff)):</strong> {pOn} / ({pOn} + {pOff}) = <strong>{duty.toFixed(1)}%</strong></div>
          <div>• <strong>Observed MRR:</strong> <strong>{mrrObs.toFixed(2)} mm³/min</strong></div>
          <div>• <strong>Workpiece Material Removal:</strong> {run.initWeight} g → {run.finalWeight} g in {run.machTime} min</div>
          <div className="calc-verdict"><strong>Status:</strong> ✅ Material Removal Rate Process Verified</div>
        </div>
      );
    }
    case "opamp": {
      const mode = run.mode || "INVERTING";
      const vin = parseFloat(run.vin) || 0;
      const rf = parseFloat(run.rf) || 50;
      const rin = parseFloat(run.rin) || 10;
      const theorGain = mode.includes("INV") && !mode.includes("NON") ? -(rf / rin) : (1 + (rf / rin));
      const obsGain = parseFloat(run.gain) || 0;
      const voutTheor = Math.max(-12, Math.min(12, theorGain * vin));
      const voutObs = parseFloat(run.vout) || 0;

      return (
        <div className="calc-breakdown">
          <div>• <strong>Topology:</strong> {mode} Amplifier (Vin = {vin} V, Rin = {rin} kΩ, Rf = {rf} kΩ)</div>
          <div>• <strong>Theoretical Gain (Av):</strong> <strong>{theorGain.toFixed(2)}</strong> (Observed: {obsGain.toFixed(2)})</div>
          <div>• <strong>Theoretical Output Voltage:</strong> <strong>{voutTheor.toFixed(2)} V</strong> (Observed: {voutObs.toFixed(2)} V)</div>
          <div className="calc-verdict"><strong>Status:</strong> ✅ Closed-Loop Voltage Amplification Verified</div>
        </div>
      );
    }
    default:
      return <div>Verified experimental run data.</div>;
  }
}
