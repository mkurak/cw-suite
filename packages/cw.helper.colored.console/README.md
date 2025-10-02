# @cw-suite/helper-colored-console

ANSI renk destekli minimal log aracı. Tema tanımları, isim etiketleri ve Node.js native `console` uyumluluğu sağlar.

## Öne Çıkanlar
- **Tema tabanlı** – log seviyeleri için renk/stil eşlemesi (`info`, `success`, `warn`, `error`, `debug`).
- **İsimlendirilmiş logger** – `[service] INFO ...` formatı, renkli başlıklarla.
- **Adaptif renk** – `detectColorSupport()` terminal yeteneklerine göre otomatik aç/kapat.
- **Esnek çıktı** – custom writer objeleri ile stdout yerine farklı hedeflere yönlendirin.
- **Hazır cw teması** – `createCwLogger()` cw-suite varsayılan renk paletini yükler.

## Kurulum

```bash
npm install @cw-suite/helper-colored-console
```

## Hızlı Başlangıç

```ts
import { createColoredConsole } from '@cw-suite/helper-colored-console';

const logger = createColoredConsole({
  name: 'api',
  theme: {
    info: { color: 'cyan' },
    error: { color: 'red', bold: true }
  }
});

logger.info('Server starting...');
logger.error('Unhandled exception', new Error('boom'));
```

## Tema ve Stil Seçenekleri
- `color`, `background`: ANSI renk anahtarları (`red`, `blueBright`, `gray`...).
- `bold`, `dim`, `italic`, `underline`: boolean stil bayrakları.
- `ColoredConsoleOptions`
  - `name`: logger etiketi
  - `nameStyle`: isim etiketi için stil
  - `theme`: seviye -> stil haritası
  - `enabled`: renk kullanımını zorla/aç
  - `writer`: `{ log, info, warn, error, debug }` metodları olan custom hedef

```ts
import { createCwLogger } from '@cw-suite/helper-colored-console';

const logger = createCwLogger({ name: 'worker' });
logger.success('Job finished');
```

## Yardımcı Fonksiyonlar
- `applyStyle(text, style, { enabled })`
- `colorize(text, style, options)` – `applyStyle` alias'ı.
- `detectColorSupport()` – terminalde renk kullanımı mümkün mü.
- `ansi` – raw escape kodlarını içeren nesne (ileri seviye kullanım).

## Writer Override Örneği
```ts
import { createColoredConsole } from '@cw-suite/helper-colored-console';

const logger = createColoredConsole({
  writer: {
    log: (...args) => fileStream.write(args.map(String).join(' ') + '\n'),
    error: (...args) => fileStream.write('[ERR] ' + args.join(' ') + '\n')
  }
});
```

README yenileme maddesi tamamlandığında `docs/TODO.md` üzerindeki ilgili kutucuk işaretlenmelidir.
