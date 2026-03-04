# Template Filling Guide: .NET / C#

Instructions for the onboarding agent on how to populate each `core/agent_docs/`
template when a .NET/C# stack is detected.

---

## building_the_project.md

- Check `global.json` for the pinned .NET SDK version. If absent, note the SDK
  version required by the `<TargetFramework>` tag in the root `*.csproj` or the
  project with the highest version.
- Document the solution structure: list each `*.csproj` in the `*.sln` and its role
  (API, domain, infrastructure, tests).
- Check `appsettings.json` and `appsettings.Development.json` for required
  configuration keys. Look for a `README` section or `launchSettings.json`.
  Document which keys must be set before the app will start.
- Document the dev server command: `dotnet run --project src/ProjectName.Api`.
  Note the port from `launchSettings.json` `applicationUrl`.
- Document the build command: `dotnet build` from the solution root.
- Document the publish command if a `Dockerfile` or deployment script exists.
- If `docker-compose.yml` exists: document `docker compose up` for local dev
  (database, Redis, etc.).
- List relevant `dotnet` CLI commands: `dotnet ef migrations add`, `dotnet test`, etc.

---

## code_conventions.md

- Check `.editorconfig` at the solution root for indentation, line endings, and
  C#-specific analyzer rules.
- Check for a `.ruleset` file or `<AnalysisMode>` in `*.csproj` for Roslyn analyzer settings.
- Document the namespace convention observed: does it match the folder path
  (default in newer .NET) or use a flat namespace?
- Note naming conventions from existing files: PascalCase for classes, methods, and
  properties; camelCase for private fields (with or without `_` prefix); `I` prefix
  for interfaces.
- Document whether the codebase uses file-scoped namespaces (`namespace Foo;`) or
  block-scoped (`namespace Foo { }`).
- Note the preferred pattern for null handling: nullable reference types enabled
  (`<Nullable>enable</Nullable>` in `*.csproj`), null-coalescing, or guard clauses.
- Check for a linting/formatting tool: `dotnet format`, Roslyn analyzers, or
  StyleCop.Analyzers NuGet package.

---

## running_tests.md

- Identify the test framework from `*Tests.csproj` `<PackageReference>` entries
  (xUnit, NUnit, MSTest).
- Document the command to run all tests: `dotnet test` from the solution root.
- Document how to run a single test project: `dotnet test src/ProjectName.Tests`.
- Document how to run a single test: `dotnet test --filter "FullyQualifiedName~TestMethodName"`.
- Note the mocking library in use (Moq, NSubstitute) and show the basic mock setup pattern.
- Document the test file naming convention: `*Tests.cs`, `*Test.cs`, or mirroring
  the source class name.
- Note whether tests are organized by feature or by layer.
- If integration tests use a real database: document how the test database is
  provisioned (EF Core in-memory, SQLite, Testcontainers).

---

## service_architecture.md

- Determine the architecture pattern: Clean Architecture (Domain / Application /
  Infrastructure separation), layered (Controllers / Services / Repositories), or
  minimal.
- Draw the data flow: HTTP request → controller/endpoint → service/handler →
  repository/ORM → database.
- Document the dependency injection setup in `Program.cs` — note how services
  are registered and what lifetime scopes are used.
- If MediatR is present: document the CQRS pattern (Commands, Queries, Handlers).
- Document the middleware pipeline as configured in `Program.cs`
  (authentication, exception handling, CORS, rate limiting).
- If multiple projects exist: describe what each project is responsible for and
  which can reference which (dependency rules).
- Document `appsettings.json` configuration sections and the strongly-typed
  options pattern (`IOptions<T>`) if used.

---

## database_schema.md

Only populate if Entity Framework Core or another ORM is detected.

- Identify the database engine from the EF Core provider package
  (`Npgsql.EntityFrameworkCore.PostgreSQL`, `Microsoft.EntityFrameworkCore.SqlServer`, etc.)
  or connection string.
- Document the `DbContext` location and which entities it exposes.
- Note whether the project uses code-first migrations (`Migrations/` directory present)
  or database-first scaffolding.
- Document migration commands:
  `dotnet ef migrations add <Name>`, `dotnet ef database update`.
- Describe the naming convention for entities: class names, table name overrides
  in `OnModelCreating`, and column naming conventions.
- Note whether soft deletes are used (a `DeletedAt` property and global query filter).

---

## Post-Edit Hook

Recommended syntax/type checker for the Claude adapter:

```
dotnet build --no-restore
```

Run from the solution root (where the `*.sln` file lives). The `--no-restore` flag
skips NuGet restore to keep feedback fast. This catches type errors, missing
members, and Roslyn analyzer warnings across all projects in the solution.
