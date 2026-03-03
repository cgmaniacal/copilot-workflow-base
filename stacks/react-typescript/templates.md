# Template Filling Guide: React / TypeScript

Instructions for the onboarding agent on how to populate each `core/agent_docs/`
template when a React/TypeScript stack is detected.

---

## building_the_project.md

- Check `package.json` `engines` field, `.nvmrc`, or `.tool-versions` for Node version.
- Check `package.json` for the package manager (`packageManager` field or presence of
  `pnpm-lock.yaml`, `yarn.lock`, `package-lock.json`).
- Document the top-level directory layout. Note if `apps/` and `packages/` exist
  (monorepo) or if it is a single `src/` app.
- Check for `.env.example` or `.env.sample` and list every variable with a description.
- Document the dev server command from `package.json` `scripts.dev` (or `start`).
  Note the default port (Vite: 5173, CRA: 3000, Next.js: 3000).
- Document the build command from `scripts.build` and note the output directory
  (`dist/`, `.next/`, `build/`).
- List all scripts from `package.json` `scripts` that are not `dev` or `build`.
- If monorepo: document `turbo.json` pipeline tasks and how to run a single workspace.
- Document path aliases from `tsconfig.json` `compilerOptions.paths`.

---

## code_conventions.md

- Check `tsconfig.json` `compilerOptions` — note `strict`, `noImplicitAny`,
  `strictNullChecks`. Document whether strict mode is on.
- Check for `eslint.config.js`, `.eslintrc.json`, or `.eslintrc.js` and list
  the notable rule sets (e.g., `@typescript-eslint/recommended`, `plugin:react/recommended`).
- Check `.prettierrc` or `prettier` field in `package.json` for formatting rules.
- Scan `src/` to determine file organization pattern: feature-based (`features/`),
  layer-based (`components/`, `hooks/`, `services/`), or flat.
- Identify naming conventions by inspecting existing files: PascalCase components,
  camelCase functions, kebab-case files, SCREAMING_SNAKE constants.
- Note whether named exports or default exports are predominant.
- Document import order enforcement if `import/order` or `simple-import-sort` ESLint
  rules are present.
- Describe the error handling pattern: `Error` subclasses, toast notifications,
  error boundaries.

---

## running_tests.md

- Check `package.json` dependencies for `vitest` or `jest` and note the version.
- Check `vitest.config.ts` or `jest.config.ts` for environment (`jsdom` vs `node`),
  coverage provider, and setup files.
- Document `scripts.test`, `scripts.test:watch`, and any coverage script.
- If monorepo: document how to run tests for a single workspace
  (e.g., `turbo run test --filter=web`).
- Find an example test file and document the describe/it structure used.
- Note the test file naming convention (`.test.ts`, `.test.tsx`, `.spec.ts`).
- Document whether tests are colocated with source or in a `__tests__/` directory.
- Check for `@testing-library/react` and document the render/query/user-event pattern.
- Document how modules are mocked: `vi.mock()` (Vitest) or `jest.mock()`.

---

## service_architecture.md

- Determine project shape: check for `apps/web`, `apps/api`, `packages/shared`.
  A single `src/` with no backend is frontend-only.
- Document the bundler (Vite, Next.js, Remix, CRA) and its routing model
  (file-based vs React Router).
- Describe the frontend `src/` directory structure observed.
- If a backend exists: document the framework (Express, Fastify, Hono) and
  how routes are organized.
- Document the state management library detected and how global state is structured.
- If React Query or SWR is present: note it as the server-state layer.
- If shared packages exist: describe what lives in each (`shared/types`, `shared/utils`).
- Document security middleware in the API (Helmet, CORS config, rate limiting).

---

## database_schema.md

Only populate if a database layer is detected (Prisma, Drizzle, TypeORM, Knex).

- Identify the ORM from `package.json` dependencies.
- Document schema file location (`prisma/schema.prisma`, `drizzle/schema.ts`, etc.).
- Note the database engine from the `datasource` block or connection string.
- Document migration commands (e.g., `prisma migrate dev`, `drizzle-kit generate`).
- Document how to regenerate the client after schema changes.
- Describe the naming convention observed in existing models.
- Note whether soft deletes are used (`deletedAt` field present).

---

## Post-Edit Hook

Recommended syntax/type checker for the Claude adapter:

```
tsc --noEmit
```

Configure this as the post-edit hook in the Claude adapter so type errors are
surfaced immediately after each file save during AI-assisted development.
For monorepos, run from the specific workspace root if a per-package tsconfig exists.
