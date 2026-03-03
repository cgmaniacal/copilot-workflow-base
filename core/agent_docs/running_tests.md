# Running Tests

<!-- ONBOARDING: This doc captures the test setup, commands, file conventions, and patterns
     used in this project. Discover what test framework is installed and what conventions
     already exist in the codebase — do not prescribe a framework that isn't in use. -->

## Test Framework

<!-- ONBOARDING: Identify the test framework(s) in use.
     Check package.json dependencies, config files (jest.config, vitest.config, pytest.ini, etc.),
     and existing test files. Note the test runner and any assertion libraries. -->

{{TODO: detected during onboarding}}

## Commands

<!-- ONBOARDING: Document the commands to run tests.
     Look for test scripts in package.json (or equivalent). Include:
     - Run all tests once
     - Watch mode (if available)
     - Run tests for a single app/package (for monorepos)
     - Run a specific test file or pattern -->

```bash
{{TODO: detected during onboarding}}
```

## File Conventions

<!-- ONBOARDING: Document the naming convention for test files.
     Check existing test files to determine the pattern:
     - Are tests colocated next to source files, or in a separate __tests__/ directory?
     - What file suffix is used? (.test.ts, .spec.ts, _test.py, etc.)
     - Are test helpers/fixtures in a shared directory? -->

{{TODO: detected during onboarding}}

## Writing Tests

### Structure

<!-- ONBOARDING: Show the basic test structure idiom for this project's framework.
     Find one well-written existing test and use it as a structural example.
     Note how describe/it (or equivalent) blocks are organized. -->

```
{{TODO: detected during onboarding}}
```

### Test Levels

<!-- ONBOARDING: Identify the test pyramid for this project.
     Look at what types of tests exist: unit, integration, end-to-end, component, etc.
     Document what each level tests, whether it uses mocks, and how fast it runs. -->

| Level | What it tests | Mocking | Speed |
|-------|--------------|---------|-------|
| {{TODO}} | {{TODO}} | {{TODO}} | {{TODO}} |

### What to Test

Always test:
- Business logic and utility functions
- Component rendering and user interactions (for UI projects)
- API request/response contracts (for API projects)
- Error handling and edge cases
- Validation logic (valid inputs and invalid inputs)

Never test:
- Styling or static markup
- Third-party library internals
- Implementation details — test behavior and outcomes

### Mocking

<!-- ONBOARDING: Document the mocking approach used in this project.
     Check how external dependencies (database, external APIs, file system) are mocked.
     Note any shared mock factories or fixtures in the codebase. -->

Universal rules regardless of framework:
- Mock external dependencies (databases, external APIs), not internal logic.
- Reset mocks between tests to prevent state leakage.
- Use typed mock helpers when the framework provides them.

{{TODO: framework-specific mock syntax detected during onboarding}}

## Test Isolation

<!-- ONBOARDING: Document how tests are kept isolated from each other.
     If the project uses a real database for tests, note how test data is cleaned up.
     Look for beforeEach/afterEach hooks that reset state or seed data. -->

{{TODO: detected during onboarding — skip if not applicable}}
