"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Check, Copy, Github, Globe2, Linkedin, Sparkles, Twitter } from "lucide-react";

const portfolioUrl = "https://mohammad-sadab-portfolio-v2.vercel.app/";
const portfolioRepo = "https://github.com/shinuXcode/sadab-portfolio";
const sourceUrl = "https://github.com/shinuXcode/-awesome-free-stack";

export default function FounderSection() {
  const [copied, setCopied] = useState(false);
  async function copyProjectLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section id="founder" className="founder-section section-wrap">
      <div className="founder-heading">
        <div><span className="eyebrow"><span className="eyebrow-dot" /> THE HUMAN BEHIND THE STACK</span>
          <h2>Built by an indie developer.<br /><span>For the ones building next.</span></h2>
        </div>
        <span className="founder-index">CREATOR NOTE / 001</span>
      </div>

      <motion.div className="founder-panel" initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ type: "spring", stiffness: 90, damping: 20 }}>
        <div className="founder-profile">
          <div className="founder-avatar"><span>S</span><i><Sparkles size={14} /></i></div>
          <span className="founder-overline">INDIE BUILDER · OPEN WEB</span>
          <h3>Sadab <span>@shinuXcode</span></h3>
          <p>Building thoughtful software, experimenting with interfaces, and sharing practical tools for developers and small creators.</p>
          <div className="founder-quote">“Make the powerful stuff easier to discover — and easier to afford.”</div>
          <div className="founder-socials">
            <a href="https://github.com/shinuXcode" target="_blank" rel="noreferrer" aria-label="GitHub profile"><Github size={17} /></a>
            <a href="https://x.com/shinuxcode" target="_blank" rel="noreferrer" aria-label="X profile"><Twitter size={17} /></a>
            <a href={portfolioUrl} target="_blank" rel="noreferrer" aria-label="Personal portfolio website"><Globe2 size={17} /></a>
            <a className="social-unconfigured" href="https://www.linkedin.com/" target="_blank" rel="noreferrer" aria-label="LinkedIn homepage; creator profile link not configured" title="LinkedIn profile URL not configured"><Linkedin size={17} /></a>
          </div>
          <div className="founder-linkhub">
            <a href={portfolioUrl} target="_blank" rel="noreferrer"><Globe2 size={14} /><span><b>Personal Website</b><small>mohammad-sadab-portfolio-v2.vercel.app</small></span><ArrowUpRight size={14} /></a>
            <a href={portfolioUrl} target="_blank" rel="noreferrer"><Sparkles size={14} /><span><b>Portfolio Link</b><small>Open Sadab's portfolio</small></span><ArrowUpRight size={14} /></a>
          </div>
          <button type="button" className="support-button" onClick={copyProjectLink}>{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? "Project link copied" : "Support this project"}<ArrowUpRight size={15} /></button>
        </div>

        <div className="portfolio-showcase">
          <div className="showcase-topline"><span>PORTFOLIO / SELECTED WORK</span><span className="live-indicator"><i /> LINKED PROJECTS</span></div>
          <div className="portfolio-preview-grid">
            <motion.a className="portfolio-preview preview-primary" href={portfolioUrl} target="_blank" rel="noreferrer" whileHover={{ y: -5, scale: 1.012 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
              <div className="preview-browser"><span /><span /><span /><small>mohammad-sadab-portfolio-v2.vercel.app</small><ArrowUpRight size={13} /></div>
              <div className="preview-canvas preview-canvas-portfolio">
                <span className="preview-mini-brand">SADAB<span>.</span>DEV</span>
                <span className="preview-mini-eyebrow">DESIGN · ENGINEERING · CURIOSITY</span>
                <b>Ideas into<br /><em>interactive things.</em></b>
                <span className="preview-mini-rule" />
                <span className="preview-mini-tags">React / Product / UI</span>
                <span className="preview-orb" />
              </div>
              <div className="preview-label"><div><b>Personal portfolio</b><span>Live deployment · external link</span></div><ArrowUpRight size={17} /></div>
            </motion.a>

            <motion.a className="portfolio-preview preview-secondary" href={portfolioRepo} target="_blank" rel="noreferrer" whileHover={{ y: -5, scale: 1.012 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
              <div className="preview-browser"><span /><span /><span /><small>github.com/shinuXcode/sadab-portfolio</small><ArrowUpRight size={13} /></div>
              <div className="preview-canvas preview-canvas-source">
                <div className="source-nav"><Github size={15} /><span>shinuXcode / <b>sadab-portfolio</b></span><i>Public repo</i></div>
                <div className="source-repo-title"><b>Sadab.dev</b><span>Portfolio + Control Room</span></div>
                <div className="source-code"><span>01</span><code><i>const</i> idea = <em>"make it useful"</em>;</code><span>02</span><code><i>ship</i>(idea);</code></div>
                <div className="source-tags"><span>React</span><span>Vercel</span><span>CMS</span></div>
              </div>
              <div className="preview-label"><div><b>Portfolio source</b><span>Repository, architecture & projects</span></div><ArrowUpRight size={17} /></div>
            </motion.a>
          </div>
          <div className="showcase-foot"><span><Sparkles size={13} /> Built in public, improved with every release.</span><a href={sourceUrl} target="_blank" rel="noreferrer">Explore this project <ArrowDownRight size={14} /></a></div>
        </div>
      </motion.div>
      <p className="founder-disclaimer">The live portfolio link may be subject to its deployment access settings. The source repository is available separately.</p>
    </section>
  );
}
