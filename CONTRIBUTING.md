# Contributing

Thanks for helping make the developer tool directory more accurate.

## Add a tool without installing anything
1. Open `data/tools.json` on GitHub and click the pencil icon.
2. Add a JSON object to the array, using the same fields as existing entries.
3. Use the provider's official HTTPS URL and explain limits without marketing claims.
4. Save the edit on a branch and open a pull request.
5. Wait for the validation workflow and maintainer review.

## Required data quality
- IDs must be unique kebab-case strings.
- Do not guess free-tier limits. Check official pricing documentation and mention the date checked in your PR description.
- Safety ranks are community signals, not audits or certifications.
- Never add credentials, private endpoints, or referral links without disclosure.
- A tool's free allowance may require a payment method, expire, or be restricted to personal use. Be explicit.

## Local validation
Use Node.js 20+:
```bash
npm run validate:data
```

## Pull requests
Keep changes focused and explain what changed, which official sources you checked, and any limitations or uncertainty.
