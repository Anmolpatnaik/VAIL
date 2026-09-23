/**
 * AIAssistantEngine.js — VAIL 2.0 AI Virtual Lab Demonstrator & Physics Engine
 * 
 * High-performance, offline-first contextual AI assistant for virtual labs.
 * Features:
 *   - 100% Client-side physics reasoning & formula solver for all 6 experiments
 *   - Intent classification (CONCEPT, PROCEDURE, CALCULATION, DIAGNOSTIC, VIVA, GENERAL)
 *   - Live parameter injection (calculates based on student's current bench readings)
 *   - Experiment & Tab-aware suggestion chips
 *   - Fallback bridge to backend AI endpoint if available
 */

import { findPresetOrSynthesize } from "./DraftSynthesizerEngine";

// ─── EXPERIMENT KNOWLEDGE BASES ──────────────────────────────────────────

export const EXPERIMENT_KNOWLEDGE = {
  rc: {
    title: "RC Circuit Transient Analysis",
    coreFormulas: [
      { name: "Time Constant (τ)", formula: "τ = R × C", unit: "seconds (s)" },
      { name: "Charging Equation", formula: "V_C(t) = V_0 × (1 - e^(-t / τ))", unit: "Volts (V)" },
      { name: "Discharging Equation", formula: "V_C(t) = V_0 × e^(-t / τ)", unit: "Volts (V)" },
      { name: "Charging Current", formula: "I(t) = (V_0 / R) × e^(-t / τ)", unit: "Amperes (A)" },
      { name: "Half-Life Time", formula: "t_{1/2} = τ × ln(2) ≈ 0.693 × τ", unit: "seconds (s)" },
      { name: "Steady-State Duration", formula: "t_{ss} ≈ 5 × τ (reach 99.3% of V_0)", unit: "seconds (s)" }
    ],
    apparatus: [
      "Regulated DC Power Supply (0–30 V, 2 A)",
      "Resistor Decade Box (100 Ω – 100 kΩ)",
      "Electrolytic & Ceramic Capacitors (100 μF – 1000 μF)",
      "Digital Multimeter (High input impedance ≥ 10 MΩ)",
      "Precision Digital Stopwatch (0.01s resolution)",
      "Single-Pole Double-Throw (SPDT) Switch"
    ],
    procedureHighlights: [
      "1. Wire resistor R and capacitor C in series with the SPDT toggle switch and DC voltage source.",
      "2. Connect the Digital Multimeter in DC Voltage mode across the capacitor terminals.",
      "3. Switch the SPDT to CHARGE and start the stopwatch simultaneously at t = 0.",
      "4. Log capacitor voltage V_C at regular intervals (every 0.5s or 1.0s) until voltage saturates (t ≥ 5τ).",
      "5. Flip the switch to DISCHARGE and log voltage decay down to ~0 V.",
      "6. Plot V_C vs t and determine experimental τ where V_C = 0.632 × V_0."
    ],
    diagnostics: {
      "why voltage is not rising": "Ensure the SPDT toggle switch is in the 'CHARGE' position. Verify circuit continuity and check if the capacitor was discharged before starting.",
      "why experimental tau differs from theoretical": "Electrolytic capacitors have standard manufacturing tolerances of ±10% to ±20%. Additionally, the finite input impedance of the multimeter (10 MΩ) forms a slight parallel discharge path.",
      "why curve saturates": "As the capacitor charges, its opposing potential V_C approaches the source voltage V_0. The net charging current I = (V_0 - V_C) / R approaches zero, halting further charge accumulation."
    },
    vivaQuestions: [
      {
        q: "What is the physical meaning of the time constant τ in an RC circuit?",
        a: "The time constant τ = RC is the time required for the capacitor voltage to rise to 63.2% (1 - 1/e) of its maximum charging voltage V_0, or discharge to 36.8% (1/e) during discharging."
      },
      {
        q: "Why is a capacitor considered fully charged at t = 5τ?",
        a: "At t = 5τ, V_C = V_0(1 - e^(-5)) = V_0(1 - 0.0067) = 99.33% of V_0. For practical engineering and laboratory measurement purposes, this is treated as steady-state."
      },
      {
        q: "Why does the charging rate decrease with time?",
        a: "Because the current I(t) = (V_0 - V_C(t))/R decreases exponentially as V_C(t) rises, reducing the rate of charge deposition dq/dt."
      }
    ]
  },

  hysteresis: {
    title: "Magnetic Hysteresis & B-H Curve Tracer",
    coreFormulas: [
      { name: "Magnetic Field Strength (H)", formula: "H = (N × I) / L", unit: "A/m (or Oersteds)" },
      { name: "Magnetic Flux Density (B)", formula: "B = μ_0 × (H + M) = μ_r × μ_0 × H", unit: "Tesla (T)" },
      { name: "Hysteresis Energy Loss per Cycle", formula: "W_h = ∮ H dB = Area of B-H loop", unit: "J/m³ per cycle" },
      { name: "Power Loss", formula: "P_h = η × f × (B_max)^1.6 × Volume", unit: "Watts (W)" }
    ],
    apparatus: [
      "Specimen Cores (Soft Iron, Mild Steel, Ferrite rod)",
      "Magnetizing Solenoid with primary and secondary windings",
      "Variac / AC High-Current Supply (50 Hz / variable)",
      "Hall Effect Probe / Search Coil with electronic Integrator",
      "Digital Oscilloscope / Virtual Hysteresis Scope in X-Y mode"
    ],
    procedureHighlights: [
      "1. Insert the ferromagnetic specimen rod symmetrically into the magnetizing solenoid.",
      "2. Connect horizontal channel (X) proportional to magnetizing current I (giving H).",
      "3. Connect vertical channel (Y) through the RC integrator to display induced flux density B.",
      "4. Gradually increase the AC excitation current until magnetic saturation is observed.",
      "5. Measure Retentivity (B_r at H=0) and Coercivity (H_c at B=0).",
      "6. Calculate loop area to determine energy dissipated per cycle."
    ],
    diagnostics: {
      "why loop is tilted or asymmetric": "A tilted loop indicates phase shift in the integrator circuit. An asymmetric loop indicates residual DC magnetization in the specimen core.",
      "soft iron vs steel": "Soft iron exhibits high permeability, narrow loop, high retentivity, and very low coercivity (low energy loss, ideal for transformer cores). Steel exhibits wide loop, high coercivity, and high hysteresis loss (ideal for permanent magnets)."
    },
    vivaQuestions: [
      {
        q: "What is retentivity (remanence) and coercivity?",
        a: "Retentivity (B_r) is the residual magnetic flux density remaining in the core when the external field H is reduced to zero. Coercivity (H_c) is the reverse magnetizing field required to completely demagnetize the material."
      },
      {
        q: "Why is energy lost during a magnetic hysteresis cycle?",
        a: "Energy is lost as heat due to internal mechanical friction during the alignment and flipping of microscopic magnetic domains against domain wall pinning sites."
      }
    ]
  },

  string: {
    title: "Transverse Standing Waves on a Stretched String",
    coreFormulas: [
      { name: "Wave Velocity", formula: "v = √(T / μ)", unit: "m/s" },
      { name: "Tension in String", formula: "T = M × g", unit: "Newtons (N)" },
      { name: "Linear Mass Density", formula: "μ = m / L", unit: "kg/m" },
      { name: "Resonant Frequency (n loops)", formula: "f = (n / (2L)) × √(T / μ)", unit: "Hertz (Hz)" },
      { name: "Wavelength", formula: "λ = 2L / n", unit: "meters (m)" }
    ],
    apparatus: [
      "Electrically Maintained Tuning Fork / Variable Frequency Driver",
      "Inextensible Braided String with known linear mass density",
      "Frictionless Lightweight Bench Pulley",
      "Slotted Mass Hanger & Precision Weights (10g – 500g)",
      "Meter Scale & Travelling Microscope"
    ],
    procedureHighlights: [
      "1. Tie one end of the string to the vibrator prong and pass the other end over the pulley.",
      "2. Hang mass M from the free end to produce string tension T = M * g.",
      "3. Power on the vibration driver at frequency f.",
      "4. Adjust string length or suspended tension until sharp, stable standing wave loops form.",
      "5. Measure node-to-node distance d with the scale. Calculate wavelength λ = 2d / n.",
      "6. Confirm relation f = (n / 2L) * √(T / μ)."
    ],
    diagnostics: {
      "why loops are hazy or fluctuating": "The driver frequency is slightly off the string's natural resonant harmonic, or pulley friction is causing tension instability. Fine-tune tension or driver frequency.",
      "node vs antinode": "Nodes are points of zero displacement due to destructive interference. Antinodes are points of maximum oscillation amplitude due to constructive interference."
    },
    vivaQuestions: [
      {
        q: "What conditions are required for standing waves to form?",
        a: "Two identical periodic waves of the same frequency and amplitude traveling in opposite directions along the same medium must interfere constructively."
      },
      {
        q: "What is Melde's law?",
        a: "Melde's law states that for a string vibrating in transverse mode, (T / λ²) = constant, provided frequency and linear density remain unchanged."
      }
    ]
  },

  impulse: {
    title: "Impulse-Momentum Verification on Linear Air Track",
    coreFormulas: [
      { name: "Momentum", formula: "p = m × v", unit: "kg·m/s" },
      { name: "Linear Impulse", formula: "J = ∫ F dt = F_avg × Δt", unit: "N·s" },
      { name: "Impulse-Momentum Theorem", formula: "J = Δp = m(v_f - v_i)", unit: "N·s = kg·m/s" },
      { name: "Coefficient of Restitution", formula: "e = (v_2f - v_1f) / (v_1i - v_2i)", unit: "dimensionless (0 ≤ e ≤ 1)" }
    ],
    apparatus: [
      "Precision Levelled Linear Air Track with High-Flow Air Blower",
      "Gliders with Spring / Magnetic / Clay Bumpers",
      "Dual Infrared Photogate Gates with Digital Millisecond Timers",
      "Digital Force Transducer (Piezoelectric / Strain Gauge)",
      "Analytical Balance (0.01 g precision)"
    ],
    procedureHighlights: [
      "1. Level the air track until stationary gliders have zero drift.",
      "2. Measure glider mass m and flag width w accurately.",
      "3. Set photogate distance d and arm the digital timers.",
      "4. Launch glider toward force barrier sensor; record transit time t_in and t_out.",
      "5. Compute initial and final velocities v = w / t.",
      "6. Integrate force sensor curve to get J, and compare with Δp = m(v_f - v_i)."
    ],
    diagnostics: {
      "why momentum error is high": "Check air track levelness using bubble gauge; verify blower pressure to eliminate track friction; ensure photogate flags cut the IR beam orthogonally."
    },
    vivaQuestions: [
      {
        q: "Why is impulse equal to the area under a Force vs Time graph?",
        a: "By Newton's second law, F = dp/dt. Integrating both sides with respect to time yields ∫ F dt = ∫ dp = Δp = J, which geometrically is the area under the F-t curve."
      },
      {
        q: "Is momentum conserved in an inelastic collision?",
        a: "Yes! Total linear momentum is always conserved in all closed systems with zero net external forces. Only kinetic energy is dissipated into heat, sound, or deformation."
      }
    ]
  },

  edm: {
    title: "Electrical Discharge Machining (EDM) Parametric Optimization",
    coreFormulas: [
      { name: "Duty Factor (η)", formula: "η = T_on / (T_on + T_off)", unit: "dimensionless (fraction or %)" },
      { name: "Single Pulse Energy", formula: "E_p = V_g × I_p × T_on", unit: "Joules (J)" },
      { name: "Material Removal Rate (MRR)", formula: "MRR = ΔW_w / (ρ_w × t_m)", unit: "mm³/min or g/min" },
      { name: "Tool Wear Ratio (TWR)", formula: "TWR = ΔW_tool / ΔW_workpiece × 100", unit: "%" }
    ],
    apparatus: [
      "Die-Sinking EDM Machine with Z-Axis Servo Feed Control",
      "Pulse Power Supply (Variable Current 5–50 A, Voltage 40–120 V)",
      "Hydrocarbon / Deionized Dielectric Fluid System with Sub-Micron Filtration",
      "Electrolytic Copper / High-Density Graphite Tool Electrode",
      "Hardened Tool Steel Workpiece Specimen",
      "Digital Balance (0.1 mg precision) & Surface Roughness Tester"
    ],
    procedureHighlights: [
      "1. Mount workpiece securely inside dielectric tank; ensure complete submersion.",
      "2. Set peak current I_p, pulse-on time T_on, and servo gap reference.",
      "3. Start dielectric flushing jet directed at the discharge gap.",
      "4. Lower electrode under automatic servo control to maintain continuous spark gap (~25 μm).",
      "5. Machine for pre-set duration (e.g., 5.0 mins).",
      "6. Clean, dry, and weigh workpiece to evaluate MRR and TWR."
    ],
    diagnostics: {
      "why arcing occurs instead of sparking": "Arcing occurs when dielectric fluid is not deionized or debris chips accumulate in the gap. Increase flushing pressure or increase pulse-off time T_off to restore dielectric breakdown strength."
    },
    vivaQuestions: [
      {
        q: "What is the primary material removal mechanism in EDM?",
        a: "Erosion occurs by localized thermal melting and vaporization caused by high-frequency electric spark discharges across the dielectric gap, reaching temperatures of 8,000°C to 12,000°C."
      },
      {
        q: "What is the role of the dielectric fluid?",
        a: "It acts as an electrical insulator until breakdown voltage is reached, concentrates spark discharge energy, cools the tool and workpiece, and flushes eroded debris out of the spark gap."
      }
    ]
  },

  opamp: {
    title: "Operational Amplifier (IC 741) Characteristics & Applications",
    coreFormulas: [
      { name: "Inverting Amplifier Gain", formula: "A_v = -R_f / R_in", unit: "dimensionless (180° phase inversion)" },
      { name: "Non-Inverting Amplifier Gain", formula: "A_v = 1 + (R_f / R_1)", unit: "dimensionless (0° phase shift)" },
      { name: "Voltage Follower (Buffer)", formula: "A_v = 1, V_out = V_in", unit: "dimensionless" },
      { name: "Slew Rate", formula: "SR = dV_out / dt |_{max}", unit: "V/μs (0.5 V/μs for IC 741)" },
      { name: "Gain-Bandwidth Product", formula: "GBW = A_v × f_{3dB} = constant", unit: "Hz (typically 1 MHz for 741)" }
    ],
    apparatus: [
      "IC 741 / TL081 General Purpose Operational Amplifier",
      "Dual Regulated DC Power Supply (±15 V rail)",
      "Function Generator (0.1 Hz – 1 MHz, Sine / Square / Triangle)",
      "Dual-Channel Cathode Ray Oscilloscope (CRO) / DSO",
      "Breadboard, Precision Metal-Film Resistors (1 kΩ – 100 kΩ)"
    ],
    procedureHighlights: [
      "1. Connect +15 V to Pin 7 and -15 V to Pin 4; connect circuit ground.",
      "2. For Inverting Mode: connect R_in to Pin 2 (inverting input), R_f between Pin 2 and Pin 6 (output), and Pin 3 to Ground.",
      "3. Feed 1.0 kHz sinusoidal signal V_in to the input.",
      "4. Measure output peak-to-peak amplitude V_out and verify phase is inverted (180°).",
      "5. Calculate experimental gain A_v = V_out / V_in and compare with theoretical -R_f / R_in.",
      "6. Increase V_in until clipping occurs to observe rail saturation limits (±13.5 V)."
    ],
    diagnostics: {
      "why output is pegged at ±14V": "The op-amp has saturated at its supply rail. Check if the negative feedback loop is open (missing or broken R_f), or if the input voltage multiplied by gain exceeds the supply voltage V_cc - 1.5V.",
      "virtual ground concept": "Because open-loop gain A_OL is enormous (~10^5) and differential input voltage V_d = V_out / A_OL ≈ 0, the inverting terminal (Pin 2) is held at the same potential as Pin 3 (Ground), creating a virtual ground without being physically tied to 0V."
    },
    vivaQuestions: [
      {
        q: "What are the characteristics of an ideal operational amplifier?",
        a: "Infinite open-loop gain (A_OL = ∞), infinite input impedance (R_in = ∞), zero output impedance (R_out = 0), infinite bandwidth, infinite CMRR, and zero input offset voltage."
      },
      {
        q: "Why does the Op-Amp require a dual power supply (±15V)?",
        a: "To allow the output AC waveform to swing symmetrically above and below ground (0V) without clipping the negative half of the cycle."
      }
    ]
  }
};

// ─── DYNAMIC CALCULATION ENGINE ──────────────────────────────────────────

/**
 * Perform live, real-time math evaluation based on the user's active lab parameters.
 */
export function evaluateLiveCalculation(experimentId, liveValues = {}) {
  switch (experimentId) {
    case "rc": {
      const R = parseFloat(liveValues.res || liveValues.resistance || 1000);
      const C_uF = parseFloat(liveValues.cap || liveValues.capacitance || 1000);
      const V0 = parseFloat(liveValues.dcv || liveValues.voltage || 10.0);
      const C_F = C_uF * 1e-6;
      const tau = R * C_F;
      const vc_1tau = V0 * (1 - Math.exp(-1));
      const t_half = tau * Math.LN2;
      const t_99 = 5 * tau;

      return {
        tau: tau.toFixed(3),
        tauFormatted: `${tau.toFixed(3)} s`,
        halfLife: `${t_half.toFixed(3)} s`,
        steadyState: `${t_99.toFixed(2)} s`,
        vcAtOneTau: `${vc_1tau.toFixed(2)} V (63.2% of ${V0}V)`,
        summary: `With R = ${R} Ω and C = ${C_uF} μF, the theoretical time constant is τ = ${tau.toFixed(3)} seconds. At t = τ, capacitor reaches ${vc_1tau.toFixed(2)} V. It reaches steady state around ${t_99.toFixed(2)} seconds.`
      };
    }

    case "string": {
      const f = parseFloat(liveValues.frequency || 50.0);
      const T = parseFloat(liveValues.tension || 4.9);
      const mu = parseFloat(liveValues.mu || 0.002); // 2 g/m default
      const n = parseInt(liveValues.harmonicMode || liveValues.loops || 2, 10);
      const L = parseFloat(liveValues.length || 0.8);

      const v = Math.sqrt(T / mu);
      const lambda = (2 * L) / n;
      const resonantF = (n / (2 * L)) * v;

      return {
        velocity: `${v.toFixed(1)} m/s`,
        wavelength: `${lambda.toFixed(3)} m`,
        resonantFreq: `${resonantF.toFixed(1)} Hz`,
        summary: `For string tension T = ${T.toFixed(2)} N and mass density μ = ${(mu * 1000).toFixed(1)} g/m: wave speed v = ${v.toFixed(1)} m/s. For ${n} loops on length ${L} m, resonant frequency is ${resonantF.toFixed(1)} Hz.`
      };
    }

    case "opamp": {
      const Rin = parseFloat(liveValues.rin || liveValues.res || 10000);
      const Rf = parseFloat(liveValues.rf || 100000);
      const Vin = parseFloat(liveValues.acv || liveValues.vin || 1.0);
      const invertingGain = - (Rf / Rin);
      const nonInvertingGain = 1 + (Rf / Rin);
      const voutInverting = invertingGain * Vin;

      return {
        invertingGain: invertingGain.toFixed(2),
        nonInvertingGain: nonInvertingGain.toFixed(2),
        expectedVout: `${voutInverting.toFixed(2)} V`,
        summary: `With R_in = ${(Rin/1000).toFixed(1)} kΩ and R_f = ${(Rf/1000).toFixed(1)} kΩ: Inverting Gain A_v = ${invertingGain.toFixed(2)} (Output is 180° out of phase). Non-inverting Gain A_v = +${nonInvertingGain.toFixed(2)}.`
      };
    }

    case "impulse": {
      const m = parseFloat(liveValues.mass || 0.25);
      const v1 = parseFloat(liveValues.v1 || 0.52);
      const v2 = parseFloat(liveValues.v2 || -0.48);
      const deltaP = m * (v2 - v1);
      const J = Math.abs(deltaP);

      return {
        initialMomentum: `${(m * v1).toFixed(3)} kg·m/s`,
        finalMomentum: `${(m * v2).toFixed(3)} kg·m/s`,
        deltaP: `${deltaP.toFixed(3)} N·s`,
        impulse: `${J.toFixed(3)} N·s`,
        summary: `Glider mass = ${m} kg: Initial momentum = ${(m * v1).toFixed(3)} kg·m/s, Final momentum = ${(m * v2).toFixed(3)} kg·m/s. Momentum change Δp = ${deltaP.toFixed(3)} N·s.`
      };
    }

    case "hysteresis": {
      const maxH = parseFloat(liveValues.maxH || 500);
      const maxB = parseFloat(liveValues.maxB || 1.45);
      const loopArea = parseFloat(liveValues.loopArea || 1420);

      return {
        maxH: `${maxH} A/m`,
        maxB: `${maxB} T`,
        loopArea: `${loopArea} J/m³`,
        energyLossPerCycle: `${loopArea} J/m³`,
        summary: `Peak field H_max = ${maxH} A/m, Peak flux density B_max = ${maxB} T. The hysteresis loop area indicates an energy dissipation of ${loopArea} J/m³ per cycle.`
      };
    }

    case "edm": {
      const current = parseFloat(liveValues.current || 15.0);
      const mrr = parseFloat(liveValues.mrr || 24.5);
      const depth = parseFloat(liveValues.depth || 1.25);

      return {
        current: `${current} A`,
        mrr: `${mrr} mm³/min`,
        depth: `${depth} mm`,
        summary: `Discharge current = ${current} A: Material removal rate is estimated at ${mrr} mm³/min with current cavity depth ${depth} mm.`
      };
    }

    default:
      return null;
  }
}

// ─── QUERY CLASSIFICATION & RESPONSE GENERATOR ────────────────────────────

/**
 * Generate intelligent, contextual demonstrator response.
 */
export async function generateAssistantResponse(query, context = {}) {
  const normQuery = query.toLowerCase().trim();
  const expId = context.experimentId || "rc";
  let expInfo = EXPERIMENT_KNOWLEDGE[expId];
  if (!expInfo && expId.startsWith("draft-")) {
    const draftConfig = findPresetOrSynthesize(expId);
    if (draftConfig) {
      expInfo = {
        title: draftConfig.title,
        coreFormulas: (draftConfig.theory?.formulaDetails || []).map(f => ({
          name: f.name,
          formula: f.formula,
          unit: "SI"
        })),
        apparatus: (draftConfig.apparatus || []).map(a => `${a.name} (${a.spec})`),
        procedureHighlights: draftConfig.procedure || [],
        diagnostics: {
          "why readings are zero": "Check parameter sliders and verify circuit continuity on the simulation bench."
        },
        vivaQuestions: (draftConfig.viva || []).map(v => ({ q: v[0], a: v[1] }))
      };
    }
  }
  if (!expInfo) expInfo = EXPERIMENT_KNOWLEDGE.rc;
  const activeTab = context.activeTab || "experiment";
  const liveValues = context.liveValues || {};
  const observations = context.observations || [];

  // Check 1: Greetings & Identity
  if (/^(hi|hello|hey|greetings|who are you|help|namaste)/.test(normQuery)) {
    return {
      type: "GREETING",
      text: `Hello! I am your **VAIL Virtual Lab Demonstrator & AI Copilot** 🔬.

I am actively monitoring your workstation for **${expInfo.title}**.

Here is how I can assist you right now:
- 📐 **Live Calculations**: I can compute theoretical values like time constant τ, wave speeds, gain, and errors based on your bench sliders.
- 📋 **Procedural Guidance**: Step-by-step instructions on wiring, instrument connections, and tab milestones.
- 🔍 **Diagnostics**: Instant troubleshooting if your readings look unexpected, flat, or noisy.
- 🎯 **Viva Prep**: Test your understanding with authentic laboratory examiner oral questions.

Ask me anything, or tap one of the suggestion chips below!`
    };
  }

  // Check 2: Live Calculation / Formula / Math Requests
  const isCalcQuery = /(calculate|calc|tau|time constant|formula|value|math|error|percentage|gain|wavelength|velocity|momentum|loop area|mrr)/.test(normQuery);
  if (isCalcQuery) {
    const liveMath = evaluateLiveCalculation(expId, liveValues);
    let formulaList = expInfo.coreFormulas.map(f => `• **${f.name}**: \`${f.formula}\` (${f.unit})`).join("\n");

    let liveSection = "";
    if (liveMath && liveMath.summary) {
      liveSection = `\n\n### ⚡ Live Calculation for your Current Bench:\n${liveMath.summary}\n`;
      if (liveMath.tauFormatted) liveSection += `\n- **Time Constant (τ)**: \`${liveMath.tauFormatted}\``;
      if (liveMath.halfLife) liveSection += `\n- **Half-Life (t₁/₂)**: \`${liveMath.halfLife}\``;
      if (liveMath.steadyState) liveSection += `\n- **Steady State (5τ)**: \`${liveMath.steadyState}\``;
      if (liveMath.velocity) liveSection += `\n- **Wave Velocity (v)**: \`${liveMath.velocity}\``;
      if (liveMath.invertingGain) liveSection += `\n- **Inverting Gain (A_v)**: \`${liveMath.invertingGain}\``;
      if (liveMath.deltaP) liveSection += `\n- **Impulse / Δp**: \`${liveMath.deltaP}\``;
    }

    return {
      type: "CALCULATION",
      text: `Here are the foundational mathematical relations for **${expInfo.title}**:${liveSection}\n\n### 📚 Standard Governing Equations:\n${formulaList}\n\n*Tip: You can log your current reading into the Observations table using the multimeter's "Log" button.*`
    };
  }

  // Check 3: Troubleshooting / Diagnostics
  const isTroubleshoot = /(why|error|wrong|not working|flat|stuck|zero|different|troubleshoot|problem|issue|differ|tolerance)/.test(normQuery);
  if (isTroubleshoot) {
    for (const [key, solution] of Object.entries(expInfo.diagnostics)) {
      if (normQuery.includes(key) || key.split(" ").some(word => normQuery.includes(word))) {
        return {
          type: "DIAGNOSTIC",
          text: `### 🛠️ Lab Demonstrator Diagnostic Check:\n\n**Observed Issue:** "${key}"\n\n**Solution & Physics Explanation:**\n${solution}\n\n**Next Recommended Step:** Check your wiring switch state or verify slider parameters in the control panel.`
        };
      }
    }
    // Generic diagnostic response
    return {
      type: "DIAGNOSTIC",
      text: `### 🛠️ Lab Troubleshooting Guide for ${expInfo.title}:
1. **Check Switch / Power State**: Make sure the power toggle is ON and the SPDT switch is in the active position.
2. **Verify Instrument Bounds**: Check if the Multimeter or Oscilloscope is set to the correct scale (DC vs AC, appropriate range).
3. **Component Limits**: Check if values have saturated (e.g. at rail voltages in Op-Amp, or after $5\\tau$ in RC charging).
4. **Observation Count**: Remember you can record up to 5 experimental trials before needing to clear or export your data.`
    };
  }

  // Check 4: Procedure / Apparatus / Next Step
  const isProcedure = /(procedure|step|apparatus|equipment|how to|what do i do|next|wire|connect|start)/.test(normQuery);
  if (isProcedure) {
    const apparatusList = expInfo.apparatus.map(item => `• ${item}`).join("\n");
    const stepsList = expInfo.procedureHighlights.join("\n\n");

    return {
      type: "PROCEDURE",
      text: `### 📋 Step-by-Step Procedure for ${expInfo.title}:\n\n${stepsList}\n\n### 🧰 Required Apparatus & Instruments:\n${apparatusList}\n\n*You can also consult the "Procedure" tab above to check off each step as you complete it.*`
    };
  }

  // Check 5: Viva Voce & Oral Exam Quiz
  const isViva = /(viva|quiz|interview|test me|oral|question|ask me)/.test(normQuery);
  if (isViva) {
    const qIndex = Math.floor(Math.random() * expInfo.vivaQuestions.length);
    const item = expInfo.vivaQuestions[qIndex];
    return {
      type: "VIVA",
      text: `### 🎓 Viva Voce Oral Examiner Question:\n\n**Q: ${item.q}**\n\n*Think through your reasoning, then reveal the standard answer below:*
\n<details style="margin-top: 10px; padding: 10px; background: rgba(56, 189, 248, 0.1); border-left: 3px solid #38bdf8; border-radius: 6px;">
<summary style="cursor: pointer; font-weight: bold; color: #38bdf8;">👁️ Click to Reveal Standard Model Answer</summary>
\n**A:** ${item.a}
</details>`
    };
  }

  // Check 6: Theory & Principle
  const isTheory = /(theory|principle|explain|what is|working|concept|law|definition)/.test(normQuery);
  if (isTheory) {
    const topFormula = expInfo.coreFormulas[0];
    return {
      type: "THEORY",
      text: `### 📖 Theoretical Foundation of ${expInfo.title}:

The core principle relies on **${topFormula.name}**:
\`${topFormula.formula}\` (${topFormula.unit})

${expInfo.procedureHighlights[0]}
${expInfo.procedureHighlights[1]}

**Key Insights:**
- Every measurement in this lab explores real physical non-idealities alongside mathematical models.
- Refer to the **Theory** and **Calculations** tabs for full derivations and graphical analyses.`
    };
  }

  // Default Fallback
  return {
    type: "GENERAL",
    text: `I understand you are asking about: "${query}".

In **${expInfo.title}**, you are currently on the **${activeTab.toUpperCase()}** tab.
- Theoretical Time/Governing parameter: \`${expInfo.coreFormulas[0].formula}\`
- Active Readings: ${JSON.stringify(liveValues)}

Would you like me to:
1. Walk you through the **procedure** step-by-step?
2. **Calculate** theoretical values for your active sliders?
3. Help **troubleshoot** an unexpected result?
4. Quiz you with an oral **Viva question**?`
  };
}

// ─── CONTEXTUAL QUICK-PROMPT SUGGESTIONS ──────────────────────────────────

/**
 * Returns 4 smart, 1-click prompt suggestion chips based on active experiment & tab.
 */
export function getContextualSuggestions(experimentId = "rc", activeTab = "experiment") {
  const common = {
    rc: {
      experiment: [
        "Calculate my time constant τ",
        "Why is the voltage curve exponential?",
        "How do I log readings into the table?",
        "Ask me a Viva question on RC circuits"
      ],
      theory: [
        "Derive the differential equation for charging",
        "What happens at t = 5τ?",
        "Explain half-life time in capacitors",
        "What is the physical meaning of τ?"
      ],
      procedure: [
        "What are the required apparatus ratings?",
        "How to switch between charge and discharge?",
        "What precautions should I take?",
        "How to verify steady-state voltage?"
      ],
      calculations: [
        "Compare my experimental τ vs theoretical τ",
        "How to calculate percentage error?",
        "What is the slope of ln(1 - V/V0)?",
        "Show standard result statement"
      ]
    },
    hysteresis: {
      experiment: [
        "What does the B-H loop area represent?",
        "Difference between Soft Iron and Steel?",
        "How to find Retentivity and Coercivity?",
        "Ask me a Viva question on Hysteresis"
      ],
      theory: [
        "Explain magnetic domain theory",
        "What is Steinmetz hysteresis law?",
        "Why does hysteresis dissipate energy?",
        "Define magnetic coercivity H_c"
      ]
    },
    string: {
      experiment: [
        "Calculate wave velocity for my tension",
        "Why are nodes and antinodes formed?",
        "What is Melde's transverse law?",
        "Ask me a Viva question on standing waves"
      ],
      calculations: [
        "Calculate linear density μ from string mass",
        "Verify f = (n / 2L) * √(T / μ)",
        "How to compute percentage error in frequency?",
        "Explain sources of error in pulley friction"
      ]
    },
    impulse: {
      experiment: [
        "Verify Impulse-Momentum Theorem for my glider",
        "What is coefficient of restitution e?",
        "Why must the air track be levelled?",
        "Ask me a Viva question on collisions"
      ]
    },
    edm: {
      experiment: [
        "Calculate Material Removal Rate (MRR)",
        "What is the role of the dielectric fluid?",
        "Explain the duty factor formula",
        "Ask me a Viva question on EDM"
      ]
    },
    opamp: {
      experiment: [
        "Calculate theoretical gain for my resistors",
        "Why is the inverting output 180° out of phase?",
        "What is the virtual ground concept?",
        "Ask me a Viva question on Op-Amps"
      ]
    }
  };

  const expChips = common[experimentId] || common.rc;
  const tabChips = expChips[activeTab] || expChips.experiment || common.rc.experiment;
  return tabChips.slice(0, 4);
}
