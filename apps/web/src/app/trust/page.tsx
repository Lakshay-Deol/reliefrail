import type { Metadata } from "next";
import { TrustPage } from "@/components/trust/trust-page";

export const metadata: Metadata = {
  title: "ReliefRail | Trust Model & Proofs",
  description:
    "Explore the verifiable trust model, cryptographic privacy guarantees, on-chain vs simulated boundary, and Solana Devnet test proofs for ReliefRail.",
};

export default function Page() {
  return <TrustPage />;
}
