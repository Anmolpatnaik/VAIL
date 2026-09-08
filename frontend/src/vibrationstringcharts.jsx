import React, { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';

export default function VibrationCharts({ params, results }) {
  // 1. Spatial Data (Displacement vs. Position at t = 0)
  const spatialData = useMemo(() => {
    if (!results || !results.data) return [];
    
    const x_array = results.data.x_m;
    // We take the first row (t=0) where the string is at maximum amplitude
    const disp_array = results.data.displacement_m[0]; 
    
    return x_array.map((x, i) => ({
      position: parseFloat(x.toFixed(3)),
      displacement: parseFloat(disp_array[i].toFixed(4))
    }));
  }, [results]);

  // 2. Temporal Data (Displacement vs. Time at the first Antinode)
  const temporalData = useMemo(() => {
    if (!results || !results.data) return [];
    
    // Find the x-coordinate of the first antinode: x = L / (2n)
    const antinodeX = params.length / (2 * params.mode);
    const x_array = results.data.x_m;
    
    // Find the array index closest to that antinode position
    let antinodeIdx = 0;
    let minDiff = Infinity;
    for(let i = 0; i < x_array.length; i++) {
        const diff = Math.abs(x_array[i] - antinodeX);
        if(diff < minDiff) {
            minDiff = diff;
            antinodeIdx = i;
        }
    }
    
    const time_array = results.data.time_s;
    // Map the displacement of just that one point over the full time array
    return time_array.map((t, i) => ({
      time: parseFloat(t.toFixed(3)),
      displacement: parseFloat(results.data.displacement_m[i][antinodeIdx].toFixed(4))
    }));
  }, [params, results]);

  if (!results) return (
    <div className="flex h-full items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-dashed">
      Power on the generator to plot wave data.
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row gap-4 h-full w-full">
      {/* Displacement vs Position (Spatial) */}
      <div className="flex-1 bg-white p-4 rounded shadow border min-h-[200px]">
        <h4 className="text-sm font-semibold text-gray-600 mb-2 text-center">Standing Wave (Displacement vs. Position)</h4>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={spatialData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="position" type="number" tickCount={6} domain={[0, 'dataMax']} />
            <YAxis domain={[-params.amplitude, params.amplitude]} tickCount={5} />
            <Tooltip />
            <ReferenceLine y={0} stroke="#9ca3af" />
            <Legend verticalAlign="bottom" height={36}/>
            <Line type="monotone" dataKey="displacement" name="Amplitude (m)" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Displacement vs Time (Temporal) */}
      <div className="flex-1 bg-white p-4 rounded shadow border min-h-[200px]">
        <h4 className="text-sm font-semibold text-gray-600 mb-2 text-center">Antinode Oscillation (Displacement vs. Time)</h4>
        <ResponsiveContainer width="100%" height={250}> 
          <LineChart data={temporalData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="time" type="number" tickCount={6} domain={[0, 'dataMax']} />
            <YAxis domain={[-params.amplitude, params.amplitude]} tickCount={5} />
            <Tooltip />
            <ReferenceLine y={0} stroke="#9ca3af" />
            <Legend verticalAlign="bottom" height={36}/>
            <Line type="monotone" dataKey="displacement" name="Oscillation (m)" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}