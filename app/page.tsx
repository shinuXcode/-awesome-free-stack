import type { Metadata } from "next";
import toolsData from "../data/tools.json";
import type { Category, DetailedDevTool } from "../lib/types";
import { categories } from "../lib/types";
import HomeClient from "../components/HomeClient";

const SITE_URL = "https://awesome-free-stack.vercel.app";
const tools = toolsData as DetailedDevTool[];
const featuredIds = ["supabase", "vercel", "neon", "tailwind-css", "huggingface", "cloudflare-pages"];
const featured = featuredIds.map((id) => tools.find((tool) => tool.id === id)).filter(Boolean) as DetailedDevTool[];
const recentlyAdded = tools.slice(-6).reverse();
const categoryCounts: Partial<Record<Category, number>> = {};
for (const category of categories) categoryCounts[category] = tools.filter((tool) => tool.category === category).length;

export const metadata: Metadata = {
  title: "Free & Open-Source Developer Tools, AI, Design and Creator Software",
  description: "Discover 1,800+ tools for developers, AI/ML engineers, security researchers, video editors, 3D artists, creators and everyday users. Compare official sources and pricing caveats.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Zero-Cost Dev Stack — Free tools for people who build",
    description: "A source-first catalog of developer, AI, creative, productivity, security and open-source tools.",
    url: SITE_URL,
    type: "website",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": SITE_URL + "/#website",
      name: "Zero-Cost Dev Stack",
      url: SITE_URL,
      description: "A source-first directory of developer and creator tools with official links, pricing caveats and setup notes.",
      inLanguage: "en",
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: SITE_URL + "/tools?q={search_term_string}" },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": SITE_URL + "/#organization",
      name: "Zero-Cost Dev Stack",
      url: SITE_URL,
      founder: { "@type": "Person", name: "Sadab", url: "https://github.com/shinuXcode" },
      sameAs: ["https://github.com/shinuXcode/-awesome-free-stack", "https://x.com/shinuxcode"],
    },
  ],
};

export default function Home() {
  const stats = {
    totalTools: tools.length,
    openSourceCount: tools.filter((tool) => tool.pricingType === "Open Source").length,
    noCardCount: tools.filter((tool) => tool.noCreditCardRequired).length,
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <HomeClient featured={featured} recentlyAdded={recentlyAdded} categoryCounts={categoryCounts} {...stats} />
    </>
  );
}
