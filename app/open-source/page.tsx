import type { Metadata } from "next";
import OpenSourceExplorer from "../../components/OpenSourceExplorer";

export const metadata: Metadata = {
  title: "Trending Open Source Projects & GitHub Repository Explorer",
  description: "Discover popular, recently updated open-source GitHub repositories by keyword, license, stars, and activity. Explore up to 1,000 results per search.",
  alternates: { canonical: "/open-source" },
};

export default function OpenSourcePage() {
  return <OpenSourceExplorer />;
}
