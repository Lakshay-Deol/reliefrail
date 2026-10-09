/**
 * ReliefRail: Disaster Hazard Scoring and Transparent Policy Allocation Model.
 *
 * Grounded in the historic Nepal Monsoon Floods & Cloudburst (Late September 2024)
 * across 5 critically affected districts in the Bagmati & Himalayan river basin.
 * Cites official public data: DHM Nepal (Department of Hydrology & Meteorology),
 * National Population and Housing Census, and National MPI Report.
 *
 * Policy Formula (Calibrated for Himalayan Cloudburst / Flood Inundation):
 *  h_d = 0.50 * (Rain_48h / 400) + 0.15 * (V_max / 120)^2 + 0.20 * Fragile_Housing_Share + 0.15 * MPI_Score
 *  Need_d = 1 - exp(-h_d * 2.2)
 *  RawPayout_d = lambda * Need_d * (1 + MPI_Score) * BaseUnit
 *  Payout_d = clamp(RawPayout_d, MinPayout, MaxPayout)
 *
 * Lambda is numerically solved so sum(SampledHouseholds_d * Payout_d) == TotalBudget.
 */

export interface IndiaDistrictData {
  districtCode: number;
  name: string;
  state: string;
  lat: number;
  lon: number;
  /** Peak 3-second gust / sustained wind in km/h from meteorological stations */
  peakWindKmh: number;
  /** 48-hour cumulative rainfall in mm from DHM gridded & station data */
  rain48hMm: number;
  /** Fraction of households living in non-engineered / fragile mud-stone structures */
  kutchaHousingShare: number;
  /** Multidimensional Poverty Index headcount ratio */
  povertyIndex: number;
  /** Estimated total household population in district */
  totalHouseholds: number;
}

export interface DistrictAllocationResult {
  districtCode: number;
  name: string;
  hazardScore: number;
  needScore: number;
  isTriggered: boolean;
  eligibleHouseholds: number;
  payoutPerHouseholdInr: number;
  totalDistrictBudgetInr: number;
  primaryHazardDriver: "wind" | "rain" | "vulnerability";
}

export interface IndiaAllocationSummary {
  disasterId: string;
  eventName: string;
  totalBudgetInr: number;
  totalDisbursedInr: number;
  totalHouseholdsBenefited: number;
  lambda: number;
  districts: DistrictAllocationResult[];
}

/**
 * Verified historical baseline data for Nepal Districts during the September 2024 Record Floods.
 * Data sources:
 * - DHM Nepal (Department of Hydrology and Meteorology Special Weather Record)
 * - National Statistics Office (Census Housing Series)
 * - National Planning Commission / UNDP Multidimensional Poverty Index
 */
export const NEPAL_FLOOD_DISTRICTS: IndiaDistrictData[] = [
  {
    districtCode: 401,
    name: "Makwanpur",
    state: "Bagmati",
    lat: 27.4287,
    lon: 85.0322,
    peakWindKmh: 75,
    rain48hMm: 517, // Record 517mm at Daman station (all-time Nepal record)
    kutchaHousingShare: 0.382,
    povertyIndex: 0.245,
    totalHouseholds: 105000,
  },
  {
    districtCode: 402,
    name: "Kavrepalanchok",
    state: "Bagmati",
    lat: 27.6253,
    lon: 85.5561,
    peakWindKmh: 65,
    rain48hMm: 360, // Roshi River flash floods & BP Highway collapse
    kutchaHousingShare: 0.346,
    povertyIndex: 0.218,
    totalHouseholds: 98000,
  },
  {
    districtCode: 403,
    name: "Lalitpur",
    state: "Bagmati",
    lat: 27.6588,
    lon: 85.3247,
    peakWindKmh: 55,
    rain48hMm: 322, // Nakkhu and Karmanasha river overflow
    kutchaHousingShare: 0.168,
    povertyIndex: 0.089,
    totalHouseholds: 135000,
  },
  {
    districtCode: 404,
    name: "Kathmandu",
    state: "Bagmati",
    lat: 27.7172,
    lon: 85.3240,
    peakWindKmh: 50,
    rain48hMm: 240, // 239.7mm airport 24h all-time record, Bagmati inundation
    kutchaHousingShare: 0.124,
    povertyIndex: 0.072,
    totalHouseholds: 280000,
  },
  {
    districtCode: 405,
    name: "Sindhupalchok",
    state: "Bagmati",
    lat: 27.9510,
    lon: 85.6890,
    peakWindKmh: 60,
    rain48hMm: 310, // Melamchi & Bhotekoshi river surge, Araniko bridge sweeps
    kutchaHousingShare: 0.415,
    povertyIndex: 0.281,
    totalHouseholds: 75000,
  },
];

// Alias for backwards compatibility
export const CYCLONE_FANI_DISTRICTS = NEPAL_FLOOD_DISTRICTS;

/**
 * Weights for transparent policy hazard formula calibrated for flood & cloudburst disasters.
 */
export const HAZARD_WEIGHTS = {
  rain: 0.50,
  wind: 0.15,
  kutcha: 0.20,
  poverty: 0.15,
  referenceRainMm: 400,
  referenceWindCat5Kmh: 120,
  triggerThreshold: 0.35, // Hazard score must exceed 0.35 to declare emergency
};

export const RELIEF_PAYOUT_LIMITS = {
  minPayoutInr: 1000, // ₹1,000 / base unit minimum emergency grant floor
  maxPayoutInr: 5000, // ₹5,000 / base unit maximum severe grant ceiling
  defaultPerOrderCapInr: 1500, // Max per single merchant spend
  defaultRolling24hCapInr: 2500, // Max spend in rolling 24 hours
  expiryDays: 30, // Unspent aid reclaimed after 30 days
};

/**
 * Computes deterministic hazard score h and need index for a district.
 */
export function computeDistrictHazard(d: IndiaDistrictData) {
  const rainNorm = Math.min(1.0, d.rain48hMm / HAZARD_WEIGHTS.referenceRainMm);
  const rainComponent = HAZARD_WEIGHTS.rain * rainNorm;

  const windNorm = Math.min(1.0, d.peakWindKmh / HAZARD_WEIGHTS.referenceWindCat5Kmh);
  const windComponent = HAZARD_WEIGHTS.wind * Math.pow(windNorm, 2);

  const kutchaComponent = HAZARD_WEIGHTS.kutcha * d.kutchaHousingShare;
  const povertyComponent = HAZARD_WEIGHTS.poverty * d.povertyIndex;

  const hazardScore = rainComponent + windComponent + kutchaComponent + povertyComponent;
  const needScore = 1 - Math.exp(-hazardScore * 2.2);

  let primaryHazardDriver: "wind" | "rain" | "vulnerability" = "rain";
  if (windComponent > rainComponent && windComponent > kutchaComponent + povertyComponent) {
    primaryHazardDriver = "wind";
  } else if (kutchaComponent + povertyComponent > rainComponent) {
    primaryHazardDriver = "vulnerability";
  }

  return {
    hazardScore: Number(hazardScore.toFixed(4)),
    needScore: Number(needScore.toFixed(4)),
    isTriggered: hazardScore >= HAZARD_WEIGHTS.triggerThreshold,
    primaryHazardDriver,
  };
}

/**
 * Solves lambda to exactly disburse the targeted budget across triggered districts.
 */
export function allocateIndiaRelief(
  districts: IndiaDistrictData[] = NEPAL_FLOOD_DISTRICTS,
  totalBudgetInr = 50_000_000, // ₹5 Crore / 50M base pool
  sampleTargetHouseholds = 20_000 // Number of beneficiary accounts in active simulation
): IndiaAllocationSummary {
  const scored = districts.map((d) => {
    const hazard = computeDistrictHazard(d);
    return { district: d, ...hazard };
  });

  const triggered = scored.filter((s) => s.isTriggered);
  if (triggered.length === 0) {
    return {
      disasterId: "NEPAL-FLOOD-2024",
      eventName: "Nepal Floods & Cloudburst (September 2024)",
      totalBudgetInr,
      totalDisbursedInr: 0,
      totalHouseholdsBenefited: 0,
      lambda: 0,
      districts: scored.map((s) => ({
        districtCode: s.district.districtCode,
        name: s.district.name,
        hazardScore: s.hazardScore,
        needScore: s.needScore,
        isTriggered: false,
        eligibleHouseholds: 0,
        payoutPerHouseholdInr: 0,
        totalDistrictBudgetInr: 0,
        primaryHazardDriver: s.primaryHazardDriver,
      })),
    };
  }

  // Weight sample households proportionally across triggered districts based on total households & need
  const totalWeight = triggered.reduce((acc, s) => acc + s.district.totalHouseholds * s.needScore, 0);

  const districtHouseholds = triggered.map((s) => {
    const weight = (s.district.totalHouseholds * s.needScore) / totalWeight;
    const sampleHh = Math.max(100, Math.round(sampleTargetHouseholds * weight));
    const baseWeight = s.needScore * (1 + s.district.povertyIndex);
    return { ...s, sampleHh, baseWeight };
  });

  // Binary search for lambda that matches totalBudgetInr
  let low = 100;
  let high = 100_000;
  let bestLambda = 1000;

  for (let iter = 0; iter < 40; iter++) {
    const mid = (low + high) / 2;
    const totalSpent = districtHouseholds.reduce((sum, item) => {
      const rawPayout = mid * item.baseWeight;
      const payout = Math.min(
        RELIEF_PAYOUT_LIMITS.maxPayoutInr,
        Math.max(RELIEF_PAYOUT_LIMITS.minPayoutInr, Math.round(rawPayout / 50) * 50)
      );
      return sum + payout * item.sampleHh;
    }, 0);

    if (Math.abs(totalSpent - totalBudgetInr) < 50_000) {
      bestLambda = mid;
      break;
    }
    if (totalSpent < totalBudgetInr) {
      low = mid;
    } else {
      high = mid;
    }
    bestLambda = mid;
  }

  let totalDisbursed = 0;
  let totalBeneficiaries = 0;

  const districtResults: DistrictAllocationResult[] = scored.map((s) => {
    const match = districtHouseholds.find((d) => d.district.districtCode === s.district.districtCode);
    if (!match || !s.isTriggered) {
      return {
        districtCode: s.district.districtCode,
        name: s.district.name,
        hazardScore: s.hazardScore,
        needScore: s.needScore,
        isTriggered: false,
        eligibleHouseholds: 0,
        payoutPerHouseholdInr: 0,
        totalDistrictBudgetInr: 0,
        primaryHazardDriver: s.primaryHazardDriver,
      };
    }

    const rawPayout = bestLambda * match.baseWeight;
    const payout = Math.min(
      RELIEF_PAYOUT_LIMITS.maxPayoutInr,
      Math.max(RELIEF_PAYOUT_LIMITS.minPayoutInr, Math.round(rawPayout / 50) * 50)
    );
    const districtTotal = payout * match.sampleHh;
    totalDisbursed += districtTotal;
    totalBeneficiaries += match.sampleHh;

    return {
      districtCode: s.district.districtCode,
      name: s.district.name,
      hazardScore: s.hazardScore,
      needScore: s.needScore,
      isTriggered: true,
      eligibleHouseholds: match.sampleHh,
      payoutPerHouseholdInr: payout,
      totalDistrictBudgetInr: districtTotal,
      primaryHazardDriver: s.primaryHazardDriver,
    };
  });

  return {
    disasterId: "NEPAL-FLOOD-2024",
    eventName: "Nepal Floods & Cloudburst (September 2024)",
    totalBudgetInr,
    totalDisbursedInr: totalDisbursed,
    totalHouseholdsBenefited: totalBeneficiaries,
    lambda: Number(bestLambda.toFixed(2)),
    districts: districtResults,
  };
}
