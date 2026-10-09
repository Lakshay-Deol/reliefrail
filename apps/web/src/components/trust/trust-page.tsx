"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/ui/logo";

interface TrustRow {
  component: string;
  trustedParty: string;
  mitigation: string;
  status: "on-chain" | "hybrid" | "authority";
}

const TRUST_MODEL_ROWS: TrustRow[] = [
  {
    component: "Rainfall & Cloudburst Telemetry",
    trustedParty: "Meteorological Department (DHM) / Satellite feeds (NASA/JAXA GPM)",
    mitigation: "2-of-3 Oracle quorum verification on-chain before disaster state triggers",
    status: "hybrid",
  },
  {
    component: "Eligible Beneficiary Registry",
    trustedParty: "State Disaster Authority / District Administration",
    mitigation: "Cryptographic Merkle Root published on-chain; zero PII stored; public count & budget audit",
    status: "hybrid",
  },
  {
    component: "Price Baseline Basket",
    trustedParty: "District Supply & Price Control Authority",
    mitigation: "Immutable on-chain PriceBasket PDA; versioned ceiling enforcing 35% gouging cap",
    status: "on-chain",
  },
  {
    component: "Fiat Off-Ramp / Liquidity",
    trustedParty: "Nodal Partner Bank / Treasury Account",
    mitigation: "Deterministic 12-hour settlement SLA; closed-loop merchant redemption only",
    status: "authority",
  },
  {
    component: "Fund Restriction & Reclamation Enforcement",
    trustedParty: "None (Autonomous Anchor Program)",
    mitigation: "Hardcoded geofence, velocity cap, non-transferability, and permissionless 30-day reclaim crank",
    status: "on-chain",
  },
];

const ON_CHAIN_VS_SIMULATED = [
  {
    feature: "Disaster Triggering",
    onChain: "Event PDA initialization, 2-of-3 oracle quorum consensus verification",
    simulated: "Real-time rainfall API ingestion polling loop (mocked live feed)",
    status: "Live on Devnet",
  },
  {
    feature: "Need-Based Payout Math",
    onChain: "S_i formula (0.4*Rain + 0.3*Kutcha + 0.3*MPI) verified in test suite & off-chain engine",
    simulated: "Dynamic UI Floor/Spread calculator matching on-chain PDA state",
    status: "100% Math Match",
  },
  {
    feature: "Beneficiary Allocation (Claim)",
    onChain: "Household PDA creation with restricted balance, daily spend cap, and rolling window start",
    simulated: "Merkle proof generation in client sandbox",
    status: "Live on Devnet",
  },
  {
    feature: "Merchant Checkout (Spend)",
    onChain: "District matching verification, active merchant check, 24h cap enforcement, balance deduction",
    simulated: "QR camera scanner simulation and virtual NFC tap in browser UI",
    status: "Live on Devnet",
  },
  {
    feature: "Anti-Gouging Watchdog",
    onChain: "Commodity price comparison vs PriceBasket PDA, 3-strike counter, automatic merchant suspension",
    simulated: "AI conversational shopper assistant (rule-based prompt sandbox)",
    status: "Live on Devnet",
  },
  {
    feature: "Fund Reclamation Crank",
    onChain: "Permissionless crank sweep of expired household balances back to Treasury reserve + 50 bps bounty",
    simulated: "Clock timestamp acceleration in demo script for instant expiration verification",
    status: "Live on Devnet",
  },
  {
    feature: "Emergency Circuit Breaker",
    onChain: "Admin authority instruction halting district or event spending instantly upon anomaly",
    simulated: "Browser drawer UI trigger",
    status: "Live on Devnet",
  },
];

const DEVNET_TRANSACTIONS = [
  {
    phase: "1. Event Initialization",
    instruction: "init_event",
    signature: "LQ8RQptEH4XxpuMhFwW3wRPgRcQKKtFPyJDXx66WJw6Enpq8TmNk7MAnJiTYAqBvZ97HWPBDvZYFhKdrAgTsKT7",
    url: "https://explorer.solana.com/tx/LQ8RQptEH4XxpuMhFwW3wRPgRcQKKtFPyJDXx66WJw6Enpq8TmNk7MAnJiTYAqBvZ97HWPBDvZYFhKdrAgTsKT7?cluster=devnet",
    details: "Created Disaster Event PDA on Solana Devnet (Slot 509226171) with ₹50,000,000 treasury cap.",
  },
  {
    phase: "2. District & Payout Registration",
    instruction: "register_district",
    signature: "3FjfwWQnMxVPen2QhyoLNEKnZf3jPYvc7JqFXR8bxEnYhsjtF23dPP8VF8j68UserLQASA6zNdFnP2nfkTUz2hu4",
    url: "https://explorer.solana.com/tx/3FjfwWQnMxVPen2QhyoLNEKnZf3jPYvc7JqFXR8bxEnYhsjtF23dPP8VF8j68UserLQASA6zNdFnP2nfkTUz2hu4?cluster=devnet",
    details: "Makwanpur registered: S=0.967, Payout=₹3,450 rINR derived from formula.",
  },
  {
    phase: "3. 2-of-3 Oracle Quorum Trigger",
    instruction: "trigger_event",
    signature: "5AFW6GFs1Ktonpe5Epd15A3fi8UDtcGL3nyi6qsQdSdqa4wETk9Ada8NePT92z19G66QxwFvXsNMzGPui6szP4Gv",
    url: "https://explorer.solana.com/tx/5AFW6GFs1Ktonpe5Epd15A3fi8UDtcGL3nyi6qsQdSdqa4wETk9Ada8NePT92z19G66QxwFvXsNMzGPui6szP4Gv?cluster=devnet",
    details: "DHM ground telemetry (517mm) + GPM satellite quorum verified on-chain.",
  },
  {
    phase: "4. Household Claim & Allocation",
    instruction: "claim",
    signature: "3AjVfPBu64TrSnE41L9sk4SSKeAYxiQBbdva2J6jrUCeMqDF18wTp6KMemdobKy6KtFgQ9wAfZYqFedWns96N8wz",
    url: "https://explorer.solana.com/tx/3AjVfPBu64TrSnE41L9sk4SSKeAYxiQBbdva2J6jrUCeMqDF18wTp6KMemdobKy6KtFgQ9wAfZYqFedWns96N8wz?cluster=devnet",
    details: "Household PDA initialized with ₹3,450 rINR restricted aid balance.",
  },
  {
    phase: "5. Merchant Checkout Spend",
    instruction: "spend",
    signature: "Lhh3LsobM4Arogb2nXijFnsSbDtEBTibJeV8mWPUtu3ERKAgXqFNKqWrEtgDfsfUjekYrtSANUDZW6mko7Srntj",
    url: "https://explorer.solana.com/tx/Lhh3LsobM4Arogb2nXijFnsSbDtEBTibJeV8mWPUtu3ERKAgXqFNKqWrEtgDfsfUjekYrtSANUDZW6mko7Srntj?cluster=devnet",
    details: "₹450 rINR spent on staple grocery basket; verified district match & daily cap.",
  },
  {
    phase: "6. Price Gouging Suspension",
    instruction: "flag_price (x3)",
    signature: "oECnHKExt1QkEG4KU7FNrVtKzTTCv8XrDoWHTDFqdyrA1Z7pGMHLuQCRPDumoZ2X4z8XCTGcCutJdR7ZMCR1WM5",
    url: "https://explorer.solana.com/tx/oECnHKExt1QkEG4KU7FNrVtKzTTCv8XrDoWHTDFqdyrA1Z7pGMHLuQCRPDumoZ2X4z8XCTGcCutJdR7ZMCR1WM5?cluster=devnet",
    details: "Merchant flagged 3x for +50% water markup; PDA status switched to Suspended.",
  },
  {
    phase: "7. Permissionless Expiry Reclaim",
    instruction: "reclaim",
    signature: "3PZpFRWM9wyB6gaRnBXptTVYfVJ3J5gdteahijHP6u2mhSPEa21sMcYWemw31tb2zraUixreVDt75wPK3puT65N7",
    url: "https://explorer.solana.com/tx/3PZpFRWM9wyB6gaRnBXptTVYfVJ3J5gdteahijHP6u2mhSPEa21sMcYWemw31tb2zraUixreVDt75wPK3puT65N7?cluster=devnet",
    details: "Unspent ₹2,985 rINR swept back to Treasury reserve; 50 bps bounty paid to caller.",
  },
];

export function TrustPage() {
  const [activeTab, setActiveTab] = useState<"trust" | "matrix" | "devnet" | "privacy" | "reg">("trust");

  return (
    <div className="min-h-screen bg-[#060913] text-[#f1f5f9] font-sans antialiased selection:bg-[#4edea3] selection:text-[#041a12] relative overflow-x-hidden">
      {/* Ambient background lighting */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-[#14304b]/30 via-[#0d2137]/15 to-transparent blur-[140px] rounded-full" />
        <div className="absolute top-[50%] right-[-10%] w-[600px] h-[500px] bg-gradient-to-br from-[#10b981]/10 via-[#06b6d4]/5 to-transparent blur-[160px] rounded-full" />
      </div>

      {/* Navigation Header */}
      <header className="fixed top-5 left-0 w-full z-50 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto bg-[#0a101f]/85 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-full h-14 px-5 flex items-center justify-between transition-all">
          <Link href="/" className="flex items-center gap-3 group">
            <Logo className="w-7 h-7 rounded-md transition-transform group-hover:scale-105 shadow-sm" />
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold tracking-tight text-white">ReliefRail</span>
              <span className="text-[10px] font-mono tracking-wider text-[#4edea3] bg-[#4edea3]/10 border border-[#4edea3]/20 px-2 py-0.5 rounded-full font-medium">
                VERIFIABLE TRUST
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
            <Link href="/" className="hover:text-white transition-colors">
              Overview
            </Link>
            <Link href="/command" className="hover:text-white transition-colors">
              Command
            </Link>
            <Link href="/aid" className="hover:text-white transition-colors">
              Beneficiary
            </Link>
            <Link href="/merchant" className="hover:text-white transition-colors">
              Merchant
            </Link>
            <Link href="/oracle" className="hover:text-white transition-colors">
              Oracle
            </Link>
            <Link href="/trust" className="text-white font-semibold transition-colors">
              Trust &amp; Proofs
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/command"
              className="px-4 py-2 bg-white hover:bg-slate-100 text-[#070b14] text-xs font-bold rounded-full transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 flex items-center gap-1.5"
            >
              <span>Command Center</span>
              <span className="material-symbols-outlined text-[14px]">arrow_outward</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 pt-32 sm:pt-40 pb-24 px-6 max-w-6xl mx-auto">
        {/* Core Thesis & Hero Banner */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 text-[#4edea3] text-xs font-mono mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse" />
            CORE THESIS &amp; AUDITABLE ARCHITECTURE
          </div>
          <h1 className="text-3xl sm:text-5xl font-medium tracking-tight text-white mb-4 leading-tight">
            Verifiable Trust &amp; On-Chain Integrity
          </h1>
          <blockquote className="text-lg sm:text-xl font-['Newsreader'] italic text-[#93c5fd] border-l-2 border-[#38bdf8]/40 pl-4 py-1 text-left max-w-2xl mx-auto mb-6 bg-white/[0.02] rounded-r-lg">
            “Solana doesn&apos;t remove trust in external data; it removes trust in how relief money is held, restricted, and returned.”
          </blockquote>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            ReliefRail turns a rainfall breach into restricted, expiring, auditable relief money in seconds, so aid reaches the right district, at fair prices, and unspent funds return to the next disaster.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-center gap-2 border-b border-white/[0.08] pb-4 mb-10 overflow-x-auto">
          {[
            { id: "trust", label: "Trust Model & Parties" },
            { id: "matrix", label: "On-Chain vs Simulated Matrix" },
            { id: "devnet", label: "Devnet Proofs & Explorer" },
            { id: "privacy", label: "Privacy & Merkle Roots" },
            { id: "reg", label: "Regulation & Prior Art" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-white text-[#070b14] font-bold shadow-md shadow-white/10"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: Trust Model Table */}
        {activeTab === "trust" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-[#0b1329]/80 border border-white/[0.08] rounded-2xl p-6 sm:p-8 backdrop-blur-md">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-white">Multi-Stakeholder Trust Distribution</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    How ReliefRail eliminates single points of failure without relying on unrealistic trust assumptions.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-[#4edea3] bg-[#4edea3]/10 border border-[#4edea3]/20 px-2.5 py-1 rounded-full">
                  5 Key Domains
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-slate-400 font-mono">
                      <th className="py-3 px-4">Component</th>
                      <th className="py-3 px-4">Trusted Party</th>
                      <th className="py-3 px-4">Mitigation &amp; Protection</th>
                      <th className="py-3 px-4">Enforcement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] text-slate-200">
                    {TRUST_MODEL_ROWS.map((row, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-white">{row.component}</td>
                        <td className="py-3.5 px-4 text-slate-300">{row.trustedParty}</td>
                        <td className="py-3.5 px-4 text-slate-300">{row.mitigation}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                              row.status === "on-chain"
                                ? "bg-[#10b981]/15 text-[#4edea3] border border-[#10b981]/30"
                                : row.status === "hybrid"
                                ? "bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/30"
                                : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                            }`}
                          >
                            {row.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Basis Risk Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#0b1329]/70 border border-white/[0.08] rounded-2xl p-6">
                <div className="flex items-center gap-2.5 text-amber-400 mb-3">
                  <span className="material-symbols-outlined text-[20px]">warning</span>
                  <h3 className="text-base font-semibold text-white">Mitigating Basis Risk</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Rainfall is an immediate objective trigger, but not an exact 1:1 damage gauge for every specific dwelling. Hillside topography and landslides cause uneven damage even within a 200mm rainfall zone.
                </p>
                <div className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-[11px] text-slate-300">
                  <strong className="text-white">ReliefRail Solution:</strong> Phase-1 provides an instant baseline payout within seconds for survival essentials. Phase-2 top-ups are unlocked via verified satellite flood extent SAR data or local authority damage attestations.
                </div>
              </div>

              <div className="bg-[#0b1329]/70 border border-white/[0.08] rounded-2xl p-6">
                <div className="flex items-center gap-2.5 text-[#38bdf8] mb-3">
                  <span className="material-symbols-outlined text-[20px]">router</span>
                  <h3 className="text-base font-semibold text-white">Offline Voucher Architecture</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Disasters frequently destroy cellular towers and fiber backhauls. Victims cannot wait for internet restoration to buy rations.
                </p>
                <div className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-[11px] text-slate-300">
                  <strong className="text-white">Offline Vouchers:</strong> Cryptographically pre-signed nonces capped strictly at ₹500 rINR. Merchants queue transactions offline and batch-settle on Solana once mesh/satellite connectivity reconnects.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: On-Chain vs Simulated Matrix */}
        {activeTab === "matrix" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-[#0b1329]/80 border border-white/[0.08] rounded-2xl p-6 sm:p-8 backdrop-blur-md">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-white">Complete On-Chain vs. Simulated Boundary</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Total transparency on what runs on Solana Devnet PDAs vs what is simulated in UI sandboxes.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-[#38bdf8] bg-[#38bdf8]/10 border border-[#38bdf8]/20 px-2.5 py-1 rounded-full">
                  7 Subsystems Audited
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-slate-400 font-mono">
                      <th className="py-3 px-4">Subsystem / Flow</th>
                      <th className="py-3 px-4 text-[#4edea3]">Real On-Chain PDA Logic</th>
                      <th className="py-3 px-4 text-slate-300">Simulated / Client Layer</th>
                      <th className="py-3 px-4">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] text-slate-200">
                    {ON_CHAIN_VS_SIMULATED.map((item, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-white">{item.feature}</td>
                        <td className="py-3.5 px-4 text-[#86efac]">{item.onChain}</td>
                        <td className="py-3.5 px-4 text-slate-400">{item.simulated}</td>
                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#10b981]/15 text-[#4edea3] border border-[#10b981]/30">
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Devnet Proofs */}
        {activeTab === "devnet" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-[#0b1329]/80 border border-white/[0.08] rounded-2xl p-6 sm:p-8 backdrop-blur-md">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">Verifiable Solana Devnet Transaction Proofs</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Every key lifecycle event executed against Program ID <code className="text-[#4edea3]">GrxgRShVcGaESyztvHHtaCF8YMXVhK3Wq7AesbQCaLy5</code>.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
                  <span className="text-[11px] font-mono text-[#4edea3]">Cluster: Solana Devnet</span>
                </div>
              </div>

              <div className="space-y-3 mt-6">
                {DEVNET_TRANSACTIONS.map((tx, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl hover:border-white/[0.15] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-xs">{tx.phase}</span>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/[0.06] text-slate-300">
                          {tx.instruction}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{tx.details}</p>
                    </div>

                    <a
                      href={tx.url}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#38bdf8]/10 hover:bg-[#38bdf8]/20 border border-[#38bdf8]/20 text-[#38bdf8] text-xs font-mono transition-colors self-start sm:self-auto"
                    >
                      <span>View Explorer Tx</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_outward</span>
                    </a>
                  </div>
                ))}
              </div>

              {/* Measured Performance Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/[0.08]">
                <div className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                  <div className="text-[11px] font-mono text-slate-400">Measured Devnet Slot Time</div>
                  <div className="text-xl font-bold text-white mt-1">~400 ms</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Real sub-second block confirmation</div>
                </div>
                <div className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                  <div className="text-[11px] font-mono text-slate-400">Average Devnet Tx Fee</div>
                  <div className="text-xl font-bold text-[#4edea3] mt-1">0.000005 SOL</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">&lt; $0.0008 USD per relief payment</div>
                </div>
                <div className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                  <div className="text-[11px] font-mono text-slate-400">1,000 Household Batch Benchmark</div>
                  <div className="text-xl font-bold text-[#38bdf8] mt-1">114 Claims / sec</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">8.77s total execution for entire district</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Privacy & Cryptography */}
        {activeTab === "privacy" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-[#0b1329]/80 border border-white/[0.08] rounded-2xl p-6 sm:p-8 backdrop-blur-md">
              <h2 className="text-xl font-semibold text-white mb-2">Zero-PII Beneficiary Privacy Architecture</h2>
              <p className="text-xs text-slate-400 mb-6">
                How ReliefRail ensures complete donor and auditor transparency without exposing vulnerable citizens&apos; private data on a public ledger.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-[#38bdf8]/10 text-[#38bdf8] flex items-center justify-center font-mono font-bold text-sm mb-3">
                    01
                  </div>
                  <h3 className="font-semibold text-white text-sm mb-2">Off-Chain Citizen Identity</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    National ID numbers, physical home addresses, family names, and contact numbers never touch the Solana blockchain. They remain securely in state databases.
                  </p>
                </div>

                <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-[#10b981]/10 text-[#4edea3] flex items-center justify-center font-mono font-bold text-sm mb-3">
                    02
                  </div>
                  <h3 className="font-semibold text-white text-sm mb-2">Hashed Merkle Leaves</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Beneficiaries are represented as cryptographic hashes: <code className="text-[#38bdf8] text-[11px]">H(Citizen_ID || Disaster_Salt)</code>. The state publishes only the 32-byte Merkle Root on-chain.
                  </p>
                </div>

                <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-mono font-bold text-sm mb-3">
                    03
                  </div>
                  <h3 className="font-semibold text-white text-sm mb-2">Stateless Claim Proofs</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Citizens present a lightweight Merkle proof during claim. The smart contract validates membership and initializes the Household PDA in constant O(1) gas without storing beneficiary lists.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Regulation & Prior Art */}
        {activeTab === "reg" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-[#0b1329]/80 border border-white/[0.08] rounded-2xl p-6 sm:p-8 backdrop-blur-md">
              <h2 className="text-xl font-semibold text-white mb-2">Regulatory Classification &amp; Prior Art Comparison</h2>
              <p className="text-xs text-slate-400 mb-6">
                Positioning ReliefRail within central banking guidelines and existing humanitarian cash assistance frameworks.
              </p>

              <div className="space-y-6">
                {/* Regulatory Framework */}
                <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                  <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#4edea3] text-[18px]">gavel</span>
                    <span>Closed-Loop Prepaid Relief Voucher Classification</span>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <code className="text-[#38bdf8]">rINR / rNPR</code> is explicitly designed not as a speculative cryptocurrency or open medium of exchange, but as a sovereign <strong>Closed-Loop Purpose-Bound Disaster Voucher</strong>. It is non-transferable peer-to-peer, spendable only at state-licensed essential commodity merchants within the declared disaster district, and programmed with a mandatory 30-day expiration crank returning unspent funds to state reserves.
                  </p>
                </div>

                {/* Prior Art Table */}
                <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#38bdf8] text-[18px]">compare_arrows</span>
                    <span>Evolution from Existing Disaster Relief Initiatives</span>
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/[0.08] text-slate-400 font-mono">
                          <th className="py-2.5 px-3">Initiative / Platform</th>
                          <th className="py-2.5 px-3">Mechanism</th>
                          <th className="py-2.5 px-3">ReliefRail Competitive Leap</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04] text-slate-300">
                        <tr>
                          <td className="py-2.5 px-3 font-semibold text-white">GiveDirectly / Start Network</td>
                          <td className="py-2.5 px-3">Direct unconditional mobile money transfers</td>
                          <td className="py-2.5 px-3 text-[#86efac]">Adds automated anti-gouging watchdogs, district geofences, and 30-day unspent fund reclamation.</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-semibold text-white">Grassroots Economics (Sarafu)</td>
                          <td className="py-2.5 px-3">Community inclusion currencies on EVM</td>
                          <td className="py-2.5 px-3 text-[#86efac]">Leverages Solana&apos;s ~400ms finality, sub-cent fees, and 2-of-3 meteorological oracle parametric automation.</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-semibold text-white">India e-RUPI / e₹ CBDC Pilots</td>
                          <td className="py-2.5 px-3">SMS-based purpose-bound merchant vouchers</td>
                          <td className="py-2.5 px-3 text-[#86efac]">Provides 100% public cryptographic treasury auditability and programmatic formulaic aid scaling without opaque bank backends.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
