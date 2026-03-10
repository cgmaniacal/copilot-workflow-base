# Copilot Adapter

Generates a tiered instruction structure for GitHub Copilot in VS Code. This is the primary adapter — Copilot is the main target platform, supporting both Claude and ChatGPT as underlying models.

## What this adapter generates

| File | Description |
|------|-------------|
| `.github/copilot-instructions.md` | Universal workflow rules applied to all Copilot interactions regardless of model |
| `.github/instructions/claude.instructions.md` | Claude-specific patterns (tool use, conciseness, model routing, superpowers) |
| `.github/instructions/chatgpt.instructions.md` | ChatGPT-specific reinforcements (explicit rules, guardrails, step-by-step process) |
| `.github/instructions/branching.instructions.md` | Branch workflow, environment mappings, and agent access rules |
| `.github/instructions/ci-pipeline.instructions.md` | CI/CD pipeline interaction rules (targeted `applyTo` for CI files only) |

The model-specific files use `applyTo: "**"` and activate based on which model is selected in Copilot. The CI pipeline file uses a targeted `applyTo` pattern to only load when editing CI-related files.

## Design decisions

- **Tiered structure** — keeps the main `copilot-instructions.md` concise (always in context) while model-specific guidance loads separately
- **ChatGPT verbosity** — ChatGPT instructions are more explicit and procedural than Claude's, reflecting ChatGPT's need for stronger guardrail reinforcement
- **Dynamic branching** — branch rules are generated from `overlayConfig.branchConfig` collected during onboarding

## When to regenerate

Regenerate after editing `agent_docs/` files or changing the overlay config:

```bash
node scripts/regenerate.mjs --target /path/to/project
```

## API

```javascript
import { generateCopilotConfig } from './adapters/copilot/generate.mjs';

const paths = generateCopilotConfig(targetDir, coreDir, agentDocsDir, overlayConfig);
// Returns: string[] — array of 5 generated file paths
```

## Notes

- No external dependencies — uses only Node.js built-ins.
- Directories are created automatically if they do not exist.
