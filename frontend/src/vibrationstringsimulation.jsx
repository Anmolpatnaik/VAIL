import React, { useState } from 'react';
import Scene3D from "./vibrationstring3D"; // Verify this matches your file casing exactly!
import VibrationCharts from "./vibrationstringcharts";

export default function VibrationStringSimulation({ onSaveData }) {
  const [params, setParams] = useState({
    length: 1.0,
    tension: 10.0,
    linear_density: 0.001,
    amplitude: 0.05,
    mode: 2,
    duration: 5.0,
    damping_factor: 0.0,
    spatial_points: 100,
    time_points: 100
  });

  const [results, setResults] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (e) => {
    setParams({ ...params, [e.target.name]: parseFloat(e.target.value) });
  };

  const handleSimulate = async () => {
    try {
      // Connects to your FastAPI string module on port 8003
      const response = await fetch('http://localhost:8000/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      
      const data = await response.json();
      setResults(data);
      setIsPlaying(true);
    } catch (error) {
      console.error("Simulation failed:", error);
      alert("Backend connection failed. Ensure main.py is running on port 8003.");
    }
  };

  // Save observation directly matching App.jsx keys: tension, length, frequency, speed, wavelength
  const handleSaveObservation = () => {
    // Determine wave speed and wavelength from backend results or standard standing wave formula
    const waveSpeed = results?.physics?.wave_speed_m_per_s ?? Math.sqrt(params.tension / params.linear_density);
    const wavelength = results?.physics?.wavelength_m ?? (2 * params.length) / params.mode;
    const frequency = results?.physics?.frequency_hz ?? waveSpeed / wavelength;

    if (onSaveData) {
      onSaveData({
        tension: Number(params.tension).toFixed(2),
        length: Number(params.length).toFixed(2),
        frequency: Number(frequency).toFixed(2),
        speed: Number(waveSpeed).toFixed(2),
        wavelength: Number(wavelength).toFixed(3),
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 text-gray-800 font-sans overflow-hidden">
      
      {/* LEFT SIDEBAR: Controls */}
      <div className="w-full md:w-1/4 p-6 bg-white shadow-xl z-10 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-2 text-indigo-600">Melde's String Lab</h1>
        <p className="text-sm text-gray-500 mb-6">Investigate standing waves and harmonics.</p>
        
        <div className="space-y-4 mb-6">
          <h2 className="font-semibold text-gray-700 border-b pb-1">String Properties</h2>
          
          <div>
            <label className="block text-xs font-medium text-gray-500">
              String Type (Linear Density kg/m)
            </label>
            <select 
              name="linear_density" 
              value={params.linear_density} 
              onChange={handleChange} 
              className="w-full border p-2 rounded bg-gray-50 text-sm"
            >
              <option value={0.001}>Fine Copper Wire (0.001 kg/m)</option>
              <option value={0.005}>White Elastic String (0.005 kg/m)</option>
              <option value={0.010}>Thick Heavy Cord (0.010 kg/m)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500">
              String Length (m)
            </label>
            <div className="flex items-center gap-2">
              <input type="range" name="length" min="0.5" max="3.0" step="0.1" value={params.length} onChange={handleChange} className="w-full" />
              <span className="text-sm font-mono">{params.length}m</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500">
              Tension via Slotted Masses (N)
            </label>
            <div className="flex items-center gap-2">
              <input type="range" name="tension" min="5" max="50" step="5" value={params.tension} onChange={handleChange} className="w-full" />
              <span className="text-sm font-mono">{params.tension}N</span>
            </div>
          </div>

          <h2 className="font-semibold text-gray-700 border-b pb-1 mt-4">Signal Generator</h2>
          
          <div>
            <label className="block text-xs font-medium text-gray-500">
              Harmonic Mode (n)
            </label>
            <div className="flex items-center gap-2">
              <input type="range" name="mode" min="1" max="6" step="1" value={params.mode} onChange={handleChange} className="w-full" />
              <span className="text-sm font-mono">{params.mode}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500">
              Amplitude (m)
            </label>
            <input type="number" step="0.01" min="0.01" max="0.1" name="amplitude" value={params.amplitude} onChange={handleChange} className="w-full border p-2 rounded bg-gray-50" />
          </div>
        </div>

        <button 
          onClick={handleSimulate} 
          className="w-full bg-indigo-600 text-white font-bold py-3 rounded hover:bg-indigo-700 transition shadow-md mb-3"
        >
          Power On Generator
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
          <div className="mt-6 p-4 bg-indigo-50 rounded border border-indigo-100">
            <h3 className="font-bold text-sm text-indigo-800 mb-2">Theoretical Calculations</h3>
            <p className="text-xs text-gray-700"><strong>Wave Speed (v):</strong> {results.physics.wave_speed_m_per_s.toFixed(2)} m/s</p>
            <p className="text-xs text-gray-700"><strong>Target Frequency (f):</strong> {results.physics.frequency_hz.toFixed(2)} Hz</p>
            <p className="text-xs text-gray-700"><strong>Wavelength (λ):</strong> {results.physics.wavelength_m.toFixed(2)} m</p>
          </div>
        )}
      </div>

      {/* RIGHT WORKSPACE: 3D Scene + Charts */}
      <div className="w-full md:w-3/4 flex flex-col h-screen">
        
        {/* Top 60%: 3D Canvas */}
        <div className="w-full h-[60%] bg-[#1e293b] relative">
          <Scene3D params={params} results={results} isPlaying={isPlaying} />
        </div>

        {/* Bottom 40%: Charts */}
        <div className="w-full h-[40%] p-4 bg-gray-100 overflow-hidden">
          <VibrationCharts params={params} results={results} />
        </div>

      </div>
    </div>
  );
}