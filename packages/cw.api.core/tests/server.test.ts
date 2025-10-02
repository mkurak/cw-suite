import request from 'supertest';
import { createApp } from '../src/server';
import { resolveServerConfig } from '../src/config/serverConfig';

describe('createApp', () => {
    it('exposes a health check endpoint when enabled', async () => {
        const healthCheckPath = '/ready';
        const { app } = createApp({ healthCheckPath });

        await request(app)
            .get(healthCheckPath)
            .expect(200)
            .expect('Content-Type', /json/)
            .expect({ status: 'ok' });
    });

    it('does not register a health check route when disabled', async () => {
        const { app, config } = createApp({ enableHealthCheck: false });

        await request(app).get(config.healthCheckPath).expect(404);
    });
});

describe('resolveServerConfig', () => {
    it('throws for invalid port values', () => {
        expect(() => resolveServerConfig({ port: -1 })).toThrow('Invalid port');
        expect(() => resolveServerConfig({ port: 3.14 })).toThrow('Invalid port');
    });
});
