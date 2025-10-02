/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  moduleNameMapper: {
    '^@cw-suite/api-di$': '<rootDir>/../cw.api.core.di/dist/index.js',
    '^@cw-suite/api-cache-memory$': '<rootDir>/../cw.api.core.cache.memory/dist/index.js',
    '^@cw-suite/api-events$': '<rootDir>/../cw.api.core.events/dist/index.js',
    '^@cw-suite/api-queue-local$': '<rootDir>/../cw.api.core.queue.local/dist/index.js',
    '^@cw-suite/api-db-typeorm$': '<rootDir>/../cw.api.core.db.typeorm/dist/index.js'
  },
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
  coverageDirectory: 'coverage',
  clearMocks: true
};
