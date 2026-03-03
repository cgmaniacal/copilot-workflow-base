# Template Filling Guide: Generic (Fallback)

Instructions for the onboarding agent when no specific stack is detected.
This is a best-effort guide for unknown or mixed-language projects. Discover
what exists — do not prescribe tools or patterns that are not in evidence.

---

## building_the_project.md

- Check for a `Makefile` and list relevant targets (`make build`, `make run`,
  `make install`). This is often the primary interface in non-standard projects.
- Check for a `Dockerfile` or `docker-compose.yml` — document `docker compose up`
  if present and note what services it starts.
- Identify the primary language(s) by surveying file extensions in the root and
  `src/` directories.
- Look for a README section titled "Getting Started", "Installation", or "Development"
  and use it as the source of truth for setup steps.
- Check for any `.env.example` or `.env.sample` and list the variables.
- Document whatever dev/run command exists: `make dev`, `./scripts/start.sh`,
  a `Procfile`, or a language-specific command.

---

## code_conventions.md

- Identify the primary language(s) and note any linter or formatter config files
  present (`.eslintrc`, `pyproject.toml`, `.rubocop.yml`, `golangci.yml`, etc.).
- Document whatever naming convention is observable in the existing source files.
- Note the file organization pattern as observed — do not invent one.
- Document any linting commands found in the `Makefile` or `package.json` scripts.

---

## running_tests.md

- Check for a `Makefile` target named `test` or `check` — document that command.
- Check for common test config files: `jest.config.*`, `pytest.ini`, `phpunit.xml`,
  `go test ./...`, `.rspec`.
- Document the test command, file naming convention, and directory location as
  observed. If no tests exist yet, note that.

---

## service_architecture.md

- Describe the project shape based on what directories and entry-point files exist.
- Note whether it is a monorepo, single app, library, CLI, or service.
- Document the top-level directory structure and what each major directory contains.

---

## Post-Edit Hook

No standard hook for unknown stacks. Choose based on what is detected:

- If a `Makefile` exists with a `lint` target: `make lint`
- If `.eslintrc` exists: `npx eslint {file}`
- If `pyproject.toml` with `[tool.ruff]` exists: `ruff check {file}`
- Otherwise: leave the post-edit hook unconfigured.
