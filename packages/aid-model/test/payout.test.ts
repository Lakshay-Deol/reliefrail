import { describe, expect, it } from "vitest";
import { calculateDistrictPayouts, NEPAL_FLOOD_DATASET } from "../src/payout";

describe("ReliefRail Payout Formula (Single Source of Truth)", () => {
  it("computes exact vulnerability scores (S) and payouts for the reference table", () => {
    const results = calculateDistrictPayouts(NEPAL_FLOOD_DATASET, { floor: 1500, spread: 2000 });

    const expected = [
      { name: "Makwanpur", rainMm: 517, kutchaPercent: 46.8, mpi: 0.218, s: 0.967, payout: 3450 },
      { name: "Sindhupalchok", rainMm: 298, kutchaPercent: 49.5, mpi: 0.231, s: 0.831, payout: 3150 },
      { name: "Kavrepalanchok", rainMm: 312, kutchaPercent: 41.2, mpi: 0.174, s: 0.717, payout: 2950 },
      { name: "Lalitpur", rainMm: 285, kutchaPercent: 22.4, mpi: 0.082, s: 0.463, payout: 2450 },
      { name: "Kathmandu", rainMm: 240, kutchaPercent: 14.1, mpi: 0.046, s: 0.331, payout: 2150 },
    ];

    expect(results).toHaveLength(expected.length);

    results.forEach((res, idx) => {
      const exp = expected[idx]!;
      expect(res.name).toBe(exp.name);
      expect(res.rainMm).toBe(exp.rainMm);
      expect(res.kutchaPercent).toBe(exp.kutchaPercent);
      expect(res.mpi).toBe(exp.mpi);
      expect(res.s).toBeCloseTo(exp.s, 3);
      expect(res.needScore100).toBeCloseTo(exp.s * 100, 1);
      expect(res.payout).toBe(exp.payout);
    });
  });

  it("handles custom floor and spread adjustments dynamically", () => {
    const customResults = calculateDistrictPayouts(NEPAL_FLOOD_DATASET, { floor: 2000, spread: 3000 });
    const makwanpur = customResults.find((r) => r.name === "Makwanpur")!;
    // 2000 + 3000 * 0.96675 = 4900.25 -> 4900
    expect(makwanpur.payout).toBe(4900);
  });
});
