"use client";

import { useEffect, useState } from "react";
import { Github, RefreshCw, ShieldAlert } from "lucide-react";

type Props = { repoUrl: string };
type Health = {
  stars: number;
  openIssues: number;
  pushedAt: string | null;
  updatedAt: string | null;
  archived: boolean;
  disabled: boolean;
  license: string | null;
};

function compact(value: number): string {
  return new Intl.NumberFormat("en", { notation: value >= 1000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(value);
}

export default function GitHubHealth({ repoUrl }: Props) {
  const [health, setHealth] = useState<Health | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function load(signal?: AbortSignal) {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/github-health?repo=" + encodeURIComponent(repoUrl), {
        signal,
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error("Repository health is temporarily unavailable.");
      const data = await response.json() as Health;
      setHealth(data);
    } catch (reason) {
      if (reason instanceof Error && reason.name === "AbortError") return;
      setError("Live GitHub health could not be loaded. Use the repository page to verify current activity.");
    } finally {
      if (!signal?.aborted) setBusy(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [repoUrl]);

  return (
    <section className="github-health-panel" aria-live="polite">
      <div className="github-health-heading">
        <span><Github size={16} /> GitHub health tracker</span>
        <button type="button" onClick={() => void load()} disabled={busy} aria-label="Refresh GitHub health">
          <RefreshCw size={13} className={busy ? "spin" : ""} /> {busy ? "Checking" : "Refresh"}
        </button>
      </div>
      {health ? (
        <>
          <div className="github-health-grid">
            <div><span>Stars</span><b>{compact(health.stars)}</b></div>
            <div><span>Open issues + PRs*</span><b>{compact(health.openIssues)}</b></div>
            <div><span>Last push</span><b>{health.pushedAt ? new Date(health.pushedAt).toLocaleDateString() : "Not listed"}</b></div>
          </div>
          <div className="github-health-meta">
            <span className={health.archived || health.disabled ? "health-alert" : "health-ok"}>{health.archived ? "Archived repository" : health.disabled ? "Repository disabled" : "Repository currently active"}</span>
            <span>License: {health.license || "Not listed"}</span>
          </div>
          <p className="health-footnote">*GitHub’s open_issues_count includes pull requests. This is an activity signal, not a security audit or maintenance guarantee.</p>
        </>
      ) : (
        <p className="health-footnote">{error || (busy ? "Fetching the latest public repository metadata…" : "Live repository metadata has not loaded.")}</p>
      )}
    </section>
  );
}
