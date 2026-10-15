"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, LoaderCircle, Search, Sparkles } from "lucide-react";
import type { Category, DetailedDevTool, PricingType, SortMode } from "../lib/types";
import { categories } from "../lib/types";
import FilterBar from "./FilterBar";
import ToolCard from "./ToolCard";
import ToolDetailsModal from "./ToolDetailsModal";

type Props = {
  initialTools: DetailedDevTool[];
  initialTotal: number;
  initialQuery: string;
  initialCategory: Category | "All";
  initialPricingType: PricingType | "All";
  initialNoCard: boolean;
  initialBeginner: boolean;
  initialSafetyOnly: boolean;
  initialSort: SortMode;
};

const PAGE_SIZE = 48;

export default function ToolsClient(props: Props) {
  const [query, setQuery] = useState(props.initialQuery);
  const [category, setCategory] = useState<Category | "All">(props.initialCategory);
  const [pricingType, setPricingType] = useState<PricingType | "All">(props.initialPricingType);
  const [noCard, setNoCard] = useState(props.initialNoCard);
  const [beginner, setBeginner] = useState(props.initialBeginner);
  const [safetyOnly, setSafetyOnly] = useState(props.initialSafetyOnly);
  const [sort, setSort] = useState<SortMode>(props.initialSort);
  const [tools, setTools] = useState<DetailedDevTool[]>(props.initialTools);
  const [total, setTotal] = useState(props.initialTotal);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<DetailedDevTool | null>(null);
  const firstRender = useRef(true);

  const buildParams = useCallback((offset: number) => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (category !== "All") params.set("category", category);
    if (pricingType !== "All") params.set("pricing", pricingType);
    if (noCard) params.set("noCard", "1");
    if (beginner) params.set("beginner", "1");
    if (safetyOnly) params.set("safetyOnly", "1");
    params.set("sort", sort);
    params.set("offset", String(offset));
    params.set("limit", String(PAGE_SIZE));
    return params;
  }, [query, category, pricingType, noCard, beginner, safetyOnly, sort]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      const params = buildParams(0);
      const urlParams = new URLSearchParams(params);
      urlParams.delete("offset");
      urlParams.delete("limit");
      const queryString = urlParams.toString();
      window.history.replaceState(null, "", queryString ? "/tools?" + queryString : "/tools");
      try {
        const response = await fetch("/api/tools?" + params.toString(), {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
        if (!response.ok) throw new Error("Catalog request failed");
        const result = await response.json() as { tools: DetailedDevTool[]; total: number };
        if (!controller.signal.aborted) {
          setTools(result.tools);
          setTotal(result.total);
        }
      } catch (requestError) {
        if (!controller.signal.aborted) setError("The directory could not refresh. Check your connection and try changing a filter again.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, query.trim() ? 180 : 80);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [buildParams, query]);

  useEffect(() => {
    const focusSearch = () => document.querySelector<HTMLInputElement>('input[aria-label="Search tools"]')?.focus();
    const keyHandler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = Boolean(target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
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
    window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
  }, []);

  const reset = () => {
    setQuery("");
    setCategory("All");
    setPricingType("All");
    setNoCard(false);
    setBeginner(false);
    setSafetyOnly(false);
    setSort("Recently Added");
  };

  const loadMore = async () => {
    if (loadingMore || loading || tools.length >= total) return;
    setLoadingMore(true);
    setError("");
    try {
      const response = await fetch("/api/tools?" + buildParams(tools.length).toString(), { headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error("Catalog request failed");
      const result = await response.json() as { tools: DetailedDevTool[]; total: number };
      setTools((current) => {
        const known = new Set(current.map((tool) => tool.id));
        return [...current, ...result.tools.filter((tool) => !known.has(tool.id))];
      });
      setTotal(result.total);
    } catch {
      setError("More results could not be loaded. Try again.");
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <main id="main-content" className="subpage">
      <section className="subhero tools-subhero">
        <div className="subhero-orb" aria-hidden="true" />
        <span className="eyebrow"><span className="eyebrow-dot" /> TOOL LIBRARY / 01</span>
        <h1>Find your next<br /><span>building block.</span></h1>
        <p>Explore the full catalog across {categories.length} categories. Compare official sources, read setup notes, and check pricing caveats before choosing.</p>
        <div className="subhero-meta"><span><Sparkles size={14} /> Community maintained</span><span>Unrated means no verified review data yet</span></div>
      </section>
      <section className="section-wrap tool-library">
        <div className="section-heading"><div><span className="eyebrow">SEARCH & COMPARE</span><h2>Every tool, <span>one place.</span></h2><p>Search with <kbd>/</kbd> or <kbd>⌘ K</kbd>. Results are loaded in smaller batches for faster browsing.</p></div><div className="directory-total"><strong>{total.toLocaleString("en-US")}</strong><span>MATCHING RESULTS</span></div></div>
        <FilterBar query={query} setQuery={setQuery} category={category} setCategory={setCategory} pricingType={pricingType} setPricingType={setPricingType} noCard={noCard} setNoCard={setNoCard} beginner={beginner} setBeginner={setBeginner} safetyOnly={safetyOnly} setSafetyOnly={setSafetyOnly} sort={sort} setSort={setSort} categories={[...categories]} />
        <div className="results-meta"><span>Showing {tools.length.toLocaleString("en-US")} of {total.toLocaleString("en-US")} matching tools</span><span className="results-separator" /><span>{loading ? "Updating results…" : "Open profiles for setup guides and official links"}</span><button type="button" onClick={reset}>Reset all ↗</button></div>
        {error && <p role="status" className="data-note">{error}</p>}
        <div aria-busy={loading}>
          <AnimatePresence mode="popLayout">
            <motion.div layout className="tool-grid">
              {tools.map((tool, index) => <ToolCard key={tool.id} tool={tool} index={index} onDetails={setSelected} />)}
            </motion.div>
          </AnimatePresence>
        </div>
        {!loading && tools.length === 0 && <motion.div className="empty-state" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><Search size={25} /><h3>No matching tools.</h3><p>Try removing a filter or searching a broader term.</p><button type="button" className="button-secondary" onClick={reset}>Clear filters</button></motion.div>}
        {tools.length < total && <div className="center-cta pagination-cta"><button type="button" className="button-primary" onClick={loadMore} disabled={loadingMore || loading}>{loadingMore ? <><LoaderCircle size={16} className="spin" /> Loading more</> : <>Load {Math.min(PAGE_SIZE, total - tools.length)} more tools <ArrowRight size={15} /></>}</button><span className="data-note">Showing {tools.length} of {total} results.</span></div>}
        <p className="data-note">Pricing, signup requirements, licenses, and availability can change. Verify the current terms at each official source.</p>
        <p className="library-bottom-link">Need a starting point? <Link href="/categories">Browse by category <ArrowUpRight size={13} /></Link></p>
      </section>
      <ToolDetailsModal tool={selected} onClose={() => setSelected(null)} />
    </main>
  );
}
