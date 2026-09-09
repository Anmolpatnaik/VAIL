import React, { useState } from 'react';
import Scene3D from "./impulsemomentum3d";
import CollisionCharts from "./impulsemomentumcharts"; // Import the new charts
import { ENDPOINTS } from "./apiConfig";

export default function ImpulseMomentum({ onSaveData }) {
  const [params, setParams] = useState({
    mass_1: 2.0,
    initial_velocity_1: 5.0,
    mass_2: 2.0,
    initial_velocity_2: -3.0,
    restitution_coefficient: 1.0,
  });

  const [results, setResults] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sceneKey, setSceneKey] = useState(0); 
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (e) => {
    setParams({ ...params, [e.target.name]: parseFloat(e.target.value) });
  };

  const handleSimulate = async () => {
    try {
      const response = await fetch(ENDPOINTS.impulseCollision, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setResults(data);
      setIsPlaying(true);
      setSceneKey((prev) => prev + 1); 
    } catch (error) {
      console.warn("Backend collision service unavailable, falling back to local physics:", error);
      const m1 = params.mass_1, m2 = params.mass_2;
      const u1 = params.initial_velocity_1, u2 = params.initial_velocity_2;
      const e = params.restitution_coefficient;
      const totalMass = m1 + m2;
      const v1 = ((m1 - e * m2) * u1 + (1 + e) * m2 * u2) / totalMass;
      const v2 = ((1 + e) * m1 * u1 + (m2 - e * m1) * u2) / totalMass;
      const pInitial = m1 * u1 + m2 * u2;
      const pFinal = m1 * v1 + m2 * v2;
      const keInitial = 0.5 * m1 * (u1 ** 2) + 0.5 * m2 * (u2 ** 2);
      const keFinal = 0.5 * m1 * (v1 ** 2) + 0.5 * m2 * (v2 ** 2);
      setResults({
        success: true,
        restitution_coefficient: e,
        object_1: { mass_kg: m1, initial_velocity_m_per_s: u1, final_velocity_m_per_s: Number(v1.toFixed(4)), impulse_N_s: Number((m1 * (v1 - u1)).toFixed(4)) },
        object_2: { mass_kg: m2, initial_velocity_m_per_s: u2, final_velocity_m_per_s: Number(v2.toFixed(4)), impulse_N_s: Number((m2 * (v2 - u2)).toFixed(4)) },
        system: { total_initial_momentum: Number(pInitial.toFixed(4)), total_final_momentum: Number(pFinal.toFixed(4)), initial_kinetic_energy_J: Number(keInitial.toFixed(4)), final_kinetic_energy_J: Number(keFinal.toFixed(4)), kinetic_energy_loss_J: Number((keInitial - keFinal).toFixed(4)) }
      });
      setIsPlaying(true);
      setSceneKey((prev) => prev + 1);
    }
  };

  // Save observation matching App.jsx keys: mass, velocity, force, time, impulse, deltaP
  const handleSaveObservation = () => {
    const mass = params.mass_1;
    const vInitial = params.initial_velocity_1;

    // Retrieve final velocity from backend results or compute 1D elastic collision fallback
    const vFinal = results?.object_1?.final_velocity_m_per_s ?? 
      ((params.mass_1 - params.restitution_coefficient * params.mass_2) * vInitial +
        (1 + params.restitution_coefficient) * params.mass_2 * params.initial_velocity_2) /
      (params.mass_1 + params.mass_2);

    // Momentum change: Δp = m * (v_final - v_initial)
    const deltaP = Math.abs(mass * (vFinal - vInitial));

    // Collision duration estimate for dynamic cart collision
    const collisionTime = 0.05; // 50 ms contact window
    const force = deltaP / collisionTime; // F = Δp / Δt
    const impulse = force * collisionTime; // J = F * Δt

    if (onSaveData) {
      onSaveData({
        mass: Number(mass).toFixed(2),
        velocity: Number(vInitial).toFixed(2),
        force: Number(force).toFixed(2),
        time: Number(collisionTime).toFixed(3),
        impulse: Number(impulse).toFixed(3),
        deltaP: Number(deltaP).toFixed(3),
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 text-gray-800 font-sans overflow-hidden">
      
      {/* LEFT SIDEBAR: Controls */}
      <div className="w-full md:w-1/4 p-6 bg-white shadow-xl z-10 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6 text-blue-600">Dynamics Lab</h1>
        
        <div className="space-y-4 mb-6">
          <h2 className="font-semibold text-gray-700 border-b pb-1">Cart 1 (Blue)</h2>
          <div>
            <label className="block text-xs font-medium text-gray-500">Mass (kg)</label>
            <input type="number" step="0.5" name="mass_1" value={params.mass_1} onChange={handleChange} className="w-full border p-2 rounded bg-gray-50" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500">Initial Velocity (m/s)</label>
            <input type="number" step="0.5" name="initial_velocity_1" value={params.initial_velocity_1} onChange={handleChange} className="w-full border p-2 rounded bg-gray-50" />
          </div>

          <h2 className="font-semibold text-gray-700 border-b pb-1 mt-4">Cart 2 (Green)</h2>
          <div>
            <label className="block text-xs font-medium text-gray-500">Mass (kg)</label>
            <input type="number" step="0.5" name="mass_2" value={params.mass_2} onChange={handleChange} className="w-full border p-2 rounded bg-gray-50" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500">Initial Velocity (m/s)</label>
            <input type="number" step="0.5" name="initial_velocity_2" value={params.initial_velocity_2} onChange={handleChange} className="w-full border p-2 rounded bg-gray-50" />
          </div>

          <h2 className="font-semibold text-gray-700 border-b pb-1 mt-4">Environment</h2>
          <div>
            <label className="block text-xs font-medium text-gray-500">Restitution (0 = Velcro, 1 = Magnets)</label>
            <input type="number" step="0.1" min="0" max="1" name="restitution_coefficient" value={params.restitution_coefficient} onChange={handleChange} className="w-full border p-2 rounded bg-gray-50" />
          </div>
        </div>

        <button 
          onClick={handleSimulate} 
          className="w-full bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700 transition shadow-md mb-3"
        >
          Fire Carts
        </button>

        {/* SAVE READING BUTTON */}
        <button 
          onClick={handleSaveObservation} 
          className="w-full bg-emerald-600 text-white font-bold py-2.5 rounded hover:bg-emerald-700 transition shadow-md flex items-center justify-center gap-2"
        >
          <span>📥</span> Save to Observations
        </button>

        {savedSuccess && (
          <p className="text-xs text-center text-emerald-600 font-semibold mt-2">
            ✓ Reading saved to observation table!
          </p>
        )}

        {results && (
          <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-100">
            <h3 className="font-bold text-sm text-blue-800 mb-2">Photogate Readings</h3>
            <p className="text-xs text-gray-700"><strong>Cart 1 Final:</strong> {results.object_1.final_velocity_m_per_s} m/s</p>
            <p className="text-xs text-gray-700"><strong>Cart 2 Final:</strong> {results.object_2.final_velocity_m_per_s} m/s</p>
            <p className="text-xs text-gray-700 mt-2"><strong>KE Loss:</strong> {results.system.kinetic_energy_loss_J} J</p>
          </div>
        )}
      </div>

      {/* RIGHT WORKSPACE: 3D Scene + Charts */}
      <div className="w-full md:w-3/4 flex flex-col h-screen">
        
        {/* Top 60%: 3D Canvas */}
        <div className="w-full h-[60%] bg-[#1e293b] relative">
          <Scene3D key={sceneKey} params={params} results={results} isPlaying={isPlaying} />
        </div>

        {/* Bottom 40%: Charts */}
        <div className="w-full h-[40%] p-4 bg-gray-100 overflow-hidden">
          <CollisionCharts params={params} results={results} />
        </div>

      </div>
    </div>
  );
}
