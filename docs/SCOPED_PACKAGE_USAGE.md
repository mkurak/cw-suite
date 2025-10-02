# Using `@cw-suite/*` Packages in Consumer Projects

This guide shows how to bootstrap a standalone API service that consumes the
scoped packages published from this repository. It assumes a Node.js 18+
runtime and either pnpm or npm for package management.

## 1. Install the scoped packages

Add the packages that your service needs. The example below installs the core
Express bootstrapper together with the default DI-powered helpers:

```bash
pnpm add @cw-suite/api-core \
  @cw-suite/api-di \
  @cw-suite/api-cache-memory \
  @cw-suite/api-events \
  @cw-suite/api-queue-local \
  @cw-suite/api-db-typeorm
```

The core package only depends on Express at runtime; everything else is opt-in.
Removing any of the helpers above is safe as long as you do not enable them in
the bootstrap configuration (see step 3).

## 2. Configure TypeScript

Enable decorators and emit metadata so that the DI container functions
correctly. A minimal `tsconfig.json` looks like this:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "moduleResolution": "node",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "strict": true,
    "esModuleInterop": true,
    "outDir": "dist"
  },
  "include": ["src/**/*"]
}
```

If you use Jest, configure `ts-jest` or the ESM support so that the
`@cw-suite/*` packages are compiled before tests run. An example Jest config is
provided in `packages/cw.api.core/jest.config.js` within this repository.

## 3. Bootstrap an API app with the shared helpers

Use the new `createApiApp` helper to spin up an Express instance that already
exposes the default middleware chain and registers core DI modules.

```ts
// src/main.ts
import { createApiApp, startApiServer } from '@cw-suite/api-core';
import { Lifecycle, Injectable } from '@cw-suite/api-di';

@Injectable({ lifecycle: Lifecycle.Scoped })
class RequestContext {
  readonly requestId = crypto.randomUUID();
}

@Injectable()
class HelloController {
  constructor(private readonly context: RequestContext) {}

  register(app: ReturnType<typeof createApiApp>['app']) {
    app.get('/hello', (req, res) => {
      res.json({ message: 'Hello world!', requestId: this.context.requestId });
    });
  }
}

async function main() {
  const { app, container } = createApiApp({
    coreModules: {
      cache: true,
      events: true,
      queue: false,
      typeorm: false
    },
    onContainerReady: (c) => {
      c.register(HelloController);
    },
    onAppCreated: ({ app: expressApp, container: c }) => {
      const controller = c.resolve(HelloController);
      controller.register(expressApp);
    }
  });

  const { server, config } = await startApiServer({
    container,
    server: { port: 4000 }
  });

  console.log(`Listening on http://${config.host}:${config.port}`);
  return server;
}

main().catch((error) => {
  console.error('Failed to start the service', error);
  process.exit(1);
});
```

### Registering additional modules

`registerCoreModules({ container, queue: true, typeorm: true })` wires the
queue and TypeORM helpers into the container. Use the `extras` option when you
need to provide custom modules:

```ts
import { registerCoreModules } from '@cw-suite/api-core';
import { createModule } from '@cw-suite/api-di';

const appModule = createModule({
  providers: [/* controllers, services, etc. */]
});

const container = registerCoreModules({
  typeorm: true,
  queue: true,
  extras: [appModule]
});
```

### Using the dev runner template

Generate a starter configuration for `@cw-suite/helper-dev-runner`:

```ts
import { DEFAULT_DEV_RUNNER_CONFIG } from '@cw-suite/api-core';
import { writeFileSync } from 'node:fs';

writeFileSync(
  'cw-dev-runner.config.json',
  JSON.stringify(DEFAULT_DEV_RUNNER_CONFIG, null, 2)
);
```

`pnpm dev:w` will now watch `src/`, rebuild, and restart your service whenever
sources change.

## 4. Testing with SuperTest

Because `createApiApp` returns a plain Express instance, end-to-end style tests
remain straightforward:

```ts
import request from 'supertest';
import { createApiApp } from '@cw-suite/api-core';

describe('GET /health', () => {
  it('returns ok', async () => {
    const { app } = createApiApp();
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});
```

## 5. Deployment checklist

- Set `HOST` and `PORT` environment variables when you need to override the
  defaults (`0.0.0.0:3000`).
- Configure TypeORM connection options (`TypeOrmManager.configure`) inside the
  `onContainerReady` hook if your service relies on database access.
- Use `container.runInScope()` within HTTP middleware to create request-scoped
  lifetimes when integrating custom routers.
- Update the service README with the commands you added (`pnpm dev:w`,
  `pnpm test`, etc.) so contributors understand the shared workflow.

With these steps an external project can consume the scoped packages with
minimal boilerplate while keeping the DI modules and dev tools aligned with the
rest of the cw-suite ecosystem.
