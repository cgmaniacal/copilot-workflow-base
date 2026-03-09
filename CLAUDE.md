# CLAUDE.md

This is the copilot-workflow-base repository — a platform-agnostic AI development workflow.

## Structure

- `core/` — Universal workflow and template agent_docs
- `adapters/` — Agent-specific config generators (copilot, claude, cursor)
- `stacks/` — Stack detection and documentation guidance
- `scripts/` — Onboarding script and CI templates

## Development

This repo has no build step or test suite. Changes are validated by running the onboarding script against test projects.

To test: `node scripts/onboard.mjs --target /path/to/test/project`

## Conventions

- All docs are markdown
- Scripts use ESM (import/export)
- No external dependencies — Node built-ins only
