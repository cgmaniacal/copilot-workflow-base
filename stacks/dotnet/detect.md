# Stack Detection: .NET / C#

The onboarding script uses these signals to identify a .NET/C# project
and determine sub-variants. Any single primary signal is sufficient to confirm
the stack. Secondary signals narrow down the application type and toolchain.

## Primary Signals

Any one of these confirms this is a .NET/C# project:

- One or more `*.sln` files exist at the repository root
- One or more `*.csproj` files exist in any subdirectory
- `global.json` exists (pins the .NET SDK version)
- `Program.cs` exists at the root or in a `src/` subdirectory

## Secondary Signals

These signals identify the specific .NET application type and toolchain:

### Application Type
- `*.csproj` with `<Project Sdk="Microsoft.NET.Sdk.Web">` — ASP.NET Core web project
- `controllers/` directory or files named `*Controller.cs` — MVC or Web API
- `Pages/` directory with `*.cshtml` files — Razor Pages
- `Components/` with `*.razor` files or `<Project Sdk="Microsoft.NET.Sdk.BlazorWebAssembly">` — Blazor
- `appsettings.json` and `Program.cs` with `WebApplication.CreateBuilder` — ASP.NET Core minimal API

### Architecture Pattern
- `*.Domain.csproj`, `*.Application.csproj`, `*.Infrastructure.csproj` — Clean Architecture
- `MediatR` in any `*.csproj` `<PackageReference>` — CQRS / Mediator pattern
- `*.csproj` file names following `ProjectName.Api`, `ProjectName.Core`, `ProjectName.Data`

### Testing
- `*Tests.csproj` or `*Test.csproj` files — test project present
- `<PackageReference Include="xunit"` — xUnit
- `<PackageReference Include="NUnit"` — NUnit
- `<PackageReference Include="MSTest.TestFramework"` — MSTest
- `<PackageReference Include="Moq"` or `NSubstitute` — mocking library in use

### Data Access
- `<PackageReference Include="Microsoft.EntityFrameworkCore"` — Entity Framework Core
- `Migrations/` directory inside a project — EF Core code-first migrations
- `<PackageReference Include="Dapper"` — Dapper (micro-ORM)

### Configuration
- `appsettings.json` and `appsettings.Development.json` — standard ASP.NET Core config
- `docker-compose.yml` alongside the solution — Docker-based local dev

## Sub-Variants

| Variant | Key Signal |
|---------|-----------|
| ASP.NET Core Web API | `*Controller.cs` files, `Sdk="Microsoft.NET.Sdk.Web"` |
| ASP.NET Core MVC | `Views/` directory with `*.cshtml` files |
| Razor Pages | `Pages/` directory with `*.cshtml` files |
| Blazor | `*.razor` files or BlazorWebAssembly SDK |
| Minimal API | `app.MapGet/Post/Put/Delete` in `Program.cs`, no Controllers |
| Clean Architecture | Separate Domain / Application / Infrastructure projects |
| Worker Service | `<Project Sdk="Microsoft.NET.Sdk.Worker">` |

## Post-Edit Hook

```
dotnet build --no-restore
```

Run from the solution root (where the `*.sln` file lives) to catch compilation
errors across all projects without re-downloading NuGet packages.
