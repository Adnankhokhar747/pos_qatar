# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

POS Qatar is a [Frappe](https://frappeframework.com/) application (app name: `pos_qatar`, title "POS Qatar"). It is currently a freshly scaffolded app — most of `hooks.py` is the default boilerplate with hooks commented out, and there are no custom doctypes, pages, or APIs yet.

This app is meant to be installed into a Frappe bench (it is not a standalone project and has no local dependency manager config of its own beyond `pyproject.toml`).

## Repository layout

- `pos_qatar/hooks.py` — app configuration and Frappe hook registration (most hooks are commented-out templates; uncomment and wire up as features are added).
- `pos_qatar/modules.txt` — list of Frappe modules belonging to this app.
- `pos_qatar/patches.txt` — DB migration patches, split into `[pre_model_sync]` and `[post_model_sync]` sections.
- `pos_qatar/config/` — app/module config (workspace, module definitions).
- `pos_qatar/templates/pages/` — Jinja web page templates/routes.
- `pos_qatar/public/` — static assets (JS/CSS) served by the app.

Custom doctypes, server-side APIs, and client scripts will live under `pos_qatar/pos_qatar/` (the inner app package) following standard Frappe app structure as they are added (e.g. `pos_qatar/pos_qatar/doctype/<doctype_name>/`).

## Development workflow

This app is developed inside a Frappe bench. From the bench root (not this repo root):

```bash
bench get-app $URL_OF_THIS_REPO --branch develop
bench install-app pos_qatar
bench migrate                 # apply doctype/patch changes
bench start                    # run dev server
bench --site <site> console    # python console with frappe context
```

Run a single patch or migration via `bench migrate`; new patches are registered in `pos_qatar/patches.txt`.

## Linting & formatting

This repo uses `pre-commit` for all linting/formatting (ruff, eslint, prettier, pyupgrade). Install once per checkout:

```bash
pre-commit install
```

Then `pre-commit run --all-files` runs all checks. Key tool configs:

- **Python**: ruff, configured in `pyproject.toml` (line-length 110, tab indentation, double quotes, target py310). Note many default lint rules are intentionally disabled (e.g. tabs/indentation rules, unused imports, line length) to match Frappe framework conventions.
- **JS**: eslint via `.eslintrc` — extends `eslint:recommended` with most style rules (indentation, quotes, semicolons) turned off, and a large `globals` list of Frappe/desk global APIs (e.g. `frappe`, `cur_frm`, `$c`, `flt`, `__`). `no-console` is a warning.
- **Editor defaults**: `.editorconfig` — tabs, size 4, LF line endings for py/js/vue/css/scss/html; JSON files use 2-space indentation (doctype schema files).

## Conventions

- Python target version is 3.10+; ruff-format uses tabs for indentation and double quotes for strings.
- `frappe` itself is *not* a project dependency in `pyproject.toml` — it's provided by the bench environment.
- Hooks, scheduler events, permission rules, etc. should be added to `pos_qatar/hooks.py` following the commented examples already present there.
