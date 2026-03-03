# Stack Detection: WordPress

The onboarding script uses these signals to identify a WordPress project
and determine sub-variants. Any single primary signal is sufficient to confirm
the stack. Secondary signals narrow down the specific setup.

## Primary Signals

Any one of these confirms this is a WordPress project:

- `wp-config.php` exists at the repository root or one level down
- `wp-content/` directory exists (with `themes/` or `plugins/` subdirectories)
- `style.css` exists and contains a `Theme Name:` header comment
- `functions.php` exists alongside a `style.css` with a Theme Name header

## Secondary Signals

These signals identify the specific WordPress configuration in use:

### Theme Type
- `theme.json` present in the theme root — block theme (Full Site Editing)
- `style.css` with `Theme Name:` header but no `theme.json` — classic theme
- `functions.php` with `add_theme_support( 'block-templates' )` — hybrid theme

### Project Management
- `composer.json` at root with `roots/wordpress` or `johnpbloch/wordpress` — Bedrock
  or Composer-managed install
- `composer.json` with `wpackagist-plugin/` or `wpackagist-theme/` dependencies — WPackagist
- `vendor/` directory alongside `composer.json` — Composer dependencies present

### Local Development Environment
- `wp-env.json` — wp-env (official WordPress Docker dev tool)
- `docker-compose.yml` or `docker-compose.yaml` — Docker-based environment
- `.lando.yml` — Lando
- `.ddev/config.yaml` — DDEV

### Build Tooling
- `package.json` with `@wordpress/scripts` — wp-scripts build pipeline
- `webpack.config.js` — custom Webpack
- `vite.config.js` — Vite-based asset pipeline

### Code Standards and Testing
- `.phpcs.xml` or `phpcs.xml.dist` or `phpcs.xml` — PHP_CodeSniffer (WPCS)
- `phpunit.xml` or `phpunit.xml.dist` — PHPUnit test suite
- `jest.config.js` or `@testing-library/jest-dom` — JavaScript unit tests
- `.php-cs-fixer.php` — PHP CS Fixer

## Sub-Variants

| Variant | Key Signal |
|---------|-----------|
| Classic theme | `style.css` with Theme Name, no `theme.json` |
| Block theme (FSE) | `theme.json` in theme root |
| Plugin | `plugin-name.php` with Plugin Name header comment |
| Bedrock | `composer.json` with `roots/wordpress`, `web/` document root |
| Composer-managed | `composer.json` with WPackagist dependencies |
| wp-env dev setup | `wp-env.json` at root |

## Post-Edit Hook

```
php -l {file}
```

Runs PHP syntax checking on the saved file. Catches parse errors immediately.
For projects using PHP_CodeSniffer, also run:

```
./vendor/bin/phpcs --standard=WordPress {file}
```
