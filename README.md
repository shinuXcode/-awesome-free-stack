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

[Browse the directory](https://awesome-free-stack-q4rs8so5q-mohammad-sadabs-projects.vercel.app) · [Open an issue](https://github.com/shinuXcode/-awesome-free-stack/issues) · [Contribute](CONTRIBUTING.md)

</div>

---

## What is this?

Zero-Cost Dev Stack is a curated directory for developers and small creators comparing tools across databases, hosting, authentication, AI APIs, storage/CDNs, developer utilities, CMS platforms, and analytics. It combines an IMDb-inspired discovery experience with practical setup notes: what a tool does, how its architecture fits together, its current free-tier caveats, and official documentation.

The project is intentionally cautious: **“free” is not a promise of permanent free use**. Pricing, usage quotas, signup requirements, product availability, data processing, and eligibility vary by provider and can change without notice.

## Product highlights

| Experience | What it does |
|---|---|
| Rich tool profiles | Architecture notes, beginner quickstarts, official docs, pricing caveats, and privacy review prompts |
| IMDb-style discovery | Pricing, credit-card, skill-level, category, and safety-signal filters |
| Multiple sort modes | Highest rated, most GitHub stars, safety signal, and alphabetical |
| Real-time search | Search as you type; press `/` or `Cmd/Ctrl + K` to focus search |
| Motion-first UI | Spring layout transitions, motion-graphic hero, 3D-tilt cards, and an animated detail sheet |
| Mobile gestures | Horizontal chip scrolling and a swipe-to-dismiss details sheet |
| Founder showcase | Portfolio preview cards, creator links, and a one-tap share action |
| Community quality gate | Strict JSON validation runs on pull requests via GitHub Actions |
| Responsive by design | Mobile-first layouts, accessible controls, and reduced-motion support |

## Categories

- **Databases & BaaS** — hosted SQL, app backends, and data platforms
- **Hosting & PaaS** — deployment, app runtimes, and edge/static hosting
- **Auth & Security** — identity, sessions, and application access
- **AI APIs** — inference and model APIs
- **Storage & CDN** — object storage, file flows, and media delivery
- **Dev Tools** — API clients, automation, email, and workflow utilities
- **CMS** — structured content systems and headless publishing
- **Analytics** — product events, logs, and application monitoring

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
