"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { ArrowUpRight, BookmarkCheck, Boxes, Clipboard, Download, Heart, Plus, RefreshCw, Save, Sparkles, Trash2, X } from "lucide-react";
import type { Category, DetailedDevTool } from "../lib/types";
import { readSavedStack, writeSavedStack } from "../lib/stack";

type Props = { candidates: DetailedDevTool[] };
type RoleItem = { role: string; tool: DetailedDevTool };
type UseCase = "SaaS MVP" | "Portfolio" | "E-commerce" | "AI App" | "Mobile App";
const ROLE_CATEGORIES: Record<string, Category[]> = {
  Frontend: ["Frontend & Web Dev", "Mobile & Desktop Apps"],
  Backend: ["Backend & APIs", "Databases & BaaS", "Dev Tools"],
  Auth: ["Auth & Security"],
  Database: ["Databases & BaaS", "Data Science & Analytics"],
  Hosting: ["Hosting & PaaS", "DevOps & Cloud"],
  AI: ["AI APIs", "AI & Machine Learning"],
  Storage: ["Storage & CDN", "Databases & BaaS"],
  Analytics: ["Analytics", "Data Science & Analytics"],
};
const PRESETS: Record<UseCase, string[]> = {
  "SaaS MVP": ["Frontend", "Backend", "Auth", "Database", "Hosting"],
  Portfolio: ["Frontend", "Storage", "Hosting", "Analytics"],
  "E-commerce": ["Frontend", "Backend", "Auth", "Database", "Hosting", "Analytics"],
  "AI App": ["Frontend", "AI", "Auth", "Database", "Hosting"],
  "Mobile App": ["Frontend", "Backend", "Auth", "Database", "Storage"],
};
const PREFERRED: Record<string, string[]> = {
  Frontend: ["nextjs", "next-js", "tailwind-css", "react"],
  Backend: ["supabase", "appwrite", "firebase", "pocketbase"],
  Auth: ["clerk", "keycloak", "logto", "authentik"],
  Database: ["supabase", "neon", "turso", "pocketbase", "postgresql"],
  Hosting: ["vercel", "cloudflare-pages", "netlify", "render"],
  AI: ["huggingface", "ollama", "openrouter"],
  Storage: ["cloudflare-r2", "minio", "supabase"],
  Analytics: ["umami", "posthog", "matomo"],
};

function pickTool(candidates: DetailedDevTool[], role: string, used: Set<string>): DetailedDevTool | null {
  const preferred = PREFERRED[role] || [];
  const byId = (id: string) => candidates.find((tool) => tool.id.toLowerCase() === id.toLowerCase());
  for (const id of preferred) {
    const match = byId(id);
    if (match && !used.has(match.id)) return match;
  }
  const categoryList = ROLE_CATEGORIES[role] || [];
  return candidates.find((tool) => categoryList.includes(tool.category) && !used.has(tool.id)) ||
    candidates.find((tool) => categoryList.includes(tool.category)) || null;
}

function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime + ";charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function svgArchitecture(items: DetailedDevTool[]) {
  const width = 920;
  const columns = 3;
  const cardW = 270;
  const cardH = 104;
  const rows = Math.max(1, Math.ceil(items.length / columns));
  const height = 80 + rows * 142;
  const cards = items.map((tool, index) => {
    const x = 25 + (index % columns) * 300;
    const y = 62 + Math.floor(index / columns) * 142;
    const subtitle = tool.category + " · " + tool.pricingType;
    return '<g><rect x="' + x + '" y="' + y + '" width="' + cardW + '" height="' + cardH + '" rx="13" fill="#11141c" stroke="#c6f66f" stroke-opacity=".6"/><text x="' + (x + 16) + '" y="' + (y + 31) + '" fill="#c6f66f" font-size="10" font-family="Arial">NODE ' + String(index + 1).padStart(2, "0") + '</text><text x="' + (x + 16) + '" y="' + (y + 54) + '" fill="#f3f3f1" font-size="16" font-weight="700" font-family="Arial">' + escapeXml(tool.name.slice(0, 28)) + '</text><text x="' + (x + 16) + '" y="' + (y + 77) + '" fill="#a9b0be" font-size="10" font-family="Arial">' + escapeXml(subtitle.slice(0, 42)) + '</text></g>';
  }).join("");
  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '"><rect width="100%" height="100%" fill="#090b10"/><text x="25" y="31" fill="#f3f3f1" font-size="20" font-weight="700" font-family="Arial">Zero-Cost Dev Stack · Architecture Map</text>' + cards + '<text x="25" y="' + (height - 20) + '" fill="#9a9fac" font-size="10" font-family="Arial">Exported from a user-curated stack. Verify every vendor plan and security requirement before launch.</text></svg>';
}

export default function StackLabClient({ candidates }: Props) {
  const [saved, setSaved] = useState<DetailedDevTool[]>([]);
  const [useCase, setUseCase] = useState<UseCase>("SaaS MVP");
  const [generated, setGenerated] = useState<RoleItem[]>([]);
  const [canvasTools, setCanvasTools] = useState<DetailedDevTool[]>([]);
  const [filter, setFilter] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const sync = () => setSaved(readSavedStack());
    sync();
    window.addEventListener("zcds-stack-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("zcds-stack-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const options = useMemo(() => {
    const text = filter.trim().toLowerCase();
    return [...saved, ...candidates.filter((tool) => !saved.some((item) => item.id === tool.id))]
      .filter((tool, index, all) => all.findIndex((item) => item.id === tool.id) === index)
      .filter((tool) => !text || (tool.name + " " + tool.category + " " + tool.tagline).toLowerCase().includes(text))
      .slice(0, 60);
  }, [saved, candidates, filter]);

  function generate(event?: FormEvent) {
    event?.preventDefault();
    const used = new Set<string>();
    const items: RoleItem[] = [];
    for (const role of PRESETS[useCase]) {
      const tool = pickTool(candidates, role, used);
      if (tool) {
        used.add(tool.id);
        items.push({ role, tool });
      }
    }
    setGenerated(items);
    setNotice(items.length ? "Stack suggestions generated. Confirm the current limits on each provider's official pricing page." : "No category matches were found. Save tools from the directory first, or search the catalog.");
  }
  function addToSaved(tool: DetailedDevTool) {
    const next = saved.some((item) => item.id === tool.id) ? saved : [...saved, tool];
    if (writeSavedStack(next)) {
      setSaved(next);
      setNotice(saved.some((item) => item.id === tool.id) ? "Tool is already in your saved stack." : tool.name + " added to My Tech Stack.");
    } else {
      setNotice("Browser storage is unavailable. Check your privacy settings.");
    }
  }
  function removeSaved(id: string) {
    const next = saved.filter((tool) => tool.id !== id);
    writeSavedStack(next);
    setSaved(next);
  }
  function saveGenerated() {
    const additions = generated.map((item) => item.tool).filter((tool) => !saved.some((savedTool) => savedTool.id === tool.id));
    const next = [...saved, ...additions];
    if (writeSavedStack(next)) {
      setSaved(next);
      setNotice("Recommended tools saved to My Tech Stack.");
    }
  }
  function addToCanvas(tool: DetailedDevTool) {
    setCanvasTools((current) => current.some((item) => item.id === tool.id) ? current : [...current, tool]);
  }
  function exportReadme() {
    const badge = (tool: DetailedDevTool) => "[![ " + tool.name.replace(/\]/g, "") + " ](https://img.shields.io/badge/" + encodeURIComponent(tool.name.replace(/\s+/g, "-")) + "-tool-c6f66f)](" + tool.officialWebsiteUrl + ")";
    const content = [
      "# My zero-cost tech stack",
      "",
      "This stack is intended to operate within the listed free allowances. It is not a guarantee of $0 billing.",
      "",
      ...saved.map((tool) => "## " + tool.name + "\n\n" + badge(tool) + "\n\n- Category: " + tool.category + "\n- Pricing label: " + tool.pricingType + "\n- Free-tier note: " + tool.freeTierLimit + "\n- Official docs: " + tool.docsUrl),
      "",
      "## Verification checklist",
      "- Re-check quotas, trial expiry, idle pause and overage rules.",
      "- Confirm whether a payment method is required for the exact region and plan.",
      "- Keep credentials in server-side environment variables or secret stores.",
      "- Set usage alerts and a billing budget before launch."
    ].join("\n");
    downloadFile("README.md", content, "text/markdown");
  }
  function exportJson() {
    downloadFile("my-tech-stack.json", JSON.stringify({
      generatedAt: new Date().toISOString(),
      budgetTarget: "$0 within published free-tier allowances; not a cost guarantee",
      tools: saved.map((tool) => ({
        id: tool.id, name: tool.name, category: tool.category, pricingType: tool.pricingType,
        freeTierLimit: tool.freeTierLimit, noCreditCardRequired: tool.noCreditCardRequired,
        safetySignal: tool.safetyRank, officialWebsiteUrl: tool.officialWebsiteUrl, docsUrl: tool.docsUrl,
        githubRepoUrl: tool.githubRepoUrl || null
      }))
    }, null, 2), "application/json");
  }
  function exportSvg() {
    const actual = canvasTools.length ? canvasTools : saved;
    if (!actual.length) {
      setNotice("Add at least one tool to the architecture canvas first.");
      return;
    }
    downloadFile("architecture.svg", svgArchitecture(actual), "image/svg+xml");
  }
  function copySetupPrompt() {
    const prompt = [
      "Create a secure project starter for this tech stack:",
      ...saved.map((tool) => "- " + tool.name + " (" + tool.category + "): " + tool.docsUrl),
      "",
      "Use official current documentation, keep secrets server-side, include environment examples without real keys, add error handling and tests, and document pricing quota/overage safeguards.",
      "Do not invent API methods or claim that the services are guaranteed free. Use only their listed allowances and explain deployment steps for beginners."
    ].join("\n");
    navigator.clipboard.writeText(prompt).then(() => setNotice("Stack setup prompt copied."), () => setNotice("Clipboard unavailable in this browser."));
  }

  return (
    <main id="main-content" className="subpage workbench-page">
      <section className="subhero">
        <span className="eyebrow"><span className="eyebrow-dot" /> STACK WORKBENCH / 02</span>
        <h1>Plan your stack.<br /><span>Then ship it.</span></h1>
        <p>Generate a starting point, save tools from the directory, and map an architecture you can export for your team.</p>
        <div className="subhero-meta"><span><Boxes size={14} /> Local-first workspace</span><span>Saved stacks stay in this browser</span></div>
      </section>
      <section className="section-wrap workbench-content">
        <div className="workbench-section-head"><div><span className="eyebrow"><Sparkles size={13} /> AI-ASSISTED STACK PLANNER</span><h2>Start with a <span>use case.</span></h2><p>Recommendations use catalog metadata to propose a draft. Review current plans and expected production traffic before adopting it.</p></div></div>
        <form className="generator-panel" onSubmit={generate}>
          <label>What are you building?<select value={useCase} onChange={(event) => setUseCase(event.target.value as UseCase)}><option>SaaS MVP</option><option>Portfolio</option><option>E-commerce</option><option>AI App</option><option>Mobile App</option></select></label>
          <button type="submit" className="button-primary"><Sparkles size={15} /> Generate a free-tier starting stack</button>
          <span className="generator-cost-note">Target: $0/month inside published free allowances. Not a guarantee; quotas, payment-card policies, regions and overages can change.</span>
        </form>
        {generated.length > 0 && <div className="generated-stack">
          <div className="section-heading"><div><span className="eyebrow">SUGGESTED COMPONENTS</span><h2>Your starting <span>blueprint.</span></h2></div><button className="button-secondary" type="button" onClick={saveGenerated}><Save size={14} /> Save stack</button></div>
          <div className="generated-role-grid">{generated.map((item) => <article key={item.role} className="generated-role-card"><span>{item.role.toUpperCase()}</span><h3>{item.tool.name}</h3><p>{item.tool.tagline}</p><small>{item.tool.pricingType} · {item.tool.safetyRank} signal</small><p className="role-limit">{item.tool.freeTierLimit}</p><div><a href={item.tool.officialWebsiteUrl} target="_blank" rel="noreferrer">Official site <ArrowUpRight size={12} /></a><Link href={"/tools/" + item.tool.id}>Directory profile <ArrowUpRight size={12} /></Link></div><button type="button" className="small-action" onClick={() => addToCanvas(item.tool)}><Plus size={13} /> Add to architecture</button></article>)}</div>
        </div>}

        <div className="workbench-section-head stack-list-heading"><div><span className="eyebrow"><BookmarkCheck size={13} /> SAVED TOOLS</span><h2>My Tech <span>Stack.</span></h2><p>Use the heart/save action on any directory card to keep a shortlist here. Exports include the values currently in this browser only.</p></div><span className="saved-count">{saved.length} SAVED</span></div>
        {saved.length ? <div className="saved-tools-list">{saved.map((tool) => <article className="saved-tool-row" key={tool.id}><span className="saved-tool-icon"><BookmarkCheck size={15} /></span><div><b>{tool.name}</b><small>{tool.category} · {tool.pricingType}</small><p>{tool.freeTierLimit}</p></div><div className="saved-tool-actions"><button type="button" onClick={() => addToCanvas(tool)} title="Add to architecture" aria-label={"Add " + tool.name + " to architecture"}><Plus size={15} /></button><Link href={"/tools/" + tool.id} aria-label={"Open " + tool.name + " profile"}><ArrowUpRight size={15} /></Link><button type="button" onClick={() => removeSaved(tool.id)} title="Remove from saved stack" aria-label={"Remove " + tool.name}><Trash2 size={15} /></button></div></article>)}</div> : <div className="empty-state"><Heart size={23} /><h3>Your stack is empty.</h3><p>Browse the tool library and save a few candidates. Or generate a starter stack above.</p><Link href="/tools" className="button-primary">Explore tools <ArrowUpRight size={14} /></Link></div>}
        <div className="export-toolbar"><button className="button-primary" type="button" onClick={exportReadme} disabled={!saved.length}><Download size={14} /> Export README.md</button><button className="button-secondary" type="button" onClick={exportJson} disabled={!saved.length}><Download size={14} /> Export JSON</button><button className="button-secondary" type="button" onClick={copySetupPrompt} disabled={!saved.length}><Clipboard size={14} /> Copy AI setup prompt</button></div>
        <p className="data-note">A generic docker-compose.yml is not emitted because many listed products are managed cloud services and cannot honestly be represented as local containers. Use the JSON export as a manifest and generate deployment-specific config after choosing exact services.</p>

        <div className="workbench-section-head architecture-section-head"><div><span className="eyebrow"><Boxes size={13} /> FREE ARCHITECTURE BUILDER</span><h2>Map the <span>connections.</span></h2><p>Drag tools from the palette to the canvas, or tap “Add.” The canvas is a planning artifact, not an automatically validated deployment diagram.</p></div></div>
        <div className="architecture-builder">
          <aside className="architecture-palette"><label className="workbench-search"><SearchIcon /><input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filter tool palette…" aria-label="Filter architecture tool palette" /></label><div className="palette-list">{options.map((tool) => <button type="button" draggable onDragStart={(event) => event.dataTransfer.setData("text/plain", tool.id)} key={tool.id} onClick={() => addToCanvas(tool)}><span><b>{tool.name}</b><small>{tool.category}</small></span><Plus size={13} /></button>)}</div></aside>
          <div className="architecture-canvas" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const id = event.dataTransfer.getData("text/plain"); const tool = options.find((item) => item.id === id) || candidates.find((item) => item.id === id) || saved.find((item) => item.id === id); if (tool) addToCanvas(tool); }}>
            <div className="canvas-topline"><span>CANVAS / {String(canvasTools.length).padStart(2, "0")} NODES</span><button type="button" onClick={() => setCanvasTools([])} disabled={!canvasTools.length}><RefreshCw size={12} /> Clear canvas</button></div>
            {canvasTools.length ? <div className="canvas-node-grid">{canvasTools.map((tool, index) => <article key={tool.id} className="canvas-node"><span>NODE {String(index + 1).padStart(2, "0")}</span><b>{tool.name}</b><small>{tool.category}</small><div><a href={"/tools/" + tool.id}>Profile <ArrowUpRight size={11} /></a><button type="button" onClick={() => setCanvasTools((current) => current.filter((item) => item.id !== tool.id))} aria-label={"Remove " + tool.name + " from canvas"}><X size={12} /></button></div></article>)}</div> : <div className="canvas-empty"><Boxes size={28} /><b>Drop a tool here</b><span>Or tap + Add in the palette. On mobile, use the Add action.</span></div>}
            <div className="canvas-connect-hint">Architecture notes: connect UI → API → Auth → Data → Hosting according to your actual product design.</div>
            <div className="canvas-actions"><button type="button" className="button-secondary" onClick={exportSvg} disabled={!canvasTools.length && !saved.length}><Download size={14} /> Export SVG image</button><button type="button" className="button-secondary" onClick={() => downloadFile("architecture.json", JSON.stringify({ nodes: canvasTools.map((tool) => ({ id: tool.id, name: tool.name, category: tool.category, officialWebsiteUrl: tool.officialWebsiteUrl })), exportedAt: new Date().toISOString() }, null, 2), "application/json")} disabled={!canvasTools.length}><Download size={14} /> Export canvas JSON</button></div>
          </div>
        </div>
        {notice && <p className="workbench-notice" role="status">{notice}</p>}
      </section>
    </main>
  );
}

function SearchIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5" /></svg>;
}
