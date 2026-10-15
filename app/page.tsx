"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Command, Github, Heart, Search, Sparkles, ShieldCheck, Layers3 } from "lucide-react";
import toolsData from "../data/tools.json";
import type { Category, DetailedDevTool, PricingType, SortMode } from "../lib/types";
import { categories } from "../lib/types";
import FilterBar from "../components/FilterBar";
import ToolCard from "../components/ToolCard";
import ToolDetailsModal from "../components/ToolDetailsModal";
import FounderSection from "../components/FounderSection";

const tools = toolsData as DetailedDevTool[];
const safetyScore: Record<DetailedDevTool["safetyRank"], number> = { "A+": 3, A: 2, "B+": 1 };

function starCount(tool: DetailedDevTool) {
  if (!tool.githubStars) return -1;
  const value = Number(tool.githubStars.replace(/[^0-9.]/g, ""));
  return Number.isFinite(value) ? value : -1;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "All">("All");
  const [pricingType, setPricingType] = useState<PricingType | "All">("All");
  const [noCard, setNoCard] = useState(false);
  const [beginner, setBeginner] = useState(false);
  const [safetyOnly, setSafetyOnly] = useState(false);
  const [sort, setSort] = useState<SortMode>("Highest Rated");
  const [selected, setSelected] = useState<DetailedDevTool | null>(null);

  useEffect(() => {
    const focusSearch = () => document.querySelector<HTMLInputElement>('input[aria-label="Search tools"]')?.focus();
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        focusSearch();
      } else if (event.key === "/" && !typing) {
        event.preventDefault();
        focusSearch();
      } else if (event.key === "Escape") {
        setSelected(null);
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const matches = tools.filter((tool) => {
      const matchesCategory = category === "All" || tool.category === category;
      const matchesPricing = pricingType === "All" || tool.pricingType === pricingType;
      const matchesCard = !noCard || tool.noCreditCardRequired;
      const matchesBeginner = !beginner || tool.targetAudience === "Beginner";
      const matchesSafety = !safetyOnly || tool.safetyRank === "A+";
      const searchable = [tool.name, tool.tagline, tool.description, tool.category, tool.pricingType]
        .join(" ").toLowerCase();
      return matchesCategory && matchesPricing && matchesCard && matchesBeginner && matchesSafety &&
        (!normalizedQuery || searchable.includes(normalizedQuery));
    });

    return matches.sort((a, b) => {
      if (sort === "Highest Rated") return b.userRating - a.userRating || b.totalReviewsCount - a.totalReviewsCount || a.name.localeCompare(b.name);
      if (sort === "Most Starred") return starCount(b) - starCount(a) || (Number(Boolean(b.githubRepoUrl)) - Number(Boolean(a.githubRepoUrl))) || a.name.localeCompare(b.name);
      if (sort === "Safety Score") return safetyScore[b.safetyRank] - safetyScore[a.safetyRank] || a.name.localeCompare(b.name);
      return a.name.localeCompare(b.name);
    });
  }, [query, category, pricingType, noCard, beginner, safetyOnly, sort]);

  const resetFilters = () => {
    setQuery("");
    setCategory("All");
    setPricingType("All");
    setNoCard(false);
    setBeginner(false);
    setSafetyOnly(false);
    setSort("Highest Rated");
  };

  return (
    <main>
      <nav className="nav" aria-label="Main navigation">
        <a className="brand" href="#" aria-label="Zero-Cost Dev Stack home">
          <span className="brand-mark"><Layers3 size={17} strokeWidth={2.5} /></span>
          <span>zero<span className="brand-dot">.</span>cost</span>
        </a>
        <div className="nav-links">
          <a href="#directory">Explore</a>
          <a href="#founder">Creator</a>
          <a href="#contribute">Contribute</a>
          <a className="github-link" href="https://github.com/shinuXcode/-awesome-free-stack" target="_blank" rel="noreferrer">
            <Github size={15} /> Star on GitHub
          </a>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-noise" aria-hidden="true" />
        <div className="hero-glow hero-glow-a" aria-hidden="true" />
        <div className="hero-glow hero-glow-b" aria-hidden="true" />
        <div className="hero-grid" aria-hidden="true" />
        <motion.div className="hero-content" initial="hidden" animate="show" variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.11, delayChildren: 0.12 } },
        }}>
          <motion.div className="eyebrow hero-eyebrow" variants={{ hidden: { y: 14, opacity: 0 }, show: { y: 0, opacity: 1 } }}>
            <Sparkles size={14} /> THE INDIE BUILDER'S FIELD GUIDE
          </motion.div>
          <motion.h1 variants={{ hidden: { y: 24, opacity: 0, filter: "blur(8px)" }, show: { y: 0, opacity: 1, filter: "blur(0px)", transition: { type: "spring", stiffness: 78, damping: 17 } } }}>
            Build without<br /><span>burning budget.</span>
          </motion.h1>
          <motion.p className="hero-copy" variants={{ hidden: { y: 14, opacity: 0 }, show: { y: 0, opacity: 1 } }}>
            A sharper way to discover the tools behind your next big idea. Compare free tiers, understand the trade-offs, and ship confidently.
          </motion.p>
          <motion.div className="hero-actions" variants={{ hidden: { y: 14, opacity: 0 }, show: { y: 0, opacity: 1 } }}>
            <a className="button-primary hero-button" href="#directory">Explore the stack <ArrowDownRight size={17} /></a>
            <a className="button-secondary hero-button" href="https://github.com/shinuXcode/-awesome-free-stack" target="_blank" rel="noreferrer"><Github size={17} /> View source</a>
          </motion.div>
          <motion.div className="hero-note" variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}>
            <Command size={13} /> Search instantly with <kbd>/</kbd> or <kbd>⌘ K</kbd>
          </motion.div>
        </motion.div>

        <motion.aside className="hero-dashboard" initial={{ opacity: 0, y: 24, rotate: 2 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ delay: 0.45, duration: 0.8, type: "spring" }} aria-label="Directory statistics">
          <div className="dashboard-top"><span className="dashboard-lamp" /><span className="dashboard-lamp" /><span className="dashboard-lamp" /><span className="dashboard-title">STACK / OVERVIEW</span><Sparkles size={14} /></div>
          <div className="dashboard-main"><span className="dashboard-kicker">YOUR NEXT BUILD STARTS HERE</span><strong>{String(tools.length).padStart(2, "0")}<small> tools</small></strong><span className="dashboard-rule" /></div>
          <div className="dashboard-metrics">
            <div><span>Categories</span><b>{categories.length}</b></div>
            <div><span>Open source</span><b>{tools.filter((tool) => tool.pricingType === "Open Source").length}</b></div>
            <div><span>No card needed*</span><b>{tools.filter((tool) => tool.noCreditCardRequired).length}</b></div>
          </div>
          <div className="dashboard-foot"><ShieldCheck size={13} /> Every listing includes trade-offs <span>↗</span></div>
        </motion.aside>

        <div className="hero-stamp"><span>BUILT FOR</span><b>the next<br />generation.</b><span>INDIE MAKERS · 2026</span></div>
        <div className="hero-bottomline"><span>01 / DISCOVER</span><span>Less guesswork. More building.</span><a href="#directory">Scroll to explore ↓</a></div>
      </section>

      <section className="directory section-wrap" id="directory">
        <div className="section-heading">
          <div>
            <span className="eyebrow"><span className="eyebrow-dot" /> THE DIRECTORY</span>
            <h2>Your stack, <span>sorted.</span></h2>
            <p>Honest starting points for your next product, prototype, or side project.</p>
          </div>
          <div className="directory-total"><strong>{filtered.length.toString().padStart(2, "0")}</strong><span>TOOLS FOUND</span></div>
        </div>

        <FilterBar
          query={query} setQuery={setQuery}
          category={category} setCategory={setCategory}
          pricingType={pricingType} setPricingType={setPricingType}
          noCard={noCard} setNoCard={setNoCard}
          beginner={beginner} setBeginner={setBeginner}
          safetyOnly={safetyOnly} setSafetyOnly={setSafetyOnly}
          sort={sort} setSort={setSort}
          categories={[...categories]}
        />

        <div className="results-meta"><span>{filtered.length === 1 ? "1 result" : `${filtered.length} results`}</span><span className="results-separator" /> <span>Cards open detailed tool profiles</span><button onClick={resetFilters}>Reset all ↗</button></div>
        <AnimatePresence mode="popLayout">
          <motion.div layout className="tool-grid">
            {filtered.map((tool, index) => (
              <ToolCard key={tool.id} tool={tool} index={index} onDetails={setSelected} />
            ))}
          </motion.div>
        </AnimatePresence>
        {filtered.length === 0 && (
          <motion.div className="empty-state" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Search size={26} /><h3>No matches this time.</h3><p>Try a broader keyword or clear a filter to widen the search.</p>
            <button className="button-secondary" onClick={resetFilters}>Clear all filters</button>
          </motion.div>
        )}
        <p className="data-note">* Signup requirements and free allowances can change. Ratings remain unlisted until real community reviews exist.</p>
      </section>

      <FounderSection />

      <section id="contribute" className="contribute section-wrap">
        <div className="contribute-symbol"><Github size={23} /></div>
        <div className="contribute-copy">
          <span className="eyebrow">BUILT IN PUBLIC</span>
          <h2>Make the next builder's life easier.</h2>
          <p>Help keep the directory useful. Submit a tool with official sources and let automated validation catch schema mistakes.</p>
        </div>
        <a className="button-primary" href="https://github.com/shinuXcode/-awesome-free-stack/edit/feat/zero-cost-stack-rebuild/data/tools.json" target="_blank" rel="noreferrer">Contribute a tool <ArrowUpRight size={16} /></a>
      </section>

      <footer>
        <a className="brand" href="#"><span className="brand-mark"><Layers3 size={16} /></span><span>zero<span className="brand-dot">.</span>cost</span></a>
        <p>Independent directory. Always verify pricing and terms at the source.</p>
        <div className="footer-links"><a href="https://github.com/shinuXcode/-awesome-free-stack" target="_blank" rel="noreferrer">GitHub</a><a href="#founder">Creator</a><span>MIT · Made for builders <Heart size={11} /></span></div>
      </footer>

      <ToolDetailsModal tool={selected} onClose={() => setSelected(null)} />
    </main>
  );
}
