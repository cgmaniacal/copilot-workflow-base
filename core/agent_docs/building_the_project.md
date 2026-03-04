# Building the Project

<!-- ONBOARDING: This doc captures how to install, configure, and run the project.
     Discover the build toolchain, package manager, environment setup, and key scripts.
     Observe what already exists — do not prescribe a toolchain that isn't in use. -->

## Prerequisites

<!-- ONBOARDING: List runtimes, package managers, and system tools required.
     Check package.json "engines" field, README, and any .tool-versions or .nvmrc files.
     Note version requirements where specified. -->

{{TODO: detected during onboarding}}

## Project Structure

<!-- ONBOARDING: Describe the top-level directory layout.
     Note whether this is a monorepo (multiple apps/packages) or a single app.
     List each major directory and its role (e.g., apps/, packages/, src/, lib/).
     Check for workspace config in package.json, pnpm-workspace.yaml, or similar. -->

```
{{TODO: detected during onboarding}}
```

## Environment Variables

<!-- ONBOARDING: Describe how environment variables are configured.
     Look for .env.example, .env.sample, or README sections on env setup.
     List each app or service that has its own env file, if applicable.
     Note which variables are required vs optional. -->

{{TODO: detected during onboarding}}

Never commit `.env` files. A `.env.example` (or equivalent) documents required variables.

## Dev Server

<!-- ONBOARDING: Document the command(s) to start the local development server.
     Include any required pre-steps (e.g., starting a database, running codegen).
     Note any port numbers or URLs where the app is accessible locally. -->

```bash
{{TODO: detected during onboarding}}
```

## Build

<!-- ONBOARDING: Document the production build command and any important build options.
     Note the output directory and any environment-specific build steps. -->

```bash
{{TODO: detected during onboarding}}
```

## Other Common Scripts

<!-- ONBOARDING: List frequently used scripts from package.json (or equivalent task runner).
     Include lint, test, format, generate, and any project-specific scripts. -->

| Command | What it does |
|---------|-------------|
| {{TODO}} | {{TODO}} |

## Adding a New Package or App

<!-- ONBOARDING: If this is a monorepo, document how to add a new workspace package or app.
     Check for generator scripts (e.g., "new workspace" commands), and note naming conventions
     and how inter-package dependencies are declared. Skip this section for single-app repos. -->

{{TODO: detected during onboarding — skip if single-app repo}}

## Path Aliases

<!-- ONBOARDING: Document any import path aliases configured in the project.
     Check tsconfig.json, jsconfig.json, vite.config, webpack.config, or bundler config.
     Show the alias and what path it maps to. Skip if no aliases are used. -->

{{TODO: detected during onboarding — skip if not applicable}}
