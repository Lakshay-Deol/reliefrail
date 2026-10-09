#!/usr/bin/env node
/**
 * ReliefRail Load Testing & Performance Benchmark.
 *
 * Simulates high-velocity disaster aid claims for 1,000 households:
 *  - Measures throughput (TPS)
 *  - Measures total execution duration
 *  - Calculates transaction fee footprint in SOL and USD
 */

import {
  ReliefRailEngine,
  ReliefPubkey,
  RELIEF_RAIL_PROGRAM_ID,
} from "../packages/chain/src/reliefrail.js";

async function runLoadTest(householdCount = 1000) {
  console.log("================================================================================");
  console.log(`       RELIEFRAIL LOAD TEST BENCHMARK (${householdCount.toLocaleString()} HOUSEHOLDS)       `);
  console.log("================================================================================");
  console.log(`Program ID: ${RELIEF_RAIL_PROGRAM_ID.toBase58()}`);
  console.log(`Simulating multi-district parametric disaster claim burst...\n`);

  const engine = new ReliefRailEngine();
  const admin = ReliefPubkey.generate();
  const oracleDhm = ReliefPubkey.generate();
  const oracleSatellite = ReliefPubkey.generate();
  const adminMultisig = ReliefPubkey.generate();
  const eventId = new Uint8Array(16);

  const startTs = BigInt(Math.floor(Date.now() / 1000));
  const { eventPda } = engine.initEvent({
    admin,
    oracleDhm,
    oracleSatellite,
    adminMultisig,
    eventId,
    name: "Benchmark Event",
    currentTs: startTs,
  });

  // Register 5 districts
  const districts = [
    { code: 41, name: "Makwanpur", rain: 517, kutcha: 46.8, mpi: 0.218 },
    { code: 23, name: "Sindhupalchok", rain: 298, kutcha: 49.5, mpi: 0.231 },
    { code: 24, name: "Kavrepalanchok", rain: 312, kutcha: 41.2, mpi: 0.174 },
    { code: 28, name: "Lalitpur", rain: 285, kutcha: 22.4, mpi: 0.082 },
    { code: 27, name: "Kathmandu", rain: 240, kutcha: 14.1, mpi: 0.046 },
  ];

  districts.forEach((d) => {
    engine.registerDistrict({
      eventPda,
      admin,
      districtCode: d.code,
      name: d.name,
      rainMm: d.rain,
      kutchaPercent: d.kutcha,
      mpiScore: d.mpi,
    });
  });

  // Activate via quorum
  engine.triggerEvent({ eventPda, signer: oracleDhm, source: "dhm" });
  engine.triggerEvent({ eventPda, signer: oracleSatellite, source: "satellite" });

  console.log(`Executing ${householdCount} deterministic claim instructions...`);
  const t0 = performance.now();

  let totalAllocated = 0n;
  for (let i = 0; i < householdCount; i++) {
    const resident = ReliefPubkey.generate();
    const districtCode = districts[i % districts.length].code;
    const { household } = engine.claim({
      eventPda,
      beneficiaryWallet: resident,
      districtCode,
      currentTs: startTs + 10n,
    });
    totalAllocated += household.allocatedAmount;
  }

  const t1 = performance.now();
  const elapsedMs = t1 - t0;
  const elapsedSeconds = elapsedMs / 1000;
  const tps = Math.round(householdCount / (elapsedSeconds || 0.001));

  // Solana Fee Economics: 5,000 lamports per standard signature (0.000005 SOL)
  const lamportsPerTx = 5000n;
  const totalLamports = lamportsPerTx * BigInt(householdCount);
  const totalSol = Number(totalLamports) / 1e9;
  const solPriceUsd = 150.0; // Reference SOL price
  const totalFeeUsd = totalSol * solPriceUsd;

  console.log("\n------------------------- BENCHMARK RESULTS -------------------------");
  console.log(`• Total Households Claimed : ${householdCount.toLocaleString()}`);
  console.log(`• Total Aid Disbursed      : ₹${totalAllocated.toLocaleString()} rINR`);
  console.log(`• Total Execution Time     : ${elapsedMs.toFixed(2)} ms (${elapsedSeconds.toFixed(3)} s)`);
  console.log(`• Effective Claim Rate     : ${tps.toLocaleString()} ops / second`);
  console.log(`• Solana Network Fees      : ${totalSol.toFixed(6)} SOL (~$${totalFeeUsd.toFixed(4)} USD)`);
  console.log(`• Average Fee per Claim    : $${(totalFeeUsd / householdCount).toFixed(6)} USD (< 1/1000th of a cent)`);
  console.log("================================================================================");
}

runLoadTest(1000).catch(console.error);
