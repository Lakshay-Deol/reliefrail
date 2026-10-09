# Changelog

All notable changes to the ReliefRail codebase will be documented in this file.

## [0.2.0] - 2026-10-09 - Superteam Solana Improvement Spec Release
### Added
- **Single Source Payout Model:** Added `packages/aid-model/src/payout.ts` and `apps/web/src/lib/payout.ts` implementing the exact formula $S_i = 0.4 \cdot \frac{\text{Rain}_i}{\text{MaxRain}} + 0.3 \cdot \frac{\text{Kutcha}_i}{\text{MaxKutcha}} + 0.3 \cdot \frac{\text{MPI}_i}{\text{MaxMPI}}$ with floor and spread parameterization and unit test coverage.
- **On-Chain Instruction Extensions:**
  - `init_event` & `register_district` for granular multi-district disaster event scoping.
  - `flag_price` & 3-strike rule-based merchant suspension with `appeal` reinstatement.
  - `reclaim` permissionless crank for post-expiry treasury sweeps.
  - `circuit_breaker` for rapid multi-sig pausing of disaster corridors.
- **Trust & Verification Infrastructure:**
  - Added dedicated `/trust` page explaining trust assumptions, privacy, regulation, and prior art.
  - Global "Simulated vs On-Chain" badge system across UI surfaces.
  - Added `scripts/demo-flow.ts` and `scripts/load-test.ts` for automated Devnet lifecycle execution.
- **Documentation:**
  - Added `AUDIT.md`, `docs/DATA_SOURCES.md`, `docs/TRUST_MODEL.md`, and `docs/PRIVACY_REGULATION.md`.
  - Added full submission pack in `/submission` (`PITCH.md`, `DEMO_SCRIPT.md`, `JUDGE_QA.md`, `CHECKLIST.md`).

### Changed
- **Honest Claims & Terminology:** Replaced unverified TPS figures and absolute claims with measured Devnet latency benchmarks, zone-locked token descriptions, and rule-based watchdog labels.
- **Interactive UI Upgrades:** Added live formula inspection and dynamic Floor/Spread sliders to Command Center, price markup indicators to Merchant POS, and strikes status to Oracle Console.

## [0.1.0] - Initial Prototype
- Initial Solana Anchor smart contract prototype for disaster pool allocations and merchant clearing.
- Web interface with interactive 3D Globe, mobile resident simulator, and point of sale terminal.
