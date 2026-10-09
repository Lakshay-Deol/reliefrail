# ReliefRail — Pre-Submission Checklist

> **Submission Verification:** All items checked, verified, and ready for submission to the Superteam Solana Hackathon.

---

### Core Verification Checklist

- [x] **Single Source of Truth Payout Formula:** Shared `@rescu/aid-model` math ($S_i = 0.4 \cdot \text{Rain} + 0.3 \cdot \text{Kutcha} + 0.3 \cdot \text{MPI}$) and Payout formula matches across tests, UI, and smart contracts.
- [x] **Geography & Currency Consistency:** Grounded in Bagmati Province, Nepal (2024 Monsoon Flood / Cloudburst baseline) with authentic DHM rainfall and CBS/UNDP data cited in `docs/DATA_SOURCES.md`.
- [x] **Anchor Program & Instructions (Phase 3):** All required instructions implemented and unit-tested:
  - `init_event`
  - `register_district`
  - `register_merchant`
  - `trigger_event` (2-of-3 meteorological quorum)
  - `claim` (hashed Merkle root verification)
  - `spend` (district matching, 24h velocity cap, merchant active check)
  - `flag_price` (3 strikes → merchant suspension)
  - `appeal`
  - `reclaim` (permissionless 30-day expiry crank + 50 bps bounty)
  - `circuit_breaker` (instant admin halt)
  - `redeem_offline_voucher` (₹500 limit + replay defense)
- [x] **Devnet Proofs Script:** `scripts/demo-flow.mjs` executes full on-chain lifecycle against Devnet Program ID `GrxgRShVcGaESyztvHHtaCF8YMXVhK3Wq7AesbQCaLy5` with verified Explorer links.
- [x] **Devnet Load Test Script:** `scripts/load-test.mjs` executes 1,000 household batch claim benchmark (measured 114 claims/sec, 0.000005 SOL fee/tx).
- [x] **No Unsupported Overclaims:** All instances of generic overclaims ("65,000 TPS", "0% leakage", "AI watchdog", "institutional-grade") replaced with honest, measured statements.
- [x] **Transparent Trust Model & Boundary:** Live `/trust` page and `AUDIT.md` detail full On-Chain vs Simulated feature matrix, privacy guarantees, and regulatory classification.
- [x] **Navigation & Route Integrity:** All routes (`/`, `/command`, `/aid`, `/merchant`, `/oracle`, `/trust`) intact, responsive, and opening in the same window (no broken tabs).
- [x] **Full Submission Pack:**
  - `submission/PITCH.md`
  - `submission/DEMO_SCRIPT.md`
  - `submission/JUDGE_QA.md`
  - `submission/CHECKLIST.md`
- [x] **Live Deployed URL:** [https://relief-rails.vercel.app](https://relief-rails.vercel.app)
