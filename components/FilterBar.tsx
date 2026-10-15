"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Check, Search, SlidersHorizontal, X } from "lucide-react";
import type { Category, PricingType, SortMode } from "../lib/types";

type Props = {
  query: string;
  setQuery: (value: string) => void;
  category: Category | "All";
  setCategory: (value: Category | "All") => void;
  pricingType: PricingType | "All";
  setPricingType: (value: PricingType | "All") => void;
  noCard: boolean;
  setNoCard: (value: boolean) => void;
  beginner: boolean;
  setBeginner: (value: boolean) => void;
  safetyOnly: boolean;
  setSafetyOnly: (value: boolean) => void;
  sort: SortMode;
  setSort: (value: SortMode) => void;
  categories: Category[];
};

const pricingOptions: PricingType[] = ["100% Free", "Open Source", "Freemium", "Paid Tier Available", "Needs Verification"];

export default function FilterBar(props: Props) {
  const chipsRef = useRef<HTMLDivElement>(null);
  const chip = (active: boolean, label: string, click: () => void) => (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      aria-pressed={active}
      onClick={click}
      className={`filter-chip ${active ? "filter-chip-active" : ""}`}
    >
      {active && <Check size={12} strokeWidth={2.5} />}{label}
    </motion.button>
  );

  return (
    <div className="filter-panel">
      <label className="searchbox">
        <Search size={18} />
        <input
          aria-label="Search tools"
          placeholder="Find an API, database, hosting platform..."
          value={props.query}
          onChange={(event) => props.setQuery(event.target.value)}
        />
        {props.query && <button type="button" className="clear-search" aria-label="Clear search" onClick={() => props.setQuery("")}><X size={15} /></button>}
        <kbd>⌘ K</kbd>
      </label>

      <div className="filter-control-row">
        <div className="sort-control"><SlidersHorizontal size={14} /><label htmlFor="tool-sort">SORT</label>
          <select id="tool-sort" value={props.sort} onChange={(event) => props.setSort(event.target.value as SortMode)}>
            <option>Highest Rated</option><option>Most Starred</option><option>Safety Score</option><option>Alphabetical</option>
          </select>
        </div>
        <span className="filter-hint">Filter by</span>
        <div className="filter-chips filter-static-chips" aria-label="Pricing and quality filters">
          {pricingOptions.map((option) => chip(props.pricingType === option, option, () => props.setPricingType(props.pricingType === option ? "All" : option)))}
          {chip(props.noCard, "No credit card", () => props.setNoCard(!props.noCard))}
          {chip(props.safetyOnly, "A+ signal", () => props.setSafetyOnly(!props.safetyOnly))}
          {chip(props.beginner, "Beginner", () => props.setBeginner(!props.beginner))}
        </div>
      </div>

      <div className="category-row">
        <span className="category-scroll-label">CATEGORY</span>
        <div className="category-chip-scroller" ref={chipsRef} aria-label="Scroll through categories">
          {chip(props.category === "All", "All tools", () => props.setCategory("All"))}
          {props.categories.map((item) => chip(props.category === item, item, () => props.setCategory(props.category === item ? "All" : item)))}
        </div>
      </div>
    </div>
  );
}
