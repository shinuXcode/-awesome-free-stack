import { Layers3, ShieldCheck } from "lucide-react";
import toolsData from "../../data/tools.json";
import { categories, type DetailedDevTool } from "../../lib/types";
import CategoryGrid from "../../components/CategoryGrid";
import type { Metadata } from "next";

const SITE_URL = "https://awesome-free-stack.vercel.app";
export const metadata: Metadata = {
  title: "Browse all 38 categories",
  description: "Browse developer, AI, cybersecurity, creative, productivity and open-source tools by category. Compare official sources, pricing labels and setup notes.",
  alternates: { canonical: "/categories" },
  openGraph: { title: "Tool Categories | Zero-Cost Dev Stack", url: SITE_URL + "/categories", description: "Browse developer and creator tool collections by category.", type: "website" },
};
const tools = toolsData as DetailedDevTool[];
const counts: Partial<Record<(typeof categories)[number], number>> = Object.fromEntries(
  categories.map((category) => [category, tools.filter((tool) => tool.category === category).length]),
);

export default function CategoriesPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Tool Categories — Zero-Cost Dev Stack",
    url: SITE_URL + "/categories",
    description: "Browse tools and resources grouped by their main use case.",
    numberOfItems: categories.length,
    author: { "@type": "Person", name: "Sadab", url: "https://github.com/shinuXcode" },
  };
  return (
    <main id="main-content" className="subpage">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <section className="subhero">
        <span className="eyebrow"><span className="eyebrow-dot" /> EXPLORE THE ECOSYSTEM / 02</span>
        <h1>Choose your<br /><span>starting point.</span></h1>
        <p>Browse all {categories.length} categories, each with matching resources and quick links to official sources.</p>
        <div className="subhero-meta"><span><Layers3 size={14} /> {categories.length} categories</span><span>{tools.length} listings indexed</span></div>
      </section>
      <section className="section-wrap category-directory">
        <div className="section-heading"><div><span className="eyebrow">THE MAP</span><h2>Pick a lane. <span>Start shipping.</span></h2><p>Open a category to see matching providers and compare their constraints.</p></div></div>
        <CategoryGrid counts={counts} />
        <div className="category-note"><ShieldCheck size={16} /><p>Categories organize discovery, not endorsements. Confirm pricing, privacy, license, billing rules, and supported use cases with official sources before adoption.</p></div>
      </section>
    </main>
  );
}
