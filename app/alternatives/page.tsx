import type { Metadata } from "next";
import AlternativesClient from "../../components/AlternativesClient";

export const metadata: Metadata = {
  title: "Free Alternatives to Paid Developer Tools",
  description: "Find possible free-tier and open-source alternatives to paid developer, cloud, design, analytics and productivity tools.",
  alternates: { canonical: "/alternatives" },
};

export default function AlternativesPage() {
  return <AlternativesClient />;
}
