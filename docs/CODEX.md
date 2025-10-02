# Codex Working Notes

## Repository Overview
- Monorepo of TypeScript packages under the `@cw-suite/*` scope.
- Packages provide the building blocks for internal API projects:
  - `@cw-suite/api-core`: minimal Express 5 server bootstrapper (health check, JSON body parsing, start helper).
  - `@cw-suite/api-di`: custom dependency injection container with decorators, module system, async scope support.
  - `@cw-suite/api-cache-memory`: in-memory cache with TTL, tagging, eviction metrics + DI module.
  - `@cw-suite/api-db-typeorm`: TypeORM manager with DI integration, handles DataSource lifecycle, migrations.
  - `@cw-suite/api-events`: event bus abstraction with lifecycle hooks and DI module.
  - `@cw-suite/api-queue-local`: in-memory queue/worker system with ack/nack, DLQ, metrics, DI module.
  - `@cw-suite/helper-colored-console`: ANSI-aware logging helpers shared across packages.
  - `@cw-suite/helper-dev-runner`: custom dev runner/CLI replacing nodemon; watches, rebuilds, restarts apps.

## Architectural Principles
- Goal: build API stack with **minimal third-party dependencies** beyond unavoidable choices (Express, TypeORM, etc.).
- Prefer home-grown tooling (e.g., custom dev runner instead of nodemon) to keep behavior consistent and controlled.
- Each capability (DI, cache, events, queue, logging) is packaged separately but designed to interoperate through the DI module.

## Modularity Goals
- Long-term inspiration from NestJS in terms of modular architecture, not one-to-one code parity.
- Evolution will be incremental; aim is to achieve Nest-like flexibility while preserving unique design choices.
- Focus remains on module registration via `@cw-suite/api-di` and its `createModule`/`registerModules` helpers.

## Development Notes
- `@cw-suite/helper-dev-runner` underpins the iterative workflow; packages like `@cw-suite/api-core` include `cw-dev-runner.config.json` for build/run automation.
- Scaffolding templates live in the legacy generator package; future replacements can build on the scoped helpers directly.
- Logging consistency achieved through `@cw-suite/helper-colored-console` theme utilities.

## Session Timeline
- 2025-??-??: Repository walkthrough completed; context gathered for forthcoming restructuring.
- 2025-10-02: Scoped package rename completed; all helpers now reside under `@cw-suite/*` and publish individually.

## Maintenance Instructions
- This document is Codex’s canonical memory log.
- After each session/change, append key findings, decisions, architectural shifts, TODOs, and outstanding questions.
- Ensure entries are detailed enough that reviewing this file alone reconstructs project history for future sessions.

### Notes 2025-??-??
- Discussed monorepo tooling to manage multiple packages without merging them into a single artifact.
- Clarified that pnpm/Nx/Changesets allow keeping packages in one repository while still publishing each to npm automatically:
  - pnpm (workspace) installs dependencies once and runs filtered scripts per package.
  - Nx focuses builds/tests on affected packages only.
  - Changesets tracks version bumps and drives `pnpm publish` commands for only changed packages.

## Working Lists
- `docs/TODO.md` tracks the roadmap (tooling setup, integration, publishing workflow, cleanup).
- Update TODO checkboxes as tasks progress; mirror key decisions back here for long-term memory.

## 2025-??-?? Progress
- Initialized monorepo scaffolding: root `package.json` with pnpm-driven scripts, `pnpm-workspace.yaml`, and `.changeset` config for release automation.
- Transitioned helper packages to scoped names under `@cw-suite/*` for npm publication.
- Removed the temporary `cw.core` aggregator package; applications depend directly on the scoped helpers.
- Updated `docs/TODO.md` to track remaining tasks (bootstrap helpers, API audit, workflow automation) and will expand as integration progresses.

## 2025-??-?? Structural Update
- Restructured repository into explicit monorepo layout: all helper packages moved under `packages/` and old per-package `.git` folders removed.
- `pnpm-workspace.yaml` now targets `packages/**`, enabling pnpm to manage every module from the root repo.
- Root README placeholder (`cw-suite`) added; future documentation can expand on monorepo usage.
- API projects consume `@cw-suite/api-core` and related scoped helpers directly; each package remains independently publishable.

### Tooling Consolidation
- Added root-level configs (`prettier.config.cjs`, `eslint.config.mjs`, `tsconfig.base.json`) so all packages inherit shared rules; per-package ESLint files now re-export the shared config and tsconfigs extend the base.
- Converted internal package dependencies to `workspace:^` ranges to keep local linking while allowing Changesets to emit proper semver constraints during release.
- Clarified that each package remains publishable individually; monorepo tooling simply automates version bumping and reduces duplication.

### Config Cleanup
- Consolidated gitignore and prettier ignore rules at the repo root; per-package `.gitignore`/`.prettierignore` removed.
- Per-package ESLint configs removed; packages now rely on root `eslint.config.mjs` via default discovery.
- Left Jest and tsconfig files in place because packages need bespoke module/coverage settings; consider introducing shared base templates later if requirements converge.

### Release Automation
- Added `.github/workflows/release.yml` to run on pushes to `main`: installs deps, runs `pnpm changeset version`, commits version bumps when needed, and publishes via `pnpm changeset publish` using `NPM_TOKEN`.
- Created `.changeset/all-packages-patch.md` to issue patch bumps across all active packages for initial release validation.

## 2025-10-02 07:42:20Z
- Verified release pipeline setup.

## 2025-10-02 16:03:41Z
- Converted all packages to the `@cw-suite/*` npm scope; `cw.core` aggregator removed.
- Release workflow (`.github/workflows/release.yml`) publishing scoped packages—pending successful `@cw-suite` org setup and fresh `NPM_TOKEN`.
- Changeset updated to patch-bump all scoped packages; next run should publish `@cw-suite/api-core@0.2.2`, `@cw-suite/helper-dev-runner@1.0.10`, etc.
- Outstanding: `@cw-suite/helper-colored-console` tests need `@jest/globals` dev dependency.
