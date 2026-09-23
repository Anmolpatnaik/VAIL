import React from "react";
import { getExperimentConfig } from "../../engine/ExperimentRegistry";

export default function ObservationsSection({ experiment, observations = [], onEraseSlot, onOpenReportModal }) {
  const config = getExperimentConfig(experiment);
  const currentConfig = config?.observations || { rows: [], name: "Experiment" };
  const rows = currentConfig.rows || [];
  const experimentsList = [0, 1, 2, 3, 4];

  const handleExportToExcel = () => {
    let headerRow1 = ["Quantity (with SI Unit)"];
    experimentsList.forEach((idx) => { headerRow1.push(`Experiment ${idx + 1}`, ""); });

    let headerRow2 = [""];
    experimentsList.forEach((idx) => { headerRow2.push(`Input Value ${idx + 1}`, `Observed Value ${idx + 1}`); });

    const dataRows = rows.map((row) => {
      const rowLine = [`"${row.label.replace(/"/g, '""')}"`];
      experimentsList.forEach((idx) => {
        const run = observations[idx];
        const val = run ? run[row.id] : null;

        if (row.type === "input") {
          rowLine.push(val !== null && val !== undefined ? `"${val}"` : '""');
          rowLine.push('""');
        } else {
          rowLine.push('""');
          rowLine.push(val !== null && val !== undefined ? `"${val}"` : '""');
        }
      });
      return rowLine.join(",");
    });

    const csvContent = "\uFEFF" + [
      headerRow1.map((h) => (h ? `"${h}"` : '""')).join(","),
      headerRow2.map((h) => (h ? `"${h}"` : '""')).join(","),
      ...dataRows,
    ].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${currentConfig.name || "Experiment"}_Observation_Table.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="info-section">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", flexWrap: "wrap", gap: "12px" }}>
        <h2 style={{ margin: 0 }}>Observation Table</h2>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          {onOpenReportModal && (
            <button
              onClick={onOpenReportModal}
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 18px", background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)", color: "#ffffff", border: "1px solid #38bdf8", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 14px rgba(2, 132, 199, 0.35)", transition: "all 0.2s ease" }}
            >
              <span>📄</span> Official Lab Report (PDF)
            </button>
          )}
          <button
            onClick={handleExportToExcel}
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 18px", background: "linear-gradient(135deg, #15803d 0%, #166534 100%)", color: "#ffffff", border: "1px solid #22c55e", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 14px rgba(22, 101, 52, 0.35)", transition: "all 0.2s ease" }}
          >
            <span>📊</span> Export to Excel
          </button>
        </div>
      </div>

      <div className="info-card">
        <div className="obs-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", borderRadius: "8px" }}>
          <table className="obs-table" style={{ width: "100%", minWidth: "1150px", borderCollapse: "collapse", textAlign: "center", fontSize: "13px" }}>
            <thead>
              <tr className="obs-tr-main" style={{ borderBottom: "1px solid #1e3a5f" }}>
                <th rowSpan={2} className="obs-th-main" style={{ padding: "12px 16px", borderRight: "1px solid #1e3a5f", textAlign: "left", minWidth: "220px" }}>Quantity (with SI Unit)</th>
                {experimentsList.map((idx) => (
                  <th key={idx} colSpan={2} className="obs-th-main" style={{ padding: "10px", borderRight: "1px solid #1e3a5f", fontWeight: "600" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      <span>Experiment {idx + 1}</span>
                      {observations[idx] && (
                        <button onClick={() => onEraseSlot(idx)} style={{ background: "rgba(239, 68, 68, 0.2)", border: "1px solid #ef4444", color: "#f87171", borderRadius: "4px", cursor: "pointer", fontSize: "10px", padding: "2px 6px" }}>✕ Clear</button>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
              <tr className="obs-tr-sub" style={{ borderBottom: "2px solid #1e3a5f" }}>
                {experimentsList.map((idx) => (
                  <React.Fragment key={idx}>
                    <th className="obs-th-sub" style={{ padding: "8px 10px", borderRight: "1px solid rgba(148, 163, 184, 0.2)", fontSize: "12px", minWidth: "110px" }}>Input Value {idx + 1}</th>
                    <th className="obs-th-sub" style={{ padding: "8px 10px", borderRight: "1px solid #1e3a5f", fontSize: "12px", minWidth: "120px" }}>Observed Value {idx + 1}</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rIdx) => (
                <tr key={rIdx} style={{ borderBottom: "1px solid rgba(148, 163, 184, 0.2)" }}>
                  <td className="obs-td-label" style={{ padding: "10px 16px", textAlign: "left", fontWeight: "500", borderRight: "1px solid #1e3a5f" }}>{row.label}</td>
                  {experimentsList.map((idx) => {
                    const run = observations[idx];
                    const val = run ? run[row.id] : null;
                    return (
                      <React.Fragment key={idx}>
                        <td style={{ padding: "8px 10px", borderRight: "1px solid rgba(148, 163, 184, 0.2)" }}>
                          {row.type === "input" && val !== null && val !== undefined ? val : "—"}
                        </td>
                        <td style={{ padding: "8px 10px", borderRight: "1px solid #1e3a5f", fontWeight: row.type === "observed" ? "600" : "400" }}>
                          {row.type === "observed" && val !== null && val !== undefined ? val : "—"}
                        </td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
