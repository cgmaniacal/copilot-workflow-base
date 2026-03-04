<!-- Optional: Only generated when a database layer is detected during onboarding -->

# Database Schema

<!-- ONBOARDING: This doc captures the database technology, ORM/query layer, schema conventions,
     migration approach, and common query patterns in this project.
     Discover what already exists — do not prescribe a database tool that isn't in use. -->

## Database and ORM

<!-- ONBOARDING: Identify the database engine and data access layer in use.
     Check package.json for ORM/query builder libraries (Prisma, Drizzle, TypeORM, SQLAlchemy,
     ActiveRecord, Knex, etc.) and environment variables for the database connection string.
     Note the database engine (PostgreSQL, MySQL, SQLite, MongoDB, etc.). -->

{{TODO: detected during onboarding}}

## Schema Location

<!-- ONBOARDING: Document where schema definitions live.
     Examples: schema.prisma, db/schema.rb, models/, alembic/models.py, migrations/.
     Note whether the schema is code-first (defined in code, migrations generated)
     or database-first (schema in DB, types generated from it). -->

```
{{TODO: detected during onboarding}}
```

## Commands

<!-- ONBOARDING: Document the essential database commands for this project.
     Adapt to the ORM/migration tool in use. Common operations:
     - Create a new migration
     - Apply pending migrations (dev)
     - Apply pending migrations (prod/CI)
     - Regenerate types or client from schema
     - Seed the database
     - Open a visual data browser (if available) -->

```bash
{{TODO: detected during onboarding}}
```

## Migration Workflow

<!-- ONBOARDING: Document the step-by-step workflow for making a schema change.
     Note whether migration files are auto-generated, hand-written, or both.
     Emphasize that migration files must be committed alongside schema changes. -->

1. {{TODO: detected during onboarding}}

Always commit migration files alongside the schema change that requires them.

## Schema Conventions

<!-- ONBOARDING: Document the naming and structural conventions observed in existing models.
     Look at existing schema files or model definitions and note:
     - Naming style (singular vs plural, PascalCase vs snake_case)
     - Standard fields present on every table (id, timestamps, soft-delete, etc.)
     - How relations are declared
     - Indexing conventions -->

{{TODO: detected during onboarding}}

Universal conventions regardless of ORM:
- Every table should have a primary key.
- Timestamps (`created_at`, `updated_at`) should be present on tables that represent persistent entities.
- Declare relation behavior explicitly (what happens on delete/update) — never rely on defaults.
- Add indexes on columns used in WHERE clauses or JOIN conditions.

## Soft Deletes

<!-- ONBOARDING: Document whether the project uses soft deletes (a deleted_at timestamp)
     vs hard deletes. Look for `deletedAt`, `deleted_at`, or `is_deleted` fields in schemas.
     Note if there's a global filter applied to exclude soft-deleted records from queries. -->

{{TODO: detected during onboarding}}

Use soft deletes for user-facing data that may need recovery or auditing. Use hard deletes for ephemeral data (sessions, logs, temporary records).

## Query Patterns

<!-- ONBOARDING: Document common query patterns and any performance conventions in place.
     Look for examples of eager loading, pagination, and transaction usage in service files.
     Note any slow query detection or monitoring in place. -->

### Avoiding N+1 Queries

Always eager-load relations you know you need in a single query rather than issuing a query per record in a loop.

{{TODO: ORM-specific syntax detected during onboarding}}

### Transactions

Use transactions when multiple writes must succeed or fail together:
- Creating related records
- Transferring values between records
- Any operation where partial completion leaves data inconsistent

{{TODO: ORM-specific syntax detected during onboarding}}

## Seeding

<!-- ONBOARDING: Document the seed data strategy.
     Look for seed scripts, fixture files, or factory helpers.
     Note whether seeds are idempotent (safe to re-run). -->

{{TODO: detected during onboarding}}

Seeds should be idempotent — safe to run multiple times without creating duplicate data.
Keep seed data minimal — just enough to develop and test against.
