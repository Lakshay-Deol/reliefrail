# ReliefRail — Video Demo Script (2–3 Minutes)

> **Submission Video Guide:** Follow this script shot-for-shot for the hackathon video submission. Includes timing, voiceover, UI actions, and Explorer transaction links.

---

### [0:00 – 0:30] Introduction & The Core Problem
- **Visual:** Screen opens on the 3D globe on `https://relief-rails.vercel.app` highlighting Nepal's Bagmati Province and recent rainfall telemetry.
- **Voiceover:**
  > "When catastrophic monsoon floods and cloudbursts strike, traditional disaster relief takes weeks to arrive. Worse, unrestricted cash leaks into non-essentials or is devoured by local price gouging.
  > ReliefRail turns a rainfall breach into restricted, expiring, auditable relief money in seconds—so aid reaches the right district, at fair prices, and unspent funds return to the next disaster."

---

### [0:30 – 1:00] Step 1: Meteorological Quorum & Parametric Trigger
- **Visual:** Navigate to `/command` (Command Center). Click on the live district card for **Makwanpur** (517mm rain peak). Show formula panel ($S_i = 0.4 \cdot \text{Rain} + 0.3 \cdot \text{Kutcha} + 0.3 \cdot \text{MPI}$) computing ₹3,450 rINR payout.
- **On-Screen Action:** Trigger event. The 2-of-3 oracle quorum confirms (DHM ground telemetry + NASA/JAXA GPM satellite feed).
- **Show Explorer Link:**
  - `init_event` & `trigger_event` Tx: [Solana Explorer Devnet](https://explorer.solana.com/tx/LQ8RQptEH4XxpuMhFwW3wRPgRcQKKtFPyJDXx66WJw6Enpq8TmNk7MAnJiTYAqBvZ97HWPBDvZYFhKdrAgTsKT7?cluster=devnet)
- **Voiceover:**
  > "Our Anchor smart contract ingests verified rainfall data. When precipitation breaches the 200mm threshold, a 2-of-3 meteorological quorum activates the disaster pool on Solana Devnet. Our mathematical formula assigns ₹3,450 rINR per household based on empirical flood severity and housing fragility."

---

### [1:00 – 1:35] Step 2: Beneficiary Claim & Geofenced Spending
- **Visual:** Switch to `/aid` (Beneficiary App). Show Ramesh Shrestha's wallet displaying ₹3,450 rINR balance, rolling 24-hour velocity cap meter (₹2,500 limit), and 30-day expiry countdown.
- **On-Screen Action:** Simulate grocery checkout of ₹450 rINR at a registered Makwanpur merchant depot.
- **Show Explorer Link:**
  - `spend` Tx: [Solana Explorer Devnet](https://explorer.solana.com/tx/Lhh3LsobM4Arogb2nXijFnsSbDtEBTibJeV8mWPUtu3ERKAgXqFNKqWrEtgDfsfUjekYrtSANUDZW6mko7Srntj?cluster=devnet)
- **Voiceover:**
  > "Residents claim instantly using zero-PII Merkle proofs. The aid is strictly geofenced to authorized food and medical merchants within Makwanpur. In a single tap, ₹450 rINR settles on Solana in under 400 milliseconds."

---

### [1:35 – 2:05] Step 3: Velocity Cap & Rule-Based Anti-Gouging Watchdog
- **Visual:** Attempt a ₹3,000 checkout to demonstrate on-chain rejection (exceeds ₹2,500 daily velocity cap).
- **Visual:** Switch to `/oracle` and `/merchant`. Merchant attempts to raise the price of drinking water by +50% over the baseline PriceBasket PDA.
- **On-Screen Action:** Price watchdog flags the price gouging. After 3 strikes, the smart contract suspends the merchant PDA on-chain.
- **Voiceover:**
  > "The program enforces safety at every step. Transactions exceeding the daily cap are rejected before gas is spent. When an opportunistic merchant hikes water prices by 50%, our rule-based price watchdog registers 3 strikes and automatically freezes the merchant's checkout privileges on-chain."

---

### [2:05 – 2:40] Step 4: Permissionless 30-Day Expiry & Reclamation Crank
- **Visual:** In `/command` or `/trust`, show the 30-day unspent balance sweep demonstration.
- **On-Screen Action:** Execute `reclaim`. The remaining ₹2,985 unspent balance is returned directly to the Treasury reserve, and a 50 bps caller bounty is distributed.
- **Show Explorer Link:**
  - `reclaim` Tx: [Solana Explorer Devnet](https://explorer.solana.com/tx/3PZpFRWM9wyB6gaRnBXptTVYfVJ3J5gdteahijHP6u2mhSPEa21sMcYWemw31tb2zraUixreVDt75wPK3puT65N7?cluster=devnet)
- **Voiceover:**
  > "Unlike traditional grants where unspent funds are permanently lost, ReliefRail implements an autonomous permissionless crank. Once the 30-day relief window closes, unspent balances automatically sweep back into the state treasury reserve to protect against future disasters."

---

### [2:40 – 3:00] Conclusion & Trust Model
- **Visual:** Navigate to `/trust`. Highlight the full trust model, privacy guarantees, and open-source GitHub repo.
- **Voiceover:**
  > "ReliefRail brings cryptographic verifiability, speed, and fairness to humanitarian response. Tested and proven on Solana Devnet. Thank you."
