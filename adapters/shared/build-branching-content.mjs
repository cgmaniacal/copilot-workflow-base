/**
 * Build dynamic branching markdown content from a branchConfig object.
 *
 * branchConfig shape:
 * {
 *   branches: [
 *     { name: string, environments: string[], agentAccess: 'full' | 'none' | 'read' },
 *   ],
 *   featurePrefix: string,       // e.g. 'feature/*'
 *   defaultTarget: string,       // e.g. 'develop'
 *   protected: string[],         // branch names agents must never push to
 *   agentAllowed: string[],      // branch patterns agents may push to
 * }
 */

// ── Helpers ──────────────────────────────────────────────────────────────────

function agentAccessLabel(access) {
  if (access === 'full') return 'Full (create, push, PR)';
  if (access === 'read') return 'Read-only';
  return 'None (no direct push)';
}

function environmentLabel(environments) {
  if (!environments || environments.length === 0) return '—';
  return environments.join(', ');
}

// ── buildBranchAccessRules ────────────────────────────────────────────────────

/**
 * Build a concise "Branch Access Rules" markdown section.
 *
 * @param {object|null|undefined} branchConfig
 * @returns {string} Markdown section
 */
export function buildBranchAccessRules(branchConfig) {
  if (!branchConfig) {
    // Default fallback
    const lines = [];
    lines.push('## Branch Access Rules');
    lines.push('');
    lines.push('| Branch | Environment | Agent Access |');
    lines.push('|--------|-------------|--------------|');
    lines.push('| `feature/*` | local | Full (create, push, PR) |');
    lines.push('| `develop` | dev | Full (create, push, PR) |');
    lines.push('| `main` | production | None (no direct push) |');
    lines.push('');
    lines.push('**Flow:** `feature/*` → PR to `develop` → PR to `main`');
    lines.push('');
    lines.push('**You MAY:** create `feature/*` branches, push to `feature/*`, push to `develop`, open PRs targeting `develop`.');
    lines.push('');
    lines.push('**You must NEVER:** push directly to `main`.');
    lines.push('');
    lines.push('**Default PR target:** `develop`');
    lines.push('');
    return lines.join('\n');
  }

  const { branches = [], featurePrefix = 'feature/*', defaultTarget, protected: protectedBranches = [], agentAllowed = [] } = branchConfig;

  const lines = [];
  lines.push('## Branch Access Rules');
  lines.push('');
  lines.push('| Branch | Environment | Agent Access |');
  lines.push('|--------|-------------|--------------|');

  // Feature prefix row first
  lines.push(`| \`${featurePrefix}\` | local | Full (create, push, PR) |`);

  // Each configured branch
  for (const branch of branches) {
    const access = agentAccessLabel(branch.agentAccess);
    const env = environmentLabel(branch.environments);
    lines.push(`| \`${branch.name}\` | ${env} | ${access} |`);
  }

  lines.push('');

  // Flow line: featurePrefix -> each branch in order
  const flowSteps = [`\`${featurePrefix}\``, ...branches.map((b) => `\`${b.name}\``)];
  lines.push(`**Flow:** ${flowSteps.join(' → ')}`);
  lines.push('');

  // You MAY statement
  const mayTargets = agentAllowed.map((a) => `\`${a}\``).join(', ');
  lines.push(`**You MAY:** create \`${featurePrefix}\` branches, push to allowed branches (${mayTargets}), open PRs targeting \`${defaultTarget || branches[0]?.name || 'develop'}\`.`);
  lines.push('');

  // You must NEVER statement
  if (protectedBranches.length > 0) {
    const neverList = protectedBranches.map((b) => `\`${b}\``).join(', ');
    lines.push(`**You must NEVER:** push directly to ${neverList}.`);
  } else {
    lines.push('**You must NEVER:** push directly to protected branches without a PR.');
  }
  lines.push('');

  // Default PR target
  lines.push(`**Default PR target:** \`${defaultTarget || branches[0]?.name || 'develop'}\``);
  lines.push('');

  return lines.join('\n');
}

// ── buildBranchingWorkflow ────────────────────────────────────────────────────

/**
 * Build a full branching_workflow.md document.
 *
 * @param {object|null|undefined} branchConfig
 * @returns {string|null} Markdown document, or null if branchConfig is null (caller uses static template)
 */
export function buildBranchingWorkflow(branchConfig) {
  if (!branchConfig) {
    return null;
  }

  const {
    branches = [],
    featurePrefix = 'feature/*',
    defaultTarget,
    protected: protectedBranches = [],
    agentAllowed = [],
  } = branchConfig;

  const target = defaultTarget || branches[0]?.name || 'develop';
  const lines = [];

  // ── Title ──
  lines.push('# Branching Workflow');
  lines.push('');

  // ── Branch Structure Table ──
  lines.push('## Branch Structure');
  lines.push('');
  lines.push('| Branch | Purpose | Environment | Push directly? |');
  lines.push('|--------|---------|-------------|----------------|');

  // Feature prefix row
  lines.push(`| \`${featurePrefix}\` | Active development | local | Yes |`);

  // Configured branches
  for (const branch of branches) {
    const env = environmentLabel(branch.environments);
    const canPush = agentAllowed.includes(branch.name) ? 'Yes' : 'No — PR only';
    const purpose = branch.agentAccess === 'full'
      ? 'Integration / staging'
      : protectedBranches.includes(branch.name)
        ? 'Protected — promotion only'
        : 'Staging / release';
    lines.push(`| \`${branch.name}\` | ${purpose} | ${env} | ${canPush} |`);
  }

  lines.push('');

  // ── Flow Diagram ──
  lines.push('## Flow Diagram');
  lines.push('');
  lines.push('```');

  const allNodes = [featurePrefix, ...branches.map((b) => b.name)];
  lines.push(allNodes.join(' → '));

  lines.push('```');
  lines.push('');

  // ── Step-by-Step Workflow ──
  lines.push('## Step-by-Step Workflow');
  lines.push('');

  // Start feature
  lines.push('### 1. Start a feature');
  lines.push('');
  lines.push('```bash');
  lines.push(`git checkout ${target}`);
  lines.push('git pull');
  lines.push('git checkout -b feature/<short-description>');
  lines.push('```');
  lines.push('');

  // Work
  lines.push('### 2. Work on the feature');
  lines.push('');
  lines.push('Commit using Conventional Commits: `type(scope): description`');
  lines.push('');
  lines.push('```bash');
  lines.push('git add <files>');
  lines.push('git commit -m "feat(scope): description"');
  lines.push('```');
  lines.push('');

  // PR to first target
  lines.push('### 3. Open a PR');
  lines.push('');
  lines.push(`Open a pull request from \`${featurePrefix}\` → \`${target}\`.`);
  lines.push('Ensure CI passes and at least one reviewer approves before merging.');
  lines.push('');

  // Promotion steps between each branch pair
  for (let i = 0; i < branches.length - 1; i++) {
    const from = branches[i];
    const to = branches[i + 1];
    const stepNum = i + 4;
    lines.push(`### ${stepNum}. Promote \`${from.name}\` → \`${to.name}\``);
    lines.push('');
    lines.push(`Open a pull request from \`${from.name}\` → \`${to.name}\`.`);
    if (protectedBranches.includes(to.name)) {
      lines.push(`\`${to.name}\` is a protected branch. Merge only after all required checks pass.`);
    }
    lines.push('');
  }

  // ── Rules ──
  lines.push('## Rules');
  lines.push('');

  const allowedList = agentAllowed.map((a) => `\`${a}\``).join(', ');
  lines.push(`- Agents may push directly to: ${allowedList}`);

  if (protectedBranches.length > 0) {
    const neverList = protectedBranches.map((b) => `\`${b}\``).join(', ');
    lines.push(`- Agents must NEVER push directly to: ${neverList}`);
  }

  lines.push(`- All feature work branches from \`${target}\``);
  lines.push('- Branch names must use the configured prefix (e.g. `feature/<short-description>`)');
  lines.push('- All PRs require CI to pass before merge');
  lines.push('');

  // ── Changelog Process ──
  lines.push('## Changelog Process');
  lines.push('');
  lines.push('<!-- TODO: fill in changelog tooling (e.g. standard-version, changelogen, manual) -->');
  lines.push('<!-- TODO: fill in changelog file location (e.g. CHANGELOG.md) -->');
  lines.push('<!-- TODO: fill in release tagging convention (e.g. vX.Y.Z) -->');
  lines.push('');
  lines.push('Update the changelog before opening a promotion PR. Record all notable changes grouped by type.');
  lines.push('');

  // ── Commit Types ──
  lines.push('## Commit Types');
  lines.push('');
  lines.push('| Type | When to use |');
  lines.push('|------|-------------|');
  lines.push('| `feat` | New feature or capability |');
  lines.push('| `fix` | Bug fix |');
  lines.push('| `chore` | Maintenance, dependency updates, config |');
  lines.push('| `refactor` | Code restructure with no behaviour change |');
  lines.push('| `test` | Adding or updating tests |');
  lines.push('| `docs` | Documentation only |');
  lines.push('| `perf` | Performance improvement |');
  lines.push('| `ci` | CI/CD pipeline changes |');
  lines.push('');

  // ── Hotfix Flow ──
  lines.push('## Hotfix Flow');
  lines.push('');

  // The "production" branch is the last one in the list, or any branch with prod in environments
  const prodBranch = branches.find((b) => b.environments?.includes('prod')) || branches[branches.length - 1];
  const hotfixBase = prodBranch ? prodBranch.name : target;

  lines.push('For urgent production fixes:');
  lines.push('');
  lines.push('```bash');
  lines.push(`git checkout ${hotfixBase}`);
  lines.push('git pull');
  lines.push('git checkout -b hotfix/<short-description>');
  lines.push('# make fix, commit');
  lines.push(`git push origin hotfix/<short-description>`);
  lines.push('```');
  lines.push('');
  lines.push(`Open a PR from \`hotfix/<short-description>\` → \`${hotfixBase}\`.`);

  if (hotfixBase !== target) {
    lines.push(`After merging, also backport the fix to \`${target}\` via a separate PR.`);
  }

  lines.push('');

  return lines.join('\n');
}
