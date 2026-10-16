"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ExternalLink, Github, LoaderCircle, Search, Star, RefreshCw } from "lucide-react";

type Repo = {
  id: number; name: string; fullName: string; url: string; description: string;
  stars: number; forks: number; language: string | null; license: string;
  pushedAt: string | null; website: string | null; topics: string[];
};
type SearchResponse = {
  items: Repo[]; total: number; reportedTotal: number; page: number;
  maxPage: number; incomplete: boolean; note: string;
};
const LICENSE_OPTIONS = [
  ["mit", "MIT"], ["apache-2.0", "Apache-2.0"], ["bsd-3-clause", "BSD-3-Clause"],
  ["bsd-2-clause", "BSD-2-Clause"], ["isc", "ISC"], ["mpl-2.0", "MPL-2.0"],
  ["gpl-3.0", "GPL-3.0"], ["agpl-3.0", "AGPL-3.0"], ["unlicense", "Unlicense"]
];
const BATCH_SIZE = 24;
function compact(value: number) {
  return new Intl.NumberFormat("en", { notation: value >= 1000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(value);
}

export default function OpenSourceExplorer() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [license, setLicense] = useState("mit");
  const [sort, setSort] = useState<"stars" | "updated">("stars");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Repo[]>([]);
  const [total, setTotal] = useState(0);
  const [maxPage, setMaxPage] = useState(10);
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const requestId = useRef(0);

  async function load(nextPage: number, reset = false) {
    const thisRequest = ++requestId.current;
    setBusy(true);
    setError("");
    try {
      const params = new URLSearchParams({ q: submittedQuery, license, sort, page: String(nextPage) });
      const response = await fetch("/api/open-source?" + params.toString(), { headers: { Accept: "application/json" } });
      const data = await response.json() as SearchResponse & { error?: string };
      if (thisRequest !== requestId.current) return;
      if (!response.ok) throw new Error(data.error || "Could not load repositories.");
      setItems((current) => {
        const next = reset ? [] : current;
        const known = new Set(next.map((item) => item.id));
        return [...next, ...data.items.filter((item) => !known.has(item.id))];
      });
      setTotal(data.total);
      setMaxPage(data.maxPage);
      setPage(nextPage);
      if (reset) setVisibleCount(BATCH_SIZE);
      setNote(data.note);
    } catch (reason) {
      if (thisRequest === requestId.current) setError(reason instanceof Error ? reason.message : "Could not load repositories.");
    } finally {
      if (thisRequest === requestId.current) setBusy(false);
    }
  }

  useEffect(() => {
    void load(1, true);
    // Filter changes start a fresh query; load is intentionally called from this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [license, sort, submittedQuery]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedQuery(query.trim());
  }
  function reset() {
    setQuery("");
    setSubmittedQuery("");
    setLicense("mit");
    setSort("stars");
  }
  const visibleItems = useMemo(() => items.slice(0, visibleCount), [items, visibleCount]);
  const hasLocalMore = visibleCount < items.length;
  const hasRemoteMore = page < maxPage && items.length < total;
  const loadMore = () => {
    if (hasLocalMore) setVisibleCount((current) => Math.min(current + BATCH_SIZE, items.length));
    else if (hasRemoteMore) {
      setVisibleCount((current) => current + BATCH_SIZE);
      void load(page + 1, false);
    }
  };

  return (
    <main id="main-content" className="subpage workbench-page">
      <section className="subhero">
        <span className="eyebrow"><span className="eyebrow-dot" /> OPEN SOURCE RADAR / 05</span>
        <h1>Explore what’s<br /><span>being built in public.</span></h1>
        <p>Search licensed GitHub repositories, sort by stars or recent activity, and jump to the project or its official website.</p>
        <div className="subhero-meta"><span><Github size={14} /> Public GitHub metadata</span><span>Up to 1,000 results per search query</span></div>
      </section>
      <section className="section-wrap workbench-content">
        <form className="opensource-filter-panel" onSubmit={submit}>
          <label className="opensource-query"><span>KEYWORD / PROJECT NEED</span><div className="workbench-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="e.g. database, editor, AI framework…" aria-label="Search open-source repositories" /></div></label>
          <label><span>LICENSE</span><select value={license} onChange={(event) => setLicense(event.target.value)}>{LICENSE_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label><span>SORT BY</span><select value={sort} onChange={(event) => setSort(event.target.value as "stars" | "updated")}><option value="stars">Most stars</option><option value="updated">Recently updated</option></select></label>
          <button className="button-primary" type="submit" disabled={busy}><Search size={14} /> Search repos</button>
          <button className="button-secondary opensource-reset" type="button" onClick={reset} disabled={busy}><RefreshCw size={13} /> Reset</button>
        </form>
        <div className="opensource-summary"><div><strong>{total.toLocaleString("en-US")}</strong><span>SEARCH MATCHES (MAX 1,000)</span></div><p>{busy ? <><LoaderCircle size={14} className="spin" /> Loading repository metadata…</> : "Showing " + visibleItems.length.toLocaleString("en-US") + " loaded results · " + (LICENSE_OPTIONS.find(([value]) => value === license)?.[1] || license) + " license"}</p></div>
        {error && <p className="workbench-notice" role="status">{error}</p>}
        {visibleItems.length > 0 && <div className="opensource-grid">{visibleItems.map((repo) => <article className="opensource-card" key={repo.id}>
          <div className="opensource-card-top"><span>{repo.language || "Language not listed"}</span><span className="opensource-license">{repo.license}</span></div>
          <a className="opensource-repo-name" href={repo.url} target="_blank" rel="noreferrer"><Github size={15} />{repo.fullName}<ArrowUpRight size={13} /></a>
          <p>{repo.description}</p>
          <div className="opensource-metrics"><span><Star size={13} /> {compact(repo.stars)} stars</span><span>⑂ {compact(repo.forks)} forks</span><span>Push: {repo.pushedAt ? new Date(repo.pushedAt).toLocaleDateString() : "unknown"}</span></div>
          {repo.topics.length > 0 && <div className="opensource-topics">{repo.topics.slice(0, 4).map((topic) => <span key={topic}>{topic}</span>)}</div>}
          <div className="opensource-card-actions"><a href={repo.url} target="_blank" rel="noreferrer">Repository <ArrowUpRight size={12} /></a>{repo.website && <a href={repo.website} target="_blank" rel="noreferrer"><ExternalLink size={12} /> Website</a>}</div>
        </article>)}</div>}
        {!busy && !error && !visibleItems.length && <div className="empty-state"><Github size={24} /><h3>No matching repositories found.</h3><p>Try a broader keyword or another license.</p></div>}
        {(hasLocalMore || hasRemoteMore) && <div className="center-cta"><button className="button-primary" type="button" onClick={loadMore} disabled={busy}>{busy ? <><LoaderCircle size={15} className="spin" /> Loading…</> : <>Load more repositories <ArrowUpRight size={14} /></>}</button></div>}
        {note && <p className="data-note">{note} Results are based on GitHub search and declared license metadata; confirm the repository license and project status before using it. GitHub’s Trending page uses a different ranking and is not directly exposed through this API.</p>}
        <div className="opensource-bottom-link"><Link href="/tools">Browse the curated tool directory <ArrowUpRight size={13} /></Link></div>
      </section>
    </main>
  );
}
