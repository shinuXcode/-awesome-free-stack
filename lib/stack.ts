import type { DetailedDevTool } from "./types";

export const SAVED_STACK_KEY = "zcds:saved-stack:v1";
export const LOCAL_VOTES_KEY = "zcds:local-votes:v1";

export function readSavedStack(): DetailedDevTool[] {
  if (typeof window === "undefined") return [];
  try {
    const raw: unknown = JSON.parse(window.localStorage.getItem(SAVED_STACK_KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    return raw.filter((item): item is DetailedDevTool =>
      Boolean(item && typeof item === "object" &&
        typeof (item as DetailedDevTool).id === "string" &&
        typeof (item as DetailedDevTool).name === "string" &&
        typeof (item as DetailedDevTool).freeTierLimit === "string")
    );
  } catch {
    return [];
  }
}

export function writeSavedStack(tools: DetailedDevTool[]): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(SAVED_STACK_KEY, JSON.stringify(tools));
    window.dispatchEvent(new CustomEvent("zcds-stack-change"));
    return true;
  } catch {
    return false;
  }
}

export function readLocalVotes(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw: unknown = JSON.parse(window.localStorage.getItem(LOCAL_VOTES_KEY) || "[]");
    return Array.isArray(raw) ? raw.filter((value): value is string => typeof value === "string") : [];
  } catch {
    return [];
  }
}

export function writeLocalVotes(votes: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCAL_VOTES_KEY, JSON.stringify([...new Set(votes)]));
  } catch {
    // Private browsing can disable local storage; the UI can still be used without votes.
  }
}

export function buildSetupPrompt(tool: DetailedDevTool): string {
  return [
    "Act as a senior software engineer.",
    "Help me integrate " + tool.name + " into my project using current official documentation.",
    "Official website: " + tool.officialWebsiteUrl,
    "Documentation: " + tool.docsUrl,
    "Use case: [describe my project and requirements].",
    "Free-tier note to verify before implementation: " + tool.freeTierLimit,
    "Explain the architecture, required environment variables, secure configuration, error handling, local development, testing, deployment, and cost/usage safeguards.",
    "Never place secrets in client-side code. Avoid claiming a limit or feature unless the official documentation verifies it.",
    "Give a beginner-friendly, step-by-step implementation and note any assumptions."
  ].join("\n");
}

export function riskLabels(tool: DetailedDevTool): string[] {
  const text = (tool.freeTierLimit || "").toLowerCase();
  const labels: string[] = [];
  if (/pause|paus|inactive|inactiv|idle|sleep|dormant|suspend/.test(text)) labels.push("Idle / pause policy mentioned");
  if (/expir|trial|days? free|temporary|limited-time/.test(text)) labels.push("Trial / expiry wording mentioned");
  if (/overage|bandwidth|quota|rate limit|request limit|usage limit|fair use|cap|limit/.test(text)) labels.push("Usage / overage limits mentioned");
  if (/credit card|billing|payment method/.test(text)) labels.push("Billing / card note mentioned");
  if (labels.length === 0) labels.push("Re-check quotas and expiry terms");
  return labels;
}
