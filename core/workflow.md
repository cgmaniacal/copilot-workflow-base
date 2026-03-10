# Universal AI Workflow

This document is the source of truth for how AI agents work in this codebase. It is platform-agnostic — it applies equally to any AI coding assistant (GitHub Copilot, Cursor, or any other). Agent-specific adapters translate these rules into the format each platform requires, but the rules themselves live here.

---

## Observe First, Prescribe Never

**This is the foundational principle of the entire workflow.**

Before making any change — no matter how small it seems — the agent must observe the existing codebase. Read the files. Understand the patterns already in use. Find the callers. Check what already exists before proposing or writing anything new.

Never prescribe a solution before observing the context it must fit into. An agent that writes code without reading first will introduce inconsistencies, break contracts, and miss existing solutions. Observation is not optional and is never skipped in the interest of speed.

This principle applies at every scale:
- Before modifying a function, read all callers.
- Before adding a file, check whether one already exists for that purpose.
- Before choosing a pattern, check what patterns the codebase already uses.
- Before answering a question about the codebase, verify the answer in the code itself.

---

## The Four Phases

Every significant task follows four phases in order. Do not skip phases. Do not begin implementation without completing Research and Plan.

**Exemptions:** Bug fixes, lint cleanup, and isolated small tweaks (single-file, no architectural impact) may skip to Implement directly. When in doubt, run Research first.

### Phase 1 — Research

Goal: Understand the problem and design the solution before writing any code.

- Read the relevant `agent_docs/` files for the task type (see the Agent Docs Reference table below).
- Explore the codebase. Find existing patterns, related files, and potential blast radius.
- Ask clarifying questions if requirements are ambiguous.
- Produce a research/design document saved to `docs/research/YYYY-MM-DD-<topic>.md`.
- Produce an Architectural Decision Record (ADR) in `docs/decisions/NNN-<title>.md` for any decision that had meaningful alternatives.

### Phase 2 — Plan

Goal: Produce a concrete, step-by-step implementation plan before writing any production code.

- Break the work into small, ordered tasks with exact file paths and the code or logic to write.
- Identify dependencies between steps.
- Save the plan to `docs/plans/YYYY-MM-DD-<feature>.md`.
- Do not begin Phase 3 until the plan exists and is saved.

### Phase 3 — Implement

Goal: Execute the plan faithfully, test-first where possible.

- Follow the plan. Do not invent new scope during implementation.
- Write tests before or alongside implementation code (test-driven development).
- Commit only at this phase and Phase 4 — not during Research or Plan.
- Research/plan/decision docs are committed with the first implementation commit on the feature branch.

### Phase 4 — Validate

Goal: Verify that the implementation is correct and complete before declaring done.

- Run lint, tests, and build. All must pass.
- Evidence before claims — do not say "this works" without running it.
- CI runs automatically on pull requests. Address all failures before merging.
- Create a pull request using the project's PR flow (see Git Conventions below).

---

## Documentation Requirements

Every feature MUST produce these artifacts. Do not create a feature branch or write implementation code until the research doc and plan exist.

| Artifact | Location | Created During | Required? |
|----------|----------|----------------|-----------|
| Research/design doc | `docs/research/YYYY-MM-DD-<topic>.md` | Phase 1 (Research) | Yes, for all features |
| ADR | `docs/decisions/NNN-<title>.md` | Phase 1 (Research) | Yes, for any decision with meaningful alternatives |
| Implementation plan | `docs/plans/YYYY-MM-DD-<feature>.md` | Phase 2 (Plan) | Yes, for all features |

**If a plan is provided externally** (e.g., pasted into the conversation or handed off from another session), save it to `docs/plans/` before executing it.

**If research was done in a prior session**, backfill the research doc and any ADRs in the first implementation commit.

**What qualifies as an ADR:** Any choice where you considered (or should have considered) an alternative. Examples: library selection, architectural patterns, data modeling decisions, API design choices, scheduling strategies. When in doubt, write the ADR — a short ADR is better than none.

---

## Implementation Guards

### Observe First, Prescribe Never (Repeated for Emphasis)

This is the most important guard. See the opening section. Every guard below is a specific application of this principle.

### Blast Radius Check

Before modifying any function or component, search for all callers and importers. If callers span 3 or more modules, explicitly note the blast radius in your working notes and verify a caller from each affected module after making the change.

### Proactive Checkpoint

After every 5 implementation steps — or whenever the task is growing complex — write a checkpoint summarizing:

- Success criteria status (what is done vs. what remains)
- Files changed so far
- Current step and what comes next

Save checkpoints to `.agent/sessions/.current-checkpoint.md` (or the equivalent path defined in the project's agent configuration). Checkpoints ensure continuity if context is compressed or the session is interrupted.

### Guardrails

Before starting complex tasks, check the project's guardrails file (typically `.agent/guardrails.md` or equivalent). Entries marked PERMANENT always apply. When the user corrects an approach or a failure is identified, add a guardrail entry recording: date, severity, trigger condition, and the rule to follow.

---

## Git Conventions

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

### Commit Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description
```

Types: `feat`, `fix`, `chore`, `refactor`, `test`, `docs`

Scope: the app or package name (e.g., `web`, `api`, `shared`). Use the name that corresponds to the part of the codebase being changed.

Examples:
- `feat(web): add user login form`
- `fix(api): handle missing auth header`
- `chore(shared): update dependency versions`

### Releases

Releases use date-based tags (e.g., `v2026-02-28`) created automatically on merge to `main`. Changelogs are auto-generated from commit messages.

---

## Agent Docs Reference

Before starting a task, consult the relevant doc in `agent_docs/`. These docs provide task-specific, codebase-specific instructions that complement this universal workflow.

| Doc | When to read |
|-----|-------------|
| `building_the_project.md` | Build setup, scripts, environment configuration |
| `running_tests.md` | Writing or running tests |
| `code_conventions.md` | Any code change |
| `service_architecture.md` | Adding or modifying services or packages |
| `database_schema.md` | Schema changes, migrations, seeding |
| `service_communication_patterns.md` | API contracts, request/response patterns |
| `frontend_quality.md` | Accessibility, responsive design, performance, SEO |
| `image_optimization.md` | Responsive image variants, placeholder generation, upload processing |
| `authentication.md` | Adding authentication (tokens, middleware, roles, token strategy) |
| `dependency_updates.md` | Reviewing dependency update PRs, adding or updating dependencies |
| `memory_system.md` | Memory architecture, commands, entry format, rules |
| `audit_skills.md` | Running readiness audits (performance, accessibility, security, SEO, end-to-end) |
| `branching_workflow.md` | Branching strategy, release flow, changelog process |

---

## Project Structure Reference

```
agent_docs/       # Task-specific instructions (see table above)
docs/
  research/       # Research and design docs — one per feature
  plans/          # Implementation plans — one per feature
  decisions/      # Architectural Decision Records (ADRs)
.github/
  workflows/      # CI pipeline (lint, test, build)
```

The source tree structure (apps, packages, etc.) is project-specific and documented in `agent_docs/service_architecture.md`.

---

## Summary: What the Agent Must Always Do

1. **Observe before acting.** Read first. Never assume.
2. **Follow the four phases.** Research → Plan → Implement → Validate. In order. No skipping.
3. **Document as you go.** Research doc, ADR, and plan must exist before code is written.
4. **Check blast radius.** Know what you're touching and who depends on it.
5. **Write tests.** Prefer test-first. All tests must pass before declaring done.
6. **Commit correctly.** Conventional Commits format. Feature branches only. Via PRs.
7. **Evidence before claims.** Run it. Show the output. Do not claim success without proof.
