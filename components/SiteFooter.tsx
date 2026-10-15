import Link from "next/link";
import { Github, Heart, Layers3 } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <Link className="brand" href="/"><span className="brand-mark"><Layers3 size={16} /></span><span>zero<span className="brand-dot">.</span>cost</span></Link>
      <p>Independent directory. Verify pricing and terms at the source.</p>
      <div className="footer-links">
        <Link href="/tools">Explore tools</Link>
        <Link href="/creator">Creator</Link>
        <a href="https://github.com/shinuXcode/-awesome-free-stack" target="_blank" rel="noreferrer"><Github size={12} /> GitHub</a>
        <span>Made for builders <Heart size={11} /></span>
      </div>
    </footer>
  );
}
