# Claude Code Adapter

Generates a complete Claude Code configuration for projects onboarded with copilot-workflow-base.

## What this adapter generates

| Output | Description |
|--------|-------------|
| `CLAUDE.md` | Claude's persistent instructions file — workflow, model routing, tech stack, commands, memory reference, and all agent docs |
| `.claude/settings.json` | Permissions (allow/deny) and hook registrations, tailored to the detected stack |
| `.claude/hooks/` | Shell hook scripts that run automatically during sessions |
| `.claude/agents/` | Sub-agent definitions for memory operations |
| `.claude/commands/` | Slash command definitions (`/remember`, `/recall`, `/memory-status`) |
| `.claude/skills/` | Memory skill protocols used by the commands and hooks |

## The memory system

The memory system provides persistent, cross-session knowledge storage in `.claude/memory/`. It is organized into domain directories:

| Domain | Contents |
|--------|---------|
| `decisions/` | Architectural and technical choices |
| `patterns/` | Reusable code solutions and techniques |
| `bugs/` | Bugs encountered, root causes, fixes |
| `preferences/` | User coding style and workflow preferences |
| `context/` | Project architecture and domain knowledge |
| `sessions/` | Auto-generated session summaries |
| `research/` | Codebase research documents |
| `plans/` | Implementation plans and design docs |
| `files/` | Auto-maintained project file index |

### Memory commands

| Command | What it does |
|---------|-------------|
| `/remember` | Extract and persist knowledge from the current conversation |
| `/recall [topic]` | Search memory for relevant context |
| `/memory-status` | Show a summary of all stored memories |

### How hooks use memory

| Hook | Trigger | What it does |
|------|---------|-------------|
| `session_start_recall.sh` | Session start | Injects recent memories, session summary, and active plans into Claude's context |
| `post_compact_recall.sh` | After context compaction | Re-injects key state (preferences, decisions, active plan) |
| `pre_compact_remember.sh` | Before context compaction | Writes a structured compaction summary to disk |
| `stop_remember_nudge.sh` | After each response | Tracks message count; every 15 messages prompts Claude to run `/remember` |
| `session_end_log.sh` | Session end | Logs the session end time, branch, and uncommitted file count |
| `update_file_index.sh` | Session start (background) | Regenerates the project file index at `.claude/memory/files/project_files.md` |
| `post_edit_check.sh` | After Edit/Write | Runs a stack-aware syntax or type check on the edited file |

## The `post_edit_check.sh` hook

This hook replaces the TypeScript-only `post_edit_typecheck.sh` with a stack-aware checker:

| Extension | Check |
|-----------|-------|
| `.ts` / `.tsx` | Finds nearest `tsconfig.json` by walking up directories; runs `npx tsc --noEmit -p <tsconfig>` |
| `.php` | Runs `php -l <file>` |
| `.cs` | Finds nearest `.csproj` by walking up directories; runs `dotnet build --no-restore <csproj>` |
| `.py` | If `ruff` is available, runs `ruff check <file>` |
| Other | No check — returns `{}` |

On error, outputs `{"decision":"allow","reason":"...error details..."}` so Claude sees the error immediately and can fix it. On success, outputs `{}`.

## Permission generation by stack

The `settings.json` `permissions` block is built from:

**Always included (allow):**
- All common git operations (status, diff, log, branch, checkout -b, add, commit, merge, worktree)
- Read, Write, Edit, Glob, Grep

**Always included (deny):**
- `git push --force`, `git push -f`, `git reset --hard`
- Reading `.env` and `.env.*` files

**Stack-specific additions:**

| Stack | Extra allow | Extra deny |
|-------|------------|------------|
| `react-typescript` | `npm run`, `npx`, `npx turbo`, `node` | — |
| `wordpress` | `composer`, `wp-env`, `npm run`, `npm install` | `Read(wp-config.php)` |
| `dotnet` | `dotnet build/test/run/restore` | `Read(appsettings.*.json)` |
| `python` | `pytest`, `python`, `pip`, `poetry`, `ruff` | — |

## When to regenerate

Regenerate after:
- Editing any file in `agent_docs/`
- Updating `core/workflow.md`
- Changing the detected stack

## How to regenerate

From the project root, run the onboarding script (which calls this adapter):

```bash
node scripts/onboard.mjs
```

Or call the adapter directly:

```javascript
import { generateClaudeConfig } from './adapters/claude/generate.mjs';

generateClaudeConfig(
  '/path/to/target-project',            // project being onboarded
  '/path/to/overlay/core',              // overlay's core/ directory
  '/path/to/target-project/agent_docs', // populated agent_docs in target project
  ['react-typescript']                  // detected stacks
);
```

The function returns:

```javascript
{
  claudeMdPath: '/path/to/target-project/CLAUDE.md',
  settingsPath: '/path/to/target-project/.claude/settings.json',
  copiedFiles: ['hooks/session_start_recall.sh', ...] // list of files written to .claude/
}
```

## Notes

- If `agent_docs/` does not exist yet, only the workflow content and stack sections are written to `CLAUDE.md`.
- All directories (`.claude/hooks/`, `.claude/agents/`, etc.) are created automatically if they do not exist.
- No external dependencies — uses only Node.js built-ins.
- The memory tree itself (`.claude/memory/`) is not created by this adapter. It is initialized on first use by running `bash .claude/skills/memory/scripts/init_memory_tree.sh`, which the `/remember` command does automatically.
