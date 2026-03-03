# Template Filling Guide: WordPress

Instructions for the onboarding agent on how to populate each `core/agent_docs/`
template when a WordPress stack is detected.

---

## building_the_project.md

- Document the PHP version requirement. Check `composer.json` `require.php`,
  `.php-version`, or any README section on prerequisites.
- Check for `package.json` — if present, note the Node version (`.nvmrc`, `engines`
  field) and package manager.
- Document the local development environment: `wp-env.json` (wp-env), `docker-compose.yml`
  (Docker), `.lando.yml`, or `.ddev/config.yaml`. Show the startup command.
- If wp-env: document `wp-env start`, `wp-env stop`, `wp-env run`.
- If Bedrock: document the `composer install` step and how `web/wp-config.php` is
  generated from `.env`.
- Document `.env.example` or `.env.sample` variables (DB credentials, `WP_HOME`,
  `WP_SITEURL`, salts).
- If `package.json` has a build pipeline (`wp-scripts`, Webpack, Vite): document
  `npm run build` and `npm run start` (watch mode) for asset compilation.
- List all `composer.json` scripts and `package.json` scripts that developers use.

---

## code_conventions.md

- Check `.phpcs.xml`, `phpcs.xml.dist`, or `phpcs.xml` — note the standard
  (`WordPress`, `WordPress-Core`, `WordPress-Extra`, `WordPress-VIP-Go`).
- Document PHP naming conventions observed in existing files: `snake_case` functions,
  `PascalCase` classes, `SCREAMING_SNAKE` constants, `kebab-case` file names.
- Note whether the code uses the WordPress Coding Standards for spacing (tabs vs spaces).
- If `package.json` has ESLint: check `.eslintrc` for `@wordpress/eslint-plugin` usage.
- If `package.json` has Prettier: note any `.prettierrc` configuration.
- Document the file organization: theme root files (`functions.php`, `style.css`),
  `inc/` for includes, `template-parts/` for partials, `assets/` or `src/` for source files.
- Note the pattern for enqueuing scripts and styles (centralized in `functions.php`
  vs split across feature files).

---

## running_tests.md

- Check `phpunit.xml` or `phpunit.xml.dist` for the test suite configuration.
- Document the command to run PHPUnit tests. Note whether wp-env, WP-CLI, or a
  separate test install is required (`WP_TESTS_DIR` env var).
- Check for JavaScript tests — `jest.config.js` or `@wordpress/jest-preset-default`
  in `package.json`. Document `npm run test` if present.
- Document the test file naming convention: `test-*.php`, `*-test.php`, or `class-*-test.php`.
- Note whether integration tests require a WordPress test environment or if unit
  tests use mocks/stubs (Brain Monkey, WP_Mock).
- Document how test data (fixtures, factories) is set up and torn down.

---

## service_architecture.md

- Determine project shape: is this a theme, a plugin, or a full Bedrock site?
  Document accordingly.
- For a theme: describe the template hierarchy in use (classic PHP templates,
  block patterns, FSE templates).
- For a plugin: describe the main plugin file structure (main class, hooks registered
  in the constructor or `init`, admin vs public separation).
- For Bedrock: document the `web/app/` directory layout (`plugins/`, `themes/`, `mu-plugins/`).
- Document the asset pipeline: how CSS/JS is compiled and where the output goes.
- Note the WordPress hooks pattern used (actions vs filters, naming conventions for
  custom hooks).
- Document REST API extensions if any custom endpoints are registered
  (`register_rest_route` calls).
- Note any block registration (`register_block_type`, `block.json` files).

---

## database_schema.md

Only populate if the project registers custom database tables or uses custom post
types / meta as a structured data layer.

- Document custom tables registered via `$wpdb->prefix` and `dbDelta()`.
- Note any custom post types and their associated meta fields (registered with
  `register_post_type` and `register_meta` or `register_post_meta`).
- Document custom taxonomies registered.
- Note whether the project uses a schema migration approach for custom tables.

---

## Post-Edit Hook

Recommended syntax/type checker for the Claude adapter:

```
php -l {file}
```

Run `php -l` on every saved PHP file to catch syntax errors immediately.
If PHP_CodeSniffer is installed, also run:

```
./vendor/bin/phpcs --standard=WordPress {file}
```

For JavaScript files (if `@wordpress/scripts` is present), run:

```
npx eslint {file}
```
