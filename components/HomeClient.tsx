"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Code2, Compass, Github, Layers3, LoaderCircle, Search, ShieldCheck, Sparkles, Star, X } from "lucide-react";

import type { Category, DetailedDevTool } from "../lib/types";
import { categories } from "../lib/types";
import ToolCard from "../components/ToolCard";
import ToolDetailsModal from "./ToolDetailsModal";

const cardVariants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

type HomeClientProps = { featured: DetailedDevTool[]; recentlyAdded: DetailedDevTool[]; categoryCounts: Partial<Record<Category, number>>; totalTools: number; openSourceCount: number; noCardCount: number };

export default function HomeClient({ featured, recentlyAdded, categoryCounts, totalTools, openSourceCount, noCardCount }: HomeClientProps) {
  const [selectedTool, setSelectedTool] = useState<DetailedDevTool | null>(null);
  const [homeQuery, setHomeQuery] = useState("");
  const [searchResults, setSearchResults] = useState<DetailedDevTool[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    const term = homeQuery.trim();
    if (term.length < 2) {
      setSearchResults([]);
      setSearchError("");
      setSearchLoading(false);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearchLoading(true);
      setSearchError("");
      try {
        const response = await fetch("/api/tools?q=" + encodeURIComponent(term) + "&limit=8", {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
        if (!response.ok) throw new Error("Search failed");
        const data = await response.json() as { tools: DetailedDevTool[]; total: number };
        if (!controller.signal.aborted) setSearchResults(data.tools);
      } catch {
        if (!controller.signal.aborted) setSearchError("Search is temporarily unavailable. Try the full directory.");
      } finally {
        if (!controller.signal.aborted) setSearchLoading(false);
      }
    }, 180);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [homeQuery]);

  function submitHomeSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = homeQuery.trim();
    if (query) window.location.href = "/tools?q=" + encodeURIComponent(query);
  }
  return (
    <main id="main-content">
      <section className="hero home-hero">
        <div className="hero-noise" aria-hidden="true" /><div className="hero-glow hero-glow-a" aria-hidden="true" /><div className="hero-glow hero-glow-b" aria-hidden="true" /><div className="hero-grid" aria-hidden="true" />
        <motion.div className="hero-content" initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.06 } } }}>
          <motion.div className="eyebrow hero-eyebrow" variants={cardVariants}><Sparkles size={14} /> THE INDIE BUILDER'S FIELD GUIDE</motion.div>
          <motion.h1 variants={{ hidden: { y: 22, opacity: 0, filter: "blur(6px)" }, show: { y: 0, opacity: 1, filter: "blur(0px)", transition: { type: "spring", stiffness: 78, damping: 18 } } }}>Build without<br /><span>burning budget.</span></motion.h1>
          <motion.p className="hero-copy" variants={cardVariants}>A sharper way to discover the tools behind your next big idea. Compare free tiers, understand the trade-offs, and ship confidently.</motion.p>
          <motion.div className="hero-actions" variants={cardVariants}>
            <Link className="button-primary hero-button" href="/tools">Explore all tools <ArrowDownRight size={17} /></Link>
            <Link className="button-secondary hero-button" href="/guide"><Compass size={16} /> How it works</Link>
          </motion.div>
          <motion.div className="hero-note" variants={cardVariants}><Code2 size={13} /> Built for curious developers and small creators.</motion.div>
        </motion.div>
        <motion.aside className="hero-dashboard" initial={{ opacity: 0, y: 20, rotate: 2 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ delay: 0.25, duration: 0.7, type: "spring", stiffness: 80, damping: 18 }} aria-label="Directory statistics">
          <div className="dashboard-top"><span className="dashboard-lamp" /><span className="dashboard-lamp" /><span className="dashboard-lamp" /><span className="dashboard-title">STACK / OVERVIEW</span><Sparkles size={14} /></div>
          <div className="dashboard-main"><span className="dashboard-kicker">YOUR NEXT BUILD STARTS HERE</span><strong>{String(totalTools).padStart(2, "0")}<small> tools</small></strong><span className="dashboard-rule" /></div>
          <div className="dashboard-metrics"><div><span>Categories</span><b>{categories.length}</b></div><div><span>Open-source</span><b>{openSourceCount}</b></div><div><span>No card listed*</span><b>{noCardCount}</b></div></div>
          <div className="dashboard-foot"><ShieldCheck size={13} /> Trade-offs included on every listing <span>↗</span></div>
        </motion.aside>
        <div className="hero-stamp"><span>BUILT FOR</span><b>the next<br />generation.</b><span>INDIE MAKERS · 2026</span></div>
        <div className="hero-bottomline"><span>01 / DISCOVER</span><span>Less guesswork. More building.</span><Link href="/categories">Browse categories ↓</Link></div>
      </section>

      <section className="section-wrap home-search-section" aria-label="Search the tool catalog">
        <div className="home-search-heading">
          <span className="eyebrow"><Search size={13} /> FIND A TOOL FAST</span>
          <h2>What are you <span>building?</span></h2>
          <p>Search {totalTools.toLocaleString("en-US")} listings by name, category, capability or project need.</p>
        </div>
        <form className="home-search-form" onSubmit={submitHomeSearch}>
          <Search size={19} aria-hidden="true" />
          <input
            type="search"
            value={homeQuery}
            onChange={(event) => setHomeQuery(event.target.value)}
            placeholder="Try “database”, “free hosting”, “AI API”…"
            aria-label="Search tools"
            autoComplete="off"
          />
          {homeQuery && <button type="button" className="home-search-clear" onClick={() => setHomeQuery("")} aria-label="Clear search"><X size={16} /></button>}
          <button type="submit" className="button-primary">Search directory <ArrowUpRight size={14} /></button>
        </form>
        <div className="home-search-hints"><span>Popular:</span>{["Database", "AI tools", "Free hosting", "Design", "Open source"].map((hint) => <button type="button" key={hint} onClick={() => setHomeQuery(hint)}>{hint}</button>)}</div>
        {searchLoading && <p className="home-search-status" role="status"><LoaderCircle size={14} className="spin" /> Searching catalog…</p>}
        {searchError && <p className="home-search-status" role="status">{searchError}</p>}
        {homeQuery.trim().length >= 2 && !searchLoading && !searchError && <div className="home-search-results">
          <div className="home-search-results-head"><span>{searchResults.length ? "MATCHING LISTINGS" : "NO QUICK MATCHES"}</span><button type="button" onClick={() => { if (homeQuery.trim()) window.location.href = "/tools?q=" + encodeURIComponent(homeQuery.trim()); }}>View all results <ArrowUpRight size={12} /></button></div>
          {searchResults.length ? <div className="tool-grid">{searchResults.slice(0, 6).map((tool, index) => <ToolCard key={tool.id} tool={tool} index={index} onDetails={setSelectedTool} />)}</div> : <p>Try a shorter term, a category name, or open the full directory search.</p>}
        </div>}
      </section>

      <section className="section-wrap workbench-promo-section">
        <div className="section-heading"><div><span className="eyebrow"><span className="eyebrow-dot" /> FROM DISCOVERY TO DEPLOYMENT</span><h2>More than a <span>directory.</span></h2><p>Compare choices, draft an architecture, export your stack, or suggest a resource to the community.</p></div></div>
        <div className="workbench-promo-grid">
          <Link className="workbench-promo-card" href="/compare"><span>01 / DECIDE</span><b>Side-by-side compare</b><p>Review free-tier notes, pricing labels, signup-card flags and safety signals.</p><ArrowUpRight size={17} /></Link>
          <Link className="workbench-promo-card" href="/stack-lab"><span>02 / DESIGN</span><b>Stack Lab + architecture</b><p>Generate a starting stack, save choices, and export README, JSON or SVG.</p><ArrowUpRight size={17} /></Link>
          <Link className="workbench-promo-card" href="/alternatives"><span>03 / SAVE</span><b>Zero-dollar alternatives</b><p>Find open-source or free-tier catalog candidates to evaluate.</p><ArrowUpRight size={17} /></Link>
          <Link className="workbench-promo-card" href="/submit"><span>04 / CONTRIBUTE</span><b>Submit a tool</b><p>Send a pre-filled GitHub issue with official links and free-tier details.</p><ArrowUpRight size={17} /></Link>
        </div>
      </section>

      <section className="section-wrap home-intro">
        <div className="section-heading"><div><span className="eyebrow"><span className="eyebrow-dot" /> START WITH A BETTER STACK</span><h2>The right tool.<br /><span>Less noise.</span></h2><p>Explore a practical shortlist or jump straight into a category.</p></div><Link className="text-link" href="/tools">Full directory <ArrowUpRight size={15} /></Link></div>
        <div className="quick-category-grid">
          {categories.map((category, index) => {
            const count = categoryCounts[category] || 0;
            const icons = [Layers3, Code2, ShieldCheck, Sparkles, Compass, Github, Code2, Star];
            const Icon = icons[index] || Layers3;
            return <motion.div key={category} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ delay: index * 0.035 }}>
              <Link href={`/categories#${encodeURIComponent(category.toLowerCase().replaceAll(" & ", "-").replaceAll(" ", "-"))}`} className="quick-category"><span className="quick-category-icon"><Icon size={17} /></span><span><b>{category}</b><small>{count} curated listings</small></span><ArrowUpRight size={15} className="quick-category-arrow" /></Link>
            </motion.div>;
          })}
        </div>
      </section>

      <section className="section-wrap featured-section">
        <div className="section-heading"><div><span className="eyebrow"><span className="eyebrow-dot" /> NEWLY ADDED</span><h2>More tools, <span>more possibilities.</span></h2><p>{totalTools.toLocaleString("en-US")} resources across development, creative work, AI, open-source apps, operating systems, and more. The catalog is designed to refresh as new resources are found and reviewed.</p></div><Link className="text-link" href="/tools?sort=recent">Browse all new additions <ArrowUpRight size={15} /></Link></div>
        <motion.div className="tool-grid" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.08 }} variants={{ hidden: {}, show: { transition: { staggerChildren: 0.045 } } }}>
          {recentlyAdded.map((tool, index) => <motion.div key={tool.id} variants={cardVariants}><ToolCard tool={tool} index={index} onDetails={setSelectedTool} /></motion.div>)}
        </motion.div>
      </section>

      <section className="section-wrap featured-section">
        <div className="section-heading"><div><span className="eyebrow"><span className="eyebrow-dot" /> THE STARTER STACK</span><h2>Good places <span>to start.</span></h2><p>A few familiar entry points. Open a profile to inspect the real trade-offs.</p></div><div className="directory-total"><strong>{featured.length.toString().padStart(2, "0")}</strong><span>EDITOR'S PICKS</span></div></div>
        <motion.div className="tool-grid" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.08 }} variants={{ hidden: {}, show: { transition: { staggerChildren: 0.055 } } }}>
          {featured.map((tool, index) => <motion.div key={tool.id} variants={cardVariants}><ToolCard tool={tool} index={index} onDetails={setSelectedTool} /></motion.div>)}
        </motion.div>
        <div className="center-cta"><Link className="button-primary" href="/tools">Explore all {totalTools} tools <ArrowRight size={15} /></Link></div>
      </section>

      <section className="home-principles section-wrap">
        <div><span className="eyebrow">THE DIRECTORY PROMISE</span><h2>Helpful, not hype.</h2><p>Free plans change. Ratings need real reviews. Privacy notes need evidence. We make the caveats part of the discovery process.</p><Link className="text-link" href="/guide">Read our approach <ArrowUpRight size={15} /></Link></div>
        <div className="principle-list"><div><span>01</span><b>Transparent trade-offs</b><p>Each profile explains its free-tier caveats and where to verify them.</p></div><div><span>02</span><b>Evidence before ratings</b><p>New entries stay unrated until genuine review data exists.</p></div><div><span>03</span><b>Community maintained</b><p>A strict schema check catches mistakes before contributions are merged.</p></div></div>
      </section>
      <section className="home-creator-banner"><div><span className="eyebrow">BUILT BY AN INDIE DEVELOPER</span><h2>Made for people building<br /><span>their first big thing.</span></h2><p>Meet Sadab and see the projects behind the directory.</p></div><Link className="button-primary" href="/creator">Meet the creator <ArrowUpRight size={15} /></Link></section>
      <ToolDetailsModal tool={selectedTool} onClose={() => setSelectedTool(null)} />
    </main>
  );
}
