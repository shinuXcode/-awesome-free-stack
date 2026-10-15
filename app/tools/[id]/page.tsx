import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, BookOpen, CheckCircle2, Github, Globe2, ShieldCheck } from "lucide-react";
import toolsData from "../../../data/tools.json";
import type { Metadata } from "next";
import type { DetailedDevTool } from "../../../lib/types";

const SITE_URL = "https://awesome-free-stack.vercel.app";
const tools = toolsData as DetailedDevTool[];

export function generateStaticParams() {
  return tools.map((tool) => ({ id: tool.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const tool = tools.find((item) => item.id === id);
  if (!tool) return { title: "Tool not found — Zero-Cost Dev Stack", robots: { index: false, follow: false } };
  const title = tool.name + " — " + tool.category;
  const description = (tool.description || tool.tagline).slice(0, 155);
  const canonical = "/tools/" + encodeURIComponent(tool.id);
  return {
    title,
    description,
    keywords: [tool.name, tool.category, tool.pricingType, "developer tools", "software directory", "official documentation"],
    alternates: { canonical },
    openGraph: { type: "article", url: canonical, title: title + " | Zero-Cost Dev Stack", description, siteName: "Zero-Cost Dev Stack" },
    twitter: { card: "summary", title, description },
  };
}

export default async function ToolDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tool = tools.find((item) => item.id === id);
  if (!tool) notFound();
  const profileUrl = SITE_URL + "/tools/" + encodeURIComponent(tool.id);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: tool.name + " — " + tool.category,
    url: profileUrl,
    description: tool.description,
    isPartOf: { "@type": "WebSite", name: "Zero-Cost Dev Stack", url: SITE_URL },
    about: {
      "@type": "Thing",
      name: tool.name,
      description: tool.description,
      sameAs: tool.officialWebsiteUrl,
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Tools", item: SITE_URL + "/tools" },
        { "@type": "ListItem", position: 3, name: tool.name, item: profileUrl },
      ],
    },
    author: { "@type": "Person", name: "Sadab", url: "https://github.com/shinuXcode" },
  };
  const jsonLd = JSON.stringify(structuredData).replace(/</g, "\\u003c");
  return (
    <main id="main-content" className="subpage tool-detail-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <section className="section-wrap detail-page-wrap">
        <Link href="/tools" className="back-link"><ArrowLeft size={14} /> Back to all tools</Link>
        <div className="detail-page-head">
          <div className="detail-page-logo">{tool.name.slice(0, 1).toUpperCase()}</div>
          <div className="detail-page-heading"><span className="eyebrow">{tool.category.toUpperCase()} / PROFILE</span><h1>{tool.name}</h1><p>{tool.tagline}</p></div>
          <a className="button-primary detail-visit-top" href={tool.officialWebsiteUrl} target="_blank" rel="noreferrer">Visit official site <ArrowUpRight size={15} /></a>
        </div>
        <p className="detail-page-description">{tool.description}</p>
        <div className="detail-page-stats">
          <div><span>PRICING MODEL</span><b>{tool.pricingType}</b></div>
          <div><span>SKILL LEVEL</span><b>{tool.targetAudience}</b></div>
          <div><span>COMMUNITY RATING</span><b>{tool.userRating > 0 ? tool.userRating.toFixed(1) : "Unrated"} <small>({tool.totalReviewsCount} reviews)</small></b></div>
          <div><span>SAFETY SIGNAL</span><b><ShieldCheck size={14} /> {tool.safetyRank}</b></div>
          <div><span>CARD AT SIGNUP</span><b>{tool.creditCardRequiredAtSignup ? "Listed as required" : "Not listed as required"}</b></div>
          <div><span>SOURCE MODEL</span><b>{tool.securityDetails.isOpaqueOrOpenSource}</b></div>
        </div>
        <div className="detail-page-columns">
          <div className="detail-page-main-column">
            <section className="detail-content-panel"><span className="eyebrow">01 / ARCHITECTURE</span><h2>How it <span>works.</span></h2><p>{tool.howItWorks}</p><div className="architecture-flow"><span>Your app</span><i>→</i><span>API / SDK</span><i>→</i><span>{tool.name}</span><i>→</i><span>Response</span></div></section>
            <section className="detail-content-panel"><span className="eyebrow">02 / QUICKSTART</span><h2>Get started, <span>step by step.</span></h2><ol className="quickstart-list">{tool.howToUseGuide.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, "0")}</span><p>{step}</p></li>)}</ol></section>
            <section className="detail-content-panel"><span className="eyebrow">03 / SECURITY NOTES</span><h2>Check the <span>fine print.</span></h2><p>{tool.securityDetails.dataPrivacyScore}</p><div className="detail-security-facts"><div><span>Certifications recorded</span><b>{tool.securityDetails.certifications.length ? tool.securityDetails.certifications.join(", ") : "None verified in directory"}</b></div><div><span>Community safety signal</span><b>{tool.safetyRank} (not an audit)</b></div></div><p className="detail-warning">Review data retention, access controls, subprocessors, current pricing, and usage quotas directly with the provider. These directory notes are not a security or cost guarantee.</p></section>
          </div>
          <aside className="detail-sidebar">
            <div className="detail-side-panel"><span className="eyebrow">FREE-TIER REALITY CHECK</span><p>{tool.freeTierLimit}</p><hr /><p className="detail-small-note">Free allowances and signup requirements may change by region, account type, or intended use.</p></div>
            <div className="detail-side-panel"><span className="eyebrow">OFFICIAL LINKS</span><a href={tool.officialWebsiteUrl} target="_blank" rel="noreferrer"><Globe2 size={15} /> Website <ArrowUpRight size={13} /></a><a href={tool.docsUrl} target="_blank" rel="noreferrer"><BookOpen size={15} /> Documentation <ArrowUpRight size={13} /></a>{tool.githubRepoUrl && <a href={tool.githubRepoUrl} target="_blank" rel="noreferrer"><Github size={15} /> GitHub repository <ArrowUpRight size={13} /></a>}</div>
            <div className="detail-side-panel detail-note-panel"><CheckCircle2 size={17} /><p>Directory entries are editorial discovery notes, not paid endorsements or security certifications. Verify claims at the official source.</p></div>
          </aside>
        </div>
      </section>
    </main>
  );
}
