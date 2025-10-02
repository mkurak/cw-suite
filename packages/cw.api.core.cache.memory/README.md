# @cw-suite/api-cache-memory

Bellek içi TTL cache implementation. Konsistent davranış, tag bazlı invalidation ve DI modülü ile paylaşılabilir singleton oluşturma özelliklerini sunar.

## Öne Çıkanlar
- **Deterministik TTL** – `defaultTtl` veya `set(..., { ttl })` ile süre tanımlayın; süresi dolan öğeler otomatik temizlenir.
- **Tag yönetimi** – öğeleri tag'lerle ilişkilendirin, `invalidateByTag` ile toplu temizleyin.
- **getOrSet birleştirme** – aynı anahtara yönelik eşzamanlı istekler tek factory çağrısına indirgenir.
- **Gözlemlenebilirlik** – `onEvict` callback'i, istatistikler ve `keysByTag`, `entries()` gibi yardımcılar.
- **DI entegrasyonu** – `cacheModule` ve `useCache` ile container tabanlı paylaşım.

## Kurulum

```bash
npm install @cw-suite/api-cache-memory
```

## Hızlı Başlangıç

```ts
import { MemoryCache } from '@cw-suite/api-cache-memory';

const cache = new MemoryCache<string>({ defaultTtl: 60_000 });

await cache.getOrSet('user:42', async () => {
  const profile = await loadUserFromDb('42');
  return JSON.stringify(profile);
});

cache.set('feature-flags', ['alpha'], { tags: ['config'], ttl: 5_000 });
```

## API Özeti
- `cache.set(key, value, { ttl, tags })`
- `cache.get(key)` / `cache.peek(key)` / `cache.has(key)`
- `await cache.getOrSet(key, factory, options)`
- `cache.delete(key)` / `cache.clear()` / `cache.deleteByTag(tag)`
- `cache.keys()` / `cache.keysByTag(tag)` / `cache.entries()`
- `cache.stats()` – `size`, `hits`, `misses`, `evictions`, `pending`
- `cache.configure({ defaultTtl, maxEntries, onEvict })`

### Eviction Bildirimleri
`onEvict` callback'i `key`, `value`, `reason`, `metadata` alanlarını içerir. Reason değerleri:
`expired`, `maxSize`, `manual`, `cleared`, `tag`.

### Maksimum Eleman Sayısı
`maxEntries` tanımlıysa FIFO bazlı temizleme tetiklenir. Temizleme sırasında `onEvict` çağrılır ve `reason: 'maxSize'` döner.

## DI Modülü ile Kullanım

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

- `useCache` singleton `MemoryCache` örneğini container üzerinden çözerek paylaşır.
- `cacheModule` modülünü manuel kayıt etmek için `registerModules(container, cacheModule)` kullanabilirsiniz.

## Test İpuçları
- `timeProvider` opsiyonu ile kontrollü saat (örn. Jest fake timers) sağlayın.
- `cache.stats().pending` ile devam eden `getOrSet` çağrılarını takip edin.

README yenileme maddesi tamamlandığında `docs/TODO.md` üzerindeki ilgili kutucuk işaretlenmelidir.
