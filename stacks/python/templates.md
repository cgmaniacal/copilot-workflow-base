# Template Filling Guide: Python

Instructions for the onboarding agent on how to populate each `core/agent_docs/`
template when a Python stack is detected.

---

## building_the_project.md

- Check `.python-version`, `pyproject.toml` `[tool.poetry.dependencies] python`,
  or `python_requires` in `setup.cfg` for the Python version requirement.
- Document the dependency manager: Poetry (`poetry install`), Pipenv
  (`pipenv install`), or pip (`pip install -r requirements.txt`).
- Check for a virtual environment convention: `.venv/`, `venv/`, or a note in
  the README. Document how to create and activate it.
- Check for `.env.example` or a settings module that reads from environment variables.
  List required variables.
- For Django: document `python manage.py runserver` and the default port (8000).
  Note if `DJANGO_SETTINGS_MODULE` must be set.
- For FastAPI: document `uvicorn app.main:app --reload` or the equivalent command
  from `pyproject.toml` scripts.
- For Flask: document `flask run` or the app entry point.
- List all scripts from `pyproject.toml` `[tool.poetry.scripts]` or `[project.scripts]`,
  and any Makefile targets if a `Makefile` exists.

---

## code_conventions.md

- Check `pyproject.toml` for `[tool.ruff]`, `[tool.black]`, `[tool.isort]`,
  `[tool.flake8]` sections and document the active rules and line length setting.
- Check `mypy.ini` or `[tool.mypy]` for `strict`, `disallow_untyped_defs`, and
  `ignore_missing_imports` settings. Document the type-checking strictness level.
- Check `pyrightconfig.json` for `typeCheckingMode` if Pyright is used instead.
- Document the file and module naming convention observed: `snake_case` for all
  Python files, modules, functions, and variables; `PascalCase` for classes;
  `SCREAMING_SNAKE` for module-level constants.
- Note import organization: standard library → third-party → local, enforced by
  isort or Ruff's `I` rule set.
- Document the error handling convention: custom exception classes, use of
  `logging` vs `print`, and whether exceptions bubble up or are caught at boundaries.
- Note the docstring style if consistent (Google, NumPy, reStructuredText).

---

## running_tests.md

- Identify the test runner from `pytest.ini`, `[tool.pytest.ini_options]` in
  `pyproject.toml`, or the presence of `test_*.py` files.
- Document the command to run all tests: `pytest` or `python -m pytest`.
- Document how to run a single file: `pytest tests/test_foo.py`.
- Document how to run a specific test: `pytest tests/test_foo.py::test_bar`.
- Note any `conftest.py` fixtures that set up shared test state (database,
  test client, factories).
- Document coverage reporting if configured (`--cov` flag, `[tool.coverage]`).
- For Django: document `python manage.py test` as an alternative and note whether
  pytest-django is used (check for `django_db` marker usage).
- Document the mocking approach: `unittest.mock.patch`, `pytest-mock` (`mocker`
  fixture), or `responses` for HTTP mocking.
- Note database isolation strategy for tests: `@pytest.mark.django_db` with
  transaction rollback, SQLite in-memory, or pytest-factoryboy.

---

## service_architecture.md

- Determine the project shape: web API, web application (with templates), CLI tool,
  background worker, or data pipeline.
- For Django: describe the app structure (`django-admin startapp`), where models,
  views, serializers, and URLs live. Note whether DRF is used.
- For FastAPI: describe the router organization (`APIRouter`), how routes are
  registered in `main.py`, and how dependency injection is used.
- For Flask: describe the application factory pattern (`create_app`), blueprints,
  and how configuration is loaded.
- Document the layering convention: are there separate service/business logic
  modules, or is logic in views/route handlers directly?
- Document how the app connects to the database: SQLAlchemy session management,
  Django ORM, or raw queries.
- Note CORS, authentication middleware, and rate limiting configuration if present.
- Document environment-specific configuration loading
  (Django settings modules, Pydantic `BaseSettings`, `python-decouple`).

---

## database_schema.md

Only populate if SQLAlchemy, Django ORM, or another database layer is detected.

- Identify the database engine from the connection string or settings file
  (PostgreSQL, MySQL, SQLite).
- For Django: document where models are defined (each app's `models.py`),
  the migration command (`python manage.py makemigrations`, `python manage.py migrate`),
  and the naming convention for model classes and fields.
- For SQLAlchemy + Alembic: document `alembic revision --autogenerate -m "<name>"`,
  `alembic upgrade head`, and where models are defined.
- Note the field naming convention: `snake_case` column names, `id` as primary key,
  `created_at` / `updated_at` timestamps.
- Note whether soft deletes are used (`deleted_at` or `is_deleted` field).
- Document seed data: Django fixtures (`loaddata`), factory-boy factories, or
  a custom seed script.

---

## Post-Edit Hook

Recommended syntax/type checker for the Claude adapter:

```
ruff check {file}
```

If mypy is configured in `pyproject.toml` or `mypy.ini`, add a second pass:

```
mypy {file}
```

Use `ruff check` as the primary fast feedback hook. Add `mypy` for projects
with strict type checking enabled. For Django projects, ensure `DJANGO_SETTINGS_MODULE`
is set in the environment before running mypy.
