import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
  cpSync,
} from 'node:fs';
import { join, dirname } from 'node:path';
import { buildSlimContent } from '../shared/build-slim-content.mjs';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Permission sets by stack ──────────────────────────────────────────────

const ALWAYS_ALLOW = [
  'Bash(git status:*)',
  'Bash(git diff:*)',
  'Bash(git log:*)',
  'Bash(git branch:*)',
  'Bash(git checkout -b:*)',
  'Bash(git add:*)',
  'Bash(git commit:*)',
  'Bash(git merge:*)',
  'Bash(git worktree:*)',
  'Read(**)',
  'Write(**)',
  'Edit(**)',
  'Glob(**)',
  'Grep(**)',
];

const ALWAYS_DENY = [
  'Bash(git push --force:*)',
  'Bash(git push -f:*)',
  'Bash(git reset --hard:*)',
  'Read(.env)',
  'Read(.env.*)',
];

const STACK_PERMISSIONS = {
  'react-typescript': {
    allow: [
      'Bash(npm run:*)',
      'Bash(npx:*)',
      'Bash(npx turbo:*)',
      'Bash(node:*)',
    ],
    deny: [],
  },
  wordpress: {
    allow: [
      'Bash(composer:*)',
      'Bash(wp-env:*)',
      'Bash(npm run:*)',
      'Bash(npm install:*)',
    ],
    deny: ['Read(wp-config.php)'],
  },
  dotnet: {
    allow: [
      'Bash(dotnet build:*)',
      'Bash(dotnet test:*)',
      'Bash(dotnet run:*)',
      'Bash(dotnet restore:*)',
    ],
    deny: ['Read(appsettings.*.json)'],
  },
  python: {
    allow: [
      'Bash(pytest:*)',
      'Bash(python:*)',
      'Bash(pip:*)',
      'Bash(poetry:*)',
      'Bash(ruff:*)',
    ],
    deny: [],
  },
};

// ─── Settings builder ──────────────────────────────────────────────────────

/**
 * Build .claude/settings.json for the target project.
 *
 * @param {string[]} detectedStacks - Stack identifiers detected in the target project
 * @returns {{ permissions: { allow: string[], deny: string[] }, hooks: object }}
 */
function buildSettings(detectedStacks) {
  const allow = [...ALWAYS_ALLOW];
  const deny = [...ALWAYS_DENY];

  for (const stack of detectedStacks) {
    const stackPerms = STACK_PERMISSIONS[stack];
    if (stackPerms) {
      allow.push(...stackPerms.allow);
      deny.push(...stackPerms.deny);
    }
  }

  // Deduplicate while preserving order
  const uniqueAllow = [...new Set(allow)];
  const uniqueDeny = [...new Set(deny)];

  const hooks = {
    PreToolUse: [],
    PostToolUse: [
      {
        matcher: 'Edit|Write',
        hooks: [
          {
            type: 'command',
            command: 'bash .claude/hooks/post_edit_check.sh',
          },
        ],
      },
    ],
    Stop: [
      {
        hooks: [
          {
            type: 'command',
            command: 'bash .claude/hooks/stop_remember_nudge.sh',
          },
        ],
      },
    ],
    SessionStart: [
      {
        matcher: 'compact',
        hooks: [
          {
            type: 'command',
            command: 'bash .claude/hooks/post_compact_recall.sh',
          },
        ],
      },
      {
        hooks: [
          {
            type: 'command',
            command: 'bash .claude/hooks/session_start_recall.sh',
          },
        ],
      },
    ],
    PreCompact: [
      {
        hooks: [
          {
            type: 'command',
            command: 'bash .claude/hooks/pre_compact_remember.sh',
          },
        ],
      },
    ],
    SessionEnd: [
      {
        hooks: [
          {
            type: 'command',
            command: 'bash .claude/hooks/session_end_log.sh',
          },
        ],
      },
    ],
  };

  return {
    permissions: {
      allow: uniqueAllow,
      deny: uniqueDeny,
    },
    hooks,
  };
}

// ─── CLAUDE.md builder ────────────────────────────────────────────────────

/**
 * Build the tech stack table section based on detected stacks.
 *
 * @param {string[]} detectedStacks
 * @returns {string}
 */
function buildTechStackSection(detectedStacks) {
  const rows = [];

  if (detectedStacks.includes('react-typescript')) {
    rows.push(
      '| Monorepo | Turborepo, npm workspaces | Always |',
      '| Frontend | React, TypeScript, Vite, TailwindCSS | Always |',
      '| Backend | Express, TypeScript | Optional |',
      '| Database | PostgreSQL, Prisma ORM | Optional |',
      '| Testing | Vitest | Always |',
      '| Linting | ESLint + Prettier | Always |',
      '| CI | GitHub Actions | Always |',
      '| Runtime | Node (latest LTS) | Always |',
    );
  } else if (detectedStacks.includes('wordpress')) {
    rows.push(
      '| CMS | WordPress | Always |',
      '| Language | PHP | Always |',
      '| Package Manager | Composer, npm | Always |',
      '| Dev Environment | wp-env (Docker) | Always |',
      '| Testing | PHPUnit, Jest | Always |',
      '| Linting | PHPCS, ESLint | Always |',
      '| CI | GitHub Actions | Always |',
    );
  } else if (detectedStacks.includes('dotnet')) {
    rows.push(
      '| Framework | .NET (ASP.NET Core) | Always |',
      '| Language | C# | Always |',
      '| ORM | Entity Framework Core | Optional |',
      '| Testing | xUnit | Always |',
      '| Linting | dotnet-format, Roslyn analyzers | Always |',
      '| CI | GitHub Actions | Always |',
    );
  } else if (detectedStacks.includes('python')) {
    rows.push(
      '| Language | Python | Always |',
      '| Package Manager | pip / poetry | Always |',
      '| Testing | pytest | Always |',
      '| Linting | ruff, mypy | Always |',
      '| CI | GitHub Actions | Always |',
    );
  } else {
    rows.push(
      '| Language/Framework | (detected at onboard time) | — |',
      '| Testing | (project-specific) | Always |',
      '| CI | GitHub Actions | Always |',
    );
  }

  return `## Tech Stack

| Layer | Technology | Required |
|-------|-----------|----------|
${rows.join('\n')}`;
}

/**
 * Build the commands section based on detected stacks.
 *
 * @param {string[]} detectedStacks
 * @returns {string}
 */
function buildCommandsSection(detectedStacks) {
  let commands = '';

  if (detectedStacks.includes('react-typescript')) {
    commands = `\`\`\`bash
npm run dev          # Start all apps (turbo)
npm run build        # Build all apps
npm run lint         # Lint + format check
npm run test         # Run all tests
npm run test:watch   # Watch mode
\`\`\``;
  } else if (detectedStacks.includes('wordpress')) {
    commands = `\`\`\`bash
npm run wp-env start  # Start WordPress dev environment
npm run wp-env stop   # Stop environment
npm run test          # Run all tests
npm run lint          # Run PHPCS + ESLint
composer install      # Install PHP dependencies
\`\`\``;
  } else if (detectedStacks.includes('dotnet')) {
    commands = `\`\`\`bash
dotnet build          # Build the solution
dotnet test           # Run all tests
dotnet run            # Run the application
dotnet restore        # Restore NuGet packages
\`\`\``;
  } else if (detectedStacks.includes('python')) {
    commands = `\`\`\`bash
pytest                # Run all tests
python -m pytest -v   # Verbose test output
ruff check .          # Lint
ruff format .         # Format
poetry install        # Install dependencies (if using poetry)
\`\`\``;
  } else {
    commands = `\`\`\`bash
# Commands are project-specific — see agent_docs/building_the_project.md
\`\`\``;
  }

  return `## Commands\n\n${commands}`;
}

/**
 * Build the CLAUDE.md content.
 *
 * @param {string} coreDir - Path to the overlay's core/ directory
 * @param {string} agentDocsDir - Path to populated agent_docs/ directory
 * @param {string[]} detectedStacks
 * @returns {string}
 */
function buildClaudeMd(coreDir, agentDocsDir, detectedStacks) {
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
  sections.push(buildSlimContent(coreDir, agentDocsDir));

  // Commands section (existing, concise)
  sections.push('---');
  sections.push('');
  sections.push(buildCommandsSection(detectedStacks));
  sections.push('');

  // Model routing (Claude-specific)
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

  // Memory commands (Claude-specific)
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

// ─── File copier ──────────────────────────────────────────────────────────

/**
 * Copy all Claude-specific config files (hooks, agents, commands, skills) into
 * `.claude/` of the target project.
 *
 * @param {string} targetDir - Root of the target project
 */
function copyClaudeFiles(targetDir) {
  const adapterDir = __dirname;
  const claudeDir = join(targetDir, '.claude');

  const dirs = [
    'hooks',
    'agents',
    'commands',
    'skills/memory/scripts',
    'skills/remember',
    'skills/recall',
  ];

  for (const dir of dirs) {
    mkdirSync(join(claudeDir, dir), { recursive: true });
  }

  const fileMappings = [
    // hooks
    ['hooks/session_start_recall.sh', 'hooks/session_start_recall.sh'],
    ['hooks/post_compact_recall.sh', 'hooks/post_compact_recall.sh'],
    ['hooks/pre_compact_remember.sh', 'hooks/pre_compact_remember.sh'],
    ['hooks/stop_remember_nudge.sh', 'hooks/stop_remember_nudge.sh'],
    ['hooks/session_end_log.sh', 'hooks/session_end_log.sh'],
    ['hooks/update_file_index.sh', 'hooks/update_file_index.sh'],
    ['hooks/post_edit_check.sh', 'hooks/post_edit_check.sh'],
    // agents
    ['agents/memory-locator.md', 'agents/memory-locator.md'],
    ['agents/memory-writer.md', 'agents/memory-writer.md'],
    // commands
    ['commands/remember.md', 'commands/remember.md'],
    ['commands/recall.md', 'commands/recall.md'],
    ['commands/memory-status.md', 'commands/memory-status.md'],
    // skills
    ['skills/memory/SKILL.md', 'skills/memory/SKILL.md'],
    ['skills/memory/scripts/init_memory_tree.sh', 'skills/memory/scripts/init_memory_tree.sh'],
    ['skills/remember/SKILL.md', 'skills/remember/SKILL.md'],
    ['skills/recall/SKILL.md', 'skills/recall/SKILL.md'],
  ];

  const copied = [];
  for (const [src, dest] of fileMappings) {
    const srcPath = join(adapterDir, src);
    const destPath = join(claudeDir, dest);
    if (existsSync(srcPath)) {
      writeFileSync(destPath, readFileSync(srcPath));
      copied.push(dest);
    }
  }

  return copied;
}

// ─── Public API ───────────────────────────────────────────────────────────

/**
 * Generate a full Claude Code configuration for the target project.
 *
 * @param {string} targetDir - Root directory of the project being onboarded
 * @param {string} coreDir - Path to the overlay's core/ directory
 * @param {string} agentDocsDir - Path to the populated agent_docs/ in the target project
 * @param {string[]} detectedStacks - Stack identifiers (e.g. ['react-typescript'])
 * @returns {{ claudeMdPath: string, settingsPath: string, copiedFiles: string[] }}
 */
export function generateClaudeConfig(targetDir, coreDir, agentDocsDir, detectedStacks = []) {
  const claudeDir = join(targetDir, '.claude');
  mkdirSync(claudeDir, { recursive: true });

  // 1. Build and write CLAUDE.md
  const claudeMdContent = buildClaudeMd(coreDir, agentDocsDir, detectedStacks);
  const claudeMdPath = join(targetDir, 'CLAUDE.md');
  writeFileSync(claudeMdPath, claudeMdContent, 'utf8');

  // 2. Build and write .claude/settings.json
  const settings = buildSettings(detectedStacks);
  const settingsPath = join(claudeDir, 'settings.json');
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n', 'utf8');

  // 3. Copy hooks, agents, commands, skills to .claude/
  const copiedFiles = copyClaudeFiles(targetDir);

  return { claudeMdPath, settingsPath, copiedFiles };
}
