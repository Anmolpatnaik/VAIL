/**
 * MeasurementEngine.js — VAIL 2.0 Measurement Engine
 * Blueprint Reference: §2, §9, §10
 * 
 * Provides client-side instrument measurement modeling, ADC resolution quantisation,
 * realistic sensor noise, component tolerances, and GUM/ISO uncertainty budgets.
 */

export const InstrumentTypes = {
  MULTIMETER_DCV: 'multimeter_dcv',
  MULTIMETER_ACV: 'multimeter_acv',
  MULTIMETER_DCA: 'multimeter_dca',
  MULTIMETER_RESISTANCE: 'multimeter_resistance',
  MULTIMETER_CAPACITANCE: 'multimeter_capacitance',
  OSCILLOSCOPE: 'oscilloscope',
  STOPWATCH: 'stopwatch',
  VERNIER: 'vernier',
  MICROMETER: 'micrometer',
  GENERIC: 'generic',
};

export const INSTRUMENT_SPECS = {
  [InstrumentTypes.MULTIMETER_DCV]: {
    unit: 'V',
    resolution: 0.001,       // 1 mV on 2V range
    gainAccuracy: 0.005,     // ±(0.5% + 2 digits)
    digitOffset: 2,
    noiseSd: 0.0008,
  },
  [InstrumentTypes.MULTIMETER_ACV]: {
    unit: 'V',
    resolution: 0.001,
    gainAccuracy: 0.01,      // ±(1.0% + 5 digits)
    digitOffset: 5,
    noiseSd: 0.0015,
  },
  [InstrumentTypes.MULTIMETER_DCA]: {
    unit: 'mA',
    resolution: 0.01,
    gainAccuracy: 0.008,
    digitOffset: 2,
    noiseSd: 0.01,
  },
  [InstrumentTypes.MULTIMETER_RESISTANCE]: {
    unit: 'Ω',
    resolution: 0.1,
    gainAccuracy: 0.008,
    digitOffset: 2,
    noiseSd: 0.05,
  },
  [InstrumentTypes.MULTIMETER_CAPACITANCE]: {
    unit: 'μF',
    resolution: 0.01,
    gainAccuracy: 0.02,
    digitOffset: 5,
    noiseSd: 0.02,
  },
  [InstrumentTypes.OSCILLOSCOPE]: {
    unit: 'V',
    resolution: 0.01,
    gainAccuracy: 0.02,
    digitOffset: 1,
    noiseSd: 0.005,
  },
  [InstrumentTypes.STOPWATCH]: {
    unit: 's',
    resolution: 0.01,
    gainAccuracy: 0.0005,
    digitOffset: 1,
    humanReactionSd: 0.15,
    noiseSd: 0.02,
  },
  [InstrumentTypes.VERNIER]: {
    unit: 'mm',
    resolution: 0.02,
    gainAccuracy: 0.0,
    digitOffset: 1,
    noiseSd: 0.005,
  },
  [InstrumentTypes.MICROMETER]: {
    unit: 'mm',
    resolution: 0.01,
    gainAccuracy: 0.0,
    digitOffset: 1,
    noiseSd: 0.002,
  },
};

/**
 * Standard Box-Muller transform for generating standard Gaussian random variates.
 */
function randomGaussian(mean = 0, standardDeviation = 1) {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return num * standardDeviation + mean;
}

/**
 * Quantize a continuous value to the instrument's least count resolution.
 */
export function quantize(value, resolution) {
  if (resolution <= 0) return value;
  const steps = Math.round(value / resolution);
  return Number((steps * resolution).toFixed(8));
}

/**
 * Get display decimals from resolution.
 */
export function getDecimals(resolution) {
  if (resolution <= 0) return 3;
  if (resolution >= 1) return 0;
  const s = resolution.toFixed(8).replace(/0+$/, '');
  const parts = s.split('.');
  return parts.length > 1 ? parts[1].length : 2;
}

/**
 * Compute realistic instrument measurement with ISO GUM uncertainty budget.
 */
export function measureQuantity(
  trueValue,
  instrumentType = InstrumentTypes.MULTIMETER_DCV,
  isRealistic = true,
  componentTolerance = 0.0,
  customSpec = null
) {
  const spec = { ...(INSTRUMENT_SPECS[instrumentType] || INSTRUMENT_SPECS[InstrumentTypes.MULTIMETER_DCV]), ...(customSpec || {}) };
  const { resolution, unit, gainAccuracy, digitOffset, noiseSd } = spec;

  const decimals = getDecimals(resolution);

  if (!isRealistic) {
    const measuredVal = quantize(trueValue, resolution);
    const absUncertainty = resolution / 2.0;
    const relUncertainty = trueValue !== 0 ? (absUncertainty / Math.abs(trueValue)) * 100 : 0;

    return {
      nominalValue: Number(trueValue.toFixed(decimals + 2)),
      measuredValue: Number(measuredVal.toFixed(decimals)),
      unit,
      resolution,
      absoluteUncertainty: Number(absUncertainty.toFixed(decimals > 2 ? decimals : 3)),
      relativeUncertaintyPercent: Number(relUncertainty.toFixed(2)),
      coverageFactorK: 2.0,
      confidenceIntervalLow: Number((measuredVal - absUncertainty).toFixed(decimals)),
      confidenceIntervalHigh: Number((measuredVal + absUncertainty).toFixed(decimals)),
      uncertaintyBudget: [],
      isRealistic: false,
      formattedReading: `${measuredVal.toFixed(decimals)} ${unit}`,
    };
  }

  // Realistic Simulation:
  // 1. Component tolerance shift
  const tolShift = componentTolerance > 0 ? randomGaussian(0, (trueValue * componentTolerance) / 3.0) : 0;

  // 2. Instrument gain & offset calibration error
  const calError = randomGaussian(0, (Math.abs(trueValue) * gainAccuracy) / Math.sqrt(3.0));

  // 3. Sensor / thermal noise
  const noise = randomGaussian(0, noiseSd);

  // 4. Human reaction time for stopwatches
  let reactionError = 0;
  if (instrumentType === InstrumentTypes.STOPWATCH) {
    reactionError = randomGaussian(0, spec.humanReactionSd || 0.15);
  }

  const rawSimulated = trueValue + tolShift + calError + noise + reactionError;
  const measuredVal = quantize(rawSimulated, resolution);

  // --- ISO GUM Uncertainty Budget ---
  const budget = [];

  // Digital Resolution (Type B)
  const uRes = (resolution / 2.0) / Math.sqrt(3.0);
  budget.push({
    name: 'Digital Resolution / Quantization',
    type: 'Type B',
    distribution: 'rectangular',
    standardUncertainty: Number(uRes.toFixed(6)),
  });

  // Instrument Manufacturer Accuracy Spec (Type B)
  const specAbs = (Math.abs(measuredVal) * gainAccuracy) + (digitOffset * resolution);
  const uSpec = specAbs / Math.sqrt(3.0);
  budget.push({
    name: 'Instrument Manufacturer Tolerance',
    type: 'Type B',
    distribution: 'rectangular',
    standardUncertainty: Number(uSpec.toFixed(6)),
  });

  // Dynamic Noise (Type A)
  budget.push({
    name: 'Sensor / Thermal Noise',
    type: 'Type A',
    distribution: 'normal',
    standardUncertainty: Number(noiseSd.toFixed(6)),
  });

  if (componentTolerance > 0) {
    const uTol = (Math.abs(trueValue) * componentTolerance) / Math.sqrt(3.0);
    budget.push({
      name: 'Component Nominal Tolerance',
      type: 'Type B',
      distribution: 'rectangular',
      standardUncertainty: Number(uTol.toFixed(6)),
    });
  }

  // Combined Standard Uncertainty: u_c = sqrt(sum(u_i^2))
  const uCombined = Math.sqrt(budget.reduce((acc, curr) => acc + Math.pow(curr.standardUncertainty, 2), 0));
  const k = 2.0;
  const uExpanded = k * uCombined;

  const relUncertainty = measuredVal !== 0 ? (uExpanded / Math.abs(measuredVal)) * 100 : 0;

  return {
    nominalValue: Number(trueValue.toFixed(decimals + 2)),
    measuredValue: Number(measuredVal.toFixed(decimals)),
    unit,
    resolution,
    absoluteUncertainty: Number(uExpanded.toFixed(decimals > 2 ? decimals : 3)),
    relativeUncertaintyPercent: Number(relUncertainty.toFixed(2)),
    coverageFactorK: k,
    confidenceIntervalLow: Number((measuredVal - uExpanded).toFixed(decimals)),
    confidenceIntervalHigh: Number((measuredVal + uExpanded).toFixed(decimals)),
    uncertaintyBudget: budget,
    isRealistic: true,
    formattedReading: `${measuredVal.toFixed(decimals)} ± ${uExpanded.toFixed(decimals > 2 ? decimals : 2)} ${unit}`,
  };
}

export default {
  InstrumentTypes,
  INSTRUMENT_SPECS,
  quantize,
  getDecimals,
  measureQuantity,
};
