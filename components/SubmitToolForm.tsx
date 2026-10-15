"use client";

import { FormEvent, useState } from "react";
import { ArrowUpRight, CheckCircle2, Github, Send } from "lucide-react";

const CATEGORIES = [
  "Databases & BaaS", "Hosting & PaaS", "Auth & Security", "AI APIs", "Storage & CDN",
  "Dev Tools", "CMS", "Analytics", "Frontend & Web Dev", "Backend & APIs",
  "AI & Machine Learning", "Design & UI/UX", "Office & Productivity", "Open Source Apps"
];

export default function SubmitToolForm() {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [limit, setLimit] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [pricing, setPricing] = useState("Needs Verification");
  const [signup, setSignup] = useState("Not sure");
  const [notes, setNotes] = useState("");
  const [generated, setGenerated] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGenerated("");
    let parsed: URL;
    try {
      parsed = new URL(url.trim());
      if (parsed.protocol !== "https:" || !parsed.hostname.includes(".")) throw new Error("Invalid URL");
    } catch {
      setGenerated("Enter a valid official HTTPS website URL.");
      return;
    }
    if (name.trim().length < 2 || limit.trim().length < 8) {
      setGenerated("Add a tool name and a useful free-tier limit description (at least 8 characters).");
      return;
    }
    const title = "Tool submission: " + name.trim().slice(0, 100);
    const body = [
      "## Community tool submission",
      "",
      "- **Tool name:** " + name.trim(),
      "- **Official URL:** " + parsed.toString(),
      "- **Category:** " + category,
      "- **Pricing label (submitter-reported):** " + pricing,
      "- **Credit card at signup:** " + signup,
      "- **Free-tier limits (submitter-reported):** " + limit.trim(),
      "- **Additional notes / sources:** " + (notes.trim() || "Not provided"),
      "",
      "Please verify official pricing, licensing, signup requirements, and security notes before adding this item to the catalog. This submission is not yet approved."
    ].join("\n");
    const issueUrl = new URL("https://github.com/shinuXcode/-awesome-free-stack/issues/new");
    issueUrl.searchParams.set("title", title);
    issueUrl.searchParams.set("body", body);
    issueUrl.searchParams.set("labels", "community-submission");
    setGenerated(issueUrl.toString());
  }

  const validationMessage = generated && !generated.startsWith("https://") ? generated : "";
  return (
    <form className="submit-tool-form" onSubmit={submit}>
      <div className="form-grid">
        <label>Tool name<input required minLength={2} maxLength={100} value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. A new database platform" /></label>
        <label>Official HTTPS URL<input required type="url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://example.com" /></label>
        <label>Category<select value={category} onChange={(event) => setCategory(event.target.value)}>{CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Pricing model<select value={pricing} onChange={(event) => setPricing(event.target.value)}><option>Needs Verification</option><option>100% Free</option><option>Freemium</option><option>Open Source</option><option>Paid Tier Available</option></select></label>
        <label>Credit card at signup?<select value={signup} onChange={(event) => setSignup(event.target.value)}><option>Not sure</option><option>No</option><option>Yes</option><option>Required only for some regions/plans</option></select></label>
        <label className="form-wide">Free-tier limit / caveats<textarea required minLength={8} maxLength={1500} rows={4} value={limit} onChange={(event) => setLimit(event.target.value)} placeholder="Include quotas, expiry, idle pauses, overages, or write 'needs verification'." /></label>
        <label className="form-wide">Additional sources or notes (optional)<textarea maxLength={1500} rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Official pricing page, documentation, license, source repository…" /></label>
      </div>
      <p className="form-note">This opens a pre-filled GitHub issue for human review. A browser-only form cannot safely create a code-changing PR to tools.json without a trusted GitHub App or server-side integration.</p>
      <button type="submit" className="button-primary"><Send size={15} /> Generate GitHub submission <ArrowUpRight size={14} /></button>
      {validationMessage && <p className="form-message" role="status">{validationMessage}</p>}
      {generated.startsWith("https://") && <div className="generated-submission"><CheckCircle2 size={18} /><div><b>Submission details are ready</b><p>Review the pre-filled fields, then submit the GitHub issue. The tool will not appear in the catalog until verified and merged.</p><a className="button-primary" href={generated} target="_blank" rel="noreferrer"><Github size={15} /> Open pre-filled issue <ArrowUpRight size={14} /></a></div></div>}
    </form>
  );
}
