# ReliefRail Trust Model, Privacy & Regulatory Compliance

---

## 1. The Trust Model

A common critique of blockchain applications in humanitarian aid is: *"Why blockchain when the data comes from off-chain?"*

ReliefRail's core thesis is:
> **Solana doesn't remove trust in the data; it removes trust in how the money is held, restricted, and returned.**

### Trust Distribution Matrix

| Component | Trusted Party | Threat / Risk | Mitigation & Smart Contract Constraint |
| :--- | :--- | :--- | :--- |
| **Precipitation Data** | Met Department (DHM / IMD) / Satellite Providers | Faulty sensor, station outage, or delayed report | **2-of-3 Oracle Quorum:** Ground gauges + Satellite IMERG precipitation + Admin multisig confirmation. |
| **Beneficiary Eligibility List** | State Disaster Management Authority / Red Cross | Nepotism, phantom entries, duplicate names | **Public Merkle Root:** Authority commits Merkle root on-chain. Independent donors audit total count and distribution without exposing PII. |
| **Commodity Price Baseline** | Civil Supplies / Commerce Authority | Outdated baseline pricing | **On-Chain Price Basket PDAs:** Baseline prices are versioned and timestamped transparently on-chain. |
| **Fiat Off-Ramping** | Nodal Settlement Partner / Commercial Bank | Settlement delay or insolvency | **SLA & 12-Hour Batch UPI/ACH Settlement:** `rINR` token burns trigger audited batch credit. |
| **Rule & Fund Enforcement** | **None (The Solana Program)** | Fund embezzlement, unauthorized withdrawals, out-of-zone cash out, late recovery | **Immutable Anchor Program:** Geofences, velocity limits, and 30-day auto sweeps are mathematically enforced by bytecode. |

---

## 2. Basis Risk Mitigation
*Basis risk* occurs when rainfall triggers do not perfectly correlate with localized flood damage (e.g., localized terrain drainage differences).

### Two-Phase Relief Strategy
1. **Phase 1 (Instant Parametric Liquidity):** Triggered within minutes of rainfall threshold breach ($S_i \ge \text{Threshold}$) to provide immediate survival rations for the first 72 hours.
2. **Phase 2 (Verified Damage Top-Up - Roadmap):** Post-72 hour satellite synthetic aperture radar (SAR) flood extent mapping and local drone survey verification for supplemental structural rehabilitation payouts.

---

## 3. Privacy Architecture (Zero PII on Ledger)
- **Hashed Household Identifiers:** Beneficiary names, national IDs, and exact residential addresses are **never stored on Solana**.
- **Cryptographic Merkle Proofs:** The state authority holds the off-chain mapping of citizen IDs to private keys/hashes. On-chain, only a deterministic 32-byte leaf hash (`SHA256(HouseholdID || Secret)`) is verified against the event Merkle Root.
- **Auditable Amounts, Protected Identities:** Donors can audit total disbursements per district without compromising victim privacy.

---

## 4. Regulatory Framing: Closed-Loop Vouchers
- **Non-Currency Classification:** `rINR` is not a cryptocurrency, security, or general-purpose medium of exchange. It is a **closed-loop disaster relief voucher**.
- **Restricted Transferability:** Tokens cannot be transferred from resident to resident (preventing black-market discounting). They can only be redeemed at registered merchant PDAs inside the designated district corridor.
- **Full Redemption Lifecycle:** Merchants cannot circulate `rINR`; transactions terminate at the point of sale, triggering 1:1 fiat reimbursement into the merchant's verified bank account via nodal settlement partners.

---

## 5. Prior Art & Comparative Advantage

| Platform / Initiative | Approach | Key Difference vs ReliefRail |
| :--- | :--- | :--- |
| **GiveDirectly** | Unconditional mobile cash transfers | Lacks on-chain anti-gouging protection, district geofencing, and automated unspent fund recovery. |
| **Start Network (Start Ready)** | Parametric disaster risk pooling | Disburses to large NGOs/intermediaries rather than direct programmatic micro-liquidity to affected families. |
| **Grassroots Economics (Sarafu)** | Community inclusion currencies | Community credit pools, but without automated meteorological parametric triggers and treasury sweeps. |
| **RBI / Nepal Central Bank CBDC Pilots** | Central bank digital currency rails | General-purpose cash without disaster-specific smart velocity caps and multi-strike merchant price controls. |
