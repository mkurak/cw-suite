export interface ServerConfig {
    host: string;
    port: number;
    enableHealthCheck: boolean;
    healthCheckPath: string;
}

export type ServerOptions = Partial<ServerConfig>;

const DEFAULT_PORT = Number.parseInt(process.env.PORT ?? '', 10) || 3000;
const DEFAULT_HOST = process.env.HOST ?? '0.0.0.0';

export const defaultServerConfig: ServerConfig = {
    host: DEFAULT_HOST,
    port: DEFAULT_PORT,
    enableHealthCheck: true,
    healthCheckPath: '/health'
};

export function resolveServerConfig(options: ServerOptions = {}): ServerConfig {
    return {
        ...defaultServerConfig,
        ...options,
        port: normalizePort(options.port)
    };
}

function normalizePort(port?: number): number {
    if (port === undefined) {
        return DEFAULT_PORT;
    }

    if (Number.isNaN(port) || port <= 0 || !Number.isInteger(port)) {
        throw new Error(`Invalid port: ${port}`);
    }

    return port;
}
