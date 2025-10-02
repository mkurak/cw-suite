import request from 'supertest';

const registerModulesMock = jest.fn();
const getContainerMock = jest.fn();
const resetContainerMock = jest.fn(() => Promise.resolve());

const cacheModule = { id: 'cache-module' };
const eventsModule = { id: 'events-module' };
const queueModule = { id: 'queue-module' };
const typeOrmModule = { id: 'typeorm-module' };

jest.mock('@cw-suite/api-di', () => ({
    Container: class Container {},
    getContainer: getContainerMock,
    registerModules: registerModulesMock,
    resetContainer: resetContainerMock
}));

jest.mock('@cw-suite/api-cache-memory', () => ({
    cacheModule,
    MemoryCache: class MemoryCache {}
}));

jest.mock('@cw-suite/api-events', () => ({
    eventsModule,
    EventBus: class EventBus {}
}));

jest.mock('@cw-suite/api-queue-local', () => ({
    queueModule,
    LocalQueue: class LocalQueue {}
}));

jest.mock('@cw-suite/api-db-typeorm', () => ({
    typeOrmModule,
    TypeOrmManager: class TypeOrmManager {}
}));

import {
    resolveCoreModules,
    registerCoreModules,
    createApiApp,
    startApiServer,
    createDevRunnerConfig,
    DEFAULT_DEV_RUNNER_CONFIG
} from '../src/bootstrap';
import type { Container } from '@cw-suite/api-di';

describe('resolveCoreModules', () => {
    beforeEach(() => {
        registerModulesMock.mockClear();
        getContainerMock.mockReset();
    });

    it('includes cache and events modules by default', () => {
        const modules = resolveCoreModules();
        expect(modules).toEqual([cacheModule, eventsModule]);
    });

    it('adds optional modules when enabled', () => {
        const modules = resolveCoreModules({ queue: true, typeorm: true });
        expect(modules).toEqual([cacheModule, eventsModule, queueModule, typeOrmModule]);
    });
});

describe('registerCoreModules', () => {
    beforeEach(() => {
        registerModulesMock.mockClear();
        getContainerMock.mockReset();
        getContainerMock.mockReturnValue({ id: 'default-container' } as unknown as Container);
    });

    it('uses the provided container', () => {
        const container = { id: 'custom' } as unknown as Container;
        registerCoreModules({ container });
        expect(registerModulesMock).toHaveBeenCalledWith(container, cacheModule, eventsModule);
    });

    it('falls back to the global container when none is passed', () => {
        registerCoreModules();
        expect(getContainerMock).toHaveBeenCalledTimes(1);
        expect(registerModulesMock).toHaveBeenCalledWith(
            getContainerMock.mock.results[0].value,
            cacheModule,
            eventsModule
        );
    });

    it('registers optional modules when requested', () => {
        const container = { id: 'custom' } as unknown as Container;
        registerCoreModules({ container, queue: true, typeorm: true });
        expect(registerModulesMock).toHaveBeenCalledWith(
            container,
            cacheModule,
            eventsModule,
            queueModule,
            typeOrmModule
        );
    });
});

describe('createApiApp', () => {
    beforeEach(() => {
        registerModulesMock.mockClear();
        getContainerMock.mockReset();
        getContainerMock.mockReturnValue({ id: 'default-container' } as unknown as Container);
    });

    it('creates an Express app and registers core modules', async () => {
        const container = { id: 'custom' } as unknown as Container;
        const { app, config, container: resolvedContainer } = createApiApp({ container });

        expect(resolvedContainer).toBe(container);
        expect(registerModulesMock).toHaveBeenCalledWith(container, cacheModule, eventsModule);

        await request(app)
            .get(config.healthCheckPath)
            .expect(200)
            .expect('Content-Type', /json/)
            .expect({ status: 'ok' });
    });

    it('allows skipping automatic module registration', () => {
        const container = { id: 'custom' } as unknown as Container;
        createApiApp({ container, coreModules: false });
        expect(registerModulesMock).not.toHaveBeenCalled();
    });
});

describe('startApiServer', () => {
    beforeEach(() => {
        registerModulesMock.mockClear();
        getContainerMock.mockReset();
        getContainerMock.mockReturnValue({ id: 'default-container' });
    });

    it('starts and stops an HTTP server', async () => {
        const { server } = await startApiServer({ coreModules: false });
        await new Promise((resolve, reject) =>
            server.close((err) => (err ? reject(err) : resolve(null)))
        );
    });
});

describe('createDevRunnerConfig', () => {
    it('matches the exported default template', () => {
        expect(DEFAULT_DEV_RUNNER_CONFIG).toEqual(createDevRunnerConfig());
    });

    it('supports overrides', () => {
        const config = createDevRunnerConfig({ projectRoot: 'apps/api', logLevel: 'debug' });
        expect(config).toMatchObject({ cwd: 'apps/api', logLevel: 'debug' });
    });
});
