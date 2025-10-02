# @cw-suite/api-queue-local

Harici broker gerektirmeden, süreç içinde çalışan kuyruk ve worker koordinasyonu. Manuel ack/nack akışı, DLQ desteği ve kapsamlı istatistikler sunar.

## Öne Çıkanlar
- **Aynı süreçte kuyruğa alma** – çoklu named queue desteği, anında teslimat.
- **Çalışan yönetimi** – her consumer için birden fazla worker örneği, paralel işleme.
- **Ack/Nack denetimi** – `ack()` ve `nack({ requeue, reason })` ile akışı kontrol edin.
- **Teslim sınırı & DLQ** – `maxDeliveries` ve `deadLetterQueue` ayarlarıyla tekrar deneme politikası.
- **Zaman aşımı** – `ackTimeout` değerleriyle onaylanmayan mesajları yeniden kuyruğa alın.
- **DI entegrasyonu** – `queueModule` ve `useQueue` ile singleton `LocalQueue` sağlayın.

## Kurulum

```bash
npm install @cw-suite/api-queue-local
```

## Hızlı Başlangıç

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

## Consumer Ayarları
```ts
queue.registerConsumer('reports', processReport, {
  instances: 4,
  autoAck: true,
  ackTimeout: 60_000,
  deadLetterQueue: 'reports.dlq'
});
```
- `instances` ile aynı handler'ın kaç worker oluşturacağını seçin.
- `autoAck: true` ise handler başarıyla bittiğinde otomatik `ack()` çağrılır.
- `ackTimeout` dolar ve mesaj `ack()` edilmezse otomatik `nack({ requeue: true, reason: 'ack-timeout' })` gerçekleşir.
- `deadLetterQueue` tanımlandıysa `maxDeliveries` sınırına ulaşan mesajlar oraya taşınır.

## Yayın Opsiyonları
```ts
const messageId = queue.publish('emails', payload, {
  messageId: 'custom-id',
  metadata: { requestId },
  maxDeliveries: 3,
  ackTimeout: 15_000
});
```
- `metadata` tüketici context'inde `message.metadata` olarak ulaşılabilir ve freeze edilir.
- `enqueuedAt` testi kolaylaştırmak için override edilebilir.

## Yönetim API'leri
- `declareQueue(name, options?)` – opsiyonel, publish/registerConsumer otomatik deklarasyon yapar.
- `pauseQueue(name)` / `resumeQueue(name)` – queue içindeki tüm consumer'lar için.
- `purgeQueue(name)` – bekleyen mesajları siler, dönen değer silinen mesaj sayısıdır.
- `deleteQueue(name)` – kuyruğu tamamen kaldırır, bekleyen/işteki mesajlar `nack` edilir.
- `getQueueStats(name)` – `messages`, `pending`, `acked`, `nacked`, `deadLettered` vb. sayaçlar.
- `listQueues()` – tanımlı tüm kuyruk adları.
- Consumer handle üzerinde `pause()`, `resume()`, `isPaused()`, `activeDeliveries()`, `stop({ drain, requeueInFlight })` fonksiyonları.

## DI Modülü ile Kullanım

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
- `queueModule` modülünü `registerModules` ile manuel ekleyebilirsiniz.
- `defaultQueue` yalnızca ilk `useQueue` çağrısında uygulanır; ikinci çağrılarda log uyarısı alırsınız.

README yenileme maddesi tamamlandığında `docs/TODO.md` üzerindeki ilgili kutucuk işaretlenmelidir.
