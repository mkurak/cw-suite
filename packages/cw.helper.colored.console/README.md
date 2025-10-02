# @cw-suite/helper-colored-console

ANSI-aware logging helper with theme presets, name labels, and drop-in compatibility with the Node.js `console` API.

## Highlights
- **Theme driven** – assign styles per log level (`info`, `success`, `warn`, `error`, `debug`).
- **Named loggers** – emits `[service] INFO ...` style prefixes with colorized labels.
- **Adaptive color** – `detectColorSupport()` toggles output based on terminal capabilities.
- **Flexible writers** – inject custom writers to redirect output streams.
- **Ready-made cw theme** – `createCwLogger()` loads the default cw-suite palette.

## Installation

```bash
npm install @cw-suite/helper-colored-console
```

## Quick Start

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

## Theme and Style Options
- `color`, `background`: ANSI colors (`red`, `blueBright`, `gray`, ...).
- `bold`, `dim`, `italic`, `underline`: boolean style flags.

`ColoredConsoleOptions` fields:
- `name`
- `nameStyle`
- `theme`
- `enabled`
- `writer` (`{ log, info, warn, error, debug }`)

```ts
import { createCwLogger } from '@cw-suite/helper-colored-console';

const logger = createCwLogger({ name: 'worker' });
logger.success('Job finished');
```

## Helper Functions
- `applyStyle(text, style, { enabled })`
- `colorize(text, style, options)` – alias of `applyStyle`
- `detectColorSupport()` – checks terminal capabilities
- `ansi` – exposes raw escape codes

## Writer Override Example
```ts
import { createColoredConsole } from '@cw-suite/helper-colored-console';

const logger = createColoredConsole({
  writer: {
    log: (...args) => fileStream.write(args.map(String).join(' ') + '\n'),
    error: (...args) => fileStream.write('[ERR] ' + args.join(' ') + '\n')
  }
});
```

Tick the associated TODO checkbox in `docs/TODO.md` after completing documentation updates.
