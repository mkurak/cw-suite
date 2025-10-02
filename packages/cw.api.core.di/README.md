# @cw-suite/api-di

Lightweight IoC container powering the cw API ecosystem. Provides decorator-driven registrations, predictable lifecycles, an opt-in module system, and scope-aware resolution.

## Highlights
- **TypeScript-first** – `@Injectable`, `@Inject`, `@Optional`, and strongly typed tokens.
- **Lifecycle control** – `Singleton`, `Scoped`, and `Transient` services with `runInScope` for request/job boundaries.
- **Module system** – share DI configuration across packages using `createModule` plus `registerModules`.
- **Metadata** – controller/route and middleware decorators produce discovery data for HTTP adapters.
- **Observability** – listen to resolve/dispose events and pipe them through `enableEventLogging`.

## Installation

```bash
npm install @cw-suite/api-di
```

> Enable `experimentalDecorators` and `emitDecoratorMetadata` in your TypeScript configuration when using decorators.

## Quick Start

```ts
import {
  Container,
  Injectable,
  Inject,
  Lifecycle,
  createModule,
  registerModules
} from '@cw-suite/api-di';

@Injectable()
class ConfigService {
  readonly port = Number(process.env.PORT ?? 3000);
}

@Injectable({ lifecycle: Lifecycle.Scoped })
class RequestIdProvider {
  private readonly id = crypto.randomUUID();
  get value() {
    return this.id;
  }
}

@Injectable()
class UserService {
  constructor(private readonly config: ConfigService) {}
  find(id: string) {
    return { id, port: this.config.port };
  }
}

const appModule = createModule({
  providers: [ConfigService, RequestIdProvider, UserService]
});

const container = new Container();
registerModules(container, appModule);

container.runInScope('http', () => {
  const users = container.resolve(UserService);
  console.log(users.find('42'));
});
```

## Lifecycles and Scope Resolution
- Default lifecycle is `Singleton`.
- `Lifecycle.Transient` creates a new instance on each `resolve`.
- `Lifecycle.Scoped` caches within `runInScope`/`runInSession`; instances dispose when the scope ends.
- `container.destroySession(sessionId)` or scope completion cleans up; async `dispose()` methods are awaited.
- `container.createChild({ include, exclude })` builds hierarchical containers that inherit selected registrations.

## Module System
- `createModule({ providers, exports, imports })` defines package-level DI configuration.
- `registerModules(container, moduleA, moduleB)` ensures dependencies load exactly once.
- Providers can be direct class references or `{ provide, useClass, options }`; set `options.lifecycle` to control scope.

### Global Container Helpers
- `getContainer()` – returns the shared singleton container, ideal for cross-package usage.
- `resetContainer()` – resets the global container between tests.

## Decorators and Metadata
- `@Injectable({ lifecycle, name, type })`
- `@Inject(token)` and `@Optional()` for constructor or property injection.
- `@Controller`, `@Route` generate metadata consumed by HTTP adapters.
- `@UseMiddleware`, `@RouteMiddleware`, `@GlobalMiddleware` define middleware pipelines.
- `@ForwardRefInject` plus `forwardRef(() => Class)` break circular dependencies.
- Metadata helpers: `getControllerRoutes`, `getMiddlewareMetadata`, `getActionMiddlewares`, etc.

## Observability
- `container.on(event, listener)` taps into `resolve:start|success|error`, `instantiate`, `dispose`, `stats:change`.
- `container.enableEventLogging({ includeSuccess, includeDispose, sink })` outputs trace events.
- `container.getStats()` exposes registration counts, singleton instances, and active scopes.

## Discovery Utilities
- `discover({ container, modules, filter })` performs decorator-driven discovery without file system scanning.
- Returns metadata and the discovered providers for use during bootstrap or tooling.

## API Summary
- `Container` (`register`, `resolve`, `runInScope`, `runInSession`, `createChild`, `on`, `clear`, ...)
- Decorators: `Injectable`, `Inject`, `Optional`, `ForwardRefInject`, `Controller`, `Route`, `UseMiddleware`, `RouteMiddleware`, `GlobalMiddleware`
- Module helpers: `createModule`, `registerModules`
- Utilities: `getContainer`, `resetContainer`, `discover`, `forwardRef`
- Types: `Lifecycle`, `ServiceType`, `ResolveOptions`, `ChildContainerOptions`, `ContainerStats`, `ContainerEventName`

Mark the corresponding checkbox in `docs/TODO.md` when documentation updates conclude.
