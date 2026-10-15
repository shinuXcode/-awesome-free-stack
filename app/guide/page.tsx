import Link from "next/link";
import { ArrowDownRight, BookOpen, CheckCircle2, FileSearch, GitPullRequest, ShieldCheck, Sparkles } from "lucide-react";
import GuideSteps from "../../components/GuideSteps";

export const metadata = { title: "How it works — Zero-Cost Dev Stack", description: "How to explore, compare, and contribute to Zero-Cost Dev Stack." };

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
      <section className="guide-cta"><div><span className="eyebrow">READY TO EXPLORE?</span><h2>Find tools that fit<br /><span>your actual project.</span></h2></div><Link className="button-primary" href="/tools">Open the directory <ArrowDownRight size={16} /></Link></section>
    </main>
  );
}
