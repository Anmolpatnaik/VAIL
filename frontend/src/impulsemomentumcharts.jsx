import React, { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';

export default function CollisionCharts({ params, results }) {
  const initialDist = 12; // Matches initial cart positions (-6m and +6m)
  const relVel = (params?.initial_velocity_1 ?? 0) - (params?.initial_velocity_2 ?? 0);
  const tCollide = relVel > 0 ? initialDist / relVel : Infinity;

  // Generate dynamic, gap-free time-series data centered around collision
  const chartData = useMemo(() => {
    if (!results) return [];

    const willCollide = isFinite(tCollide) && tCollide > 0;
    const maxTime = willCollide
      ? Math.min(Math.max(tCollide + 2.0, 3.5), 18.0)
      : 5.0;

    const v1_init = params?.initial_velocity_1 ?? 0;
    const v2_init = params?.initial_velocity_2 ?? 0;
    const v1_final = results.object_1?.final_velocity_m_per_s ?? v1_init;
    const v2_final = results.object_2?.final_velocity_m_per_s ?? v2_init;
    const m1 = params?.mass_1 ?? 1;
    const m2 = params?.mass_2 ?? 1;

    const points = [];
    const steps = 70;
    const dt = maxTime / steps;

    for (let i = 0; i <= steps; i++) {
      const t = parseFloat((i * dt).toFixed(3));
      
      // Inject exact pre- and post-collision points to ensure 0-gap step
      if (willCollide && t < tCollide && (t + dt) > tCollide) {
        // Just before collision
        const tBefore = parseFloat((tCollide - 0.01).toFixed(3));
        points.push({
          time: tBefore,
          v1: v1_init,
          v2: v2_init,
          p1: parseFloat((m1 * v1_init).toFixed(3)),
          p2: parseFloat((m2 * v2_init).toFixed(3)),
          systemMomentum: parseFloat(((m1 * v1_init) + (m2 * v2_init)).toFixed(3))
        });
        // Just after collision
        const tAfter = parseFloat((tCollide + 0.01).toFixed(3));
        points.push({
          time: tAfter,
          v1: v1_final,
          v2: v2_final,
          p1: parseFloat((m1 * v1_final).toFixed(3)),
          p2: parseFloat((m2 * v2_final).toFixed(3)),
          systemMomentum: parseFloat(((m1 * v1_final) + (m2 * v2_final)).toFixed(3))
        });
      }

      const isPost = willCollide ? t >= tCollide : false;
      const v1 = isPost ? v1_final : v1_init;
      const v2 = isPost ? v2_final : v2_init;

      points.push({
        time: t,
        v1: parseFloat(v1.toFixed(3)),
        v2: parseFloat(v2.toFixed(3)),
        p1: parseFloat((m1 * v1).toFixed(3)),
        p2: parseFloat((m2 * v2).toFixed(3)),
        systemMomentum: parseFloat(((m1 * v1) + (m2 * v2)).toFixed(3))
      });
    }

    return points;
  }, [params, results, tCollide]);

  if (!results) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-gray-500 bg-white rounded-lg border border-dashed border-gray-300 p-6 text-center">
        <span className="text-2xl mb-2">🏎️</span>
        <p className="font-semibold text-gray-700 text-sm">Impulse-Momentum Graphs Standby</p>
        <p className="text-xs text-gray-500 mt-1 max-w-sm">
          Click <strong>▶ Launch Carts</strong> to simulate track collision and plot dynamic Velocity &amp; Momentum waveforms.
        </p>
      </div>
    );
  }

  const willCollide = isFinite(tCollide) && tCollide > 0;

  return (
    <div className="flex flex-col md:flex-row gap-4 h-full w-full">
      {/* Velocity vs Time Chart */}
      <div className="flex-1 bg-white p-3 rounded shadow border min-h-[220px]">
        <div className="flex justify-between items-center mb-1 px-1">
          <h4 className="text-xs font-bold text-gray-700">Velocity over Time v(t)</h4>
          {willCollide && (
            <span className="text-[11px] font-mono text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
              Impact: t = {tCollide.toFixed(2)} s
            </span>
          )}
        </div>
        <ResponsiveContainer width="100%" height={210}>
          <LineChart data={chartData} margin={{ top: 8, right: 15, bottom: 20, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="time" 
              type="number" 
              tickCount={6} 
              domain={[0, 'dataMax']}
              label={{ value: 'Time t (s)', position: 'insideBottom', offset: -12, fontSize: 11, fill: '#6b7280' }}
            />
            <YAxis 
              label={{ value: 'v (m/s)', angle: -90, position: 'insideLeft', offset: 12, fontSize: 11, fill: '#6b7280' }}
            />
            <Tooltip formatter={(val) => [`${val} m/s`]} labelFormatter={(label) => `t = ${label} s`} />
            <ReferenceLine y={0} stroke="#9ca3af" strokeWidth={1} />
            {willCollide && (
              <ReferenceLine x={parseFloat(tCollide.toFixed(2))} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Impact', position: 'top', fill: '#ef4444', fontSize: 10 }} />
            )}
            <Legend verticalAlign="top" height={24} iconSize={10} />
            <Line type="stepAfter" dataKey="v1" name="Cart 1 (Blue)" stroke="#2563eb" strokeWidth={2.5} dot={false} isAnimationActive={false} />
            <Line type="stepAfter" dataKey="v2" name="Cart 2 (Green)" stroke="#10b981" strokeWidth={2.5} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Momentum vs Time Chart */}
      <div className="flex-1 bg-white p-3 rounded shadow border min-h-[220px]">
        <div className="flex justify-between items-center mb-1 px-1">
          <h4 className="text-xs font-bold text-gray-700">Momentum Conservation p(t)</h4>
          <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
            Total P: {((params?.mass_1 || 1) * (params?.initial_velocity_1 || 0) + (params?.mass_2 || 1) * (params?.initial_velocity_2 || 0)).toFixed(2)} kg·m/s
          </span>
        </div>
        <ResponsiveContainer width="100%" height={210}>
          <LineChart data={chartData} margin={{ top: 8, right: 15, bottom: 20, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="time" 
              type="number" 
              tickCount={6} 
              domain={[0, 'dataMax']}
              label={{ value: 'Time t (s)', position: 'insideBottom', offset: -12, fontSize: 11, fill: '#6b7280' }}
            />
            <YAxis 
              label={{ value: 'p (kg·m/s)', angle: -90, position: 'insideLeft', offset: 12, fontSize: 11, fill: '#6b7280' }}
            />
            <Tooltip formatter={(val) => [`${val} kg·m/s`]} labelFormatter={(label) => `t = ${label} s`} />
            <ReferenceLine y={0} stroke="#9ca3af" strokeWidth={1} />
            {willCollide && (
              <ReferenceLine x={parseFloat(tCollide.toFixed(2))} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Impact', position: 'top', fill: '#ef4444', fontSize: 10 }} />
            )}
            <Legend verticalAlign="top" height={24} iconSize={10} />
            <Line type="stepAfter" dataKey="p1" name="Cart 1 Momentum" stroke="#2563eb" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line type="stepAfter" dataKey="p2" name="Cart 2 Momentum" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line type="stepAfter" dataKey="systemMomentum" name="Total System P" stroke="#6b7280" strokeWidth={2.5} strokeDasharray="4 4" dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}