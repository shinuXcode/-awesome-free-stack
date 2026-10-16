const DEFAULT_RULE = { minStars: 15, minQualityScore: 45, maxDaysSincePush: 1095 };

export const CATEGORY_RULES = Object.freeze({
  "AI & Machine Learning": { minStars: 25, minQualityScore: 49, maxDaysSincePush: 730 },
  "Cybersecurity & Ethical Hacking": { minStars: 20, minQualityScore: 48, maxDaysSincePush: 730 },
  "Databases & BaaS": { minStars: 20, minQualityScore: 46, maxDaysSincePush: 900 },
  "Dev Tools": { minStars: 20, minQualityScore: 45, maxDaysSincePush: 900 },
  "Accessibility": { minStars: 5, minQualityScore: 42, maxDaysSincePush: 1095 },
  "Education & Learning": { minStars: 8, minQualityScore: 42, maxDaysSincePush: 1095 },
  "Frontend & Web Dev": { minStars: 15, minQualityScore: 45, maxDaysSincePush: 900 },
  "Backend & APIs": { minStars: 15, minQualityScore: 45, maxDaysSincePush: 900 },
  "Privacy & Utilities": { minStars: 10, minQualityScore: 43, maxDaysSincePush: 1095 },
  "Testing & QA": { minStars: 10, minQualityScore: 43, maxDaysSincePush: 1095 },
});

export function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

export function normalizeName(value) {
  return String(value ?? "").trim().toLocaleLowerCase("en-US").replace(/[^a-z0-9]+/g, "");
}

export function normalizeRepositoryUrl(value) {
  try {
    const url = new URL(value);
    if (url.hostname.toLowerCase() !== "github.com") return "";
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return "";
    return ("https://github.com/" + parts[0] + "/" + parts[1].replace(/\.git$/i, "")).toLowerCase();
  } catch {
    return "";
  }
}

export function formatStars(value) {
  const stars = Number(value);
  if (!Number.isFinite(stars) || stars < 0) return "";
  if (stars >= 1_000_000) return (stars / 1_000_000).toFixed(1).replace(/\.0$/, "") + "m";
  if (stars >= 1_000) return (stars / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(Math.round(stars));
}

function daysSince(value, now = new Date()) {
  const timestamp = Date.parse(value ?? "");
  if (!Number.isFinite(timestamp)) return Infinity;
  return Math.max(0, (now.getTime() - timestamp) / 86_400_000);
}

function starsScore(stars) {
  return Math.min(100, Math.round(Math.log10(Math.max(0, stars) + 1) * 22));
}

function recencyScore(days) {
  if (!Number.isFinite(days)) return 0;
  return Math.max(0, Math.round(100 - (days / 1095) * 85));
}

function completenessScore(repository) {
  const signals = [
    typeof repository.description === "string" && repository.description.trim().length >= 25,
    Boolean(repository.license?.spdx_id && repository.license.spdx_id !== "NOASSERTION"),
    Boolean(repository.homepage && String(repository.homepage).trim()),
    Boolean(repository.pushed_at),
  ];
  return Math.round((signals.filter(Boolean).length / signals.length) * 100);
}

/**
 * Scores discoverable projects from public, reproducible signals.
 * GitHub stars are a popularity proxy, not a review or security certification.
 */
export function scoreRepository(repository, source, now = new Date()) {
  const stars = Number(repository.stargazers_count ?? 0);
  const forks = Number(repository.forks_count ?? 0);
  const pushedDays = daysSince(repository.pushed_at, now);
  const rules = CATEGORY_RULES[source.category] ?? DEFAULT_RULE;
  const starPoints = starsScore(stars);
  const recentPoints = recencyScore(pushedDays);
  const completeness = completenessScore(repository);
  const rank = Math.max(1, Number(source.rank ?? 25));
  const rankPoints = Math.max(0, Math.round(100 - (rank - 1) * 3.5));
  const gainedStars = Math.max(0, Number(source.trendingStars ?? 0));
  const weeklyMomentum = Math.min(100, Math.round(Math.log10(gainedStars + 1) * 25));
  const trendScore = source.type === "trending"
    ? Math.round(rankPoints * 0.7 + weeklyMomentum * 0.3)
    : Math.round(starPoints * 0.45 + recentPoints * 0.55);
  const qualityScore = Math.round(
    starPoints * 0.32 +
    recentPoints * 0.32 +
    completeness * 0.22 +
    rankPoints * 0.14
  );

  let reason = "";
  if (repository.archived || repository.disabled) reason = "Repository is archived or disabled.";
  else if (repository.fork) reason = "Forks are not accepted; discover the upstream repository.";
  else if (!repository.description || repository.description.trim().length < 25) reason = "Description is missing or too short.";
  else if (!repository.license?.spdx_id || repository.license.spdx_id === "NOASSERTION") reason = "A recognizable repository license was not found.";
  else if (!Number.isFinite(pushedDays) || pushedDays > rules.maxDaysSincePush) reason = "Repository activity is too old.";
  else if (stars < rules.minStars) reason = "Repository does not meet the category's minimum star threshold.";
  else if (qualityScore < rules.minQualityScore) reason = "Repository does not meet the category's quality threshold.";

  return {
    eligible: !reason,
    reason,
    qualityScore,
    trendScore,
    stars,
    forks,
    pushedDays: Number.isFinite(pushedDays) ? Math.round(pushedDays) : null,
    minStars: rules.minStars,
    minQualityScore: rules.minQualityScore,
  };
}
