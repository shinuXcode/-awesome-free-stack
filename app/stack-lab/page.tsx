import type { Metadata } from "next";
import StackLabClient from "../../components/StackLabClient";
import { catalog } from "../../lib/catalog";
import type { Category, DetailedDevTool } from "../../lib/types";

export const metadata: Metadata = {
  title: "Free Stack Generator & Architecture Builder",
  description: "Generate a free-tier starting stack, save developer tools locally, export a README or JSON manifest, and sketch a visual architecture map.",
  alternates: { canonical: "/stack-lab" },
};

const relevantCategories: Category[] = [
  "Frontend & Web Dev", "Backend & APIs", "Auth & Security", "Databases & BaaS",
  "Hosting & PaaS", "AI APIs", "AI & Machine Learning", "Storage & CDN",
  "Analytics", "Mobile & Desktop Apps", "DevOps & Cloud"
];
const preferredIds = [
  "nextjs", "next-js", "react", "tailwind-css", "supabase", "appwrite", "firebase",
  "clerk", "keycloak", "logto", "neon", "turso", "pocketbase", "vercel",
  "cloudflare-pages", "netlify", "huggingface", "ollama", "minio", "posthog", "umami"
];

function getCandidates(): DetailedDevTool[] {
  const chosen: DetailedDevTool[] = [];
  const byId = new Map(catalog.map((tool) => [tool.id, tool]));
  for (const id of preferredIds) {
    const tool = byId.get(id);
    if (tool) chosen.push(tool);
  }
  for (const category of relevantCategories) {
    const matches = catalog.filter((tool) => tool.category === category)
      .sort((a, b) => Number(b.userRating > 0) - Number(a.userRating > 0) || b.totalReviewsCount - a.totalReviewsCount || a.name.localeCompare(b.name))
      .slice(0, 5);
    for (const tool of matches) if (!chosen.some((item) => item.id === tool.id)) chosen.push(tool);
  }
  return chosen.slice(0, 72);
}

export default function StackLabPage() {
  return <StackLabClient candidates={getCandidates()} />;
}
