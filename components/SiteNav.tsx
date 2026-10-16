"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowUpRight, Github, Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  { href: "/tools", label: "Explore tools" },
  { href: "/compare", label: "Compare" },
  { href: "/stack-lab", label: "Stack Lab" },
  { href: "/alternatives", label: "Alternatives" },
  { href: "/open-source", label: "Open Source" },
  { href: "/submit", label: "Add Tool" },
  { href: "/creator", label: "Meet Creator" },
];

export default function SiteNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="site-header">
      <nav className="nav" aria-label="Main navigation">
        <Link className="brand" href="/" aria-label="Zero-Cost Dev Stack home" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark brand-mark-image"><img className="brand-logo" src="/logo.svg" alt="" width="40" height="40" /></span>
          <span>zero<span className="brand-dot">.</span>cost</span>
        </Link>
        <div className="nav-links nav-desktop">
          {links.map((item) => (
            <Link key={item.href} href={item.href} className={pathname === item.href || (item.href === "/tools" && pathname.startsWith("/tools/")) ? "nav-active" : ""}>{item.label}</Link>
          ))}
          <a className="github-link" href="https://github.com/shinuXcode/-awesome-free-stack" target="_blank" rel="noreferrer"><Github size={15} /> GitHub <ArrowUpRight size={12} /></a>
        </div>
        <button className="mobile-menu-toggle" aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
      </nav>
      {menuOpen && (
        <motion.div className="mobile-nav-panel" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
          {links.map((item) => <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className={pathname === item.href ? "nav-active" : ""}>{item.label}<ArrowUpRight size={14} /></Link>)}
          <a href="https://github.com/shinuXcode/-awesome-free-stack" target="_blank" rel="noreferrer" onClick={() => setMenuOpen(false)}>GitHub <ArrowUpRight size={14} /></a>
        </motion.div>
      )}
    </header>
  );
}
