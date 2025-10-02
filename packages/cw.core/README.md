# cw.core

Aggregated entry point for the `cw` API ecosystem. This package re-exports
core helpers (DI container, Express bootstrap, cache, events, queue, database,
logging, dev tooling) so application projects can install a single dependency.

## Usage

```ts
import { di, server } from 'cw.core';

const container = new di.Container();
const { startServer } = server;
```

Refer to the sub-module directories under `src/` for the exact exports. Each
module mirrors the corresponding standalone package so you can migrate
progressively.
```
