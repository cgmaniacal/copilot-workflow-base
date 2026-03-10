# Dynamic CI Templates Design Spec

**Date:** 2026-03-10
**Status:** Approved

## Problem

CI template files (`scripts/ci-templates/github-actions.yml` and `azure-pipelines.yml`) hardcode `main`/`develop` as branch names. After adding configurable branching, these should use the actual branch names from `branchConfig`.

## Design

Replace static YAML template files with a JS generator function at `adapters/shared/build-ci-templates.mjs`.

### Generator function

`generateCITemplate(ciProvider, overlayConfig)` returns YAML string with:
- **PR triggers:** all branches from `branchConfig.branches` (e.g., `develop`, `pre-release`, `release`)
- **Push triggers:** only non-pattern branches from `branchConfig.agentAllowed` (e.g., `develop`)
- **Fallback:** if no branchConfig, use `['main', 'develop']`
- **Stack commands:** remain as `{{PLACEHOLDER}}` tokens

### Changes

- Create: `adapters/shared/build-ci-templates.mjs`
- Modify: `scripts/onboard.mjs` — call generator instead of copying static files
- Modify: `scripts/regenerate.mjs` — regenerate CI files from config
- Delete: `scripts/ci-templates/github-actions.yml`, `scripts/ci-templates/azure-pipelines.yml`
- Update: `scripts/ci-templates/README.md` — reflect dynamic generation
