# @cw-suite/api-core

Minimal Express 5 bootstrap layer. The helpers `createApp` and `startServer` wire JSON parsing, a health check route, and configurable host/port settings into a single package.

## Highlights
- **Zero friction** – spin up an Express app and start listening with a couple of lines.
- **Health check ready** – `/health` is enabled by default and can be disabled or remapped to a custom path.
- **Deterministic configuration** – `ServerOptions` control host/port while environment variables (`PORT`, `HOST`) are automatically respected.
- **Test friendly** – `createApp` returns a plain Express instance, making SuperTest scenarios straightforward.

## Installation

```bash
npm install @cw-suite/api-core
```

## Quick Start

```ts
import { createApp, startServer } from '@cw-suite/api-core';

const { app } = createApp({ port: 4000 });

app.get('/users/:id', async (req, res) => {
  const user = await loadUser(req.params.id);
  res.json(user);
});

await startServer({ port: 4000 });
```

- `createApp` returns the Express instance alongside the resolved configuration.
- `startServer` applies the same configuration, starts the HTTP server, and resolves `{ server, config }`.

## Configuration
Control runtime behavior with the `ServerOptions`/`ServerConfig` interfaces:

| Option | Description | Default |
| --- | --- | --- |
| `host` | Address used by `app.listen` | `process.env.HOST ?? '0.0.0.0'` |
| `port` | Port to listen on. Invalid values throw. | `Number(process.env.PORT) || 3000` |
| `enableHealthCheck` | Enables or disables the health check route | `true` |
| `healthCheckPath` | Path exposed for the health check | `/health` |

Inspect or merge defaults programmatically:

```ts
import { defaultServerConfig, resolveServerConfig } from '@cw-suite/api-core';

const custom = resolveServerConfig({ port: 8080, enableHealthCheck: false });
console.log(defaultServerConfig, custom);
```

## Health Check
- When `enableHealthCheck` is `true`, `GET <healthCheckPath>` responds with `{ status: 'ok' }`.
- Extend the handler after `createApp` to perform dependency probes.

```ts
const { app, config } = createApp();
app.get(config.healthCheckPath, async (_req, res) => {
  const dbHealthy = await pingDatabase();
  res.status(dbHealthy ? 200 : 503).json({ status: dbHealthy ? 'ok' : 'degraded' });
});
```

## Testing
`createApp` returns an Express instance that works seamlessly with SuperTest:

```ts
import request from 'supertest';
import { createApp } from '@cw-suite/api-core';

describe('health check', () => {
  it('returns ok', async () => {
    const { app } = createApp();
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
  });
});
```

## API Summary
- `createApp(options?) => { app, config }`
- `startServer(options?) => Promise<{ server, config }>`
- `defaultServerConfig`
- `resolveServerConfig(options)`

Remember to tick the corresponding item in `docs/TODO.md` once documentation work completes.
