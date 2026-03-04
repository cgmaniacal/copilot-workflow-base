# Service Architecture

<!-- ONBOARDING: This doc captures the overall system architecture — how components, layers,
     and services are organized and interact. Discover the shape of this specific project
     by reading the codebase; do not invent structure that isn't present. -->

## Project Shape

<!-- ONBOARDING: Determine the project scale:
     - Frontend only (static site, SPA, or SSR app — no custom backend)
     - Full stack (frontend + backend API + optional database)
     - Backend only (API service, CLI tool, background worker)
     - Monorepo with multiple apps
     Check for apps/, packages/, services/ directories and how many runnable apps exist. -->

{{TODO: detected during onboarding}}

## System Overview

<!-- ONBOARDING: Draw or describe the top-level data flow between components.
     Show how the frontend (if any) talks to the backend (if any), and how the backend
     talks to the database (if any). Note the communication protocol (HTTP/JSON, gRPC, etc.).
     Use a simple ASCII diagram if it helps. -->

```
{{TODO: detected during onboarding}}
```

## Frontend (if present)

<!-- ONBOARDING: Describe the frontend architecture:
     - Framework and bundler
     - State management approach (local state, global store, server state)
     - Routing strategy
     - How the frontend calls external APIs
     Explore the frontend src/ directory and document the folder structure you find. -->

{{TODO: detected during onboarding — skip if no frontend}}

### Source Structure

```
{{TODO: detected during onboarding}}
```

## Backend / API (if present)

<!-- ONBOARDING: Describe the backend architecture:
     - Framework and runtime
     - How routes/controllers are organized
     - Whether there's a service/business logic layer separate from route handlers
     - How the data layer (ORM, query builder, raw SQL) is accessed
     Note the strict layering rule: route handlers should NOT access the database directly.
     Business logic belongs in a service layer, not in routes. -->

{{TODO: detected during onboarding — skip if no backend}}

### Source Structure

```
{{TODO: detected during onboarding}}
```

### Layering

<!-- ONBOARDING: Document the layer separation convention in place.
     Look for patterns like: routes -> services -> data access.
     Note any hard rules (e.g., "services never import HTTP types"). -->

{{TODO: detected during onboarding}}

## Shared / Common Packages (if present)

<!-- ONBOARDING: If the project has shared packages (shared types, utilities, config),
     document what lives there and the rules for what belongs in shared vs app-specific.
     Check packages/ or libs/ directories. -->

{{TODO: detected during onboarding — skip if not applicable}}

## Security Defaults

<!-- ONBOARDING: Document the security middleware and configuration in place.
     For web backends, look for: security headers, CORS config, rate limiting, payload limits.
     Note where these are configured (e.g., app entry point, middleware setup). -->

Universal expectations:
- Security headers should be set on every response.
- CORS should be explicitly configured, not left as wildcard in production.
- Rate limiting should be applied to protect against abuse.
- Large payloads should be rejected at the edge.

{{TODO: specific implementation detected during onboarding}}

## Environment Variables

<!-- ONBOARDING: Describe the environment variable strategy for the whole project.
     Note which apps have their own env files and what categories of vars each manages.
     Universal rule: validate required vars at startup — fail fast if missing. -->

{{TODO: detected during onboarding}}

## Adding a New Feature

<!-- ONBOARDING: Document the typical steps to add a new feature end-to-end.
     Adapt this to the actual project shape (e.g., frontend-only projects skip backend steps). -->

1. {{TODO: detected during onboarding}}
