import type { Metadata } from "next";
import { TrustPage } from "@/components/trust/trust-page";

export const metadata: Metadata = {
  title: "Trust Model, Verifiability & On-Chain Matrix | ReliefRail",
  description:
    "Explore the verifiable trust model, cryptographic privacy guarantees, on-chain vs simulated boundary, and Solana Devnet test proofs for ReliefRail.",
};

export default function Page() {
  return <TrustPage />;
}
