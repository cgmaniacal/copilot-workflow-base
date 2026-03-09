import { existsSync, readdirSync } from 'node:fs';
import { basename } from 'node:path';

/**
 * Build the shared slim instruction content used by all adapters.
 *
 * @param {string} coreDir - Path to the overlay's core/ directory (reserved for future use)
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
