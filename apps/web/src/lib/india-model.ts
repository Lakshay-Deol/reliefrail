export interface IndiaDistrictData {
  districtCode: number;
  name: string;
  state: string;
  lat: number;
  lon: number;
  peakWindKmh: number;
  rain48hMm: number;
  kutchaHousingShare: number;
  povertyIndex: number;
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

export interface AllocationSummary {
  disasterId: string;
  eventName: string;
  totalBudgetInr: number;
  totalDisbursedInr: number;
  totalHouseholdsBenefited: number;
  lambda: number;
  districts: DistrictAllocationResult[];
}

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

export const HAZARD_WEIGHTS = {
  rain: 0.50,
  wind: 0.15,
  kutcha: 0.20,
  poverty: 0.15,
  referenceRainMm: 400,
  referenceWindCat5Kmh: 120,
  triggerThreshold: 0.35,
};

export const RELIEF_PAYOUT_LIMITS = {
  minPayoutInr: 1000,
  maxPayoutInr: 5000,
  defaultPerOrderCapInr: 1500,
  defaultRolling24hCapInr: 2500,
  expiryDays: 30,
};

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

export function allocateIndiaRelief(
  districts: IndiaDistrictData[] = NEPAL_FLOOD_DISTRICTS,
  totalBudgetInr = 50_000_000,
  sampleTargetHouseholds = 20_000
): AllocationSummary {
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

  const totalWeight = triggered.reduce((acc, s) => acc + s.district.totalHouseholds * s.needScore, 0);

  const districtHouseholds = triggered.map((s) => {
    const weight = (s.district.totalHouseholds * s.needScore) / totalWeight;
    const sampleHh = Math.max(100, Math.round(sampleTargetHouseholds * weight));
    const baseWeight = s.needScore * (1 + s.district.povertyIndex);
    return { ...s, sampleHh, baseWeight };
  });

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
