"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { executeAnchorInstruction, fetchLiveSolanaDevnetStatus, type SolanaClusterStatus } from "@/lib/solana-devnet";

export function ResidentApp() {
  const [balance, setBalance] = useState(3500);
  const [spentToday, setSpentToday] = useState(1250);
  const [isScanning, setIsScanning] = useState(false);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const [lastExplorerUrl, setLastExplorerUrl] = useState<string | null>(null);
  const [devnetSlot, setDevnetSlot] = useState<number>(284192044);

  useEffect(() => {
    fetchLiveSolanaDevnetStatus().then((s) => setDevnetSlot(s.slot));
  }, []);

  // Anomaly & Rule Test States
  const [orderAmount, setOrderAmount] = useState(400);
  const [merchantDistrict, setMerchantDistrict] = useState("401"); // 401 = Makwanpur
  const [priceGougingRate, setPriceGougingRate] = useState(0); // 0% markup

  const [ledger, setLedger] = useState([
    {
      id: "tx-1",
      name: "Rice + Potable Water (20L)",
      detail: "Makwanpur Relief Depot #102 · 18m ago",
      amount: "-₹280",
      status: "APPROVED",
      isBlocked: false,
    },
    {
      id: "tx-2",
      name: "Heavy Duty Tarpaulin (12x15)",
      detail: "Makwanpur Relief Depot #102 · 2h ago",
      amount: "-₹350",
      status: "APPROVED",
      isBlocked: false,
    },
    {
      id: "tx-3",
      name: "Unauthorized Store Attempt",
      detail: "Pokhara Supply Store #412 · Yesterday",
      amount: "₹600",
      status: "BLOCKED",
      isBlocked: true,
      rule: "OutOfZone. Merchant is outside declared flood disaster zone (Makwanpur #401).",
    },
  ]);

  const ruleZoneMatch = merchantDistrict === "401";
  const ruleOrderCap = orderAmount <= 1500;
  const ruleDailyCap = spentToday + orderAmount <= 2500;
  const ruleExpiry = true;
  const ruleGouging = priceGougingRate <= 10;

  const allPass = ruleZoneMatch && ruleOrderCap && ruleDailyCap && ruleExpiry && ruleGouging;

  const handleAuthorizePayment = async () => {
    if (!allPass || balance < orderAmount) return;

    setIsAuthorizing(true);
    try {
      const res = await executeAnchorInstruction("spendGrocery", {
        districtCode: parseInt(merchantDistrict),
        amountInr: orderAmount,
      });

      setBalance((b) => b - orderAmount);
      setSpentToday((s) => s + orderAmount);
      setLastTxHash(res.signature);
      setLastExplorerUrl(res.explorerUrl);
      setDevnetSlot(res.slot);
      setIsAuthorizing(false);

      setLedger((prev) => [
        {
          id: `tx-${Date.now()}`,
          name: "Ration & Emergency Pack",
          detail: `Makwanpur Flood Relief Depot · Devnet Slot ${res.slot}`,
          amount: `-₹${orderAmount}`,
          status: "APPROVED",
          isBlocked: false,
        },
        ...prev,
      ]);
    } catch {
      setIsAuthorizing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060913] text-[#f1f5f9] font-sans antialiased selection:bg-[#4edea3] selection:text-[#041a12] relative pb-20">
      {/* Floating Pill Header (Mercury style) */}
      <header className="fixed top-5 left-0 w-full z-50 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto bg-[#0a101f]/85 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-full h-14 px-5 flex items-center justify-between transition-all">
          <Link href="/" className="flex items-center gap-3 group">
            <Logo className="w-7 h-7 rounded-md transition-transform group-hover:scale-105 shadow-sm" />
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold tracking-tight text-white">ReliefRail</span>
              <span className="text-[10px] font-mono tracking-wider text-[#4edea3] bg-[#4edea3]/10 border border-[#4edea3]/20 px-2 py-0.5 rounded-full font-medium">
                BENEFICIARY PWA
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
            <Link href="/aid" className="text-white font-semibold transition-colors">
              Beneficiary
            </Link>
            <Link href="/merchant" className="hover:text-white text-slate-300 transition-colors">
              Merchant POS
            </Link>
            <Link href="/oracle" className="hover:text-white text-slate-300 transition-colors">
              Oracle
            </Link>
          </nav>

          <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse" />
            <span className="hidden sm:inline">SOLANA DEVNET</span>
          </div>
        </div>
      </header>

      {/* Main Dual View Sandbox */}
      <main className="pt-24 pb-16 px-6 max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Beneficiary Mobile Simulator (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-2 font-mono text-xs text-[#bbcabf] px-1">
              <span>BENEFICIARY MOBILE APP</span>
              <span className="text-[#6bd8cb]">MAKWANPUR #401</span>
            </div>

            <div className="w-full max-w-[390px] bg-[#060e20] rounded-3xl p-4 shadow-2xl border border-[#3c4a42]/40 space-y-4">
              {/* Profile Bar */}
              <div className="flex items-center justify-between bg-[#131b2e] p-3 rounded-xl border border-[#3c4a42]/30">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#4edea3]/20 flex items-center justify-center text-[#4edea3] font-bold text-xs">
                    RS
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#dae2fd]">Ramesh Shrestha</div>
                    <div className="font-mono text-[10px] text-[#86948a]">HH-401-9842 · Daman/Makwanpur</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#4edea3]/20 text-[#4edea3] font-mono text-[10px] font-bold">
                  VERIFIED
                </span>
              </div>

              {/* Balance Card */}
              <div className="bg-gradient-to-br from-[#171f33] to-[#131b2e] p-4 rounded-2xl border border-[#4edea3]/30 space-y-3">
                <div className="flex items-center justify-between font-mono text-xs text-[#bbcabf]">
                  <span>Restricted Relief Balance</span>
                  <span className="text-[#4edea3] text-[10px]">27 Days Left</span>
                </div>
                <div className="text-3xl font-bold text-[#4edea3]">
                  ₹{balance.toLocaleString()}{" "}
                  <span className="font-mono text-xs text-[#6bd8cb] font-semibold">rINR</span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1 font-mono text-[10px]">
                  <div className="flex justify-between text-[#bbcabf]">
                    <span>Today: ₹{spentToday} / ₹2,500</span>
                    <span className="text-[#6bd8cb]">₹{2500 - spentToday} left</span>
                  </div>
                  <div className="w-full bg-[#060e20] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#4edea3] h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, (spentToday / 2500) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Scan / Pay Button */}
              <button
                onClick={() => setIsScanning((s) => !s)}
                className="w-full py-3 bg-[#4edea3] text-[#003824] font-mono text-xs font-bold rounded-xl hover:bg-[#6ffbbe] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
                <span>{isScanning ? "CLOSE CAMERA" : "SCAN MERCHANT QR"}</span>
              </button>

              {/* Scanner Viewfinder */}
              {isScanning && (
                <div className="p-3 bg-[#131b2e] rounded-xl border border-[#4edea3]/40 space-y-2 text-center">
                  <div className="font-mono text-[10px] text-[#4edea3]">CAMERA ACTIVE · POINT AT QR</div>
                  <div className="h-28 bg-[#060e20] rounded-lg flex items-center justify-center border border-dashed border-[#4edea3]/30">
                    <button
                      onClick={() => {
                        setIsScanning(false);
                        setOrderAmount(400);
                      }}
                      className="px-3 py-1.5 bg-[#4edea3] text-[#003824] font-mono text-[10px] font-bold rounded-lg cursor-pointer"
                    >
                      SIMULATE QR SCAN
                    </button>
                  </div>
                </div>
              )}

              {/* Essentials Catalog */}
              <div className="space-y-1.5">
                <div className="font-mono text-[10px] text-[#86948a] uppercase">Government Capped Items</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#131b2e] p-2 rounded-lg border border-[#3c4a42]/30">
                    <div className="font-bold text-[#dae2fd]">Rice (1kg)</div>
                    <div className="font-mono text-[#4edea3] text-[11px]">₹40</div>
                  </div>
                  <div className="bg-[#131b2e] p-2 rounded-lg border border-[#3c4a42]/30">
                    <div className="font-bold text-[#dae2fd]">Water (20L)</div>
                    <div className="font-mono text-[#4edea3] text-[11px]">₹35</div>
                  </div>
                  <div className="bg-[#131b2e] p-2 rounded-lg border border-[#3c4a42]/30">
                    <div className="font-bold text-[#dae2fd]">Tarpaulin</div>
                    <div className="font-mono text-[#4edea3] text-[11px]">₹250</div>
                  </div>
                  <div className="bg-[#131b2e] p-2 rounded-lg border border-[#3c4a42]/30">
                    <div className="font-bold text-[#dae2fd]">Torch Unit</div>
                    <div className="font-mono text-[#4edea3] text-[11px]">₹180</div>
                  </div>
                </div>
              </div>

              {/* Activity Ledger */}
              <div className="space-y-1.5">
                <div className="font-mono text-[10px] text-[#86948a] uppercase">Recent Activity</div>
                {ledger.slice(0, 2).map((tx) => (
                  <div
                    key={tx.id}
                    className="p-2 bg-[#131b2e] rounded-lg flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-[#dae2fd] text-[11px]">{tx.name}</div>
                      <div className="font-mono text-[9px] text-[#86948a]">{tx.detail}</div>
                    </div>
                    <span className="font-mono text-[#4edea3] font-bold text-[11px]">{tx.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Merchant POS & Rule Verifier (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Merchant Header */}
            <div className="bg-[#131b2e] rounded-2xl p-5 border border-[#3c4a42]/30 shadow-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#3c4a42]/30">
                <div>
                  <div className="font-mono text-[#6bd8cb] text-xs">POINT OF SALE TERMINAL</div>
                  <h2 className="text-xl font-bold text-[#dae2fd]">Makwanpur Relief Depot #102</h2>
                </div>
                <span className="px-2.5 py-1 rounded bg-[#4edea3]/20 text-[#4edea3] font-mono text-xs font-bold">
                  VERIFIED STORE
                </span>
              </div>

              {/* Attack / Simulation Toggles */}
              <div className="bg-[#060e20] p-3 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <span className="text-[#86948a] text-[10px] uppercase font-bold">RULE SIMULATOR:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setMerchantDistrict((d) => (d === "401" ? "512" : "401"))}
                    className={`px-2.5 py-1 rounded transition-colors cursor-pointer text-[11px] ${
                      merchantDistrict === "512"
                        ? "bg-[#93000a] text-[#ffdad6]"
                        : "bg-[#171f33] text-[#dae2fd]"
                    }`}
                  >
                    {merchantDistrict === "512" ? "❌ Wrong Zone" : "✅ Zone Match"}
                  </button>
                  <button
                    onClick={() => setOrderAmount((a) => (a === 400 ? 1800 : 400))}
                    className={`px-2.5 py-1 rounded transition-colors cursor-pointer text-[11px] ${
                      orderAmount > 1500
                        ? "bg-[#93000a] text-[#ffdad6]"
                        : "bg-[#171f33] text-[#dae2fd]"
                    }`}
                  >
                    {orderAmount > 1500 ? "❌ Overcap (₹1.8k)" : "✅ Under Cap (₹400)"}
                  </button>
                  <button
                    onClick={() => setPriceGougingRate((p) => (p === 0 ? 50 : 0))}
                    className={`px-2.5 py-1 rounded transition-colors cursor-pointer text-[11px] ${
                      priceGougingRate > 0
                        ? "bg-[#93000a] text-[#ffdad6]"
                        : "bg-[#171f33] text-[#dae2fd]"
                    }`}
                  >
                    {priceGougingRate > 0 ? "❌ +50% Gouging" : "✅ Fair Price"}
                  </button>
                </div>
              </div>

              {/* Cart & Verification Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cart Box */}
                <div className="bg-[#060e20] p-4 rounded-xl space-y-3">
                  <div className="font-mono text-xs text-[#bbcabf] font-bold">ORDER CART</div>
                  <div className="space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between text-[#dae2fd]">
                      <span>Rice (2kg)</span>
                      <span>₹{priceGougingRate > 0 ? 120 : 80}</span>
                    </div>
                    <div className="flex justify-between text-[#dae2fd]">
                      <span>Water (2 jars)</span>
                      <span>₹{priceGougingRate > 0 ? 105 : 70}</span>
                    </div>
                    <div className="flex justify-between text-[#dae2fd]">
                      <span>Tarpaulin (1 unit)</span>
                      <span>₹{priceGougingRate > 0 ? 375 : 250}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-[#3c4a42]/30 flex justify-between font-bold text-sm text-[#4edea3]">
                    <span>Total Amount</span>
                    <span>₹{priceGougingRate > 0 ? 600 : orderAmount} rINR</span>
                  </div>
                </div>

                {/* On-Chain Rule Pipeline */}
                <div className="bg-[#060e20] p-4 rounded-xl space-y-2">
                  <div className="font-mono text-xs text-[#bbcabf] font-bold">ANCHOR RULES</div>
                  <div className="space-y-1 font-mono text-[11px]">
                    <div className={`flex justify-between ${ruleZoneMatch ? "text-[#4edea3]" : "text-[#ffb4ab]"}`}>
                      <span>1. Zone Match</span>
                      <span>{ruleZoneMatch ? "PASS" : "FAIL"}</span>
                    </div>
                    <div className={`flex justify-between ${ruleOrderCap ? "text-[#4edea3]" : "text-[#ffb4ab]"}`}>
                      <span>2. Order Cap (≤₹1.5k)</span>
                      <span>{ruleOrderCap ? "PASS" : "FAIL"}</span>
                    </div>
                    <div className={`flex justify-between ${ruleDailyCap ? "text-[#4edea3]" : "text-[#ffb4ab]"}`}>
                      <span>3. Daily Cap (≤₹2.5k)</span>
                      <span>{ruleDailyCap ? "PASS" : "FAIL"}</span>
                    </div>
                    <div className="flex justify-between text-[#4edea3]">
                      <span>4. 30D Expiry</span>
                      <span>PASS</span>
                    </div>
                    <div className={`flex justify-between ${ruleGouging ? "text-[#4edea3]" : "text-[#ffb4ab]"}`}>
                      <span>5. Zero Gouging</span>
                      <span>{ruleGouging ? "PASS" : "FAIL"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Settlement Action Button */}
              <button
                onClick={handleAuthorizePayment}
                disabled={!allPass || isAuthorizing || balance < orderAmount}
                className={`w-full py-3.5 rounded-xl font-mono text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
                  !allPass || balance < orderAmount
                    ? "bg-[#171f33] text-[#86948a] cursor-not-allowed border border-[#3c4a42]/30"
                    : "bg-[#4edea3] text-[#003824] hover:bg-[#6ffbbe] cursor-pointer"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isAuthorizing ? "sync" : "lock"}
                </span>
                <span>
                  {isAuthorizing
                    ? "SETTLING ON SOLANA DEVNET..."
                    : !allPass
                    ? "RULE CHECK FAILED — PAYMENT BLOCKED"
                    : "AUTHORIZE PAYMENT (EXECUTE ON DEVNET)"}
                </span>
              </button>

              {lastTxHash && (
                <div className="p-3 bg-[#060e20] rounded-xl border border-[#4edea3]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-xs">
                  <div className="flex items-center gap-1.5 text-[#4edea3]">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span className="truncate">Confirmed: {lastTxHash.slice(0, 18)}... (Slot #{devnetSlot.toLocaleString()})</span>
                  </div>
                  <a
                    href={lastExplorerUrl || `https://explorer.solana.com/tx/${lastTxHash}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#6bd8cb] hover:underline flex items-center gap-0.5 text-[11px]"
                  >
                    <span>View on Solana Explorer</span>
                    <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                  </a>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
