# ReliefRail — Judge Q&A & Technical Defense

> **Preparation for Judges:** Clear, technically sound, and honest answers to anticipated hackathon questions.

---

### Q1: Why use Solana instead of a centralized PostgreSQL database?
**Answer:**
A database maintained by an agency requires full trust in that agency's internal administrators and database security. When international donors, state governments, local merchants, and vulnerable citizens interact, a centralized ledger introduces significant agency risk:
1. **Immutable Fund Recovery:** In a database, expired or unspent funds often get diverted into non-emergency administrative budgets. ReliefRail guarantees on-chain that unspent funds unconditionally revert to the emergency treasury reserve after 30 days.
2. **Deterministic Geofence & Velocity Enforcement:** Rules (e.g. ₹2,500/24h cap, merchant registry checks, price watchdog suspensions) cannot be bypassed by corrupted local operators.
3. **Auditability Without Bureaucracy:** Donors and auditors can inspect treasury liquidity and transaction rates in real time without filing formal information requests.
4. **Solana's Performance:** With ~400ms slot times and `< $0.0008` transaction fees, Solana operates at the speed and cost profile of traditional payment networks while preserving cryptographic decentralization.

---

### Q2: Who is trusted in your system? Doesn't the oracle introduce centralized trust?
**Answer:**
We are completely transparent about our trust model (see our live `/trust` page):
- **Rainfall Data:** We do not trust a single weather station. Triggering requires a **2-of-3 quorum** across ground telemetry (e.g., DHM), satellite precipitation models (NASA/JAXA GPM), and administrative disaster multisig.
- **Beneficiary List:** Maintained off-chain by civil authorities for privacy, but published on-chain as a cryptographic **Merkle Root**, allowing anyone to audit the total household count and allocated budget.
- **Price Baseline:** Price baskets are stored in public, versioned on-chain PDAs.
- **The Core Program:** Requires **zero trust**—the smart contract code deterministically executes claims, payments, freezes, and expirations.

---

### Q3: How do you handle basis risk (rainfall doesn't always equal localized household damage)?
**Answer:**
Rainfall and cloudburst metrics are an objective trigger for **immediate Phase-1 emergency liquidity** (first 48 hours for food, clean water, temporary shelter).
To address basis risk:
1. Payouts are scaled using our Multi-Hazard Need Index ($S_i = 0.4 \cdot \text{Rain} + 0.3 \cdot \text{Kutcha Housing} + 0.3 \cdot \text{Multidimensional Poverty}$).
2. Phase-2 provides supplemental top-ups based on verified satellite synthetic aperture radar (SAR) flood extent mapping and local ground damage verification.

---

### Q4: How do you protect citizen privacy on a public blockchain?
**Answer:**
Zero Personally Identifiable Information (PII) is stored on Solana:
- Citizen names, national ID numbers, and physical coordinates stay entirely off-chain in sovereign government databases.
- The Solana program only verifies 32-byte cryptographic hashes (`H(CitizenID || Salt)`).
- On-chain household PDAs are pseudonymous accounts holding balances and velocity meters without identifying personal data.

---

### Q5: How is `rINR / rNPR` treated from a regulatory perspective?
**Answer:**
`rINR / rNPR` is structured not as an open speculative token or cryptocurrency, but as a **Purpose-Bound Closed-Loop Disaster Relief Voucher** (aligned with frameworks like India's e-RUPI or prepaid relief instruments):
- It cannot be transferred peer-to-peer between citizens.
- It can only be redeemed at licensed essential commodity vendors within the designated disaster zone.
- It has a hard-coded 30-day lifespan, after which unspent balances automatically return to the issuer treasury.

---

### Q6: What happens if cellular networks and power grids are knocked out?
**Answer:**
ReliefRail implements **Cryptographic Offline Vouchers**:
- Pre-signed nonces with a hard cap (₹500 rINR) issued to beneficiaries via offline QR passes or NFC cards at relief camps.
- Registered merchants accept offline vouchers locally up to a capped risk ceiling.
- Transactions are queued and batch-settled on Solana once satellite or mesh connectivity reconnects.
