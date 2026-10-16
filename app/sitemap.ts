import type { MetadataRoute } from "next";
import toolsData from "../data/tools.json";

const SITE_URL = "https://awesome-free-stack.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: SITE_URL + "/tools", changeFrequency: "daily", priority: 0.95 },
    { url: SITE_URL + "/categories", lastModified: new Date(), changeFrequency: "weekly", priority: 0.85 },
    { url: SITE_URL + "/guide", changeFrequency: "monthly", priority: 0.65 },
    { url: SITE_URL + "/compare", changeFrequency: "weekly", priority: 0.75 },
    { url: SITE_URL + "/stack-lab", changeFrequency: "weekly", priority: 0.75 },
    { url: SITE_URL + "/alternatives", changeFrequency: "weekly", priority: 0.75 },
    { url: SITE_URL + "/open-source", changeFrequency: "daily", priority: 0.8 },
    { url: SITE_URL + "/submit", changeFrequency: "monthly", priority: 0.55 },
    { url: SITE_URL + "/creator", changeFrequency: "monthly", priority: 0.55 },
  ];
  const toolPages: MetadataRoute.Sitemap = (toolsData as Array<{ id: string }>).map((tool) => ({
    url: SITE_URL + "/tools/" + encodeURIComponent(tool.id),
    changeFrequency: "weekly",
    priority: 0.65,
  }));
  return [...staticPages, ...toolPages];
}
