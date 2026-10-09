"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SimulationHeader() {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Command Center", href: "/command" },
    { label: "Beneficiary PWA", href: "/aid" },
    { label: "Merchant POS", href: "/merchant" },
    { label: "Oracle Console", href: "/oracle" },
    { label: "Trust & Proofs", href: "/trust" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-orange-500/20 bg-[#050b14]/90 backdrop-blur-md">
      {/* Devnet & Simulation Notice Bar */}
      <div className="bg-gradient-to-r from-orange-950/80 via-amber-900/60 to-orange-950/80 px-4 py-1 text-center text-xs font-medium text-orange-200 border-b border-orange-500/30 flex items-center justify-center gap-2">
        <span className="inline-block h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
        <span className="font-semibold uppercase tracking-wider">Solana Devnet Prototype &amp; Simulation</span>
        <span className="hidden sm:inline text-orange-300/70">· Superteam Submission · Grounded Meteorological Baseline · Zero PII On-Chain</span>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 text-white font-bold shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
              RR
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white group-hover:text-orange-300 transition-colors">
                  ReliefRail
                </span>
                <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                  DEVNET VERIFIED
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Parametric Disaster Relief on Solana</p>
            </div>
          </Link>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-orange-500/20 text-orange-300 border border-orange-500/40 shadow-sm"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
