# Dependency Updates

Read this when reviewing automated update PRs, manually updating dependencies, or evaluating whether to adopt a new library.

## Automated Updates

<!-- ONBOARDING: Determine if the project uses an automated dependency update tool.
     Check for renovate.json, .renovaterc, dependabot.yml (.github/dependabot.yml),
     or similar configuration files. Document the tool name and its update schedule. -->

{{TODO: detected during onboarding — note tool name and schedule}}

### Update Strategy

| Update type | Behavior | Review required |
|-------------|----------|-----------------|
| Patch (`1.0.x`) | Grouped into one PR, auto-merged if CI passes | No |
| Minor (`1.x.0`) | Grouped into one PR | Yes — scan changelog for behavioral changes |
| Major (`x.0.0`) | Individual PRs per package | Yes — read migration guide, check for breaking changes |
| Dev dependencies | Grouped, auto-merged if CI passes | No |

### Grouped Packages

<!-- ONBOARDING: Document any grouped packages configured in the update tool.
     Related packages that must stay in sync (e.g., a framework and its types package)
     should be updated together. Look for "groups" config in renovate.json or equivalent. -->

{{TODO: detected during onboarding}}

## Reviewing Update PRs

### For minor updates

1. Read the PR description (update tools typically include changelog links)
2. Check if CI passes (lint, test, build)
3. If CI passes and changelog has no behavioral changes, merge

### For major updates

1. Read the migration guide linked in the PR
2. Check for breaking API changes that affect project code
3. Search the codebase for deprecated APIs mentioned in the migration guide
4. Run the app locally and smoke-test key flows
5. If the update requires code changes, create a feature branch and make the changes there
6. Create an ADR in `docs/decisions/` documenting the upgrade rationale and any migration steps taken

## Manual Updates

<!-- ONBOARDING: Document the package manager commands to check for outdated packages
     and update specific dependencies. Adapt to the package manager in use
     (npm, yarn, pnpm, pip, cargo, etc.). -->

```bash
# Check what's outdated
{{TODO: package manager command detected during onboarding}}

# Update a specific package
{{TODO: package manager command detected during onboarding}}
```

After any manual update, run the full validation suite:

```bash
{{TODO: lint + test + build commands detected during onboarding}}
```

## Adding New Dependencies

Before adding a new dependency, evaluate:

1. **Is it necessary?** Can the functionality be achieved with existing dependencies or a small utility?
2. **Is it maintained?** Check last publish date, open issues, and bus factor.
3. **What's the size impact?** For frontend projects, check bundle size implications.
4. **Does it have type support?** For typed languages, prefer packages with built-in types.
5. **License compatibility?** Must be MIT, Apache 2.0, BSD, or similarly permissive.

Install to the correct location:

```bash
# Adapt to package manager and workspace structure detected during onboarding
{{TODO: install command examples}}
```
