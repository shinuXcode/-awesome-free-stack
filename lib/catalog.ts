import toolsData from "../data/tools.json";
import { categories, type Category, type DetailedDevTool, type PricingType, type SortMode } from "./types";

export const catalog = toolsData as DetailedDevTool[];
const categorySet = new Set<string>(categories);
const pricingSet = new Set<string>(["100% Free", "Freemium", "Open Source", "Paid Tier Available", "Needs Verification"]);
const sortModes = new Set<string>(["Recently Added", "Highest Rated", "Most Starred", "Safety Score", "Alphabetical"]);
const orderById = new Map(catalog.map((tool, index) => [tool.id, index]));
const safetyScore: Record<DetailedDevTool["safetyRank"], number> = { "A+": 3, A: 2, "B+": 1 };

export type CatalogFilters = {
  query?: string;
  category?: string;
  pricingType?: string;
  noCard?: boolean;
  beginner?: boolean;
  safetyOnly?: boolean;
  sort?: string;
};

export function normalizeFilters(filters: CatalogFilters) {
  return {
    query: (filters.query || "").trim().toLowerCase(),
    category: filters.category && categorySet.has(filters.category) ? filters.category as Category : "All",
    pricingType: filters.pricingType && pricingSet.has(filters.pricingType) ? filters.pricingType as PricingType : "All",
    noCard: Boolean(filters.noCard),
    beginner: Boolean(filters.beginner),
    safetyOnly: Boolean(filters.safetyOnly),
    sort: filters.sort && sortModes.has(filters.sort) ? filters.sort as SortMode : "Recently Added",
  };
}

function parseStars(value?: string) {
  if (!value) return -1;
  const match = value.trim().match(/([0-9,.]+)\s*([kmb])?/i);
  if (!match) return -1;
  const number = Number(match[1].replace(/,/g, ""));
  const multiplier = ({ k: 1_000, m: 1_000_000, b: 1_000_000_000 } as Record<string, number>)[(match[2] || "").toLowerCase()] || 1;
  return Number.isFinite(number) ? number * multiplier : -1;
}

export function getFilteredTools(filters: CatalogFilters = {}): DetailedDevTool[] {
  const normalized = normalizeFilters(filters);
  const list = catalog.filter((tool) =>
    (normalized.category === "All" || tool.category === normalized.category) &&
    (normalized.pricingType === "All" || tool.pricingType === normalized.pricingType) &&
    (!normalized.noCard || tool.noCreditCardRequired) &&
    (!normalized.beginner || tool.targetAudience === "Beginner") &&
    (!normalized.safetyOnly || tool.safetyRank === "A+") &&
    (!normalized.query || [
      tool.name, tool.id, tool.tagline, tool.description, tool.howItWorks,
      tool.category, tool.pricingType, tool.officialWebsiteUrl, tool.docsUrl,
    ].join(" ").toLowerCase().includes(normalized.query))
  );
  return list.sort((a, b) => {
    if (normalized.sort === "Recently Added") return (orderById.get(b.id) ?? -1) - (orderById.get(a.id) ?? -1);
    if (normalized.sort === "Highest Rated") return b.userRating - a.userRating || b.totalReviewsCount - a.totalReviewsCount || a.name.localeCompare(b.name);
    if (normalized.sort === "Most Starred") return parseStars(b.githubStars) - parseStars(a.githubStars) || a.name.localeCompare(b.name);
    if (normalized.sort === "Safety Score") return safetyScore[b.safetyRank] - safetyScore[a.safetyRank] || a.name.localeCompare(b.name);
    return a.name.localeCompare(b.name);
  });
}

export function getCategoryCounts() {
  const counts: Partial<Record<Category, number>> = {};
  for (const category of categories) counts[category] = 0;
  for (const tool of catalog) counts[tool.category] = (counts[tool.category] || 0) + 1;
  return counts;
}
