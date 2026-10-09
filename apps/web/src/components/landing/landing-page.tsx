"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/ui/logo";
import { InteractiveGlobe } from "@/components/ui/globe-animation";
import {
  NEPAL_FLOOD_DISTRICTS,
  computeDistrictHazard,
  allocateIndiaRelief,
} from "@/lib/india-model";

export function LandingPage() {
  const [selectedDistrict, setSelectedDistrict] = useState("Makwanpur");
  const [allocation] = useState(() => allocateIndiaRelief(NEPAL_FLOOD_DISTRICTS, 50_000_000, 20_000));
  const [vaultView, setVaultView] = useState<"allocation" | "rules" | "ledger">("allocation");

  const activeDistrict = NEPAL_FLOOD_DISTRICTS.find((d) => d.name === selectedDistrict) ?? NEPAL_FLOOD_DISTRICTS[0]!;
  const activeScored = computeDistrictHazard(activeDistrict);
  const activeAlloc = allocation.districts.find((d) => d.name === selectedDistrict) ?? allocation.districts[0]!;

  return (
    <div className="min-h-screen bg-[#060913] text-[#f1f5f9] font-sans antialiased selection:bg-[#4edea3] selection:text-[#041a12] relative overflow-x-hidden">
      {/* Ambient Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-[#14304b]/30 via-[#0d2137]/15 to-transparent blur-[140px] rounded-full" />
        <div className="absolute top-[40%] right-[-10%] w-[600px] h-[500px] bg-gradient-to-br from-[#10b981]/10 via-[#06b6d4]/5 to-transparent blur-[160px] rounded-full" />
        <div className="absolute top-[75%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-[#3b82f6]/10 to-transparent blur-[150px] rounded-full" />
      </div>

      {/* Floating Pill Header */}
      <header className="fixed top-5 left-0 w-full z-50 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto bg-[#0a101f]/80 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-full h-14 px-5 flex items-center justify-between transition-all">
          <Link href="/" className="flex items-center gap-3 group">
            <Logo className="w-7 h-7 rounded-md transition-transform group-hover:scale-105 shadow-sm" />
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold tracking-tight text-white">ReliefRail</span>
              <span className="hidden sm:inline-block text-[10px] font-mono tracking-wider text-[#4edea3] bg-[#4edea3]/10 border border-[#4edea3]/20 px-2 py-0.5 rounded-full font-medium">
                SOLANA DEVNET
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-300">
            <Link href="/" className="text-white font-semibold transition-colors">
              Overview
            </Link>
            <Link href="/command" className="hover:text-white text-slate-300 transition-colors">
              Command
            </Link>
            <Link href="/aid" className="hover:text-white text-slate-300 transition-colors">
              Beneficiary
            </Link>
            <Link href="/merchant" className="hover:text-white text-slate-300 transition-colors">
              Merchant
            </Link>
            <Link href="/oracle" className="hover:text-white text-slate-300 transition-colors">
              Oracle
            </Link>
            <Link href="/trust" className="hover:text-white text-slate-300 transition-colors">
              Trust &amp; Proofs
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/command"
              className="px-4 py-2 bg-white hover:bg-slate-100 text-[#070b14] text-xs font-bold rounded-full transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 flex items-center gap-1.5"
            >
              <span>Launch App</span>
              <span className="material-symbols-outlined text-[14px]">arrow_outward</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with 3D Interactive Globe */}
      <section className="relative z-10 pt-32 sm:pt-40 pb-16 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Punchy Editorial Copy */}
          <div className="lg:col-span-7 text-left">
            {/* Editorial Headline */}
            <h1 className="text-4xl sm:text-6xl font-medium tracking-tight text-white leading-[1.08] mb-5">
              Disaster relief,{" "}
              <span className="font-['Newsreader'] italic font-normal text-[#93c5fd] tracking-normal">
                engineered for velocity
              </span>{" "}
              &amp; zero leakage.
            </h1>

            {/* Concise Subtitle with standard one-liner */}
            <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed mb-8">
              ReliefRail turns a rainfall breach into restricted, expiring, auditable relief money in seconds, so aid reaches the right district, at fair prices, and unspent funds return to the next disaster.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 mb-10">
              <Link
                href="/command"
                className="px-6 py-3.5 bg-white hover:bg-slate-100 text-[#070b14] font-semibold text-sm rounded-full transition-all duration-200 shadow-[0_4px_20px_rgba(255,255,255,0.15)] flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Command Center</span>
                <span className="material-symbols-outlined text-[16px]">east</span>
              </Link>
              <Link
                href="/trust"
                className="px-5 py-3.5 bg-[#17233f] hover:bg-[#1e2e54] text-white border border-white/[0.1] font-semibold text-sm rounded-full transition-all duration-200"
              >
                Trust Model &amp; Proofs
              </Link>
            </div>

            {/* Fast Metrics Row */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/[0.08]">
              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">FINALITY</div>
                <div className="text-xl sm:text-2xl font-bold text-[#4edea3] mt-0.5">~400ms</div>
                <div className="text-[11px] text-slate-400">Devnet slot time</div>
              </div>
              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">TREASURY</div>
                <div className="text-xl sm:text-2xl font-bold text-white mt-0.5">₹50M</div>
                <div className="text-[11px] text-slate-400">Anchor vault pool</div>
              </div>
              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">RESTRICTION</div>
                <div className="text-xl sm:text-2xl font-bold text-[#93c5fd] mt-0.5">District Only</div>
                <div className="text-[11px] text-slate-400">Registered merchants</div>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Interactive Globe Animation */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            <div className="relative w-full max-w-[460px] aspect-square flex items-center justify-center">
              {/* Radial backdrop blur */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#38bdf8]/10 via-[#4edea3]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
              
              {/* Globe Canvas Component */}
              <InteractiveGlobe
                size={440}
                highlightLat={27.7}
                highlightLon={85.3}
                highlightLabel="Nepal (DHM 517mm Cloudburst)"
                className="relative z-10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Signature Mercury Fintech Interactive Card */}
      <section className="relative z-10 px-6 max-w-6xl mx-auto pb-24">
        <div className="bg-[#0b1222]/90 border border-white/[0.09] rounded-3xl p-6 sm:p-8 shadow-[0_24px_80px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
          {/* Card Top Navigation & Metadata */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs text-slate-400 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse" />
                <span>RELIEFRAIL CORE · VAULT ID #NP-2024</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                Nepal Cloudburst &amp; Monsoon Flood Disbursal Engine
              </h2>
            </div>

            {/* Segmented Controller (Mercury Style) */}
            <div className="inline-flex bg-[#070b16] p-1 rounded-xl border border-white/[0.08] text-xs font-medium self-start sm:self-auto">
              <button
                onClick={() => setVaultView("allocation")}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  vaultView === "allocation"
                    ? "bg-[#18233c] text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                District Allocation
              </button>
              <button
                onClick={() => setVaultView("rules")}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  vaultView === "rules"
                    ? "bg-[#18233c] text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Spending Rules
              </button>
              <button
                onClick={() => setVaultView("ledger")}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  vaultView === "ledger"
                    ? "bg-[#18233c] text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Devnet Ledger
              </button>
            </div>
          </div>

          {/* District Pill Selector */}
          <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-none border-b border-white/[0.06]">
            <span className="text-xs font-mono text-slate-400 shrink-0 mr-1">SELECT CORRIDOR:</span>
            {NEPAL_FLOOD_DISTRICTS.map((d) => {
              const isSelected = selectedDistrict === d.name;
              return (
                <button
                  key={d.name}
                  onClick={() => setSelectedDistrict(d.name)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-[#4edea3] text-[#003824] font-bold shadow-md"
                      : "bg-[#10192e] text-slate-300 hover:bg-[#16233f] border border-white/[0.06]"
                  }`}
                >
                  <span>{d.name}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${isSelected ? "bg-black/20 text-[#003824]" : "text-slate-400"}`}>
                    #{d.districtCode}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Interactive Dynamic View Area */}
          <div className="pt-6">
            {vaultView === "allocation" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Left side: District Breakdown Metrics */}
                <div className="lg:col-span-6 space-y-4 text-left">
                  <div className="p-4 rounded-2xl bg-[#080d1a] border border-white/[0.06] space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">DISTRICT PROFILE</span>
                      <span className="text-[#4edea3] font-semibold">BAGMATI PROVINCE</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <div className="text-2xl font-bold text-white">{activeDistrict.name}</div>
                      <div className="text-right">
                        <div className="text-xl font-mono font-bold text-[#4edea3]">
                          ₹{activeAlloc.payoutPerHouseholdInr.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">rINR / Household</div>
                      </div>
                    </div>

                    {/* Progress Bar Representation */}
                    <div className="space-y-1.5 pt-2 border-t border-white/[0.06] font-mono text-xs">
                      <div className="flex justify-between text-slate-300 text-[11px]">
                        <span>DHM 48h Precipitation</span>
                        <span className="text-[#ffb4ab] font-bold">{activeDistrict.rain48hMm} mm (Historic Peak)</span>
                      </div>
                      <div className="w-full bg-[#131d33] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-[#38bdf8] via-[#4edea3] to-[#ffb4ab] h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (activeDistrict.rain48hMm / 517) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3 Metric Mini Cards */}
                  <div className="grid grid-cols-3 gap-3 font-mono text-xs">
                    <div className="p-3 bg-[#080d1a] rounded-xl border border-white/[0.06]">
                      <div className="text-[10px] text-slate-400">NEED SCORE</div>
                      <div className="text-lg font-bold text-white mt-0.5">{activeScored.needScore}</div>
                      <div className="text-[10px] text-[#4edea3]">Auto-Triggered</div>
                    </div>
                    <div className="p-3 bg-[#080d1a] rounded-xl border border-white/[0.06]">
                      <div className="text-[10px] text-slate-400">FRAGILE HOMES</div>
                      <div className="text-lg font-bold text-slate-200 mt-0.5">{(activeDistrict.kutchaHousingShare * 100).toFixed(1)}%</div>
                      <div className="text-[10px] text-slate-400">Census Series</div>
                    </div>
                    <div className="p-3 bg-[#080d1a] rounded-xl border border-white/[0.06]">
                      <div className="text-[10px] text-slate-400">MPI POVERTY</div>
                      <div className="text-lg font-bold text-slate-200 mt-0.5">{(activeDistrict.povertyIndex * 100).toFixed(1)}%</div>
                      <div className="text-[10px] text-slate-400">UNDP Index</div>
                    </div>
                  </div>
                </div>

                {/* Right side: Interactive Simulated Voucher Pass */}
                <div className="lg:col-span-6">
                  <div className="relative p-6 bg-gradient-to-br from-[#121c33] via-[#0d162a] to-[#070c18] rounded-2xl border border-white/[0.1] shadow-xl text-left overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-[#4edea3]/5 rounded-full blur-3xl pointer-events-none" />

                    <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
                          <span className="material-symbols-outlined text-[18px]">verified_user</span>
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white">Beneficiary Relief Pass</div>
                          <div className="text-[10px] font-mono text-slate-400">Solana Anchor Token Mint</div>
                        </div>
                      </div>
                      <span className="font-mono text-[10px] font-bold text-[#4edea3] bg-[#4edea3]/10 border border-[#4edea3]/30 px-2 py-0.5 rounded-full">
                        ACTIVE · UNLOCKED
                      </span>
                    </div>

                    <div className="py-4 space-y-1">
                      <div className="text-[11px] font-mono text-slate-400">AUTHORIZED AID BALANCE</div>
                      <div className="text-3xl font-bold font-mono text-white tracking-tight flex items-baseline gap-2">
                        <span>₹{activeAlloc.payoutPerHouseholdInr.toLocaleString()}</span>
                        <span className="text-sm text-[#4edea3] font-semibold">rINR</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/[0.08] text-[11px] font-mono">
                      <div>
                        <div className="text-slate-400 text-[10px]">RESTRICTED ZONE</div>
                        <div className="text-white font-medium">{activeDistrict.name} (#{activeDistrict.districtCode})</div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[10px]">DAILY EXPENSE CAP</div>
                        <div className="text-white font-medium">₹2,500 / 24 Hours</div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[10px]">ORDER CEILING</div>
                        <div className="text-white font-medium">₹1,500 / Checkout</div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[10px]">EXPIRY &amp; RECLAIM</div>
                        <div className="text-[#93c5fd] font-medium">30 Days (Sweeps back)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {vaultView === "rules" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                <div className="p-4 rounded-2xl bg-[#080d1a] border border-white/[0.06] space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-[#4edea3]/10 flex items-center justify-center text-[#4edea3]">
                    <span className="material-symbols-outlined text-[18px]">satellite_alt</span>
                  </div>
                  <div className="font-semibold text-sm text-white">1. Parametric Threshold</div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Monsoon rainfall &ge; 200 mm triggers pool instantly on Solana Devnet without bureaucratic bottlenecks.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[#080d1a] border border-white/[0.06] space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-[#38bdf8]/10 flex items-center justify-center text-[#38bdf8]">
                    <span className="material-symbols-outlined text-[18px]">share_location</span>
                  </div>
                  <div className="font-semibold text-sm text-white">2. Geofenced Clearing</div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Vouchers can only clear at verified ration depots located strictly within the affected district.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[#080d1a] border border-white/[0.06] space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-[#fbbf24]/10 flex items-center justify-center text-[#fbbf24]">
                    <span className="material-symbols-outlined text-[18px]">speed</span>
                  </div>
                  <div className="font-semibold text-sm text-white">3. Velocity Caps</div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Enforces ₹1,500 single-order and ₹2,500 24-hour limits on-chain to prevent hoarding and cash-out schemes.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[#080d1a] border border-white/[0.06] space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-[#f87171]/10 flex items-center justify-center text-[#f87171]">
                    <span className="material-symbols-outlined text-[18px]">history</span>
                  </div>
                  <div className="font-semibold text-sm text-white">4. 30-Day Auto Sweep</div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Unspent aid automatically sweeps back into the emergency state vault after 30 days post-disaster.
                  </p>
                </div>
              </div>
            )}

            {vaultView === "ledger" && (
              <div className="p-4 rounded-2xl bg-[#080d1a] border border-white/[0.06] font-mono text-xs text-left overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="text-slate-400 border-b border-white/[0.06] text-[11px]">
                      <th className="pb-2">Instruction</th>
                      <th className="pb-2">Account / Recipient</th>
                      <th className="pb-2 text-right">Amount</th>
                      <th className="pb-2 text-center">Status</th>
                      <th className="pb-2 text-right">Devnet Signature</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    <tr>
                      <td className="py-2.5 text-[#4edea3] font-bold">release_aid</td>
                      <td className="py-2.5 text-slate-300">Makwanpur Household Vault #401</td>
                      <td className="py-2.5 text-right font-bold text-white">₹3,500</td>
                      <td className="py-2.5 text-center text-[#4edea3]">CONFIRMED</td>
                      <td className="py-2.5 text-right text-slate-400">5Kj7y...9wQ2</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 text-[#38bdf8] font-bold">spend_grocery</td>
                      <td className="py-2.5 text-slate-300">Hetauda Food Depot #102</td>
                      <td className="py-2.5 text-right font-bold text-white">₹400</td>
                      <td className="py-2.5 text-center text-[#38bdf8]">SETTLED</td>
                      <td className="py-2.5 text-right text-slate-400">9Wp3z...4kLm</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 text-[#f87171] font-bold">suspend_merchant</td>
                      <td className="py-2.5 text-slate-300">Opportunistic Vendor (+85% markup)</td>
                      <td className="py-2.5 text-right font-bold text-[#f87171]">FROZEN</td>
                      <td className="py-2.5 text-center text-[#f87171]">SUSPENDED</td>
                      <td className="py-2.5 text-right text-slate-400">3Ab4e...8uP1</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Bento Grid: Mercury Suite Features */}
      <section className="relative z-10 px-6 max-w-6xl mx-auto pb-24">
        <div className="text-left mb-10">
          <div className="text-xs font-mono text-[#4edea3] uppercase tracking-wider font-semibold mb-2">
            PROTOCOL ARCHITECTURE
          </div>
          <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-white">
            Built for velocity.{" "}
            <span className="font-['Newsreader'] italic font-normal text-slate-300">
              Programmed for integrity.
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Bento Card 1: Main Vault (7 cols) */}
          <div className="md:col-span-7 bg-[#0b1222]/80 border border-white/[0.08] rounded-3xl p-7 text-left flex flex-col justify-between hover:border-white/[0.15] transition-all">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[20px]">account_balance</span>
              </div>
              <h3 className="text-xl font-semibold text-white">Parametric Liquidity Vaults</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Rainfall telemetry breaches unlock Solana treasuries programmatically with zero human delays.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-slate-400">
              <span>SOLANA DEVNET ANCHOR</span>
              <span className="text-[#4edea3]">INSTANT UNLOCK</span>
            </div>
          </div>

          {/* Bento Card 2: Zoned POS (5 cols) */}
          <div className="md:col-span-5 bg-[#0b1222]/80 border border-white/[0.08] rounded-3xl p-7 text-left flex flex-col justify-between hover:border-white/[0.15] transition-all">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#38bdf8]/10 border border-[#38bdf8]/20 flex items-center justify-center text-[#38bdf8]">
                <span className="material-symbols-outlined text-[20px]">storefront</span>
              </div>
              <h3 className="text-xl font-semibold text-white">Zoned POS Clearing</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Aid vouchers only clear at verified ration depots strictly inside affected districts.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-white/[0.06] text-xs font-mono text-slate-400">
              <span>GEOFENCED SETTLEMENT</span>
            </div>
          </div>

          {/* Bento Card 3: Anti-Gouging (5 cols) */}
          <div className="md:col-span-5 bg-[#0b1222]/80 border border-white/[0.08] rounded-3xl p-7 text-left flex flex-col justify-between hover:border-white/[0.15] transition-all">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#fbbf24]/10 border border-[#fbbf24]/20 flex items-center justify-center text-[#fbbf24]">
                <span className="material-symbols-outlined text-[20px]">shield_with_heart</span>
              </div>
              <h3 className="text-xl font-semibold text-white">Anti-Gouging Oracle</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Real-time basket surveillance auto-freezes vendor checkouts spiking over +35% baseline.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-white/[0.06] text-xs font-mono text-slate-400">
              <span>AUTOMATED PRICE DEFENSE</span>
            </div>
          </div>

          {/* Bento Card 4: 30-Day Clawback (7 cols) */}
          <div className="md:col-span-7 bg-[#0b1222]/80 border border-white/[0.08] rounded-3xl p-7 text-left flex flex-col justify-between hover:border-white/[0.15] transition-all">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#f87171]/10 border border-[#f87171]/20 flex items-center justify-center text-[#f87171]">
                <span className="material-symbols-outlined text-[20px]">currency_exchange</span>
              </div>
              <h3 className="text-xl font-semibold text-white">Automated Reclamation</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Unspent balances after 30 days sweep back into state emergency reserves for future relief.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-slate-400">
              <span>ZERO CAPITAL LEAKAGE</span>
              <span className="text-[#f87171]">POST-30D SWEEP</span>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison: Traditional vs ReliefRail (Mercury Table style) */}
      <section className="relative z-10 px-6 max-w-6xl mx-auto pb-24">
        <div className="bg-[#0b1222]/80 border border-white/[0.08] rounded-3xl p-8 text-left">
          <div className="max-w-xl mb-8">
            <div className="text-xs font-mono text-[#4edea3] uppercase tracking-wider font-semibold mb-2">
              WHY RELIEFRAIL
            </div>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-white">
              The fundamental shift in disaster economics.
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] text-xs font-mono text-slate-400">
                  <th className="pb-4">DIMENSION</th>
                  <th className="pb-4 text-slate-400">TRADITIONAL EMERGENCY GRANTS</th>
                  <th className="pb-4 text-[#4edea3]">RELIEFRAIL PROTOCOL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-slate-300 text-xs sm:text-sm">
                <tr>
                  <td className="py-4 font-semibold text-white">Disbursal Latency</td>
                  <td className="py-4 text-slate-400">4 to 8 Weeks (Manual surveys)</td>
                  <td className="py-4 text-[#4edea3] font-semibold">&lt; 3 Seconds (Parametric trigger)</td>
                </tr>
                <tr>
                  <td className="py-4 font-semibold text-white">Geographic Leakage</td>
                  <td className="py-4 text-slate-400">Unrestricted cash spent anywhere</td>
                  <td className="py-4 text-[#4edea3] font-semibold">Geofenced to verified affected zones</td>
                </tr>
                <tr>
                  <td className="py-4 font-semibold text-white">Price Gouging Protection</td>
                  <td className="py-4 text-slate-400">None (Market surge exploitation)</td>
                  <td className="py-4 text-[#4edea3] font-semibold">Automated Oracle Store Suspension</td>
                </tr>
                <tr>
                  <td className="py-4 font-semibold text-white">Unspent Fund Recovery</td>
                  <td className="py-4 text-slate-400">0% (Lost in untracked accounts)</td>
                  <td className="py-4 text-[#4edea3] font-semibold">100% Swept back to Treasury on Day 30</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="relative z-10 px-6 max-w-6xl mx-auto pb-24 text-center">
        <div className="bg-gradient-to-b from-[#111c34] to-[#0a101f] border border-white/[0.12] p-10 sm:p-14 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#4edea3]/10 rounded-full blur-3xl pointer-events-none" />

          <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-white mb-3">
            Test the future of disaster liquidity.
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-md mx-auto mb-8 leading-relaxed font-normal">
            Experience telemetry-triggered payouts to on-chain merchant checkout in our live Devnet sandbox.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5">
            <Link
              href="/command"
              className="px-6 py-3.5 bg-white hover:bg-slate-100 text-[#070b14] font-semibold text-sm rounded-full transition-all duration-200 shadow-lg"
            >
              Open Command Center
            </Link>
            <Link
              href="/aid"
              className="px-6 py-3.5 bg-[#17233f] hover:bg-[#1e2e54] text-white border border-white/[0.1] font-semibold text-sm rounded-full transition-all duration-200"
            >
              Beneficiary App
            </Link>
          </div>
        </div>
      </section>

      {/* Luxury Footer (Mercury Style) */}
      <footer className="relative z-10 py-12 px-6 border-t border-white/[0.08] max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-400 font-sans">
        <div className="flex items-center gap-3">
          <Logo className="w-5 h-5 rounded" />
          <span className="text-slate-300 font-medium">ReliefRail Protocol</span>
          <span className="text-slate-600">·</span>
          <span>Solana Devnet Evaluation</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/command" className="hover:text-white transition-colors">Command</Link>
          <Link href="/aid" className="hover:text-white transition-colors">Beneficiary</Link>
          <Link href="/merchant" className="hover:text-white transition-colors">Merchant</Link>
          <Link href="/oracle" className="hover:text-white transition-colors">Oracle</Link>
          <Link href="/trust" className="hover:text-white transition-colors">Trust &amp; Proofs</Link>
        </div>
      </footer>
    </div>
  );
}
