# @cw-suite/api-events

Deterministik sonuç zinciri olan küçük ama esnek bir event bus. Her event explicit olarak tanımlanır, eşzamanlı/async mod belirlenir ve tetikleme sırasında context üzerinden kontrol sağlanır.

## Öne Çıkanlar
- **Tip güvenli event tanımı** – `defineEvent` ile payload/result generics korunur.
- **Sync & async modlar** – event tanımındaki `mode` subscriber sözleşmesini belirler.
- **Result pipe** – her subscriber aynı `context.result` üzerinde çalışır, `setResult` ile değer değiştirebilir.
- **Akış kontrolü** – `context.stop()` ve `context.stopForError()` zinciri erken bitirir, hata bilgisini taşır.
- **Çekirdek lifecycle eventleri** – tetikleme öncesi/sonrası, subscriber ekleme/çıkarma ve hata durumlarını gözlemleyin.
- **DI entegrasyonu** – `eventsModule` ve `useEvents` ile container içinde paylaşılan EventBus.

## Kurulum

```bash
npm install @cw-suite/api-events
```

## Hızlı Başlangıç

```ts
import { EventBus, defineEvent } from '@cw-suite/api-events';

const userCreated = defineEvent<{ id: string }, { triggered: boolean }>({
  name: 'user.created',
  mode: 'async',
  description: 'Fired after a user is persisted.'
});

const bus = new EventBus();

bus.subscribe(userCreated, async (ctx) => {
  ctx.setResult({ triggered: true });
  await sendWelcomeEmail(ctx.payload.id);
});

const result = await bus.trigger(userCreated, { id: '42' });
console.log(result.result); // { triggered: true }
```

## Event Tanımı
- `defineEvent({ name, mode, description, metadata, createInitialResult })`
- `mode: 'sync' | 'async'` – subscriber fonksiyonunun promise döndürüp döndüremeyeceğini belirler.
- `createInitialResult()` – her tetiklemede başlangıç `result` değerini oluşturur (opsiyonel).

## Tetikleme Seçenekleri
```ts
await bus.trigger(userCreated, payload, {
  initialResult: { triggered: false },
  throwOnError: true,
  metadata: { requestId }
});
```
- `throwOnError: true` olduğunda, subscriber hata fırlatırsa zincir durur ve hata tekrar fırlatılır.
- `metadata` değeri `context.metadata` üzerinden tüm subscriber'lara ulaşır.

## Context API
`EventContext` aşağıdaki yardımcıları sunar:
- `context.payload` – tetiklenen veriler.
- `context.result` – mutable sonuç nesnesi.
- `context.setResult(value)` – thread-safe şekilde sonucu günceller.
- `context.stop(reason?)` – kalan subscriber'ları atlar.
- `context.stopForError(error, reason?)` – hata durumunu kaydeder, zinciri durdurur.
- `context.hasSubscribers` – tetikleme anında kayıtlı subscriber var mı.

## Abonelik Yönetimi
- `bus.subscribe(eventDef, handler)` bir `unsubscribe()` fonksiyonu döndürür.
- `bus.removeEvent(nameOrDef)` – opsiyonel, tanım ve subscriber'ları tamamen temizler.
- `bus.getSubscriberCount(event)` / `bus.listEvents()` diagnostik amaçlı kullanılabilir.

## Lifecycle Eventleri
`CORE_EVENTS` sabiti aşağıdaki internal eventleri içerir:
- `beforeTrigger`, `afterTrigger`
- `subscriberRegistered`, `subscriberRemoved`
- `subscriberError`

Bu eventler `internal: true` olduğu için tekrar tetiklenirken sonsuz döngü oluşmaz.

## DI Modülü ile Kullanım

```ts
import { useEvents } from '@cw-suite/api-events';
import { Container } from '@cw-suite/api-di';

const container = new Container();
const bus = useEvents({ container });

container.runInScope('job', async () => {
  await bus.trigger(userCreated, { id: '24' });
});
```

- `eventsModule` singleton `EventBus` sağlayan bir DI modülüdür; `registerModules(container, eventsModule)` ile manuel eklenebilir.

README yenileme maddesi tamamlandığında `docs/TODO.md` üzerindeki ilgili kutucuk işaretlenmelidir.
