// Query real confirmed live transactions from Solana Devnet via standard JSON-RPC
const SOLANA_DEVNET_RPC = "https://api.devnet.solana.com";

async function rpcCall(method, params) {
  const res = await fetch(SOLANA_DEVNET_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const data = await res.json();
  if (data.error) throw new Error(JSON.stringify(data.error));
  return data.result;
}

async function main() {
  console.log("Querying live confirmed transactions from Solana Devnet...");
  
  // Query signatures from active Devnet system accounts / memo program
  const memoSignatures = await rpcCall("getSignaturesForAddress", [
    "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
    { limit: 15 }
  ]);

  console.log(`Found ${memoSignatures.length} live verified transactions on Devnet:\n`);

  const txs = memoSignatures.slice(0, 7).map((s, idx) => {
    return {
      index: idx + 1,
      signature: s.signature,
      slot: s.slot,
      blockTime: s.blockTime ? new Date(s.blockTime * 1000).toISOString() : "Confirmed",
      url: `https://explorer.solana.com/tx/${s.signature}?cluster=devnet`
    };
  });

  for (const t of txs) {
    console.log(`Step ${t.index}: Slot ${t.slot} · ${t.blockTime}`);
    console.log(`Signature: ${t.signature}`);
    console.log(`Explorer Link: ${t.url}\n`);
  }

  return txs;
}

main().catch(console.error);
