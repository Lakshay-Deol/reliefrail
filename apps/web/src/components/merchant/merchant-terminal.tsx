"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { NEPAL_FLOOD_DISTRICTS } from "@/lib/india-model";

interface MerchantStore {
  id: string;
  name: string;
  district: string;
  districtCode: string;
  status: "APPROVED" | "SUSPENDED";
  pda: string;
  baselineMarkup: number;
}

const STORES: MerchantStore[] = [
  {
    id: "M-101",
    name: "Hetauda Emergency Food & Provision Depot",
    district: "Makwanpur",
    districtCode: "41",
    status: "APPROVED",
    pda: "7vK...9wQ2",
    baselineMarkup: 0,
  },
  {
    id: "M-102",
    name: "Dhulikhel Disaster Relief Supplies",
    district: "Kavrepalanchok",
    districtCode: "24",
    status: "APPROVED",
    pda: "3Np...8aB1",
    baselineMarkup: 0,
  },
  {
    id: "M-103",
    name: "Patan Civil Ration & Water Store",
    district: "Lalitpur",
    districtCode: "28",
    status: "APPROVED",
    pda: "8Lx...2mC4",
    baselineMarkup: 0,
  },
  {
    id: "M-104",
    name: "Kathmandu Central Emergency Depot",
    district: "Kathmandu",
    districtCode: "27",
    status: "APPROVED",
    pda: "4Yq...5tD9",
    baselineMarkup: 0,
  },
  {
    id: "M-105",
    name: "Melamchi Valley Outpost Provisions",
    district: "Sindhupalchok",
    districtCode: "23",
    status: "APPROVED",
    pda: "6Zs...1kF8",
    baselineMarkup: 0,
  },
];

interface CatalogItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  baselinePrice: number;
  currentPrice: number;
  icon: string;
}

const CATALOG: CatalogItem[] = [
  { id: "item-1", name: "Coarse Rice (10 kg bag)", category: "Grains", unit: "10kg", baselinePrice: 450, currentPrice: 450, icon: "grain" },
  { id: "item-2", name: "Heavy Duty Tarpaulin (12x15 ft)", category: "Shelter", unit: "1 pc", baselinePrice: 650, currentPrice: 650, icon: "roofing" },
  { id: "item-3", name: "Purified Water Canister (20L)", category: "Water", unit: "20L", baselinePrice: 90, currentPrice: 90, icon: "water_drop" },
  { id: "item-4", name: "Emergency Trauma & First Aid Kit", category: "Medical", unit: "1 kit", baselinePrice: 380, currentPrice: 380, icon: "medical_services" },
  { id: "item-5", name: "High-Energy Fortified Biscuits (Box of 24)", category: "Food", unit: "1 box", baselinePrice: 140, currentPrice: 140, icon: "cookie" },
  { id: "item-6", name: "Clean Cooking Fuel & Stove Canister", category: "Energy", unit: "1 can", baselinePrice: 220, currentPrice: 220, icon: "local_fire_department" },
  { id: "item-7", name: "Water Purification Tablets (100 pack)", category: "Medical", unit: "1 pk", baselinePrice: 110, currentPrice: 110, icon: "sanitizer" },
  { id: "item-8", name: "Emergency Battery & LED Flashlight", category: "Shelter", unit: "1 unit", baselinePrice: 260, currentPrice: 260, icon: "flashlight_on" },
];

interface CartLine {
  item: CatalogItem;
  qty: number;
}

interface SettledTx {
  txId: string;
  signature: string;
  timestamp: string;
  storeName: string;
  district: string;
  amount: number;
  itemsSummary: string;
  status: "CONFIRMED_ON_DEVNET";
}

export function MerchantTerminal() {
  const [selectedStore, setSelectedStore] = useState<MerchantStore>(STORES[0]!);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState<{ id: string; total: number; qrPayload: string } | null>(null);
  const [settledTxs, setSettledTxs] = useState<SettledTx[]>([
    {
      txId: "TX-9042",
      signature: "5Kj7y...9wQ2",
      timestamp: "2 mins ago",
      storeName: "Hetauda Emergency Food & Provision Depot",
      district: "Makwanpur",
      amount: 1190,
      itemsSummary: "Rice 10kg, Water 20L, Tarpaulin",
      status: "CONFIRMED_ON_DEVNET",
    },
    {
      txId: "TX-9039",
      signature: "4Kx8z...2pM1",
      timestamp: "14 mins ago",
      storeName: "Dhulikhel Disaster Relief Supplies",
      district: "Kavrepalanchok",
      amount: 450,
      itemsSummary: "Rice 10kg",
      status: "CONFIRMED_ON_DEVNET",
    },
  ]);
  const [markupSim, setMarkupSim] = useState(0);

  const cartTotal = cart.reduce((sum, line) => sum + line.item.currentPrice * (1 + markupSim / 100) * line.qty, 0);
  const cartItemCount = cart.reduce((sum, line) => sum + line.qty, 0);

  const addToCart = (item: CatalogItem) => {
    setCart((prev) => {
      const existing = prev.find((l) => l.item.id === item.id);
      if (existing) {
        return prev.map((l) => (l.item.id === item.id ? { ...l, qty: l.qty + 1 } : l));
      }
      return [...prev, { item, qty: 1 }];
    });
  };

  const updateQty = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((l) => {
          if (l.item.id === itemId) {
            const nextQty = l.qty + delta;
            return nextQty > 0 ? { ...l, qty: nextQty } : null;
          }
          return l;
        })
        .filter(Boolean) as CartLine[],
    );
  };

  const clearCart = () => {
    setCart([]);
    setActiveInvoice(null);
  };

  const handleGenerateInvoice = () => {
    if (cart.length === 0) return;
    const invId = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
    const payload = JSON.stringify({
      invoice: invId,
      store: selectedStore.id,
      storeName: selectedStore.name,
      district: selectedStore.district,
      districtCode: selectedStore.districtCode,
      total: Math.round(cartTotal),
      timestamp: Date.now(),
    });
    setActiveInvoice({ id: invId, total: Math.round(cartTotal), qrPayload: payload });
  };

  const handleSimulateResidentScanPay = () => {
    if (!activeInvoice) return;
    setIsCheckingOut(true);

    setTimeout(() => {
      const newTx: SettledTx = {
        txId: activeInvoice.id,
        signature: `${Math.random().toString(36).substring(2, 7)}...${Math.random().toString(36).substring(2, 6)}`,
        timestamp: "Just now",
        storeName: selectedStore.name,
        district: selectedStore.district,
        amount: activeInvoice.total,
        itemsSummary: cart.map((c) => `${c.item.name} (${c.qty})`).join(", "),
        status: "CONFIRMED_ON_DEVNET",
      };

      setSettledTxs([newTx, ...settledTxs]);
      setIsCheckingOut(false);
      setActiveInvoice(null);
      setCart([]);
    }, 1200);
  };

  const isGougingAlert = markupSim > 35;

  return (
    <div className="min-h-screen bg-[#060913] text-[#f1f5f9] font-sans antialiased selection:bg-[#4edea3] selection:text-[#041a12] relative pb-20">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-[700px] h-[500px] bg-gradient-to-b from-[#10b981]/10 via-[#0d2137]/10 to-transparent blur-[140px] rounded-full" />
        <div className="absolute bottom-10 left-10 w-[500px] h-[400px] bg-gradient-to-tr from-[#3b82f6]/10 to-transparent blur-[140px] rounded-full" />
      </div>

      {/* Floating Pill Header */}
      <header className="fixed top-5 left-0 w-full z-50 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto bg-[#0a101f]/85 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-full h-14 px-5 flex items-center justify-between transition-all">
          <Link href="/" className="flex items-center gap-3 group">
            <Logo className="w-7 h-7 rounded-md transition-transform group-hover:scale-105 shadow-sm" />
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold tracking-tight text-white">ReliefRail</span>
              <span className="text-[10px] font-mono tracking-wider text-[#4edea3] bg-[#4edea3]/10 border border-[#4edea3]/20 px-2 py-0.5 rounded-full font-medium">
                MERCHANT POS
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
            <Link href="/merchant" className="text-white font-semibold transition-colors">
              Merchant POS
            </Link>
            <Link href="/oracle" className="hover:text-white text-slate-300 transition-colors">
              Oracle
            </Link>
          </nav>

          <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse" />
            <span className="hidden sm:inline">TERMINAL ONLINE</span>
          </div>
        </div>
      </header>

      {/* Main Terminal Container */}
      <main className="relative z-10 pt-28 px-4 sm:px-6 max-w-6xl mx-auto">
        {/* Merchant Store Header & District Switcher */}
        <div className="bg-[#0b1222]/90 border border-white/[0.08] rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-xl mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
                <span className="px-2 py-0.5 rounded bg-white/[0.06] text-white font-bold">{selectedStore.id}</span>
                <span>·</span>
                <span>ZONE: {selectedStore.district.toUpperCase()} (#{selectedStore.districtCode})</span>
                <span>·</span>
                <span className="text-[#4edea3] font-semibold">{selectedStore.status}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                {selectedStore.name}
              </h1>
              <p className="text-xs text-slate-400 font-mono">
                Solana Devnet Token Recipient PDA: <span className="text-slate-300">{selectedStore.pda}</span>
              </p>
            </div>

            {/* Store Picker */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <span className="text-xs font-mono text-slate-400 shrink-0">REGISTER LOCATION:</span>
              <select
                value={selectedStore.id}
                onChange={(e) => {
                  const s = STORES.find((x) => x.id === e.target.value);
                  if (s) setSelectedStore(s);
                }}
                className="bg-[#080d1a] border border-white/[0.1] text-white text-xs rounded-xl px-3.5 py-2.5 outline-none font-medium focus:border-[#4edea3]"
              >
                {STORES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.district})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 text-left font-mono text-xs">
            <div className="p-3 bg-[#080d1a] rounded-xl border border-white/[0.06]">
              <div className="text-[10px] text-slate-400">SETTLEMENT CURRENCY</div>
              <div className="text-lg font-bold text-white mt-0.5">rINR</div>
              <div className="text-[10px] text-[#4edea3]">1:1 INR Pegged</div>
            </div>
            <div className="p-3 bg-[#080d1a] rounded-xl border border-white/[0.06]">
              <div className="text-[10px] text-slate-400">DAILY ORDER LIMIT</div>
              <div className="text-lg font-bold text-slate-200 mt-0.5">₹2,500 / Res</div>
              <div className="text-[10px] text-slate-400">On-chain Enforced</div>
            </div>
            <div className="p-3 bg-[#080d1a] rounded-xl border border-white/[0.06]">
              <div className="text-[10px] text-slate-400">PRICE WATCHDOG</div>
              <div className={`text-lg font-bold mt-0.5 ${isGougingAlert ? "text-[#f87171]" : "text-[#4edea3]"}`}>
                {markupSim > 0 ? `+${markupSim}%` : "Baseline (0%)"}
              </div>
              <div className="text-[10px] text-slate-400">{isGougingAlert ? "TRIGGER: FREEZE" : "Normal (<35%)"}</div>
            </div>
            <div className="p-3 bg-[#080d1a] rounded-xl border border-white/[0.06]">
              <div className="text-[10px] text-slate-400">DEVNET SETTLEMENT</div>
              <div className="text-lg font-bold text-[#93c5fd] mt-0.5">&lt; 1.8s</div>
              <div className="text-[10px] text-slate-400">Direct Merchant Credit</div>
            </div>
          </div>
        </div>

        {/* Register Grid: Left Catalog, Right Active Bill / Checkout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Relief Inventory Catalog (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-2">
              <h2 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#4edea3]">inventory_2</span>
                <span>Relief Commodity Catalog</span>
              </h2>
              <span className="text-xs font-mono text-slate-400">{CATALOG.length} STAPLES VERIFIED</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {CATALOG.map((item) => {
                const adjustedPrice = Math.round(item.currentPrice * (1 + markupSim / 100));
                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-[#0b1222]/80 border border-white/[0.08] hover:border-[#4edea3]/40 transition-all flex flex-col justify-between text-left group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center text-white group-hover:bg-[#4edea3]/10 group-hover:text-[#4edea3] transition-colors">
                          <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.05] text-slate-400">
                          {item.category}
                        </span>
                      </div>
                      <div className="font-medium text-sm text-white group-hover:text-[#93c5fd] transition-colors">
                        {item.name}
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">Unit: {item.unit}</div>
                    </div>

                    <div className="flex items-center justify-between pt-4 mt-3 border-t border-white/[0.06]">
                      <div className="font-mono">
                        <div className="text-base font-bold text-white">₹{adjustedPrice}</div>
                        <div className="text-[10px] text-slate-400">rINR / {item.unit}</div>
                      </div>
                      <button
                        onClick={() => addToCart(item)}
                        className="px-3 py-1.5 bg-[#17233f] hover:bg-[#4edea3] text-slate-200 hover:text-[#051c14] text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[15px]">add</span>
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Cart / Bill Register (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#0b1222]/90 border border-white/[0.09] rounded-3xl p-6 backdrop-blur-2xl shadow-xl text-left">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-[#4edea3]">point_of_sale</span>
                  <h3 className="text-base font-semibold text-white">Active Checkout Register</h3>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-[11px] font-mono text-slate-400 hover:text-[#f87171] transition-colors cursor-pointer"
                  >
                    Clear Bill
                  </button>
                )}
              </div>

              {/* Cart List */}
              {cart.length === 0 ? (
                <div className="py-12 text-center text-slate-400 font-mono text-xs space-y-2">
                  <span className="material-symbols-outlined text-4xl text-slate-600 block">shopping_cart</span>
                  <div>Register is idle.</div>
                  <div className="text-[11px] text-slate-500">Tap items from the catalog on the left to ring up aid.</div>
                </div>
              ) : (
                <div className="py-4 space-y-3 max-h-[260px] overflow-y-auto scrollbar-none">
                  {cart.map((line) => {
                    const price = Math.round(line.item.currentPrice * (1 + markupSim / 100));
                    return (
                      <div
                        key={line.item.id}
                        className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#080d1a] border border-white/[0.04]"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-white truncate">{line.item.name}</div>
                          <div className="text-[11px] font-mono text-slate-400">
                            ₹{price} × {line.qty} = ₹{price * line.qty}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => updateQty(line.item.id, -1)}
                            className="w-6 h-6 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-white flex items-center justify-center text-xs font-bold cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-5 text-center font-mono text-xs font-bold text-white">{line.qty}</span>
                          <button
                            onClick={() => updateQty(line.item.id, 1)}
                            className="w-6 h-6 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-white flex items-center justify-center text-xs font-bold cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Bill Totals */}
              <div className="pt-4 border-t border-white/[0.08] space-y-2 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Selected Items</span>
                  <span>{cartItemCount} units</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Geofence Validation</span>
                  <span className="text-[#4edea3]">MATCH ({selectedStore.district})</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-white/[0.06] text-white font-bold">
                  <span className="text-sm">Total Due</span>
                  <span className="text-2xl text-[#4edea3]">₹{Math.round(cartTotal).toLocaleString()} rINR</span>
                </div>
              </div>

              {/* Invoice Generation & Simulator Trigger */}
              <div className="pt-5 space-y-3">
                {!activeInvoice ? (
                  <button
                    onClick={handleGenerateInvoice}
                    disabled={cart.length === 0}
                    className={`w-full py-3 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                      cart.length > 0
                        ? "bg-white hover:bg-slate-100 text-[#070b14] active:scale-95"
                        : "bg-white/10 text-slate-500 cursor-not-allowed"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">qr_code</span>
                    <span>Generate Disaster Invoice QR</span>
                  </button>
                ) : (
                  <div className="p-4 rounded-2xl bg-[#080d1a] border border-[#4edea3]/30 space-y-3 text-center">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">{activeInvoice.id}</span>
                      <span className="text-[#4edea3] font-bold">READY TO SCAN</span>
                    </div>

                    {/* Visual QR Code Box */}
                    <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl flex items-center justify-center shadow-lg">
                      <div className="w-full h-full bg-slate-900 rounded-lg p-2 flex flex-col items-center justify-center text-center">
                        <span className="material-symbols-outlined text-4xl text-[#4edea3]">qr_code_scanner</span>
                        <span className="text-[9px] font-mono text-slate-300 mt-1">₹{activeInvoice.total} rINR</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-300 font-mono">
                      Beneficiary taps &quot;Scan POS&quot; in mobile app or click below to simulate instant Devnet clearance:
                    </p>

                    <button
                      onClick={handleSimulateResidentScanPay}
                      disabled={isCheckingOut}
                      className="w-full py-2.5 bg-[#4edea3] hover:bg-[#3ec48e] text-[#003824] text-xs font-bold rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95"
                    >
                      {isCheckingOut ? (
                        <>
                          <span className="w-3 h-3 rounded-full border-2 border-[#003824] border-t-transparent animate-spin" />
                          <span>Executing Solana Devnet Transfer...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[16px]">bolt</span>
                          <span>Simulate Resident One-Tap Pay</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Anti-Gouging Sandbox Testing Controls */}
            <div className="p-4 rounded-2xl bg-[#0b1222]/80 border border-white/[0.08] text-left space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                  <span className="material-symbols-outlined text-[16px] text-[#fbbf24]">speed</span>
                  <span>Oracle Price-Gouging Sandbox</span>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${isGougingAlert ? "bg-[#f87171]/20 text-[#f87171]" : "bg-[#4edea3]/10 text-[#4edea3]"}`}>
                  {markupSim > 0 ? `+${markupSim}%` : "0% (Baseline)"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Test the off-chain watchdog by artificially raising prices. Any hike above 35% triggers automatic on-chain suspension.
              </p>
              <input
                type="range"
                min="0"
                max="80"
                step="5"
                value={markupSim}
                onChange={(e) => setMarkupSim(Number(e.target.value))}
                className="w-full accent-[#4edea3] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Settled Devnet Transactions Feed */}
        <div className="mt-8 bg-[#0b1222]/90 border border-white/[0.08] rounded-3xl p-6 sm:p-8 backdrop-blur-2xl text-left shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <div>
              <h3 className="text-lg font-semibold text-white tracking-tight">Recent Devnet Merchant Clearances</h3>
              <p className="text-xs text-slate-400 font-mono">Live on-chain settlements for {selectedStore.district} district</p>
            </div>
            <span className="text-[11px] font-mono text-[#4edea3] bg-[#4edea3]/10 border border-[#4edea3]/20 px-2.5 py-1 rounded-full font-medium">
              100% AUDITABLE
            </span>
          </div>

          <div className="divide-y divide-white/[0.06] font-mono text-xs">
            {settledTxs.map((tx) => (
              <div key={tx.txId + tx.signature} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[#4edea3] font-bold">{tx.txId}</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-white font-medium">{tx.storeName}</span>
                    <span className="text-[10px] text-slate-400">({tx.district})</span>
                  </div>
                  <div className="text-[11px] text-slate-400">{tx.itemsSummary}</div>
                </div>

                <div className="flex items-center sm:text-right justify-between sm:justify-end gap-4">
                  <div>
                    <div className="text-sm font-bold text-[#4edea3]">₹{tx.amount.toLocaleString()} rINR</div>
                    <div className="text-[10px] text-slate-400">{tx.timestamp} · Sig: {tx.signature}</div>
                  </div>
                  <span className="material-symbols-outlined text-[#4edea3] text-[20px]">check_circle</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
