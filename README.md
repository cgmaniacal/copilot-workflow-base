# copilot-workflow-base

copilot-workflow-base is a platform-agnostic AI development workflow that installs into any existing project. It brings structured research, planning, and implementation phases — along with auto-documented conventions, an ADR framework, CI quality gates, implementation guards, and a Claude memory system — without requiring you to start from a template or change your tech stack.

## Quick Start

1. Clone this repo:

```bash
git clone https://github.com/cgmaniacal/copilot-workflow-base.git
cd copilot-workflow-base
```

2. Run the onboarding script against your project:

```bash
node scripts/onboard.mjs --target /path/to/your/project
```

3. Open your project in your AI agent and run the analysis prompt that the onboarding script prints at the end.

## What You Get

- Structured four-phase workflow (Research, Plan, Implement, Validate)
- Auto-documented conventions generated from your actual codebase
- ADR framework for recording architectural decisions
- CI quality gates (lint, test, build) via GitHub Actions
- Implementation guards (blast radius checks, proactive checkpoints)
- Claude memory system for persistent context across sessions
- Agent configuration tailored to your chosen AI assistant

## Supported Stacks

- React / TypeScript
- WordPress (PHP)
- .NET / C#
- Python
- Generic (any project not matching the above)

## Supported Agents

- GitHub Copilot (primary)
- Claude Code
- Cursor

## Project Structure

```
core/          # Universal workflow docs and template agent_docs
adapters/      # Agent-specific config generators
  copilot/     # GitHub Copilot instructions generator
  claude/      # Claude Code hooks, agents, commands, settings
  cursor/      # Cursor rules generator
stacks/        # Stack detection logic and documentation templates
  react-ts/
  wordpress/
  dotnet/
  python/
  generic/
scripts/       # Onboarding script and CI templates
```

## How to Add a New Stack

1. Create a directory under `stacks/` named after the stack (e.g., `stacks/ruby/`)
2. Add `detect.md` — a description of how to detect this stack (file patterns, config files, package names)
3. Add `templates.md` — stack-specific agent doc content to merge into the project's `agent_docs/`

## How to Add a New Agent Adapter

1. Create a directory under `adapters/` named after the agent (e.g., `adapters/gemini/`)
2. Add `generate.mjs` — an ESM script that reads the detected stack and project info and writes the agent's config files to the target project
3. The script receives `{ projectRoot, stack, projectName }` as arguments and is responsible for writing all agent-specific files
