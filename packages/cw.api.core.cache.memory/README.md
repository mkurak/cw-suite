# @cw-suite/api-cache-memory

In-memory TTL cache with tag-aware invalidation, deterministic eviction, and DI integration for shared singletons.

## Highlights
- **Deterministic TTLs** – configure a `defaultTtl` or per-entry `ttl`; expired items are pruned automatically.
- **Tag management** – associate entries with tags and remove them in batches via `deleteByTag`.
- **getOrSet coalescing** – concurrent calls waiting on the same key collapse into a single factory invocation.
- **Observability** – inspect cache stats, iterate entries, and receive eviction callbacks.
- **DI ready** – ship `cacheModule` and `useCache` to share a singleton across containers.

## Installation

```bash
npm install @cw-suite/api-cache-memory
```

## Quick Start

```ts
import { MemoryCache } from '@cw-suite/api-cache-memory';

const cache = new MemoryCache<string>({ defaultTtl: 60_000 });

await cache.getOrSet('user:42', async () => {
  const profile = await loadUserFromDb('42');
  return JSON.stringify(profile);
});

cache.set('feature-flags', ['alpha'], { tags: ['config'], ttl: 5_000 });
```

## API Summary
- `cache.set(key, value, { ttl, tags })`
- `cache.get(key)` / `cache.peek(key)` / `cache.has(key)`
- `await cache.getOrSet(key, factory, options)`
- `cache.delete(key)` / `cache.clear()` / `cache.deleteByTag(tag)`
- `cache.keys()` / `cache.keysByTag(tag)` / `cache.entries()`
- `cache.stats()` → `{ size, hits, misses, evictions, pending }`
- `cache.configure({ defaultTtl, maxEntries, onEvict })`

### Eviction Callbacks
`onEvict` receives `{ key, value, reason, metadata }` where `reason` is one of `expired`, `maxSize`, `manual`, `cleared`, or `tag`.

### Max Entries
When `maxEntries` is set the cache evicts in FIFO order until the size is within bounds. Each removal triggers `onEvict` with `reason: 'maxSize'`.

## DI Integration

```ts
import { useCache } from '@cw-suite/api-cache-memory';
import { Container } from '@cw-suite/api-di';

const container = new Container();

const cache = useCache<{ id: string }>({
  container,
  cacheOptions: { defaultTtl: 30_000 },
  configure: (instance) => {
    instance.configure({ maxEntries: 500 });
  }
});

await cache.getOrSet('user:1', () => fetchUser('1'));
```

- `useCache` resolves a singleton `MemoryCache` from the container and applies `cacheOptions` once.
- Register `cacheModule` manually with `registerModules(container, cacheModule)` when needed.

## Testing Tips
- Override `timeProvider` to control the clock (e.g. Jest fake timers).
- Monitor ongoing `getOrSet` calls via `cache.stats().pending`.

Mark the relevant task in `docs/TODO.md` after finishing documentation updates.
