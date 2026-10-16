import type { Metadata } from "next";
import "./globals.css";
import SiteNav from "../components/SiteNav";
import SiteFooter from "../components/SiteFooter";
import RouteMotion from "../components/RouteMotion";
import toolsData from "../data/tools.json";

const SITE_URL = "https://awesome-free-stack.vercel.app";
const toolCount = (toolsData as unknown[]).length;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  icons: { icon: "/logo.svg", shortcut: "/logo.svg" },
  title: {
    default: "Zero-Cost Dev Stack — Free & Open-Source Tools for Builders",
    template: "%s | Zero-Cost Dev Stack",
  },
  description: `Discover ${toolCount.toLocaleString("en-US")} developer, AI, design, security, creator, productivity and open-source tools. Compare official links, licenses, pricing caveats and setup notes.`,
  applicationName: "Zero-Cost Dev Stack",
  authors: [{ name: "Sadab", url: "https://github.com/shinuXcode" }],
  creator: "Sadab (shinuXcode)",
  publisher: "Zero-Cost Dev Stack",
  category: "technology",
  keywords: [
    "free developer tools", "open-source software directory", "AI developer tools",
    "free software for developers", "web development tools", "AI coding tools",
    "cybersecurity tools", "video editing software", "3D and VFX tools",
    "Linux applications", "developer resources", "indie hacker tools",
  ],
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "Zero-Cost Dev Stack — Find your next building block",
    description: "Compare free and open-source software, developer tools, AI, creative apps and more—with caveats and links to original sources.",
    url: SITE_URL,
    siteName: "Zero-Cost Dev Stack",
    locale: "en_US",
    type: "website",
    images: [{ url: "/logo.svg", alt: "Zero-Cost Dev Stack neon orbit logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zero-Cost Dev Stack",
    description: "Discover developer and creator tools with transparent sources, setup notes and pricing caveats.",
    creator: "@shinuxcode",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <SiteNav />
        <RouteMotion>{children}</RouteMotion>
        <SiteFooter />
      </body>
    </html>
  );
}
