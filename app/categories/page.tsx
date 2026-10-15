import { Layers3, ShieldCheck } from "lucide-react";
import toolsData from "../../data/tools.json";
import { categories, type DetailedDevTool } from "../../lib/types";
import CategoryGrid from "../../components/CategoryGrid";

export const metadata = { title: "Categories — Zero-Cost Dev Stack", description: "Browse the developer tools directory by category." };
const tools = toolsData as DetailedDevTool[];

export default function CategoriesPage() {
  return (
    <main className="subpage">
      <section className="subhero">
        <span className="eyebrow"><span className="eyebrow-dot" /> EXPLORE THE ECOSYSTEM / 02</span>
        <h1>Choose your<br /><span>starting point.</span></h1>
        <p>Eight focused categories, each with practical tool notes and quick links to the official source.</p>
        <div className="subhero-meta"><span><Layers3 size={14} /> {categories.length} categories</span><span>{tools.length} listings indexed</span></div>
      </section>
      <section className="section-wrap category-directory">
        <div className="section-heading"><div><span className="eyebrow">THE MAP</span><h2>Pick a lane. <span>Start shipping.</span></h2><p>Open a category to see matching providers and compare their constraints.</p></div></div>
        <CategoryGrid tools={tools} />
        <div className="category-note"><ShieldCheck size={16} /><p>Categories organize discovery, not endorsements. Confirm the current pricing, privacy policy, billing rules, and supported use cases before adoption.</p></div>
      </section>
    </main>
  );
}
