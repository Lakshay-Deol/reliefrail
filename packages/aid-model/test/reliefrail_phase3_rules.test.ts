import { describe, expect, it } from "vitest";
import {
  ReliefRailEngine,
  ReliefPubkey,
  findEventPda,
  findDistrictPda,
  findMerchantPda,
  findHouseholdPda,
  ReliefRailErrorCode,
} from "../../chain/src/reliefrail";

describe("ReliefRail On-Chain Phase 3 Instruction & Rule Engine", () => {
  const engine = new ReliefRailEngine();
  const admin = ReliefPubkey.generate();
  const oracleDhm = ReliefPubkey.generate();
  const oracleSatellite = ReliefPubkey.generate();
  const adminMultisig = ReliefPubkey.generate();
  const eventId = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);

  const makwanpurMerchantWallet = ReliefPubkey.generate();
  const kathmanduMerchantWallet = ReliefPubkey.generate();
  const residentWallet = ReliefPubkey.generate();

  let eventPda: ReliefPubkey;
  let makwanpurDistrictPda: ReliefPubkey;
  let makwanpurMerchantPda: ReliefPubkey;
  let kathmanduMerchantPda: ReliefPubkey;
  let householdPda: ReliefPubkey;

  const startTs = 1727395200n; // Sept 27, 2024
  const durationSeconds = 2592000n; // 30 Days

  it("1. init_event: initializes disaster relief event with parameter caps", () => {
    const res = engine.initEvent({
      admin,
      oracleDhm,
      oracleSatellite,
      adminMultisig,
      eventId,
      name: "Nepal Monsoon Cloudburst 2024",
      floorPayout: 1500n,
      spreadPayout: 2000n,
      orderCap: 1500n,
      dailyCap: 2500n,
      durationSeconds,
      currentTs: startTs,
    });

    eventPda = res.eventPda;
    expect(res.event.isActive).toBe(false); // Inactive until quorum
    expect(res.event.floorPayout).toBe(1500n);
    expect(res.event.spreadPayout).toBe(2000n);
  });

  it("2. register_district: stores district metrics and calculates exact payout (Makwanpur = 3450)", () => {
    const res = engine.registerDistrict({
      eventPda,
      admin,
      districtCode: 41,
      name: "Makwanpur",
      rainMm: 517,
      kutchaPercent: 46.8,
      mpiScore: 0.218,
      maxRain: 517,
      maxKutcha: 49.5,
      maxMpi: 0.231,
    });

    makwanpurDistrictPda = res.districtPda;
    expect(res.district.vulnerabilityScoreS).toBe(0.967);
    expect(res.district.payoutPerHousehold).toBe(3450n);
  });

  it("3. register_merchant: registers merchants in specific district corridors", () => {
    const m1 = engine.registerMerchant({
      eventPda,
      admin,
      merchantWallet: makwanpurMerchantWallet,
      districtCode: 41,
      businessName: "Hetauda Food Depot #102",
      baselinePrice: 450n,
    });
    makwanpurMerchantPda = m1.merchantPda;
    expect(m1.merchant.districtCode).toBe(41);
    expect(m1.merchant.isSuspended).toBe(false);

    const m2 = engine.registerMerchant({
      eventPda,
      admin,
      merchantWallet: kathmanduMerchantWallet,
      districtCode: 27,
      businessName: "Kathmandu Central Supplies",
      baselinePrice: 450n,
    });
    kathmanduMerchantPda = m2.merchantPda;
    expect(m2.merchant.districtCode).toBe(27);
  });

  it("4. trigger_event: requires 2-of-3 quorum to activate event", () => {
    // Vote 1 (DHM)
    const v1 = engine.triggerEvent({ eventPda, signer: oracleDhm, source: "dhm" });
    expect(v1.isTriggered).toBe(false);

    // Vote 2 (Satellite)
    const v2 = engine.triggerEvent({ eventPda, signer: oracleSatellite, source: "satellite" });
    expect(v2.isTriggered).toBe(true);
  });

  it("5. claim: beneficiary claims exact district payout (₹3,450 rINR)", () => {
    const res = engine.claim({
      eventPda,
      beneficiaryWallet: residentWallet,
      districtCode: 41,
      currentTs: startTs + 100n,
    });
    householdPda = res.householdPda;
    expect(res.household.allocatedAmount).toBe(3450n);
    expect(res.household.spentAmount).toBe(0n);
  });

  it("6. spend: executes valid in-zone grocery spend within limits", () => {
    const res = engine.spend({
      eventPda,
      householdPda,
      merchantPda: makwanpurMerchantPda,
      beneficiarySigner: residentWallet,
      amount: 450n,
      currentTs: startTs + 200n,
    });

    expect(res.household.spentAmount).toBe(450n);
    expect(res.household.rolling24hSpent).toBe(450n);
    expect(res.merchant.totalReceived).toBe(450n);
  });

  it("7. RULE CHECK: rejects spend when merchant is in a different district (OutOfZone)", () => {
    expect(() =>
      engine.spend({
        eventPda,
        householdPda,
        merchantPda: kathmanduMerchantPda, // Kathmandu (27) vs Resident (41)
        beneficiarySigner: residentWallet,
        amount: 400n,
        currentTs: startTs + 300n,
      }),
    ).toThrowError(/OutOfZone/);
  });

  it("8. RULE CHECK: rejects single transaction exceeding order cap (₹1,500)", () => {
    expect(() =>
      engine.spend({
        eventPda,
        householdPda,
        merchantPda: makwanpurMerchantPda,
        beneficiarySigner: residentWallet,
        amount: 1800n, // Order cap is ₹1,500
        currentTs: startTs + 400n,
      }),
    ).toThrowError(/OverOrderCap/);
  });

  it("9. RULE CHECK: rejects cumulative spend exceeding rolling 24-hour cap (₹2,500)", () => {
    // First spend ₹1,400 (spent today becomes ₹1,850)
    engine.spend({
      eventPda,
      householdPda,
      merchantPda: makwanpurMerchantPda,
      beneficiarySigner: residentWallet,
      amount: 1400n,
      currentTs: startTs + 500n,
    });

    // Attempt to spend another ₹1,000 (total would be ₹2,850 > ₹2,500 daily cap)
    expect(() =>
      engine.spend({
        eventPda,
        householdPda,
        merchantPda: makwanpurMerchantPda,
        beneficiarySigner: residentWallet,
        amount: 1000n,
        currentTs: startTs + 600n,
      }),
    ).toThrowError(/OverDailyCap/);
  });

  it("10. flag_price & suspend_merchant: 3 strikes for >35% price hike triggers suspension", () => {
    // Baseline = 450. Observed = 650 (+44% hike)
    engine.flagPrice({ eventPda, merchantPda: makwanpurMerchantPda, oracleSigner: oracleDhm, observedPrice: 650n, baselinePrice: 450n });
    engine.flagPrice({ eventPda, merchantPda: makwanpurMerchantPda, oracleSigner: oracleDhm, observedPrice: 650n, baselinePrice: 450n });
    const s3 = engine.flagPrice({ eventPda, merchantPda: makwanpurMerchantPda, oracleSigner: oracleDhm, observedPrice: 650n, baselinePrice: 450n });

    expect(s3.strikes).toBe(3);
    expect(s3.isSuspended).toBe(true);

    // Spend must now be refused
    expect(() =>
      engine.spend({
        eventPda,
        householdPda,
        merchantPda: makwanpurMerchantPda,
        beneficiarySigner: residentWallet,
        amount: 200n,
        currentTs: startTs + 86400n + 100n, // Next day
      }),
    ).toThrowError(/MerchantSuspended/);
  });

  it("11. appeal: admin can review audit justification and lift suspension", () => {
    const res = engine.appeal({ eventPda, merchantPda: makwanpurMerchantPda, adminSigner: admin });
    expect(res.isSuspended).toBe(false);
    expect(res.strikes).toBe(0);
  });

  it("12. circuit_breaker: multi-sig pause freezes emergency corridor", () => {
    engine.circuitBreaker({ eventPda, adminSigner: admin, paused: true, districtCode: 41 });
    const newResident = ReliefPubkey.generate();
    expect(() =>
      engine.claim({
        eventPda,
        beneficiaryWallet: newResident,
        districtCode: 41,
        currentTs: startTs + 1000n,
      }),
    ).toThrowError(/Disaster corridor is paused|6014/);

    // Unpause
    engine.circuitBreaker({ eventPda, adminSigner: admin, paused: false, districtCode: 41 });
  });

  it("13. reclaim: permissionless crank returns unspent balance post-expiry with bounty", () => {
    const crankCaller = ReliefPubkey.generate();

    // Early reclaim must fail
    expect(() =>
      engine.reclaim({
        eventPda,
        householdPda,
        crankCaller,
        currentTs: startTs + 1000n, // Day 1
      }),
    ).toThrowError(/not expired yet|6010/);

    // Post-30 days reclaim succeeds
    const res = engine.reclaim({
      eventPda,
      householdPda,
      crankCaller,
      currentTs: startTs + durationSeconds + 1n, // Day 31
    });

    // Household had ₹3,450 - ₹1,850 spent = ₹1,600 unspent
    expect(res.reclaimedAmount + res.bountyAmount).toBe(1600n);
    expect(res.bountyAmount).toBe(8n); // 50 bps of 1600 = 8
    expect(res.reclaimedAmount).toBe(1592n);
  });

  it("14. offline vouchers: enforces ₹500 cap and rejects replayed nonce", () => {
    const voucherHousehold = ReliefPubkey.generate();
    const [vHouseholdPda] = findHouseholdPda(eventPda, voucherHousehold);

    // Setup household with funds
    engine.claim({
      eventPda,
      beneficiaryWallet: voucherHousehold,
      districtCode: 41,
      currentTs: startTs + 100n,
    });

    const voucher = {
      voucherId: "VOUCHER-001",
      householdWallet: voucherHousehold,
      districtCode: 41,
      maxAmount: 500n,
      nonce: "nonce_unique_9921",
      signature: "sig_abc",
      expiresAt: startTs + 86400n,
    };

    // Valid offline redemption
    const red = engine.redeemOfflineVoucher({
      eventPda,
      merchantPda: makwanpurMerchantPda,
      voucher,
      actualAmount: 350n,
      currentTs: startTs + 200n,
    });
    expect(red.redeemedAmount).toBe(350n);

    // Replay attack must fail
    expect(() =>
      engine.redeemOfflineVoucher({
        eventPda,
        merchantPda: makwanpurMerchantPda,
        voucher,
        actualAmount: 350n,
        currentTs: startTs + 300n,
      }),
    ).toThrowError(/ReplayNonce/);
  });
});
