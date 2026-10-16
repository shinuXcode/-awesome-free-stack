"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, GitCompareArrows, Plus, Search, X } from "lucide-react";
import type { DetailedDevTool } from "../lib/types";

type Props = { initialTool: DetailedDevTool | null };
type SearchResult = { tools: DetailedDevTool[]; total: number };

function scoreQuickStart(tool: DetailedDevTool): number {
  return (tool.noCreditCardRequired ? 2 : 0) +
    (tool.targetAudience === "Beginner" ? 2 : tool.targetAudience === "Intermediate" ? 1 : 0) +
    (tool.pricingType === "100% Free" || tool.pricingType === "Freemium" ? 1 : 0) +
    (tool.safetyRank === "A+" ? 1 : 0);
}
function scoreOpenStack(tool: DetailedDevTool): number {
  return (tool.securityDetails.isOpaqueOrOpenSource === "Open Source" ? 3 : 0) +
    (tool.safetyRank === "A+" ? 2 : tool.safetyRank === "A" ? 1 : 0) +
    (tool.githubStars ? 1 : 0) +
    (tool.noCreditCardRequired ? 1 : 0);
}
function metricDate(tool: DetailedDevTool): string {
  return tool.githubStars || "Not listed";
}

export default function CompareClient({ initialTool }: Props) {
  const [selected, setSelected] = useState<(DetailedDevTool | null)[]>([initialTool, null]);
  const [searches, setSearches] = useState(["", ""]);
  const [results, setResults] = useState<DetailedDevTool[][]>([[], []]);
  const [busyIndex, setBusyIndex] = useState<number | null>(null);
  const [showThird, setShowThird] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialTool) setSelected((current) => current.map((item, index) => index === 0 ? initialTool : item));
  }, [initialTool]);

  useEffect(() => {
    const controllers = new Map<number, AbortController>();
    searches.forEach((query, index) => {
      if (query.trim().length < 2 || selected[index]) {
        setResults((current) => current[index]?.length ? current.map((items, itemIndex) => itemIndex === index ? [] : items) : current);
        return;
      }
      const controller = new AbortController();
      controllers.set(index, controller);
      const timer = window.setTimeout(async () => {
        setBusyIndex(index);
        try {
          const response = await fetch("/api/tools?q=" + encodeURIComponent(query.trim()) + "&limit=8", { signal: controller.signal });
          if (!response.ok) throw new Error("Could not search tools");
          const data = await response.json() as SearchResult;
          if (!controller.signal.aborted) setResults((current) => current.map((items, itemIndex) => itemIndex === index ? data.tools : items));
        } catch {
          if (!controller.signal.aborted) setError("Tool search did not load. Please try again.");
        } finally {
          if (!controller.signal.aborted) setBusyIndex((current) => current === index ? null : current);
        }
      }, 220);
      (controller as AbortController & { searchTimer?: number }).searchTimer = timer;
    });
    return () => controllers.forEach((controller) => {
      window.clearTimeout((controller as AbortController & { searchTimer?: number }).searchTimer);
      controller.abort();
    });
  }, [searches, selected]);

  function choose(index: number, tool: DetailedDevTool) {
    setSelected((current) => current.map((item, itemIndex) => itemIndex === index ? tool : item));
    setSearches((current) => current.map((item, itemIndex) => itemIndex === index ? "" : item));
    setResults((current) => current[index]?.length ? current.map((items, itemIndex) => itemIndex === index ? [] : items) : current);
    setError("");
  }
  function clear(index: number) {
    setSelected((current) => current.map((item, itemIndex) => itemIndex === index ? null : item));
  }
  const items = selected.filter((tool): tool is DetailedDevTool => Boolean(tool));
  const bestQuick = items.length > 1 ? items.reduce((best, tool) => scoreQuickStart(tool) > scoreQuickStart(best) ? tool : best, items[0]) : null;
  const bestOpen = items.length > 1 ? items.reduce((best, tool) => scoreOpenStack(tool) > scoreOpenStack(best) ? tool : best, items[0]) : null;

  return (
    <main id="main-content" className="subpage workbench-page">
      <section className="subhero">
        <span className="eyebrow"><span className="eyebrow-dot" /> DECISION WORKBENCH / 01</span>
        <h1>Compare tools.<br /><span>Choose deliberately.</span></h1>
        <p>Compare up to three listings side by side. Free-tier limits are shown as text because different products measure usage in different units.</p>
      </section>
      <section className="section-wrap workbench-content">
        <div className="compare-pickers">
          {selected.map((tool, index) => (
            <div className="compare-picker" key={index}>
              <span className="picker-label">TOOL {index + 1}{index === 2 ? " / OPTIONAL" : ""}</span>
              {tool ? (
                <div className="chosen-tool"><div><b>{tool.name}</b><small>{tool.category} · {tool.pricingType}</small></div><button type="button" onClick={() => clear(index)} aria-label={"Remove " + tool.name}><X size={16} /></button></div>
              ) : (
                <>
                  <label className="workbench-search"><Search size={15} /><input value={searches[index] || ""} onChange={(event) => setSearches((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} placeholder="Search Supabase, Firebase, Vercel…" aria-label={"Search for tool " + (index + 1)} /></label>
                  {busyIndex === index && <small className="workbench-hint">Searching the catalog…</small>}
                  {(results[index] || []).length > 0 && <div className="suggestion-list">{results[index].map((result) => <button type="button" key={result.id} disabled={selected.some((chosen) => chosen?.id === result.id)} onClick={() => choose(index, result)}><b>{result.name}</b><small>{result.category} · {result.pricingType}{selected.some((chosen) => chosen?.id === result.id) ? " · already selected" : ""}</small></button>)}</div>}
                </>
              )}
            </div>
          ))}
          <div className="compare-picker compare-add-picker">{!showThird && <button type="button" className="button-secondary" onClick={() => { setShowThird(true); setSelected((current) => current.length >= 3 ? current : [...current, null]); setSearches((current) => current.length >= 3 ? current : [...current, ""]); setResults((current) => current.length >= 3 ? current : [...current, []]); }}><Plus size={15} /> Add a third tool</button>}</div>
        </div>
        {error && <p role="status" className="data-note">{error}</p>}
        {items.length >= 2 && (
          <div className="comparison-results">
            <div className="section-heading"><div><span className="eyebrow"><GitCompareArrows size={13} /> SIDE-BY-SIDE</span><h2>Decision <span>matrix.</span></h2></div></div>
            <div className="compare-table-wrap"><table className="compare-table">
              <thead><tr><th>Metric</th>{items.map((tool) => <th key={tool.id}>{tool.name}<a href={"/tools/" + tool.id}>Full profile <ArrowUpRight size={11} /></a></th>)}</tr></thead>
              <tbody>
                <tr><th>Free-tier allowance</th>{items.map((tool) => <td key={tool.id}>{tool.freeTierLimit}</td>)}</tr>
                <tr><th>Pricing label</th>{items.map((tool) => <td key={tool.id}>{tool.pricingType}</td>)}</tr>
                <tr><th>Card at signup</th>{items.map((tool) => <td key={tool.id}>{tool.creditCardRequiredAtSignup ? "Listed as required" : tool.noCreditCardRequired ? "Not listed as required" : "Not confirmed"}</td>)}</tr>
                <tr><th>Safety signal (not audit)</th>{items.map((tool) => <td key={tool.id}><b className="compare-safety">{tool.safetyRank}</b><small>{tool.securityDetails.dataPrivacyScore}</small></td>)}</tr>
                <tr><th>Source model</th>{items.map((tool) => <td key={tool.id}>{tool.securityDetails.isOpaqueOrOpenSource}</td>)}</tr>
                <tr><th>Community rating</th>{items.map((tool) => <td key={tool.id}>{tool.userRating > 0 && tool.totalReviewsCount > 0 ? tool.userRating.toFixed(1) + " / 5 (" + tool.totalReviewsCount + ")" : "Unrated"}</td>)}</tr>
                <tr><th>GitHub stars</th>{items.map((tool) => <td key={tool.id}>{metricDate(tool)}</td>)}</tr>
                <tr><th>Skill level</th>{items.map((tool) => <td key={tool.id}>{tool.targetAudience}</td>)}</tr>
              </tbody>
            </table></div>
            <div className="recommendation-grid">
              {bestQuick && <div className="recommendation-card"><span>BEST FOR QUICK PROTOTYPES</span><b>{bestQuick.name}</b><p>Highest catalog signal score for low-friction experimentation (beginner fit, listed signup friction, pricing label, and safety signal).</p></div>}
              {bestOpen && <div className="recommendation-card"><span>BEST FIT FOR AN OPEN STACK</span><b>{bestOpen.name}</b><p>Highest catalog signal score for source availability, recorded safety signal, repository presence and signup friction.</p></div>}
            </div>
            <p className="data-note">Recommendations are heuristic hints, not guarantees. Free-tier values are not normalized across products; verify current quotas, terms, security notes and total cost with each vendor.</p>
          </div>
        )}
        {items.length < 2 && <div className="empty-state"><GitCompareArrows size={26} /><h3>Choose two tools to compare.</h3><p>Type at least two characters in each selector, then choose a result. Add a third comparison when you need it.</p></div>}
      </section>
    </main>
  );
}
