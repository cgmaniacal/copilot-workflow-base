import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Generates README-AGENTIC.md at the target project root.
 *
 * @param {string} targetDir - The project root directory
 * @param {object} overlayConfig - Overlay configuration options
 * @param {object} [overlayConfig.branchConfig] - Branch configuration object
 * @param {string[]} [overlayConfig.selectedAgents] - Array of selected agent identifiers
 * @param {boolean} [overlayConfig.superpowersInstalled] - Whether the Superpowers plugin is installed
 * @returns {string} Path to the generated file
 */
export function generateReadmeAgentic(targetDir, overlayConfig = {}) {
  const { branchConfig, selectedAgents = [], superpowersInstalled = false } = overlayConfig;

  const lines = [];

  // ── 1. Title & Intro ──────────────────────────────────────────────────────

  lines.push('# AI Workflow Guide');
  lines.push('');
  lines.push('This project uses an AI workflow overlay — a structured set of instruction files and documentation conventions that guide AI coding assistants (GitHub Copilot, Claude, Cursor, and others) to work consistently and safely within this codebase.');
  lines.push('');

  // ── 2. The 4-Phase Workflow ───────────────────────────────────────────────

  lines.push('## The 4-Phase Workflow');
  lines.push('');
  lines.push('Every significant task follows these phases in order:');
  lines.push('');
  lines.push('| Phase | Goal | Output |');
  lines.push('|-------|------|--------|');
  lines.push('| Research | Understand the problem before writing code | `docs/research/` |');
  lines.push('| Plan | Concrete step-by-step implementation plan | `docs/plans/` |');
  lines.push('| Implement | Execute the plan, test-first | Commits on feature branch |');
  lines.push('| Validate | Verify correctness — lint, test, build all pass | PR ready for review |');
  lines.push('');
  lines.push('**Exemptions:** Bug fixes, lint cleanup, and isolated small tweaks (single-file, no architectural impact) may skip directly to Implement.');
  lines.push('');

  // ── 3. Instruction Files ──────────────────────────────────────────────────

  lines.push('## Instruction Files');
  lines.push('');
  lines.push('The overlay installs the following instruction files into the project. Each file is read automatically by its target tool/platform when that tool is active in your editor or CI environment.');
  lines.push('');
  lines.push('| File | Tool/Platform | Purpose |');
  lines.push('|------|---------------|---------|');
  lines.push('| `.github/copilot-instructions.md` | GitHub Copilot (VS Code) | Universal workflow rules |');
  lines.push('| `.github/instructions/claude.instructions.md` | GitHub Copilot + Claude | Claude-specific rules |');
  lines.push('| `.github/instructions/chatgpt.instructions.md` | GitHub Copilot + ChatGPT | ChatGPT-specific rules |');
  lines.push('| `.github/instructions/branching.instructions.md` | GitHub Copilot (all) | Branch naming and PR rules |');
  lines.push('| `.github/instructions/ci-pipeline.instructions.md` | GitHub Copilot (all) | CI/CD pipeline rules |');

  if (selectedAgents.includes('claude')) {
    lines.push('| `CLAUDE.md` | Claude (claude.ai, Claude Code) | Claude project memory and workflow |');
  }

  if (selectedAgents.includes('codex')) {
    lines.push('| `AGENTS.md` | OpenAI Codex / ChatGPT Codex | Codex agent instructions |');
  }

  if (selectedAgents.includes('cursor')) {
    lines.push('| `.cursorrules` | Cursor editor | Cursor-specific workflow rules |');
  }

  lines.push('');
  lines.push('GitHub Copilot is the primary target platform — `.github/copilot-instructions.md` acts as the universal entry point and is read by Copilot in all contexts. The additional files under `.github/instructions/` use Copilot\'s `applyTo` front-matter so they are automatically scoped to the correct file types and tools.');
  lines.push('');

  // ── 4. Documentation Locations ───────────────────────────────────────────

  lines.push('## Documentation Locations');
  lines.push('');
  lines.push('| Directory | Purpose |');
  lines.push('|-----------|---------|');
  lines.push('| `agent_docs/` | AI-readable project documentation (architecture, conventions, test strategy) |');
  lines.push('| `docs/research/` | Research and design docs produced during the Research phase |');
  lines.push('| `docs/plans/` | Implementation plans produced during the Plan phase |');
  lines.push('| `docs/decisions/` | Architectural Decision Records (ADRs) |');
  lines.push('');

  // ── 5. Branch Conventions (conditional) ──────────────────────────────────

  if (branchConfig) {
    const {
      branches = [],
      featurePrefix = 'feature/*',
      defaultTarget,
      protected: protectedBranches = [],
      agentAllowed = [],
    } = branchConfig;

    const target = defaultTarget || branches[0]?.name || 'develop';

    lines.push('## Branch Conventions');
    lines.push('');
    lines.push('| Branch | Environment | Agent Access |');
    lines.push('|--------|-------------|--------------|');
    lines.push(`| \`${featurePrefix}\` | local | Full (create, push, PR) |`);

    for (const branch of branches) {
      const envLabel = branch.environments?.length ? branch.environments.join(', ') : '—';
      let accessLabel;
      if (branch.agentAccess === 'full') accessLabel = 'Full (create, push, PR)';
      else if (branch.agentAccess === 'read') accessLabel = 'Read-only';
      else accessLabel = 'None (no direct push)';
      lines.push(`| \`${branch.name}\` | ${envLabel} | ${accessLabel} |`);
    }

    lines.push('');

    const flowSteps = [`\`${featurePrefix}\``, ...branches.map((b) => `\`${b.name}\``)];
    lines.push(`**Flow:** ${flowSteps.join(' → ')}`);
    lines.push('');

    if (agentAllowed.length > 0) {
      const mayTargets = agentAllowed.map((a) => `\`${a}\``).join(', ');
      lines.push(`**Agents MAY:** create \`${featurePrefix}\` branches, push to ${mayTargets}, open PRs targeting \`${target}\`.`);
    } else {
      lines.push(`**Agents MAY:** create \`${featurePrefix}\` branches and open PRs targeting \`${target}\`.`);
    }
    lines.push('');

    if (protectedBranches.length > 0) {
      const neverList = protectedBranches.map((b) => `\`${b}\``).join(', ');
      lines.push(`**Agents must NEVER:** push directly to ${neverList}.`);
    } else {
      lines.push('**Agents must NEVER:** push directly to protected branches without a PR.');
    }
    lines.push('');
  }

  // ── 6. Superpowers Plugin ─────────────────────────────────────────────────

  lines.push('## Superpowers Plugin');
  lines.push('');

  if (superpowersInstalled) {
    lines.push('This project has superpowers integrated. The following AI skills are available:');
  } else {
    lines.push('The [Superpowers plugin](https://github.com/Anthropics/superpowers) is recommended for the best AI-assisted development experience. Install it to unlock structured AI skills for this workflow.');
    lines.push('');
    lines.push('```bash');
    lines.push('# Install via your editor\'s extension marketplace or:');
    lines.push('npm install -g @superpowers/cli');
    lines.push('```');
  }

  lines.push('');
  lines.push('| Phase | Skill | Purpose |');
  lines.push('|-------|-------|---------|');
  lines.push('| Research | `brainstorming` | Generate and evaluate ideas before committing to an approach |');
  lines.push('| Plan | `writing-plans` | Produce structured implementation plans in `docs/plans/` |');
  lines.push('| Implement | `subagent-driven-development` | Delegate implementation subtasks to focused subagents |');
  lines.push('| Validate | `finishing-a-development-branch` | Final checks, cleanup, and PR preparation |');
  lines.push('');

  // ── 7. Keeping Documentation Updated ─────────────────────────────────────

  lines.push('## Keeping Documentation Updated');
  lines.push('');
  lines.push('After making significant changes to the codebase, regenerate the AI instruction files to keep them in sync:');
  lines.push('');
  lines.push('```bash');
  lines.push('node scripts/regenerate.mjs');
  lines.push('```');
  lines.push('');
  lines.push('Update `agent_docs/` when you:');
  lines.push('');
  lines.push('- Add or remove services, packages, or major modules');
  lines.push('- Change build tooling, test setup, or CI configuration');
  lines.push('- Establish new architectural patterns or conventions');
  lines.push('- Make decisions that should constrain future AI contributions');
  lines.push('');

  const output = lines.join('\n');
  const outputPath = join(targetDir, 'README-AGENTIC.md');
  writeFileSync(outputPath, output, 'utf8');

  return outputPath;
}
