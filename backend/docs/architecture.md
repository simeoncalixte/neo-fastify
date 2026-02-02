# Architecture Overview

This document describes the structure and design of the NEO Backend application.

## Technology Stack

- **Runtime:** Node.js (ESM modules)
- **Framework:** Fastify 4.x
- **Language:** TypeScript
- **Testing:** Jest with ts-jest
- **Validation:** @sinclair/typebox (JSON Schema)

## Project Structure

```
backend/
├── src/
│   ├── index.ts              # Application entry point
│   ├── server.ts             # Fastify server factory
│   ├── server.test.ts        # Server integration tests
│   │
│   ├── config/
│   │   └── database.ts       # Database plugin stub
│   │
│   ├── decorators/
│   │   ├── cache.ts          # In-memory caching decorator
│   │   └── cache.test.ts     # Cache decorator tests
│   │
│   ├── plugins/              # Fastify plugins
│   │
│   ├── routes/
│   │   ├── neo.ts            # NEO API routes
│   │   ├── neo.test.ts       # Route unit tests (mocked)
│   │   ├── neo.cache.test.ts # Cache integration tests
│   │   └── neo.live.test.ts  # Live API integration tests
│   │
│   ├── schema/
│   │   └── neo.schemas.ts    # TypeBox JSON schemas
│   │
│   ├── services/
│   │   ├── neo.service.ts    # NASA API client
│   │   └── neo.service.test.ts
│   │
│   └── utils/
│       ├── autoRoutes.ts     # Auto route discovery
│       ├── env.ts            # Environment helpers
│       ├── handlers.ts       # Health/error handlers
│       ├── registry.ts       # Plugin registration
│       ├── requestBaseUrl.ts # Request URL utilities
│       ├── routeHelpers.ts   # Route helper functions
│       └── swagger.ts        # OpenAPI/Swagger setup
│
├── dist/                     # Compiled JavaScript output
├── jest.config.cjs           # Jest configuration
├── tsconfig.json             # TypeScript configuration
└── package.json
```

## Core Components

### Server Factory (`server.ts`)

The application uses a factory pattern for creating the Fastify instance:

```typescript
export async function createServer(options: { logger?: boolean } = {}): Promise<FastifyInstance>
```

This pattern enables:
- **Testability:** Create isolated server instances for tests
- **Configuration:** Pass different options per environment
- **Graceful shutdown:** Handles SIGINT/SIGTERM signals

### Auto Route Discovery (`utils/autoRoutes.ts`)

Routes are automatically discovered and registered from the `src/routes/` directory:

1. Scans for `.ts` files (excluding `.test.ts`)
2. Imports each module and looks for exported route functions
3. Registers routes with a prefix derived from the filename

Example: `routes/neo.ts` → registered at `/neo/*`

### Plugin Registry (`utils/registry.ts`)

Centralized registration of Fastify plugins:

- **CORS:** Cross-origin requests enabled
- **Helmet:** Security headers
- **Rate Limiting:** 100 requests/minute
- **Multipart:** File upload support (5MB limit)
- **Static Files:** Serves from `/public`
- **WebSocket:** Real-time communication support
- **Swagger:** Auto-generated API documentation

### Caching Decorator (`decorators/cache.ts`)

An in-memory caching system implemented as a route handler decorator:

```typescript
const cachedHandler = withCache({ ttl: 5 * 60 * 1000 })(handler);
```

Features:
- **Configurable TTL:** Default 5 minutes
- **Custom key generation:** Based on request URL
- **Success-only caching:** Only caches responses with `success: true`
- **Manual invalidation:** `clearCache()`, `clearCacheKey(key)`

### NEO Service (`services/neo.service.ts`)

A static class that wraps NASA's NEO API:

| Method | Description |
|--------|-------------|
| `NeoFeed(start_date, end_date)` | Fetch NEOs for a date range |
| `getNeoBrowse(page, size)` | Browse all NEOs with pagination |
| `getNeoLookUp(asteroid_id)` | Get details for a specific asteroid |

Configuration via environment variables:
- `NASA_API_KEY` - Your NASA API key
- `NASA_API_URL` - Base URL (default: `https://api.nasa.gov`)

## Request Flow

```
Request → Fastify → Route Handler → Cache Check
                                        ↓
                              [Cache Hit] → Return cached data
                              [Cache Miss] → Service → NASA API
                                                ↓
                                          Cache result ← Return response
```

## Error Handling

Routes return standardized error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

HTTP status codes:
- `400` - Bad request (missing/invalid parameters)
- `404` - Route not found
- `502` - Upstream API error

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `HOST` | Server host | `0.0.0.0` |
| `NASA_API_KEY` | NASA API key | `DEMO` |
| `NASA_API_URL` | NASA API base URL | `https://api.nasa.gov` |

### TypeScript Configuration

- **Target:** ES2022
- **Module:** ESNext (native ESM)
- **Strict mode:** Enabled
- **Output:** `dist/` directory
