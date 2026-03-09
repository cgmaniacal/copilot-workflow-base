# Slim Reference-Based Instruction Files

**Date:** 2026-03-09
**Status:** Approved

## Problem

The adapters currently dump `workflow.md` (~207 lines) + all `agent_docs/` content (~500+ lines) verbatim into CLAUDE.md, copilot-instructions.md, and .cursorrules. This wastes context window and duplicates content that already lives in `agent_docs/`.

Additionally, the `.onboarding-prompt.md` tells the AI to populate `agent_docs/` templates but never instructs it to regenerate the adapter outputs afterward — so CLAUDE.md and copilot-instructions.md remain stale with unfilled `{{TODO}}` placeholders.

## Solution

### Approach: Adapter generates a slim reference doc

Rewrite the adapter generators to produce a concise ~150-200 line instruction file that references `agent_docs/` rather than duplicating content. Add a `regenerate.mjs` script for re-running adapters independently.

### CLAUDE.md Structure (~150-180 lines)

1. **Header** — generated-by comment, project name (~3 lines)
2. **Tech Stack table** — exists today, retained as-is (~15 lines)
3. **Core Principles** — condensed from workflow.md (~15 lines)
   - Observe first, prescribe never (2-3 lines)
   - Four phases summary (1 line each, not full descriptions)
   - Evidence before claims (1 line)
4. **Git Conventions** — condensed (~20 lines)
   - Branch structure table
   - Commit format
   - Flow one-liner
5. **Commands** — build/test/lint (~10 lines, exists today)
6. **Agent Docs Reference** — the task→file mapping table (~20 lines)
   - "Before starting a task, read the relevant doc"
7. **Documentation Requirements** — where to save research/plans/ADRs (~10 lines)
8. **Implementation Guards** — blast radius, checkpoints (~10 lines)
9. **Claude-specific sections:**
   - Model Routing table (~10 lines)
   - Memory commands (~10 lines)

### copilot-instructions.md Structure (~120-150 lines)

Same structure minus Claude-specific sections (model routing, memory).

### .cursorrules Structure (~120-150 lines)

Same as copilot-instructions.md.

### Key Principle

Every section says "see `agent_docs/X.md` for details" rather than inlining the content. The instruction file is a routing document.

## Additional Changes

### New: `scripts/regenerate.mjs`

A small script that re-runs just the adapter generators against the current `agent_docs/`. No interactive prompts — reads agent_docs and writes instruction files.

Usage: `node scripts/regenerate.mjs --target /path/to/project`

Detects which adapters are present (CLAUDE.md exists → regenerate it, .github/copilot-instructions.md exists → regenerate it, .cursorrules exists → regenerate it).

### Updated: `.onboarding-prompt.md`

Adds a final step instructing the AI to regenerate instruction files after populating agent_docs:

> "After populating all agent_docs templates, run `node path/to/overlay/scripts/regenerate.mjs --target .` to regenerate CLAUDE.md and copilot-instructions.md from the populated docs."

### Updated: Phase 7 summary

Adds the regeneration step to the "Next steps" console output.

## What Stays the Same

- The onboarding script flow (7 phases, same UX)
- The agent_docs templates (no changes)
- The Claude adapter's settings.json, hooks, agents, commands, skills generation
- Stack detection logic
- CI template generation

## Files to Change

| File | Change |
|------|--------|
| `adapters/copilot/generate.mjs` | Rewrite to produce slim reference doc (~120-150 lines) |
| `adapters/claude/generate.mjs` | Rewrite `buildClaudeMd()` to produce slim reference doc (~150-180 lines) |
| `adapters/cursor/generate.mjs` | Rewrite to produce slim reference doc (~120-150 lines) |
| `scripts/regenerate.mjs` | New file — standalone adapter re-runner |
| `scripts/onboard.mjs` | Update Phase 6 prompt + Phase 7 summary to include regeneration step |
