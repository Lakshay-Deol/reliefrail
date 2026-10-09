import { describe, expect, it } from "vitest";
import {
  allocateIndiaRelief,
  computeDistrictHazard,
  NEPAL_FLOOD_DISTRICTS,
  HAZARD_WEIGHTS,
  RELIEF_PAYOUT_LIMITS,
} from "../src/india.js";

describe("ReliefRail Disaster Hazard & Policy Allocation Model (Nepal Floods 2024)", () => {
  it("scores Makwanpur as the highest hazard due to record 517mm rainfall at Daman", () => {
    const makwanpur = NEPAL_FLOOD_DISTRICTS.find((d) => d.name === "Makwanpur")!;
    const score = computeDistrictHazard(makwanpur);

    expect(score.isTriggered).toBe(true);
    expect(score.hazardScore).toBeGreaterThan(0.65);
    expect(score.needScore).toBeGreaterThan(0.75);
    expect(score.primaryHazardDriver).toBe("rain");
  });

  it("scores all 5 critically affected Bagmati basin districts above emergency threshold", () => {
    for (const district of NEPAL_FLOOD_DISTRICTS) {
      const score = computeDistrictHazard(district);
      expect(score.hazardScore).toBeGreaterThanOrEqual(HAZARD_WEIGHTS.triggerThreshold);
      expect(score.isTriggered).toBe(true);
    }
  });

  it("strictly enforces relief grant payout floor (₹1,000) and ceiling (₹5,000)", () => {
    const result = allocateIndiaRelief(NEPAL_FLOOD_DISTRICTS, 50_000_000, 15_000);

    for (const district of result.districts) {
      expect(district.payoutPerHouseholdInr).toBeGreaterThanOrEqual(RELIEF_PAYOUT_LIMITS.minPayoutInr);
      expect(district.payoutPerHouseholdInr).toBeLessThanOrEqual(RELIEF_PAYOUT_LIMITS.maxPayoutInr);
    }
  });

  it("allocates higher payout to Makwanpur & Kavrepalanchok than urban Kathmandu", () => {
    const result = allocateIndiaRelief(NEPAL_FLOOD_DISTRICTS, 50_000_000, 15_000);
    const makwanpur = result.districts.find((d) => d.name === "Makwanpur")!;
    const kathmandu = result.districts.find((d) => d.name === "Kathmandu")!;

    expect(makwanpur.payoutPerHouseholdInr).toBeGreaterThan(kathmandu.payoutPerHouseholdInr);
  });

  it("matches total disbursed budget close to target budget via solved lambda", () => {
    const targetBudget = 50_000_000;
    const result = allocateIndiaRelief(NEPAL_FLOOD_DISTRICTS, targetBudget, 20_000);

    expect(result.totalHouseholdsBenefited).toBeGreaterThan(15_000);
    const diffRatio = Math.abs(result.totalDisbursedInr - targetBudget) / targetBudget;
    expect(diffRatio).toBeLessThan(0.05);
  });
});

