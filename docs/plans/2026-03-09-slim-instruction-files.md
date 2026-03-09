# Slim Instruction Files Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rewrite adapter generators to produce concise ~150-200 line instruction files that reference agent_docs/ instead of duplicating content, and add a regeneration script + updated onboarding prompt.

**Architecture:** Extract a shared `buildSlimContent()` function that produces the common sections (principles, git conventions, agent docs reference table, documentation requirements, guards). Each adapter calls this and adds agent-specific sections. A new `regenerate.mjs` script re-runs adapters without the full onboarding flow.

**Tech Stack:** Node.js ESM, no external dependencies

---

## Task 1: Extract shared slim content builder

**Files:**
- Create: `adapters/shared/build-slim-content.mjs`

**Step 1: Create the shared builder module**

This module exports a function that builds the common sections shared by all three adapters. It reads `core/workflow.md` only to extract the Agent Docs Reference table (the `| Doc | When to read |` table), rather than including the full file.

```javascript
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, basename } from 'node:path';

/**
 * Build the shared slim instruction content used by all adapters.
 *
 * @param {string} coreDir - Path to the overlay's core/ directory
 * @param {string} agentDocsDir - Path to the populated agent_docs/ in the target
 * @returns {string} Markdown content for the shared sections
 */
export function buildSlimContent(coreDir, agentDocsDir) {
  const sections = [];

  // ── Core Principles ──
  sections.push('## Core Principles');
  sections.push('');
  sections.push('**Observe First, Prescribe Never.** Before making any change, read the existing code. Find callers. Check what already exists. Never assume — verify in the code itself. This principle is non-negotiable and applies at every scale.');
  sections.push('');
  sections.push('**Four Phases.** Every significant task follows these phases in order. Do not skip phases.');
  sections.push('');
  sections.push('| Phase | Goal | Key output |');
  sections.push('|-------|------|-----------|');
  sections.push('| 1. Research | Understand the problem before writing code | `docs/research/YYYY-MM-DD-<topic>.md` + ADRs |');
  sections.push('| 2. Plan | Concrete step-by-step implementation plan | `docs/plans/YYYY-MM-DD-<feature>.md` |');
  sections.push('| 3. Implement | Execute the plan, test-first | Commits on feature branch |');
  sections.push('| 4. Validate | Verify correctness — lint, test, build all pass | PR ready for review |');
  sections.push('');
  sections.push('**Exemptions:** Bug fixes, lint cleanup, and isolated small tweaks (single-file, no architectural impact) may skip to Implement directly.');
  sections.push('');
  sections.push('**Evidence Before Claims.** Do not say "this works" without running it. Run lint, tests, and build. All must pass before declaring done.');
  sections.push('');

  // ── Git Conventions ──
  sections.push('---');
  sections.push('');
  sections.push('## Git Conventions');
  sections.push('');
  sections.push('| Branch | Purpose |');
  sections.push('|--------|---------|');
  sections.push('| `main` | Production. Auto-deploys. Never push directly. |');
  sections.push('| `develop` | Integration. All feature branches merge here first. |');
  sections.push('| `feature/<short-description>` | One per feature. Always branch from `develop`. |');
  sections.push('');
  sections.push('**Flow:** `feature/*` → PR to `develop` → testing → PR to `main` → auto-deploy');
  sections.push('');
  sections.push('**Commits:** [Conventional Commits](https://www.conventionalcommits.org/) — `type(scope): description`');
  sections.push('Types: `feat`, `fix`, `chore`, `refactor`, `test`, `docs`. Scope = app or package name.');
  sections.push('');
  sections.push('See `agent_docs/branching_workflow.md` for full branching strategy and release flow.');
  sections.push('');

  // ── Agent Docs Reference ──
  sections.push('---');
  sections.push('');
  sections.push('## Agent Docs Reference');
  sections.push('');
  sections.push('Before starting a task, read the relevant doc in `agent_docs/`. These provide codebase-specific instructions that complement this workflow.');
  sections.push('');

  // Build the reference table from whatever agent_docs actually exist
  const DOC_DESCRIPTIONS = {
    'building_the_project': 'Build setup, scripts, environment configuration',
    'running_tests': 'Writing or running tests',
    'code_conventions': 'Any code change — naming, patterns, linting',
    'service_architecture': 'Adding or modifying services or packages',
    'database_schema': 'Schema changes, migrations, seeding',
    'service_communication_patterns': 'API contracts, request/response patterns',
    'frontend_quality': 'Accessibility, responsive design, performance, SEO',
    'image_optimization': 'Responsive images, placeholder generation, uploads',
    'authentication': 'Auth tokens, middleware, roles, token strategy',
    'dependency_updates': 'Reviewing or updating dependencies',
    'memory_system': 'Memory architecture, commands, entry format',
    'audit_skills': 'Readiness audits (performance, a11y, security, SEO)',
    'branching_workflow': 'Branching strategy, release flow, changelog',
  };

  if (existsSync(agentDocsDir)) {
    const files = readdirSync(agentDocsDir)
      .filter((f) => f.endsWith('.md') && !f.startsWith('.'))
      .sort();

    if (files.length > 0) {
      sections.push('| Doc | When to read |');
      sections.push('|-----|-------------|');
      for (const file of files) {
        const name = basename(file, '.md');
        const desc = DOC_DESCRIPTIONS[name] || name.replace(/_/g, ' ');
        sections.push(`| \`agent_docs/${file}\` | ${desc} |`);
      }
      sections.push('');
    }
  }

  // ── Documentation Requirements ──
  sections.push('---');
  sections.push('');
  sections.push('## Documentation Requirements');
  sections.push('');
  sections.push('Every feature MUST produce these artifacts before implementation begins:');
  sections.push('');
  sections.push('| Artifact | Location |');
  sections.push('|----------|----------|');
  sections.push('| Research/design doc | `docs/research/YYYY-MM-DD-<topic>.md` |');
  sections.push('| ADR (when alternatives exist) | `docs/decisions/NNN-<title>.md` |');
  sections.push('| Implementation plan | `docs/plans/YYYY-MM-DD-<feature>.md` |');
  sections.push('');

  // ── Implementation Guards ──
  sections.push('---');
  sections.push('');
  sections.push('## Implementation Guards');
  sections.push('');
  sections.push('- **Blast Radius Check:** Before modifying any function, search for all callers. If callers span 3+ modules, note the blast radius and verify a caller from each after the change.');
  sections.push('- **Proactive Checkpoint:** Every 5 implementation steps, save progress to `.agent/sessions/.current-checkpoint.md` (success criteria status, files changed, current step).');
  sections.push('- **Guardrails:** Check `.agent/guardrails.md` before complex tasks. Entries marked PERMANENT always apply.');
  sections.push('');

  return sections.join('\n');
}
```

**Step 2: Verify the file was created correctly**

Run: `node -e "import('./adapters/shared/build-slim-content.mjs').then(m => console.log('OK: exports buildSlimContent =', typeof m.buildSlimContent))"`
Expected: `OK: exports buildSlimContent = function`

**Step 3: Commit**

```bash
git add adapters/shared/build-slim-content.mjs
git commit -m "feat(adapters): add shared slim content builder for instruction files"
```

---

## Task 2: Rewrite Copilot adapter to produce slim output

**Files:**
- Modify: `adapters/copilot/generate.mjs`

**Step 1: Rewrite generateCopilotConfig**

Replace the full-content concatenation with slim reference-based output. The function should:
1. Import `buildSlimContent` from the shared module
2. Build a header comment
3. Call `buildSlimContent()` for the shared sections
4. Write the result (~120-150 lines)

```javascript
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSlimContent } from '../shared/build-slim-content.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Generates .github/copilot-instructions.md — a slim reference doc.
 *
 * @param {string} targetDir - The project being onboarded
 * @param {string} coreDir - The overlay's core/ directory
 * @param {string} agentDocsDir - The populated agent_docs/ directory in the target
 * @param {string[]} detectedStacks - Stack identifiers (unused by Copilot, kept for API consistency)
 * @returns {string} Path to the generated file
 */
export function generateCopilotConfig(targetDir, coreDir, agentDocsDir, detectedStacks = []) {
  const sections = [];

  sections.push('<!-- Generated by ai-workflow-overlay. Do not edit directly. -->');
  sections.push('<!-- Edit agent_docs/ files, then run regenerate.mjs to update. -->');
  sections.push('');
  sections.push('# Copilot Instructions');
  sections.push('');

  // Shared slim content
  sections.push(buildSlimContent(coreDir, agentDocsDir));

  // ── Project Structure ──
  sections.push('---');
  sections.push('');
  sections.push('## Project Structure');
  sections.push('');
  sections.push('```');
  sections.push('agent_docs/       # Task-specific instructions (see reference table above)');
  sections.push('docs/');
  sections.push('  research/       # Research and design docs');
  sections.push('  plans/          # Implementation plans');
  sections.push('  decisions/      # Architectural Decision Records');
  sections.push('```');
  sections.push('');
  sections.push('Source tree structure is documented in `agent_docs/service_architecture.md`.');
  sections.push('');

  const output = sections.join('\n');

  const githubDir = join(targetDir, '.github');
  if (!existsSync(githubDir)) {
    mkdirSync(githubDir, { recursive: true });
  }

  const outputPath = join(githubDir, 'copilot-instructions.md');
  writeFileSync(outputPath, output, 'utf8');

  return outputPath;
}
```

**Step 2: Verify the module loads**

Run: `node -e "import('./adapters/copilot/generate.mjs').then(m => console.log('OK:', typeof m.generateCopilotConfig))"`
Expected: `OK: function`

**Step 3: Commit**

```bash
git add adapters/copilot/generate.mjs
git commit -m "refactor(copilot): generate slim reference doc instead of full content dump"
```

---

## Task 3: Rewrite Claude adapter's buildClaudeMd to produce slim output

**Files:**
- Modify: `adapters/claude/generate.mjs`

**Step 1: Rewrite buildClaudeMd**

Replace the verbatim agent_docs concatenation with slim output. Keep `buildTechStackSection()` and `buildCommandsSection()` as-is (they're already concise). Replace the agent_docs dump with `buildSlimContent()`. Keep Model Routing and Memory sections (already concise).

The key changes:
1. Add import for `buildSlimContent`
2. In `buildClaudeMd()`: replace `workflowContent.trimEnd()` and the agent docs loop with `buildSlimContent()`
3. Keep tech stack, commands, model routing, memory sections as-is

The new `buildClaudeMd` should produce:
- Header (~3 lines)
- Tech Stack table (~15 lines) — existing function
- Shared slim content (~90 lines) — from shared builder
- Commands (~10 lines) — existing function
- Model Routing (~12 lines) — existing code
- Memory (~10 lines) — existing code
- Total: ~140-170 lines

```javascript
// At top of file, add:
import { buildSlimContent } from '../shared/build-slim-content.mjs';

// Replace buildClaudeMd function body:
function buildClaudeMd(workflowContent, agentDocsDir, detectedStacks) {
  const sections = [];

  sections.push('<!-- Generated by ai-workflow-overlay. Do not edit directly. -->');
  sections.push('<!-- Edit agent_docs/ files, then run regenerate.mjs to update. -->');
  sections.push('');
  sections.push('# CLAUDE.md');
  sections.push('');

  // Tech stack table (existing, concise)
  sections.push(buildTechStackSection(detectedStacks));
  sections.push('');

  // Shared slim content (principles, git, agent docs ref, doc requirements, guards)
  // Note: we need coreDir to pass through, but buildClaudeMd doesn't receive it.
  // We'll pass agentDocsDir only since buildSlimContent uses it for the reference table.
  sections.push(buildSlimContent(null, agentDocsDir));
  sections.push('');

  // Commands section (existing, concise)
  sections.push('---');
  sections.push('');
  sections.push(buildCommandsSection(detectedStacks));
  sections.push('');

  // Model routing (existing, Claude-specific)
  sections.push('---');
  sections.push('');
  sections.push('## Model Routing');
  sections.push('');
  sections.push('When spawning subagents, select the model by task complexity:');
  sections.push('');
  sections.push('| Task type | Model | Examples |');
  sections.push('|-----------|-------|---------|');
  sections.push('| Research, architecture, complex analysis | `opus` | Brainstorming, design review, debugging |');
  sections.push('| Code implementation | `sonnet` | Writing features, tests, refactors from a plan |');
  sections.push('| File search, lookups, simple commands | `haiku` | Grep/glob exploration, running lint/build/test |');
  sections.push('');
  sections.push('Default to `sonnet`. Escalate to `opus` for cross-cutting reasoning. Use `haiku` for read-only exploration.');
  sections.push('');

  // Memory commands (existing, Claude-specific)
  sections.push('---');
  sections.push('');
  sections.push('## Memory');
  sections.push('');
  sections.push('Persistent memory at `.claude/memory/` is managed via hooks.');
  sections.push('');
  sections.push('| Command | What it does |');
  sections.push('|---------|-------------|');
  sections.push('| `/remember` | Extract and save context from the current conversation |');
  sections.push('| `/recall [topic]` | Search memory tree for relevant context |');
  sections.push('| `/memory-status` | Show stored memory count by domain |');
  sections.push('');
  sections.push('See `agent_docs/memory_system.md` for architecture and hook details.');
  sections.push('');

  return sections.join('\n') + '\n';
}
```

**Important:** The `buildClaudeMd` function signature currently receives `workflowContent` but we no longer need it since `buildSlimContent` contains the condensed workflow. Update `generateClaudeConfig` to stop reading `workflow.md` for the CLAUDE.md build (it may still be needed if `buildSlimContent` uses `coreDir`). Actually, `buildSlimContent` doesn't read workflow.md either — the principles are hardcoded. So `workflowContent` can be dropped from `buildClaudeMd`.

Update the `generateClaudeConfig` call to pass `coreDir` instead of `workflowContent`:

```javascript
export function generateClaudeConfig(targetDir, coreDir, agentDocsDir, detectedStacks = []) {
  const claudeDir = join(targetDir, '.claude');
  mkdirSync(claudeDir, { recursive: true });

  // 1. Build and write CLAUDE.md
  const claudeMdContent = buildClaudeMd(coreDir, agentDocsDir, detectedStacks);
  const claudeMdPath = join(targetDir, 'CLAUDE.md');
  writeFileSync(claudeMdPath, claudeMdContent, 'utf8');

  // 2-3 remain unchanged...
```

**Step 2: Update buildSlimContent signature**

Actually, looking at this more carefully — `buildSlimContent` needs `coreDir` as a parameter (even though it doesn't currently read workflow.md, the parameter is in the signature for future use). The Claude adapter should pass `coreDir` through. Update `buildClaudeMd` to accept `coreDir`:

```javascript
function buildClaudeMd(coreDir, agentDocsDir, detectedStacks) {
  // ... use buildSlimContent(coreDir, agentDocsDir) ...
}
```

**Step 3: Verify the module loads**

Run: `node -e "import('./adapters/claude/generate.mjs').then(m => console.log('OK:', typeof m.generateClaudeConfig))"`
Expected: `OK: function`

**Step 4: Commit**

```bash
git add adapters/claude/generate.mjs
git commit -m "refactor(claude): generate slim CLAUDE.md reference doc instead of full content dump"
```

---

## Task 4: Rewrite Cursor adapter to produce slim output

**Files:**
- Modify: `adapters/cursor/generate.mjs`

**Step 1: Rewrite generateCursorConfig**

Same approach as Copilot adapter — import shared builder, produce slim output.

```javascript
import { existsSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSlimContent } from '../shared/build-slim-content.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Generates .cursorrules — a slim reference doc.
 *
 * @param {string} targetDir - The project being onboarded
 * @param {string} coreDir - The overlay's core/ directory
 * @param {string} agentDocsDir - The populated agent_docs/ directory in the target
 * @param {string[]} detectedStacks - Stack identifiers (unused by Cursor, kept for API consistency)
 * @returns {string} Path to the generated file
 */
export function generateCursorConfig(targetDir, coreDir, agentDocsDir, detectedStacks = []) {
  const sections = [];

  sections.push('# Generated by ai-workflow-overlay. Do not edit directly.');
  sections.push('# Edit agent_docs/ files, then run regenerate.mjs to update.');
  sections.push('');
  sections.push('# Cursor Rules');
  sections.push('');

  // Shared slim content
  sections.push(buildSlimContent(coreDir, agentDocsDir));

  // Project structure
  sections.push('---');
  sections.push('');
  sections.push('## Project Structure');
  sections.push('');
  sections.push('```');
  sections.push('agent_docs/       # Task-specific instructions (see reference table above)');
  sections.push('docs/');
  sections.push('  research/       # Research and design docs');
  sections.push('  plans/          # Implementation plans');
  sections.push('  decisions/      # Architectural Decision Records');
  sections.push('```');
  sections.push('');
  sections.push('Source tree structure is documented in `agent_docs/service_architecture.md`.');
  sections.push('');

  const output = sections.join('\n');

  const outputPath = join(targetDir, '.cursorrules');
  writeFileSync(outputPath, output, 'utf8');

  return outputPath;
}
```

**Step 2: Verify the module loads**

Run: `node -e "import('./adapters/cursor/generate.mjs').then(m => console.log('OK:', typeof m.generateCursorConfig))"`
Expected: `OK: function`

**Step 3: Commit**

```bash
git add adapters/cursor/generate.mjs
git commit -m "refactor(cursor): generate slim reference doc instead of full content dump"
```

---

## Task 5: Create regenerate.mjs script

**Files:**
- Create: `scripts/regenerate.mjs`

**Step 1: Write the regeneration script**

This script detects which adapter outputs exist in the target project and re-runs only those adapters. No interactive prompts. Detects stacks the same way onboard.mjs does.

```javascript
#!/usr/bin/env node
/**
 * Regenerate instruction files (CLAUDE.md, copilot-instructions.md, .cursorrules)
 * from populated agent_docs/ templates.
 *
 * Usage: node scripts/regenerate.mjs --target /path/to/project
 */

import { existsSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const OVERLAY_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const CORE_DIR = join(OVERLAY_ROOT, 'core');

function parseTarget() {
  const i = process.argv.indexOf('--target');
  return i !== -1 && process.argv[i + 1] ? resolve(process.argv[i + 1]) : process.cwd();
}

async function main() {
  const targetDir = parseTarget();
  const agentDocsDir = join(targetDir, 'agent_docs');

  if (!existsSync(agentDocsDir)) {
    console.error('[ERROR] No agent_docs/ directory found. Run onboard.mjs first.');
    process.exit(1);
  }

  console.log(`\nRegenerate instruction files`);
  console.log(`Target: ${targetDir}\n`);

  // Import stack detection from onboard.mjs
  // For simplicity, re-detect stacks using the same logic
  const { detectStacks } = await import('./onboard.mjs');
  let detectedStacks = [];
  try {
    detectedStacks = detectStacks(targetDir);
  } catch {
    // Stack detection is best-effort for regeneration
  }

  const regenerated = [];

  // Copilot
  if (existsSync(join(targetDir, '.github', 'copilot-instructions.md'))) {
    const { generateCopilotConfig } = await import('../adapters/copilot/generate.mjs');
    const out = generateCopilotConfig(targetDir, CORE_DIR, agentDocsDir, detectedStacks);
    regenerated.push(relative(targetDir, out));
  }

  // Claude
  if (existsSync(join(targetDir, 'CLAUDE.md'))) {
    const { generateClaudeConfig } = await import('../adapters/claude/generate.mjs');
    const r = generateClaudeConfig(targetDir, CORE_DIR, agentDocsDir, detectedStacks);
    regenerated.push(relative(targetDir, r.claudeMdPath));
  }

  // Cursor
  if (existsSync(join(targetDir, '.cursorrules'))) {
    const { generateCursorConfig } = await import('../adapters/cursor/generate.mjs');
    const out = generateCursorConfig(targetDir, CORE_DIR, agentDocsDir, detectedStacks);
    regenerated.push(relative(targetDir, out));
  }

  if (regenerated.length === 0) {
    console.log('  No instruction files found to regenerate.');
    console.log('  (Looking for CLAUDE.md, .github/copilot-instructions.md, or .cursorrules)\n');
  } else {
    console.log('  Regenerated:');
    regenerated.forEach((f) => console.log(`    + ${f}`));
    console.log('');
  }
}

main();
```

**Important consideration:** The `detectStacks` function in `onboard.mjs` is currently not exported. We need to either:
- (a) Export it from `onboard.mjs`, or
- (b) Extract it into a shared module, or
- (c) Have `regenerate.mjs` include its own minimal stack detection

Option (a) is simplest. Add `export` to the `detectStacks` function in `onboard.mjs`:

In `scripts/onboard.mjs`, change:
```javascript
function detectStacks(dir) {
```
to:
```javascript
export function detectStacks(dir) {
```

Also export the helper functions it depends on (`readPkg`, `hasDep`, `hasExt`). Actually, since these are module-level functions used by `detectStacks` internally, they don't need to be exported — they just need to be in scope, which they already are. Only `detectStacks` itself needs the export.

**But wait** — `onboard.mjs` calls `main()` at the bottom unconditionally. If we import from it, `main()` will execute. We need to guard the main() call:

Change the bottom of `onboard.mjs` from:
```javascript
main();
```
to:
```javascript
// Only run main() when executed directly, not when imported
const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main();
}
```

**Step 2: Verify the script runs**

Run: `node scripts/regenerate.mjs --target /tmp/test-nonexistent 2>&1 || true`
Expected: `[ERROR] No agent_docs/ directory found.`

**Step 3: Commit**

```bash
git add scripts/regenerate.mjs scripts/onboard.mjs
git commit -m "feat(scripts): add regenerate.mjs for re-running adapters after agent_docs population"
```

---

## Task 6: Update onboarding prompt and summary

**Files:**
- Modify: `scripts/onboard.mjs` (Phase 6 `generatePrompt` function and Phase 7 `summary` function)

**Step 1: Update generatePrompt to include regeneration step**

In the `generatePrompt` function, add a new section to the prompt content after the "Important Rules" section:

```markdown
## Final Step: Regenerate Instruction Files

After populating all agent_docs/ templates, regenerate the instruction files
(CLAUDE.md, copilot-instructions.md, .cursorrules) so they reflect the
populated content:

\`\`\`bash
node ${overlayRelativePath}/scripts/regenerate.mjs --target .
\`\`\`

This updates the instruction files with the correct agent docs reference table.
If this command is not available, the instruction files can be regenerated by
re-running the onboarding script.
```

We need to compute the relative path from the target to the overlay. Add this to the function:

```javascript
const overlayRelativePath = relative(targetDir, OVERLAY_ROOT);
```

**Step 2: Update summary to include regeneration in next steps**

In the `summary` function, update the "Next steps" section:

```javascript
console.log('\n  Next steps:');
console.log('    1. Open your AI agent (Copilot, Claude, etc.)');
console.log('    2. Run the analysis prompt at agent_docs/.onboarding-prompt.md');
console.log('    3. Review the populated agent_docs/');
console.log('    4. Regenerate instruction files: node scripts/regenerate.mjs --target .');
console.log('    5. Commit the overlay files\n');
```

**Step 3: Verify onboard.mjs still parses**

Run: `node -c scripts/onboard.mjs`
Expected: No output (syntax OK)

**Step 4: Commit**

```bash
git add scripts/onboard.mjs
git commit -m "feat(onboard): add regeneration step to analysis prompt and summary"
```

---

## Task 7: End-to-end verification

**Step 1: Run onboard against a temp directory**

```bash
mkdir -p /tmp/test-overlay-slim && cd /tmp/test-overlay-slim && git init
echo '{"name":"test","dependencies":{"react":"^18"}}' > package.json
node /path/to/overlay/scripts/onboard.mjs --target .
```

Answer: proceed with stacks, select Copilot + Claude + Cursor, skip CI.

**Step 2: Verify instruction file lengths**

```bash
wc -l CLAUDE.md .github/copilot-instructions.md .cursorrules
```

Expected: Each file should be under 200 lines.

**Step 3: Verify instruction files reference agent_docs instead of duplicating**

```bash
grep -c 'agent_docs/' CLAUDE.md
grep -c '{{TODO' CLAUDE.md
```

Expected: Multiple `agent_docs/` references, zero `{{TODO}}` occurrences.

**Step 4: Verify .onboarding-prompt.md includes regeneration step**

```bash
grep -l 'regenerate' agent_docs/.onboarding-prompt.md
```

Expected: Match found.

**Step 5: Test regeneration script**

```bash
node /path/to/overlay/scripts/regenerate.mjs --target .
```

Expected: Lists regenerated files.

**Step 6: Clean up**

```bash
rm -rf /tmp/test-overlay-slim
```

**Step 7: Commit (if any fixes were needed)**

```bash
git add -A && git commit -m "fix: address issues found during end-to-end verification"
```
