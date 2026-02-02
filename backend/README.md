# NEO Backend

A Fastify-based REST API for fetching Near-Earth Object (NEO) data from NASA's API.

## Quick Start

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Environment Setup

Copy the example environment file and add your NASA API key:

```bash
cp .env.example .env
```

Edit `.env`:
```
NASA_API_KEY=your_nasa_api_key_here
NASA_API_URL=https://api.nasa.gov/
```

> Get a free API key at [https://api.nasa.gov/](https://api.nasa.gov/)

### Running the Server

**Development mode (with hot reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

The server runs at `http://localhost:3001` by default.

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /` | Welcome message and API version |
| `GET /health` | Health check |
| `GET /neo/feed?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD` | Get NEO feed for date range |
| `GET /neo/browse?page=0&size=20` | Browse all NEOs with pagination |
| `GET /neo/lookup/:id` | Get details for a specific asteroid |

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run production build |
| `npm test` | Run all tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Run ESLint |

## Documentation

For detailed documentation, see the [docs](./docs) folder:

- [Architecture Overview](./docs/architecture.md) - Application structure and design
- [API Reference](./docs/api.md) - Detailed API documentation
- [Testing Guide](./docs/testing.md) - How tests are implemented and run

## License

MIT
