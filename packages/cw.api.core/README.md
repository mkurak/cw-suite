# @cw-suite/api-core

Minimal Express 5 başlangıç katmanı. `createApp` ve `startServer` yardımcıları; JSON gövde işleme, sağlık kontrolü ve yapılandırılabilir host/port ayarlarını tek pakette toplar.

## Öne Çıkanlar
- **Sıfır eşik** – tek satırla Express uygulaması oluşturup port dinlemeye hazır hale getirir.
- **Sağlık kontrolü** – `/health` rotası varsayılan olarak açık, kapanabilir veya farklı bir path ile yeniden yapılandırılabilir.
- **Deterministik yapılandırma** – `ServerOptions` ile port/host ayarları yapılır, env değişkenleri (`PORT`, `HOST`) otomatik okunur.
- **Test dostu** – `createApp` salt Express instance döndürür; SuperTest gibi araçlarla kolayca test edilir.

## Kurulum

```bash
npm install @cw-suite/api-core
```

## Hızlı Başlangıç

```ts
import { createApp, startServer } from '@cw-suite/api-core';

const { app } = createApp({ port: 4000 });

app.get('/users/:id', async (req, res) => {
  const user = await loadUser(req.params.id);
  res.json(user);
});

await startServer({ port: 4000 });
```

- `createApp` Express örneğini ve uygulanmış yapılandırmayı döndürür.
- `startServer` aynı yapılandırmayı kullanarak HTTP sunucusunu başlatır ve `{ server, config }` döner.

## Yapılandırma
`ServerOptions`, `ServerConfig` arayüzlerini kullanarak davranışı kontrol edebilirsiniz:

| Seçenek | Açıklama | Varsayılan |
| --- | --- | --- |
| `host` | `app.listen` tarafından kullanılacak adres | `process.env.HOST ?? '0.0.0.0'` |
| `port` | Dinlenecek port. Geçersiz değerler hata fırlatır. | `Number(process.env.PORT) || 3000` |
| `enableHealthCheck` | Health check rotasını aktif/pasif eder | `true` |
| `healthCheckPath` | Sağlık kontrolü rotasının yolu | `/health` |

Programatik olarak varsayılanları görmek veya birleştirmek için:

```ts
import { defaultServerConfig, resolveServerConfig } from '@cw-suite/api-core';

const custom = resolveServerConfig({ port: 8080, enableHealthCheck: false });
console.log(defaultServerConfig, custom);
```

## Sağlık Kontrolü
- `enableHealthCheck` `true` iken `GET <healthCheckPath>` isteği `{ status: 'ok' }` yanıtı üretir.
- Route içindeki handler ihtiyaç halinde genişletilebilir, örneğin dış servis kontrollerini entegre etmek için `createApp` sonrasında middleware ekleyebilirsiniz.

```ts
const { app, config } = createApp();
app.get(config.healthCheckPath, async (_req, res) => {
  const dbHealthy = await pingDatabase();
  res.status(dbHealthy ? 200 : 503).json({ status: dbHealthy ? 'ok' : 'degraded' });
});
```

## Test Senaryoları
`createApp` dönen Express instance'ı ile SuperTest kullanımı:

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

## API Özeti
- `createApp(options?) => { app, config }`
- `startServer(options?) => Promise<{ server, config }>`
- `defaultServerConfig`
- `resolveServerConfig(options)`

README yenileme maddesi tamamlandığında `docs/TODO.md` üzerindeki ilgili kutucuk işaretlenmelidir.
