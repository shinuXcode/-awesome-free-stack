import Link from "next/link";
import { ArrowDownRight, ArrowRight, BookOpen, CheckCircle2, FileSearch, GitPullRequest, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export const metadata = { title: "How it works — Zero-Cost Dev Stack", description: "How to explore, compare, and contribute to Zero-Cost Dev Stack." };
const steps = [
  { number: "01", title: "Start with your need", text: "Search for a capability, then filter by category, pricing classification, card-at-signup note, skill level, and community safety signal.", icon: FileSearch },
  { number: "02", title: "Read the trade-offs", text: "Open a profile for an architecture overview and beginner steps. Check the free-tier note, official docs, and source links before you commit.", icon: BookOpen },
  { number: "03", title: "Verify the evidence", text: "A high safety signal is not an audit. Treat unrated tools as unrated, review provider privacy terms, and confirm current billing and usage limits.", icon: ShieldCheck },
  { number: "04", title: "Improve the directory", text: "Submit an accurate tool record with source evidence. A strict schema validator runs in GitHub Actions; maintainers still review the factual claims.", icon: GitPullRequest },
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
        <div className="guide-steps">
          {steps.map((step, index) => { const Icon = step.icon; return <motion.article className="guide-step" key={step.number} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ delay: index * 0.06, duration: 0.35 }}><span className="guide-step-number">{step.number}</span><span className="guide-step-icon"><Icon size={20} /></span><div><h3>{step.title}</h3><p>{step.text}</p></div><ArrowRight size={16} className="guide-step-arrow" /></motion.article>; })}
        </div>
        <div className="guide-caveat"><ShieldCheck size={21} /><div><h3>How to interpret scores and pricing</h3><p>Community safety ranks are review signals, not formal security certifications. Ratings and counts are not invented for launch. Pricing, signup card requirements, eligibility, and quotas may change. Use the provider's current documents as the source of truth.</p></div></div>
      </section>
      <section className="guide-cta"><div><span className="eyebrow">READY TO EXPLORE?</span><h2>Find tools that fit<br /><span>your actual project.</span></h2></div><Link className="button-primary" href="/tools">Open the directory <ArrowDownRight size={16} /></Link></section>
    </main>
  );
}
