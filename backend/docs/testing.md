# Testing Guide

This document explains how tests are structured and how to run them.

## Test Framework

- **Framework:** Jest 30.x
- **TypeScript Support:** ts-jest (ESM preset)
- **Test Environment:** Node.js

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (re-run on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests in CI mode (no watch, with coverage)
npm run test:ci
```

## Test File Structure

Tests are co-located with their source files using the `.test.ts` suffix:

```
src/
├── server.ts
├── server.test.ts          # Server integration tests
│
├── decorators/
│   ├── cache.ts
│   └── cache.test.ts       # Cache decorator unit tests
│
├── routes/
│   ├── neo.ts
│   ├── neo.test.ts         # Route unit tests (mocked service)
│   ├── neo.cache.test.ts   # Cache behavior tests
│   └── neo.live.test.ts    # Live API integration tests
│
└── services/
    ├── neo.service.ts
    └── neo.service.test.ts # Service unit tests
```

## Test Categories

### 1. Unit Tests (Mocked Dependencies)

Located in `*.test.ts` files, these tests mock external dependencies.

**Example: `routes/neo.test.ts`**

```typescript
// Mock the service before imports
jest.mock('../services/neo.service', () => ({
  __esModule: true,
  default: {
    NeoFeed: jest.fn(),
    getNeoBrowse: jest.fn(),
    getNeoLookUp: jest.fn(),
  }
}));

import NeoService from '../services/neo.service';
import { createServer } from '../server';

describe('NEO Routes', () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    server = await createServer({ logger: false });
    await server.ready();
  });

  afterAll(async () => {
    await server.close();
  });

  it('returns data on success', async () => {
    (NeoService as any).NeoFeed.mockResolvedValue({ /* mock data */ });
    
    const res = await server.inject({
      method: 'GET',
      url: '/neo/feed?start_date=2020-01-01&end_date=2020-01-02'
    });
    
    expect(res.statusCode).toBe(200);
  });
});
```

### 2. Server Integration Tests

Located in `server.test.ts`, these test the server's core functionality.

```typescript
describe('Server Tests', () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    server = await createServer({ logger: false });
    await server.ready();
  });

  afterAll(async () => {
    await server.close();
  });

  describe('GET /', () => {
    it('should return welcome message', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/'
      });

      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.payload);
      expect(payload.success).toBe(true);
    });
  });

  describe('404 Not Found', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/non-existent-route'
      });

      expect(response.statusCode).toBe(404);
    });
  });
});
```

### 3. Cache Integration Tests

Located in `neo.cache.test.ts`, these verify caching behavior.

Tests verify:
- Cache hits return cached data
- Cache misses call the service
- Cache invalidation works correctly
- TTL expiration functions properly

### 4. Live API Tests

Located in `neo.live.test.ts`, these test against the real NASA API.

**⚠️ These tests require:**
- Network access
- Valid NASA API key in environment
- May be slow due to external API calls

## Test Patterns

### Server Factory Pattern

All tests use the `createServer()` factory to create isolated server instances:

```typescript
import { createServer } from './server';

let server: FastifyInstance;

beforeAll(async () => {
  server = await createServer({ logger: false });
  await server.ready();
});

afterAll(async () => {
  await server.close();
});
```

### Using Fastify's `inject()` Method

Tests use Fastify's built-in `inject()` method for HTTP requests without network overhead:

```typescript
const response = await server.inject({
  method: 'GET',
  url: '/neo/browse?page=0&size=10'
});

expect(response.statusCode).toBe(200);
const body = JSON.parse(response.payload);
expect(body.success).toBe(true);
```

### Mocking with Jest

Service mocks are set up before imports using `jest.mock()`:

```typescript
jest.mock('../services/neo.service', () => ({
  __esModule: true,
  default: {
    NeoFeed: jest.fn(),
    getNeoBrowse: jest.fn(),
    getNeoLookUp: jest.fn(),
  }
}));
```

Reset mocks between tests:

```typescript
beforeEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  jest.restoreAllMocks();
});
```

## Jest Configuration

The `jest.config.cjs` file configures Jest for TypeScript ESM:

```javascript
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true, tsconfig: 'tsconfig.json' }]
  },
  extensionsToTreatAsEsm: ['.ts'],
  setupFiles: ['dotenv/config'],
  testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
  testPathIgnorePatterns: ['<rootDir>/dist/']
};
```

Key settings:
- **ESM preset:** Native ES modules support
- **dotenv/config:** Loads `.env` before tests
- **testPathIgnorePatterns:** Excludes compiled output

## Writing New Tests

### 1. Create the test file

Create `your-feature.test.ts` next to the source file.

### 2. Import test utilities

```typescript
import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals';
```

### 3. Set up mocks (if needed)

```typescript
jest.mock('./dependency', () => ({
  __esModule: true,
  default: { method: jest.fn() }
}));
```

### 4. Create server instance

```typescript
import { createServer } from '../server';

let server: FastifyInstance;

beforeAll(async () => {
  server = await createServer({ logger: false });
  await server.ready();
});

afterAll(async () => {
  await server.close();
});
```

### 5. Write test cases

```typescript
describe('Feature', () => {
  it('should do something', async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/your-endpoint'
    });
    
    expect(res.statusCode).toBe(200);
  });
});
```

## Coverage Reports

Run `npm run test:coverage` to generate coverage reports.

Reports are output to the console and can be configured to generate HTML reports in `jest.config.cjs`.

## Troubleshooting

### Tests timing out

Increase Jest's timeout in your test file:

```typescript
jest.setTimeout(30000); // 30 seconds
```

### ESM/CommonJS issues

Ensure `jest.mock()` calls are hoisted (placed before imports).

### Environment variables not loading

Check that `dotenv/config` is in `setupFiles` in `jest.config.cjs`.
