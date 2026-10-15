import type { Metadata } from "next";
import CompareClient from "../../components/CompareClient";
import { catalog } from "../../lib/catalog";

export const metadata: Metadata = {
  title: "Compare Free Developer Tools Side by Side",
  description: "Compare developer tools by listed free-tier limits, pricing labels, signup card requirements, safety signals and community ratings.",
  alternates: { canonical: "/compare" },
};

type SearchParams = Record<string, string | string[] | undefined>;
function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

export default async function ComparePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const id = first(params.tool);
  const initialTool = catalog.find((tool) => tool.id === id) || null;
  return <CompareClient initialTool={initialTool} />;
}
