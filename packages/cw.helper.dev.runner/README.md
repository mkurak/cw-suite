# @cw-suite/helper-dev-runner

Lightweight development runner that watches files, optionally executes a build, and restarts your application.

## Highlights
- **Single-process loop** – waits for the build to finish and restarts the run command.
- **Debounced restarts** – prevents redundant rebuilds on frequent changes.
- **Structured logs** – minimal logger built on top of stdout.
- **JSON configuration** – drive behavior via `cw-dev-runner.config.json` at the repo root.
- **CLI or library** – use the CLI directly or orchestrate runs with the `DevRunner` class.

## Installation

```bash
npm install --save-dev @cw-suite/helper-dev-runner
```

## CLI Usage
Add a script to `package.json`:

```json
{
  "scripts": {
    "dev:w": "cw-dev-runner --config ./cw-dev-runner.config.json"
  }
}
```

Example `cw-dev-runner.config.json`:

```json
{
  "cwd": ".",
  "buildCommand": "pnpm build",
  "runCommand": "node dist/server.js",
  "waitForPath": "dist/server.js",
  "watch": true,
  "buildWatchCommand": "pnpm build -- --watch",
  "runWithNodeWatch": true,
  "logLevel": "info"
}
```

- `buildCommand` executes synchronously on startup.
- `buildWatchCommand` (optional) runs in the background when `watch` is true.
- `runWithNodeWatch: true` leverages Node's built-in `--watch` flag.
- `waitForPath` ensures the build output exists before starting the app.

## Programmatic Usage

```ts
import { loadConfig, resolveConfig, DevRunner } from '@cw-suite/helper-dev-runner';

const { config } = loadConfig();
const resolved = resolveConfig(config, {
  run: { command: 'node', args: ['dist/server.js'] }
});

const runner = new DevRunner(resolved);
await runner.start();

process.on('SIGINT', async () => {
  await runner.stop();
  process.exit(0);
});
```

### `ResolvedRunnerConfig`
| Field | Description | Default |
| --- | --- | --- |
| `projectRoot` | Working directory for watching and commands | `process.cwd()` |
| `watchDirs` | Directories to watch | `['src']` |
| `ignore` | Paths ignored by the watcher | `['node_modules','dist','coverage','.git']` |
| `debounceMs` | Debounce window before restarting | `200` |
| `build` | Optional build command | `undefined` |
| `run` | Required run command | `node dist/index.js` |

## File Watching Behavior
- `DirectoryWatcher` recursively monitors `watchDirs` and triggers rebuilds on changes.
- When changes fire, the runner executes the build (if configured) and restarts the run command.
- Concurrent changes are batched using `debounceMs`; the runner waits for an ongoing rebuild to finish before starting another.

## Logging
The logger supports `info`, `warn`, `error`, and `debug`. Provide a custom logger instance to `DevRunner` if you need alternative formatting.

After finishing documentation work, update `docs/TODO.md` to reflect completion.
