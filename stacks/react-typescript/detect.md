# Stack Detection: React / TypeScript

The onboarding script uses these signals to identify a React/TypeScript project
and determine sub-variants. Any single primary signal is sufficient to confirm
the stack. Secondary signals narrow down the specific toolchain.

## Primary Signals

Any one of these confirms this is a React/TypeScript project:

- `package.json` contains `"react"` in `dependencies` or `devDependencies`
- One or more `.tsx` files exist under `src/`
- `tsconfig.json` exists and `package.json` contains `"react"`

## Secondary Signals

These signals identify the specific toolchain in use:

### Bundler
- `vite.config.ts` or `vite.config.js` — Vite
- `next.config.js` or `next.config.ts` — Next.js (also implies SSR/file-based routing)
- `react-scripts` in `package.json` dependencies — Create React App
- `remix.config.js` or `@remix-run/react` in dependencies — Remix

### Monorepo
- `turbo.json` — Turborepo
- `nx.json` — Nx
- `pnpm-workspace.yaml` or `workspaces` field in root `package.json` — workspace monorepo
- `apps/` directory containing multiple subdirectories

### Styling
- `tailwind.config.js` or `tailwind.config.ts` — Tailwind CSS
- `*.module.css` or `*.module.scss` files in `src/` — CSS Modules
- `styled-components` or `@emotion/react` in dependencies — CSS-in-JS

### State Management
- `zustand` in dependencies — Zustand
- `@reduxjs/toolkit` or `redux` in dependencies — Redux
- `jotai` in dependencies — Jotai
- `@tanstack/react-query` in dependencies — Server state via React Query

### Testing
- `vitest.config.ts` or `"vitest"` in dependencies — Vitest
- `jest.config.js` or `jest.config.ts` or `"jest"` in dependencies — Jest
- `@testing-library/react` in dependencies — React Testing Library

### Type Checking
- `tsconfig.json` with `"strict": true` — strict TypeScript mode
- Path aliases defined in `tsconfig.json` `compilerOptions.paths`

## Sub-Variants

| Variant | Key Signal |
|---------|-----------|
| Next.js (SSR/SSG) | `next.config.js` or `next` in dependencies |
| Vite SPA | `vite.config.ts`, no `next` or `remix` |
| Remix | `remix.config.js` or `@remix-run/react` |
| Create React App | `react-scripts` in dependencies |
| Turborepo monorepo | `turbo.json` at root |

## Post-Edit Hook

```
tsc --noEmit
```

Run from the project root (or relevant workspace package root in a monorepo).
