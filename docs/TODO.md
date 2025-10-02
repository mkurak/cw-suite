# Core Aggregation Roadmap

## 0. Planning & Tooling
- [x] Shared gitignore/prettierignore moved to root.
- [x] Centralize shared tooling configs (Prettier, ESLint, tsconfig base).
- [x] Confirm monorepo tooling choice (`pnpm` workspace scaffolded; `Nx` evaluation pending).
- [x] Introduce Changesets for versioning/publishing (config stub + root scripts).
- [x] Define repository structure for aggregated core package (workspace patterns, naming, `cw.core` location).
- [x] Identify packages that remain publishable individually vs. bundled only via core (decision: retain individual publishes; `cw.core` is default entry point).

## 1. Core Package Skeleton (`cw.core`)
- [x] Create new core package directory with basic build/test config (tsconfig, eslint, jest).
- [x] Implement entrypoint that re-exports key helpers (DI, cache, queue, events, db, logging, runner).
- [ ] Provide default bootstrap helpers (e.g., `createApiApp`, combined DI modules, default dev runner wiring).
- [x] Write initial documentation inside the package (README, usage samples).

## 2. Integrate Existing Packages
- [ ] Audit each helper package API surface to decide export path inside core (namespaces vs. flat exports).
- [ ] Ensure tree-shake friendly exports (index modules) to avoid dragging unused helpers at runtime.
- [ ] Add integration tests ensuring core re-exports stay in sync with source packages.
- [ ] Update CODEX/TODO as mapping decisions are made per package.

## 3. Publication Workflow
- [ ] Configure Changesets release flows (version bump, changelog generation, `pnpm changeset publish`).
- [ ] Update GitHub Actions pipeline to run pnpm commands and publish changed packages automatically.
- [ ] Validate that publishing core also publishes dependent packages when necessary.

## 4. Cleanup & Migration
- [ ] Decide whether legacy packages remain public or become internal dependencies.
- [ ] Update consumer projects to adopt new core package import paths.
- [ ] Deprecate redundant packages or document their continued independent usage.
- [ ] Final review: ensure CODEX and README files reflect new architecture.

## Tracking Notes
- Maintain progress updates in `docs/CODEX.md` after each major milestone.
- Extend this checklist as new requirements emerge during implementation.
