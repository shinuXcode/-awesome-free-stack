"use client";

import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, BookOpen, CheckCircle2, ExternalLink, Github, Globe2, ShieldCheck, Star, X } from "lucide-react";
import type { DetailedDevTool } from "../lib/types";
import GitHubHealth from "./GitHubHealth";
import { riskLabels } from "../lib/stack";

type Props = { tool: DetailedDevTool | null; onClose: () => void };

export default function ToolDetailsModal({ tool, onClose }: Props) {
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    if (!tool) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [tool]);

  const hasRating = Boolean(tool && tool.userRating > 0 && tool.totalReviewsCount > 0);
  return (
    <AnimatePresence>
      {tool && (
        <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-label={tool.name + " details"}
            className="details-modal"
            initial={reduceMotion ? { opacity: 0 } : { x: "8vw", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { x: "8vw", opacity: 0 }}
            transition={{ type: "spring", stiffness: 250, damping: 28 }}
            drag={reduceMotion ? false : "y"}
            dragDirectionLock
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.8 }}
            onDragEnd={(_, info) => { if (info.offset.y > 115 || info.velocity.y > 750) onClose(); }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-drag-handle" aria-hidden="true"><span /></div>
            <div className="modal-head">
              <div className="modal-logo">{tool.name.slice(0, 1).toUpperCase()}</div>
              <div className="modal-title-block"><span className="category-label">{tool.category}</span><h2>{tool.name}</h2><p>{tool.tagline}</p></div>
              <button className="modal-close" onClick={onClose} aria-label="Close details"><X size={19} /></button>
            </div>

            <div className="modal-summary">
              <div className="modal-rating"><Star size={17} fill={hasRating ? "currentColor" : "none"} /><b>{hasRating ? tool.userRating.toFixed(1) : "Not rated"}</b><span>{tool.totalReviewsCount} community reviews</span></div>
              <span className={`modal-safety safety-${tool.safetyRank.replace("+", "plus")}`}><ShieldCheck size={14} /> {tool.safetyRank} community signal</span>
              {tool.badge && <span className="tool-badge">{tool.badge}</span>}
            </div>

            <p className="modal-description">{tool.description}</p>
            <div className="modal-info-grid">
              <div><span>PRICING MODEL</span><b>{tool.pricingType}</b></div>
              <div><span>SKILL LEVEL</span><b>{tool.targetAudience}</b></div>
              <div><span>SIGNUP CARD</span><b>{tool.creditCardRequiredAtSignup ? "Listed as required" : "Not listed as required"}</b></div>
            </div>

            <section className="modal-section free-tier-section">
              <div className="modal-section-heading"><span className="modal-section-icon"><CheckCircle2 size={16} /></span><div><h3>Free-tier reality check</h3><p>Read limits before you commit.</p></div></div>
              <p>{tool.freeTierLimit}</p>
              <div className="detail-risk-list">{riskLabels(tool).map((label) => <span key={label}><ShieldCheck size={12} /> {label}</span>)}</div>
              <p className="modal-warning">Plans and signup checks change. Confirm the current pricing and terms on the official provider site; this directory is not a billing guarantee.</p>
            </section>

            <section className="modal-section">
              <div className="modal-section-heading"><span className="modal-section-icon"><Layers3Icon /></span><div><h3>How it works</h3><p>A practical architecture overview.</p></div></div>
              <p>{tool.howItWorks}</p>
              <div className="architecture-flow" aria-label="Typical integration flow">
                <span>Your app</span><i>→</i><span>API / SDK</span><i>→</i><span>{tool.name}</span><i>→</i><span>Response</span>
              </div>
            </section>

            <section className="modal-section">
              <div className="modal-section-heading"><span className="modal-section-icon"><BookOpen size={16} /></span><div><h3>Beginner quickstart</h3><p>Build a safe first integration.</p></div></div>
              <ol className="quickstart-list">{tool.howToUseGuide.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, "0")}</span><p>{step}</p></li>)}</ol>
            </section>

            <section className="modal-section privacy-section">
              <div className="modal-section-heading"><span className="modal-section-icon"><ShieldCheck size={16} /></span><div><h3>Security & privacy notes</h3><p>Review signals, not a certification.</p></div></div>
              <div className="privacy-facts"><div><span>Source model</span><b>{tool.securityDetails.isOpaqueOrOpenSource}</b></div><div><span>Safety signal</span><b>{tool.safetyRank}</b></div><div><span>Certifications recorded</span><b>{tool.securityDetails.certifications.length ? tool.securityDetails.certifications.join(", ") : "None verified in directory"}</b></div></div>
              <p>{tool.securityDetails.dataPrivacyScore}</p>
              <p className="modal-warning">A community signal is not an audit or guarantee. Evaluate access controls, data retention, subprocessors, and security documentation for your own use case.</p>
            </section>

            {tool.githubRepoUrl && <GitHubHealth repoUrl={tool.githubRepoUrl} />}

            <div className="modal-links">
              <a className="button-primary" href={tool.officialWebsiteUrl} target="_blank" rel="noreferrer"><Globe2 size={15} /> Official site <ExternalLink size={13} /></a>
              <a className="button-secondary" href={tool.docsUrl} target="_blank" rel="noreferrer"><BookOpen size={15} /> Documentation <ArrowUpRight size={13} /></a>
              {tool.githubRepoUrl && <a className="button-secondary" href={tool.githubRepoUrl} target="_blank" rel="noreferrer"><Github size={15} /> GitHub repo <ArrowUpRight size={13} /></a>}
            </div>
            <div className="modal-bottomnote"><span>STACK PROFILE / {tool.id.toUpperCase()}</span><button onClick={onClose}>Close details <X size={13} /></button></div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Layers3Icon() {
  return <span className="architecture-icon">↔</span>;
}
