import Link from "next/link";
import { ArrowUpRight, BarChart3, Bot, Boxes, Cloud, Database, Fingerprint, Gauge, Layers3, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import toolsData from "../../data/tools.json";
import { categories, type Category, type DetailedDevTool } from "../../lib/types";

export const metadata = { title: "Categories — Zero-Cost Dev Stack", description: "Browse the developer tools directory by category." };
const tools = toolsData as DetailedDevTool[];
const details: Record<Category, { subtitle: string; note: string; icon: typeof Database; number: string }> = {
  "Databases & BaaS": { subtitle: "Data, auth, and backend building blocks.", note: "Build the backbone of your product.", icon: Database, number: "01" },
  "Hosting & PaaS": { subtitle: "Deploy sites and apps without owning servers.", note: "From preview builds to production.", icon: Cloud, number: "02" },
  "Auth & Security": { subtitle: "Identity, sessions, and access workflows.", note: "Keep users and application routes protected.", icon: Fingerprint, number: "03" },
  "AI APIs": { subtitle: "Model inference and AI-powered endpoints.", note: "Prototype thoughtfully with cost safeguards.", icon: Bot, number: "04" },
  "Storage & CDN": { subtitle: "Files, media, object storage, and delivery.", note: "Plan access, bandwidth, and retention.", icon: Boxes, number: "05" },
  "Dev Tools": { subtitle: "API clients, automation, email, and workflow tools.", note: "Make your build loop more effective.", icon: Layers3, number: "06" },
  "CMS": { subtitle: "Structured content and headless publishing.", note: "Separate content workflows from your UI.", icon: Gauge, number: "07" },
  "Analytics": { subtitle: "Product events, errors, logs, and performance.", note: "Collect only the signals you actually need.", icon: BarChart3, number: "08" },
};
function slug(category: string) { return category.toLowerCase().replaceAll(" & ", "-").replaceAll(" ", "-"); }

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
        <div className="category-page-grid">
          {categories.map((category, index) => {
            const item = details[category], Icon = item.icon, count = tools.filter((tool) => tool.category === category).length;
            return (
              <motion.div key={category} id={slug(category)} className="category-page-card-wrap" initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.18 }} transition={{ delay: index * 0.035, duration: 0.3 }}>
                <Link className="category-page-card" href={`/tools?category=${encodeURIComponent(category)}`}>
                  <div className="category-page-top"><span>{item.number} / CATEGORY</span><span>{String(count).padStart(2, "0")} TOOLS</span></div>
                  <span className="category-page-icon"><Icon size={22} /></span>
                  <h3>{category}</h3><p>{item.subtitle}</p>
                  <div className="category-page-bottom"><span>{item.note}</span><span className="category-page-arrow"><ArrowUpRight size={17} /></span></div>
                </Link>
              </motion.div>
            );
          })}
        </div>
        <div className="category-note"><ShieldCheck size={16} /><p>Categories organize discovery, not endorsements. Confirm the current pricing, privacy policy, billing rules, and supported use cases before adoption.</p></div>
      </section>
    </main>
  );
}
