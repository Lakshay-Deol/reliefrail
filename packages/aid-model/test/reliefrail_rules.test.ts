import { describe, expect, it } from "vitest";
import {
  findHouseholdPda,
  findMerchantPda,
  findPoolPda,
  ReliefPubkey,
  ReliefRailEngine,
  ReliefRailErrorCode,
} from "../../chain/src/reliefrail.js";

describe("ReliefRail On-Chain Anchor Rule Engine (India Disaster Relief)", () => {
  const admin = ReliefPubkey.generate();
  const oracle = ReliefPubkey.generate();
  const disasterId = new Uint8Array(32).fill(7); // Hash of "ODISHA-FANI-2019"
  const mint = ReliefPubkey.generate();
  const vault = ReliefPubkey.generate();

  const totalBudget = 50_000_000_00n; // ₹5,00,00,000 (in paise)
  const orderCap = 1500_00n; // ₹1,500
  const dailyCap = 2500_00n; // ₹2,500
  const durationSeconds = 30n * 86400n; // 30 days
  const startTs = 1714710000n; // Landfall timestamp

  it("initializes disaster relief pool with correct PDA and spending caps", () => {
    const engine = new ReliefRailEngine();
    const { poolPda, pool } = engine.initializePool({
      admin,
      oracle,
      disasterId,
      name: "Cyclone Fani Relief 2019",
      mint,
      vault,
      totalBudget,
      orderCap,
      dailyCap,
      durationSeconds,
      currentTs: startTs,
    });

    const [expectedPda] = findPoolPda(disasterId);
    expect(poolPda.equals(expectedPda)).toBe(true);
    expect(pool.isActive).toBe(true);
    expect(pool.totalBudget).toBe(totalBudget);
    expect(pool.orderCap).toBe(1500_00n);
    expect(pool.dailyCap).toBe(2500_00n);
  });

  it("registers verified merchant in Puri district (District 374)", () => {
    const engine = new ReliefRailEngine();
    const { poolPda } = engine.initializePool({
      admin,
      oracle,
      disasterId,
      name: "Cyclone Fani Relief 2019",
      mint,
      vault,
      totalBudget,
      orderCap,
      dailyCap,
      durationSeconds,
      currentTs: startTs,
    });

    const merchantWallet = ReliefPubkey.generate();
    const { merchantPda, merchant } = engine.registerMerchant({
      poolPda,
      admin,
      merchantWallet,
      districtCode: 374, // Puri
      businessName: "Maa Tarini Grocery, Puri",
      baselinePrice: 100_00n,
    });

    const [expectedPda] = findMerchantPda(poolPda, merchantWallet);
    expect(merchantPda.equals(expectedPda)).toBe(true);
    expect(merchant.districtCode).toBe(374);
    expect(merchant.isSuspended).toBe(false);
  });

  it("releases aid to affected household in Puri district", () => {
    const engine = new ReliefRailEngine();
    const { poolPda } = engine.initializePool({
      admin,
      oracle,
      disasterId,
      name: "Cyclone Fani Relief 2019",
      mint,
      vault,
      totalBudget,
      orderCap,
      dailyCap,
      durationSeconds,
      currentTs: startTs,
    });

    const resident = ReliefPubkey.generate();
    const { householdPda, household } = engine.releaseAid({
      poolPda,
      authority: oracle,
      beneficiaryWallet: resident,
      districtCode: 374,
      amount: 3500_00n, // ₹3,500 allocated
      currentTs: startTs + 100n,
    });

    const [expectedPda] = findHouseholdPda(poolPda, resident);
    expect(householdPda.equals(expectedPda)).toBe(true);
    expect(household.allocatedAmount).toBe(3500_00n);
    expect(household.spentAmount).toBe(0n);
  });

  it("executes valid grocery spend inside same disaster district within caps", () => {
    const engine = new ReliefRailEngine();
    const { poolPda } = engine.initializePool({
      admin,
      oracle,
      disasterId,
      name: "Cyclone Fani Relief 2019",
      mint,
      vault,
      totalBudget,
      orderCap,
      dailyCap,
      durationSeconds,
      currentTs: startTs,
    });

    const merchantWallet = ReliefPubkey.generate();
    engine.registerMerchant({
      poolPda,
      admin,
      merchantWallet,
      districtCode: 374,
      businessName: "Puri Central Provisions",
      baselinePrice: 100_00n,
    });

    const resident = ReliefPubkey.generate();
    engine.releaseAid({
      poolPda,
      authority: oracle,
      beneficiaryWallet: resident,
      districtCode: 374,
      amount: 3500_00n,
      currentTs: startTs + 100n,
    });

    // Spend ₹1,200 (under ₹1,500 order cap)
    const result = engine.spend({
      poolPda,
      merchantWallet,
      beneficiaryWallet: resident,
      amount: 1200_00n,
      currentTs: startTs + 200n,
    });

    expect(result.success).toBe(true);
    expect(result.household.spentAmount).toBe(1200_00n);
    expect(result.merchant.totalReceived).toBe(1200_00n);
  });

  it("RULE CHECK: refuses spend when merchant is in a different district (OutOfZone)", () => {
    const engine = new ReliefRailEngine();
    const { poolPda } = engine.initializePool({
      admin,
      oracle,
      disasterId,
      name: "Cyclone Fani Relief 2019",
      mint,
      vault,
      totalBudget,
      orderCap,
      dailyCap,
      durationSeconds,
      currentTs: startTs,
    });

    // Merchant in Khordha (District 375)
    const khordhaMerchant = ReliefPubkey.generate();
    engine.registerMerchant({
      poolPda,
      admin,
      merchantWallet: khordhaMerchant,
      districtCode: 375,
      businessName: "Bhubaneswar Supermarket",
      baselinePrice: 100_00n,
    });

    // Resident in Puri (District 374)
    const puriResident = ReliefPubkey.generate();
    engine.releaseAid({
      poolPda,
      authority: oracle,
      beneficiaryWallet: puriResident,
      districtCode: 374,
      amount: 3500_00n,
      currentTs: startTs + 100n,
    });

    expect(() =>
      engine.spend({
        poolPda,
        merchantWallet: khordhaMerchant,
        beneficiaryWallet: puriResident,
        amount: 500_00n,
        currentTs: startTs + 200n,
      })
    ).toThrowError(`Error ${ReliefRailErrorCode.OutOfZone}`);
  });

  it("RULE CHECK: refuses order exceeding per-order cap (OverOrderCap)", () => {
    const engine = new ReliefRailEngine();
    const { poolPda } = engine.initializePool({
      admin,
      oracle,
      disasterId,
      name: "Cyclone Fani Relief 2019",
      mint,
      vault,
      totalBudget,
      orderCap: 1500_00n, // ₹1,500 cap
      dailyCap,
      durationSeconds,
      currentTs: startTs,
    });

    const merchantWallet = ReliefPubkey.generate();
    engine.registerMerchant({
      poolPda,
      admin,
      merchantWallet,
      districtCode: 374,
      businessName: "Puri Provision Store",
      baselinePrice: 100_00n,
    });

    const resident = ReliefPubkey.generate();
    engine.releaseAid({
      poolPda,
      authority: oracle,
      beneficiaryWallet: resident,
      districtCode: 374,
      amount: 3500_00n,
      currentTs: startTs + 100n,
    });

    // Attempt ₹2,000 order (cap is ₹1,500)
    expect(() =>
      engine.spend({
        poolPda,
        merchantWallet,
        beneficiaryWallet: resident,
        amount: 2000_00n,
        currentTs: startTs + 200n,
      })
    ).toThrowError(`Error ${ReliefRailErrorCode.OverOrderCap}`);
  });

  it("RULE CHECK: refuses cumulative spend exceeding rolling 24-hour cap (OverDailyCap)", () => {
    const engine = new ReliefRailEngine();
    const { poolPda } = engine.initializePool({
      admin,
      oracle,
      disasterId,
      name: "Cyclone Fani Relief 2019",
      mint,
      vault,
      totalBudget,
      orderCap: 1500_00n,
      dailyCap: 2500_00n, // ₹2,500 per rolling 24h
      durationSeconds,
      currentTs: startTs,
    });

    const merchantWallet = ReliefPubkey.generate();
    engine.registerMerchant({
      poolPda,
      admin,
      merchantWallet,
      districtCode: 374,
      businessName: "Puri Provision Store",
      baselinePrice: 100_00n,
    });

    const resident = ReliefPubkey.generate();
    engine.releaseAid({
      poolPda,
      authority: oracle,
      beneficiaryWallet: resident,
      districtCode: 374,
      amount: 4500_00n,
      currentTs: startTs + 100n,
    });

    // Spend 1: ₹1,400 at hour 1
    engine.spend({
      poolPda,
      merchantWallet,
      beneficiaryWallet: resident,
      amount: 1400_00n,
      currentTs: startTs + 3600n,
    });

    // Spend 2: ₹1,000 at hour 3 (Cumulative = ₹2,400, under ₹2,500 cap)
    engine.spend({
      poolPda,
      merchantWallet,
      beneficiaryWallet: resident,
      amount: 1000_00n,
      currentTs: startTs + 10800n,
    });

    // Spend 3: ₹500 at hour 5 (Cumulative = ₹2,900, exceeds ₹2,500 daily cap)
    expect(() =>
      engine.spend({
        poolPda,
        merchantWallet,
        beneficiaryWallet: resident,
        amount: 500_00n,
        currentTs: startTs + 18000n,
      })
    ).toThrowError(`Error ${ReliefRailErrorCode.OverDailyCap}`);

    // Spend 4: After 25 hours (window reset), new spend succeeds!
    const result25h = engine.spend({
      poolPda,
      merchantWallet,
      beneficiaryWallet: resident,
      amount: 1000_00n,
      currentTs: startTs + 10800n + 86500n,
    });
    expect(result25h.success).toBe(true);
  });

  it("RULE CHECK: refuses spend at merchant suspended for price gouging (MerchantSuspended)", () => {
    const engine = new ReliefRailEngine();
    const { poolPda } = engine.initializePool({
      admin,
      oracle,
      disasterId,
      name: "Cyclone Fani Relief 2019",
      mint,
      vault,
      totalBudget,
      orderCap,
      dailyCap,
      durationSeconds,
      currentTs: startTs,
    });

    const merchantWallet = ReliefPubkey.generate();
    engine.registerMerchant({
      poolPda,
      admin,
      merchantWallet,
      districtCode: 374,
      businessName: "Opportunistic Store",
      baselinePrice: 100_00n,
    });

    const resident = ReliefPubkey.generate();
    engine.releaseAid({
      poolPda,
      authority: oracle,
      beneficiaryWallet: resident,
      districtCode: 374,
      amount: 3500_00n,
      currentTs: startTs + 100n,
    });

    // Oracle suspends merchant due to detected +45% water price hike
    engine.suspendMerchant({
      poolPda,
      merchantWallet,
      authority: oracle,
      reasonCode: 1, // Price gouging code
    });

    expect(() =>
      engine.spend({
        poolPda,
        merchantWallet,
        beneficiaryWallet: resident,
        amount: 500_00n,
        currentTs: startTs + 200n,
      })
    ).toThrowError(`Error ${ReliefRailErrorCode.MerchantSuspended}`);
  });

  it("RULE CHECK: refuses spend after pool expiry and permits clawback", () => {
    const engine = new ReliefRailEngine();
    const { poolPda } = engine.initializePool({
      admin,
      oracle,
      disasterId,
      name: "Cyclone Fani Relief 2019",
      mint,
      vault,
      totalBudget,
      orderCap,
      dailyCap,
      durationSeconds: 30n * 86400n, // 30 days
      currentTs: startTs,
    });

    const merchantWallet = ReliefPubkey.generate();
    engine.registerMerchant({
      poolPda,
      admin,
      merchantWallet,
      districtCode: 374,
      businessName: "Puri Provision Store",
      baselinePrice: 100_00n,
    });

    const resident = ReliefPubkey.generate();
    engine.releaseAid({
      poolPda,
      authority: oracle,
      beneficiaryWallet: resident,
      districtCode: 374,
      amount: 3500_00n,
      currentTs: startTs + 100n,
    });

    // Spend ₹1,000 on Day 2
    engine.spend({
      poolPda,
      merchantWallet,
      beneficiaryWallet: resident,
      amount: 1000_00n,
      currentTs: startTs + 2n * 86400n,
    });

    // Early reclaim attempt at Day 15 fails
    expect(() =>
      engine.reclaimExpiredAid({
        poolPda,
        beneficiaryWallet: resident,
        authority: admin,
        currentTs: startTs + 15n * 86400n,
      })
    ).toThrowError(`Error ${ReliefRailErrorCode.ClawbackTooEarly}`);

    // Spend attempt on Day 31 (after expiry) fails
    expect(() =>
      engine.spend({
        poolPda,
        merchantWallet,
        beneficiaryWallet: resident,
        amount: 500_00n,
        currentTs: startTs + 31n * 86400n,
      })
    ).toThrowError(`Error ${ReliefRailErrorCode.AidExpired}`);

    // Reclaim after Day 30 succeeds and reclaims remaining ₹2,500
    const reclaim = engine.reclaimExpiredAid({
      poolPda,
      beneficiaryWallet: resident,
      authority: admin,
      currentTs: startTs + 31n * 86400n,
    });
    expect(reclaim.reclaimedAmount).toBe(2500_00n);
  });
});
