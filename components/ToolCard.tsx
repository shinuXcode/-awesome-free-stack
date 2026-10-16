"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ArrowUpRight, Check, Clipboard, ExternalLink, Github, GitCompareArrows, Heart, Share2, ShieldCheck, Sparkles, Star, ThumbsUp } from "lucide-react";
import type { DetailedDevTool } from "../lib/types";
import { buildSetupPrompt, readLocalVotes, readSavedStack, riskLabels, writeLocalVotes, writeSavedStack } from "../lib/stack";

type Props = { tool: DetailedDevTool; index: number; onDetails: (tool: DetailedDevTool) => void };

export default function ToolCard({ tool, index, onDetails }: Props) {
  const [logoFailed, setLogoFailed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyNotice, setCopyNotice] = useState("");
  const [shareToast, setShareToast] = useState("");
  const [saved, setSaved] = useState(false);
  const [voted, setVoted] = useState(false);

  useEffect(() => {
    setSaved(readSavedStack().some((item) => item.id === tool.id));
    setVoted(readLocalVotes().includes(tool.id));
  }, [tool.id]);

  async function copyText(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopyNotice(label);
    } catch {
      setCopyNotice("Clipboard unavailable in this browser");
    }
    window.setTimeout(() => setCopyNotice(""), 1800);
  }

  async function copyUrl() {
    await copyText(tool.officialWebsiteUrl, "Official link copied");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  function toggleSaved() {
    const current = readSavedStack();
    const next = current.some((item) => item.id === tool.id)
      ? current.filter((item) => item.id !== tool.id)
      : [...current, tool];
    if (writeSavedStack(next)) {
      setSaved(next.some((item) => item.id === tool.id));
      setCopyNotice(next.some((item) => item.id === tool.id) ? "Added to My Tech Stack" : "Removed from My Tech Stack");
      window.setTimeout(() => setCopyNotice(""), 1800);
    } else {
      setCopyNotice("Browser storage unavailable");
      window.setTimeout(() => setCopyNotice(""), 1800);
    }
  }

  function toggleVote() {
    const current = readLocalVotes();
    const next = current.includes(tool.id) ? current.filter((id) => id !== tool.id) : [...current, tool.id];
    writeLocalVotes(next);
    setVoted(next.includes(tool.id));
    setCopyNotice(next.includes(tool.id) ? "Local vote saved in this browser" : "Local vote removed");
    window.setTimeout(() => setCopyNotice(""), 1800);
  }

  async function shareTool() {
    const profileUrl = new URL("/tools/" + encodeURIComponent(tool.id), window.location.origin).toString();
    const shareText = [
      tool.tagline,
      "Category: " + tool.category,
      "Pricing: " + tool.pricingType,
      "Free-tier limits: " + tool.freeTierLimit,
      "Safety signal: " + tool.safetyRank + " (not a security audit)",
      tool.description,
      "Official website: " + tool.officialWebsiteUrl,
      "Documentation: " + tool.docsUrl,
      tool.githubRepoUrl ? "Source repository: " + tool.githubRepoUrl : "",
    ].filter(Boolean).join("\n");
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title: tool.name + " — Zero-Cost Dev Stack", text: shareText, url: profileUrl });
        return;
      }
      await navigator.clipboard.writeText(shareText + "\nDirectory profile: " + profileUrl);
      setShareToast("Share details copied");
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(shareText + "\nDirectory profile: " + profileUrl);
        setShareToast("Share details copied");
      } catch {
        setShareToast("Sharing unavailable in this browser");
      }
    }
    window.setTimeout(() => setShareToast(""), 1800);
  }

  const stars = tool.githubStars ? tool.githubStars : null;
  const hasRating = tool.userRating > 0 && tool.totalReviewsCount > 0;
  const caveat = riskLabels(tool)[0];

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10, scale: 0.97 }}
      transition={{ layout: { type: "spring", stiffness: 320, damping: 32 }, opacity: { duration: 0.22 }, y: { duration: 0.28 }, delay: Math.min(index % 6, 5) * 0.018 }}
      className="tool-card"
      onClick={(event) => {
        const target = event.target as HTMLElement;
        if (target.closest("a, button, input, select, textarea")) return;
        onDetails(tool);
      }}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onDetails(tool);
        }
      }}
      tabIndex={0}
      aria-label={"Open details for " + tool.name}
    >
      <div className="card-topline"><span className="card-id">STACK / {String(index + 1).padStart(2, "0")}</span>
        {tool.badge && <span className={"tool-badge badge-" + tool.badge.toLowerCase().replaceAll(" ", "-")}>{tool.badge}</span>}
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
        <div><span>SIGNUP CARD</span><b className={tool.noCreditCardRequired ? "fact-positive" : "fact-neutral"}>{tool.creditCardRequiredAtSignup ? "Listed as required" : tool.noCreditCardRequired ? "Not listed as required" : "Not confirmed"}</b></div>
      </div>

      <div className="limit card-free-limit"><span><b>FREE TIER LIMITS</b> / VERIFY BEFORE BUILDING</span><p>{tool.freeTierLimit}</p></div>

      <div className="card-signal-row">
        <span className={"signal-chip safety-" + tool.safetyRank.replace("+", "plus")}><ShieldCheck size={13} /> SAFETY {tool.safetyRank} <small>signal</small></span>
        <span className="caveat-chip" title="Labels are detected from the catalog's free-tier note; an absent warning does not mean there is no risk."><AlertTriangle size={12} /> {caveat}</span>
      </div>

      <div className="card-bottom">
        <span className="rank"><ShieldCheck size={14} />{tool.safetyRank} community signal — not an audit</span>
        <span className="difficulty">{tool.targetAudience}</span>
      </div>
      <div className="card-actions">
        <button type="button" onClick={() => onDetails(tool)} className="button-secondary">Explore details <ArrowUpRight size={13} /></button>
        <a className="card-visit" href={tool.officialWebsiteUrl} target="_blank" rel="noreferrer" aria-label={"Visit " + tool.name + " official website"}><ExternalLink size={16} /></a>
        <button type="button" className="card-copy" onClick={copyUrl} aria-label={copied ? "Official website URL copied" : "Copy official website URL"}>{copied ? <Check size={15} /> : <span>Copy</span>}</button>
        <button type="button" className="card-copy card-share" onClick={shareTool} aria-label={"Share " + tool.name + " with its directory metadata"} title="Share tool details"><Share2 size={15} /></button>
      </div>
      <div className="card-utility-actions" aria-label={tool.name + " quick actions"}>
        <button type="button" onClick={toggleSaved} aria-pressed={saved} title="Saved only in this browser" className={saved ? "quick-action-active" : ""}><Heart size={13} fill={saved ? "currentColor" : "none"} />{saved ? "Saved" : "Save stack"}</button>
        <button type="button" onClick={() => void copyText(tool.freeTierLimit, "Free-tier limit copied")} title="Copy the listed free-tier note"><Clipboard size={13} />Copy limits</button>
        <button type="button" onClick={() => void copyText(buildSetupPrompt(tool), "AI setup prompt copied")} title="Copy a secure setup prompt for your coding assistant"><Sparkles size={13} />AI prompt</button>
        <button type="button" onClick={() => { window.location.href = "/compare?tool=" + encodeURIComponent(tool.id); }} title="Open comparison and preselect this tool"><GitCompareArrows size={13} />Compare</button>
        <button type="button" onClick={toggleVote} aria-pressed={voted} title="A private, browser-local vote; not a shared community count" className={voted ? "quick-action-active" : ""}><ThumbsUp size={13} />{voted ? "Voted" : "Vote"}</button>
      </div>
      <AnimatePresence>{(copied || copyNotice) && <motion.span className="copy-toast" role="status" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>{copyNotice || "Official link copied"}</motion.span>}</AnimatePresence>
      <AnimatePresence>{shareToast && <motion.span className="copy-toast" role="status" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>{shareToast}</motion.span>}</AnimatePresence>
    </motion.article>
  );
}
