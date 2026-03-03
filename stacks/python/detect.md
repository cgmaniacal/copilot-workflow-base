# Stack Detection: Python

The onboarding script uses these signals to identify a Python project
and determine sub-variants. Any single primary signal is sufficient to confirm
the stack. Secondary signals narrow down the framework and toolchain.

## Primary Signals

Any one of these confirms this is a Python project:

- `pyproject.toml` exists at the repository root
- `setup.py` or `setup.cfg` exists at the repository root
- `requirements.txt` or `requirements/` directory exists
- One or more `*.py` files exist at the root or in a top-level source directory

## Secondary Signals

These signals identify the specific Python framework and toolchain in use:

### Web Framework
- `manage.py` and `settings.py` (or a `settings/` directory) — Django
- `app.py` or `application.py` with `from flask import Flask` — Flask
- `main.py` with `from fastapi import FastAPI` — FastAPI
- `pyproject.toml` with `fastapi` or `django` or `flask` in dependencies

### ASGI / WSGI
- `asgi.py` present — ASGI app (Django async or FastAPI/Starlette)
- `wsgi.py` present — WSGI app (Django or Flask sync)
- `uvicorn` or `gunicorn` in `requirements.txt` or `pyproject.toml`

### Dependency Management
- `pyproject.toml` with `[tool.poetry]` section — Poetry
- `pyproject.toml` with `[project]` section (PEP 517) — modern packaging
- `Pipfile` and `Pipfile.lock` — Pipenv
- `requirements.txt` — pip with pinned requirements
- `.python-version` — pyenv version pin

### Testing
- `pytest.ini` or `[tool.pytest.ini_options]` in `pyproject.toml` — pytest
- `tests/` or `test/` directory containing `test_*.py` files
- `conftest.py` at root or in `tests/` — pytest fixtures

### Type Checking and Linting
- `mypy.ini` or `[tool.mypy]` in `pyproject.toml` — mypy
- `pyrightconfig.json` — Pyright
- `[tool.ruff]` in `pyproject.toml` — Ruff (linter + formatter)
- `.flake8` or `[tool.flake8]` — Flake8
- `[tool.black]` in `pyproject.toml` — Black formatter
- `[tool.isort]` in `pyproject.toml` — isort import sorting

### Database
- `alembic.ini` and `alembic/` directory — Alembic migrations
- `sqlalchemy` in dependencies — SQLAlchemy ORM
- `migrations/` directory inside a Django project — Django ORM migrations

## Sub-Variants

| Variant | Key Signal |
|---------|-----------|
| Django | `manage.py`, `settings.py`, `django` in dependencies |
| Flask | `from flask import Flask` in an entry point file |
| FastAPI | `from fastapi import FastAPI` in an entry point file |
| CLI tool | No web framework; `typer` or `click` in dependencies |
| Data/ML | `numpy`, `pandas`, or `torch` in dependencies |
| Poetry project | `[tool.poetry]` in `pyproject.toml` |

## Post-Edit Hook

```
ruff check {file}
```

If mypy is configured, also run:

```
mypy {file}
```

Prefer `ruff check` as the primary post-edit hook for speed. Use `mypy` for
deeper type-checking passes, especially in typed codebases.
