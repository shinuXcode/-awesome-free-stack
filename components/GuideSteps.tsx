"use client";

import { motion } from "framer-motion";
import { ArrowRight, BookOpen, FileSearch, GitPullRequest, ShieldCheck } from "lucide-react";

const steps = [
  { number: "01", title: "Start with your need", text: "Search for a capability, then filter by category, pricing classification, card-at-signup note, skill level, and community safety signal.", icon: FileSearch },
  { number: "02", title: "Read the trade-offs", text: "Open a profile for an architecture overview and beginner steps. Check the free-tier note, official docs, and source links before you commit.", icon: BookOpen },
  { number: "03", title: "Verify the evidence", text: "A high safety signal is not an audit. Treat unrated tools as unrated, review provider privacy terms, and confirm current billing and usage limits.", icon: ShieldCheck },
  { number: "04", title: "Improve the directory", text: "Submit an accurate tool record with source evidence. A strict schema validator runs in GitHub Actions; maintainers still review the factual claims.", icon: GitPullRequest },
];

export default function GuideSteps() {
  return <div className="guide-steps">{steps.map((step, index) => { const Icon = step.icon; return <motion.article className="guide-step" key={step.number} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ delay: index * 0.06, duration: 0.35 }}><span className="guide-step-number">{step.number}</span><span className="guide-step-icon"><Icon size={20} /></span><div><h3>{step.title}</h3><p>{step.text}</p></div><ArrowRight size={16} className="guide-step-arrow" /></motion.article>; })}</div>;
}
