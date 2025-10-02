import type { ColoredConsole } from '@cw-suite/helper-colored-console';
import { createCwLogger } from '@cw-suite/helper-colored-console/themes/cw';

const logger: ColoredConsole = createCwLogger({ name: 'cw-di' });

export { logger };
