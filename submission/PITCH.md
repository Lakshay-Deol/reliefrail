# ReliefRail — Superteam Solana Submission Pitch

> **One-liner:** ReliefRail turns a rainfall breach into restricted, expiring, auditable relief money in seconds, so aid reaches the right district, at fair prices, and unspent funds return to the next disaster.

---

## 1. The Problem
When cloudbursts and flash floods strike (such as the Bagmati & Koshi River floods in September 2024), disaster relief fails on three fundamental economic fronts:
1. **Disbursal Latency (Weeks to Months):** Physical assessments, banking red-tape, and manual approvals delay emergency cash until after families have already depleted emergency reserves or taken predatory high-interest loans.
2. **Leakage & Price Gouging:** Unrestricted cash transfers leak into non-essential spending or are drained by unscrupulous vendors raising food/water prices by 50–100% during supply disruptions.
3. **Trapped Capital:** Unclaimed or unspent emergency relief remains trapped in fragmented local accounts or bureaucratic limbo rather than returning to fund subsequent disasters.

---

## 2. The Solution
**ReliefRail** is a purpose-bound parametric disaster liquidity engine deployed on Solana Devnet.
- **Parametric Trigger:** 2-of-3 oracle quorum (DHM rainfall stations + NASA/JAXA satellite telemetry) unlocks emergency liquidity in sub-second time.
- **Mathematical Equity:** District allocation derived from an auditable multi-hazard index ($S_i = 0.4 \cdot \text{Rain} + 0.3 \cdot \text{Kutcha} + 0.3 \cdot \text{MPI}$).
- **Restricted Closed-Loop Spending:** Tokens (`rINR / rNPR`) clear strictly at verified essential commodity merchants registered within the disaster district.
- **Automated Price Watchdog:** Rule-based commodity basket monitoring flags markups exceeding +35% and suspends gouging merchants on-chain after 3 strikes.
- **Permissionless 30-Day Reclamation:** After 30 days, anyone can crank unspent household balances back into the state treasury reserve for a 50 bps bounty.

---

## 3. Why Solana?
1. **Sub-Second Finality (~400ms):** Allows instant point-of-sale checkout at rural grocery depots without bottlenecking queues.
2. **Sub-Cent Transaction Fees (< $0.0008):** Enables high-frequency micropayments (₹50–₹500 rations) without eating into the relief grant.
3. **Stateful Program-Derived Accounts (PDAs):** Encapsulates velocity caps (₹2,500/24h), order ceilings (₹1,500), and merchant registries directly into the consensus layer without centralized state databases.
4. **Permanent Program-Controlled Security:** The Solana program guarantees that unspent funds revert to the treasury without reliance on financial intermediaries.

---

## 4. The Live Demo Flow
- **Live Production URL:** [https://relief-rails.vercel.app](https://relief-rails.vercel.app)
- **Solana Devnet Program ID:** `GrxgRShVcGaESyztvHHtaCF8YMXVhK3Wq7AesbQCaLy5`
- **End-to-End On-Chain Flow:**
  1. `init_event` & `register_district` (`Makwanpur`, DHM peak 517mm → ₹3,450 rINR).
  2. `trigger_event` verified by 2-of-3 meteorological quorum.
  3. `claim` via hashed Merkle root (zero PII on-chain).
  4. `spend` at registered merchant for ration basket (₹450 rINR).
  5. `spend` rejected on-chain when exceeding rolling 24h cap.
  6. `flag_price` x3 → `suspend_merchant` upon +50% price spike.
  7. `reclaim` crank sweeps unspent ₹2,985 rINR back to Treasury with a 50 bps caller bounty.

---

## 5. Trust Model & Privacy
- **Zero PII On-Chain:** Citizen names and ID numbers remain off-chain; Solana holds only hashed 32-byte Merkle leaves.
- **Data Verifiability:** Met department data verified via multi-source quorum; price baskets versioned in public PDAs.
- **Regulatory Nature:** Classified as a sovereign, non-transferable, closed-loop disaster relief voucher.

---

## 6. Roadmap
- **Now (Devnet):** Complete smart contract architecture, verifiable Devnet lifecycle proofs, interactive Command Center, Beneficiary PWA, and Merchant POS.
- **Q1 2025:** District-level pilot partnership with state disaster management authority / humanitarian NGO on a closed-loop budget.
- **Q2 2025:** Integration with offline mesh NFC cards and regulated fiat off-ramp settlement rails.

---

## 7. The Ask
We are seeking pilot deployment opportunities with disaster management agencies, humanitarian NGOs, and grants to complete formal smart contract audits before mainnet rollout.
