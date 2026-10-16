# Catalog discovery scraper

This crawler discovers candidate repositories from a reviewed list of public GitHub Trending and topic pages, then verifies each candidate through the GitHub repository API. It is designed for candidate discovery, not unattended claims that a project is safe or that its hosted service is free.

## Security model

- Never put a GitHub token, API key, cookie, or credential in source code, sources.json, fixtures, or committed .env files.
- The crawler reads GITHUB_TOKEN (preferred) or GH_TOKEN from the process environment. GitHub Actions should provide secrets.GITHUB_TOKEN through the workflow env block.
- Local setup: export the variable in your shell before running the script. Do not commit your shell profile or terminal output containing secrets.
- The token is optional for public GitHub API access locally, but a token is strongly recommended to avoid low anonymous rate limits.
- Only HTTPS GitHub source pages listed in sources.json are crawled. The crawler respects robots.txt, limits concurrency, and retries only a small number of times.
- Candidate official homepages are checked only after public DNS resolution. Their links are not trusted for pricing or security claims; those details still need human review.
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

The crawler writes to ../data/tools.json only when discovery found changes and dry-run mode is off. It is bounded by conservative defaults; override them with SCRAPER_MAX_NEW_TOOLS, SCRAPER_MAX_PER_CATEGORY, SCRAPER_MAX_API_LOOKUPS, and SCRAPER_MAX_OFFICIAL_SITE_CHECKS.

## Quality score caveats

The score uses public signals such as activity recency, stars, repository metadata completeness, and source ranking. It is not a security audit, code-quality guarantee, endorsement, or proof that a hosted product is free. Popularity is not the same as quality.
