import express, { Application } from 'express';
import type { Server } from 'http';
import { resolveServerConfig, ServerConfig, ServerOptions } from './config/serverConfig';

export interface AppBundle {
    app: Application;
    config: ServerConfig;
}

export function createApp(options?: ServerOptions): AppBundle {
    const config = resolveServerConfig(options);
    const app = express();

    app.disable('x-powered-by');
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    if (config.enableHealthCheck) {
        app.get(config.healthCheckPath, (_req, res) => {
            res.status(200).json({ status: 'ok' });
        });
    }

    return { app, config };
}

export function startServer(
    options?: ServerOptions
): Promise<{ server: Server; config: ServerConfig }> {
    const { app, config } = createApp(options);

    return new Promise((resolve, reject) => {
        const server = app.listen(config.port, config.host, () => {
            resolve({ server, config });
        });

        server.on('error', (error) => {
            reject(error);
        });
    });
}
