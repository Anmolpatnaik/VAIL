import React from "react";
import { getExperimentConfig } from "../../engine/ExperimentRegistry";

export default function TheorySection({ experiment }) {
  const config = getExperimentConfig(experiment);
  const data = config?.theory;

  if (!data) return null;

  return (
    <div className="info-section">
      <h2>{data.title}</h2>

      {/* OBJECTIVE */}
      <div className="info-card">
        <h3>🎯 Experimental Objective</h3>
        <p className="theory-text">
          {data.objective}
        </p>
      </div>

      {/* THEORETICAL PRINCIPLES */}
      <div className="info-card">
        <h3>🔬 Key Theoretical Principles</h3>
        <ul className="theory-list">
          {data.points?.map((point, index) => (
            <li key={index} style={{ marginBottom: "8px" }}>{point}</li>
          ))}
        </ul>
      </div>

      {/* DETAILED FORMULAE SECTION */}
      {data.formulaDetails?.length > 0 && (
        <div className="info-card">
          <h3>📐 Mathematical Formulations &amp; Physical Meaning</h3>
          <p className="theory-subtext">
            Comprehensive breakdown of governing equations, physical variable definitions (with SI units), and practical lab significance:
          </p>

          {data.formulaDetails.map((item, idx) => (
            <div className="rich-formula-card" key={idx}>
              <div className="formula-card-top">
                <span className="formula-card-title">{idx + 1}. {item.name}</span>
                <span className="formula-card-tag">{item.tag}</span>
              </div>

              <div className="formula-math-display">
                {item.formula}
              </div>

              {item.variables?.length > 0 && (
                <div className="formula-var-section">
                  <div className="formula-var-title">Variable Definitions &amp; Units:</div>
                  <div className="formula-var-grid">
                    {item.variables.map((v, vIdx) => (
                      <div className="formula-var-item" key={vIdx}>
                        <span className="formula-var-symbol">{v.sym}</span>
                        <div className="formula-var-details">
                          <strong>{v.name}</strong>
                          <span className="formula-var-unit">[{v.unit}]</span>
                          <div className="formula-var-desc">{v.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="formula-explanation-box">
                <div className="formula-insight-label">💡 Physical Meaning:</div>
                <div className="formula-insight-desc">{item.description}</div>
                <div className="formula-lab-takeaway">
                  <strong>Lab Takeaway:</strong> {item.physicalSignificance}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
