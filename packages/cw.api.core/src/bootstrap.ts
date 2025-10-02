import type { Application } from 'express';
import type { Server } from 'http';
import { Container, type ModuleRef, getContainer, registerModules } from '@cw-suite/api-di';
import { cacheModule } from '@cw-suite/api-cache-memory';
import { eventsModule } from '@cw-suite/api-events';
import { queueModule } from '@cw-suite/api-queue-local';
import { typeOrmModule } from '@cw-suite/api-db-typeorm';
import { createApp } from './server';
import type { ServerConfig, ServerOptions } from './config/serverConfig';

const DEFAULT_CORE_MODULE_FLAGS = {
    cache: true,
    events: true,
    queue: false,
    typeorm: false
} as const;

export interface CoreModuleOptions {
    /** Include the in-memory cache module. Defaults to true. */
    cache?: boolean;
    /** Include the event bus module. Defaults to true. */
    events?: boolean;
    /** Include the in-process queue module. Defaults to false. */
    queue?: boolean;
    /** Include the TypeORM module. Defaults to false. */
    typeorm?: boolean;
    /** Additional modules to register alongside the defaults. */
    extras?: ModuleRef[];
}

export interface RegisterCoreModulesOptions extends CoreModuleOptions {
    /** Container instance to register modules into. Defaults to the global container. */
    container?: Container;
}

export function resolveCoreModules(options: CoreModuleOptions = {}): ModuleRef[] {
    const modules: ModuleRef[] = [];
    const {
        cache = DEFAULT_CORE_MODULE_FLAGS.cache,
        events = DEFAULT_CORE_MODULE_FLAGS.events,
        queue = DEFAULT_CORE_MODULE_FLAGS.queue,
        typeorm = DEFAULT_CORE_MODULE_FLAGS.typeorm,
        extras = []
    } = options;

    if (cache) {
        modules.push(cacheModule);
    }
    if (events) {
        modules.push(eventsModule);
    }
    if (queue) {
        modules.push(queueModule);
    }
    if (typeorm) {
        modules.push(typeOrmModule);
    }
    if (extras?.length) {
        modules.push(...extras);
    }

    return modules;
}

export function registerCoreModules(options: RegisterCoreModulesOptions = {}): Container {
    const { container = getContainer(), ...selection } = options;
    const modules = resolveCoreModules(selection);
    if (modules.length > 0) {
        registerModules(container, ...modules);
    }
    return container;
}

export interface ApiAppContext {
    app: Application;
    config: ServerConfig;
    container: Container;
}

export interface CreateApiAppOptions {
    /** Express/HTTP server configuration. */
    server?: ServerOptions;
    /** Container instance to use. Defaults to the global container. */
    container?: Container;
    /**
     * Configure which core modules should be registered. Pass `false` to skip
     * automatic registration entirely, or provide specific flags.
     */
    coreModules?: boolean | CoreModuleOptions;
    /** Additional modules to register after the core set. */
    modules?: ModuleRef[];
    /** Callback invoked after modules have been registered. */
    onContainerReady?: (container: Container) => void;
    /** Callback invoked after the Express app is created. */
    onAppCreated?: (context: ApiAppContext) => void;
}

export function createApiApp(options: CreateApiAppOptions = {}): ApiAppContext {
    const {
        server,
        container: providedContainer,
        coreModules,
        modules,
        onContainerReady,
        onAppCreated
    } = options;
    const { app, config } = createApp(server);
    const container = providedContainer ?? getContainer();

    if (coreModules !== false) {
        const selection = typeof coreModules === 'object' ? coreModules : undefined;
        registerCoreModules({ container, ...(selection ?? {}) });
    }

    if (modules?.length) {
        registerModules(container, ...modules);
    }

    onContainerReady?.(container);

    const context: ApiAppContext = { app, config, container };
    onAppCreated?.(context);

    return context;
}

export type StartApiServerOptions = CreateApiAppOptions;

export interface ApiServerContext extends ApiAppContext {
    server: Server;
}

export function startApiServer(options: StartApiServerOptions = {}): Promise<ApiServerContext> {
    const context = createApiApp(options);
    const { app, config } = context;

    return new Promise<ApiServerContext>((resolve, reject) => {
        const server = app.listen(config.port, config.host, () => {
            resolve({ ...context, server });
        });

        server.on('error', (error) => {
            reject(error);
        });
    });
}

export interface DevRunnerConfigTemplateOptions {
    projectRoot?: string;
    buildCommand?: string;
    runCommand?: string;
    waitForPath?: string;
    watch?: boolean;
    buildWatchCommand?: string;
    runWithNodeWatch?: boolean;
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

export function createDevRunnerConfig(
    options: DevRunnerConfigTemplateOptions = {}
): Record<string, unknown> {
    const distTarget = options.waitForPath ?? 'dist/server.js';
    return {
        cwd: options.projectRoot ?? '.',
        buildCommand: options.buildCommand ?? 'pnpm build',
        runCommand: options.runCommand ?? 'node dist/server.js',
        waitForPath: distTarget,
        watch: options.watch ?? true,
        buildWatchCommand: options.buildWatchCommand ?? 'pnpm build -- --watch',
        runWithNodeWatch: options.runWithNodeWatch ?? true,
        logLevel: options.logLevel ?? 'info'
    };
}

export const DEFAULT_DEV_RUNNER_CONFIG = Object.freeze(createDevRunnerConfig());
