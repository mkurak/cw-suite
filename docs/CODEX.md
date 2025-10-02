# Codex Working Notes

## Repository Overview
- Monorepo of TypeScript packages under the `cw.*` namespace.
- Packages provide the building blocks for internal API projects:
  - `cw.api.core`: minimal Express 5 server bootstrapper (health check, JSON body parsing, start helper).
  - `cw.api.core.di`: custom dependency injection container with decorators, module system, async scope support.
  - `cw.api.core.cache.memory`: in-memory cache with TTL, tagging, eviction metrics + DI module.
  - `cw.api.core.db.typeorm`: TypeORM manager with DI integration, handles DataSource lifecycle, migrations.
  - `cw.api.core.events`: event bus abstraction with lifecycle hooks and DI module.
  - `cw.api.core.queue.local`: in-memory queue/worker system with ack/nack, DLQ, metrics, DI module.
  - `cw.helper.colored.console`: ANSI-aware logging helpers shared across packages.
  - `cw.helper.dev.runner`: custom dev runner/CLI replacing nodemon; watches, rebuilds, restarts apps.
  - `cw.helper.package.generator`: scaffolding CLI that stamps out new helper packages with shared config.

## Architectural Principles
- Goal: build API stack with **minimal third-party dependencies** beyond unavoidable choices (Express, TypeORM, etc.).
- Prefer home-grown tooling (e.g., custom dev runner instead of nodemon) to keep behavior consistent and controlled.
- Each capability (DI, cache, events, queue, logging, scaffolding) is packaged separately but designed to interoperate.

## Core Package Vision
- Future plan: create a new `core` package that aggregates these helper packages.
- API projects will depend on the core package to bootstrap servers, wire DI, and compose modules.
- Current state: **core package not yet implemented**—repository currently reflects groundwork/inventory from a prior, incomplete session.

## Modularity Goals
- Long-term inspiration from NestJS in terms of modular architecture, not one-to-one code parity.
- Evolution will be incremental; aim is to achieve Nest-like flexibility while preserving unique design choices.
- Focus remains on module registration via `cw.api.core.di` and its `createModule`/`registerModules` helpers.

## Development Notes
- `cw.helper.dev.runner` underpins the iterative workflow; packages like `cw.api.core` include `cw-dev-runner.config.json` for build/run automation.
- `cw.helper.package.generator` templates enforce consistent tooling (ESLint, Prettier, Jest, TS build configs, git hooks).
- Logging consistency achieved through `cw.helper.colored.console` theme utilities.

## Session Timeline
- 2025-??-??: Repository walkthrough completed; context gathered for forthcoming restructuring.
- Awaiting instruction to implement the new core package and perform refactors.

## Maintenance Instructions
- This document is Codex’s canonical memory log.
- After each session/change, append key findings, decisions, architectural shifts, TODOs, and outstanding questions.
- Ensure entries are detailed enough that reviewing this file alone reconstructs project history for future sessions.

### Notes 2025-??-??
- Discussed monorepo tooling to manage multiple `cw.*` packages without merging them into a single artifact.
- Clarified that pnpm/Nx/Changesets allow keeping packages in one repository while still publishing each to npm automatically:
  - pnpm (workspace) installs dependencies once and runs filtered scripts per package.
  - Nx focuses builds/tests on affected packages only.
  - Changesets tracks version bumps and drives `pnpm publish` commands for only changed packages.
- Core package strategy under consideration: build a new aggregate package on top of existing helpers rather than deleting them.

## Working Lists
- `docs/TODO.md` now tracks the core aggregation roadmap (tooling setup, core package structure, integration, publishing workflow, cleanup).
- Update TODO checkboxes as tasks progress; mirror key decisions back here for long-term memory.

## 2025-??-?? Progress
- Initialized monorepo scaffolding: root `package.json` with pnpm-driven scripts, `pnpm-workspace.yaml`, and `.changeset` config for release automation.
- Created new `cw.core` package as ESM aggregator with per-domain submodules (`server`, `di`, `cache`, `db`, `events`, `queue`, `logging`, `dev`).
- Implemented namespaced exports plus key convenience re-exports in `cw.core/src/index.ts`; added lint/test tooling and README scaffold.
- Updated `docs/TODO.md` to track remaining tasks (bootstrap helpers, API audit, workflow automation) and will expand as integration progresses.

## 2025-??-?? Structural Update
- Restructured repository into explicit monorepo layout: all helper packages moved under `packages/` and old per-package `.git` folders removed.
- `pnpm-workspace.yaml` now targets `packages/**`, enabling pnpm to manage every module from the root repo.
- Root README placeholder (`cw-suite`) added; future documentation can expand on monorepo usage.
- Primary consumption path is intended to be `cw.core`, but each helper package remains publishable individually; legacy packages serve as building blocks within the monorepo.

### Tooling Consolidation
- Added root-level configs (`prettier.config.cjs`, `eslint.config.mjs`, `tsconfig.base.json`) so all packages inherit shared rules; per-package ESLint files now re-export the shared config and tsconfigs extend the base.
- Converted internal package dependencies to `workspace:^` ranges to keep local linking while allowing Changesets to emit proper semver constraints during release.
- Clarified that each package remains publishable individually; monorepo tooling simply automates version bumping and reduces duplication.

### Config Cleanup
- Consolidated gitignore and prettier ignore rules at the repo root; per-package `.gitignore`/`.prettierignore` removed.
- Per-package ESLint configs removed; packages now rely on root `eslint.config.mjs` via default discovery.
- Left Jest and tsconfig files in place because packages need bespoke module/coverage settings; consider introducing shared base templates later if requirements converge.
