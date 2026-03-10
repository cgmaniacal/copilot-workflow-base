# Branching Workflow

<!-- ONBOARDING: This file is dynamically generated from the branching configuration
     collected during onboarding. If you see {{TODO}} placeholders below, the dynamic
     generation was skipped and the analysis prompt should populate these fields. -->

## Branch Structure

<!-- ONBOARDING: detect branch structure from git branch -r, CI config, and user input -->

| Branch | Purpose | Environment | Push directly? |
|--------|---------|-------------|----------------|
| {{TODO: branch table populated during onboarding}} | | | |

## Flow

<!-- ONBOARDING: document the promotion flow between branches -->

{{TODO: flow diagram populated during onboarding}}

### Step-by-Step

{{TODO: step-by-step workflow populated during onboarding}}

## Rules

- **Never push directly** to protected branches — always use PRs
- **Always branch from the default target branch**
- **One PR per feature** — don't bundle unrelated changes
- **Conventional Commits required** — the changelog parses commit messages

## Changelog Process

<!-- ONBOARDING: detect changelog tooling — look for scripts/, package.json scripts, or CI steps that generate changelogs -->

{{TODO: detected during onboarding}}

### Commit types and changelog sections

| Commit type | Changelog section | Example |
|-------------|------------------|---------|
| `feat` | Features | `feat(web): add deck builder` |
| `fix` | Fixes | `fix(api): correct price calculation` |
| `refactor` | Improvements | `refactor(web): simplify card grid` |
| `perf` | Improvements | `perf(api): optimize search query` |
| `chore`, `docs`, `test`, `ci` | (excluded) | Not user-facing |

## Hotfix Flow

For urgent production fixes:

1. Branch from the production branch
2. Fix, commit, PR to the production branch
3. After merge: cherry-pick or merge the fix back to the development branch
