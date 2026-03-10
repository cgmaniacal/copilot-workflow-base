# AI Workflow Overlay — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform `copilot-workflow-base` into `ai-workflow-overlay` — a platform-agnostic AI development workflow that onboards into existing projects of any tech stack.

**Architecture:** Layered overlay with three tiers: `core/` (universal workflow + template agent_docs), `adapters/` (agent-specific config generators for Copilot, Claude, Cursor), and `stacks/` (detection patterns + documentation guidance per platform). An onboarding script ties it all together.

**Tech Stack:** Node.js (for the onboard script), shell scripts (hooks), markdown (all docs and templates).

**Design doc:** `docs/research/2026-03-02-ai-workflow-overlay-design.md`

---

## Phase 1: Create the Core Layer

### Task 1: Create `core/workflow.md` — the universal instruction file

**Files:**
- Create: `core/workflow.md`

**Step 1: Write `core/workflow.md`**

This is the central file — the Copilot-native universal workflow. Extract from the current `CLAUDE.md` everything that is platform-agnostic, rewrite for a generic audience (no Claude-specific references in the core). Structure:

```markdown
# AI Development Workflow

## How This Works
- This project uses a structured AI-assisted development workflow
- Agent-specific instructions are in your agent's config file (.github/copilot-instructions.md, CLAUDE.md, .cursorrules)
- Project-specific documentation is in agent_docs/
- Architectural decisions are recorded in docs/decisions/

## Workflow Phases

Every significant task follows four phases:

### 1. Research
- Read relevant agent_docs/ before starting
- Explore the codebase to understand existing patterns
- Ask clarifying questions
- Save design/research notes to docs/research/

### 2. Plan
- Break work into small tasks with exact file paths
- Save implementation plan to docs/plans/
- Get approval before implementing

### 3. Implement
- Follow TDD: write failing test → implement → verify
- Commit after completing implementation
- Follow existing project conventions (see agent_docs/code_conventions.md)

### 4. Validate
- Run all quality gates (lint, test, build)
- Evidence before claims — verify output before declaring success
- Use the project's established CI pipeline

## Implementation Guards

### Observe First, Prescribe Never
Agent docs describe reality. They are a reference for understanding the project, not a mandate for changing it. If an existing pattern conflicts with a suggestion, the existing pattern wins. Only flag genuinely problematic patterns (security vulnerabilities, data loss risks) as observations.

### Blast Radius Check
Before modifying any function or component, search for all callers/importers. If callers span 3+ modules, note the blast radius and verify a caller from each module after the change.

### Proactive Checkpoint
After every 5 implementation steps (or when context feels heavy), write a checkpoint:
- Success criteria status (done vs remaining)
- Files changed so far
- Current step and what's next

## Documentation Requirements

| Artifact | Location | When |
|----------|----------|------|
| Research/design doc | docs/research/YYYY-MM-DD-<topic>.md | Before implementation |
| ADRs | docs/decisions/NNN-<title>.md | Any decision with meaningful alternatives |
| Implementation plan | docs/plans/YYYY-MM-DD-<feature>.md | Before implementation |

## Git Conventions

- **Branches:** main (production), develop (integration), feature/<short-description>
- **Flow:** feature/* → PR to develop → testing → PR to main
- **Commits:** Conventional Commits — type(scope): description
  - Types: feat, fix, chore, refactor, test, docs
- **Never push directly to main or develop.** All changes via PR.

## Agent Docs Reference

Read the relevant doc in agent_docs/ before starting a task:

| Doc | When to read |
|-----|-------------|
| building_the_project.md | Build setup, scripts, env config |
| code_conventions.md | Any code change |
| running_tests.md | Writing or running tests |
| service_architecture.md | Adding/modifying services or packages |
| branching_workflow.md | Branch management, releases, changelogs |
| dependency_updates.md | Adding/updating dependencies |
| audit_skills.md | Running quality audits |
| authentication.md | Auth-related changes (if present) |
| database_schema.md | Schema changes (if present) |
| frontend_quality.md | Frontend quality standards (if present) |
| service_communication.md | API contracts (if present) |
```

**Step 2: Verify the file is well-formed markdown**

Run: `cat core/workflow.md | head -5`
Expected: The header lines appear correctly.

**Step 3: Commit**

Do not commit yet — batch with Phase 1.

---

### Task 2: Create template agent_docs in `core/agent_docs/`

**Files:**
- Create: `core/agent_docs/building_the_project.md`
- Create: `core/agent_docs/code_conventions.md`
- Create: `core/agent_docs/running_tests.md`
- Create: `core/agent_docs/service_architecture.md`
- Create: `core/agent_docs/branching_workflow.md`
- Create: `core/agent_docs/audit_skills.md`
- Create: `core/agent_docs/memory_system.md`
- Create: `core/agent_docs/dependency_updates.md`
- Create: `core/agent_docs/authentication.md` (optional template)
- Create: `core/agent_docs/database_schema.md` (optional template)
- Create: `core/agent_docs/frontend_quality.md` (optional template)
- Create: `core/agent_docs/service_communication.md` (optional template)

**Step 1: Create `core/agent_docs/` directory**

Run: `mkdir -p core/agent_docs`

**Step 2: Write each always-generated template**

Each template follows this pattern:
- A header explaining what this doc captures
- Sections with `<!-- ONBOARDING: instructions for the onboarding agent -->` comments explaining what to discover
- Placeholder text like `{{TODO: detected during onboarding}}` where values go
- The section structure from the current doc, but stripped of all React/TypeScript/Express specifics

**`building_the_project.md` template:**
```markdown
# Building the Project

## Prerequisites

<!-- ONBOARDING: List runtime requirements detected from the project (e.g., Node.js version from .nvmrc, Python version from pyproject.toml, .NET SDK version from global.json, PHP version from composer.json). -->

{{TODO: detected during onboarding}}

## Project Structure

<!-- ONBOARDING: Map the top-level directory structure. Note the purpose of each directory based on contents. For monorepos, document the workspace/package layout. -->

{{TODO: detected during onboarding}}

## Development Commands

<!-- ONBOARDING: Extract from package.json scripts, Makefile targets, composer.json scripts, pyproject.toml scripts, .csproj build targets, or equivalent. Document the commands for: dev server, build, lint, test, and any other common tasks. -->

| Command | Purpose |
|---------|---------|
| {{TODO}} | Start development server |
| {{TODO}} | Build for production |
| {{TODO}} | Run linter/formatter |
| {{TODO}} | Run tests |

## Environment Variables

<!-- ONBOARDING: Check for .env.example, .env.template, or environment variable references in config files. Document required variables without exposing values. -->

{{TODO: detected during onboarding}}

## Dependencies & Package Management

<!-- ONBOARDING: Identify the package manager (npm, yarn, pnpm, pip, poetry, composer, NuGet, dotnet) and any workspace/monorepo tooling (Turborepo, Nx, Lerna, etc.). Document install and add-dependency commands. -->

{{TODO: detected during onboarding}}

## Build Pipeline

<!-- ONBOARDING: Document the build order if multiple packages/apps exist. Note any pre-build or post-build steps. -->

{{TODO: detected during onboarding}}
```

**`code_conventions.md` template:**
```markdown
# Code Conventions

<!-- ONBOARDING: Analyze existing source files to determine the project's actual conventions. Document what IS, not what should be. Examine 5-10 representative files across the codebase. -->

## Language & Type System

<!-- ONBOARDING: What language(s)? Strict typing enabled? Any type-checking tools (TypeScript strict, mypy, phpstan, etc.)? -->

{{TODO: detected during onboarding}}

## File Organization

<!-- ONBOARDING: How are files organized? By feature, by type, by layer? What is the maximum file size convention (if any)? One class/component per file? -->

{{TODO: detected during onboarding}}

## Naming Conventions

<!-- ONBOARDING: Analyze existing code for naming patterns. PascalCase, camelCase, snake_case — for what? Files, classes, functions, variables, constants. -->

{{TODO: detected during onboarding}}

## Import/Dependency Order

<!-- ONBOARDING: Check for import ordering conventions. Any path aliases configured? -->

{{TODO: detected during onboarding}}

## Error Handling

<!-- ONBOARDING: How does existing code handle errors? Custom error classes? Error boundaries? Try/catch patterns? -->

{{TODO: detected during onboarding}}

## Linting & Formatting

<!-- ONBOARDING: What linter/formatter is configured? (ESLint, Prettier, Ruff, Black, PHP_CodeSniffer, StyleCop, etc.) Document the config file location and any custom rules. -->

{{TODO: detected during onboarding}}

## Comments & Documentation

<!-- ONBOARDING: Does the project use JSDoc, docstrings, XML docs? What is the existing comment style and density? -->

{{TODO: detected during onboarding}}

## DRY & Abstraction

- Extract shared logic at 3+ occurrences (or 2 if non-trivial)
- Prefer explicit over clever
- Avoid premature abstraction — three similar lines is better than a premature helper
```

**`running_tests.md` template:**
```markdown
# Running Tests

## Test Framework

<!-- ONBOARDING: Detect test framework from config files and dependencies (vitest.config, jest.config, pytest.ini, phpunit.xml, *.test.csproj, etc.). Document the framework and version. -->

{{TODO: detected during onboarding}}

## Commands

<!-- ONBOARDING: Extract test commands from project scripts/config. -->

| Command | Purpose |
|---------|---------|
| {{TODO}} | Run all tests |
| {{TODO}} | Run tests in watch mode |
| {{TODO}} | Run a specific test file |

## File Conventions

<!-- ONBOARDING: Where do tests live? Colocated (foo.test.ts next to foo.ts), separate directory (tests/, __tests__/), or mixed? What is the naming pattern? -->

{{TODO: detected during onboarding}}

## Test Structure

<!-- ONBOARDING: Look at 2-3 existing test files. Document the patterns used (describe/it, test classes, arrange/act/assert, fixtures, factories). -->

{{TODO: detected during onboarding}}

## Test Levels

<!-- ONBOARDING: What kinds of tests exist? Unit, integration, e2e? What tools are used for each? -->

| Level | Tool | Location |
|-------|------|----------|
| Unit | {{TODO}} | {{TODO}} |
| Integration | {{TODO}} | {{TODO}} |
| E2E | {{TODO}} | {{TODO}} |

## Mocking

<!-- ONBOARDING: How does the project mock dependencies? Built-in mocking, dependency injection, test doubles? Document existing patterns. -->

{{TODO: detected during onboarding}}

## What to Test

- Business logic and data transformations
- Error paths and edge cases
- Integration points (API calls, database queries)
- User interactions (for frontend)

## What NOT to Test

- Framework internals
- Simple pass-through functions
- Third-party library behavior
- Implementation details (test behavior, not how)
```

**`service_architecture.md` template:**
```markdown
# Service Architecture

<!-- ONBOARDING: Map the actual architecture of this project. Do NOT suggest a different architecture — document what exists. -->

## Overview

<!-- ONBOARDING: What is this project? Monolith, microservices, monorepo with multiple apps, single SPA, WordPress theme/plugin? Draw a simple diagram of the components and their relationships. -->

{{TODO: detected during onboarding}}

## Components

<!-- ONBOARDING: List each application/service/package. For each, note: purpose, framework, entry point, key directories. -->

{{TODO: detected during onboarding}}

## Layer Separation

<!-- ONBOARDING: How is the code layered? MVC, clean architecture, feature-based, flat? Document the actual pattern, not an ideal. -->

{{TODO: detected during onboarding}}

## State Management

<!-- ONBOARDING: How is state managed? (Frontend: Redux, Zustand, Context, etc. Backend: sessions, cache, etc.) -->

{{TODO: detected during onboarding}}

## Security Defaults

<!-- ONBOARDING: What security measures are in place? (CORS, CSP, rate limiting, auth middleware, input sanitization, etc.) -->

{{TODO: detected during onboarding}}

## Adding New Features

<!-- ONBOARDING: Based on the patterns observed, document the standard process for adding a new feature to this project. Where do new files go? What conventions should be followed? -->

{{TODO: detected during onboarding}}
```

**`dependency_updates.md` template:**
```markdown
# Dependency Updates

## Automated Updates

<!-- ONBOARDING: Check for Renovate (renovate.json), Dependabot (.github/dependabot.yml), or other automated update tools. Document the current configuration. -->

{{TODO: detected during onboarding — or "None detected"}}

## Update Strategy

- **Patch updates:** Low risk. Review changelog, run tests, merge.
- **Minor updates:** Medium risk. Check for breaking changes in changelog, run full test suite.
- **Major updates:** High risk. Read migration guide, test thoroughly, consider a dedicated branch.

## Manual Update Commands

<!-- ONBOARDING: Document the commands for the project's package manager. -->

| Action | Command |
|--------|---------|
| Check outdated | {{TODO}} |
| Update single package | {{TODO}} |
| Update all | {{TODO}} |

## Adding New Dependencies

Before adding a dependency, evaluate:
1. Is it actively maintained?
2. What is the bundle/install size impact?
3. Does it duplicate functionality already in the project?
4. Are there lighter alternatives?

<!-- ONBOARDING: Document the correct command to add a dependency to the right workspace/location. -->
```

**Step 3: Copy `branching_workflow.md` and `memory_system.md` as-is**

These are already platform-agnostic. Copy from `agent_docs/` to `core/agent_docs/` with only the CI-platform-specific references genericized.

**Step 4: Write `audit_skills.md` template**

Strip React-specific references (React rendering, bundle size with Vite). Keep the audit phase structure, severity levels, and verdict logic. Replace stack-specific checks with `<!-- ONBOARDING: add stack-specific audit targets -->` markers.

**Step 5: Write optional templates**

Create `authentication.md`, `database_schema.md`, `frontend_quality.md`, `service_communication.md` as discovery-prompt templates. Each has sections with `<!-- ONBOARDING: ... -->` instructions but is only generated when the relevant subsystem is detected.

These follow the same pattern as above — section structure from the current docs, but stripped of all platform specifics and replaced with discovery instructions.

---

### Task 3: Create `core/docs/` skeleton

**Files:**
- Create: `core/docs/decisions/000-template.md` (copy from current)
- Create: `core/docs/decisions/001-use-adrs.md` (copy from current)
- Create: `core/docs/research/.gitkeep`
- Create: `core/docs/plans/.gitkeep`

**Step 1: Copy ADR files**

Copy `docs/decisions/000-template.md` and `docs/decisions/001-use-adrs.md` to `core/docs/decisions/`.

**Step 2: Create .gitkeep files**

```bash
mkdir -p core/docs/research core/docs/plans
touch core/docs/research/.gitkeep core/docs/plans/.gitkeep
```

**Step 3: Commit Phase 1**

```bash
git add core/
git commit -m "feat: create core layer with universal workflow and template agent_docs"
```

---

## Phase 2: Create Stack Detection

### Task 4: Create React/TypeScript stack

**Files:**
- Create: `stacks/react-typescript/detect.md`
- Create: `stacks/react-typescript/templates.md`

**Step 1: Write `detect.md`**

```markdown
# React/TypeScript Detection

## Primary Signals (any one confirms)
- `tsconfig.json` exists at root or in a subdirectory
- `package.json` contains `react` in dependencies
- `.tsx` or `.jsx` files exist in the project

## Secondary Signals (strengthen confidence)
- `vite.config.ts` / `next.config.js` / `webpack.config.js` — identifies bundler
- `tailwind.config.*` — Tailwind CSS in use
- `.eslintrc*` / `eslint.config.*` with TypeScript rules
- `vitest.config.*` / `jest.config.*` — identifies test framework
- `prisma/schema.prisma` — Prisma ORM in use
- `apps/` or `packages/` directories — monorepo structure

## Sub-Variants
- **Next.js:** `next.config.*` present
- **Vite SPA:** `vite.config.*` without Next.js
- **CRA:** `react-scripts` in package.json
- **Monorepo:** `turbo.json`, `nx.json`, or `lerna.json` present
```

**Step 2: Write `templates.md`**

Instructions to the onboarding agent for how to fill each agent_doc template when React/TypeScript is detected. Covers:
- `building_the_project.md`: Check `package.json` scripts, identify bundler (Vite, Next, Webpack, CRA), note workspace tool (Turborepo, Nx), path aliases from tsconfig
- `code_conventions.md`: Check tsconfig strict mode, analyze component patterns (functional vs class), identify style system (Tailwind, CSS Modules, styled-components, SASS), check ESLint/Prettier config, naming conventions from existing files
- `running_tests.md`: Identify test framework from deps/config, check for Testing Library, note test file location pattern
- `service_architecture.md`: Map `apps/` and `packages/` structure for monorepos, identify state management (Zustand, Redux, Context), map API layer
- `dependency_updates.md`: Check for Renovate/Dependabot, note workspace-specific install commands
- Post-edit hook: `tsc --noEmit` against the appropriate tsconfig

**Step 3: Commit**

Do not commit yet — batch with all stacks.

---

### Task 5: Create WordPress stack

**Files:**
- Create: `stacks/wordpress/detect.md`
- Create: `stacks/wordpress/templates.md`

**Step 1: Write `detect.md`**

```markdown
# WordPress Detection

## Primary Signals (any one confirms)
- `wp-config.php` exists
- `style.css` with `Theme Name:` header exists
- `functions.php` exists in theme root
- `wp-content/` directory structure present

## Secondary Signals
- `composer.json` with WordPress dependencies (wpackagist, roots/*)
- `.wp-env.json` — WordPress local dev environment
- `phpunit.xml` or `phpunit.xml.dist` — PHP testing
- `webpack.config.js` / `@wordpress/scripts` — block editor / JS build pipeline
- `theme.json` — block theme configuration

## Sub-Variants
- **Classic theme:** `style.css` + `functions.php`, no `theme.json`
- **Block theme:** `theme.json` + `templates/` + `parts/` directories
- **Plugin:** `plugin-name.php` with `Plugin Name:` header
- **Headless:** WordPress backend + separate frontend (check for REST API / GraphQL usage)
- **Bedrock:** `web/wp/` structure, composer-managed
```

**Step 2: Write `templates.md`**

WordPress-specific fill instructions for each agent_doc template:
- `building_the_project.md`: Check for wp-env, Docker, Local by Flywheel, MAMP. Note theme/plugin activation. Identify JS build tool (wp-scripts, Vite, webpack, none)
- `code_conventions.md`: Check for WordPress Coding Standards (WPCS), phpcs.xml, .editorconfig. Analyze PHP naming patterns. Note hook/filter conventions. Check JS style if present
- `running_tests.md`: Check for PHPUnit, WP_UnitTestCase, Jest/Vitest for JS, wp-env test commands
- `service_architecture.md`: Map theme structure (templates, partials, includes). Note custom post types, taxonomies, REST endpoints. Plugin architecture if applicable
- Post-edit hook: `php -l` for syntax checking edited PHP files

---

### Task 6: Create .NET/C# stack

**Files:**
- Create: `stacks/dotnet/detect.md`
- Create: `stacks/dotnet/templates.md`

**Step 1: Write `detect.md`**

```markdown
# .NET/C# Detection

## Primary Signals (any one confirms)
- `*.sln` file exists
- `*.csproj` file exists
- `Program.cs` or `Startup.cs` exists

## Secondary Signals
- `appsettings.json` / `appsettings.Development.json`
- `global.json` — SDK version pinning
- `.editorconfig` with C# rules
- `Directory.Build.props` — shared build properties
- `docker-compose.yml` with dotnet images
- `*.fsproj` — F# project (variant)

## Sub-Variants
- **ASP.NET Core Web API:** Controllers/ or Endpoints/ directory, Swagger/OpenAPI config
- **ASP.NET Core MVC:** Views/ directory, Razor files (.cshtml)
- **Blazor:** .razor files
- **Console app:** Single Program.cs entry point, no web framework
- **Multi-project solution:** Multiple .csproj in subdirectories
```

**Step 2: Write `templates.md`**

.NET-specific fill instructions:
- `building_the_project.md`: `dotnet build`, `dotnet run`, `dotnet watch`. Note solution structure, project references, NuGet restore
- `code_conventions.md`: Check .editorconfig, analyze naming (PascalCase methods, _camelCase private fields), check for nullable reference types, examine dependency injection patterns
- `running_tests.md`: `dotnet test`, identify test framework (xUnit, NUnit, MSTest), check for test project naming convention
- `service_architecture.md`: Map solution projects, identify patterns (Clean Architecture, Vertical Slices, traditional MVC), note middleware pipeline
- Post-edit hook: `dotnet build --no-restore` on the relevant project

---

### Task 7: Create Python stack

**Files:**
- Create: `stacks/python/detect.md`
- Create: `stacks/python/templates.md`

**Step 1: Write `detect.md`**

```markdown
# Python Detection

## Primary Signals (any one confirms)
- `pyproject.toml` exists
- `setup.py` or `setup.cfg` exists
- `requirements.txt` exists
- `Pipfile` exists
- `manage.py` exists (Django)

## Secondary Signals
- `app.py` / `main.py` — common entry points
- `pytest.ini` / `conftest.py` / `tox.ini` — testing config
- `mypy.ini` / `pyrightconfig.json` — type checking
- `ruff.toml` / `.flake8` / `.pylintrc` — linting
- `alembic/` or `migrations/` — database migrations
- `.python-version` / `runtime.txt` — version pinning
- `Dockerfile` with python base image

## Sub-Variants
- **Django:** `manage.py` + `settings.py` + `urls.py`
- **Flask:** `app.py` with Flask import, or application factory pattern
- **FastAPI:** `main.py` with FastAPI import, `uvicorn` in dependencies
- **CLI tool:** `click` or `typer` in dependencies, `__main__.py`
- **Data/ML:** `jupyter`, `pandas`, `numpy`, `torch` in dependencies
```

**Step 2: Write `templates.md`**

Python-specific fill instructions:
- `building_the_project.md`: Identify package manager (pip, poetry, pipenv, uv), virtual environment setup, dev commands (manage.py runserver, uvicorn, flask run)
- `code_conventions.md`: Check for Ruff, Black, isort, Flake8 config. Analyze naming (PEP 8 snake_case). Check type hints usage, docstring style (Google, NumPy, Sphinx)
- `running_tests.md`: pytest config, test directory structure, fixtures, parametrize patterns
- `service_architecture.md`: Map Django apps or Flask blueprints or FastAPI routers, identify ORM (Django ORM, SQLAlchemy, Tortoise), note middleware
- Post-edit hook: `ruff check` or `mypy` if configured

---

### Task 8: Create generic fallback stack

**Files:**
- Create: `stacks/generic/templates.md`

**Step 1: Write `templates.md`**

Fallback instructions when no specific stack is detected:
- Analyze file extensions to determine primary language(s)
- Check for any Makefile, Dockerfile, or CI config
- Look for any test framework indicators
- Document whatever structure exists
- Leave more sections as `{{TODO: document manually}}` since auto-detection is limited

**Step 2: Commit all stacks**

```bash
git add stacks/
git commit -m "feat: add stack detection for React/TS, WordPress, .NET, Python, and generic"
```

---

## Phase 3: Create Adapters

### Task 9: Create GitHub Copilot adapter

**Files:**
- Create: `adapters/copilot/generate.mjs`
- Create: `adapters/copilot/README.md`

**Step 1: Write `generate.mjs`**

This script reads the populated `core/workflow.md` and `agent_docs/` files and generates `.github/copilot-instructions.md`. Since the core format is already Copilot-native, this is mostly a concatenation:

```javascript
// adapters/copilot/generate.mjs
// Generates .github/copilot-instructions.md from populated core files
//
// Input: populated agent_docs/ directory, core/workflow.md
// Output: .github/copilot-instructions.md in the target project

import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';

export function generateCopilotConfig(targetDir, agentDocsDir) {
  const githubDir = join(targetDir, '.github');
  mkdirSync(githubDir, { recursive: true });

  // Read workflow.md as the base
  const workflow = readFileSync(join(dirname(agentDocsDir), 'workflow.md'), 'utf-8');

  // Read all populated agent_docs
  const docs = readdirSync(agentDocsDir)
    .filter(f => f.endsWith('.md'))
    .map(f => ({
      name: f,
      content: readFileSync(join(agentDocsDir, f), 'utf-8')
    }));

  // Compose the instructions file
  let output = `# Copilot Instructions\n\n`;
  output += `<!-- Generated by ai-workflow-overlay. Edit agent_docs/ source files, then re-run onboarding to regenerate. -->\n\n`;
  output += workflow + '\n\n';
  output += `---\n\n# Project Documentation\n\n`;
  for (const doc of docs) {
    output += doc.content + '\n\n---\n\n';
  }

  writeFileSync(join(githubDir, 'copilot-instructions.md'), output);
  return join(githubDir, 'copilot-instructions.md');
}
```

**Step 2: Write README.md**

Document what the adapter generates and how to manually regenerate.

---

### Task 10: Create Claude Code adapter

**Files:**
- Create: `adapters/claude/generate.mjs`
- Create: `adapters/claude/README.md`
- Move: all `.claude/hooks/` (except `post_edit_typecheck.sh`) to `adapters/claude/hooks/`
- Move: `.claude/agents/` to `adapters/claude/agents/`
- Move: `.claude/commands/` to `adapters/claude/commands/`
- Move: `.claude/skills/` to `adapters/claude/skills/`
- Create: `adapters/claude/hooks/post_edit_check.sh` (stack-aware replacement for `post_edit_typecheck.sh`)

**Step 1: Write `generate.mjs`**

This script:
1. Reads the populated core files
2. Generates a `CLAUDE.md` with Claude-specific formatting (tech stack table, model routing, command reference)
3. Copies `.claude/` directory structure (settings.json, hooks, agents, commands, skills)
4. Configures `settings.json` permissions based on detected stack (e.g., `Bash(npm run *)` for Node, `Bash(dotnet *)` for .NET, `Bash(composer *)` for PHP)
5. Selects the appropriate post-edit hook based on stack

```javascript
// Key function: generate stack-appropriate settings.json permissions
function getPermissions(detectedStacks) {
  const allow = [
    // Always allowed — git operations
    'Bash(git status *)', 'Bash(git diff *)', 'Bash(git log *)',
    'Bash(git branch *)', 'Bash(git checkout -b *)',
    'Bash(git add *)', 'Bash(git commit *)', 'Bash(git merge *)',
    'Bash(git worktree *)',
  ];
  const deny = [
    'Bash(git push --force *)',
    'Bash(git reset --hard *)',
  ];

  if (detectedStacks.includes('react-typescript')) {
    allow.push('Bash(npm run *)', 'Bash(npx *)', 'Bash(npx turbo *)');
    deny.push('Read(.env)', 'Read(apps/*/.env)');
  }
  if (detectedStacks.includes('wordpress')) {
    allow.push('Bash(composer *)', 'Bash(wp-env *)', 'Bash(npm run *)');
    deny.push('Read(wp-config.php)');
  }
  if (detectedStacks.includes('dotnet')) {
    allow.push('Bash(dotnet build *)', 'Bash(dotnet test *)', 'Bash(dotnet run *)');
    deny.push('Read(appsettings.*.json)');
  }
  if (detectedStacks.includes('python')) {
    allow.push('Bash(pytest *)', 'Bash(python *)', 'Bash(pip *)', 'Bash(poetry *)');
    deny.push('Read(.env)');
  }

  return { allow, deny };
}
```

**Step 2: Create stack-aware `post_edit_check.sh`**

Replace the hardcoded TypeScript check with a stack-detection wrapper:

```bash
#!/bin/bash
# PostToolUse hook — syntax/type check after Edit/Write operations
# Stack-aware: detects file type and runs appropriate checker

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.filePath // empty' 2>/dev/null)

if [ -z "$FILE_PATH" ]; then
    echo '{}'
    exit 0
fi

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"

case "$FILE_PATH" in
    *.ts|*.tsx)
        # TypeScript: find nearest tsconfig and run tsc
        TSCONFIG=$(find_nearest_tsconfig "$FILE_PATH" "$PROJECT_DIR")
        if [ -n "$TSCONFIG" ]; then
            ERRORS=$(cd "$PROJECT_DIR" && npx tsc --noEmit -p "$TSCONFIG" 2>&1 | grep -A 1 "$(basename "$FILE_PATH")" | head -10)
            if [ -n "$ERRORS" ] && echo "$ERRORS" | grep -q "error TS"; then
                ESCAPED=$(echo "$ERRORS" | head -5 | sed 's/"/\\"/g' | tr '\n' ' ')
                echo "{\"decision\":\"allow\",\"reason\":\"TypeScript error: $ESCAPED\"}"
                exit 0
            fi
        fi
        ;;
    *.php)
        # PHP: syntax check
        ERRORS=$(php -l "$FILE_PATH" 2>&1)
        if echo "$ERRORS" | grep -q "Parse error"; then
            ESCAPED=$(echo "$ERRORS" | head -3 | sed 's/"/\\"/g' | tr '\n' ' ')
            echo "{\"decision\":\"allow\",\"reason\":\"PHP syntax error: $ESCAPED\"}"
            exit 0
        fi
        ;;
    *.cs)
        # C#: build check (if project file found)
        CSPROJ=$(find_nearest_csproj "$FILE_PATH" "$PROJECT_DIR")
        if [ -n "$CSPROJ" ]; then
            ERRORS=$(dotnet build "$CSPROJ" --no-restore 2>&1 | grep -i "error" | head -5)
            if [ -n "$ERRORS" ]; then
                ESCAPED=$(echo "$ERRORS" | sed 's/"/\\"/g' | tr '\n' ' ')
                echo "{\"decision\":\"allow\",\"reason\":\"Build error: $ESCAPED\"}"
                exit 0
            fi
        fi
        ;;
    *.py)
        # Python: ruff or mypy if available
        if command -v ruff &>/dev/null; then
            ERRORS=$(ruff check "$FILE_PATH" 2>&1 | head -5)
            if [ -n "$ERRORS" ]; then
                ESCAPED=$(echo "$ERRORS" | sed 's/"/\\"/g' | tr '\n' ' ')
                echo "{\"decision\":\"allow\",\"reason\":\"Lint error: $ESCAPED\"}"
                exit 0
            fi
        fi
        ;;
esac

echo '{}'
exit 0
```

**Step 3: Move existing Claude-specific files**

Move all memory system files (agents/, commands/, skills/) and workflow hooks to `adapters/claude/`.

**Step 4: Write README.md**

---

### Task 11: Create Cursor adapter

**Files:**
- Create: `adapters/cursor/generate.mjs`
- Create: `adapters/cursor/README.md`

**Step 1: Write `generate.mjs`**

Generates `.cursorrules` from the populated core files. Similar to Copilot adapter but formatted for Cursor's conventions.

**Step 2: Commit Phase 3**

```bash
git add adapters/
git commit -m "feat: add adapters for Copilot, Claude Code, and Cursor"
```

---

## Phase 4: Create the Onboarding Script

### Task 12: Write `scripts/onboard.mjs`

**Files:**
- Create: `scripts/onboard.mjs`

**Step 1: Write the onboarding script**

This is the main entry point. Structure:

```javascript
#!/usr/bin/env node

// scripts/onboard.mjs
// Intelligent onboarding script for ai-workflow-overlay
// Scans an existing project, detects stack, populates agent_docs,
// and generates agent-specific config.

import { /* fs, path, readline, execSync */ } from 'node:*';

// 1. Pre-flight checks
//    - Is this a git repo?
//    - Does overlay already exist? (check for agent_docs/ or .github/copilot-instructions.md)
//    - Any uncommitted changes?

// 2. Stack detection
//    - Read stacks/*/detect.md to get signal lists
//    - Scan project for each signal
//    - Report detected stacks
//    - Confirm with user (interactive prompt)

// 3. Agent selection
//    - Copilot is always generated
//    - Ask: "Also generate config for: [Claude Code] [Cursor] [None]"

// 4. CI detection
//    - Scan for .github/workflows/, azure-pipelines.yml, Jenkinsfile, .gitlab-ci.yml
//    - If found: offer to extend with quality gates
//    - If not found: ask which platform to target
//    - Generate CI template

// 5. Project analysis prompt
//    - Generate an analysis prompt based on detected stacks
//    - The prompt instructs the AI agent to:
//      a. Read key config files
//      b. Analyze sample source files
//      c. Fill in agent_doc templates
//    - Output the prompt for the user to run via their AI agent
//    - OR if running interactively, output skeleton files with TODO markers

// 6. File generation
//    - Copy docs/ skeleton
//    - Write skeleton agent_docs (with TODOs or populated if agent-assisted)
//    - Generate .github/copilot-instructions.md
//    - Run selected adapter generators
//    - Write CI config

// 7. Summary
//    - List all files created/modified
//    - Output next steps
```

The key insight: the onboard script can't run the AI analysis itself (it's a Node script, not an AI agent). Instead, it:
1. Generates the file structure with template placeholders
2. Outputs an **analysis prompt** — a detailed markdown prompt that the user pastes into their AI agent (Copilot, Claude, Cursor)
3. The AI agent reads the project and fills in the templates

For Claude Code specifically, the script could also generate a `.claude/commands/onboard-analyze.md` slash command that performs the analysis automatically.

**Step 2: Verify the script runs**

```bash
node scripts/onboard.mjs --help
```

Expected: Help text with usage instructions.

**Step 3: Commit**

```bash
git add scripts/
git commit -m "feat: add intelligent onboarding script"
```

---

## Phase 5: CI Templates

### Task 13: Create CI templates for GitHub Actions and Azure DevOps

**Files:**
- Create: `scripts/ci-templates/github-actions.yml`
- Create: `scripts/ci-templates/azure-pipelines.yml`

**Step 1: Write GitHub Actions template**

A generic CI pipeline with lint + test + build jobs. The onboarding script fills in the actual commands based on detected stack.

```yaml
# Template — commands are filled during onboarding
name: CI
on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      # {{SETUP_STEPS}} — runtime/SDK setup filled by onboarding
      # {{LINT_COMMAND}} — filled by onboarding

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      # {{SETUP_STEPS}}
      # {{TEST_COMMAND}}

  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4
      # {{SETUP_STEPS}}
      # {{BUILD_COMMAND}}
```

**Step 2: Write Azure DevOps template**

Same structure adapted to Azure Pipelines syntax.

**Step 3: Commit**

```bash
git add scripts/ci-templates/
git commit -m "feat: add CI templates for GitHub Actions and Azure DevOps"
```

---

## Phase 6: Cleanup & Root Files

### Task 14: Remove old scaffolding

**Files:**
- Delete: `scripts/templates/` (root.mjs, web.mjs, api.mjs, shared.mjs)
- Delete: `scripts/setup.mjs`
- Delete: `renovate.json`
- Delete: `docs/decisions/002-deferred-quality-gates.md`
- Delete: `docs/decisions/003-docker-compose-for-local-database.md`
- Delete: `docs/decisions/004-postgresql-over-mysql.md`
- Delete: current `agent_docs/` (replaced by `core/agent_docs/`)
- Delete: current `.claude/` directory (moved to `adapters/claude/`)

**Step 1: Remove old files**

```bash
rm -rf scripts/templates scripts/setup.mjs
rm renovate.json
rm docs/decisions/002-*.md docs/decisions/003-*.md docs/decisions/004-*.md
rm -rf agent_docs/
rm -rf .claude/hooks .claude/agents .claude/commands .claude/skills
```

**Step 2: Verify no broken references**

Grep for any references to removed files in the remaining codebase.

---

### Task 15: Update root files

**Files:**
- Rewrite: `package.json`
- Rewrite: `README.md`
- Rewrite: `.gitignore`
- Create: `CLAUDE.md` (minimal — points to core/workflow.md, used during development of the overlay itself)

**Step 1: Write new `package.json`**

```json
{
  "name": "ai-workflow-overlay",
  "version": "1.0.0",
  "description": "Platform-agnostic AI development workflow for existing projects",
  "type": "module",
  "scripts": {
    "onboard": "node scripts/onboard.mjs"
  },
  "engines": {
    "node": ">=18"
  }
}
```

**Step 2: Write new `.gitignore`**

```
node_modules/
.DS_Store
.env
*.log
```

**Step 3: Write new `README.md`**

Cover: what is this, quick start (clone + run onboard), supported stacks, supported agents, project structure, how to add a new stack, how to add a new adapter.

**Step 4: Commit cleanup**

```bash
git add -A
git commit -m "chore: remove old scaffolding, update root files for ai-workflow-overlay"
```

---

## Phase 7: Testing & Validation

### Task 16: Test onboarding against a mock project

**Step 1: Create a temporary test directory with a mock React/TypeScript project**

Minimal `package.json` with react, `tsconfig.json`, a `.tsx` file, `vitest.config.ts`.

**Step 2: Run `node ../ai-workflow-overlay/scripts/onboard.mjs` from the mock project**

Verify:
- Stack detected as React/TypeScript
- Agent_docs templates generated with correct TODO markers
- `.github/copilot-instructions.md` created
- No errors

**Step 3: Repeat with mock WordPress project**

Minimal `wp-config.php`, `style.css` with Theme Name header, `functions.php`.

**Step 4: Repeat with mock Python project**

Minimal `pyproject.toml`, `manage.py`, `requirements.txt`.

**Step 5: Repeat with empty project (generic fallback)**

Just a git repo with a README. Verify generic detection works.

**Step 6: Commit any fixes**

---

### Task 17: Final validation

**Step 1: Run the overlay on itself**

The overlay repo should be able to onboard itself (it's a Node.js project with a package.json).

**Step 2: Verify all files are well-formed**

```bash
find . -name "*.md" -exec echo {} \; | head -20
find . -name "*.mjs" -exec node --check {} \;
```

**Step 3: Final commit**

```bash
git add -A
git commit -m "test: validate onboarding across multiple project types"
```

---

## Summary

| Phase | Tasks | What it produces |
|-------|-------|-----------------|
| 1. Core Layer | Tasks 1-3 | `core/workflow.md`, template agent_docs, docs skeleton |
| 2. Stack Detection | Tasks 4-8 | Detection + template fill for React/TS, WordPress, .NET, Python, generic |
| 3. Adapters | Tasks 9-11 | Copilot, Claude Code, Cursor adapter generators |
| 4. Onboarding | Task 12 | `scripts/onboard.mjs` — the intelligent entry point |
| 5. CI Templates | Task 13 | GitHub Actions + Azure DevOps pipeline templates |
| 6. Cleanup | Tasks 14-15 | Remove old scaffolding, update root files |
| 7. Validation | Tasks 16-17 | Test against mock projects of each stack type |
