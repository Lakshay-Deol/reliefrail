/**
 * ReliefRail Single Source of Truth Payout Module.
 *
 * Implements the deterministic multi-hazard vulnerability scoring formula:
 *   S_i = 0.4 * (Rain_i / MaxRain) + 0.3 * (Kutcha_i / MaxKutcha) + 0.3 * (MPI_i / MaxMPI)
 *   Payout_i = Floor + Spread * S_i
 *
 * Payouts are rounded to the nearest ₹50 (or NPR equivalent).
 */

export interface DistrictMetric {
  name: string;
  districtCode: number;
  rainMm: number;
  kutchaPercent: number; // percentage e.g. 46.8
  mpi: number; // e.g. 0.218
  totalHouseholds?: number;
}

export interface PayoutParams {
  floor?: number; // default: 1500
  spread?: number; // default: 2000
}

export interface PayoutOutput {
  name: string;
  districtCode: number;
  rainMm: number;
  kutchaPercent: number;
  mpi: number;
  s: number; // Normalized vulnerability score [0.0 - 1.0]
  needScore100: number; // S * 100, e.g. 96.7
  rawPayout: number;
  payout: number; // Rounded to nearest ₹50
}

export const NEPAL_FLOOD_DATASET: DistrictMetric[] = [
  {
    name: "Makwanpur",
    districtCode: 41,
    rainMm: 517,
    kutchaPercent: 46.8,
    mpi: 0.218,
    totalHouseholds: 98_420,
  },
  {
    name: "Sindhupalchok",
    districtCode: 23,
    rainMm: 298,
    kutchaPercent: 49.5,
    mpi: 0.231,
    totalHouseholds: 66_750,
  },
  {
    name: "Kavrepalanchok",
    districtCode: 24,
    rainMm: 312,
    kutchaPercent: 41.2,
    mpi: 0.174,
    totalHouseholds: 88_910,
  },
  {
    name: "Lalitpur",
    districtCode: 28,
    rainMm: 285,
    kutchaPercent: 22.4,
    mpi: 0.082,
    totalHouseholds: 112_300,
  },
  {
    name: "Kathmandu",
    districtCode: 27,
    rainMm: 240,
    kutchaPercent: 14.1,
    mpi: 0.046,
    totalHouseholds: 254_800,
  },
];

/**
 * Calculates district vulnerability scores (S_i) and per-household payouts.
 */
export function calculateDistrictPayouts(
  districts: DistrictMetric[] = NEPAL_FLOOD_DATASET,
  params: PayoutParams = {},
): PayoutOutput[] {
  const floor = params.floor ?? 1500;
  const spread = params.spread ?? 2000;

  const maxRain = Math.max(...districts.map((d) => d.rainMm), 1);
  const maxKutcha = Math.max(...districts.map((d) => d.kutchaPercent), 1);
  const maxMpi = Math.max(...districts.map((d) => d.mpi), 0.001);

  return districts.map((d) => {
    const rainComponent = 0.4 * (d.rainMm / maxRain);
    const kutchaComponent = 0.3 * (d.kutchaPercent / maxKutcha);
    const mpiComponent = 0.3 * (d.mpi / maxMpi);

    const s = rainComponent + kutchaComponent + mpiComponent;
    const rawPayout = floor + spread * s;
    const payout = Math.round(rawPayout / 50) * 50;

    return {
      name: d.name,
      districtCode: d.districtCode,
      rainMm: d.rainMm,
      kutchaPercent: d.kutchaPercent,
      mpi: d.mpi,
      s: Number(s.toFixed(3)),
      needScore100: Number((s * 100).toFixed(1)),
      rawPayout: Math.round(rawPayout),
      payout,
    };
  });
}
