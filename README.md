<div align="center">

# Zero-Cost Dev Stack

### The discovery engine for tools that help indie builders ship more with less.

[![Next.js](https://img.shields.io/badge/Next.js-App%20Router-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-149eca?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-06b6d4?logo=tailwindcss)](https://tailwindcss.com/)
[![Motion](https://img.shields.io/badge/Motion-Framer%20Motion-8b5cf6)](https://motion.dev/)
[![License](https://img.shields.io/badge/License-MIT-22c55e)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-f97316)](CONTRIBUTING.md)
[![Data validation](https://img.shields.io/badge/data-schema-validated-0ea5e9)](scripts/validate-json.js)

**Explore the tools. Read the trade-offs. Build with intent.**

[Browse the directory](https://awesome-free-stack.vercel.app) · [Open an issue](https://github.com/shinuXcode/-awesome-free-stack/issues) · [Contribute](CONTRIBUTING.md)

</div>

---

## What is this?

Zero-Cost Dev Stack is a curated directory for developers and small creators comparing tools across databases, hosting, authentication, AI APIs, storage/CDNs, developer utilities, CMS platforms, and analytics. It combines an IMDb-inspired discovery experience with practical setup notes: what a tool does, how its architecture fits together, its current free-tier caveats, and official documentation.

The project is intentionally cautious: **“free” is not a promise of permanent free use**. Pricing, usage quotas, signup requirements, product availability, data processing, and eligibility vary by provider and can change without notice.

## Product highlights

| Experience | What it does |
|---|---|
| Rich tool profiles | Setup notes, official docs, pricing caveats, privacy prompts and permanent profile URLs |
| Broad catalog | 2,000+ resources across 38 developer, creative, security, operating-system and productivity categories |
| Search and filters | Search as you type; filter by category, pricing label, card-at-signup signal and skill level |
| Keyboard access | Press `/` or `Cmd/Ctrl + K` to focus search; `Escape` closes the details dialog |
| Fast tool directory | Server-rendered first batch, server-side filtering and 48-at-a-time pagination keep the full dataset out of the main client bundle |
| Tool comparison | Compare two or three tools across written free-tier limits, payment-card notes, source model, safety signals, ratings and repository stars |
| Stack Lab | Generate a use-case-based draft stack, save tools in local browser storage, and export README.md, JSON and a visual SVG architecture map |
| Quick card actions | Save to stack, copy free-tier notes, copy a secure AI setup prompt, vote locally, share, or preselect a tool for comparison |
| GitHub health tracker | Fetch cached repository stars, open issue/PR count, latest push date, archived status and license when opening a tool profile |
| Free-tier warning radar | Highlight expiry, idle-pause, usage/overage and billing wording found in the tool's current catalog note; absence of a warning is not a guarantee |
| Alternatives search | Discover catalog candidates for paid-tool replacement; users must verify fit, license, pricing and hosting costs |
| Community submissions | A validated web form generates a pre-filled GitHub issue for human review; it does not create unauthenticated code-changing pull requests |
| Native sharing | Every tool card can share its canonical profile plus summary, category, pricing label and source links |
| Search and AI discovery | Canonical metadata, Open Graph/Twitter previews, structured data, robots policy, XML sitemap and `llms.txt` feeds |
| Automatic catalog updates | A daily GitHub Actions job discovers active, licensed projects from curated topics, de-duplicates them, validates the data and builds the site before committing new entries |
| Responsive and accessible | Mobile-first UI, visible keyboard focus, skip-to-content link and reduced-motion support |
| Community quality gate | Strict schema validation and a Next.js production build run in pull request CI |

## Interactive workbench

- **Compare:** [Compare two or three tools](https://awesome-free-stack.vercel.app/compare).
- **Stack Lab:** [Generate a stack, save tools and export a manifest](https://awesome-free-stack.vercel.app/stack-lab).
- **Alternatives:** [Search the catalog for free-tier and open-source candidates](https://awesome-free-stack.vercel.app/alternatives).
- **Submit:** [Suggest a tool for review](https://awesome-free-stack.vercel.app/submit).

Bookmarks and votes are local to the current browser; this build does not claim a shared community-vote leaderboard. GitHub repository health is fetched on demand and cached to respect the unauthenticated public API's rate limits. Tool recommendations are heuristic discovery aids, not cost, security or compatibility guarantees.


## Categories

The directory supports every category below. Counts are generated from the current catalog, not hard-coded in the UI.

- **Databases & BaaS** — SQL, databases, app backends and managed data
- **Hosting & PaaS** — application, edge and static hosting
- **Auth & Security** — identity, sessions and access controls
- **AI APIs** — model inference and AI endpoints
- **Storage & CDN** — object storage, file handling and content delivery
- **Dev Tools** — CLI utilities, API clients, terminals and build tools
- **CMS** — traditional and headless content management
- **Analytics** — product metrics, telemetry and data dashboards
- **Frontend & Web Dev** — UI frameworks, styling and web application tools
- **Backend & APIs** — server frameworks, API tooling and gateways
- **Programming Languages** — languages, compilers and runtime tooling
- **Mobile & Desktop Apps** — cross-platform and native app frameworks
- **AI & Machine Learning** — models, ML frameworks and AI development
- **Data Science & Analytics** — notebooks, visualization, data quality and BI
- **Design & UI/UX** — interface design, wireframes, icons and motion
- **Video Editing & Motion** — video tools, editing and animation
- **3D & VFX** — modeling, rendering and visual effects
- **Audio & Music** — DAWs, audio utilities and music creation
- **Game Development** — game engines, frameworks and game-dev utilities
- **Cybersecurity & Ethical Hacking** — defensive security and authorized testing tools
- **Reverse Engineering** — binary analysis and software inspection
- **Operating Systems** — Linux distributions and alternative operating systems
- **Office & Productivity** — office suites, document and reading tools
- **Open Source Apps** — privacy-friendly and community-developed apps
- **Creator & Social Media** — publishing, fediverse and social creator tools
- **Communities & Forums** — developer communities and discussion platforms
- **Freelancing & Client Management** — proposals, invoices, CRM and time tracking
- **Project & Idea Management** — task planning, notes and ideation
- **DevOps & Cloud** — deployment pipelines, infrastructure and observability
- **Testing & QA** — browser, API, accessibility and performance testing
- **Documentation & Knowledge** — docs sites, wikis and knowledge tools
- **Privacy & Utilities** — privacy, password management and secure utilities
- **Collaboration & Communication** — chat, calls, boards and forms
- **Education & Learning** — courses, practice tools and learning references
- **Automation & No-Code** — workflow automation and visual app builders
- **Blockchain & Web3** — chain tooling, wallets and smart-contract development
- **Hardware & IoT** — embedded development, electronics and home automation
- **Accessibility** — screen readers, contrast checks and a11y testing

## Tool comparison snapshot

The catalog begins without fabricated community reviews. A rating of **0.0 means “not rated yet”**, not a low score. Counts appear once real reviews are collected; they are not inferred from provider popularity.

| Tool | Community rating | Data-source / security signal | Card at signup* | Official docs |
|---|---:|---|---|---|
| [Supabase](https://supabase.com) | Not rated (0 reviews) | Open-source core; inspect project policies and privacy terms | No (catalog record; re-check provider) | [Docs](https://supabase.com/docs) |
| [Vercel](https://vercel.com) | Not rated (0 reviews) | Closed-source hosted service; inspect plan and data terms | No (catalog record; re-check provider) | [Docs](https://vercel.com/docs) |
| [Neon](https://neon.tech) | Not rated (0 reviews) | Hosted database; review retention and regional settings | No (catalog record; re-check provider) | [Docs](https://neon.tech/docs) |
| [Tailwind CSS](https://tailwindcss.com) | Not rated (0 reviews) | Open-source framework; privacy depends on build/deployment choices | No | [Docs](https://tailwindcss.com/docs) |
| [Hugging Face](https://huggingface.co) | Not rated (0 reviews) | Hosted platform; check model and dataset licenses and provider terms | No (catalog record; re-check provider) | [Docs](https://huggingface.co/docs) |

*Signup payment-card requirements and free allowances can change. Confirm in the provider's own onboarding and current pricing documentation. The directory is not a security auditor and does not certify providers.

### Reading safety and privacy fields

- **Safety rank (A+ / A / B+)** is a community review signal used for filtering, not a formal rating, audit, certification, or guarantee.
- **Certifications** remain an empty list until the project records a verifiable claim with an authoritative source. Do not infer certifications from vendor marketing or rank.
- **Data privacy score** is explicitly marked unrated until a documented methodology and evidence review exists.
- **GitHub stars** are shown only when a count has been verified for the linked repository. Missing counts are not treated as zero-star projects in user-facing content.
- **Pricing labels** are a directory classification, not a replacement for provider terms.

## Search, AI discovery and automatic updates

The site publishes these generated endpoints:

- `/robots.txt` — crawler policy with site-map discovery and explicit access for major AI crawlers.
- `/sitemap.xml` — canonical directory pages and every individual tool profile, generated from `data/tools.json`.
- `/llms.txt` — a concise guide to the catalog and editorial caveats.
- `/llms-full.txt` — machine-readable summaries with each tool's canonical profile, official site, documentation, pricing label and source-model label.

Tool profiles emit canonical URLs, Open Graph/Twitter metadata and WebPage/Breadcrumb structured data. The homepage emits WebSite/SearchAction and Organization data; the guide page includes a visible FAQ and FAQ structured data. Each card's **Share** control uses the canonical directory profile and includes the tool's summary, category, pricing label and official/source links in the share text.

### How scheduled refresh works

A GitHub Actions job runs daily at **04:23 UTC** (and can also be started manually from the Actions tab). It searches curated GitHub topics for active public repositories with a declared license, filters duplicates, adds a small bounded batch, validates the complete JSON schema, and runs a production build before committing any change to `main`. When a catalog update is published, the deployment rebuilds the tool detail pages, category counts, XML sitemap and AI-readable feeds from the same source data.

The scheduled importer covers the configured GitHub topics and license-bearing public repositories; it is not a crawler for every paid product, marketplace or website. New pull requests are still validated and built in CI. No implementation can guarantee Google rankings, indexing, or inclusion in AI answers; submit the sitemap through Google Search Console/Bing Webmaster Tools and monitor the search reports after deployment.

## Run locally

**Requirements:** Node.js 20+ and npm.

```bash
git clone https://github.com/shinuXcode/-awesome-free-stack.git
cd -awesome-free-stack
npm install
npm run validate:data
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For a production build:

```bash
npm run build
npm start
```

## Data schema and contributions

Every entry in `data/tools.json` must follow the `DetailedDevTool` contract in `lib/types.ts`. The Node.js validator checks required fields, enum values, URL protocols, duplicate IDs/names, card requirement booleans, guide step completeness, security fields, ratings, and unexpected fields.

### Add a tool through GitHub

1. Fork the repository and create a feature branch.
2. Add a new object to `data/tools.json` following the existing records.
3. Verify the provider website, documentation, current pricing and signup requirements. Include evidence in the pull-request description.
4. Keep unrated tools at `userRating: 0` and `totalReviewsCount: 0`. Never invent a score or review count.
5. Run `npm run validate:data`.
6. Open a pull request. GitHub Actions will run the schema validator; maintainers review factual claims before merging.

### Validate locally

```bash
npm run validate:data
# Or validate a different JSON file:
node scripts/validate-json.js ./path/to/tools.json
```

## Founder spotlight

Built by **Sadab (shinuXcode)** — an indie developer focused on useful products, thoughtful interfaces, and accessible tools for small creators.

- GitHub: [@shinuXcode](https://github.com/shinuXcode)
- X: [@shinuxcode](https://x.com/shinuxcode)
- Portfolio source: [Sadab.dev repository](https://github.com/shinuXcode/sadab-portfolio)
- Portfolio deployment: [mohammad-sadab-portfolio-v2.vercel.app](https://mohammad-sadab-portfolio-v2.vercel.app) (may require access if deployment protection is enabled)

The vision is simple: make software discovery more transparent, help independent builders avoid surprise costs, and create a practical public resource that improves through community review.

## Stack

- **Next.js App Router** and React
- **Tailwind CSS v4** (through the CSS-first import)
- **Framer Motion** for spring transitions, layout animation, and tilt physics
- **Lucide** icons
- **JSON as the initial content source**, validated with Node.js and GitHub Actions

## Project principles

1. Prefer official links and explain trade-offs.
2. Treat pricing, safety, ratings, reviews, stars, and certifications as evidence-sensitive fields.
3. Keep secrets out of source control.
4. Respect reduced-motion preferences and mobile ergonomics.
5. Keep the project usable with no database or API key required for the core directory.

## License

MIT. See [LICENSE](./LICENSE).

---

*Free tiers evolve. Verify current pricing, billing behavior, quotas, and terms before production use.*
