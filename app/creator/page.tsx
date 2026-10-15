import type { Metadata } from "next";
import FounderSection from "../../components/FounderSection";

export const metadata: Metadata = {
  title: "Creator — Zero-Cost Dev Stack",
  description: "Meet Sadab, the indie developer behind Zero-Cost Dev Stack.",
};

export default function CreatorPage() {
  return (
    <main className="subpage creator-page">
      <section className="subhero creator-subhero">
        <span className="eyebrow"><span className="eyebrow-dot" /> PEOPLE BEHIND THE PROJECT / 04</span>
        <h1>Built in public.<br /><span>Made for builders.</span></h1>
        <p>Zero-Cost Dev Stack is an indie project exploring useful software, better discovery, and tools that help small creators get started.</p>
      </section>
      <FounderSection />
    </main>
  );
}
