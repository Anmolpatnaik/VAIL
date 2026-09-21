import React, { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';

export default function VibrationCharts({ params, results }) {
  const ampLimit = Math.max(params?.amplitude || 0.05, 0.01);

  // 1. Spatial Data (Displacement vs. Position at t = 0)
  const spatialData = useMemo(() => {
    if (!results || !results.data || !Array.isArray(results.data.x_m)) return [];
    
    const x_array = results.data.x_m;
    const disp_array = results.data.displacement_m?.[0] || [];
    
    return x_array.map((x, i) => {
      const val = disp_array[i];
      return {
        position: typeof x === 'number' && !isNaN(x) ? parseFloat(x.toFixed(3)) : 0,
        displacement: typeof val === 'number' && !isNaN(val) ? parseFloat(val.toFixed(4)) : 0
      };
    });
  }, [results]);

  // 2. Temporal Data (Displacement vs. Time at the first Antinode)
  const temporalData = useMemo(() => {
    if (!results || !results.data || !Array.isArray(results.data.x_m) || !Array.isArray(results.data.time_s)) return [];
    
    const safeMode = Math.max(params?.mode || 1, 1);
    const safeLength = Math.max(params?.length || 1, 0.1);
    const antinodeX = safeLength / (2 * safeMode);
    const x_array = results.data.x_m;
    
    let antinodeIdx = 0;
    let minDiff = Infinity;
    for (let i = 0; i < x_array.length; i++) {
      const diff = Math.abs((x_array[i] || 0) - antinodeX);
      if (diff < minDiff) {
        minDiff = diff;
        antinodeIdx = i;
      }
    }
    
    const time_array = results.data.time_s;
    const matrix = results.data.displacement_m || [];

    return time_array.map((t, i) => {
      const row = matrix[i];
      const val = row && row[antinodeIdx] !== undefined ? row[antinodeIdx] : 0;
      return {
        time: typeof t === 'number' && !isNaN(t) ? parseFloat(t.toFixed(3)) : 0,
        displacement: typeof val === 'number' && !isNaN(val) ? parseFloat(val.toFixed(4)) : 0
      };
    });
  }, [params, results]);

  if (!results) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-gray-500 bg-white rounded-lg border border-dashed border-gray-300 p-6 text-center">
        <span className="text-2xl mb-2">⚡</span>
        <p className="font-semibold text-gray-700 text-sm">Standing Wave Plots Standby</p>
        <p className="text-xs text-gray-500 mt-1 max-w-sm">
          Click <strong>⚡ Power On Generator</strong> on the left panel to compute harmonic eigenvalues and plot spatial &amp; temporal wave traces.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 h-full w-full">
      {/* Displacement vs Position (Spatial) */}
      <div className="flex-1 bg-white p-3 rounded shadow border min-h-[220px]">
        <div className="flex justify-between items-center mb-1 px-1">
          <h4 className="text-xs font-bold text-gray-700">Spatial Standing Wave Profile y(x)</h4>
          <span className="text-[11px] font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
            Mode n = {params?.mode || 1} ({params?.mode || 1} loops)
          </span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={spatialData} margin={{ top: 8, right: 15, bottom: 20, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="position" 
              type="number" 
              tickCount={6} 
              domain={[0, 'dataMax']} 
              label={{ value: 'Position x (m)', position: 'insideBottom', offset: -12, fontSize: 11, fill: '#6b7280' }}
            />
            <YAxis 
              domain={[-ampLimit, ampLimit]} 
              tickCount={5}
              label={{ value: 'y (m)', angle: -90, position: 'insideLeft', offset: 12, fontSize: 11, fill: '#6b7280' }}
            />
            <Tooltip formatter={(val) => [`${val} m`, 'Displacement']} labelFormatter={(label) => `x = ${label} m`} />
            <ReferenceLine y={0} stroke="#9ca3af" strokeWidth={1.5} />
            <Legend verticalAlign="top" height={24} iconSize={10} />
            <Line type="monotone" dataKey="displacement" name="Amplitude Profile" stroke="#2563eb" strokeWidth={2.5} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Displacement vs Time (Temporal) */}
      <div className="flex-1 bg-white p-3 rounded shadow border min-h-[220px]">
        <div className="flex justify-between items-center mb-1 px-1">
          <h4 className="text-xs font-bold text-gray-700">Antinode Oscillation Over Time y(t)</h4>
          <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
            f = {results?.physics?.frequency_hz ? results.physics.frequency_hz.toFixed(1) : "—"} Hz
          </span>
        </div>
        <ResponsiveContainer width="100%" height={220}> 
          <LineChart data={temporalData} margin={{ top: 8, right: 15, bottom: 20, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="time" 
              type="number" 
              tickCount={6} 
              domain={[0, 'dataMax']}
              label={{ value: 'Time t (s)', position: 'insideBottom', offset: -12, fontSize: 11, fill: '#6b7280' }}
            />
            <YAxis 
              domain={[-ampLimit, ampLimit]} 
              tickCount={5}
              label={{ value: 'y (m)', angle: -90, position: 'insideLeft', offset: 12, fontSize: 11, fill: '#6b7280' }}
            />
            <Tooltip formatter={(val) => [`${val} m`, 'Oscillation']} labelFormatter={(label) => `t = ${label} s`} />
            <ReferenceLine y={0} stroke="#9ca3af" strokeWidth={1.5} />
            <Legend verticalAlign="top" height={24} iconSize={10} />
            <Line type="monotone" dataKey="displacement" name="Antinode Trace" stroke="#10b981" strokeWidth={2.5} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}