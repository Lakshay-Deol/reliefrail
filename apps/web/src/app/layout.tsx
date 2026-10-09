import type { Metadata, Viewport } from "next";
import "maplibre-gl/dist/maplibre-gl.css";
import { MotionRoot } from "@/components/ui/motion-root";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReliefRail | Disaster Relief Infrastructure Protocol",
  description:
    "Grounded in Nepal Floods & Cloudburst (September 2024). Programmable disaster relief tokens on Solana with strict on-chain spending caps, district zoning, price gouging defense, and post-30-day fund reclamation.",
};

export const viewport: Viewport = {
  themeColor: "#0b1326",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,400..700;1,6..72,400..700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#0b1326] text-[#dae2fd] antialiased selection:bg-[#4edea3] selection:text-[#003824]">
        <MotionRoot>{children}</MotionRoot>
      </body>
    </html>
  );
}

