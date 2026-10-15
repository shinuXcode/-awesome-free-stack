import type { Metadata } from "next";
import SubmitToolForm from "../../components/SubmitToolForm";

export const metadata: Metadata = {
  title: "Submit a Free Developer Tool",
  description: "Suggest a developer tool or open-source project with its official URL and free-tier limits for human review.",
  alternates: { canonical: "/submit" },
};

export default function SubmitPage() {
  return (
    <main id="main-content" className="subpage workbench-page">
      <section className="subhero">
        <span className="eyebrow"><span className="eyebrow-dot" /> COMMUNITY CONTRIBUTIONS / 03</span>
        <h1>Know a useful tool?<br /><span>Put it on the radar.</span></h1>
        <p>Submit official links and real pricing caveats. Every suggestion is a starting point for review, not an automatic endorsement.</p>
      </section>
      <section className="section-wrap workbench-content submit-layout">
        <div className="submit-intro-card"><span className="eyebrow">TRUST BEFORE HYPE</span><h2>Useful details beat marketing copy.</h2><p>Include official docs, license details, any free-tier expiry, and billing/overage rules you can verify. Please don't submit referral-only landing pages, scraped claims without sources, or private credentials.</p><div><CheckCircle2 size={17} /><span>Human review before inclusion</span></div><div><CheckCircle2 size={17} /><span>Source links and caveats retained</span></div><div><CheckCircle2 size={17} /><span>Unverified details stay labeled</span></div></div>
        <SubmitToolForm />
      </section>
    </main>
  );
}
