"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import {
  CYCLONE_FANI_DISTRICTS,
  allocateIndiaRelief,
} from "@/lib/india-model";
import { fetchLiveSolanaDevnetStatus, executeAnchorInstruction, type SolanaClusterStatus } from "@/lib/solana-devnet";

interface EventItem {
  time: string;
  type: string;
  message: string;
  pass: string;
  tx: string;
  status: string;
  isError?: boolean;
}

interface DistrictProfile {
  name: string;
  idCode: string;
  hazard: number;
  hazardTag: string;
  wind: number;
  rain: number;
  hh: number;
  payout: number;
  totalPool: number;
  status: string;
  statusColor: string;
  executed: number;
  description: string;
}

const DISTRICT_PROFILES: Record<string, DistrictProfile> = {
  makwanpur: {
    name: "Makwanpur (Daman)",
    idCode: "#401",
    hazard: 0.82,
    hazardTag: "0.82 · EXTREME",
    wind: 75,
    rain: 517,
    hh: 4320,
    payout: 3500,
    totalPool: 15120000,
    status: "CRITICAL",
    statusColor: "text-[#ffb4ab] bg-[#93000a]",
    executed: 4010,
    description: "Epicenter of all-time 517mm precipitation. Severe slope washouts.",
  },
  kavre: {
    name: "Kavrepalanchok",
    idCode: "#402",
    hazard: 0.69,
    hazardTag: "0.69 · HIGH",
    wind: 65,
    rain: 360,
    hh: 3450,
    payout: 3200,
    totalPool: 11040000,
    status: "HIGH RISK",
    statusColor: "text-[#ffb77d] bg-[#d97707]",
    executed: 3120,
    description: "Roshi River flash floods, Panauti and BP Highway breaches.",
  },
  lalitpur: {
    name: "Lalitpur",
    idCode: "#403",
    hazard: 0.58,
    hazardTag: "0.58 · MODERATE",
    wind: 55,
    rain: 322,
    hh: 2890,
    payout: 2800,
    totalPool: 8092000,
    status: "HIGH RISK",
    statusColor: "text-[#ffb77d] bg-[#d97707]",
    executed: 2640,
    description: "Nakkhu & Karmanasha river overflows, suburban inundation.",
  },
  sindhupalchok: {
    name: "Sindhupalchok",
    idCode: "#405",
    hazard: 0.63,
    hazardTag: "0.63 · HIGH",
    wind: 60,
    rain: 310,
    hh: 1980,
    payout: 3000,
    totalPool: 5940000,
    status: "HIGH RISK",
    statusColor: "text-[#ffb77d] bg-[#d97707]",
    executed: 1810,
    description: "Melamchi & Bhotekoshi riverine surges, Araniko bridge sweeps.",
  },
  kathmandu: {
    name: "Kathmandu Valley",
    idCode: "#404",
    hazard: 0.49,
    hazardTag: "0.49 · MODERATE",
    wind: 50,
    rain: 240,
    hh: 1620,
    payout: 2500,
    totalPool: 4050000,
    status: "MODERATE",
    statusColor: "text-[#4edea3] bg-[#171f33]",
    executed: 1510,
    description: "Bagmati & Balkhu river breaches; 24h airport record shattered.",
  },
};

export function CommandCenter() {
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>("makwanpur");
  const [devnetStatus, setDevnetStatus] = useState<SolanaClusterStatus>({
    slot: 284192044,
    blockHeight: 262104921,
    blockhash: "5Kj7y8P2v9Q2x1mB8sC7R6uN4wZaXeT3hD1fY9kLmQ2",
    solanaVersion: "2.1.14",
    latencyMs: 180,
    isLive: true,
  });

  useEffect(() => {
    fetchLiveSolanaDevnetStatus().then(setDevnetStatus);
    const interval = setInterval(() => {
      fetchLiveSolanaDevnetStatus().then(setDevnetStatus);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const [events, setEvents] = useState<EventItem[]>([
    {
      time: "14:02:18",
      type: "[DISPATCH]",
      message: "Makwanpur Vault credited ₹3,500 rINR (Daman Cluster)",
      pass: "NP-MAK-9921",
      tx: "5Kj7y...9wQ2",
      status: "CONFIRMED",
    },
    {
      time: "14:02:16",
      type: "[DISPATCH]",
      message: "Kavrepalanchok Vault credited ₹3,200 rINR (Panauti/Roshi)",
      pass: "NP-KAV-4412",
      tx: "3Ab4e...8uP1",
      status: "CONFIRMED",
    },
    {
      time: "14:02:11",
      type: "[SETTLE]",
      message: "Hetauda Food Depot redeemed ₹400 relief basket",
      pass: "NP-MAK-9842",
      tx: "9Wp3z...4kLm",
      status: "SETTLED",
    },
    {
      time: "14:01:55",
      type: "[BLOCKED]",
      message: "Blocked unauthorized merchant outside disaster zone (OutOfZone)",
      pass: "NP-MAK-401",
      tx: "7Lk2j...1aB4",
      status: "REJECTED",
      isError: true,
    },
  ]);

  const [circuitBreakerActive, setCircuitBreakerActive] = useState(false);

  const current: DistrictProfile = DISTRICT_PROFILES[selectedDistrictId] ?? DISTRICT_PROFILES["makwanpur"]!;

  const triggerForceSync = async () => {
    const status = await fetchLiveSolanaDevnetStatus();
    setDevnetStatus(status);
    const res = await executeAnchorInstruction("releaseAid", {
      districtCode: parseInt(current.idCode.replace("#", "")),
      amountInr: current.payout,
    });

    const newEvent: EventItem = {
      time: res.confirmedAt.split(" ")[0] || "14:05:01",
      type: "[SYNC]",
      message: `Hydrology Telemetry release_aid confirmed on Devnet: ${current.name} (Slot ${res.slot})`,
      pass: "ORACLE",
      tx: res.signature.slice(0, 10) + "...",
      status: "VALIDATED",
    };
    setEvents((prev) => [newEvent, ...prev.slice(0, 10)]);
  };

  const triggerCircuitBreaker = async () => {
    const nextState = !circuitBreakerActive;
    setCircuitBreakerActive(nextState);
    const res = await executeAnchorInstruction("suspendMerchant", {
      districtCode: parseInt(current.idCode.replace("#", "")),
      amountInr: 0,
    });

    const newEvent: EventItem = {
      time: res.confirmedAt.split(" ")[0] || "14:05:02",
      type: nextState ? "[HALT]" : "[RESUME]",
      message: nextState
        ? `Emergency circuit breaker signed on Devnet (Slot ${res.slot})`
        : `Multisig quorum resumed token operations on Devnet (Slot ${res.slot})`,
      pass: "MULTISIG",
      tx: res.signature.slice(0, 10) + "...",
      status: nextState ? "HALTED" : "RESUMED",
      isError: nextState,
    };
    setEvents((prev) => [newEvent, ...prev.slice(0, 10)]);
  };

  return (
    <div className="min-h-screen bg-[#060913] text-[#f1f5f9] font-sans antialiased relative overflow-x-hidden">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-[#14304b]/25 via-transparent to-transparent blur-[140px] rounded-full" />
      </div>

      {/* Floating Pill Header (Mercury Navbar) */}
      <header className="fixed top-5 left-0 w-full z-50 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto bg-[#0a101f]/75 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-full h-14 px-5 flex items-center justify-between transition-all">
          <Link href="/" className="flex items-center gap-3 group">
            <Logo className="w-7 h-7 rounded-md transition-transform group-hover:scale-105 shadow-sm" />
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold tracking-tight text-white">ReliefRail</span>
              <span className="hidden sm:inline-block text-[10px] font-mono text-[#4edea3] bg-[#4edea3]/10 border border-[#4edea3]/20 px-2 py-0.5 rounded-full font-medium">
                COMMAND
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-300">
            <Link href="/" className="hover:text-white text-slate-300 transition-colors">
              Overview
            </Link>
            <Link href="/command" className="text-white font-semibold transition-colors">
              Command Center
            </Link>
            <Link href="/aid" className="hover:text-white text-slate-300 transition-colors">
              Beneficiary App
            </Link>
            <Link href="/merchant" className="hover:text-white text-slate-300 transition-colors">
              Merchant POS
            </Link>
            <Link href="/oracle" className="hover:text-white text-slate-300 transition-colors">
              Oracle Console
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={triggerForceSync}
              className="px-3.5 py-1.5 bg-white/10 hover:bg-white/15 text-white font-mono text-xs font-medium rounded-full border border-white/10 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[14px] text-[#4edea3]">sync</span>
              <span>Sync DHM</span>
            </button>
            <button
              onClick={triggerCircuitBreaker}
              className={`px-3.5 py-1.5 font-mono text-xs font-medium rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                circuitBreakerActive
                  ? "bg-[#4edea3] text-[#003824] font-bold"
                  : "bg-[#f87171]/15 text-[#fca5a5] border border-[#f87171]/30 hover:bg-[#f87171]/25"
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">power_settings_new</span>
              <span>{circuitBreakerActive ? "Resume" : "Circuit Breaker"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Command Dashboard */}
      <main className="relative z-10 pt-28 pb-20 px-6 max-w-6xl mx-auto space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#0b1222]/80 border border-white/[0.08] p-5 rounded-2xl backdrop-blur-xl">
            <div className="font-mono text-slate-400 text-[10px] uppercase tracking-wider">DISASTER TREASURY</div>
            <div className="text-2xl font-bold text-[#4edea3] mt-1">₹18.4M</div>
            <div className="text-xs text-slate-400 mt-0.5">Devnet Vault Pool</div>
          </div>
          <div className="bg-[#0b1222]/80 border border-white/[0.08] p-5 rounded-2xl backdrop-blur-xl">
            <div className="font-mono text-slate-400 text-[10px] uppercase tracking-wider">ACTIVE ZONES</div>
            <div className="text-2xl font-bold text-[#93c5fd] mt-1">5 Districts</div>
            <div className="text-xs text-slate-400 mt-0.5">Nepal River Basin</div>
          </div>
          <div className="bg-[#0b1222]/80 border border-white/[0.08] p-5 rounded-2xl backdrop-blur-xl">
            <div className="font-mono text-slate-400 text-[10px] uppercase tracking-wider">HOUSEHOLDS ENROLLED</div>
            <div className="text-2xl font-bold text-white mt-1">14,260</div>
            <div className="text-xs text-slate-400 mt-0.5">100% ID-Mapped</div>
          </div>
          <div className="bg-[#0b1222]/80 border border-white/[0.08] p-5 rounded-2xl backdrop-blur-xl">
            <div className="font-mono text-slate-400 text-[10px] uppercase tracking-wider">RULE COMPLIANCE</div>
            <div className="text-2xl font-bold text-[#4edea3] mt-1">99.9%</div>
            <div className="text-xs text-slate-400 mt-0.5">Zero Transfer Hooks</div>
          </div>
        </div>

        {/* 2-Column Command Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Panel: Spatial Map & Matrix (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-[#0b1222]/90 rounded-3xl p-6 border border-white/[0.08] shadow-2xl backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#38bdf8] text-[20px]">radar</span>
                  <span className="font-semibold text-white text-base">Nepal Precipitation Matrix</span>
                </div>
                <span className="font-mono text-xs text-[#fca5a5] bg-[#f87171]/15 border border-[#f87171]/30 px-2.5 py-0.5 rounded-full font-bold">
                  517 MM RECORD
                </span>
              </div>

              {/* Vector Map */}
              <div className="relative w-full h-64 bg-[#060a14] rounded-2xl border border-white/[0.06] overflow-hidden flex items-center justify-center p-3">
                <svg className="w-full h-full select-none" fill="none" viewBox="0 0 500 240">
                  <path
                    d="M 60 190 Q 180 130 250 110 T 360 80 T 450 40"
                    stroke="#3c4a42"
                    strokeDasharray="4 4"
                    strokeWidth="2"
                  />

                  {Object.entries(DISTRICT_PROFILES).map(([id, d]) => {
                    const isSelected = selectedDistrictId === id;
                    const coords: Record<string, [number, number]> = {
                      makwanpur: [120, 160],
                      kavre: [340, 120],
                      lalitpur: [230, 125],
                      kathmandu: [250, 90],
                      sindhupalchok: [390, 60],
                    };
                    const [cx, cy] = coords[id] || [250, 100];
                    const isCritical = d.hazard >= 0.75;

                    return (
                      <g
                        key={id}
                        onClick={() => setSelectedDistrictId(id)}
                        className="cursor-pointer group"
                      >
                        <circle
                          cx={cx}
                          cy={cy}
                          r={isSelected ? 18 : 12}
                          fill={isCritical ? "#ffb4ab" : "#4edea3"}
                          fillOpacity={isSelected ? 0.35 : 0.15}
                          stroke={isCritical ? "#ffb4ab" : "#4edea3"}
                          strokeWidth={isSelected ? 2 : 1}
                        />
                        <circle cx={cx} cy={cy} r={isSelected ? 6 : 4} fill={isCritical ? "#ffb4ab" : "#4edea3"} />
                        <text
                          x={cx}
                          y={cy + 16}
                          textAnchor="middle"
                          fill="#dae2fd"
                          fontFamily="JetBrains Mono"
                          fontSize="9"
                          fontWeight={isSelected ? "bold" : "normal"}
                        >
                          {d.name}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* District Table */}
              <div className="overflow-x-auto rounded-lg bg-[#060e20]">
                <table className="w-full text-left font-mono text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#171f33] text-[#86948a] border-b border-[#3c4a42]/30">
                      <th className="p-2.5">District</th>
                      <th className="p-2.5">Hazard</th>
                      <th className="p-2.5 text-right">Households</th>
                      <th className="p-2.5 text-right">Payout / HH</th>
                      <th className="p-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3c4a42]/20">
                    {Object.entries(DISTRICT_PROFILES).map(([id, d]) => (
                      <tr
                        key={id}
                        onClick={() => setSelectedDistrictId(id)}
                        className={`cursor-pointer transition-colors ${
                          selectedDistrictId === id
                            ? "bg-[#222a3d] text-[#dae2fd] font-bold"
                            : "hover:bg-[#171f33] text-[#bbcabf]"
                        }`}
                      >
                        <td className="p-2.5 flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              d.hazard >= 0.8 ? "bg-[#ffb4ab]" : "bg-[#4edea3]"
                            }`}
                          />
                          <span>{d.name}</span>
                        </td>
                        <td className="p-2.5">{d.hazardTag}</td>
                        <td className="p-2.5 text-right">{d.hh.toLocaleString()}</td>
                        <td className="p-2.5 text-right text-[#4edea3] font-bold">
                          ₹{d.payout.toLocaleString()}
                        </td>
                        <td className="p-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${d.statusColor}`}>
                            {d.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Panel: Selected Zone Drilldown & Inspector (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Zone Drilldown Card */}
            <div className="bg-[#131b2e] rounded-xl p-5 border border-[#3c4a42]/30 shadow-md space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#3c4a42]/30">
                <div>
                  <div className="font-mono text-[#86948a] text-[10px]">SELECTED ZONE</div>
                  <div className="text-lg font-bold text-[#dae2fd]">{current.name}</div>
                </div>
                <span className={`px-2.5 py-0.5 rounded font-mono text-xs font-bold ${current.statusColor}`}>
                  {current.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                <div className="bg-[#060e20] p-3 rounded-lg">
                  <div className="text-[#86948a] text-[10px]">PEAK WIND</div>
                  <div className="text-base font-bold text-[#ffb4ab] mt-0.5">{current.wind} km/h</div>
                </div>
                <div className="bg-[#060e20] p-3 rounded-lg">
                  <div className="text-[#86948a] text-[10px]">48H RAINFALL</div>
                  <div className="text-base font-bold text-[#ffb77d] mt-0.5">{current.rain} mm</div>
                </div>
                <div className="bg-[#060e20] p-3 rounded-lg">
                  <div className="text-[#86948a] text-[10px]">PAYOUT / HOUSEHOLD</div>
                  <div className="text-base font-bold text-[#4edea3] mt-0.5">₹{current.payout}</div>
                </div>
                <div className="bg-[#060e20] p-3 rounded-lg">
                  <div className="text-[#86948a] text-[10px]">DISBURSED PROGRESS</div>
                  <div className="text-base font-bold text-[#dae2fd] mt-0.5">
                    {((current.executed / current.hh) * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* Solana Transaction Mini-Inspector */}
              <div className="bg-[#060e20] p-3 rounded-xl border border-[#3c4a42]/30 font-mono text-xs space-y-1.5">
                <div className="flex items-center justify-between text-[#86948a] text-[10px]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse" />
                    SOLANA DEVNET · SLOT #{devnetStatus.slot.toLocaleString()}
                  </span>
                  <span className="text-[#4edea3]">{devnetStatus.latencyMs}ms LATENCY</span>
                </div>
                <div className="text-[#dae2fd] text-[11px] truncate" title={devnetStatus.blockhash}>
                  Blockhash: {devnetStatus.blockhash}
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-[#3c4a42]/30 text-[10px]">
                  <span className="text-[#86948a]">Solana Core v{devnetStatus.solanaVersion}</span>
                  <a
                    href="https://explorer.solana.com/?cluster=devnet"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#6bd8cb] hover:underline flex items-center gap-0.5"
                  >
                    <span>View Devnet Explorer</span>
                    <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                  </a>
                </div>
              </div>

            </div>

            {/* Live Feed Terminal */}
            <div className="bg-[#131b2e] rounded-xl p-5 border border-[#3c4a42]/30 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#dae2fd]">Live Event Stream</span>
                <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-ping" />
              </div>

              <div className="space-y-2 font-mono text-xs max-h-48 overflow-y-auto">
                {events.map((ev, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-lg flex items-center justify-between ${
                      ev.isError ? "bg-[#93000a]/20 text-[#ffb4ab]" : "bg-[#060e20] text-[#bbcabf]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[#86948a] text-[10px]">{ev.time}</span>
                      <span className={`font-bold ${ev.isError ? "text-[#ffb4ab]" : "text-[#4edea3]"}`}>
                        {ev.type}
                      </span>
                      <span className="text-[#dae2fd] text-[11px]">{ev.message}</span>
                    </div>
                    <span className="text-[#6bd8cb] text-[10px]">{ev.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
