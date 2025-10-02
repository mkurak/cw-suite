# @cw-suite/api-events

Compact event bus with deterministic result pipelines. Every event is explicitly defined, mode-aware, and exposes full control through the invocation context.

## Highlights
- **Type-safe definitions** – `defineEvent` preserves payload/result generics.
- **Sync and async modes** – the `mode` field enforces the subscription contract.
- **Result piping** – subscribers share `context.result` and can mutate it via `setResult`.
- **Flow control** – `context.stop()` and `context.stopForError()` terminate the chain early while carrying error data.
- **Core lifecycle events** – observe triggers, subscriber mutations, and errors out of the box.
- **DI integration** – `eventsModule` and `useEvents` expose a shared `EventBus` inside a container.

## Installation

```bash
npm install @cw-suite/api-events
```

## Quick Start

```ts
import { EventBus, defineEvent } from '@cw-suite/api-events';

const userCreated = defineEvent<{ id: string }, { triggered: boolean }>({
  name: 'user.created',
  mode: 'async',
  description: 'Raised after a user is persisted.'
});

const bus = new EventBus();

bus.subscribe(userCreated, async (ctx) => {
  ctx.setResult({ triggered: true });
  await sendWelcomeEmail(ctx.payload.id);
});

const result = await bus.trigger(userCreated, { id: '42' });
console.log(result.result); // { triggered: true }
```

## Event Definition
- `defineEvent({ name, mode, description, metadata, createInitialResult })`
- `mode: 'sync' | 'async'` determines whether subscribers may return promises.
- `createInitialResult()` seeds the `result` value for each trigger.

## Trigger Options
```ts
await bus.trigger(userCreated, payload, {
  initialResult: { triggered: false },
  throwOnError: true,
  metadata: { requestId }
});
```
- `throwOnError: true` rethrows subscriber errors after the chain stops.
- `metadata` becomes available on `context.metadata` for every subscriber.

## Context API
`EventContext` exposes:
- `context.payload`
- `context.result`
- `context.setResult(value)`
- `context.stop(reason?)`
- `context.stopForError(error, reason?)`
- `context.hasSubscribers`

## Subscription Management
- `bus.subscribe(eventDef, handler)` returns an `unsubscribe()` helper.
- `bus.removeEvent(nameOrDef)` removes the definition and its subscribers.
- `bus.getSubscriberCount(event)` / `bus.listEvents()` surface diagnostics.

## Lifecycle Events
`CORE_EVENTS` contains internal definitions:
- `beforeTrigger`, `afterTrigger`
- `subscriberRegistered`, `subscriberRemoved`
- `subscriberError`

Internal events skip lifecycle hooks to avoid recursion.

## DI Usage

```ts
import { useEvents } from '@cw-suite/api-events';
import { Container } from '@cw-suite/api-di';

const container = new Container();
const bus = useEvents({ container });

container.runInScope('job', async () => {
  await bus.trigger(userCreated, { id: '24' });
});
```

- `eventsModule` registers a singleton `EventBus`; add it manually with `registerModules(container, eventsModule)` when necessary.

Mark the matching TODO entry once the README update is complete.
