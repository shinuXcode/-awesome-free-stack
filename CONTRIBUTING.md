# Contributing

Thanks for helping make the developer tool directory more accurate.

## Add a tool without installing anything
1. Open `data/tools.json` on GitHub and click the pencil icon.
2. Add a JSON object to the array, using the same fields as existing entries.
3. Use the provider's official HTTPS URL and explain limits without marketing claims.
4. Save the edit on a branch and open a pull request.
5. Wait for the validation workflow and maintainer review.

## Required data quality

Every new or edited catalog record must contain a `sourceVerification` object. The automated workflow rejects changed records without dated evidence or with unreachable/mismatched evidence URLs.

```json
"sourceVerification": {
  "verifiedAt": "YYYY-MM-DD",
  "method": "maintainer-review",
  "licenseUrl": "https://official.example/license",
  "pricingUrl": "https://official.example/pricing"
}
```

- Use `method: "maintainer-review"` for a person who inspected the provider documentation and license. The daily discovery job uses `method: "github-api"` and a repository-specific GitHub license endpoint.
- Keep the verification date recent (within 180 days). The pricing URL can be omitted only for entries labelled **Open Source**; license/source evidence is always required.
- Evidence links must be HTTPS, public, reachable and relevant to the same provider or linked repository. The workflow checks linked GitHub repositories and verifies recognized licenses when a tool is labelled Open Source.
- These checks reduce fabricated or stale entries; they cannot prove every marketing or security claim. Review the tool and evidence manually before merging. Automated validation is not a security certification.

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

- Include official documentation, a current pricing page (except for Open Source entries), and a license/terms source in the record's `sourceVerification` object.
- Keep tool submissions as issues until a maintainer has checked the evidence and creates or approves the catalog change.
- The `CODEOWNERS` file requests maintainer review for catalog and validation changes. For a hard merge gate, enable required status checks and code-owner approval in the repository's branch protection/ruleset settings.

Keep changes focused and explain what changed, which official sources you checked, and any limitations or uncertainty.
