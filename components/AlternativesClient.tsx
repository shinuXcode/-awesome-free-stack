"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search, ShieldCheck, Sparkles } from "lucide-react";
import type { DetailedDevTool } from "../lib/types";

type SearchResponse = { tools: DetailedDevTool[]; total: number };
const SEARCH_HINTS: Record<string, string[]> = {
  auth0: ["auth", "identity", "authentication"],
  "aws s3": ["object storage", "s3", "storage"],
  "amazon s3": ["object storage", "storage"],
  datadog: ["monitoring", "observability", "metrics"],
  figma: ["design", "UI UX", "Penpot"],
  firebase: ["backend", "database", "Supabase"],
  "google firebase": ["backend", "database"],
  "clerk": ["authentication", "identity", "Keycloak"],
  "notion": ["notes", "knowledge", "AppFlowy"],
  intercom: ["customer support", "Chatwoot"],
  "adobe premiere": ["video editing", "Kdenlive", "Shotcut"],
  "adobe photoshop": ["image editor", "GIMP", "Krita"],
  sentry: ["error tracking", "GlitchTip", "Bugsink"],
  "vercel": ["hosting", "Cloudflare Pages", "Netlify"],
  "aws lambda": ["serverless", "OpenFaaS", "Cloudflare Workers"],
  "postman": ["API client", "Bruno", "Insomnia"],
  "jira": ["project management", "OpenProject", "Plane"]
};

export default function AlternativesClient() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<DetailedDevTool[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function search(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const term = query.trim();
    if (!term) return;
    setBusy(true);
    setMessage("");
    const lower = term.toLowerCase();
    const hints = SEARCH_HINTS[lower] || [term, term + " open source", term + " alternative"];
    try {
      const responses = await Promise.all(hints.map(async (hint) => {
        const response = await fetch("/api/tools?q=" + encodeURIComponent(hint) + "&limit=20");
        if (!response.ok) return [];
        const data = await response.json() as SearchResponse;
        return data.tools;
      }));
      const combined = responses.flat().filter((tool, index, all) =>
        (tool.pricingType === "Open Source" || tool.pricingType === "100% Free" || tool.pricingType === "Freemium") &&
        all.findIndex((candidate) => candidate.id === tool.id) === index &&
        !tool.name.toLowerCase().includes(lower)
      );
      setItems(combined.slice(0, 12));
      setMessage(combined.length ? "These are catalog candidates matched to your search, not verified one-to-one replacements. Review each official feature set, license and free allowance." : "No matching candidate was found. Try a product category or a broader term such as auth, storage, monitoring, notes, or video editing.");
    } catch {
      setMessage("The directory could not be searched. Please retry.");
      setItems([]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main id="main-content" className="subpage workbench-page">
      <section className="subhero">
        <span className="eyebrow"><span className="eyebrow-dot" /> COST-CUTTING RADAR / 04</span>
        <h1>Replace the price tag.<br /><span>Keep the capability.</span></h1>
        <p>Search a paid product or capability to find source-first catalog candidates with free or open-source labels.</p>
      </section>
      <section className="section-wrap workbench-content">
        <form className="alternatives-search-panel" onSubmit={search}>
          <label htmlFor="paid-tool-search">What paid tool do you want to replace?</label>
          <div className="workbench-search alternatives-search"><Search size={17} /><input id="paid-tool-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="e.g. Auth0, AWS S3, Datadog, Figma…" /></div>
          <button type="submit" className="button-primary" disabled={busy}>{busy ? "Searching…" : "Find free-tier candidates"} <ArrowUpRight size={14} /></button>
          <div className="alternative-chips">{["Auth0", "AWS S3", "Datadog", "Figma", "Firebase", "Notion", "Jira"].map((value) => <button key={value} type="button" onClick={() => setQuery(value)}>{value}</button>)}</div>
        </form>
        {message && <p className="workbench-notice" role="status">{message}</p>}
        {items.length > 0 && <div className="alternative-results"><div className="section-heading"><div><span className="eyebrow"><Sparkles size={13} /> POTENTIAL REPLACEMENTS</span><h2>Worth <span>evaluating.</span></h2></div></div><div className="alternative-grid">{items.map((tool) => <article className="alternative-card" key={tool.id}><div className="alternative-top"><span>{tool.category}</span><span className="alternative-pricing">{tool.pricingType}</span></div><h3>{tool.name}</h3><p>{tool.tagline}</p><div className="alternative-limit"><b>Free-tier note</b><p>{tool.freeTierLimit}</p></div><div className="alternative-signals"><span><ShieldCheck size={13} /> {tool.safetyRank} signal</span><span>{tool.noCreditCardRequired ? "No card listed" : "Card requirements: verify"}</span></div><div className="alternative-actions"><Link href={"/tools/" + tool.id} className="button-secondary">Review profile <ArrowUpRight size={13} /></Link><a href={tool.officialWebsiteUrl} target="_blank" rel="noreferrer">Official site <ArrowUpRight size={12} /></a></div></article>)}</div></div>}
        <p className="data-note">“Free” is a catalog label, not a promise that every deployment or usage pattern costs $0. Managed services can have hard limits, paid overages, regional restrictions, or require a payment method. Open-source software may still have hosting and maintenance costs.</p>
      </section>
    </main>
  );
}
