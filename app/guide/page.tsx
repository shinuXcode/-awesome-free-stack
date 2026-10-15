import Link from "next/link";
import { ArrowDownRight, BookOpen, CheckCircle2, FileSearch, GitPullRequest, ShieldCheck, Sparkles } from "lucide-react";
import GuideSteps from "../../components/GuideSteps";

export const metadata = { title: "How the directory works", description: "Editorial standards for Zero-Cost Dev Stack: how listings, pricing notes, reviews, source links and automated updates are handled.", alternates: { canonical: "/guide" }, openGraph: { title: "How the directory works | Zero-Cost Dev Stack", description: "Understand sources, pricing caveats, reviews and catalog updates." } };

const faq = [
  { question: "Are all tools in the directory free?", answer: "No. The catalog distinguishes open-source projects, no-cost resources, freemium products, paid products and entries whose pricing needs verification. Plans change, so confirm current terms at the official website before relying on a free allowance." },
  { question: "How are ratings and security signals decided?", answer: "A tool with a rating of zero and zero reviews is shown as unrated. The directory does not invent reviews, certifications or audit results. Safety labels are not security certifications or guarantees." },
  { question: "How does the catalog update itself?", answer: "A scheduled GitHub Actions workflow searches curated GitHub topics for active, licensed public repositories, filters duplicates, validates the catalog, and builds the site before publishing additions to the main branch. Successful deployments regenerate tool pages, the sitemap and AI-readable catalog feeds." },
  { question: "Can AI search engines use this directory?", answer: "The site publishes crawl guidance, an XML sitemap, canonical tool profiles, structured metadata and plain-text llms.txt feeds. These make content easier to discover and interpret, but no site can guarantee inclusion or ranking in Google, Bing or an AI answer engine." },
  { question: "Is Zero-Cost Dev Stack a security or pricing auditor?", answer: "No. Listings summarize discovery information and link to primary sources. Verify licenses, privacy terms, billing, maintenance and security evidence directly with the provider or project." },
];

export default function GuidePage() {
  return (
    <main className="subpage">
      <section className="subhero">
        <span className="eyebrow"><span className="eyebrow-dot" /> A BETTER WAY TO DISCOVER / 03</span>
        <h1>Make smarter<br /><span>stack decisions.</span></h1>
        <p>The directory is built to help you compare options with context—not to promise that every service will remain free forever.</p>
        <div className="subhero-meta"><span><Sparkles size={14} /> Practical, source-first discovery</span><span>No signup required to browse</span></div>
      </section>
      <section className="section-wrap guide-layout">
        <div className="section-heading"><div><span className="eyebrow">THE WORKFLOW</span><h2>Four steps to <span>less guesswork.</span></h2><p>Use this process before choosing a provider for anything important.</p></div></div>
        <GuideSteps />
        <div className="guide-caveat"><ShieldCheck size={21} /><div><h3>How to interpret scores and pricing</h3><p>Community safety ranks are review signals, not formal security certifications. Ratings and counts are not invented for launch. Pricing, signup card requirements, eligibility, and quotas may change. Use the provider's current documents as the source of truth.</p></div></div>
      </section>
      <section className="section-wrap guide-layout" aria-labelledby="catalog-policy-heading">
        <div className="section-heading"><div><span className="eyebrow">EDITORIAL POLICY / FAQ</span><h2 id="catalog-policy-heading">Clear sources. <span>Honest caveats.</span></h2><p>These answers explain what the directory does—and what it does not claim.</p></div></div>
        <div className="principle-list">
          {faq.map((item) => <details className="detail-content-panel" key={item.question}>
            <summary><b>{item.question}</b></summary>
            <p>{item.answer}</p>
          </details>)}
        </div>
        <p className="data-note">Maintainer: Sadab (shinuXcode). This is an independent community directory, not an official partner of listed projects.</p>
      </section>
      <section className="guide-cta"><div><span className="eyebrow">READY TO EXPLORE?</span><h2>Find tools that fit<br /><span>your actual project.</span></h2></div><Link className="button-primary" href="/tools">Open the directory <ArrowDownRight size={16} /></Link></section>
    </main>
  );
}
