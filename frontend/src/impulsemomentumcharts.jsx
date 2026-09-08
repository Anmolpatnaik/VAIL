import React, { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function CollisionCharts({ params, results }) {
  // Generate the time-series data dynamically based on the collision math
  const chartData = useMemo(() => {
    if (!results) return [];

    const data = [];
    const initialDist = 12; // Must match the 3D scene distance
    const relVel = params.initial_velocity_1 - params.initial_velocity_2;
    const tCollide = relVel > 0 ? initialDist / relVel : Infinity;

    // Generate data points for 5 seconds
    for (let t = 0; t <= 5; t += 0.1) {
      const time = parseFloat(t.toFixed(1));
      
      // Determine if we are looking at pre-collision or post-collision data
      const v1 = time >= tCollide ? results.object_1.final_velocity_m_per_s : params.initial_velocity_1;
      const v2 = time >= tCollide ? results.object_2.final_velocity_m_per_s : params.initial_velocity_2;

      data.push({
        time,
        v1,
        v2,
        p1: params.mass_1 * v1,
        p2: params.mass_2 * v2,
        systemMomentum: (params.mass_1 * v1) + (params.mass_2 * v2)
      });
    }
    return data;
  }, [params, results]);

  if (!results) return (
    <div className="flex h-full items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-dashed">
      Run the simulation to generate trajectory graphs.
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row gap-4 h-full w-full">
      {/* Velocity vs Time Chart */}
      <div className="flex-1 bg-white p-4 rounded shadow border">
        <h4 className="text-sm font-semibold text-gray-600 mb-2 text-center">Velocity (m/s) over Time (s)</h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="time" type="number" tickCount={6} />
            <YAxis />
            <Tooltip />
            <Legend verticalAlign="bottom" height={36}/>
            <Line type="stepAfter" dataKey="v1" name="Cart 1 (Blue)" stroke="#3b82f6" strokeWidth={3} dot={false} />
            <Line type="stepAfter" dataKey="v2" name="Cart 2 (Green)" stroke="#10b981" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Momentum vs Time Chart */}
      <div className="flex-1 bg-white p-4 rounded shadow border">
        <h4 className="text-sm font-semibold text-gray-600 mb-2 text-center">Momentum (kg·m/s) over Time (s)</h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="time" type="number" tickCount={6} />
            <YAxis />
            <Tooltip />
            <Legend verticalAlign="bottom" height={36}/>
            <Line type="stepAfter" dataKey="p1" name="Cart 1 Momentum" stroke="#3b82f6" strokeWidth={3} dot={false} />
            <Line type="stepAfter" dataKey="p2" name="Cart 2 Momentum" stroke="#10b981" strokeWidth={3} dot={false} />
            <Line type="stepAfter" dataKey="systemMomentum" name="Total System" stroke="#6b7280" strokeWidth={3} strokeDasharray="5 5" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}