# Core Aggregation Roadmap

## 0. Planning & Tooling
- [x] Shared tooling configs (Prettier, ESLint, tsconfig base).
- [x] Confirm monorepo tooling choice (`pnpm` workspace scaffolded; `Nx` evaluation pending).
- [x] Introduce Changesets for versioning/publishing (config stub + root scripts).
- [x] Define repository structure for packages (workspace patterns, naming).
- [x] Identify packages that remain publishable individually vs. bundled only via core (decision: retain individual publishes under `@cw-suite/*`).

## 1. Package Exposure
- [x] Provide default bootstrap helpers (e.g., `createApiApp`, combined DI modules, default dev runner wiring).
- [x] Document usage of scoped packages in consumer projects.

## 2. Integrate Existing Packages
- [ ] Audit each helper package API surface to decide export path consistency across packages.
- [ ] Ensure tree-shake friendly exports (index modules) to avoid dragging unused helpers at runtime.
- [ ] Add integration tests ensuring packages remain interoperable.
- [ ] Update CODEX/TODO as mapping decisions are made per package.

## 3. Publication Workflow
- [x] Configure Changesets release flows (version bump, changelog generation, `pnpm changeset publish`).
- [x] Update GitHub Actions pipeline to run pnpm commands and publish changed packages automatically.
- [ ] Validate that publishing scoped packages works end-to-end (monitor initial releases).

## 4. Cleanup & Migration
- [ ] Update consumer projects to adopt new scoped import paths.
- [ ] Deprecate redundant packages or document their continued independent usage.
- [ ] Final review: ensure CODEX and README files reflect new architecture.

## 5. README Refresh Tasks
- [x] Update `@cw-suite/api-core` README with current bootstrap patterns, dev runner usage, and health check wiring.
- [x] Update `@cw-suite/api-di` README to reflect latest module/metadata APIs and DI lifecycles.
- [x] Update `@cw-suite/api-cache-memory` README with cache configuration, eviction metrics, and DI integration flow.
- [x] Update `@cw-suite/api-db-typeorm` README covering datasource lifecycle, migration commands, and DI bindings.
- [x] Update `@cw-suite/api-events` README explaining event bus hooks, lifecycle, and module registration examples.
- [x] Update `@cw-suite/api-queue-local` README with worker setup, ack/nack semantics, DLQ usage, and DI wiring.
- [x] Update `@cw-suite/helper-colored-console` README to document logger themes, formatting helpers, and CLI usage.
- [x] Update `@cw-suite/helper-dev-runner` README detailing watch/rebuild flow, configuration, and script integration.

## Tracking Notes
- Maintain progress updates in `docs/CODEX.md` after each major milestone.
- Extend this checklist as new requirements emerge during implementation.

## 2025-10-02 Notes
- [ ] Add `@jest/globals` to `@cw-suite/helper-colored-console` devDependencies and verify tests.
- [ ] Monitor next release run after `@cw-suite` org token update; confirm scoped packages land on npm.
- [ ] Document scoped import usage in consumer API projects.
