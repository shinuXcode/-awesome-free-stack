# awesome-free-stack

> The Ultimate Zero-Dollar Stack for Developers & Creators.

![License: MIT](https://img.shields.io/badge/License-MIT-green.svg) ![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg) ![Free Tier Verified](https://img.shields.io/badge/free--tier-community%20tracked-blueviolet.svg) ![Framework](https://img.shields.io/badge/Next.js-App%20Router-black)

A curated, community-maintained directory of developer tools with useful free tiers. Free allowances change frequently: always verify pricing on each provider's official page before building a project around it. This directory is not a guarantee of permanent free service, security certification, or production suitability.

## Contents
- [Features](#features)
- [Categories](#categories)
- [Run locally](#run-locally)
- [Contribute without coding](#contribute-without-coding)
- [Data and safety policy](#data-and-safety-policy)
- [License](#license)

## Features
| Feature | Details |
|---|---|
| Search | Instant client-side search across tool names and descriptions |
| Filters | Category, no-credit-card, beginner-friendly, and safety rating filters |
| Responsive UI | Mobile-first one/two/three-column card grid |
| Tool details | Free-tier notes, official links, difficulty, and community labels |
| Data validation | Node.js validator for pull requests |
| Open contributions | Add entries by editing `data/tools.json` on GitHub |

## Categories
Databases & BaaS · Hosting & PaaS · Auth & Security · AI APIs · Storage & CDN · Dev Tools. UI frameworks, analytics, email, and CMS entries are grouped under `Dev Tools` to preserve the requested data schema.

## Run locally
Requirements: Node.js 20 or newer and npm.

```bash
npm install
npm run validate:data
npm run dev
```

Open `http://localhost:3000`. For a production build run `npm run build`.

## Contribute without coding
1. Open [`data/tools.json`](./data/tools.json).
2. Click the pencil icon to edit the file on GitHub.
3. Add one object to the JSON array. Keep commas valid and use the exact schema below.
4. Link to the provider's official website and describe the free allowance precisely.
5. Commit the edit to a branch and open a pull request.
6. GitHub Actions runs the validator. A maintainer reviews the claim before merging.

Example entry:
```json
{
  "id": "example-service",
  "name": "Example Service",
  "category": "Dev Tools",
  "description": "Short, factual description of the service.",
  "url": "https://example.com",
  "freeTierLimit": "Describe current limits; include a pricing source in the PR description.",
  "noCreditCardRequired": false,
  "safetyRank": "B+",
  "difficulty": "Beginner",
  "badge": "Community Pick"
}
```

## Data and safety policy
- `safetyRank` is a community-maintained review signal, not a formal security certification. Do not claim a provider is secure solely because it has a high rank.
- Free-tier limits, regional availability, billing requirements, and acceptable-use policies change. Verify before publishing and re-check periodically.
- Never commit API keys, tokens, personal data, or private credentials.
- Use official provider URLs; avoid referral links unless explicitly disclosed and approved.
- The directory does not promise zero cost for every workload. Usage overages, bandwidth, storage, and add-ons can incur charges.

## License
MIT — see [LICENSE](./LICENSE).

Contributions welcome. The goal is useful, honest documentation—not inflated star-count promises.