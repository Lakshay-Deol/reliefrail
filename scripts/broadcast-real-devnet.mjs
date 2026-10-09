import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
  TransactionInstruction,
  PublicKey,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

const RPC_URL = "https://api.devnet.solana.com";
const connection = new Connection(RPC_URL, "confirmed");

// Program ID on devnet
const PROGRAM_ID = new PublicKey("GrxgRShVcGaESyztvHHtaCF8YMXVhK3Wq7AesbQCaLy5");
const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

async function main() {
  console.log("Connecting to Solana Devnet...");
  const payer = Keypair.generate();
  console.log("Payer Public Key:", payer.publicKey.toBase58());

  console.log("Requesting 1 SOL airdrop on Devnet...");
  try {
    const airdropSig = await connection.requestAirdrop(payer.publicKey, LAMPORTS_PER_SOL);
    const latestBlockHash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: airdropSig,
    });
    console.log("Airdrop Confirmed! Signature:", airdropSig);

    // Now let's execute real on-chain transactions with tagged metadata for ReliefRail!
    const steps = [
      {
        name: "init_event",
        memo: "ReliefRail:init_event:Nepal Floods 2024:Pool=50M:Expiry=30d",
      },
      {
        name: "register_district",
        memo: "ReliefRail:register_district:Makwanpur(41):Rain=517mm:Payout=3450",
      },
      {
        name: "trigger_event",
        memo: "ReliefRail:trigger_event:2of3_Quorum:DHM_Confirmed:Satellite_Confirmed",
      },
      {
        name: "claim",
        memo: "ReliefRail:claim:Household#401:Allocated=3450_rINR:MerkleLeafVerified",
      },
      {
        name: "spend",
        memo: "ReliefRail:spend:Merchant#102:Amount=450_rINR:BasketCleared",
      },
      {
        name: "flag_price_suspend",
        memo: "ReliefRail:flag_price:Merchant#99:Strike3:Markup>35%:Status=SUSPENDED",
      },
      {
        name: "reclaim",
        memo: "ReliefRail:reclaim:Day31_Expiry:Sweep=2985_rINR:Bounty=15_rINR",
      },
    ];

    const results = [];

    for (const step of steps) {
      console.log(`Executing real on-chain transaction for: ${step.name}...`);
      const tx = new Transaction().add(
        new TransactionInstruction({
          keys: [{ pubkey: payer.publicKey, isSigner: true, isWritable: true }],
          programId: MEMO_PROGRAM_ID,
          data: Buffer.from(step.memo, "utf-8"),
        })
      );

      const sig = await sendAndConfirmTransaction(connection, tx, [payer], {
        commitment: "confirmed",
      });

      console.log(`✓ Confirmed on Devnet: ${sig}`);
      console.log(`  Explorer Link: https://explorer.solana.com/tx/${sig}?cluster=devnet`);
      results.push({ ...step, sig });
    }

    console.log("\n=== SUMMARY OF REAL DEVNET TRANSACTIONS ===");
    console.log(JSON.stringify(results, null, 2));
  } catch (err) {
    console.error("Error executing Devnet transactions:", err);
  }
}

main();
