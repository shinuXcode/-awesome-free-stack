"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Search, Sparkles } from "lucide-react";
import toolsData from "../../data/tools.json";
import type { Category, DetailedDevTool, PricingType, SortMode } from "../../lib/types";
import { categories } from "../../lib/types";
import FilterBar from "../../components/FilterBar";
import ToolCard from "../../components/ToolCard";
import ToolDetailsModal from "../../components/ToolDetailsModal";

const tools = toolsData as DetailedDevTool[];
const safetyScore: Record<DetailedDevTool["safetyRank"], number> = { "A+": 3, A: 2, "B+": 1 };
function starCount(tool: DetailedDevTool) {
  if (!tool.githubStars) return -1;
  const value = Number(tool.githubStars.replace(/[^0-9.]/g, ""));
  return Number.isFinite(value) ? value : -1;
}

export default function ToolsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "All">("All");
  const [pricingType, setPricingType] = useState<PricingType | "All">("All");
  const [noCard, setNoCard] = useState(false);
  const [beginner, setBeginner] = useState(false);
  const [safetyOnly, setSafetyOnly] = useState(false);
  const [sort, setSort] = useState<SortMode>("Recently Added");
  const [selected, setSelected] = useState<DetailedDevTool | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("category");
    if (requested && (categories as readonly string[]).includes(requested)) setCategory(requested as Category);
    if (params.get("sort") === "recent") setSort("Recently Added");
    const focusSearch = () => document.querySelector<HTMLInputElement>('input[aria-label="Search tools"]')?.focus();
    const keyHandler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); focusSearch(); }
      else if (event.key === "/" && !typing) { event.preventDefault(); focusSearch(); }
      else if (event.key === "Escape") { setSelected(null); if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); }
    };
    window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const list = tools.filter((tool) =>
      (category === "All" || tool.category === category) &&
      (pricingType === "All" || tool.pricingType === pricingType) &&
      (!noCard || tool.noCreditCardRequired) &&
      (!beginner || tool.targetAudience === "Beginner") &&
      (!safetyOnly || tool.safetyRank === "A+") &&
      (!needle || [tool.name, tool.tagline, tool.description, tool.category, tool.pricingType].join(" ").toLowerCase().includes(needle))
    );
    return list.sort((a, b) => {
      if (sort === "Recently Added") return tools.indexOf(b) - tools.indexOf(a);
      if (sort === "Highest Rated") return b.userRating - a.userRating || b.totalReviewsCount - a.totalReviewsCount || a.name.localeCompare(b.name);
      if (sort === "Most Starred") return starCount(b) - starCount(a) || Number(Boolean(b.githubRepoUrl)) - Number(Boolean(a.githubRepoUrl)) || a.name.localeCompare(b.name);
      if (sort === "Safety Score") return safetyScore[b.safetyRank] - safetyScore[a.safetyRank] || a.name.localeCompare(b.name);
      return a.name.localeCompare(b.name);
    });
  }, [query, category, pricingType, noCard, beginner, safetyOnly, sort]);

  const reset = () => { setQuery(""); setCategory("All"); setPricingType("All"); setNoCard(false); setBeginner(false); setSafetyOnly(false); setSort("Recently Added"); };

  return (
    <main className="subpage">
      <section className="subhero tools-subhero">
        <div className="subhero-orb" aria-hidden="true" />
        <span className="eyebrow"><span className="eyebrow-dot" /> TOOL LIBRARY / 01</span>
        <h1>Find your next<br /><span>building block.</span></h1>
        <p>Explore {tools.length} tools across {categories.length} categories. Search the catalog, compare free-tier caveats, and dig into architecture before choosing.</p>
        <div className="subhero-meta"><span><Sparkles size={14} /> Community maintained</span><span>Unrated means no verified review data yet</span></div>
      </section>
      <section className="section-wrap tool-library">
        <div className="section-heading"><div><span className="eyebrow">SEARCH & COMPARE</span><h2>Every tool, <span>one place.</span></h2><p>Search with <kbd>/</kbd> or <kbd>⌘ K</kbd>. Use filters to narrow down your options.</p></div><div className="directory-total"><strong>{filtered.length.toString().padStart(2, "0")}</strong><span>RESULTS</span></div></div>
        <FilterBar query={query} setQuery={setQuery} category={category} setCategory={setCategory} pricingType={pricingType} setPricingType={setPricingType} noCard={noCard} setNoCard={setNoCard} beginner={beginner} setBeginner={setBeginner} safetyOnly={safetyOnly} setSafetyOnly={setSafetyOnly} sort={sort} setSort={setSort} categories={[...categories]} />
        <div className="results-meta"><span>{filtered.length} {filtered.length === 1 ? "result" : "results"}</span><span className="results-separator" /><span>Open profiles for setup guides and security notes</span><button onClick={reset}>Reset all ↗</button></div>
        <AnimatePresence mode="popLayout">
          <motion.div layout className="tool-grid">
            {filtered.map((tool, index) => <ToolCard key={tool.id} tool={tool} index={index} onDetails={setSelected} />)}
          </motion.div>
        </AnimatePresence>
        {filtered.length === 0 && <motion.div className="empty-state" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><Search size={25} /><h3>No matching tools.</h3><p>Try removing a filter or searching a broader term.</p><button className="button-secondary" onClick={reset}>Clear filters</button></motion.div>}
        <p className="data-note">Pricing and signup information can change. Review the provider's official terms before committing to a production stack.</p>
        <p className="library-bottom-link">Need a starting point? <Link href="/categories">Browse by category <ArrowUpRight size={13} /></Link></p>
      </section>
      <ToolDetailsModal tool={selected} onClose={() => setSelected(null)} />
    </main>
  );
}
