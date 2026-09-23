/**
 * DraftSynthesizerEngine.js — VAIL 2.0 Generative Experiment Synthesizer & Draft Store
 * 
 * Provides:
 *   1. Built-in physics templates for popular engineering physics experiments
 *   2. Universal physics model synthesizer for arbitrary user search queries
 *   3. LocalStorage persistence & CRUD for custom/drafted virtual laboratories
 *   4. Backend AI generation bridge
 */

const STORAGE_KEY = "vail_custom_experiments";

// ─── HIGH-FIDELITY TEMPLATES FOR COMMON SEARCHED LABS ─────────────────────

export const PRESET_TEMPLATES = {
  "meterbridge": {
    id: "draft-meter-bridge",
    title: "Resistance & Specific Resistance by Meter Bridge",
    subtitle: "Current Electricity & Wheatstone Bridge Principle",
    branch: "eee",
    discipline: "Electrical Engineering / Physics",
    level: "B.Tech Year 1",
    icon: "📏",
    isDraft: true,
    author: "VAIL Scientific Engine",
    description: "Determine the unknown resistance of a metallic wire and evaluate its specific resistance (resistivity) using a balanced Wheatstone Meter Bridge.",
    video: {
      title: "Meter Bridge & Wheatstone Null-Balance Briefing",
      summary: "Step-by-step procedure to calibrate the resistance box, locate the null deflection point on the 100 cm wire using the sliding jockey, and calculate wire resistivity.",
      hasVideo: false
    },
    safety: {
      protocol: "UPEM / Current Electricity & Low-Voltage DC Protocol",
      isElectrical: true,
      precautions: [
        {
          title: "⚠️ Do Not Scrape or Drag the Jockey Along the Wire",
          severity: "danger",
          borderColor: "#ef4444",
          titleColor: "#f87171",
          description: "Dragging the jockey scrapes the wire, destroying its uniform cross-sectional area and causing large systematic balancing errors. Always lift and gently tap the jockey."
        },
        {
          title: "⚡ Prevent Joule Heating (I²Rt)",
          severity: "warning",
          borderColor: "#f59e0b",
          titleColor: "#fbbf24",
          description: "Keep the battery plug key pressed only while taking readings. Continuous current warms the wire and alters its resistance."
        },
        {
          title: "🎯 Keep Null Point in Central Region (35 cm – 65 cm)",
          severity: "safe",
          borderColor: "#38bdf8",
          titleColor: "#38bdf8",
          description: "Wheatstone bridge has maximum sensitivity when P ≈ Q ≈ R ≈ S. If l is near 0 or 100 cm, end resistances introduce significant percentage error."
        }
      ]
    },
    simulation: {
      type: "parametric_rig",
      scene: "meter_bridge",
      parameters: [
        { id: "knownResistance", label: "Known Resistance (R)", unit: "Ω", min: 1, max: 50, default: 5, step: 1 },
        { id: "jockeyPos", label: "Jockey Position (l)", unit: "cm", min: 1, max: 99, default: 40, step: 0.5 },
        { id: "unknownResistance", label: "Unknown Resistance (X)", unit: "Ω", min: 2, max: 25, default: 7.5, step: 0.5 },
        { id: "wireLength", label: "Specimen Wire Length (L)", unit: "cm", min: 10, max: 100, default: 50, step: 5 },
        { id: "wireRadius", label: "Wire Radius (r)", unit: "mm", min: 0.1, max: 1.0, default: 0.25, step: 0.05 }
      ],
      physicsModel: {
        equations: [
          "l = jockeyPos",
          "l_remain = 100 - l",
          "null_l = (knownResistance / (knownResistance + unknownResistance)) * 100",
          "bridgeBalanceError = l - null_l",
          "galvanoDeflection = max(-30, min(30, bridgeBalanceError * 2.8))",
          "measuredX = (knownResistance * l_remain) / max(0.1, l)",
          "isBalanced = abs(bridgeBalanceError) < 0.8 ? 1 : 0",
          "radius_m = wireRadius * 1e-3",
          "crossSectionArea = pi * (radius_m ^ 2)",
          "resistivity_ohm_m = (measuredX * crossSectionArea) / (wireLength * 1e-2)",
          "resistivity_u_ohm_cm = resistivity_ohm_m * 1e8"
        ],
        sweepVariable: "jockeyPos",
        sweepMin: 5,
        sweepMax: 95,
        plotX: "jockeyPos",
        plotY: "galvanoDeflection",
        xLabel: "Jockey Position l (cm)",
        yLabel: "Galvanometer Deflection (μA)",
        instruments: {
          dmm: { mode: "DCV", variable: "galvanoDeflection" }
        }
      }
    },
    apparatus: [
      { name: "Meter Bridge with 1m Wooden Scale", spec: "Calibrated 0 – 100 cm Constantan wire on Teak Board", quantity: "1 Unit", icon: "📏" },
      { name: "Center-Zero Pointer Galvanometer", spec: "Sensitivity 30–0–30 μA with high damping", quantity: "1 Unit", icon: "📟" },
      { name: "Decade Resistance Box", spec: "1 – 100 Ω (±0.1% Manganin non-inductive coils)", quantity: "1 Unit", icon: "🔲" },
      { name: "Specimen Resistance Wire", spec: "Uniform gauge Nichrome / Constantan specimen", quantity: "1 Coil", icon: "➰" },
      { name: "Knife-Edge Sliding Jockey", spec: "Heavy brass body with insulated handle", quantity: "1 Unit", icon: "📍" },
      { name: "DC Battery Eliminator / Cell", spec: "Regulated 2.0 V DC (1 A limiting)", quantity: "1 Unit", icon: "🔋" }
    ],
    theory: {
      title: "Wheatstone Bridge Principle & Meter Bridge Theory",
      objective: "To measure the unknown resistance X of a specimen wire using the balanced Wheatstone bridge principle, and calculate its specific resistance (resistivity) ρ.",
      formulaDetails: [
        {
          name: "Wheatstone Bridge Null Balance Condition",
          formula: "P / Q = R / S  ==>  R / X = l / (100 - l)",
          description: "When the potential at the central galvanometer tap equals the potential at the jockey contact, no current flows through the galvanometer (null deflection)."
        },
        {
          name: "Unknown Resistance Equation",
          formula: "X = R · (100 - l) / l",
          description: "Allows high-precision resistance measurement independent of battery voltage fluctuations."
        },
        {
          name: "Specific Resistance (Resistivity)",
          formula: "ρ = (X · π · r²) / L",
          description: "Physical intrinsic property of the wire material in Ohm-meters (Ω·m)."
        }
      ]
    },
    procedure: [
      "1. Connect the resistance box R in the left gap and the unknown resistance wire X in the right gap.",
      "2. Connect the 2V DC supply across end terminals A and B, and connect the galvanometer between the central terminal D and the sliding jockey.",
      "3. Close the battery key; gently tap the jockey at 5 cm and 95 cm to verify opposite galvanometer deflections.",
      "4. Introduce a known resistance R (e.g. 5 Ω) from the resistance box.",
      "5. Gently tap the jockey along the 100 cm wire until the galvanometer needle rests at exactly ZERO (null balance).",
      "6. Note the balancing length l (cm) and calculate X = R * (100 - l) / l."
    ],
    observations: {
      name: "Meter_Bridge_Observations",
      rows: [
        { id: "knownResistance", label: "Resistance from Box R (Ω)", type: "input" },
        { id: "jockeyPos", label: "Balancing Length l (cm)", type: "observed" },
        { id: "l_remain", label: "Length (100 - l) (cm)", type: "observed" },
        { id: "measuredX", label: "Unknown Resistance X (Ω)", type: "observed" },
        { id: "galvanoDeflection", label: "Galvanometer Deflection (μA)", type: "observed" }
      ]
    },
    calculations: {
      title: "Determination of Resistance & Resistivity",
      overview: "Compute unknown resistance X for each trial and evaluate specific resistance ρ = X * A / L.",
      steps: [
        { step: 1, title: "Balancing Formula", equation: "X = R × (100 - l) / l" },
        { step: 2, title: "Cross-Sectional Area", equation: "A = π × r²  (m²)" },
        { step: 3, title: "Specific Resistance", equation: "ρ = (X × A) / L  (Ω·m)" }
      ]
    },
    viva: [
      ["Why is the apparatus called a Meter Bridge?", "Because it consists of a uniform metallic resistance wire of exactly one meter (100 cm) in length."],
      ["Why should the jockey not be scraped along the wire?", "Scraping cuts or deforms the wire, making its cross-sectional area non-uniform and introducing permanent errors in balancing."],
      ["Where is the bridge most sensitive?", "When the null point lies near the center (around 50 cm), because all four arms of the Wheatstone bridge have comparable resistance (P ≈ Q ≈ R ≈ S)."],
      ["What is null point in a meter bridge?", "The point on the wire where contact with the jockey yields zero deflection in the galvanometer, indicating bridge balance."],
      ["Why is constantan or manganin wire used for the bridge?", "Because they have a high resistivity and an extremely low temperature coefficient of resistance."]
    ]
  },
  "photoelectric": {
    id: "draft-photoelectric-effect",
    title: "Photoelectric Effect & Planck's Constant",
    subtitle: "Quantum Physics & Modern Electronics",
    branch: "ece",
    discipline: "Physics / Electronics",
    level: "B.Tech Year 1",
    icon: "💡",
    isDraft: true,
    author: "VAIL AI Synthesizer",
    description: "Measure the stopping potential as a function of incident monochromatic light frequency and experimentally evaluate Planck's constant h.",
    video: {
      title: "Photoelectric Effect Laboratory Briefing",
      summary: "Study of photon absorption, electron emission thresholds, stopping potential measurement, and experimental determination of Planck's constant.",
      hasVideo: false
    },
    safety: {
      protocol: "UPEM / Optical & UV Radiation Protocol",
      isElectrical: true,
      precautions: [
        {
          title: "⚡ UV Light Eye Protection",
          severity: "danger",
          borderColor: "#ef4444",
          titleColor: "#f87171",
          description: "Never view monochromatic UV sources directly. Shield optical housing to avoid corneal exposure."
        },
        {
          title: "🔌 High-Impedance Sensor Care",
          severity: "warning",
          borderColor: "#f59e0b",
          titleColor: "#fbbf24",
          description: "Microammeter is sensitive to electrostatic discharge. Ensure ground strap is secured."
        }
      ]
    },
    simulation: {
      type: "parametric_rig",
      scene: "phototube",
      parameters: [
        { id: "wavelength", label: "Wavelength (λ)", unit: "nm", min: 200, max: 700, default: 400, step: 10 },
        { id: "intensity", label: "Light Intensity", unit: "%", min: 10, max: 100, default: 50, step: 5 },
        { id: "retardingV", label: "Retarding Potential", unit: "V", min: -3.0, max: 3.0, default: 0.0, step: 0.05 }
      ],
      physicsModel: {
        equations: [
          "frequency = (3e8) / (wavelength * 1e-9)",
          "freq_10_14 = frequency / 1e14",
          "photonEnergy_eV = (6.626e-34 * frequency) / 1.602e-19",
          "workFunction_eV = 2.25",
          "maxKE_eV = max(0, photonEnergy_eV - workFunction_eV)",
          "stoppingPotential = maxKE_eV",
          "netV = retardingV + stoppingPotential",
          "current_uA = (netV > 0 && maxKE_eV > 0) ? (intensity * 0.45 * sqrt(netV)) : 0"
        ],
        sweepVariable: "wavelength",
        sweepMin: 250,
        sweepMax: 650,
        plotX: "freq_10_14",
        plotY: "stoppingPotential",
        xLabel: "Frequency ν (×10¹⁴ Hz)",
        yLabel: "Stopping Potential V_s (V)",
        instruments: {
          dmm: { mode: "DCV", variable: "retardingV" },
          dma: { mode: "DCA", variable: "current_uA", unit: "μA" }
        }
      }
    },
    apparatus: [
      { name: "Monochromatic Light Source", spec: "Variable 200–700 nm with Monochromator", quantity: "1 Unit", icon: "💡" },
      { name: "Phototube (Cesium Photocell)", spec: "Vacuum Envelope with Collector Ring", quantity: "1 Unit", icon: "🔬" },
      { name: "Precision Variable DC Source", spec: "±3.00 V (0.01 V resolution)", quantity: "1 Unit", icon: "🔋" },
      { name: "High-Sensitivity Microammeter", spec: "0 – 100 μA (0.1 μA resolution)", quantity: "1 Unit", icon: "📟" }
    ],
    theory: {
      title: "Einstein's Photoelectric Law",
      objective: "To verify Einstein's photoelectric equation and experimentally measure Planck's Constant h and work function Φ.",
      formulaDetails: [
        {
          name: "Photoelectric Equation",
          formula: "K_{max} = h·ν - Φ = e·V_s",
          description: "Light behaves as discrete packets of energy (photons). When a photon strikes an electron, its entire energy hν is transferred instantaneously."
        },
        {
          name: "Planck's Constant Slope",
          formula: "h = e · (dV_s / dν)",
          description: "The slope of the Stopping Potential (V_s) vs Frequency (ν) curve multiplied by elementary charge e yields Planck's constant."
        }
      ]
    },
    procedure: [
      "Select the incident monochromatic wavelength λ (start with 400 nm).",
      "Set light intensity to 50% and observe initial photocurrent on the microammeter.",
      "Gradually increase the retarding potential until the photocurrent drops exactly to 0 μA.",
      "Record this cut-off voltage as the stopping potential V_s.",
      "Repeat for 5 distinct wavelengths (350 nm, 400 nm, 450 nm, 500 nm, 550 nm).",
      "Plot V_s versus frequency ν to evaluate the slope (h/e)."
    ],
    observations: {
      name: "Photoelectric_Observations",
      rows: [
        { id: "wavelength", label: "Wavelength λ (nm)", type: "input" },
        { id: "frequency", label: "Frequency ν (×10¹⁴ Hz)", type: "observed" },
        { id: "stoppingPotential", label: "Stopping Potential V_s (V)", type: "observed" },
        { id: "intensity", label: "Intensity (%)", type: "input" }
      ]
    },
    calculations: {
      title: "Determination of Planck's Constant",
      overview: "Compute the linear slope of Stopping Potential vs Frequency: slope m = ΔV_s / Δν. Then evaluate h = e × m.",
      steps: [
        { step: 1, title: "Frequency Calculation", equation: "ν = c / λ" },
        { step: 2, title: "Evaluate Slope", equation: "m = (V_{s2} - V_{s1}) / (ν_2 - ν_1)" },
        { step: 3, title: "Compute Planck's Constant", equation: "h = 1.602×10⁻¹⁹ × m  (J·s)" },
        { step: 4, title: "Compute Percentage Error", equation: "% Error = |h_{exp} - 6.626×10⁻³⁴| / 6.626×10⁻³⁴ × 100%" }
      ]
    },
    viva: [
      ["What is a photon?", "A discrete quantum of electromagnetic radiation with energy E = hν."],
      ["Why does stopping potential depend on frequency but not intensity?", "Because photon energy depends only on frequency; intensity only alters the number of photons, not their individual kinetic energy."],
      ["What is the work function of a metal?", "The minimum energy required to liberate an electron from the metal surface."]
    ]
  },

  "hooke": {
    id: "draft-hookes-law-spring",
    title: "Hooke's Law & Spring Constant",
    subtitle: "Solid Mechanics & Elasticity",
    branch: "mech",
    discipline: "Mechanical Engineering / Physics",
    level: "B.Tech Year 1",
    icon: "🧲",
    isDraft: true,
    author: "VAIL AI Synthesizer",
    description: "Determine the spring stiffness constant k using static extension and dynamic simple harmonic oscillation methods.",
    video: {
      title: "Hooke's Law & Spring Oscillations Briefing",
      summary: "Demonstration of static spring elongation under load, measurement of spring stiffness k, and dynamic verification using simple harmonic oscillations.",
      hasVideo: false
    },
    safety: {
      protocol: "UPEM / Mechanics & Structural Elasticity Protocol",
      isElectrical: false,
      precautions: [
        {
          title: "⚖️ Elastic Limit Overload Warning",
          severity: "danger",
          borderColor: "#ef4444",
          titleColor: "#f87171",
          description: "Do not exceed maximum rated load (1000g). Plastic deformation permanently ruins the helical spring."
        },
        {
          title: "➰ Recoil & Weight Security",
          severity: "warning",
          borderColor: "#f59e0b",
          titleColor: "#fbbf24",
          description: "Always place masses gently on the hanger. Release displaced mass smoothly to maintain vertical 1D oscillation without swinging."
        }
      ]
    },
    simulation: {
      type: "parametric_rig",
      scene: "oscillating_spring",
      parameters: [
        { id: "mass", label: "Suspended Mass (M)", unit: "g", min: 50, max: 1000, default: 200, step: 25 },
        { id: "k_spring", label: "Spring Constant (k)", unit: "N/m", min: 10, max: 100, default: 25, step: 5 },
        { id: "damping", label: "Fluid Damping (b)", unit: "N·s/m", min: 0.0, max: 2.0, default: 0.1, step: 0.05 }
      ],
      physicsModel: {
        equations: [
          "mass_kg = mass / 1000",
          "gravity = 9.81",
          "restForce = mass_kg * gravity",
          "staticExtension_cm = (restForce / k_spring) * 100",
          "naturalFreq_rad = sqrt(k_spring / mass_kg)",
          "timePeriod = 2 * pi * sqrt(mass_kg / k_spring)",
          "frequency_Hz = 1 / timePeriod"
        ],
        sweepVariable: "mass",
        sweepMin: 50,
        sweepMax: 800,
        plotX: "mass",
        plotY: "staticExtension_cm",
        xLabel: "Suspended Mass M (g)",
        yLabel: "Static Extension ΔL (cm)",
        instruments: {
          dmm: { mode: "TIMER", variable: "timePeriod" }
        }
      }
    },
    apparatus: [
      { name: "Rigid Helical Spring Support Stand", spec: "Heavy-duty steel base with scale pointer", quantity: "1 Unit", icon: "📐" },
      { name: "Precision Helical Spring", spec: "Hardened steel wire (k ≈ 25 N/m)", quantity: "1 Unit", icon: "➰" },
      { name: "Slotted Weight Hanger & Discs", spec: "50g – 500g slotted precision masses", quantity: "1 Set", icon: "⚖️" },
      { name: "Precision Millimeter Scale", spec: "0 – 50 cm with anti-parallax mirror", quantity: "1 Unit", icon: "📏" }
    ],
    theory: {
      title: "Hooke's Law & Harmonic Oscillations",
      objective: "To verify Hooke's Law F = -k·x and compute spring stiffness k via static extension and dynamic oscillation period T = 2π√(M/k).",
      formulaDetails: [
        {
          name: "Hooke's Law",
          formula: "F = -k · ΔL = M · g",
          description: "Within elastic limits, restoring force is directly proportional to displacement."
        },
        {
          name: "Oscillation Time Period",
          formula: "T = 2π · √(M / k)",
          description: "Period of simple harmonic motion for a mass suspended on a vertical spring."
        }
      ]
    },
    procedure: [
      "Record the initial equilibrium position of the pointer with an empty mass hanger.",
      "Add masses in 50g increments up to 500g, recording static elongation ΔL.",
      "Displace the mass vertically by 2 cm and release to initiate SHM.",
      "Measure the time for 20 complete oscillations using the digital timer.",
      "Plot Load vs Extension to find k from the slope."
    ],
    observations: {
      name: "Hookes_Law_Observations",
      rows: [
        { id: "mass", label: "Mass M (g)", type: "input" },
        { id: "staticExtension_cm", label: "Elongation ΔL (cm)", type: "observed" },
        { id: "timePeriod", label: "Time Period T (s)", type: "observed" }
      ]
    },
    calculations: {
      title: "Stiffness Evaluation",
      overview: "Evaluate spring constant k = (ΔM · g) / ΔL and compare with k = 4π²M / T².",
      steps: [
        { step: 1, title: "Static Stiffness", equation: "k_{static} = (M · g) / ΔL" },
        { step: 2, title: "Dynamic Stiffness", equation: "k_{dynamic} = 4π² · M / T²" }
      ]
    },
    viva: [
      ["What is elastic limit?", "The maximum stress a material can withstand without permanent deformation."],
      ["What is the physical meaning of spring constant k?", "The force required to produce unit elongation in the spring (N/m)."]
    ]
  },

  "pendulum": {
    id: "draft-simple-pendulum",
    title: "Simple Pendulum & Acceleration due to Gravity (g)",
    subtitle: "Classical Mechanics & Gravitation",
    branch: "civil",
    discipline: "Physics / Applied Mechanics",
    level: "B.Tech Year 1",
    icon: "⏱️",
    isDraft: true,
    author: "VAIL AI Synthesizer",
    description: "Measure the period of simple harmonic oscillation of a simple pendulum and determine local gravitational acceleration g.",
    video: {
      title: "Simple Pendulum Experiment Briefing",
      summary: "Investigation of periodic oscillation time period T, length dependency, and experimental evaluation of local gravitational acceleration g.",
      hasVideo: false
    },
    safety: {
      protocol: "UPEM / Classical Mechanics Safety Protocol",
      isElectrical: false,
      precautions: [
        {
          title: "📐 Small Angle Approximation Constraint",
          severity: "warning",
          borderColor: "#f59e0b",
          titleColor: "#fbbf24",
          description: "Keep initial angular displacement below 10° so that the theoretical approximation sin θ ≈ θ remains valid."
        },
        {
          title: "⚪ Bob Suspension Rigidity",
          severity: "safe",
          borderColor: "#38bdf8",
          titleColor: "#38bdf8",
          description: "Ensure the clamp firmly grips the thread at a sharp knife-edge to define the pivot point accurately."
        }
      ]
    },
    simulation: {
      type: "parametric_rig",
      scene: "pendulum_swing",
      parameters: [
        { id: "length", label: "Pendulum Length (L)", unit: "m", min: 0.2, max: 2.0, default: 1.0, step: 0.05 },
        { id: "angle", label: "Initial Angle (θ₀)", unit: "deg", min: 2, max: 20, default: 5, step: 1 },
        { id: "bobMass", label: "Bob Mass", unit: "g", min: 20, max: 200, default: 50, step: 10 }
      ],
      physicsModel: {
        equations: [
          "g_true = 9.80665",
          "radAngle = (angle * pi) / 180",
          "correction = 1 + (1/16) * (radAngle * radAngle)",
          "timePeriod = 2 * pi * sqrt(length / g_true) * correction",
          "freq = 1 / timePeriod",
          "calc_g = 4 * (pi^2) * length / (timePeriod^2)"
        ],
        sweepVariable: "length",
        sweepMin: 0.3,
        sweepMax: 1.8,
        plotX: "length",
        plotY: "timePeriod",
        xLabel: "Pendulum Length L (m)",
        yLabel: "Oscillation Period T (s)",
        instruments: {
          dmm: { mode: "TIMER", variable: "timePeriod" }
        }
      }
    },
    apparatus: [
      { name: "Heavy Metallic Bob with Hook", spec: "Turned brass sphere (diameter ~2.5 cm)", quantity: "1 Unit", icon: "⚪" },
      { name: "Lightweight Inextensible Thread", spec: "Fine braided cotton filament", quantity: "1 Spool", icon: "🧵" },
      { name: "Split Cork & Rigid Clamp Stand", spec: "Heavy cast-iron bench clamp", quantity: "1 Set", icon: "🔩" },
      { name: "Precision Digital Stopwatch", spec: "Resolution 0.01 s with split timer", quantity: "1 Unit", icon: "⏱️" }
    ],
    theory: {
      title: "Simple Harmonic Motion of a Pendulum",
      objective: "To verify T ∝ √L and determine acceleration due to gravity g = 4π²(L / T²).",
      formulaDetails: [
        {
          name: "Small-Angle Period Formula",
          formula: "T = 2π · √(L / g)",
          description: "Valid for small angular displacements (θ < 10°) where sin θ ≈ θ in radians."
        }
      ]
    },
    procedure: [
      "Suspend the bob from the rigid clamp stand.",
      "Measure effective length L from point of suspension to the center of mass of the bob.",
      "Pull the bob aside by a small angle (< 10°) and release smoothly without jerk.",
      "Record the time for 20 complete oscillations; calculate time period T.",
      "Repeat for lengths 0.6m, 0.8m, 1.0m, 1.2m, and 1.4m.",
      "Plot L vs T² to evaluate slope L/T² and determine g."
    ],
    observations: {
      name: "Pendulum_Observations",
      rows: [
        { id: "length", label: "Length L (m)", type: "input" },
        { id: "timePeriod", label: "Period T (s)", type: "observed" },
        { id: "calc_g", label: "Calculated g (m/s²)", type: "observed" }
      ]
    },
    calculations: {
      title: "Calculation of Gravitational Acceleration",
      overview: "Compute g = 4π²(L / T²) for each length and find mean g.",
      steps: [
        { step: 1, title: "Square of Period", equation: "T² = (t / 20)²" },
        { step: 2, title: "Compute g", equation: "g = 4π² · L / T²" }
      ]
    },
    viva: [
      ["Does the period depend on the mass of the bob?", "No, all masses accelerate equally under gravity, so period is independent of bob mass."],
      ["Why must the angular displacement be small?", "The derivation requires the approximation sin θ ≈ θ, which holds accurately only for small angles."]
    ]
  },

  "newtonrings": {
    id: "draft-newtons-rings",
    title: "Newton's Rings — Wavelength & Radius of Curvature",
    subtitle: "Wave Optics & Thin-Film Interference",
    branch: "cse",
    discipline: "Engineering Physics / Optics",
    level: "B.Tech Year 1",
    icon: "⭕",
    isDraft: true,
    author: "VAIL Physics Engine",
    description: "Determine the wavelength of monochromatic sodium light and evaluate the radius of curvature of a plano-convex lens using circular interference fringes.",
    video: {
      title: "Newton's Rings Interference Laboratory Briefing",
      summary: "Study of division of amplitude interference in an air film of wedge-shaped thickness between a glass plate and a plano-convex lens.",
      hasVideo: false
    },
    safety: {
      protocol: "UPEM / Optical & Low-Power Sodium Source Protocol",
      isElectrical: false,
      precautions: [
        {
          title: "🔍 Optical Cleanliness",
          severity: "warning",
          borderColor: "#f59e0b",
          titleColor: "#fbbf24",
          description: "Clean the lens surface and glass plate with optical lens paper before setup. Dust particles distort ring circularity."
        },
        {
          title: "🎯 Backlash Error Elimination",
          severity: "safe",
          borderColor: "#38bdf8",
          titleColor: "#38bdf8",
          description: "Always turn the micrometer screw in one continuous direction across the fringe pattern to prevent mechanical backlash error."
        }
      ]
    },
    simulation: {
      type: "parametric_rig",
      scene: "newtons_rings",
      parameters: [
        { id: "ringNumber", label: "Ring Order (n)", unit: "order", min: 1, max: 25, default: 10, step: 1 },
        { id: "wavelength_nm", label: "Source Wavelength (λ)", unit: "nm", min: 400, max: 700, default: 589.3, step: 1 },
        { id: "radius_cm", label: "Lens Radius of Curvature (R)", unit: "cm", min: 50, max: 200, default: 100, step: 10 }
      ],
      physicsModel: {
        equations: [
          "lambda_m = wavelength_nm * 1e-9",
          "R_m = radius_cm * 1e-2",
          "diameterSq_m2 = 4 * ringNumber * lambda_m * R_m",
          "ringDiameter_mm = sqrt(diameterSq_m2) * 1000",
          "airFilmThickness_um = (ringNumber * (lambda_m / 2)) * 1e6",
          "fringeSpacing_mm = ringDiameter_mm / max(1, ringNumber)"
        ],
        sweepVariable: "ringNumber",
        sweepMin: 1,
        sweepMax: 20,
        plotX: "ringNumber",
        plotY: "ringDiameter_mm",
        xLabel: "Ring Order (n)",
        yLabel: "Ring Diameter D_n (mm)",
        instruments: {
          dmm: { mode: "DCV", variable: "ringDiameter_mm" }
        }
      }
    },
    apparatus: [
      { name: "Traveling Microscope with 0.001 cm Vernier", spec: "Horizontal micrometer travel stage", quantity: "1 Unit", icon: "🔬" },
      { name: "Plano-Convex Lens & Optical Flat Plate", spec: "Radius of curvature R ≈ 100 cm optical glass", quantity: "1 Set", icon: "🔍" },
      { name: "Monochromatic Sodium Vapor Lamp", spec: "589.3 nm doublet emission lamp", quantity: "1 Unit", icon: "💡" },
      { name: "Glass Plate Reflector at 45°", spec: "Semireflecting optical beam splitter", quantity: "1 Unit", icon: "📐" }
    ],
    theory: {
      title: "Interference by Division of Amplitude in Air Wedge",
      objective: "To form circular Newton's rings and calculate wavelength λ = (D_{n+p}² - D_n²) / (4pR) and lens radius R.",
      formulaDetails: [
        {
          name: "Ring Diameter Condition (Dark Rings)",
          formula: "D_n² = 4 · n · λ · R",
          description: "Condition for destructive interference with path difference Δ = 2t + λ/2 = (2n + 1)λ/2."
        },
        {
          name: "Wavelength Formula",
          formula: "λ = (D_{n+p}² - D_n²) / (4 · p · R)",
          description: "Cancels out the central contact point error (zero-order ring offset)."
        }
      ]
    },
    procedure: [
      "1. Align the sodium lamp and incline the 45° glass plate to produce uniform vertical illumination.",
      "2. Focus the traveling microscope on the circular Newton's rings until crosshairs are sharply defined.",
      "3. Move the micrometer carriage across 15 rings to the left, then traverse back recording ring diameters.",
      "4. Record positions for dark rings n = 1 to 15 on both left and right sides.",
      "5. Plot Ring Number n vs D_n² to evaluate the slope and determine λ and R."
    ],
    observations: {
      name: "Newtons_Rings_Observations",
      rows: [
        { id: "ringNumber", label: "Ring Order n", type: "input" },
        { id: "ringDiameter_mm", label: "Diameter D_n (mm)", type: "observed" },
        { id: "diameterSq_m2", label: "D_n² (m²)", type: "observed" },
        { id: "airFilmThickness_um", label: "Film Thickness (μm)", type: "observed" }
      ]
    },
    calculations: {
      title: "Determination of Wavelength & Lens Curvature",
      overview: "Compute slope of D_n² vs n to extract λ = slope / (4R).",
      steps: [
        { step: 1, title: "Difference of Squares", equation: "Δ(D²) = D_{n+p}² - D_n²" },
        { step: 2, title: "Wavelength Computation", equation: "λ = Δ(D²) / (4 · p · R)" }
      ]
    },
    viva: [
      ["Why are Newton's rings circular?", "Because the locus of points of equal air-film thickness around the point of contact forms concentric circles."],
      ["Why is the center of Newton's rings dark in reflected light?", "At point of contact, film thickness t = 0, but reflection at denser medium introduces a phase shift of π (path change λ/2), causing destructive interference."],
      ["What happens if a liquid is introduced between lens and glass?", "The optical path difference increases by refractive index μ, causing the rings to contract: D_liquid = D_air / √μ."]
    ]
  },

  "diffractiongrating": {
    id: "draft-diffraction-grating",
    title: "Diffraction Grating Spectrometer — Spectral Lines",
    subtitle: "Wave Optics & Spectrophotometry",
    branch: "ece",
    discipline: "Engineering Physics / Optics",
    level: "B.Tech Year 1",
    icon: "🌈",
    isDraft: true,
    author: "VAIL Physics Engine",
    description: "Determine the wavelength of mercury spectral lines and evaluate the dispersive and resolving power of a transmission plane diffraction grating.",
    video: {
      title: "Spectrometer & Diffraction Grating Briefing",
      summary: "Collimator alignment, telescope leveling, normal incidence setting on grating, and angular deflection measurement for spectral lines.",
      hasVideo: false
    },
    safety: {
      protocol: "UPEM / Optical Spectrometer Safety Protocol",
      isElectrical: false,
      precautions: [
        {
          title: "💎 Do Not Touch the Grating Ruled Surface",
          severity: "danger",
          borderColor: "#ef4444",
          titleColor: "#f87171",
          description: "Never touch or wipe the ruled faces of the diffraction grating. Fingerprints permanently degrade groove ruling."
        },
        {
          title: "💡 Mercury Lamp UV Shield",
          severity: "warning",
          borderColor: "#f59e0b",
          titleColor: "#fbbf24",
          description: "Keep the lamp enclosure door closed to prevent direct viewing of high-pressure mercury arc UV radiation."
        }
      ]
    },
    simulation: {
      type: "parametric_rig",
      scene: "diffraction_grating",
      parameters: [
        { id: "linesPerInch", label: "Grating Ruling (N)", unit: "LPI", min: 5000, max: 25000, default: 15000, step: 2500 },
        { id: "spectralOrder", label: "Diffraction Order (m)", unit: "order", min: 1, max: 3, default: 1, step: 1 },
        { id: "wavelength_nm", label: "Line Wavelength (λ)", unit: "nm", min: 400, max: 700, default: 546.1, step: 5 }
      ],
      physicsModel: {
        equations: [
          "linesPerMeter = linesPerInch / 0.0254",
          "gratingElement_m = 1 / linesPerMeter",
          "lambda_m = wavelength_nm * 1e-9",
          "sinTheta = (spectralOrder * lambda_m) / gratingElement_m",
          "diffractionAngle_rad = asin(min(0.999, sinTheta))",
          "diffractionAngle_deg = (diffractionAngle_rad * 180) / pi",
          "dispersivePower = spectralOrder / (gratingElement_m * cos(diffractionAngle_rad))",
          "resolvingPower = spectralOrder * (linesPerMeter * 0.025)"
        ],
        sweepVariable: "wavelength_nm",
        sweepMin: 400,
        sweepMax: 700,
        plotX: "wavelength_nm",
        plotY: "diffractionAngle_deg",
        xLabel: "Wavelength λ (nm)",
        yLabel: "Diffraction Angle θ (deg)",
        instruments: {
          dmm: { mode: "DCV", variable: "diffractionAngle_deg" }
        }
      }
    },
    apparatus: [
      { name: "Precision Optical Spectrometer", spec: "360° circular scale with dual verniers (1' arc)", quantity: "1 Unit", icon: "📐" },
      { name: "Plane Transmission Diffraction Grating", spec: "15,000 lines per inch replica grating", quantity: "1 Unit", icon: "🔲" },
      { name: "High-Pressure Mercury Arc Lamp", spec: "Violet, Green, Yellow doublet spectral emission", quantity: "1 Unit", icon: "💡" },
      { name: "Reading Lamp & Vernier Magnifier", spec: "Optical hand loupe for vernier scale", quantity: "1 Set", icon: "🔍" }
    ],
    theory: {
      title: "Diffraction Grating Equation & Dispersive Power",
      objective: "To measure diffraction angles θ for various spectral lines and verify (a + b) sin θ = m·λ.",
      formulaDetails: [
        {
          name: "Grating Equation (Normal Incidence)",
          formula: "(a + b) · sin θ = m · λ",
          description: "(a + b) is the grating element; m is the spectral order; λ is light wavelength."
        },
        {
          name: "Grating Element",
          formula: "d = (a + b) = 2.54 / N  (cm)",
          description: "Where N is lines per inch ruled on the grating."
        }
      ]
    },
    procedure: [
      "1. Perform initial adjustments: level the spectrometer table, focus telescope, and collimate the slit.",
      "2. Mount the diffraction grating for normal incidence using the reflection method.",
      "3. Rotate the telescope to locate the zero-order central white image.",
      "4. Move the telescope to the first-order spectrum (left and right) to observe Violet, Green, and Yellow lines.",
      "5. Note vernier readings V1 and V2 on both sides and calculate diffraction angle θ = (θ_L - θ_R) / 2."
    ],
    observations: {
      name: "Diffraction_Grating_Observations",
      rows: [
        { id: "wavelength_nm", label: "Spectral Line λ (nm)", type: "input" },
        { id: "spectralOrder", label: "Diffraction Order m", type: "input" },
        { id: "diffractionAngle_deg", label: "Diffraction Angle θ (°)", type: "observed" },
        { id: "dispersivePower", label: "Dispersive Power (rad/m)", type: "observed" }
      ]
    },
    calculations: {
      title: "Wavelength Determination",
      overview: "Compute λ = (a + b) · sin θ / m for each spectral color.",
      steps: [
        { step: 1, title: "Grating Element", equation: "(a + b) = 2.54 / N  (cm)" },
        { step: 2, title: "Wavelength Calculation", equation: "λ = (a + b) · sin θ / m" }
      ]
    },
    viva: [
      ["What is a diffraction grating?", "An arrangement of a large number of closely spaced, equidistant parallel slits ruled on an optically flat plate."],
      ["What is the grating element?", "The distance between the centers of two consecutive slits: d = a + b."],
      ["Why are spectra observed on both sides of central maximum?", "Because diffraction occurs symmetrically at ±θ according to (a + b) sin θ = ±mλ."]
    ]
  },

  "halleffect": {
    id: "draft-hall-effect",
    title: "Hall Effect & Carrier Concentration",
    subtitle: "Solid State Physics & Semiconductors",
    branch: "eee",
    discipline: "Physics / Materials Science",
    level: "B.Tech Year 1",
    icon: "🧲",
    isDraft: true,
    author: "VAIL Physics Engine",
    description: "Measure the Hall voltage V_H in a semiconductor specimen under transverse magnetic field B and calculate Hall coefficient R_H and carrier density n.",
    video: {
      title: "Hall Effect Laboratory Briefing",
      summary: "Investigation of Lorentz force on charge carriers, Hall voltage generation, determination of carrier type (p or n), and carrier concentration.",
      hasVideo: false
    },
    safety: {
      protocol: "UPEM / High Magnetic Field & DC Solenoid Protocol",
      isElectrical: true,
      precautions: [
        {
          title: "🧲 Strong Electromagnet Field Warning",
          severity: "danger",
          borderColor: "#ef4444",
          titleColor: "#f87171",
          description: "Keep ferromagnetic tools, watches, and credit cards away from electromagnet pole pieces during energization."
        },
        {
          title: "⚡ Solenoid Coil Overheating",
          severity: "warning",
          borderColor: "#f59e0b",
          titleColor: "#fbbf24",
          description: "Do not exceed rated solenoid current (3.5 A). Coil insulation degrades under sustained high currents."
        }
      ]
    },
    simulation: {
      type: "parametric_rig",
      scene: "hall_effect",
      parameters: [
        { id: "sampleCurrent_mA", label: "Sample Current (I_x)", unit: "mA", min: 1, max: 20, default: 5, step: 1 },
        { id: "magneticField_kG", label: "Magnetic Field (B_z)", unit: "kG", min: 0.5, max: 6.0, default: 2.5, step: 0.5 },
        { id: "sampleThickness_mm", label: "Specimen Thickness (w)", unit: "mm", min: 0.2, max: 1.0, default: 0.5, step: 0.1 }
      ],
      physicsModel: {
        equations: [
          "q_e = 1.602e-19",
          "current_A = sampleCurrent_mA * 1e-3",
          "field_Tesla = magneticField_kG * 0.1",
          "thickness_m = sampleThickness_mm * 1e-3",
          "carrierConcentration_n = 2.4e21",
          "hallCoefficient_RH = 1 / (carrierConcentration_n * q_e)",
          "hallVoltage_mV = ((hallCoefficient_RH * current_A * field_Tesla) / thickness_m) * 1e3",
          "carrierMobility_cm2 = hallCoefficient_RH * 0.12 * 1e4"
        ],
        sweepVariable: "magneticField_kG",
        sweepMin: 0.5,
        sweepMax: 6.0,
        plotX: "magneticField_kG",
        plotY: "hallVoltage_mV",
        xLabel: "Magnetic Field B (kG)",
        yLabel: "Hall Voltage V_H (mV)",
        instruments: {
          dmm: { mode: "DCV", variable: "hallVoltage_mV" }
        }
      }
    },
    apparatus: [
      { name: "Electromagnet with Flat Pole Pieces", spec: "0 – 7.5 kG variable field with cooling fins", quantity: "1 Unit", icon: "🧲" },
      { name: "Constant Current Power Supply (CCPS)", spec: "0 – 20 mA stable current source", quantity: "1 Unit", icon: "🔋" },
      { name: "Germanium / InAs Semiconductor Probe", spec: "Doped n-type crystal on PCB mount", quantity: "1 Unit", icon: "📟" },
      { name: "Digital Microvoltmeter (DMV)", spec: "Resolution 1 μV high-input impedance", quantity: "1 Unit", icon: "📊" },
      { name: "Digital Gaussmeter with InAs Hall Sensor", spec: "0 – 20 kG range with zero adjust", quantity: "1 Unit", icon: "🧭" }
    ],
    theory: {
      title: "Lorentz Force & Hall Effect in Semiconductors",
      objective: "To measure Hall voltage V_H = (R_H · I · B) / w and compute carrier density n = 1 / (R_H · e).",
      formulaDetails: [
        {
          name: "Hall Voltage Equation",
          formula: "V_H = (R_H · I · B) / w",
          description: "R_H is the Hall coefficient; w is sample thickness along magnetic field direction."
        },
        {
          name: "Carrier Concentration",
          formula: "n = 1 / (R_H · e)",
          description: "Charge carrier density per unit volume (electrons or holes)."
        }
      ]
    },
    procedure: [
      "1. Place the Hall probe midway between the electromagnet pole faces perpendicular to the field.",
      "2. Connect the constant current supply to the current leads and the digital microvoltmeter to the Hall voltage leads.",
      "3. Without magnetic field, balance the potentiometer to eliminate zero-field misalignment voltage.",
      "4. Energize the magnet; vary current I and record Hall voltage V_H.",
      "5. Vary magnetic field B and record V_H. Plot V_H vs B to evaluate R_H from the slope."
    ],
    observations: {
      name: "Hall_Effect_Observations",
      rows: [
        { id: "sampleCurrent_mA", label: "Current I (mA)", type: "input" },
        { id: "magneticField_kG", label: "Field B (kG)", type: "input" },
        { id: "hallVoltage_mV", label: "Hall Voltage V_H (mV)", type: "observed" },
        { id: "hallCoefficient_RH", label: "R_H (m³/C)", type: "observed" }
      ]
    },
    calculations: {
      title: "Evaluation of Hall Parameters",
      overview: "Compute R_H = (V_H · w) / (I · B) and carrier density n.",
      steps: [
        { step: 1, title: "Hall Coefficient", equation: "R_H = (V_H · w) / (I · B)" },
        { step: 2, title: "Carrier Concentration", equation: "n = 1 / (R_H · e)" }
      ]
    },
    viva: [
      ["What is the Hall Effect?", "When a magnetic field is applied perpendicular to a current-carrying conductor or semiconductor, a transverse potential difference (Hall voltage) is developed."],
      ["What determines the sign of the Hall voltage?", "The polarity of the charge carriers: negative for electrons (n-type) and positive for holes (p-type)."],
      ["Why is Hall effect pronounced in semiconductors compared to metals?", "Because carrier density n in semiconductors is much smaller than in metals, making R_H = 1/(ne) significantly larger."]
    ]
  },

  "bandgap": {
    id: "draft-energy-band-gap",
    title: "Energy Band Gap of a Semiconductor Diode",
    subtitle: "Solid State Electronics & Thermistors",
    branch: "ece",
    discipline: "Engineering Physics / Electronics",
    level: "B.Tech Year 1",
    icon: "⚡",
    isDraft: true,
    author: "VAIL Physics Engine",
    description: "Determine the forbidden energy band gap Eg of a p-n junction diode / semiconductor by measuring reverse saturation current as a function of temperature.",
    video: {
      title: "Energy Band Gap Laboratory Briefing",
      summary: "Study of thermally generated intrinsic carriers, reverse saturation current in a p-n junction, and extraction of band gap Eg from log(Is) vs 1000/T slope.",
      hasVideo: false
    },
    safety: {
      protocol: "UPEM / Thermal Oven & Diode Heating Protocol",
      isElectrical: true,
      precautions: [
        {
          title: "🔥 Thermal Burn Caution",
          severity: "danger",
          borderColor: "#ef4444",
          titleColor: "#f87171",
          description: "Oven temperatures reach 90°C. Do not touch heating chamber walls or thermometer bulb."
        },
        {
          title: "⚡ Reverse Breakdown Limit",
          severity: "warning",
          borderColor: "#f59e0b",
          titleColor: "#fbbf24",
          description: "Keep reverse bias voltage below 3.0 V to prevent Zener or avalanche breakdown."
        }
      ]
    },
    simulation: {
      type: "parametric_rig",
      scene: "band_gap",
      parameters: [
        { id: "temperature_C", label: "Junction Temperature (T)", unit: "°C", min: 30, max: 90, default: 45, step: 2 },
        { id: "reverseBias_V", label: "Reverse Bias Voltage (V_r)", unit: "V", min: 1.0, max: 5.0, default: 2.0, step: 0.5 },
        { id: "bandGap_eV", label: "True Material Band Gap (Eg)", unit: "eV", min: 0.6, max: 1.5, default: 0.72, step: 0.05 }
      ],
      physicsModel: {
        equations: [
          "k_B_eV = 8.617333e-5",
          "temp_K = temperature_C + 273.15",
          "invTemp_1000K = 1000 / temp_K",
          "expFactor = exp(-bandGap_eV / (2 * k_B_eV * temp_K))",
          "reverseCurrent_uA = (5000 * (temp_K ^ 1.5) * expFactor) * 1e-4",
          "logCurrent = ln(max(1e-6, reverseCurrent_uA))",
          "calc_bandGap_eV = -2 * k_B_eV * (logCurrent / (1 / temp_K)) * 0.08"
        ],
        sweepVariable: "temperature_C",
        sweepMin: 30,
        sweepMax: 85,
        plotX: "invTemp_1000K",
        plotY: "logCurrent",
        xLabel: "1000 / T (K⁻¹)",
        yLabel: "ln(I_s)",
        instruments: {
          dmm: { mode: "DCA", variable: "reverseCurrent_uA" }
        }
      }
    },
    apparatus: [
      { name: "Regulated Heating Oven & Chamber", spec: "Ambient to 100°C with digital PID controller", quantity: "1 Unit", icon: "♨️" },
      { name: "Germanium P-N Junction Diode (OA79)", spec: "Glass encapsulated reverse-biased diode", quantity: "1 Unit", icon: "⚡" },
      { name: "Digital Microammeter", spec: "0 – 200 μA resolution 0.1 μA", quantity: "1 Unit", icon: "📟" },
      { name: "Precision Mercury-in-Glass Thermometer", spec: "0 – 110°C, least count 0.5°C", quantity: "1 Unit", icon: "🌡️" }
    ],
    theory: {
      title: "Thermally Generated Carriers & Band Gap Theory",
      objective: "To plot ln(I_s) vs 1000/T and evaluate forbidden band gap Eg = 2k · slope.",
      formulaDetails: [
        {
          name: "Reverse Saturation Current Formula",
          formula: "I_s = C · T^{3/2} · exp(-E_g / (2 · k · T))",
          description: "Governs the minority carrier generation across the junction under reverse bias."
        },
        {
          name: "Band Gap from Slope",
          formula: "E_g = 2 · k · [Δ(ln I_s) / Δ(1 / T)]  (in Joules or eV)",
          description: "Slope of ln(I_s) vs 1/T yields the energy gap directly."
        }
      ]
    },
    procedure: [
      "1. Insert the p-n junction diode into the oil bath/oven chamber alongside the thermometer.",
      "2. Apply a constant reverse bias of 2.0 V across the diode.",
      "3. Switch on the heater and raise the temperature to approximately 85°C.",
      "4. Turn off the heater; as the temperature cools down slowly, record reverse saturation current I_s every 2°C.",
      "5. Tabulate 1000/T and ln(I_s), plot the linear graph, and calculate Eg from the slope."
    ],
    observations: {
      name: "Band_Gap_Observations",
      rows: [
        { id: "temperature_C", label: "Temp T (°C)", type: "input" },
        { id: "temp_K", label: "Temp T (K)", type: "observed" },
        { id: "invTemp_1000K", label: "1000/T (K⁻¹)", type: "observed" },
        { id: "reverseCurrent_uA", label: "Current I_s (μA)", type: "observed" },
        { id: "logCurrent", label: "ln(I_s)", type: "observed" }
      ]
    },
    calculations: {
      title: "Slope Calculation & Energy Gap",
      overview: "Compute slope m = Δ(ln I_s) / Δ(1000/T) and evaluate Eg = 2 · k · m · 1000.",
      steps: [
        { step: 1, title: "Linear Slope", equation: "Slope = Δ(ln I_s) / Δ(1/T)" },
        { step: 2, title: "Band Gap in eV", equation: "E_g = (2 × 8.617×10⁻⁵ × Slope)  (eV)" }
      ]
    },
    viva: [
      ["What is forbidden energy band gap?", "The energy difference between the top of the valence band and the bottom of the conduction band where no electron states can exist."],
      ["What is the typical band gap for Germanium and Silicon?", "At room temperature, Eg ≈ 0.72 eV for Germanium and 1.12 eV for Silicon."],
      ["Why does reverse current increase rapidly with temperature?", "Because thermal energy breaks covalent bonds, creating electron-hole pairs that exponentially multiply minority carrier concentration."]
    ]
  },

  "solarcell": {
    id: "draft-solar-cell",
    title: "Solar Cell — I-V Characteristics & Fill Factor",
    subtitle: "Photovoltaic Physics & Renewable Energy",
    branch: "eee",
    discipline: "Physics / Energy Systems",
    level: "B.Tech Year 1",
    icon: "☀️",
    isDraft: true,
    author: "VAIL Physics Engine",
    description: "Plot illuminated I-V characteristics of a photovoltaic solar cell, determine open-circuit voltage Voc, short-circuit current Isc, and evaluate maximum power output Pmax and Fill Factor.",
    video: {
      title: "Solar Cell Photovoltaic Briefing",
      summary: "Study of electron-hole pair generation by photon absorption, illuminated diode characteristics, maximum power point tracking (MPPT), and fill factor evaluation.",
      hasVideo: false
    },
    safety: {
      protocol: "UPEM / Halogen Lamp & Photovoltaic Radiation Protocol",
      isElectrical: true,
      precautions: [
        {
          title: "🔥 High-Intensity Lamp Heat",
          severity: "warning",
          borderColor: "#f59e0b",
          titleColor: "#fbbf24",
          description: "Keep solar cell at least 15 cm away from the halogen bulb to avoid thermal saturation and degradation."
        }
      ]
    },
    simulation: {
      type: "parametric_rig",
      scene: "solar_cell",
      parameters: [
        { id: "loadResistance_ohm", label: "Load Resistance (R_L)", unit: "Ω", min: 10, max: 2000, default: 100, step: 20 },
        { id: "lightIntensity_lux", label: "Illumination Level", unit: "lux", min: 500, max: 5000, default: 2500, step: 250 },
        { id: "cellArea_cm2", label: "Cell Active Area", unit: "cm²", min: 2, max: 20, default: 6, step: 1 }
      ],
      physicsModel: {
        equations: [
          "isc_mA = (lightIntensity_lux / 2500) * (cellArea_cm2 * 5.2)",
          "voc_V = 0.58 + 0.025 * ln(max(0.1, lightIntensity_lux / 2500))",
          "v_cell = min(voc_V, (isc_mA * 1e-3 * loadResistance_ohm) / (1 + (loadResistance_ohm / 600)))",
          "i_cell_mA = max(0, isc_mA * (1 - (v_cell / voc_V) ^ 4))",
          "power_mW = v_cell * i_cell_mA",
          "p_max_mW = voc_V * isc_mA * 0.72",
          "fillFactor = (p_max_mW / (voc_V * isc_mA)) * 100"
        ],
        sweepVariable: "loadResistance_ohm",
        sweepMin: 10,
        sweepMax: 1500,
        plotX: "v_cell",
        plotY: "i_cell_mA",
        xLabel: "Cell Voltage V (V)",
        yLabel: "Cell Current I (mA)",
        instruments: {
          dmm: { mode: "DCV", variable: "v_cell" }
        }
      }
    },
    apparatus: [
      { name: "Silicon Photovoltaic Solar Cell Plate", spec: "Polycrystalline Si panel with lead contacts", quantity: "1 Unit", icon: "☀️" },
      { name: "Variable Decade Resistance Box", spec: "1 – 5000 Ω non-inductive resistor", quantity: "1 Unit", icon: "🔲" },
      { name: "Regulated Halogen Light Source", spec: "100 W variable distance optical rail", quantity: "1 Unit", icon: "💡" },
      { name: "Digital Dual Multimeter", spec: "DC Voltmeter (0–2V) and DC Milliammeter (0–50mA)", quantity: "1 Unit", icon: "📟" }
    ],
    theory: {
      title: "Photovoltaic Effect & Fill Factor Evaluation",
      objective: "To plot the illuminated I-V curve of a solar cell and determine Fill Factor FF = P_max / (V_oc · I_sc).",
      formulaDetails: [
        {
          name: "Fill Factor (FF)",
          formula: "FF = (V_m · I_m) / (V_{oc} · I_{sc})",
          description: "Figure of merit representing squareness of the I-V curve and cell quality."
        },
        {
          name: "Conversion Efficiency (η)",
          formula: "η = (P_{max} / P_{in}) × 100%",
          description: "Ratio of maximum electrical power output to incident optical light power."
        }
      ]
    },
    procedure: [
      "1. Align the halogen lamp at a fixed distance (e.g. 25 cm) from the solar cell surface.",
      "2. Connect the solar cell across the variable resistance box with parallel voltmeter and series milliammeter.",
      "3. Measure open circuit voltage Voc with R_L = ∞ and short circuit current Isc with R_L = 0.",
      "4. Vary load resistance from 10 Ω to 2000 Ω, measuring voltage V and current I at each step.",
      "5. Plot I vs V and Power P vs V curves; identify the maximum power point (V_m, I_m) and compute FF."
    ],
    observations: {
      name: "Solar_Cell_Observations",
      rows: [
        { id: "loadResistance_ohm", label: "Load R_L (Ω)", type: "input" },
        { id: "v_cell", label: "Voltage V (V)", type: "observed" },
        { id: "i_cell_mA", label: "Current I (mA)", type: "observed" },
        { id: "power_mW", label: "Power P (mW)", type: "observed" }
      ]
    },
    calculations: {
      title: "Fill Factor & Efficiency Computation",
      overview: "Determine P_max from the peak of the P-V curve and compute Fill Factor.",
      steps: [
        { step: 1, title: "Maximum Power", equation: "P_{max} = V_m × I_m  (mW)" },
        { step: 2, title: "Fill Factor", equation: "FF = P_{max} / (V_{oc} × I_{sc})" }
      ]
    },
    viva: [
      ["What is the working principle of a solar cell?", "Photovoltaic effect: absorption of photons generates electron-hole pairs that are separated by the internal junction electric field."],
      ["What is open-circuit voltage Voc and short-circuit current Isc?", "Voc is the voltage across the unloaded cell (I = 0); Isc is current when output terminals are shorted together (V = 0)."],
      ["What does Fill Factor signify?", "It indicates the quality and squareness of the cell: a higher fill factor means lower internal series resistance and better power conversion."]
    ]
  },

  "laserna": {
    id: "draft-laser-numerical-aperture",
    title: "Semiconductor Laser & Optical Fiber Numerical Aperture",
    subtitle: "Photonics & Optical Fiber Communication",
    branch: "ece",
    discipline: "Physics / Optical Engineering",
    level: "B.Tech Year 1",
    icon: "🔦",
    isDraft: true,
    author: "VAIL Physics Engine",
    description: "Measure the wavelength of a semiconductor laser diode using a diffraction grating and calculate the numerical aperture (NA) and acceptance angle of a multimode optical fiber.",
    video: {
      title: "Semiconductor Laser & Fiber NA Briefing",
      summary: "Study of laser diode beam divergence, total internal reflection in optical fiber, and experimental measurement of fiber acceptance angle and NA.",
      hasVideo: false
    },
    safety: {
      protocol: "UPEM / Class II Semiconductor Laser Protocol",
      isElectrical: true,
      precautions: [
        {
          title: "🚫 Never Look Directly Into the Laser Beam",
          severity: "danger",
          borderColor: "#ef4444",
          titleColor: "#f87171",
          description: "Direct retinal exposure to semiconductor laser (650 nm) can cause eye damage. Use target screen for viewing."
        }
      ]
    },
    simulation: {
      type: "parametric_rig",
      scene: "laser_na",
      parameters: [
        { id: "screenDist_cm", label: "Screen Distance (L)", unit: "cm", min: 5, max: 50, default: 20, step: 2 },
        { id: "coreRefractiveIndex", label: "Core Index (n1)", unit: "ref", min: 1.45, max: 1.60, default: 1.48, step: 0.01 },
        { id: "claddingRefractiveIndex", label: "Cladding Index (n2)", unit: "ref", min: 1.40, max: 1.55, default: 1.46, step: 0.01 }
      ],
      physicsModel: {
        equations: [
          "deltaIndex = max(0.001, (coreRefractiveIndex^2) - (claddingRefractiveIndex^2))",
          "theoreticalNA = sqrt(deltaIndex)",
          "acceptanceAngle_deg = (asin(min(0.99, theoreticalNA)) * 180) / pi",
          "spotDiameter_cm = 2 * screenDist_cm * tan((acceptanceAngle_deg * pi) / 180)",
          "experimentalNA = spotDiameter_cm / sqrt(4 * (screenDist_cm^2) + (spotDiameter_cm^2))"
        ],
        sweepVariable: "screenDist_cm",
        sweepMin: 5,
        sweepMax: 45,
        plotX: "screenDist_cm",
        plotY: "spotDiameter_cm",
        xLabel: "Screen Distance L (cm)",
        yLabel: "Laser Spot Diameter W (cm)",
        instruments: {
          dmm: { mode: "DCV", variable: "spotDiameter_cm" }
        }
      }
    },
    apparatus: [
      { name: "Semiconductor Diode Laser (650 nm)", spec: "Red laser diode (3 mW power, Class II)", quantity: "1 Unit", icon: "🔦" },
      { name: "Step-Index Multimode Optical Fiber", spec: "1 meter PMMA optical fiber cable with SMA connectors", quantity: "1 Unit", icon: "➰" },
      { name: "Concentric Circular NA Target Screen", spec: "Millimeter calibrated radial concentric circles", quantity: "1 Unit", icon: "🎯" },
      { name: "Fiber Optic Holding Jig & Bench", spec: "Adjustable axial collimation mount", quantity: "1 Set", icon: "📐" }
    ],
    theory: {
      title: "Total Internal Reflection & Acceptance Cone",
      objective: "To evaluate fiber acceptance angle θ_a and numerical aperture NA = sin θ_a = √(n1² - n2²).",
      formulaDetails: [
        {
          name: "Numerical Aperture (NA)",
          formula: "NA = sin θ_a = √(n1² - n2²)",
          description: "Light-gathering ability of an optical fiber based on core (n1) and cladding (n2) refractive indices."
        },
        {
          name: "Experimental NA Formula",
          formula: "NA = W / √(4·L² + W²)",
          description: "Where W is the emergent circular spot diameter and L is the screen distance."
        }
      ]
    },
    procedure: [
      "1. Connect the laser output to the input ferrule of the optical fiber cable.",
      "2. Mount the output end of the fiber perpendicular to the circular screen at a distance L (e.g. 10 cm).",
      "3. Measure the horizontal and vertical diameters of the illuminated circular spot W on the screen.",
      "4. Repeat for distances L = 15, 20, 25, 30, and 35 cm.",
      "5. Compute NA for each distance and calculate the mean numerical aperture and acceptance angle."
    ],
    observations: {
      name: "Fiber_NA_Observations",
      rows: [
        { id: "screenDist_cm", label: "Distance L (cm)", type: "input" },
        { id: "spotDiameter_cm", label: "Spot Diameter W (cm)", type: "observed" },
        { id: "experimentalNA", label: "Measured NA", type: "observed" },
        { id: "acceptanceAngle_deg", label: "Acceptance Angle θ_a (°)", type: "observed" }
      ]
    },
    calculations: {
      title: "Acceptance Angle & NA Calculations",
      overview: "Compute NA = W / √(4L² + W²) and acceptance angle θ_a = arcsin(NA).",
      steps: [
        { step: 1, title: "Experimental NA", equation: "NA = W / √(4L² + W²)" },
        { step: 2, title: "Acceptance Angle", equation: "θ_a = arcsin(NA)" }
      ]
    },
    viva: [
      ["What is Numerical Aperture?", "A dimensionless quantity that characterizes the range of angles over which the optical fiber can accept or emit light."],
      ["What is the condition for light propagation inside optical fiber?", "Total internal reflection at the core-cladding interface: the core index must be greater than the cladding index (n1 > n2) and incidence angle must exceed critical angle."],
      ["What is the difference between single-mode and multimode fibers?", "Single-mode has a very narrow core (~9 μm) allowing only one fundamental mode of light; multimode has a wider core (~50–62.5 μm) supporting multiple ray paths."]
    ]
  },

  "torsion": {
    id: "draft-torsional-pendulum",
    title: "Torsional Pendulum — Modulus of Rigidity (η)",
    subtitle: "Solid Mechanics & Elastic Shear",
    branch: "mech",
    discipline: "Physics / Materials Science",
    level: "B.Tech Year 1",
    icon: "⚙️",
    isDraft: true,
    author: "VAIL Physics Engine",
    description: "Determine the rigidity modulus η of a metallic specimen wire and moment of inertia of an irregular body using a torsional pendulum.",
    video: {
      title: "Torsional Pendulum Laboratory Briefing",
      summary: "Study of rotational simple harmonic motion under torsional restoring couple, wire radius measurement, and determination of rigidity modulus.",
      hasVideo: false
    },
    safety: {
      protocol: "UPEM / Classical Mechanics & Rotary Oscillation Protocol",
      isElectrical: false,
      precautions: [
        {
          title: "🔄 Pure Rotational Displacement Only",
          severity: "warning",
          borderColor: "#f59e0b",
          titleColor: "#fbbf24",
          description: "Twist the disc strictly about the vertical axis without any lateral swinging motion. Linear swing ruins torsional period measurement."
        },
        {
          title: "📐 Small Twist Angle Limit",
          severity: "safe",
          borderColor: "#38bdf8",
          titleColor: "#38bdf8",
          description: "Keep torsional twist angle under 30° to maintain elastic restoring couple proportionality."
        }
      ]
    },
    simulation: {
      type: "parametric_rig",
      scene: "torsional_pendulum",
      parameters: [
        { id: "wireLength_cm", label: "Suspension Length (L)", unit: "cm", min: 30, max: 100, default: 60, step: 5 },
        { id: "wireRadius_mm", label: "Wire Radius (r)", unit: "mm", min: 0.2, max: 1.0, default: 0.45, step: 0.05 },
        { id: "discMass_kg", label: "Disc Mass (M)", unit: "kg", min: 1.0, max: 5.0, default: 2.5, step: 0.5 }
      ],
      physicsModel: {
        equations: [
          "r_m = wireRadius_mm * 1e-3",
          "L_m = wireLength_cm * 1e-2",
          "discRadius_m = 0.12",
          "momentOfInertia = 0.5 * discMass_kg * (discRadius_m ^ 2)",
          "rigidityModulus_GPa = 78.5",
          "eta_Pa = rigidityModulus_GPa * 1e9",
          "torsionalCouple_C = (pi * eta_Pa * (r_m ^ 4)) / (2 * L_m)",
          "timePeriod = 2 * pi * sqrt(momentOfInertia / torsionalCouple_C)",
          "calc_rigidity_GPa = ((8 * pi * momentOfInertia * L_m) / ((r_m ^ 4) * (timePeriod ^ 2))) * 1e-9"
        ],
        sweepVariable: "wireLength_cm",
        sweepMin: 30,
        sweepMax: 90,
        plotX: "wireLength_cm",
        plotY: "timePeriod",
        xLabel: "Wire Length L (cm)",
        yLabel: "Torsional Period T (s)",
        instruments: {
          dmm: { mode: "TIMER", variable: "timePeriod" }
        }
      }
    },
    apparatus: [
      { name: "Heavy Circular Metal Inertia Disc", spec: "Turned steel disc (radius ~12 cm, mass 2.5 kg)", quantity: "1 Unit", icon: "💿" },
      { name: "Specimen Metallic Suspension Wire", spec: "Uniform steel / brass wire with chucks", quantity: "1 Coil", icon: "➰" },
      { name: "Wall-Mount Rigid Torsion Head Chuck", spec: "Hardened steel split-chuck clamp", quantity: "1 Unit", icon: "🔩" },
      { name: "Digital Stopwatch & Screw Gauge", spec: "Stopwatch (0.01 s) & micrometer screw gauge (0.01 mm)", quantity: "1 Set", icon: "⏱️" }
    ],
    theory: {
      title: "Torsional Oscillations & Shear Elasticity",
      objective: "To determine the modulus of rigidity η = 8π·I·L / (r⁴ · T²) using a torsional pendulum.",
      formulaDetails: [
        {
          name: "Restoring Couple per Unit Twist",
          formula: "C = (π · η · r⁴) / (2 · L)",
          description: "Torsional couple developed when wire is twisted through unit radian angle."
        },
        {
          name: "Time Period Formula",
          formula: "T = 2π · √(I / C) = 2π · √[(2·I·L) / (π·η·r⁴)]",
          description: "Period of rotational harmonic oscillations of the inertia disc."
        }
      ]
    },
    procedure: [
      "1. Clamp the specimen wire vertically between the rigid top chuck and the center of the inertia disc.",
      "2. Measure the effective length L of the wire between chucks.",
      "3. Measure the diameter of the wire at 5 different locations using a screw gauge to find mean radius r.",
      "4. Twist the disc gently by a small angle (< 30°) and release smoothly so that it executes pure torsional oscillations.",
      "5. Measure the time for 20 oscillations using the stopwatch; calculate period T.",
      "6. Repeat for 5 different lengths L and plot L vs T² to evaluate rigidity modulus η."
    ],
    observations: {
      name: "Torsion_Pendulum_Observations",
      rows: [
        { id: "wireLength_cm", label: "Length L (cm)", type: "input" },
        { id: "timePeriod", label: "Period T (s)", type: "observed" },
        { id: "calc_rigidity_GPa", label: "Rigidity η (GPa)", type: "observed" }
      ]
    },
    calculations: {
      title: "Rigidity Modulus Evaluation",
      overview: "Compute η = (8π · I / r⁴) · (L / T²) from the slope of L vs T².",
      steps: [
        { step: 1, title: "Disc Moment of Inertia", equation: "I = (1/2) · M · R²  (kg·m²)" },
        { step: 2, title: "Rigidity Modulus", equation: "η = (8π · I · L) / (r⁴ · T²)  (N/m²)" }
      ]
    },
    viva: [
      ["What is a torsional pendulum?", "A body suspended by a thin uniform wire that executes rotational simple harmonic oscillations when twisted about the axis of the wire."],
      ["What is modulus of rigidity η?", "The ratio of shear stress to shear strain within the elastic limit of the material."],
      ["Why does wire radius r have the largest impact on error?", "Because in η = 8π·I·L / (r⁴ · T²), radius enters to the fourth power (r⁴), so a 1% error in r leads to a 4% error in η."]
    ]
  }
};

// ─── UNIVERSAL SYNTHESIZER FOR ARBITRARY QUERIES ──────────────────────────

/**
 * Synthesize a valid VAIL scientific experiment model for any user search string.
 */
export function synthesizeExperimentModel(query, discipline = "General Engineering") {
  const norm = (query || "").toLowerCase().trim();

  // Check preset templates
  for (const [key, template] of Object.entries(PRESET_TEMPLATES)) {
    if (
      norm.includes(key) ||
      (key === "meterbridge" && (norm.includes("meter") || norm.includes("bridge") || norm.includes("wheatstone"))) ||
      (key === "photoelectric" && (norm.includes("photo") || norm.includes("planck"))) ||
      (key === "hooke" && (norm.includes("spring") || norm.includes("hooke"))) ||
      (key === "pendulum" && norm.includes("pendulum") && !norm.includes("torsion")) ||
      (key === "newtonrings" && (norm.includes("newton") || norm.includes("ring"))) ||
      (key === "diffractiongrating" && (norm.includes("grating") || norm.includes("diffraction") || norm.includes("spectrometer"))) ||
      (key === "halleffect" && (norm.includes("hall") || norm.includes("carrier concentration"))) ||
      (key === "bandgap" && (norm.includes("band") || norm.includes("gap") || norm.includes("semiconductor diode"))) ||
      (key === "solarcell" && (norm.includes("solar") || norm.includes("photovoltaic") || norm.includes("fill factor"))) ||
      (key === "laserna" && (norm.includes("laser") || norm.includes("fiber") || norm.includes("numerical aperture") || norm.includes("acceptance"))) ||
      (key === "torsion" && (norm.includes("torsion") || norm.includes("rigidity")))
    ) {
      return JSON.parse(JSON.stringify(template));
    }
  }

  // Synthesize dynamic experiment model
  const cleanTitle = query
    .split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const slug = norm.replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");

  return {
    id: `draft-${slug || "custom-experiment"}`,
    title: cleanTitle,
    subtitle: `${discipline} Laboratory Experiment`,
    branch: "cse",
    discipline: discipline,
    level: "B.Tech Undergraduate",
    icon: "🔬",
    isDraft: true,
    author: "VAIL AI Synthesizer",
    description: `Interactive virtual engineering laboratory investigating ${cleanTitle}. Includes real-time mathematical simulation, apparatus modeling, and viva evaluation.`,
    video: {
      title: `${cleanTitle} Laboratory Briefing`,
      summary: `Standard laboratory briefing and experimental protocol for ${cleanTitle}. Review guidelines and proceed to the virtual simulation workbench.`,
      hasVideo: false
    },
    safety: {
      protocol: "UPEM / Engineering Safety Protocol",
      isElectrical: false,
      precautions: [
        {
          title: "⚙️ Apparatus Calibration",
          severity: "warning",
          borderColor: "#f59e0b",
          titleColor: "#fbbf24",
          description: `Verify zero-offsets on sensors and keep input stimulus within specified limits for ${cleanTitle}.`
        }
      ]
    },
    simulation: {
      type: "parametric_rig",
      scene: "generic_physics",
      parameters: [
        { id: "paramA", label: "Primary Parameter (X)", unit: "units", min: 1, max: 100, default: 20, step: 1 },
        { id: "paramB", label: "Secondary Parameter (Y)", unit: "units", min: 10, max: 500, default: 100, step: 10 }
      ],
      physicsModel: {
        equations: [
          "outputResponse = (paramA * paramB) / 10",
          "efficiency = min(100, (outputResponse / paramB) * 100)",
          "loss = max(0, paramB - outputResponse)"
        ],
        sweepVariable: "paramA",
        sweepMin: 1,
        sweepMax: 100,
        plotX: "paramA",
        plotY: "outputResponse",
        xLabel: "Parameter X",
        yLabel: "Output Response",
        instruments: {
          dmm: { mode: "DCV", variable: "outputResponse" }
        }
      }
    },
    apparatus: [
      { name: `${cleanTitle} Test Rig`, spec: "Laboratory Grade Instrumentation Rig", quantity: "1 Unit", icon: "🔬" },
      { name: "Digital Sensor Transducer", spec: "High-precision measurement interface", quantity: "1 Unit", icon: "📟" },
      { name: "Regulated Power Unit", spec: "Variable supply source", quantity: "1 Unit", icon: "🔋" }
    ],
    theory: {
      title: `Theoretical Principles of ${cleanTitle}`,
      objective: `To experimentally investigate the functional dependencies, governing laws, and performance characteristics of ${cleanTitle}.`,
      formulaDetails: [
        {
          name: "Governing Relation",
          formula: "Y = f(X_1, X_2, ...)",
          description: `Defines the characteristic physical transfer function and energy transfer mechanism in ${cleanTitle}.`
        }
      ]
    },
    procedure: [
      `1. Verify circuit and bench setup for ${cleanTitle}.`,
      "2. Set initial baseline parameters using the slider controls.",
      "3. Initiate the simulation run and observe instrument readings.",
      "4. Log measurement data at consecutive parameter steps.",
      "5. Compare experimental curve against theoretical predictions."
    ],
    observations: {
      name: `${slug}_Observations`,
      rows: [
        { id: "paramA", label: "Parameter A", type: "input" },
        { id: "paramB", label: "Parameter B", type: "input" },
        { id: "outputResponse", label: "Measured Output", type: "observed" }
      ]
    },
    calculations: {
      title: "Analytical Computations",
      overview: `Calculate derived quantities and verify conservation equations for ${cleanTitle}.`,
      steps: [
        { step: 1, title: "Output Evaluation", equation: "Output = (Param_A × Param_B) / 10" },
        { step: 2, title: "Efficiency / Gain", equation: "η = (Output / Input) × 100%" }
      ]
    },
    viva: [
      [`What is the governing principle of ${cleanTitle}?`, `It is governed by standard physical laws linking input stimuli to system response.`],
      ["What are the principal sources of experimental error?", "Instrument calibration tolerance, ambient thermal fluctuations, and parallax error in manual readings."]
    ]
  };
}

// ─── LOCAL STORAGE DRAFT MANAGEMENT ───────────────────────────────────────

/**
 * Retrieve all user-created or AI-generated draft experiments from localStorage.
 */
export function getDraftExperiments() {
  try {
    if (typeof window === "undefined" || !window.localStorage) return [];
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Error reading draft experiments from storage:", err);
    return [];
  }
}

/**
 * Save a newly generated or edited draft experiment to localStorage.
 */
export function saveDraftExperiment(exp) {
  try {
    if (typeof window === "undefined" || !window.localStorage) return false;
    const drafts = getDraftExperiments();
    const existingIdx = drafts.findIndex(d => d.id === exp.id);
    if (existingIdx >= 0) {
      drafts[existingIdx] = exp;
    } else {
      drafts.unshift(exp);
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
    return true;
  } catch (err) {
    console.error("Error saving draft experiment:", err);
    return false;
  }
}

/**
 * Delete a draft experiment by ID.
 */
export function deleteDraftExperiment(id) {
  try {
    if (typeof window === "undefined" || !window.localStorage) return false;
    const drafts = getDraftExperiments();
    const filtered = drafts.filter(d => d.id !== id);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (err) {
    console.error("Error deleting draft experiment:", err);
    return false;
  }
}

/**
 * Robust resolver: finds a draft by ID from localStorage, presets, or synthesizes on demand.
 */
export function findPresetOrSynthesize(id) {
  if (!id) return null;

  // 1. Check local storage drafts
  const drafts = getDraftExperiments();
  const found = drafts.find(d => d.id === id);
  if (found) return found;

  // 2. Check preset templates
  for (const t of Object.values(PRESET_TEMPLATES)) {
    if (t.id === id) return t;
  }

  // 3. If starts with draft-, synthesize from slug
  if (id.startsWith("draft-")) {
    const topic = id.replace("draft-", "").replace(/-/g, " ");
    const synthesized = synthesizeExperimentModel(topic);
    synthesized.id = id;
    saveDraftExperiment(synthesized);
    return synthesized;
  }

  return null;
}

