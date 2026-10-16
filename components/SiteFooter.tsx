import Link from "next/link";
import { ArrowUpRight, Github, Heart, ShieldCheck } from "lucide-react";

const exploreLinks = [
  ["/tools", "Explore all tools"],
  ["/categories", "Browse categories"],
  ["/open-source", "Open-source radar"],
  ["/tools?sort=recent", "Recently added"],
] as const;

const workbenchLinks = [
  ["/compare", "Compare tools"],
  ["/stack-lab", "Stack Lab"],
  ["/alternatives", "Free alternatives"],
  ["/submit", "Submit a tool"],
] as const;

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer" aria-label="Site footer">
      <div className="footer-main">
        <div className="footer-brand-block">
          <Link className="brand footer-brand" href="/" aria-label="Zero-Cost Dev Stack home">
            <span className="brand-mark brand-mark-image"><img className="brand-logo" src="/logo.svg" alt="" width="44" height="44" /></span>
            <span>zero<span className="brand-dot">.</span>cost</span>
          </Link>
          <p className="footer-brand-copy">Find useful software, understand the trade-offs, and build without guesswork.</p>
          <p className="footer-disclaimer"><ShieldCheck size={15} aria-hidden="true" /> Pricing and license details can change. Verify important claims with the original provider.</p>
          <a className="footer-github-cta" href="https://github.com/shinuXcode/-awesome-free-stack" target="_blank" rel="noreferrer">
            <Github size={15} /> View the open-source project <ArrowUpRight size={14} />
          </a>
        </div>
        <div className="footer-column">
          <h2>Discover</h2>
          {exploreLinks.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
        </div>
        <div className="footer-column">
          <h2>Build & contribute</h2>
          {workbenchLinks.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
          <a href="https://github.com/shinuXcode/-awesome-free-stack/blob/main/CONTRIBUTING.md" target="_blank" rel="noreferrer">Contribution guidelines</a>
          <a href="https://github.com/shinuXcode/-awesome-free-stack/issues" target="_blank" rel="noreferrer">Report a problem</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {year} Zero-Cost Dev Stack. Built for people who build.</span>
        <span className="footer-bottom-note">Independent directory · Claims are not endorsements.</span>
        <span className="footer-made">Made for builders <Heart size={12} aria-hidden="true" /></span>
      </div>
    </footer>
  );
}
