import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zero-Cost Dev Stack — Discover your next unfair advantage",
  description: "An indie-builder directory for comparing developer tools, free-tier caveats, setup guides, architecture notes, and privacy review signals.",
  applicationName: "Zero-Cost Dev Stack",
  keywords: ["free developer tools", "open source stack", "indie hackers", "developer directory", "free tier"],
  openGraph: {
    title: "Zero-Cost Dev Stack",
    description: "Build without burning budget. Compare tools, understand the trade-offs, and ship confidently.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zero-Cost Dev Stack",
    description: "The discovery engine for tools that help indie builders ship more with less.",
  },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
