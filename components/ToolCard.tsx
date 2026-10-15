"use client";

import { useState } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, Check, ExternalLink, Github, ShieldCheck, Star } from "lucide-react";
import type { DetailedDevTool } from "../lib/types";

type Props = { tool: DetailedDevTool; index: number; onDetails: (tool: DetailedDevTool) => void };

export default function ToolCard({ tool, index, onDetails }: Props) {
  const [logoFailed, setLogoFailed] = useState(false);
  const [copied, setCopied] = useState(false);
  const reduceMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateX = useSpring(useTransform(pointerY, [0, 1], [5.5, -5.5]), { stiffness: 230, damping: 25, mass: 0.5 });
  const rotateY = useSpring(useTransform(pointerX, [0, 1], [-5.5, 5.5]), { stiffness: 230, damping: 25, mass: 0.5 });

  const handlePointerMove = (event: React.MouseEvent<HTMLElement>) => {
    if (reduceMotion || window.matchMedia("(hover: none)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - bounds.left) / bounds.width);
    pointerY.set((event.clientY - bounds.top) / bounds.height);
  };
  const resetTilt = () => { pointerX.set(0.5); pointerY.set(0.5); };

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(tool.officialWebsiteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  const stars = tool.githubStars ? tool.githubStars : null;
  const hasRating = tool.userRating > 0 && tool.totalReviewsCount > 0;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10, scale: 0.97 }}
      transition={{ layout: { type: "spring", stiffness: 270, damping: 26 }, delay: Math.min(index % 9, 8) * 0.025 }}
      style={reduceMotion ? undefined : { rotateX, rotateY, transformPerspective: 1000 }}
      onMouseMove={handlePointerMove}
      onMouseLeave={resetTilt}
      className="tool-card"
    >
      <div className="card-topline"><span className="card-id">STACK / {String(index + 1).padStart(2, "0")}</span>
        {tool.badge && <span className={`tool-badge badge-${tool.badge.toLowerCase().replaceAll(" ", "-")}`}>{tool.badge}</span>}
      </div>

      <div className="tool-identity">
        <div className="tool-logo-wrap">
          {!logoFailed ? <img src={tool.logoUrl} alt="" loading="lazy" onError={() => setLogoFailed(true)} /> : <span className="tool-logo-fallback">{tool.name.slice(0, 1).toUpperCase()}</span>}
        </div>
        <div className="tool-heading">
          <span className="category-label">{tool.category}</span>
          <button className="tool-title" onClick={() => onDetails(tool)}>{tool.name}<ArrowUpRight size={15} /></button>
          <p className="tool-tagline">{tool.tagline}</p>
        </div>
      </div>

      <p className="tool-description">{tool.description}</p>

      <div className="card-rating-row">
        <div className="rating-display"><Star size={14} fill={hasRating ? "currentColor" : "none"} /><b>{hasRating ? tool.userRating.toFixed(1) : "Unrated"}</b><span>{tool.totalReviewsCount} reviews</span></div>
        {stars ? <a className="star-count" href={tool.githubRepoUrl} target="_blank" rel="noreferrer"><Github size={13} /> {stars}</a> : tool.githubRepoUrl ? <a className="star-count" href={tool.githubRepoUrl} target="_blank" rel="noreferrer"><Github size={13} /> Repo</a> : null}
      </div>

      <div className="card-facts">
        <div><span>PRICING</span><b>{tool.pricingType}</b></div>
        <div><span>SIGNUP</span><b className={tool.noCreditCardRequired ? "fact-positive" : "fact-neutral"}>{tool.noCreditCardRequired ? "No card listed" : "Card may be needed"}</b></div>
      </div>

      <div className="limit"><span>FREE TIER / REALITY CHECK</span><p>{tool.freeTierLimit}</p></div>

      <div className="card-bottom">
        <span className="rank"><ShieldCheck size={14} />{tool.safetyRank} signal</span>
        <span className="difficulty">{tool.targetAudience}</span>
      </div>
      <div className="card-actions">
        <button onClick={() => onDetails(tool)} className="button-secondary">Explore details <ArrowUpRight size={13} /></button>
        <a className="card-visit" href={tool.officialWebsiteUrl} target="_blank" rel="noreferrer" aria-label={`Visit ${tool.name} official website`}><ExternalLink size={16} /></a>
        <button className="card-copy" onClick={copyUrl} aria-label={copied ? "URL copied" : "Copy website URL"}>{copied ? <Check size={15} /> : <span>Copy</span>}</button>
      </div>
      <AnimatePresence>{copied && <motion.span className="copy-toast" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>Link copied</motion.span>}</AnimatePresence>
    </motion.article>
  );
}
