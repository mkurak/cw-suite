# @cw-suite/api-queue-local

In-process queue and worker orchestration without an external broker. Provides manual ack/nack control, dead-letter handling, and rich statistics.

## Highlights
- **Process-local queues** – create multiple named queues with immediate delivery.
- **Worker orchestration** – spawn several workers per consumer for parallel processing.
- **Ack/Nack control** – call `ack()` or `nack({ requeue, reason })` to steer flow.
- **Retry & DLQ** – configure `maxDeliveries` and `deadLetterQueue` for retry policies.
- **Timeouts** – `ackTimeout` automatically requeues unacknowledged messages.
- **DI integration** – `queueModule` and `useQueue` share a singleton `LocalQueue`.

## Installation

```bash
npm install @cw-suite/api-queue-local
```

## Quick Start

```ts
import { LocalQueue } from '@cw-suite/api-queue-local';

const queue = new LocalQueue({
  defaultQueue: { ackTimeout: 30_000, maxDeliveries: 5 }
});

queue.registerConsumer('emails', async (message) => {
  await sendEmail(message.payload);
  message.ack();
});

queue.publish('emails', { to: 'user@example.com' });
```

## Consumer Options
```ts
queue.registerConsumer('reports', processReport, {
  instances: 4,
  autoAck: true,
  ackTimeout: 60_000,
  deadLetterQueue: 'reports.dlq'
});
```
- `instances` controls how many workers run the same handler.
- With `autoAck: true` the consumer acknowledges after a successful handler run.
- `ackTimeout` requeues messages when they remain unacknowledged.
- `deadLetterQueue` receives messages that exceed `maxDeliveries`.

## Publish Options
```ts
const messageId = queue.publish('emails', payload, {
  messageId: 'custom-id',
  metadata: { requestId },
  maxDeliveries: 3,
  ackTimeout: 15_000
});
```
- `metadata` appears via `message.metadata` and is frozen for safety.
- Override `enqueuedAt` to simplify deterministic tests.

## Management API
- `declareQueue(name, options?)`
- `pauseQueue(name)` / `resumeQueue(name)`
- `purgeQueue(name)` – clears pending messages and returns the count.
- `deleteQueue(name)` – removes the queue, nacking any in-flight deliveries.
- `getQueueStats(name)` – exposes `messages`, `pending`, `acked`, `nacked`, `deadLettered`, etc.
- `listQueues()` – lists all queues.
- Consumer handle helpers: `pause()`, `resume()`, `isPaused()`, `activeDeliveries()`, `stop({ drain, requeueInFlight })`.

## DI Usage

```ts
import { useQueue } from '@cw-suite/api-queue-local';
import { Container } from '@cw-suite/api-di';

const container = new Container();
const queue = useQueue({
  container,
  defaultQueue: { maxDeliveries: 10 },
  configure: (instance) => instance.declareQueue('default')
});
```
- Add the module manually with `registerModules(container, queueModule)` when composing modules yourself.
- `defaultQueue` applies only during the first `useQueue` call; subsequent calls log a warning.

Update the matching TODO entry in `docs/TODO.md` after finalizing documentation.
