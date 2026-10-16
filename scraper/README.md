# Catalog discovery scraper

This crawler discovers candidate repositories from a reviewed list of public GitHub Trending and topic pages, then verifies each candidate through the GitHub repository API. It is designed for candidate discovery, not unattended claims that a project is safe or that its hosted service is free.

## Security model

- Never put a GitHub token, API key, cookie, or credential in source code, sources.json, fixtures, or committed .env files.
- The crawler reads GITHUB_TOKEN (preferred) or GH_TOKEN from the process environment. GitHub Actions should provide secrets.GITHUB_TOKEN through the workflow env block.
- Local setup: export the variable in your shell before running the script. Do not commit your shell profile or terminal output containing secrets.
- The token is optional for public GitHub API access locally, but a token is strongly recommended to avoid low anonymous rate limits. GitHub Actions can use its built-in `GITHUB_TOKEN`; no third-party API key is required.
- Only HTTPS GitHub source pages listed in `sources.json` are crawled. The crawler respects robots.txt, limits concurrency, and uses a reviewed allowlist of 250+ topic/trending sources. This yields candidate leads, not 5,000 already-verified tools in one run.\n- GitHub API requests detect `Retry-After` and rate-limit reset headers, use bounded exponential backoff for temporary failures, and stop safely when quota is exhausted. The checkpoint records completed candidates atomically; the manual verification workflow caches it between runs.
- Candidate official homepages are checked only after public DNS resolution, with redirects checked manually and bounded response size/time. A homepage link is evidence of a reachable source, not proof of ownership. A pricing link is recorded only when found; generated records remain `Needs Verification` and do not claim a free tier or credit-card requirement.
- New records are staged in the catalog only after repository existence, non-archived status, recognizable license, description, activity, and quality thresholds pass.
- Never publish generated entries until schema validation, source verification, tests, and a production build succeed.

## Run locally

Node.js 20 or newer is required.

    cd scraper
    npm install --no-audit --no-fund
    npm test
    export GITHUB_TOKEN
    npm run discover -- --dry-run

For safer shell history, set GITHUB_TOKEN using your shell's environment management rather than placing a real token directly in a command copied into shared logs.

The crawler writes to `../data/tools.json` only when discovery found changes and dry-run mode is off. It is bounded by conservative defaults; override them with `SCRAPER_MAX_NEW_TOOLS`, `SCRAPER_MAX_PER_CATEGORY`, `SCRAPER_MAX_API_LOOKUPS`, and `SCRAPER_MAX_OFFICIAL_SITE_CHECKS`. The manual `Manual catalog discovery verification` workflow runs discovery, schema validation and a production build in an isolated GitHub Actions workspace; it does not commit, merge, or deploy the generated catalog. Review the artifact before proposing changes to production.

## Quality score caveats

The score uses public signals such as activity recency, stars, repository metadata completeness, and source ranking. It is not a security audit, code-quality guarantee, endorsement, or proof that a hosted product is free. Popularity is not the same as quality.
