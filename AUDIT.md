# ReliefRail System Audit Report (Phase 0)

## Executive Summary
This audit outlines what is implemented directly on-chain via Solana Anchor smart contracts versus off-chain deterministic simulation and oracle telemetry. It identifies components, assumptions, hardcoded values, and ensures full transparency for judges and contributors.

---

## Feature Implementation Status Table

| Feature / Subsystem | Implementation Type | On-Chain PDA / Instruction | Notes / Verification Status |
| :--- | :--- | :--- | :--- |
| **Parametric Disaster Event Creation** | **On-Chain & Verified** | `init_event` / `initialize_pool` (`PoolAccount` / `EventAccount`) | Stores rainfall threshold, budget caps, start/expiry timestamp, and authority keys. |
| **District Registration & Payout Rate** | **On-Chain & Verified** | `register_district` (`DistrictAccount`) | Stores district code, baseline rainfall, vulnerability indices, and dynamic payout rate. |
| **Merchant Registration & District Tagging** | **On-Chain & Verified** | `register_merchant` (`MerchantAccount`) | Deterministic PDA `["merchant", pool, merchant_wallet]`. District-locked. Status: Active / Suspended. |
| **Beneficiary Allowance & Claim** | **On-Chain & Verified** | `claim` / `release_aid` (`HouseholdAccount`) | Deterministic PDA `["household", pool, beneficiary_wallet]`. Enforces budget ceiling. |
| **Disaster Zone Confinement** | **On-Chain Enforced** | `spend` | Enforces `household.district_code == merchant.district_code`. Reject transaction if out of zone. |
| **Per-Order & 24h Velocity Limits** | **On-Chain Enforced** | `spend` | Tracks `spent_today` and `window_start` in `HouseholdAccount`. Rejects checkouts exceeding limits. |
| **Anti-Gouging Strike Counter & Freeze** | **On-Chain & Verified** | `flag_price` / `suspend_merchant` | Oracle submits price observation vs basket. 3 strikes trigger automatic on-chain suspension. |
| **Merchant Suspension Appeal** | **On-Chain & Verified** | `appeal` / `reinstate_merchant` | Authorized admin can review audit justification and lift suspension. |
| **Permissionless Expiry Reclamation** | **On-Chain & Verified** | `reclaim` | Permissionless crank: after `clock.unix_timestamp >= expiry_ts`, sweeps unspent balance to Treasury. |
| **Emergency Circuit Breaker** | **On-Chain & Verified** | `circuit_breaker` | Admin multisig can pause/unpause single districts or entire relief event. |
| **Single Source Payout Model** | **Pure TypeScript & Anchor Math** | `lib/payout.ts` | Multi-hazard vulnerability formula $S_i = 0.4 \frac{\text{Rain}}{\text{MaxRain}} + 0.3 \frac{\text{Kutcha}}{\text{MaxKutcha}} + 0.3 \frac{\text{MPI}}{\text{MaxMPI}}$. |
| **Rainfall Weather Feed** | **Off-Chain Oracle Telemetry** | Python / Node Oracle Relay | Real DHM (Department of Hydrology & Meteorology) station observations. Simulated 2-of-3 quorum. |
| **Resident NFC / Offline Nonce Vouchers** | **Cryptographic Spec / Simulation** | `generateOfflineVoucher` (UI) | Pre-signed nonce with capped limit (default ₹500), merchant exposure caps, playback sync. |
| **UPI / Fiat Settlement Off-Ramp** | **Off-Chain Banking Integration** | Nodal Partner Webhook Spec | 12-hour batch settlement from `rINR` token burns to merchant bank accounts. |

---

## Summary of Codebase Improvements in This Spec
1. **Renaming & Monorepo Cohesion:** Aligned all packages, Anchor configuration, and UI references to `@reliefrail/program`.
2. **Deterministic Payout Module:** Created `packages/aid-model/src/payout.ts` and `apps/web/src/lib/payout.ts` as the single mathematical source of truth.
3. **True On-Chain Behavior:** Implemented exact instructions for multi-strike anti-gouging, permissionless crank reclamation, and quorum triggers.
4. **Verifiable Devnet Proofs:** Created `scripts/demo-flow.ts` and `scripts/load-test.ts` to output real Solana Devnet signatures and benchmark metrics.
5. **No Unsupported Claims:** Eliminated unverified marketing overclaims; clearly labeled simulated elements with UI badges and documentation citations.
