# Memory System

Describes the persistent memory concept used by the AI agent in this project. The memory system allows an agent to retain context across sessions, avoid re-researching decisions, and maintain continuity through compaction events.

<!-- ONBOARDING: detect the agent adapter in use — look for adapters/ directory, .claude/, .cursor/, or similar agent config directories to find the concrete implementation paths -->

## How It Works (Automatic)

| Event | What Happens |
|-------|-------------|
| **Session starts** | Agent loads last session summary, preferences, decisions, and active plans |
| **Periodically** | Agent is prompted to save key context from the current conversation |
| **Before compaction** | Agent saves a structured summary of active plan state and session notes |
| **After compaction** | Agent re-injects key context including active plan progress |
| **File index** | Agent maintains a background index of project files for fast lookup |

## Memory Commands

<!-- ONBOARDING: detect memory command names from the adapter — e.g. /remember, /recall, /memory-status in Claude; equivalent commands may differ in other agents -->

| Command | Description |
|---------|-------------|
| `{{TODO: detected during onboarding}}` | Extract and save context from the current conversation |
| `{{TODO: detected during onboarding}}` | Search memory for relevant context on a topic |
| `{{TODO: detected during onboarding}}` | Show stored memory count by domain |

## Memory Tree Structure

<!-- ONBOARDING: detect the memory root path from the adapter config — e.g. .claude/memory/ for Claude Code -->

```
{{TODO: memory root — detected during onboarding}}/
├── _index.md          # Root index
├── decisions/         # Architecture, tech choices, strategic decisions
├── patterns/          # Reusable solutions, code patterns, techniques
├── bugs/              # Bugs encountered, root causes, fixes
├── preferences/       # User style, conventions, tool preferences
├── context/           # Project architecture, domain knowledge, business logic
├── sessions/          # Auto-generated session summaries
├── research/          # Codebase research documents
├── plans/             # Implementation plans and design docs
└── files/             # Project file directory index (auto-updated each session)
```

New domains can be created as needed. Common additions: `people/`, `apis/`, `infrastructure/`.

## Memory Entry Format

```markdown
# [Title]

**Created:** YYYY-MM-DD
**Last Updated:** YYYY-MM-DD
**Confidence:** high | medium | low
**Tags:** comma-separated-tags

## Summary
[1-3 sentence overview]

## Details
[Full content — decisions, code snippets, rationale]

## Related
[Links to related files or memory entries]
```

## Rules

- **Deduplicate** before writing; update existing entries rather than creating duplicates
- **Never delete** memories; mark as `**Status:** archived` instead
- **Keep indexes current**; every write updates relevant `_index.md` files
- **Verify writes**; confirm files and indexes were actually updated after saving
- **No secrets**; never store credentials or API keys in memory
- **Reference, don't copy**; point to file paths instead of duplicating code
- **Subagents for context control**; dispatch search to sub-agents to keep parent context clean
