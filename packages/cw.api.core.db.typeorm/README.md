# @cw-suite/api-db-typeorm

Helpers for managing the TypeORM `DataSource` lifecycle. Safely reconfigure connections, trigger automatic initialization, run migrations, and integrate with DI.

## Highlights
- **Deterministic DataSource management** – a single `TypeOrmManager` controls initialization and cleans up replaced instances.
- **Lazy or eager init** – flip `autoInitialize` or call `ensureInitialized()` explicitly.
- **Migration helpers** – `runMigrations` and `revertLastMigration` respect a configurable transaction strategy.
- **DI module** – share the manager across packages via `typeOrmModule` and `useTypeOrm`.
- **Config flexibility** – provide raw `DataSourceOptions` or factories; customize creation with `dataSourceFactory`.

## Installation

```bash
npm install @cw-suite/api-db-typeorm typeorm
```

## Quick Start

```ts
import { TypeOrmManager } from '@cw-suite/api-db-typeorm';

const manager = new TypeOrmManager();

manager.configure({
  dataSource: () => ({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: ['dist/entities/*.js'],
    migrations: ['dist/migrations/*.js']
  }),
  autoInitialize: true,
  runMigrationsOnInit: true
});

await manager.ensureInitialized();
```

## Configuration Options
| Field | Description |
| --- | --- |
| `dataSource` | `DataSourceOptions` or a factory returning options (sync/async). |
| `dataSourceFactory` | Custom factory used instead of `new DataSource(options)`. |
| `autoInitialize` | Automatically calls `ensureInitialized` after `configure`. |
| `runMigrationsOnInit` | Executes pending migrations after initialization. |
| `migrationsTransaction` | Transaction strategy for migrations (`'all' | 'each' | 'none'`). |
| `onInitialized` | Callback invoked when the `DataSource` is ready (health checks, seeding, etc.). |
| `allowReconfigure` | Permits replacing an existing configuration on the same manager. |

## Useful Methods
- `ensureInitialized()` – initializes the DataSource if needed and caches it.
- `getDataSource()` / `getDataSourceOrFail()` – async vs. sync access to the managed instance.
- `runMigrations(options?)` – runs pending migrations, honoring transaction overrides.
- `revertLastMigration(options?)` – rolls back the most recent migration.
- `destroy()` – tears down the DataSource and clears cached state.

## DI Usage

```ts
import { useTypeOrm } from '@cw-suite/api-db-typeorm';
import { Container } from '@cw-suite/api-di';

const container = new Container();

const manager = await useTypeOrm({
  container,
  config: {
    dataSource: async () => ({
      type: 'sqlite',
      database: ':memory:',
      entities: [User],
      synchronize: true
    }),
    autoInitialize: true
  }
});

const dataSource = await manager.getDataSource();
```

- Apply extra configuration through `useTypeOrm({ configure })` and guarantee initialization via `autoInitialize`.
- Register the module manually with `registerModules(container, typeOrmModule)` when composition requires it.

## Scripts and Migration Flow
```bash
# Generate a new migration
pnpm typeorm migration:generate ./src/migrations/CreateUsers

# Run migrations through the manager
node -e "require('@cw-suite/api-db-typeorm').useTypeOrm({ config: { dataSource: require('./ormconfig') } }).then(m => m.runMigrations())"
```

## Helper Function
- `createManagedDataSource(config)` – instantiates a disposable `TypeOrmManager` and returns its `DataSource`; convenient for CLIs and tests.

Update `docs/TODO.md` accordingly once the README refresh is complete.
