# CI Templates

CI pipeline templates are **dynamically generated** by `adapters/shared/build-ci-templates.mjs` using branch names from your project's `branchConfig` (stored in `agent_docs/.overlay-config.json`).

## How it works

During onboarding (`scripts/onboard.mjs`), the generator produces a CI file tailored to your branching strategy:

| CI Provider | Output file |
|-------------|-------------|
| `github-actions` | `.github/workflows/ci.yml` |
| `azure-devops` | `azure-pipelines.yml` (repo root) |

Branch triggers are derived from your config:
- **PR triggers:** all named branches from `branchConfig.branches`
- **Push triggers:** non-pattern branches from `branchConfig.agentAllowed`
- **Fallback:** `main` and `develop` if no branchConfig is present

## Placeholders

Replace every `{{PLACEHOLDER}}` token before committing the pipeline file to your repository.

| Placeholder | Purpose | Examples |
|-------------|---------|---------|
| `{{SETUP_STEPS}}` | Runtime environment setup steps | `actions/setup-node@v4` (GitHub), `NodeTool@0` (Azure) |
| `{{INSTALL_COMMAND}}` | Install project dependencies | `npm ci`, `pip install -r requirements.txt`, `dotnet restore` |
| `{{LINT_COMMAND}}` | Run linting and formatting checks | `npm run lint`, `ruff check .`, `dotnet format --verify-no-changes` |
| `{{TEST_COMMAND}}` | Run the test suite | `npm test`, `pytest`, `dotnet test` |
| `{{BUILD_COMMAND}}` | Produce a production build artifact | `npm run build`, `python -m build`, `dotnet publish -c Release` |

## Regenerating

To regenerate CI templates after changing branch configuration:

```bash
node scripts/regenerate.mjs --target /path/to/project
```

## Pipeline Behavior

Both templates share the same logical flow:

- The `lint` and `test` jobs run in parallel.
- The `build` job only runs after both `lint` and `test` pass.
