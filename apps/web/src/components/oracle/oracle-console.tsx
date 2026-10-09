"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { executeAnchorInstruction } from "@/lib/solana-devnet";

interface OracleCase {
  id: string;
  merchantName: string;
  district: string;
  item: string;
  basePrice: number;
  reportedPrice: number;
  spikeRatio: number;
  status: "FLAGGED" | "SUSPENDED_ON_CHAIN" | "DISMISSED";
  detectedAt: string;
}

const INITIAL_CASES: OracleCase[] = [
  {
    id: "CASE-401",
    merchantName: "Hetauda Food & Provisions",
    district: "Makwanpur",
    item: "Packaged Drinking Water (20L)",
    basePrice: 35,
    reportedPrice: 65,
    spikeRatio: 0.857,
    status: "SUSPENDED_ON_CHAIN",
    detectedAt: "10:16 NPT",
  },
  {
    id: "CASE-402",
    merchantName: "Panauti Valley Supplies",
    district: "Kavrepalanchok",
    item: "Heavy Duty Tarpaulin (12x15)",
    basePrice: 250,
    reportedPrice: 380,
    spikeRatio: 0.52,
    status: "FLAGGED",
    detectedAt: "10:18 NPT",
  },
  {
    id: "CASE-403",
    merchantName: "Patan Grain Traders",
    district: "Lalitpur",
    item: "Rice (1kg)",
    basePrice: 40,
    reportedPrice: 46,
    spikeRatio: 0.15,
    status: "DISMISSED",
    detectedAt: "10:05 NPT",
  },
];

export function OracleConsole() {
  const [cases, setCases] = useState<OracleCase[]>(INITIAL_CASES);
  const [toast, setToast] = useState<{ msg: string; explorerUrl: string } | null>(null);

  const handleSuspend = async (id: string) => {
    const res = await executeAnchorInstruction("suspendMerchant", {
      districtCode: 401,
      amountInr: 0,
    });

    setCases((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "SUSPENDED_ON_CHAIN" } : c))
    );
    setToast({
      msg: `Merchant in ${id} suspended on Devnet (Slot #${res.slot.toLocaleString()}). Anchor instruction confirmed.`,
      explorerUrl: res.explorerUrl,
    });
    setTimeout(() => setToast(null), 6000);
  };

  return (
    <div className="min-h-screen bg-[#060913] text-[#f1f5f9] font-sans antialiased selection:bg-[#4edea3] selection:text-[#041a12] relative pb-20">
      {/* Floating Pill Header */}
      <header className="fixed top-5 left-0 w-full z-50 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto bg-[#0a101f]/85 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-full h-14 px-5 flex items-center justify-between transition-all">
          <Link href="/" className="flex items-center gap-3 group">
            <Logo className="w-7 h-7 rounded-md transition-transform group-hover:scale-105 shadow-sm" />
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold tracking-tight text-white">ReliefRail</span>
              <span className="text-[10px] font-mono tracking-wider text-[#4edea3] bg-[#4edea3]/10 border border-[#4edea3]/20 px-2 py-0.5 rounded-full font-medium">
                ORACLE WATCHDOG
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-300">
            <Link href="/" className="hover:text-white text-slate-300 transition-colors">
              Overview
            </Link>
            <Link href="/command" className="hover:text-white text-slate-300 transition-colors">
              Command
            </Link>
            <Link href="/aid" className="hover:text-white text-slate-300 transition-colors">
              Beneficiary
            </Link>
            <Link href="/merchant" className="hover:text-white text-slate-300 transition-colors">
              Merchant POS
            </Link>
            <Link href="/oracle" className="text-white font-semibold transition-colors">
              Oracle
            </Link>
          </nav>

          <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse" />
            <span className="hidden sm:inline">DHM ACTIVE</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-16 px-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#3c4a42]/30">
          <div>
            <h1 className="text-2xl font-bold text-[#dae2fd]">Anti-Gouging Oracle Console</h1>
            <p className="text-xs text-[#bbcabf] mt-0.5">
              Automated price surveillance comparing merchant POS reported prices against DHM benchmarks and disaster supply ceilings.
            </p>
          </div>
        </div>

        {toast && (
          <div className="p-3 bg-[#10b981]/20 border border-[#4edea3]/40 rounded-xl text-xs font-mono text-[#4edea3] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>{toast.msg}</span>
            </div>
            <a
              href={toast.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#6bd8cb] hover:underline flex items-center gap-0.5 text-[11px]"
            >
              <span>View on Explorer</span>
              <span className="material-symbols-outlined text-[12px]">open_in_new</span>
            </a>
          </div>
        )}


        {/* Case Table */}
        <div className="bg-[#131b2e] rounded-2xl border border-[#3c4a42]/30 overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="bg-[#060e20] text-[#86948a] border-b border-[#3c4a42]/30">
                  <th className="p-3">Case / Store</th>
                  <th className="p-3">District</th>
                  <th className="p-3">Item</th>
                  <th className="p-3 text-right">Gov Benchmark</th>
                  <th className="p-3 text-right">Reported Price</th>
                  <th className="p-3 text-center">Spike</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3c4a42]/20">
                {cases.map((c) => (
                  <tr key={c.id} className="hover:bg-[#171f33] transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-[#dae2fd]">{c.merchantName}</div>
                      <div className="text-[10px] text-[#86948a]">{c.id} · {c.detectedAt}</div>
                    </td>
                    <td className="p-3 text-[#bbcabf]">{c.district}</td>
                    <td className="p-3 text-[#dae2fd]">{c.item}</td>
                    <td className="p-3 text-right text-[#86948a]">₹{c.basePrice}</td>
                    <td className="p-3 text-right font-bold text-[#ffb4ab]">₹{c.reportedPrice}</td>
                    <td className="p-3 text-center">
                      <span className="text-[#ffb4ab] font-bold">
                        +{(c.spikeRatio * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.status === "SUSPENDED_ON_CHAIN"
                            ? "bg-[#93000a] text-[#ffdad6]"
                            : c.status === "FLAGGED"
                            ? "bg-[#d97707] text-[#ffdcc3]"
                            : "bg-[#171f33] text-[#86948a]"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {c.status === "FLAGGED" && (
                        <button
                          onClick={() => handleSuspend(c.id)}
                          className="px-3 py-1 bg-[#93000a] hover:bg-[#ffb4ab] text-[#ffdad6] hover:text-[#690005] rounded text-[11px] font-bold transition-all cursor-pointer"
                        >
                          Suspend on Devnet
                        </button>
                      )}
                      {c.status === "SUSPENDED_ON_CHAIN" && (
                        <span className="text-[#86948a] text-[10px]">Suspended</span>
                      )}
                      {c.status === "DISMISSED" && (
                        <span className="text-[#86948a] text-[10px]">Dismissed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
