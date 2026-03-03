# Readiness Audit Skills

Interactive skills for auditing the application before deployment. Each skill runs a structured review, produces a severity-categorized report, and suggests fixes.

<!-- ONBOARDING: detect available audit tools — look for installed CLI tools (lighthouse, axe, eslint plugins, snyk, trivy), package.json scripts, and CI audit steps to populate the commands below -->

## Audit Categories

| Category | What it checks | Command |
|----------|---------------|---------|
| Performance | Bundle size, asset optimization, rendering performance, queries, caching | `{{TODO: detected during onboarding}}` |
| Accessibility | WCAG 2.1 AA: semantic HTML, keyboard, touch targets, ARIA, contrast | `{{TODO: detected during onboarding}}` |
| Security | OWASP Top 10, dependencies, auth, authorization, headers, rate limiting | `{{TODO: detected during onboarding}}` |
| SEO | Meta tags, Open Graph, structured data, URLs, crawlability, rendering | `{{TODO: detected during onboarding}}` |
| E2E Flows | Critical user flow traces: core workflows, auth, CRUD, data operations | `{{TODO: detected during onboarding}}` |
| All (Orchestrator) | Runs all audits in order, produces deployment readiness verdict | `{{TODO: detected during onboarding}}` |

## When to Run

| Scenario | Category |
|----------|----------|
| Before deploying to staging/production | All |
| After adding new UI components | Accessibility |
| After adding new API routes or auth changes | Security |
| After performance complaints or asset growth | Performance |
| After adding public-facing pages | SEO |
| After major feature additions | E2E Flows |
| Periodic health check | All |

## Report Location

<!-- ONBOARDING: detect where audit reports are saved — look for docs/audits/, reports/, or CI artifact config -->

All reports are saved to `{{TODO: detected during onboarding}}`.

## Severity Levels

| Level | Meaning | Action |
|-------|---------|--------|
| **Critical** | Blocks deployment. Exploitable vulnerability, broken flow, or AA violation. | Must fix before deploy. |
| **Warning** | Degrades quality. Security weakness, poor UX, or missing optimization. | Should fix, not blocking. |
| **Info** | Enhancement opportunity. Nice-to-have improvement. | Fix when convenient. |

## Verdict Logic (full audit only)

- **NOT READY** — Any Critical in Security, Accessibility, or E2E
- **READY WITH WARNINGS** — No Criticals, but Warnings exist
- **READY** — No Criticals or Warnings

## Standards Referenced

<!-- ONBOARDING: map audit categories to agent_docs that exist in this project -->

Each audit checks against the project's existing agent_docs:

| Category | Agent Docs Referenced |
|----------|--------------------|
| Performance | `{{TODO: detected during onboarding}}` |
| Accessibility | `{{TODO: detected during onboarding}}` |
| Security | `{{TODO: detected during onboarding}}` |
| SEO | `{{TODO: detected during onboarding}}` |
| E2E | `{{TODO: detected during onboarding}}` |
