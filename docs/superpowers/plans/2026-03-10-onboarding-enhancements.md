# Onboarding Enhancements Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance the onboarding system with configurable branching, branch-level CI/CD protection, tiered Copilot instructions for Claude/ChatGPT, an AGENTS.md adapter for OpenAI Codex, superpowers integration, and a README-AGENTIC.md for developer onboarding.

**Architecture:** Branching config collected during onboard and persisted to `agent_docs/.overlay-config.json`. All adapter `generate*` functions change signature to accept `overlayConfig` object and return arrays of file paths. Copilot adapter generates a tiered `.github/instructions/` structure. New Codex adapter generates `AGENTS.md`. Shared utilities extracted for branching content and README-AGENTIC generation.

**Tech Stack:** Node.js ESM, no external dependencies (Node built-ins only), markdown generation.

**Spec:** `docs/superpowers/specs/2026-03-10-onboarding-enhancements-design.md`

---

## Chunk 1: Foundation — Config Persistence & Shared Utilities

### Task 1: Create `adapters/shared/build-branching-content.mjs`

Shared utility that generates dynamic branching markdown from `branchConfig`. Used by all adapters and the tiered Copilot instructions.

**Files:**
- Create: `adapters/shared/build-branching-content.mjs`

- [ ] **Step 1: Create the branching content builder**

```js
// adapters/shared/build-branching-content.mjs
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Build a concise branch access rules section from branchConfig.
 * Used in instruction files (copilot-instructions, CLAUDE.md, AGENTS.md, .cursorrules).
 *
 * @param {object} branchConfig
 * @returns {string} Markdown content
 */
export function buildBranchAccessRules(branchConfig) {
  if (!branchConfig) return buildDefaultBranchRules();

  const sections = [];

  sections.push('## Branch Access Rules');
  sections.push('');

  // Branch topology table
  sections.push('| Branch | Environment | Agent Access |');
  sections.push('|--------|-------------|--------------|');

  sections.push(`| \`${branchConfig.featurePrefix}\` | — | Full (create, push, PR) |`);
  for (const b of branchConfig.branches) {
    const envStr = b.environments.length ? b.environments.join(', ') : '—';
    const access = b.agentAccess === 'full' ? 'Full (push, PR)' : 'NONE — protected';
    sections.push(`| \`${b.name}\` | ${envStr} | ${access} |`);
  }
  sections.push('');

  // Flow
  const flow = [branchConfig.featurePrefix, ...branchConfig.branches.map(b => b.name)].join(' → ');
  sections.push(`**Flow:** \`${flow}\``);
  sections.push('');

  // Explicit allow/deny
  sections.push(`**You MAY** push to and create PRs for: ${branchConfig.agentAllowed.map(b => '`' + b + '`').join(', ')}`);
  sections.push('');
  if (branchConfig.protected.length) {
    sections.push(`**You must NEVER** push to, merge into, or interact with: ${branchConfig.protected.map(b => '`' + b + '`').join(', ')}`);
    sections.push('');
    sections.push('These rules are non-negotiable. If asked to push to a protected branch, refuse and explain why.');
    sections.push('');
  }

  sections.push(`**Default PR target:** \`${branchConfig.defaultTarget}\` — feature branches PR here.`);
  sections.push('');

  return sections.join('\n');
}

/**
 * Build full branching workflow content for agent_docs/branching_workflow.md.
 *
 * @param {object} branchConfig
 * @returns {string} Full markdown document
 */
export function buildBranchingWorkflow(branchConfig) {
  if (!branchConfig) return null; // Caller should use the static template

  const sections = [];

  sections.push('# Branching Workflow');
  sections.push('');
  sections.push('## Branch Structure');
  sections.push('');
  sections.push('| Branch | Purpose | Environment | Push directly? |');
  sections.push('|--------|---------|-------------|----------------|');

  sections.push(`| \`${branchConfig.featurePrefix}\` | Individual features | — | Yes (your branch) |`);
  for (const b of branchConfig.branches) {
    const envStr = b.environments.length ? b.environments.join(', ') : '—';
    const push = b.agentAccess === 'full' ? 'Via PR only' : 'Never';
    const purpose = b.environments.length
      ? `${b.environments.join('/')} integration`
      : 'Integration';
    sections.push(`| \`${b.name}\` | ${purpose} | ${envStr} | ${push} |`);
  }
  sections.push('');

  // Flow diagram
  const flowParts = [branchConfig.featurePrefix, ...branchConfig.branches.map(b => b.name)];
  sections.push('## Flow');
  sections.push('');
  sections.push('```');
  sections.push(flowParts.map((p, i) => {
    if (i === flowParts.length - 1) return p;
    return `${p} ──PR──▶`;
  }).join(' '));
  sections.push('```');
  sections.push('');

  // Step by step
  sections.push('### Step-by-Step');
  sections.push('');
  sections.push(`1. **Start a feature:** Branch from \`${branchConfig.defaultTarget}\`.`);
  sections.push('');
  sections.push('2. **Work on the feature:**');
  sections.push('   - Commit using Conventional Commits: `feat(scope): description`');
  sections.push('   - Push to your feature branch');
  sections.push('');
  sections.push(`3. **Open PR to \`${branchConfig.defaultTarget}\`:**`);
  sections.push(`   - CI runs lint, test, build on PRs to \`${branchConfig.defaultTarget}\``);
  sections.push('   - Review, approve, merge');
  sections.push('');

  // Additional promotion steps for multi-branch flows
  for (let i = 0; i < branchConfig.branches.length - 1; i++) {
    const from = branchConfig.branches[i];
    const to = branchConfig.branches[i + 1];
    const envStr = to.environments.length ? ` (${to.environments.join('/')})` : '';
    sections.push(`${i + 4}. **Promote to \`${to.name}\`${envStr}:**`);
    sections.push(`   - Open PR from \`${from.name}\` to \`${to.name}\``);
    sections.push(`   - After merge: deploys to ${to.environments.join(', ') || 'next environment'}`);
    sections.push('');
  }

  // Rules
  sections.push('## Rules');
  sections.push('');
  sections.push(`- **Never push directly** to ${branchConfig.protected.map(b => '`' + b + '`').join(' or ')} — always use PRs`);
  sections.push(`- **Always branch from \`${branchConfig.defaultTarget}\`**`);
  sections.push('- **One PR per feature** — don\'t bundle unrelated changes');
  sections.push('- **Conventional Commits required** — the changelog parses commit messages');
  sections.push('');

  // Changelog (keep as TODO for analysis prompt to fill)
  sections.push('## Changelog Process');
  sections.push('');
  sections.push('<!-- ONBOARDING: detect changelog tooling — look for scripts/, package.json scripts, or CI steps that generate changelogs -->');
  sections.push('');
  sections.push('{{TODO: detected during onboarding}}');
  sections.push('');

  // Commit types table
  sections.push('### Commit types and changelog sections');
  sections.push('');
  sections.push('| Commit type | Changelog section | Example |');
  sections.push('|-------------|------------------|---------|');
  sections.push('| `feat` | Features | `feat(web): add deck builder` |');
  sections.push('| `fix` | Fixes | `fix(api): correct price calculation` |');
  sections.push('| `refactor` | Improvements | `refactor(web): simplify card grid` |');
  sections.push('| `perf` | Improvements | `perf(api): optimize search query` |');
  sections.push('| `chore`, `docs`, `test`, `ci` | (excluded) | Not user-facing |');
  sections.push('');

  // Hotfix
  sections.push('## Hotfix Flow');
  sections.push('');
  sections.push('For urgent production fixes:');
  sections.push('');
  const prodBranch = branchConfig.branches[branchConfig.branches.length - 1]?.name || 'main';
  sections.push(`1. Branch from \`${prodBranch}\`: \`git checkout -b hotfix/fix-description ${prodBranch}\``);
  sections.push(`2. Fix, commit, PR to \`${prodBranch}\``);
  sections.push(`3. After merge to \`${prodBranch}\`: cherry-pick or merge the fix into \`${branchConfig.defaultTarget}\``);
  sections.push('');

  return sections.join('\n');
}

/**
 * Fallback for when no branchConfig is available (backward compat).
 */
function buildDefaultBranchRules() {
  return `## Git Conventions

| Branch | Purpose |
|--------|---------|
| \`main\` | Production. Auto-deploys. Never push directly. |
| \`develop\` | Integration. All feature branches merge here first. |
| \`feature/<short-description>\` | One per feature. Always branch from \`develop\`. |

**Flow:** \`feature/*\` → PR to \`develop\` → testing → PR to \`main\` → auto-deploy

**Commits:** [Conventional Commits](https://www.conventionalcommits.org/) — \`type(scope): description\`
Types: \`feat\`, \`fix\`, \`chore\`, \`refactor\`, \`test\`, \`docs\`. Scope = app or package name.

See \`agent_docs/branching_workflow.md\` for full branching strategy and release flow.
`;
}
```

- [ ] **Step 2: Verify the file has no syntax errors**

Run: `node -e "import('./adapters/shared/build-branching-content.mjs').then(() => console.log('OK'))"`
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add adapters/shared/build-branching-content.mjs
git commit -m "feat(shared): add dynamic branching content builder"
```

---

### Task 2: Update `adapters/shared/build-slim-content.mjs` — accept `overlayConfig`, dynamic branching

Replace the hardcoded Git Conventions section with dynamic content from `branchConfig`.

**Files:**
- Modify: `adapters/shared/build-slim-content.mjs:1-118`

- [ ] **Step 1: Update the function signature and import**

Change the function signature from `buildSlimContent(coreDir, agentDocsDir)` to `buildSlimContent(coreDir, agentDocsDir, overlayConfig = {})`.

Add import at top:
```js
import { buildBranchAccessRules } from './build-branching-content.mjs';
```

- [ ] **Step 2: Replace the hardcoded Git Conventions section (lines 33-50)**

Replace the hardcoded branch table and flow with:
```js
  // ── Git Conventions ──
  sections.push('---');
  sections.push('');

  const { branchConfig } = overlayConfig;
  sections.push(buildBranchAccessRules(branchConfig));

  sections.push('**Commits:** [Conventional Commits](https://www.conventionalcommits.org/) — `type(scope): description`');
  sections.push('Types: `feat`, `fix`, `chore`, `refactor`, `test`, `docs`. Scope = app or package name.');
  sections.push('');
  sections.push('See `agent_docs/branching_workflow.md` for full branching strategy and release flow.');
  sections.push('');
```

- [ ] **Step 3: Verify no syntax errors**

Run: `node -e "import('./adapters/shared/build-slim-content.mjs').then(() => console.log('OK'))"`
Expected: `OK`

- [ ] **Step 4: Commit**

```bash
git add adapters/shared/build-slim-content.mjs
git commit -m "refactor(shared): accept overlayConfig, use dynamic branching content"
```

---

### Task 3: Update `core/workflow.md` — make git conventions configurable

Replace the hardcoded branch table with language indicating the branching strategy is project-specific and configured during onboarding.

**Files:**
- Modify: `core/workflow.md:112-156`

- [ ] **Step 1: Replace the Git Conventions section**

Replace lines 112-156 (the Branch Structure table, Flow, and Rules subsections) with:

```markdown
### Branch Structure

The branching strategy is configured during onboarding and documented in `agent_docs/branching_workflow.md`. The configuration defines:

- Which branches exist and what environments they map to
- Which branches agents can push to and create PRs for
- Which branches are protected (agents must NEVER interact with)
- The flow direction (e.g., `feature/* → develop → pre-release → release`)

**Always consult `agent_docs/branching_workflow.md` for this project's specific branch rules.**

### Flow

Branch flow varies by project. Common patterns include:

- **Two-branch:** `feature/*` → PR to `develop` → PR to `main`
- **Multi-environment:** `feature/*` → `develop` (dev) → `pre-release` (test) → `release` (prod)

The specific flow for this project is defined during onboarding and documented in `agent_docs/branching_workflow.md` and the generated instruction files.

### Rules

- Always branch from the configured default target branch (typically `develop`).
- Feature branches PR into the default target. Never push directly to protected branches.
- All changes to protected branches go through pull requests.
- Commits happen only during Phase 3 (Implement) and Phase 4 (Validate).
- Research, plan, and decision docs are committed with the first implementation commit.
```

Keep the Commit Format section (lines 136-155) unchanged.

- [ ] **Step 2: Commit**

```bash
git add core/workflow.md
git commit -m "refactor(core): make git conventions configurable per-project"
```

---

### Task 4: Update `core/agent_docs/branching_workflow.md` — parameterized template

Replace the hardcoded template with one that uses `<!-- ONBOARDING: ... -->` comments referencing branchConfig. The onboard script will either dynamically generate this file from branchConfig or fall back to this template.

**Files:**
- Modify: `core/agent_docs/branching_workflow.md:1-75`

- [ ] **Step 1: Replace the entire file contents**

```markdown
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

```
{{TODO: flow diagram populated during onboarding}}
```

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
```

- [ ] **Step 2: Commit**

```bash
git add core/agent_docs/branching_workflow.md
git commit -m "refactor(agent_docs): parameterize branching workflow template"
```

---

## Chunk 2: Adapter Signature Migration

### Task 5: Update Copilot adapter — accept `overlayConfig`, return array

**Files:**
- Modify: `adapters/copilot/generate.mjs:1-53`

- [ ] **Step 1: Update function signature and slim content call**

Change:
```js
export function generateCopilotConfig(targetDir, coreDir, agentDocsDir, detectedStacks = []) {
```
to:
```js
export function generateCopilotConfig(targetDir, coreDir, agentDocsDir, overlayConfig = {}) {
```

Change:
```js
  sections.push(buildSlimContent(coreDir, agentDocsDir));
```
to:
```js
  sections.push(buildSlimContent(coreDir, agentDocsDir, overlayConfig));
```

- [ ] **Step 2: Change return to array**

Change:
```js
  return outputPath;
```
to:
```js
  return [outputPath];
```

- [ ] **Step 3: Verify no syntax errors**

Run: `node -e "import('./adapters/copilot/generate.mjs').then(() => console.log('OK'))"`
Expected: `OK`

- [ ] **Step 4: Commit**

```bash
git add adapters/copilot/generate.mjs
git commit -m "refactor(copilot): accept overlayConfig, return array"
```

---

### Task 6: Update Claude adapter — accept `overlayConfig`, dynamic deny rules

**Files:**
- Modify: `adapters/claude/generate.mjs:1-448`

- [ ] **Step 1: Update `buildSettings` to accept overlayConfig**

Change `buildSettings(detectedStacks)` to `buildSettings(overlayConfig = {})`.

Inside the function, extract stacks:
```js
  const detectedStacks = overlayConfig.detectedStacks || [];
```

After building base deny rules, add dynamic branch protection:
```js
  // Dynamic branch protection from branchConfig
  const { branchConfig } = overlayConfig;
  if (branchConfig?.protected?.length) {
    for (const branch of branchConfig.protected) {
      deny.push(`Bash(git push*${branch}*)`);
      deny.push(`Bash(git merge*${branch}*)`);
      deny.push(`Bash(git checkout -b ${branch}*)`);
    }
  }
```

- [ ] **Step 2: Update `buildClaudeMd` signature**

Change `buildClaudeMd(coreDir, agentDocsDir, detectedStacks)` to `buildClaudeMd(coreDir, agentDocsDir, overlayConfig = {})`.

Extract stacks for the tech stack and commands sections:
```js
  const detectedStacks = overlayConfig.detectedStacks || [];
```

Update the `buildSlimContent` call:
```js
  sections.push(buildSlimContent(coreDir, agentDocsDir, overlayConfig));
```

- [ ] **Step 3: Add 4-phase workflow and superpowers reference**

After the Memory section (before the final return), add:
```js
  // Superpowers / 4-phase workflow (Claude-specific)
  if (overlayConfig.superpowersInstalled) {
    sections.push('---');
    sections.push('');
    sections.push('## Superpowers Integration');
    sections.push('');
    sections.push('This project uses the superpowers plugin for structured AI workflows.');
    sections.push('When starting tasks, invoke the appropriate skill:');
    sections.push('');
    sections.push('| Phase | Skill | When to use |');
    sections.push('|-------|-------|-------------|');
    sections.push('| Brainstorm | `superpowers:brainstorming` | New features, design decisions |');
    sections.push('| Plan | `superpowers:writing-plans` | After design is approved |');
    sections.push('| Execute | `superpowers:subagent-driven-development` | Implementing from a plan |');
    sections.push('| Complete | `superpowers:finishing-a-development-branch` | Work is done, ready to merge |');
    sections.push('');
  }
```

- [ ] **Step 4: Update `generateClaudeConfig` public API**

Change signature to accept `overlayConfig`:
```js
export function generateClaudeConfig(targetDir, coreDir, agentDocsDir, overlayConfig = {}) {
```

Update internal calls:
```js
  const claudeMdContent = buildClaudeMd(coreDir, agentDocsDir, overlayConfig);
  const settings = buildSettings(overlayConfig);
```

Change return to include array of paths:
```js
  return {
    claudeMdPath,
    settingsPath,
    copiedFiles,
    paths: [claudeMdPath, settingsPath],
  };
```

- [ ] **Step 5: Verify no syntax errors**

Run: `node -e "import('./adapters/claude/generate.mjs').then(() => console.log('OK'))"`
Expected: `OK`

- [ ] **Step 6: Commit**

```bash
git add adapters/claude/generate.mjs
git commit -m "refactor(claude): accept overlayConfig, add dynamic deny rules and superpowers"
```

---

### Task 7: Update Cursor adapter — accept `overlayConfig`, return array

**Files:**
- Modify: `adapters/cursor/generate.mjs:1-49`

- [ ] **Step 1: Update function signature**

Change:
```js
export function generateCursorConfig(targetDir, coreDir, agentDocsDir, detectedStacks = []) {
```
to:
```js
export function generateCursorConfig(targetDir, coreDir, agentDocsDir, overlayConfig = {}) {
```

Update slim content call:
```js
  sections.push(buildSlimContent(coreDir, agentDocsDir, overlayConfig));
```

- [ ] **Step 2: Change return to array**

Change `return outputPath;` to `return [outputPath];`

- [ ] **Step 3: Commit**

```bash
git add adapters/cursor/generate.mjs
git commit -m "refactor(cursor): accept overlayConfig, return array"
```

---

## Chunk 3: New Adapters & Content Generators

### Task 8: Create Codex adapter — `adapters/codex/generate.mjs`

**Files:**
- Create: `adapters/codex/generate.mjs`
- Create: `adapters/codex/README.md`

- [ ] **Step 1: Create the adapter**

```js
// adapters/codex/generate.mjs
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildSlimContent } from '../shared/build-slim-content.mjs';
import { buildBranchAccessRules } from '../shared/build-branching-content.mjs';

/**
 * Generates AGENTS.md for OpenAI Codex CLI.
 *
 * Written at higher verbosity than CLAUDE.md — ChatGPT benefits from
 * explicit step-by-step instructions and stronger guardrail reinforcement.
 *
 * @param {string} targetDir
 * @param {string} coreDir
 * @param {string} agentDocsDir
 * @param {object} overlayConfig
 * @returns {string[]} Array of generated file paths
 */
export function generateCodexConfig(targetDir, coreDir, agentDocsDir, overlayConfig = {}) {
  const { branchConfig } = overlayConfig;
  const sections = [];

  sections.push('<!-- Generated by ai-workflow-overlay. Do not edit directly. -->');
  sections.push('<!-- Edit agent_docs/ files, then run regenerate.mjs to update. -->');
  sections.push('');
  sections.push('# AGENTS.md');
  sections.push('');
  sections.push('This file provides project instructions for OpenAI Codex and ChatGPT-based coding agents.');
  sections.push('');

  // Explicit 4-phase workflow — verbose for ChatGPT
  sections.push('## IMPORTANT: Development Workflow');
  sections.push('');
  sections.push('You MUST follow this 4-phase workflow for every significant task. Do NOT skip phases.');
  sections.push('');
  sections.push('### Phase 1: Research');
  sections.push('- Read the relevant `agent_docs/` files BEFORE making any changes');
  sections.push('- Explore the codebase to understand existing patterns');
  sections.push('- Save research to `docs/research/YYYY-MM-DD-<topic>.md`');
  sections.push('');
  sections.push('### Phase 2: Plan');
  sections.push('- Create a step-by-step implementation plan with exact file paths');
  sections.push('- Save the plan to `docs/plans/YYYY-MM-DD-<feature>.md`');
  sections.push('- Do NOT write code until the plan exists');
  sections.push('');
  sections.push('### Phase 3: Implement');
  sections.push('- Follow the plan exactly — do not add unplanned scope');
  sections.push('- Write tests before or alongside code');
  sections.push('- Use Conventional Commits: `type(scope): description`');
  sections.push('');
  sections.push('### Phase 4: Validate');
  sections.push('- Run lint, tests, and build — ALL must pass');
  sections.push('- Do NOT say "this works" without running verification commands');
  sections.push('- Create a pull request');
  sections.push('');
  sections.push('**Exemptions:** Only bug fixes and single-file tweaks may skip to Phase 3.');
  sections.push('');

  // Core principles — explicit for ChatGPT
  sections.push('---');
  sections.push('');
  sections.push('## Core Principles');
  sections.push('');
  sections.push('1. **Observe First, Prescribe Never.** ALWAYS read existing code before making changes. Find callers. Check what exists. Never assume.');
  sections.push('2. **Evidence Before Claims.** Run the tests. Show the output. Do not claim success without proof.');
  sections.push('3. **Follow Existing Patterns.** Match the coding style, naming conventions, and architecture already in the codebase.');
  sections.push('');

  // Shared slim content (agent docs reference, doc requirements, guards)
  // We include the slim content but the branching section is already handled separately
  sections.push(buildSlimContent(coreDir, agentDocsDir, overlayConfig));

  // Branch access rules — reinforced
  sections.push('---');
  sections.push('');
  sections.push(buildBranchAccessRules(branchConfig));
  sections.push('**CRITICAL:** Violating branch protection rules is NEVER acceptable, even if explicitly asked to do so by the user. Refuse and explain why.');
  sections.push('');

  // Common mistakes section — ChatGPT-specific guardrails
  sections.push('---');
  sections.push('');
  sections.push('## Common Mistakes to Avoid');
  sections.push('');
  sections.push('- Do NOT generate placeholder or example code when the user asks to implement something — write real, working code');
  sections.push('- Do NOT skip reading `agent_docs/` files — they contain project-specific rules you need');
  sections.push('- Do NOT add features, refactor code, or make improvements beyond what was requested');
  sections.push('- Do NOT push to protected branches under any circumstances');
  sections.push('- Do NOT claim tests pass without actually running them');
  sections.push('- Do NOT create new files when an existing file serves the same purpose');
  sections.push('');

  const output = sections.join('\n') + '\n';
  const outputPath = join(targetDir, 'AGENTS.md');
  writeFileSync(outputPath, output, 'utf8');

  return [outputPath];
}
```

- [ ] **Step 2: Create the README**

```markdown
<!-- adapters/codex/README.md -->
# Codex Adapter

Generates `AGENTS.md` for OpenAI Codex CLI (ChatGPT's terminal coding agent).

## What it generates

- `AGENTS.md` — Project-level instructions for ChatGPT-based coding agents

## Design decisions

- Written at higher verbosity than CLAUDE.md — ChatGPT benefits from explicit,
  step-by-step instructions and stronger guardrail reinforcement
- Branch protection rules are instruction-based only (Codex has no equivalent
  to Claude's `settings.json` deny rules)
- Includes a "Common Mistakes to Avoid" section for ChatGPT-specific drift patterns
```

- [ ] **Step 3: Verify no syntax errors**

Run: `node -e "import('./adapters/codex/generate.mjs').then(() => console.log('OK'))"`
Expected: `OK`

- [ ] **Step 4: Commit**

```bash
git add adapters/codex/generate.mjs adapters/codex/README.md
git commit -m "feat(codex): add AGENTS.md adapter for OpenAI Codex CLI"
```

---

### Task 9: Create tiered Copilot instruction file generators

Extend the Copilot adapter to generate the `.github/instructions/` sub-files.

**Files:**
- Modify: `adapters/copilot/generate.mjs`

- [ ] **Step 1: Add imports and helper functions**

Add to top of file:
```js
import { buildBranchAccessRules } from '../shared/build-branching-content.mjs';
```

- [ ] **Step 2: Add generator functions for each instruction file**

After the existing `generateCopilotConfig` function, add:

```js
/**
 * Generate .github/instructions/claude.instructions.md
 */
function generateClaudeInstructions(targetDir, overlayConfig) {
  const sections = [];
  sections.push('---');
  sections.push('applyTo: "**"');
  sections.push('---');
  sections.push('');
  sections.push('# Claude-Specific Instructions');
  sections.push('');
  sections.push('These instructions apply when Claude is the selected model in GitHub Copilot.');
  sections.push('');
  sections.push('## Strengths to Leverage');
  sections.push('');
  sections.push('- Claude follows complex, multi-step instructions precisely — reference `agent_docs/` files by exact path');
  sections.push('- Claude is concise by default — do not pad responses with unnecessary explanation');
  sections.push('- Claude handles large context well — when analyzing, read full files rather than snippets');
  sections.push('');
  sections.push('## Tool Use Patterns');
  sections.push('');
  sections.push('- Read files before editing them — understand context first');
  sections.push('- Use dedicated search tools (Grep, Glob) instead of shell commands');
  sections.push('- Prefer editing existing files over creating new ones');
  sections.push('');
  sections.push('## Model Routing (Claude Code CLI)');
  sections.push('');
  sections.push('When using Claude Code CLI with subagents:');
  sections.push('');
  sections.push('| Task type | Model | Examples |');
  sections.push('|-----------|-------|---------|');
  sections.push('| Research, architecture | `opus` | Brainstorming, design review |');
  sections.push('| Code implementation | `sonnet` | Writing features, tests |');
  sections.push('| File search, lookups | `haiku` | Grep/glob, running commands |');
  sections.push('');

  if (overlayConfig.superpowersInstalled) {
    sections.push('## Superpowers Skills');
    sections.push('');
    sections.push('This project uses superpowers. Invoke skills before starting work:');
    sections.push('');
    sections.push('| Phase | Skill |');
    sections.push('|-------|-------|');
    sections.push('| Brainstorm | `superpowers:brainstorming` |');
    sections.push('| Plan | `superpowers:writing-plans` |');
    sections.push('| Execute | `superpowers:subagent-driven-development` |');
    sections.push('| Complete | `superpowers:finishing-a-development-branch` |');
    sections.push('');
  }

  const dir = join(targetDir, '.github', 'instructions');
  mkdirSync(dir, { recursive: true });
  const outputPath = join(dir, 'claude.instructions.md');
  writeFileSync(outputPath, sections.join('\n') + '\n', 'utf8');
  return outputPath;
}

/**
 * Generate .github/instructions/chatgpt.instructions.md
 */
function generateChatGPTInstructions(targetDir) {
  const sections = [];
  sections.push('---');
  sections.push('applyTo: "**"');
  sections.push('---');
  sections.push('');
  sections.push('# ChatGPT-Specific Instructions');
  sections.push('');
  sections.push('These instructions apply when ChatGPT is the selected model in GitHub Copilot.');
  sections.push('');
  sections.push('## CRITICAL WORKFLOW RULES');
  sections.push('');
  sections.push('You MUST follow these rules for EVERY task:');
  sections.push('');
  sections.push('1. **READ before you WRITE.** Before modifying any file, read it first. Before adding a new file, check if one already exists for that purpose.');
  sections.push('2. **PLAN before you CODE.** For any task larger than a single-file bug fix, create a plan in `docs/plans/` before writing code.');
  sections.push('3. **TEST before you CLAIM.** Never say "this works" or "tests pass" without actually running the tests and showing the output.');
  sections.push('4. **FOLLOW existing patterns.** Match the coding style, naming conventions, and architecture already in the codebase. Do not introduce new patterns without justification.');
  sections.push('');
  sections.push('## Things You Must NOT Do');
  sections.push('');
  sections.push('- Do NOT generate placeholder or mock implementations when asked to build real features');
  sections.push('- Do NOT add extra features, improvements, or refactoring beyond what was requested');
  sections.push('- Do NOT create documentation files unless explicitly asked');
  sections.push('- Do NOT skip reading the `agent_docs/` files — they contain project-specific rules');
  sections.push('- Do NOT push to or merge into protected branches (see branching.instructions.md)');
  sections.push('- Do NOT claim completion without running verification (lint, test, build)');
  sections.push('');
  sections.push('## Step-by-Step Process');
  sections.push('');
  sections.push('For every task, follow this exact sequence:');
  sections.push('');
  sections.push('1. Read the relevant `agent_docs/` file for context');
  sections.push('2. Read the files you plan to modify');
  sections.push('3. Search for all callers/importers of anything you plan to change');
  sections.push('4. Make the change');
  sections.push('5. Run tests and lint');
  sections.push('6. Verify all pass before declaring done');
  sections.push('');
  sections.push('## Commit Format');
  sections.push('');
  sections.push('Use Conventional Commits — `type(scope): description`');
  sections.push('');
  sections.push('Types: `feat`, `fix`, `chore`, `refactor`, `test`, `docs`');
  sections.push('');

  const dir = join(targetDir, '.github', 'instructions');
  mkdirSync(dir, { recursive: true });
  const outputPath = join(dir, 'chatgpt.instructions.md');
  writeFileSync(outputPath, sections.join('\n') + '\n', 'utf8');
  return outputPath;
}

/**
 * Generate .github/instructions/branching.instructions.md
 */
function generateBranchingInstructions(targetDir, overlayConfig) {
  const { branchConfig } = overlayConfig;
  const sections = [];
  sections.push('---');
  sections.push('applyTo: "**"');
  sections.push('description: "Branch workflow and protection rules"');
  sections.push('---');
  sections.push('');
  sections.push('# Branching Workflow');
  sections.push('');
  sections.push(buildBranchAccessRules(branchConfig));

  const dir = join(targetDir, '.github', 'instructions');
  mkdirSync(dir, { recursive: true });
  const outputPath = join(dir, 'branching.instructions.md');
  writeFileSync(outputPath, sections.join('\n') + '\n', 'utf8');
  return outputPath;
}

/**
 * Generate .github/instructions/ci-pipeline.instructions.md
 */
function generateCIPipelineInstructions(targetDir, overlayConfig) {
  const { branchConfig, ciProvider } = overlayConfig;
  const sections = [];
  sections.push('---');
  sections.push('applyTo: "**/.github/**,**/azure-pipelines*,**/Jenkinsfile,**/.gitlab-ci*,**/Dockerfile,**/docker-compose*"');
  sections.push('description: "CI/CD pipeline interaction rules"');
  sections.push('---');
  sections.push('');
  sections.push('# CI/CD Pipeline Rules');
  sections.push('');

  if (ciProvider) {
    const providerName = ciProvider === 'azure-devops' ? 'Azure DevOps Pipelines' : 'GitHub Actions';
    sections.push(`**Detected pipeline:** ${providerName}`);
    sections.push('');
  }

  sections.push('## What You CAN Do');
  sections.push('');
  sections.push('- Write commit messages that follow Conventional Commits format');
  if (branchConfig) {
    sections.push(`- Push to allowed branches: ${branchConfig.agentAllowed.map(b => '`' + b + '`').join(', ')}`);
  }
  sections.push('- Create pull requests');
  sections.push('- Check pipeline/build status');
  sections.push('');

  sections.push('## What You Must NEVER Do');
  sections.push('');
  sections.push('- Deploy to any environment directly');
  sections.push('- Modify pipeline configuration files without explicit user approval');
  if (branchConfig?.protected?.length) {
    sections.push(`- Push to or merge into protected branches: ${branchConfig.protected.map(b => '`' + b + '`').join(', ')}`);
  }
  sections.push('- Skip CI checks or add `[skip ci]` to commit messages without explicit approval');
  sections.push('');

  sections.push('## Commit Messages and CI');
  sections.push('');
  sections.push('Use Conventional Commits: `type(scope): description`');
  sections.push('');
  sections.push('CI runs automatically on pull requests. If CI fails, diagnose and fix — do not skip.');
  sections.push('');

  const dir = join(targetDir, '.github', 'instructions');
  mkdirSync(dir, { recursive: true });
  const outputPath = join(dir, 'ci-pipeline.instructions.md');
  writeFileSync(outputPath, sections.join('\n') + '\n', 'utf8');
  return outputPath;
}
```

- [ ] **Step 3: Update `generateCopilotConfig` to call the sub-generators and return array**

At the end of `generateCopilotConfig`, before the return, add:

```js
  // Generate tiered instruction files
  const paths = [outputPath];
  paths.push(generateClaudeInstructions(targetDir, overlayConfig));
  paths.push(generateChatGPTInstructions(targetDir));
  paths.push(generateBranchingInstructions(targetDir, overlayConfig));
  paths.push(generateCIPipelineInstructions(targetDir, overlayConfig));

  return paths;
```

Also add `mkdirSync` to the imports at the top of the file.

- [ ] **Step 4: Verify no syntax errors**

Run: `node -e "import('./adapters/copilot/generate.mjs').then(() => console.log('OK'))"`
Expected: `OK`

- [ ] **Step 5: Commit**

```bash
git add adapters/copilot/generate.mjs
git commit -m "feat(copilot): add tiered instruction files for Claude, ChatGPT, branching, CI"
```

---

### Task 10: Create `adapters/shared/build-readme-agentic.mjs`

**Files:**
- Create: `adapters/shared/build-readme-agentic.mjs`

- [ ] **Step 1: Create the README-AGENTIC generator**

```js
// adapters/shared/build-readme-agentic.mjs
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Generate README-AGENTIC.md for the target project.
 *
 * @param {string} targetDir
 * @param {object} overlayConfig
 * @returns {string} Path to the generated file
 */
export function generateReadmeAgentic(targetDir, overlayConfig = {}) {
  const { branchConfig, selectedAgents = [], superpowersInstalled } = overlayConfig;
  const sections = [];

  sections.push('# AI Workflow Guide');
  sections.push('');
  sections.push('This project uses an AI workflow overlay that provides structured instructions for AI coding assistants. The overlay ensures consistent behavior across different AI models and tools.');
  sections.push('');

  // 4-phase workflow
  sections.push('## The 4-Phase Workflow');
  sections.push('');
  sections.push('Every significant task follows four phases in order. Do not skip phases.');
  sections.push('');
  sections.push('| Phase | Goal | Output |');
  sections.push('|-------|------|--------|');
  sections.push('| **1. Research** | Understand the problem before writing code | `docs/research/YYYY-MM-DD-<topic>.md` |');
  sections.push('| **2. Plan** | Create a step-by-step implementation plan | `docs/plans/YYYY-MM-DD-<feature>.md` |');
  sections.push('| **3. Implement** | Execute the plan, test-first | Commits on feature branch |');
  sections.push('| **4. Validate** | Verify correctness — lint, test, build | PR ready for review |');
  sections.push('');
  sections.push('Bug fixes and single-file tweaks may skip to Implement directly.');
  sections.push('');

  // Instruction files table
  sections.push('## Instruction Files');
  sections.push('');
  sections.push('The overlay generates instruction files for different AI tools. Each file serves a specific purpose:');
  sections.push('');
  sections.push('| File | Tool / Platform | Purpose |');
  sections.push('|------|----------------|---------|');
  sections.push('| `.github/copilot-instructions.md` | GitHub Copilot (VS Code) | Universal workflow rules for all Copilot interactions, regardless of which AI model is selected |');
  sections.push('| `.github/instructions/claude.instructions.md` | GitHub Copilot + Claude | Claude-specific patterns and optimizations |');
  sections.push('| `.github/instructions/chatgpt.instructions.md` | GitHub Copilot + ChatGPT | ChatGPT-specific reinforcements and guardrails |');
  sections.push('| `.github/instructions/branching.instructions.md` | GitHub Copilot (all models) | Branch workflow, environment mappings, and access rules |');
  sections.push('| `.github/instructions/ci-pipeline.instructions.md` | GitHub Copilot (all models) | CI/CD pipeline interaction rules |');

  if (selectedAgents.includes('claude')) {
    sections.push('| `CLAUDE.md` | Claude Code (CLI) | Project instructions for Claude Code\'s standalone terminal agent |');
  }
  if (selectedAgents.includes('codex')) {
    sections.push('| `AGENTS.md` | OpenAI Codex (CLI) | Project instructions for OpenAI\'s Codex terminal agent |');
  }
  if (selectedAgents.includes('cursor')) {
    sections.push('| `.cursorrules` | Cursor IDE | Project instructions for Cursor\'s AI assistant |');
  }
  sections.push('');

  sections.push('**GitHub Copilot** is the primary target. The `copilot-instructions.md` file works with any model selected in Copilot (Claude, ChatGPT, etc.). The model-specific instruction files in `.github/instructions/` provide additional guidance tailored to each model\'s strengths.');
  sections.push('');

  // Documentation locations
  sections.push('## Documentation Locations');
  sections.push('');
  sections.push('| Directory | Purpose |');
  sections.push('|-----------|---------|');
  sections.push('| `agent_docs/` | AI-readable project documentation — architecture, conventions, workflows, testing |');
  sections.push('| `docs/research/` | Research and design documents created during the Research phase |');
  sections.push('| `docs/plans/` | Implementation plans created during the Plan phase |');
  sections.push('| `docs/decisions/` | Architecture Decision Records (ADRs) for design choices with alternatives |');
  sections.push('');

  // Branch conventions
  if (branchConfig) {
    sections.push('## Branch Conventions');
    sections.push('');
    sections.push('| Branch | Environment | Agent Access |');
    sections.push('|--------|-------------|--------------|');
    sections.push(`| \`${branchConfig.featurePrefix}\` | — | Full |`);
    for (const b of branchConfig.branches) {
      const envStr = b.environments.length ? b.environments.join(', ') : '—';
      const access = b.agentAccess === 'full' ? 'Full' : 'Protected — no agent access';
      sections.push(`| \`${b.name}\` | ${envStr} | ${access} |`);
    }
    sections.push('');
    const flow = [branchConfig.featurePrefix, ...branchConfig.branches.map(b => b.name)].join(' → ');
    sections.push(`**Flow:** \`${flow}\``);
    sections.push('');
    sections.push(`AI agents may push to: ${branchConfig.agentAllowed.map(b => '`' + b + '`').join(', ')}`);
    sections.push('');
    if (branchConfig.protected.length) {
      sections.push(`AI agents must NEVER interact with: ${branchConfig.protected.map(b => '`' + b + '`').join(', ')}`);
      sections.push('');
    }
  }

  // Superpowers
  sections.push('## Superpowers Plugin');
  sections.push('');
  if (superpowersInstalled) {
    sections.push('This project has superpowers integrated. It provides structured skills for each workflow phase:');
  } else {
    sections.push('The superpowers plugin is recommended for enhanced AI workflow. It provides structured skills for each workflow phase:');
  }
  sections.push('');
  sections.push('| Phase | Skill | Purpose |');
  sections.push('|-------|-------|---------|');
  sections.push('| Brainstorm | `superpowers:brainstorming` | Explore requirements, propose approaches |');
  sections.push('| Plan | `superpowers:writing-plans` | Create bite-sized implementation plans |');
  sections.push('| Execute | `superpowers:subagent-driven-development` | Implement task-by-task with review |');
  sections.push('| Complete | `superpowers:finishing-a-development-branch` | Verify, review, merge/PR |');
  sections.push('');
  if (!superpowersInstalled) {
    sections.push('**To install:** In Claude Code, run `/install-plugin superpowers` or visit the plugin marketplace.');
    sections.push('');
  }

  // Keeping docs updated
  sections.push('## Keeping Documentation Updated');
  sections.push('');
  sections.push('After modifying `agent_docs/` files, regenerate the instruction files:');
  sections.push('');
  sections.push('```bash');
  sections.push('node scripts/regenerate.mjs --target .');
  sections.push('```');
  sections.push('');
  sections.push('Update `agent_docs/` when:');
  sections.push('- New patterns or conventions are established');
  sections.push('- Architecture changes (new services, packages, or layers)');
  sections.push('- Build or test commands change');
  sections.push('- Branching or deployment process changes');
  sections.push('');

  const output = sections.join('\n') + '\n';
  const outputPath = join(targetDir, 'README-AGENTIC.md');
  writeFileSync(outputPath, output, 'utf8');
  return outputPath;
}
```

- [ ] **Step 2: Verify no syntax errors**

Run: `node -e "import('./adapters/shared/build-readme-agentic.mjs').then(() => console.log('OK'))"`
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add adapters/shared/build-readme-agentic.mjs
git commit -m "feat(shared): add README-AGENTIC.md generator"
```

---

## Chunk 4: Onboarding Script & Regeneration

### Task 11: Update `scripts/onboard.mjs` — branching prompts, superpowers, config persistence

This is the largest modification. The onboard script needs new phases inserted between the existing ones.

**Files:**
- Modify: `scripts/onboard.mjs:1-407`

- [ ] **Step 1: Add new imports at the top**

After the existing imports, add:
```js
import { buildBranchingWorkflow } from '../adapters/shared/build-branching-content.mjs';
import { generateReadmeAgentic } from '../adapters/shared/build-readme-agentic.mjs';
```

- [ ] **Step 2: Add branching strategy prompt function**

After the `selectAgents` function (line 120), add:

```js
// ─── Phase 3b: Branching strategy ─────────────────────────────────────────

async function collectBranchConfig(rl, targetDir) {
  header('Branching Strategy');
  info('Configure how branches map to environments and agent access.');
  console.log('');

  // Detect existing branches for context
  let existingBranches = [];
  try {
    const raw = execSync('git branch -r', { cwd: targetDir, stdio: 'pipe' }).toString().trim();
    existingBranches = raw.split('\n').map(b => b.trim().replace('origin/', '')).filter(b => b && !b.includes('HEAD'));
    if (existingBranches.length) {
      info(`Detected remote branches: ${existingBranches.join(', ')}`);
      console.log('');
    }
  } catch { /* ignore */ }

  const branchesRaw = (await ask(rl, '  What branches does your project use? (comma-separated)\n  > ')).trim();
  const branchNames = branchesRaw.split(',').map(b => b.trim()).filter(Boolean);

  if (!branchNames.length) {
    info('No branches specified. Using default: develop.');
    return {
      branches: [{ name: 'develop', environments: [], agentAccess: 'full' }],
      featurePrefix: 'feature/*',
      defaultTarget: 'develop',
      protected: [],
      agentAllowed: ['feature/*', 'develop'],
    };
  }

  console.log('');
  info('For each branch, what environment does it map to? (comma-separated, or "none")');
  const branches = [];
  for (const name of branchNames) {
    const envRaw = (await ask(rl, `  ${name} → `)).trim();
    const environments = envRaw.toLowerCase() === 'none' || !envRaw
      ? []
      : envRaw.split(',').map(e => e.trim()).filter(Boolean);
    branches.push({ name, environments, agentAccess: 'full' });
  }

  console.log('');
  const allowedRaw = (await ask(rl, '  Which branches can AI agents push to / create PRs for? (comma-separated)\n  > ')).trim();
  const agentAllowed = allowedRaw.split(',').map(b => b.trim()).filter(Boolean);
  // Always include feature prefix
  if (!agentAllowed.some(b => b.includes('feature'))) {
    agentAllowed.unshift('feature/*');
  }

  console.log('');
  const protectedRaw = (await ask(rl, '  Which branches are protected? (agents must NEVER push to, comma-separated)\n  > ')).trim();
  const protectedBranches = protectedRaw.split(',').map(b => b.trim()).filter(Boolean);

  // Mark protected branches
  for (const b of branches) {
    if (protectedBranches.includes(b.name)) {
      b.agentAccess = 'none';
    }
  }

  console.log('');
  const defaultTarget = (await ask(rl, `  Default PR target for feature branches? [${branchNames[0]}]: `)).trim() || branchNames[0];

  const featurePrefix = 'feature/*';

  return {
    branches,
    featurePrefix,
    defaultTarget,
    protected: protectedBranches,
    agentAllowed,
  };
}
```

- [ ] **Step 3: Add superpowers detection and prompt function**

After the branching function, add:

```js
// ─── Phase 3c: Superpowers ────────────────────────────────────────────────

async function handleSuperpowers(rl) {
  header('Superpowers Plugin');
  info('The superpowers plugin provides a structured 4-phase AI workflow:');
  info('  Brainstorm → Plan → Execute → Complete');
  console.log('');

  // Detect if already installed
  const homedir = process.env.HOME || process.env.USERPROFILE || '';
  const pluginDir = join(homedir, '.claude', 'plugins', 'cache', 'claude-plugins-official', 'superpowers');
  const isInstalled = existsSync(pluginDir);

  if (isInstalled) {
    ok('Superpowers plugin is already installed.');
    return true;
  }

  const ans = (await ask(rl, '  Install superpowers for Claude Code? [Y/n]: ')).trim().toLowerCase();
  if (ans === 'n') {
    info('Skipped. You can install later — see README-AGENTIC.md for instructions.');
    return false;
  }

  console.log('');
  info('To install superpowers, run this in Claude Code:');
  console.log('');
  console.log('    /install-plugin superpowers');
  console.log('');
  info('(The onboard script cannot install Claude Code plugins directly.)');
  ok('Superpowers integration noted. Generated files will reference the 4-phase workflow.');
  return true;
}
```

- [ ] **Step 4: Update the `main()` function flow**

Replace the current `main()` function (lines 356-399) with:

```js
async function main() {
  const targetDir = parseTarget();
  console.log(`\ncopilot-workflow-base onboarding`);
  console.log(`Target: ${targetDir}`);

  const rl = makeRl();

  try {
    // Phase 1: Pre-flight
    const overlayExists = preflight(targetDir);
    if (overlayExists) {
      warn('Overlay already detected (agent_docs/ or copilot-instructions.md found).');
      const ans = (await ask(rl, '  Re-run to update? [y/N]: ')).trim().toLowerCase();
      if (ans !== 'y') { console.log('\n  No changes made.\n'); rl.close(); process.exit(0); }
    }

    // Phase 2: Stack detection
    header('Stack Detection');
    const detectedStacks = detectStacks(targetDir);
    info(detectedStacks.length ? `Detected: ${detectedStacks.join(', ')}` : 'No known stack detected. Applying generic overlay.');
    const confirmStack = (await ask(rl, '\n  Proceed with detected stacks? [Y/n]: ')).trim().toLowerCase();
    if (confirmStack === 'n') { info('Aborted.'); rl.close(); process.exit(0); }

    // Phase 3a: Agent selection
    const agents = await selectAgents(rl);

    // Phase 3b: Branching strategy
    const branchConfig = await collectBranchConfig(rl, targetDir);

    // Phase 3c: Superpowers
    const superpowersInstalled = await handleSuperpowers(rl);

    // Phase 4: CI detection
    const ciSelection = await detectCI(rl, targetDir);

    // Determine CI provider
    let ciProvider = null;
    if (ciSelection.includes('azure-devops')) ciProvider = 'azure-devops';
    else if (ciSelection.includes('github-actions')) ciProvider = 'github-actions';

    // Build overlay config
    const overlayConfig = {
      version: 1,
      detectedStacks,
      branchConfig,
      selectedAgents: agents,
      ciProvider,
      superpowersInstalled,
    };

    rl.close();

    // Phase 5: File generation
    const { created, agentDocsDest } = await generateFiles(targetDir, overlayConfig, agents, ciSelection);

    // Write overlay config
    const configPath = join(agentDocsDest, '.overlay-config.json');
    writeFileSync(configPath, JSON.stringify(overlayConfig, null, 2) + '\n', 'utf8');
    created.push('agent_docs/.overlay-config.json');

    // Generate README-AGENTIC.md
    const readmePath = generateReadmeAgentic(targetDir, overlayConfig);
    created.push(relative(targetDir, readmePath));
    ok('README-AGENTIC.md');

    // Phase 6: Analysis prompt
    const promptPath = generatePrompt(targetDir, detectedStacks, agentDocsDest, branchConfig);
    created.push(relative(targetDir, promptPath));

    // Phase 7: Summary
    summary(targetDir, created, detectedStacks);
  } catch (err) {
    rl.close();
    console.error(`\n[ERROR] ${err.message}`);
    process.exit(1);
  }
}
```

- [ ] **Step 5: Update `generateFiles` to pass overlayConfig to adapters**

Change the function signature from:
```js
async function generateFiles(targetDir, detectedStacks, agents, ciSelection) {
```
to:
```js
async function generateFiles(targetDir, overlayConfig, agents, ciSelection) {
```

Update the adapter dispatch section (lines 211-229). Replace the entire for-loop with:

```js
  // d-e. Adapter generators
  for (const agent of agents) {
    const genPath = join(OVERLAY_ROOT, 'adapters', agent, 'generate.mjs');
    if (!existsSync(genPath)) continue;
    try {
      const mod = await import(genPath);
      if (agent === 'copilot' && mod.generateCopilotConfig) {
        const paths = mod.generateCopilotConfig(targetDir, CORE_DIR, agentDocsDest, overlayConfig);
        for (const p of paths) created.push(relative(targetDir, p));
        ok(`Copilot: ${paths.length} files generated`);
      } else if (agent === 'claude' && mod.generateClaudeConfig) {
        const r = mod.generateClaudeConfig(targetDir, CORE_DIR, agentDocsDest, overlayConfig);
        for (const p of r.paths) created.push(relative(targetDir, p));
        ok(`Claude: CLAUDE.md + .claude/settings.json`);
      } else if (agent === 'cursor' && mod.generateCursorConfig) {
        const paths = mod.generateCursorConfig(targetDir, CORE_DIR, agentDocsDest, overlayConfig);
        for (const p of paths) created.push(relative(targetDir, p));
        ok(`Cursor: ${paths.length} files generated`);
      } else if (agent === 'codex' && mod.generateCodexConfig) {
        const paths = mod.generateCodexConfig(targetDir, CORE_DIR, agentDocsDest, overlayConfig);
        for (const p of paths) created.push(relative(targetDir, p));
        ok(`Codex: AGENTS.md`);
      }
    } catch (e) { warn(`${agent} adapter failed: ${e.message}`); }
  }
```

- [ ] **Step 6: Update `selectAgents` to include Codex option**

Replace the `selectAgents` function with:

```js
async function selectAgents(rl) {
  header('Agent Selection');
  info('GitHub Copilot configuration will be generated by default.');
  console.log('\n  Also generate config for:\n    (1) Claude Code\n    (2) Cursor\n    (3) OpenAI Codex\n    (4) Claude + Codex (recommended)\n    (5) All\n    (6) None\n');
  const ans = (await ask(rl, '  Selection [4]: ')).trim() || '4';
  const agents = ['copilot'];
  if (ans === '1') agents.push('claude');
  if (ans === '2') agents.push('cursor');
  if (ans === '3') agents.push('codex');
  if (ans === '4') agents.push('claude', 'codex');
  if (ans === '5') agents.push('claude', 'cursor', 'codex');
  return agents;
}
```

- [ ] **Step 7: Update `generatePrompt` to include branch config context**

Change signature to:
```js
function generatePrompt(targetDir, detectedStacks, agentDocsDest, branchConfig) {
```

After the "Important Rules" section, before "Final Step", add:

```js
## Branch Configuration

${branchConfig ? `The following branching strategy was configured during onboarding:
- Feature prefix: \`${branchConfig.featurePrefix}\`
- Default PR target: \`${branchConfig.defaultTarget}\`
- Branches: ${branchConfig.branches.map(b => \`\\\`\${b.name}\\\` (${b.environments.join(', ') || 'no environment'})\`).join(', ')}
- Protected: ${branchConfig.protected.join(', ') || 'none'}

Verify this matches what you observe in the repo and refine \`agent_docs/branching_workflow.md\` accordingly.` : 'No branching strategy was configured. Detect the branching strategy from git branches and CI config.'}
```

Also update the "Final Step" section to include AGENTS.md:
```
(CLAUDE.md, copilot-instructions.md, AGENTS.md, .cursorrules)
```

- [ ] **Step 8: Write dynamic branching_workflow.md during file generation**

In the `generateFiles` function, after copying agent_docs templates (line 207), add:

```js
  // Generate dynamic branching_workflow.md if branchConfig is available
  const { branchConfig } = overlayConfig;
  if (branchConfig) {
    const { buildBranchingWorkflow } = await import(join(OVERLAY_ROOT, 'adapters', 'shared', 'build-branching-content.mjs'));
    const workflowContent = buildBranchingWorkflow(branchConfig);
    if (workflowContent) {
      const workflowPath = join(agentDocsDest, 'branching_workflow.md');
      writeFileSync(workflowPath, workflowContent, 'utf8');
      info('agent_docs/branching_workflow.md generated from branch config.');
    }
  }
```

- [ ] **Step 9: Verify no syntax errors**

Run: `node --check scripts/onboard.mjs`
Expected: No output (clean parse)

- [ ] **Step 10: Commit**

```bash
git add scripts/onboard.mjs
git commit -m "feat(onboard): add branching prompts, superpowers, codex adapter, config persistence"
```

---

### Task 12: Update `scripts/regenerate.mjs` — load config, support new adapters

**Files:**
- Modify: `scripts/regenerate.mjs:1-76`

- [ ] **Step 1: Rewrite regenerate.mjs to use overlay config**

```js
#!/usr/bin/env node
/**
 * Regenerate instruction files from populated agent_docs/ templates.
 *
 * Usage: node scripts/regenerate.mjs --target /path/to/project
 */

import { existsSync, readFileSync } from 'node:fs';
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

  // Load overlay config if available
  const configPath = join(agentDocsDir, '.overlay-config.json');
  let overlayConfig = {};

  if (existsSync(configPath)) {
    try {
      overlayConfig = JSON.parse(readFileSync(configPath, 'utf8'));
      console.log('  Loaded .overlay-config.json');
    } catch (e) {
      console.log(`  [WARN] Could not parse .overlay-config.json: ${e.message}`);
    }
  } else {
    console.log('  [WARN] No .overlay-config.json found. Using defaults.');
    console.log('  [WARN] Re-run onboard.mjs for full configuration (branching, CI, etc.).\n');

    // Fallback: detect stacks
    const { detectStacks } = await import('./onboard.mjs');
    try {
      overlayConfig.detectedStacks = detectStacks(targetDir);
    } catch { /* best effort */ }
  }

  const regenerated = [];

  // Copilot
  if (existsSync(join(targetDir, '.github', 'copilot-instructions.md'))) {
    const { generateCopilotConfig } = await import('../adapters/copilot/generate.mjs');
    const paths = generateCopilotConfig(targetDir, CORE_DIR, agentDocsDir, overlayConfig);
    for (const p of paths) regenerated.push(relative(targetDir, p));
  }

  // Claude
  if (existsSync(join(targetDir, 'CLAUDE.md'))) {
    const { generateClaudeConfig } = await import('../adapters/claude/generate.mjs');
    const r = generateClaudeConfig(targetDir, CORE_DIR, agentDocsDir, overlayConfig);
    for (const p of r.paths) regenerated.push(relative(targetDir, p));
  }

  // Cursor
  if (existsSync(join(targetDir, '.cursorrules'))) {
    const { generateCursorConfig } = await import('../adapters/cursor/generate.mjs');
    const paths = generateCursorConfig(targetDir, CORE_DIR, agentDocsDir, overlayConfig);
    for (const p of paths) regenerated.push(relative(targetDir, p));
  }

  // Codex
  if (existsSync(join(targetDir, 'AGENTS.md'))) {
    const { generateCodexConfig } = await import('../adapters/codex/generate.mjs');
    const paths = generateCodexConfig(targetDir, CORE_DIR, agentDocsDir, overlayConfig);
    for (const p of paths) regenerated.push(relative(targetDir, p));
  }

  // README-AGENTIC.md
  if (existsSync(join(targetDir, 'README-AGENTIC.md'))) {
    const { generateReadmeAgentic } = await import('../adapters/shared/build-readme-agentic.mjs');
    const p = generateReadmeAgentic(targetDir, overlayConfig);
    regenerated.push(relative(targetDir, p));
  }

  if (regenerated.length === 0) {
    console.log('  No instruction files found to regenerate.');
    console.log('  (Looking for CLAUDE.md, .github/copilot-instructions.md, AGENTS.md, or .cursorrules)\n');
  } else {
    console.log('  Regenerated:');
    regenerated.forEach((f) => console.log(`    + ${f}`));
    console.log('');
  }
}

main();
```

- [ ] **Step 2: Verify no syntax errors**

Run: `node --check scripts/regenerate.mjs`
Expected: No output (clean parse)

- [ ] **Step 3: Commit**

```bash
git add scripts/regenerate.mjs
git commit -m "refactor(regenerate): load overlay config, support codex and readme-agentic"
```

---

## Chunk 5: Validation

### Task 13: End-to-end validation

Test the full onboarding flow against a temp directory.

**Files:**
- No files created or modified — validation only

- [ ] **Step 1: Create a temp test project**

```bash
mkdir -p /tmp/test-overlay-project
cd /tmp/test-overlay-project
git init
echo '{"name": "test-project", "dependencies": {"react": "^18.0.0"}}' > package.json
echo '{}' > tsconfig.json
mkdir -p src && echo 'export const App = () => <div>hello</div>' > src/App.tsx
mkdir -p .github/workflows && echo 'name: CI' > .github/workflows/ci.yml
```

- [ ] **Step 2: Run onboard.mjs against the test project**

```bash
node /path/to/copilot-workflow-base/scripts/onboard.mjs --target /tmp/test-overlay-project
```

Walk through the prompts providing:
- Stacks: confirm react-typescript
- Agents: option 4 (Claude + Codex)
- Branches: `develop, staging, production`
- Environments: `dev`, `test`, `prod`
- Agent allowed: `feature/*, develop`
- Protected: `staging, production`
- Default target: `develop`
- Superpowers: Y
- CI: confirm GitHub Actions

- [ ] **Step 3: Verify generated files exist**

```bash
ls -la /tmp/test-overlay-project/.github/copilot-instructions.md
ls -la /tmp/test-overlay-project/.github/instructions/
ls -la /tmp/test-overlay-project/CLAUDE.md
ls -la /tmp/test-overlay-project/AGENTS.md
ls -la /tmp/test-overlay-project/README-AGENTIC.md
ls -la /tmp/test-overlay-project/agent_docs/.overlay-config.json
ls -la /tmp/test-overlay-project/agent_docs/branching_workflow.md
```

Expected: All files exist.

- [ ] **Step 4: Verify branch protection in Claude settings.json**

```bash
cat /tmp/test-overlay-project/.claude/settings.json | grep -A 20 '"deny"'
```

Expected: Should include `Bash(git push*staging*)`, `Bash(git push*production*)`, etc.

- [ ] **Step 5: Verify branching.instructions.md contains the configured branches**

```bash
cat /tmp/test-overlay-project/.github/instructions/branching.instructions.md
```

Expected: Contains `staging`, `production` in the branch table with correct environments.

- [ ] **Step 6: Test regeneration**

```bash
node /path/to/copilot-workflow-base/scripts/regenerate.mjs --target /tmp/test-overlay-project
```

Expected: All instruction files regenerated from `.overlay-config.json`.

- [ ] **Step 7: Clean up**

```bash
rm -rf /tmp/test-overlay-project
```

- [ ] **Step 8: Commit any fixes discovered during validation**

If fixes were needed, commit them with appropriate messages.

---

### Task 14: Final commit — update README and adapter READMEs

**Files:**
- Modify: `adapters/copilot/README.md`
- Modify: `adapters/claude/README.md`

- [ ] **Step 1: Update Copilot adapter README**

Add documentation about the tiered instruction structure.

- [ ] **Step 2: Update Claude adapter README**

Add documentation about dynamic branch protection deny rules and superpowers integration.

- [ ] **Step 3: Commit**

```bash
git add adapters/copilot/README.md adapters/claude/README.md
git commit -m "docs: update adapter READMEs for new features"
```
