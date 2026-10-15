"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Code2, Compass, Github, Layers3, ShieldCheck, Sparkles, Star } from "lucide-react";

import type { Category, DetailedDevTool } from "../lib/types";
import { categories } from "../lib/types";
import ToolCard from "../components/ToolCard";

const cardVariants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

type HomeClientProps = { featured: DetailedDevTool[]; recentlyAdded: DetailedDevTool[]; categoryCounts: Partial<Record<Category, number>>; totalTools: number; openSourceCount: number; noCardCount: number };

export default function HomeClient({ featured, recentlyAdded, categoryCounts, totalTools, openSourceCount, noCardCount }: HomeClientProps) {
  return (
    <main>
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
          {recentlyAdded.map((tool, index) => <motion.div key={tool.id} variants={cardVariants}><ToolCard tool={tool} index={index} onDetails={(item) => { window.location.href = `/tools/${item.id}`; }} /></motion.div>)}
        </motion.div>
      </section>

      <section className="section-wrap featured-section">
        <div className="section-heading"><div><span className="eyebrow"><span className="eyebrow-dot" /> THE STARTER STACK</span><h2>Good places <span>to start.</span></h2><p>A few familiar entry points. Open a profile to inspect the real trade-offs.</p></div><div className="directory-total"><strong>{featured.length.toString().padStart(2, "0")}</strong><span>EDITOR'S PICKS</span></div></div>
        <motion.div className="tool-grid" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.08 }} variants={{ hidden: {}, show: { transition: { staggerChildren: 0.055 } } }}>
          {featured.map((tool, index) => <motion.div key={tool.id} variants={cardVariants}><ToolCard tool={tool} index={index} onDetails={(item) => { window.location.href = `/tools/${item.id}`; }} /></motion.div>)}
        </motion.div>
        <div className="center-cta"><Link className="button-primary" href="/tools">Explore all {totalTools} tools <ArrowRight size={15} /></Link></div>
      </section>

      <section className="home-principles section-wrap">
        <div><span className="eyebrow">THE DIRECTORY PROMISE</span><h2>Helpful, not hype.</h2><p>Free plans change. Ratings need real reviews. Privacy notes need evidence. We make the caveats part of the discovery process.</p><Link className="text-link" href="/guide">Read our approach <ArrowUpRight size={15} /></Link></div>
        <div className="principle-list"><div><span>01</span><b>Transparent trade-offs</b><p>Each profile explains its free-tier caveats and where to verify them.</p></div><div><span>02</span><b>Evidence before ratings</b><p>New entries stay unrated until genuine review data exists.</p></div><div><span>03</span><b>Community maintained</b><p>A strict schema check catches mistakes before contributions are merged.</p></div></div>
      </section>
      <section className="home-creator-banner"><div><span className="eyebrow">BUILT BY AN INDIE DEVELOPER</span><h2>Made for people building<br /><span>their first big thing.</span></h2><p>Meet Sadab and see the projects behind the directory.</p></div><Link className="button-primary" href="/creator">Meet the creator <ArrowUpRight size={15} /></Link></section>
    </main>
  );
}
