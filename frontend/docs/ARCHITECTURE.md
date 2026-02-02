```markdown
# Architecture

This document describes the high-level architecture and responsibilities of the main parts of the frontend.

Overview
- Tech: React + Vite + TypeScript. Storybook for component demos. Vitest for tests (configured to run story-based tests in a Playwright chromium instance).
- Purpose: provide two primary user experiences for NEO data:
  - Feed view: date-range based fetching (user selects start/end dates, feed is flattened and displayed).
  - Browse view: paginated browsing/back-end pagination.

Key concepts and data flow
- Hooks own data fetching and normalization:
  - `src/hooks/useLiveNEOFeed.ts` — calls the backend feed endpoint with `start_date`/`end_date`, flattens nested response objects into a single `items[]` array for UI.
  - `src/hooks/useLiveNEOBrowse.ts` — calls the backend browse endpoint with pagination parameters and exposes `items`, `pageInfo`, and `reload`.
- UI components compose hooks with a minimal table component:
  - `LiveNEOFeed` and `LiveNEOBrowse` obtain data from their hooks and render `DynamicTable` for lists and `NEODetails` for detail views.
  - `DynamicTable` renders rows by mapping dot-path column definitions to object values and emits row click events.

Files of interest
- `src/main.tsx` — React entrypoint that mounts the app.
- `src/App.tsx` — top-level view switcher between Feed and Browse modes.
- `src/components/LiveNEOFeed.tsx` — feed UI and controls.
- `src/components/LiveNEOBrowse.tsx` — paginated browse UI and controls.
- `src/components/NEODetails.tsx` — selected item details panel.
- `src/components/DynamicTable.tsx` — generic table used across views.
- `src/hooks/useLiveNEOFeed.ts` — feed fetch + normalization logic.
- `src/hooks/useLiveNEOBrowse.ts` — browse fetch + pagination logic.

Extension points / notes
- Server-side sorting/pagination: currently sorting happens client-side; moving sorting to the API will require the hooks to accept sort params and the backend to support them.
- Table UX: `DynamicTable` is intentionally minimal — add virtualized rendering for large datasets if needed.
- Environment config: backend base URL is injected via `VITE_API_BASE_URL`. See `README.md`.

```
