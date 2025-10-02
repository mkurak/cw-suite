# @cw-suite/helper-dev-runner

Dosya değişikliklerini izleyen, isteğe bağlı build komutu çalıştıran ve uygulamanızı yeniden başlatan minimal geliştirme runner'ı.

## Öne Çıkanlar
- **Tek süreçte akış** – build komutunu bekleyip ardından çalıştırma komutunu yeniden başlatır.
- **Debounce** – sık dosya değişikliklerinde gereksiz restart'ı engeller.
- **Gözlemlenebilir loglar** – standart çıktıyı kullanan yalın logger.
- **JSON konfigürasyonu** – `cw-dev-runner.config.json` ile repo kökünden yönetilir.
- **CLI veya kütüphane** – CLI'ı doğrudan kullanabilir ya da `DevRunner` sınıfını programatik olarak çağırabilirsiniz.

## Kurulum

```bash
npm install --save-dev @cw-suite/helper-dev-runner
```

## CLI Kullanımı
`package.json` script'i ekleyin:

```json
{
  "scripts": {
    "dev:w": "cw-dev-runner --config ./cw-dev-runner.config.json"
  }
}
```

Örnek `cw-dev-runner.config.json`:

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

- `buildCommand` ilk çalıştırmada senkron olarak yürütülür.
- `buildWatchCommand` watch modu açıkken arka planda çalıştırılır (opsiyonel).
- `runWithNodeWatch: true` ise Node'un yerleşik `--watch` özelliği kullanılır.
- `waitForPath` build sonrası beklenen dosyayı doğrular, yoksa zaman aşımı verir.

## Programatik Kullanım

```ts
import { loadConfig, resolveConfig, DevRunner } from '@cw-suite/helper-dev-runner';

const { config } = loadConfig(); // cw-dev-runner.config.json okur (opsiyonel)
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
| Alan | Açıklama | Varsayılan |
| --- | --- | --- |
| `projectRoot` | izleme ve komutlar için çalışma dizini | `process.cwd()` |
| `watchDirs` | izlenecek klasörler | `['src']` |
| `ignore` | yok sayılan klasörler | `['node_modules','dist','coverage','.git']` |
| `debounceMs` | restart debouncing süresi | `200` |
| `build` | isteğe bağlı build komutu | yok |
| `run` | zorunlu çalışma komutu | `node dist/index.js` |

## Dosya İzleme Davranışı
- `DirectoryWatcher` recursive olarak `watchDirs` altında değişiklik yakalar.
- Her değişiklikte runner, build komutunu (tanımlıysa) çalıştırır, ardından run komutunu yeniden başlatır.
- Eş zamanlı değişiklikler `debounceMs` ile gruplanır; ilk build bitmeden yeni build başlatılmaz.

## Log Düzeyleri
Logger `info`, `warn`, `error`, `debug` seviyelerini destekler. CLI kullanımında `logLevel` alanı, `DevRunner` sınıfında ise isteğe bağlı özel logger geçebilirsiniz.

README yenileme maddesi tamamlandığında `docs/TODO.md` üzerindeki ilgili kutucuk işaretlenmelidir.
