import React, { useState, useMemo } from "react";
import {
  runFullAssessment,
  generateCertificateData,
  getGrade,
  RUBRIC_WEIGHTS,
} from "../../engine/AssessmentEngine";

/**
 * AssessmentSection — VAIL 2.0 Grade Dashboard & Certificate
 *
 * Comprehensive scoring dashboard with:
 *   - Animated circular progress ring for overall grade
 *   - 5-component rubric breakdown bars
 *   - Detailed feedback cards
 *   - Printable grade certificate with verification code
 *   - Study recommendations
 */
export default function AssessmentSection({
  experiment,
  experimentTitle,
  observations,
  safetyAcknowledged,
  vivaResults,
}) {
  const [showCertificate, setShowCertificate] = useState(false);
  const [studentName, setStudentName] = useState("Student");
  const [rollNumber, setRollNumber] = useState("2024-BTECH-001");
  const [institution, setInstitution] = useState(
    "Faculty of Engineering & Technology"
  );
  const [branch, setBranch] = useState("Computer Science & Engineering");
  const [year, setYear] = useState("B.Tech Year II");

  // Run full assessment
  const assessment = useMemo(
    () =>
      runFullAssessment({
        safetyAcknowledged,
        observations,
        experiment,
        vivaResults,
      }),
    [safetyAcknowledged, observations, experiment, vivaResults]
  );

  // Certificate data
  const certificate = useMemo(
    () =>
      generateCertificateData(experiment, experimentTitle, {
        name: studentName,
        rollNumber,
        institution,
        branch,
        year,
      }, assessment),
    [experiment, experimentTitle, studentName, rollNumber, institution, branch, year, assessment]
  );

  const gradeInfo = assessment.overallGrade;
  const pct = assessment.overallPercentage;

  // SVG circular progress ring params
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (pct / 100) * circumference;

  const componentLabels = {
    safety: { label: "Safety Compliance", icon: "🛡️", weight: "10%" },
    observations: { label: "Observations", icon: "📊", weight: "20%" },
    calculations: { label: "Calculations", icon: "🧮", weight: "25%" },
    analysis: { label: "Analysis", icon: "📈", weight: "20%" },
    viva: { label: "Viva Performance", icon: "💡", weight: "25%" },
  };

  // ─── Certificate Modal ──────────────────────────────────
  if (showCertificate) {
    return (
      <div className="info-section">
        <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2>🎓 Grade Certificate</h2>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="viva-start-btn" onClick={() => window.print()}>
              🖨️ Print / Save PDF
            </button>
            <button
              className="viva-action-btn"
              onClick={() => setShowCertificate(false)}
              style={{ padding: "8px 16px" }}
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Student Info Form (no-print) */}
        <div className="no-print assessment-student-form">
          <h4>Student Information</h4>
          <div className="assessment-form-grid">
            <div>
              <label>Full Name</label>
              <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} className="lab-report-input" />
            </div>
            <div>
              <label>Roll Number</label>
              <input type="text" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} className="lab-report-input" />
            </div>
            <div>
              <label>Institution</label>
              <input type="text" value={institution} onChange={(e) => setInstitution(e.target.value)} className="lab-report-input" />
            </div>
            <div>
              <label>Branch</label>
              <input type="text" value={branch} onChange={(e) => setBranch(e.target.value)} className="lab-report-input" />
            </div>
          </div>
        </div>

        {/* Printable Certificate */}
        <div className="assessment-certificate">
          <div className="cert-border">
            <div className="cert-header">
              <div className="cert-institution">{certificate.institution}</div>
              <h2 className="cert-title">{certificate.title}</h2>
              <div className="cert-platform">{certificate.platform}</div>
            </div>

            <div className="cert-body">
              <p className="cert-line">This is to certify that</p>
              <p className="cert-student-name">{certificate.student.name}</p>
              <p className="cert-line">
                Roll No: {certificate.student.rollNumber} | {certificate.student.branch} | {certificate.student.year}
              </p>
              <p className="cert-line" style={{ marginTop: "16px" }}>
                has successfully completed the virtual laboratory experiment
              </p>
              <p className="cert-experiment">{certificate.experimentTitle}</p>

              <div className="cert-grade-display">
                <div className="cert-grade-circle" style={{ borderColor: gradeInfo.color }}>
                  <span className="cert-grade-letter" style={{ color: gradeInfo.color }}>
                    {gradeInfo.grade}
                  </span>
                  <span className="cert-grade-pct">{pct}%</span>
                </div>
                <span className="cert-grade-label" style={{ color: gradeInfo.color }}>
                  {gradeInfo.label}
                </span>
              </div>

              <div className="cert-components-table">
                <table>
                  <thead>
                    <tr>
                      <th>Component</th>
                      <th>Weight</th>
                      <th>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(assessment.components).map(([key, comp]) => (
                      <tr key={key}>
                        <td>{componentLabels[key]?.label || key}</td>
                        <td>{componentLabels[key]?.weight}</td>
                        <td>{comp.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="cert-footer">
              <div className="cert-date">Date: {certificate.date}</div>
              <div className="cert-verification">
                Verification Code: <strong>{certificate.verificationCode}</strong>
              </div>
              <div className="cert-signatures">
                <div className="cert-sig">
                  <div className="cert-sig-line" />
                  <span>Laboratory Instructor</span>
                </div>
                <div className="cert-sig">
                  <div className="cert-sig-line" />
                  <span>Head of Department</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main Dashboard ──────────────────────────────────────
  return (
    <div className="info-section">
      <h2>🎓 Assessment & Grade</h2>

      <div className="assessment-dashboard">
        {/* Overall Grade Ring */}
        <div className="assessment-overall">
          <div className="assessment-ring-container">
            <svg className="assessment-ring" viewBox="0 0 180 180">
              {/* Background track */}
              <circle
                cx="90"
                cy="90"
                r={radius}
                fill="none"
                stroke="rgba(148,163,184,0.15)"
                strokeWidth="10"
              />
              {/* Progress arc */}
              <circle
                cx="90"
                cy="90"
                r={radius}
                fill="none"
                stroke={gradeInfo.color}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                transform="rotate(-90 90 90)"
                className="assessment-ring-progress"
              />
            </svg>
            <div className="assessment-ring-label">
              <span className="assessment-ring-grade" style={{ color: gradeInfo.color }}>
                {gradeInfo.grade}
              </span>
              <span className="assessment-ring-pct">{pct}%</span>
              <span className="assessment-ring-desc">{gradeInfo.label}</span>
            </div>
          </div>
        </div>

        {/* Component Breakdown Bars */}
        <div className="assessment-components">
          <h3>Score Breakdown</h3>
          {Object.entries(assessment.components).map(([key, comp]) => {
            const info = componentLabels[key];
            const compGrade = getGrade(comp.percentage);
            return (
              <div className="assessment-comp-row" key={key}>
                <div className="assessment-comp-header">
                  <span className="assessment-comp-icon">{info?.icon}</span>
                  <span className="assessment-comp-name">{info?.label}</span>
                  <span className="assessment-comp-weight">({info?.weight})</span>
                  <span
                    className="assessment-comp-score"
                    style={{ color: compGrade.color }}
                  >
                    {comp.percentage}%
                  </span>
                </div>
                <div className="assessment-comp-bar-track">
                  <div
                    className="assessment-comp-bar-fill"
                    style={{
                      width: `${comp.percentage}%`,
                      background: compGrade.color,
                    }}
                  />
                </div>
                <div className="assessment-comp-feedback">{comp.feedback}</div>
              </div>
            );
          })}
        </div>

        {/* Recommendations */}
        <div className="assessment-recommendations">
          <h3>📋 Recommendations</h3>
          <ul>
            {assessment.recommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>

        {/* Certificate Button */}
        <div className="assessment-actions">
          <button
            className="viva-start-btn"
            onClick={() => setShowCertificate(true)}
          >
            📜 View Grade Certificate
          </button>
        </div>
      </div>
    </div>
  );
}
