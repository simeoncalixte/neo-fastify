# Live NEO Frontend

Small React + Vite frontend for browsing Near Earth Object (NEO) data. This repository contains the UI, Storybook demos, and test configuration.

## Quickstart

Prerequisites:
- Node.js (>=16) and npm

Install dependencies:

```bash
npm install
```

Run development server (Vite, default port 5173):

```bash
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

Run Storybook (component demo UI, port 6006):

```bash
npm run storybook
```

Type-check and lint:

```bash
npm run type-check
npm run lint
```

Run tests:

- The repository includes `vitest` configuration. The `test` script in `package.json` is currently a placeholder. To run tests locally:

```bash
npx vitest
```

You can add a script to `package.json` like `"test": "vitest"` if you prefer `npm run test`.

## Environment

The frontend expects a backend API base URL to be provided via the Vite environment variable `VITE_API_BASE_URL`.
Create a `.env` file (not committed) or copy `.env.example` and update the value:

```text
VITE_API_BASE_URL=http://localhost:3001
```

## Project Structure (high level)

- [src/main.tsx](src/main.tsx) — app bootstrap and entrypoint
- [src/App.tsx](src/App.tsx) — top-level view switcher between Feed and Browse
- [src/components/DynamicTable.tsx](src/components/DynamicTable.tsx) — generic table renderer
- [src/components/LiveNEOFeed.tsx](src/components/LiveNEOFeed.tsx) — date-range feed UI
- [src/components/LiveNEOBrowse.tsx](src/components/LiveNEOBrowse.tsx) — paginated browse UI
- [src/components/NEODetails.tsx](src/components/NEODetails.tsx) — details panel for selected NEO
- [src/hooks/useLiveNEOFeed.ts](src/hooks/useLiveNEOFeed.ts) — fetch and flatten feed data
- [src/hooks/useLiveNEOBrowse.ts](src/hooks/useLiveNEOBrowse.ts) — fetch and paginate browse data

See `ARCHITECTURE.md` for more details on data flow and component responsibilities.

