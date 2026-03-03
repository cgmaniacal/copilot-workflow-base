# Code Conventions

<!-- ONBOARDING: This doc captures the coding style, file organization, and naming conventions
     used in this project. Discover patterns that already exist — do not invent conventions
     that aren't in evidence. Read linting configs, existing source files, and any style guides. -->

## Language and Type Safety

<!-- ONBOARDING: Note the primary language(s) in use (e.g., TypeScript, JavaScript, Python).
     If typed: document the strictness level, how types are organized, and any rules around
     dynamic types (e.g., bans on `any`). Check tsconfig.json, mypy.ini, or equivalent. -->

{{TODO: detected during onboarding}}

## File Organization

<!-- ONBOARDING: Describe how files are grouped — by feature, by type, or flat.
     Note any max file length conventions and the "one thing per file" rule if applied.
     Look at the existing src/ structure and document the pattern you observe. -->

{{TODO: detected during onboarding}}

## Naming Conventions

<!-- ONBOARDING: Document the naming style for each kind of entity in the codebase.
     Look at existing files, exports, and variables to identify the patterns in use.
     Common entities: files, components/classes, functions, constants, types/interfaces. -->

| Entity | Convention | Example |
|--------|-----------|---------|
| {{TODO}} | {{TODO}} | {{TODO}} |

## Imports

<!-- ONBOARDING: Describe the import order convention if one is enforced.
     Check ESLint rules (import/order, simple-import-sort) or equivalent linter config.
     Note whether default exports or named exports are preferred. -->

{{TODO: detected during onboarding}}

## Error Handling

<!-- ONBOARDING: Document how errors are handled at each layer of the application.
     Look for a base error class, centralized error middleware, and frontend error patterns.
     Note how errors are logged vs surfaced to users. -->

The universal rule: never silently swallow errors. Log or propagate.

{{TODO: detected during onboarding}}

## DRY (Don't Repeat Yourself)

When the same logic, structure, or pattern appears in 3+ places, extract it:

| Repeated thing | Extract to | Notes |
|----------------|-----------|-------|
| Utility logic | Shared utility module | Pure functions, no side effects |
| UI pattern | Shared component | One responsibility per component |
| Configuration | Shared constants | Single source of truth |

**Guidelines:**
- Extract when repeated 3+ times, or 2 times if the logic is non-trivial.
- When extracting, update all call sites — no orphaned duplicates.
- Keep extracted units focused with a single responsibility.

## Comments

- Don't comment *what* the code does — write code that's self-explanatory.
- Comment *why* when the reason isn't obvious from context.
- Use `TODO:` for known follow-ups. Include context, not just the label.

## Linting and Formatting

<!-- ONBOARDING: Document the linting and formatting tools in use.
     Check for .eslintrc, .prettierrc, pyproject.toml, .rubocop.yml, or similar.
     Note any project-specific rules beyond the defaults, and how to run the linter locally. -->

{{TODO: detected during onboarding}}
