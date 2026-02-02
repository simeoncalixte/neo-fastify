```markdown
**Frontend Documentation**

- **Purpose:**: Frontend for browsing and live-feeding NASA NEO (Near Earth Object) data. Provides two primary UIs: Live Feed (date range) and Browse (paginated list).

**How To Run**
- **Install:**: `npm install` (run in the `frontend` folder)
- **Dev server:**: `npm run dev` (starts the app; open shown URL)
- **Build:**: `npm run build`

**Key Files**
- **Hook - Feed:**: [frontend/src/hooks/useLiveNEOFeed.ts](frontend/src/hooks/useLiveNEOFeed.ts#L1) — fetches `/neo/feed` using `start_date`/`end_date` query params; defaults to today and today-30.
- **Hook - Browse:**: [frontend/src/hooks/useLiveNEOBrowse.ts](frontend/src/hooks/useLiveNEOBrowse.ts#L1) — fetches `/neo/browse` and supports pagination.
- **Feed UI:**: [frontend/src/components/LiveNEOFeed.tsx](frontend/src/components/LiveNEOFeed.tsx#L1) — date inputs, fetch button, sorting controls, and table.
- **Browse UI:**: [frontend/src/components/LiveNEOBrowse.tsx](frontend/src/components/LiveNEOBrowse.tsx#L1) — pagination controls, sorting controls, and table.
- **Table:**: [frontend/src/components/DynamicTable.tsx](frontend/src/components/DynamicTable.tsx#L1) — small, dependency-free table rendering dot-path columns.
- **Details:**: [frontend/src/components/NEODetails.tsx](frontend/src/components/NEODetails.tsx#L1) — shows Name, Size, Closeness, Relative Velocity, and other metadata.

**Design Choices & Rationale**
- **Client-side sorting by default:**: Sorting UI is implemented client-side (in `LiveNEOFeed`/`LiveNEOBrowse`) because the NASA API does not provide flexible sorting parameters and client-side sorting is simple, fast for the typical page sizes, and avoids extra backend changes.
  - **Trade-off:** For very large datasets or when sorting by server-side computed fields, client-side sorting may be inefficient or inconsistent. If needed, move sorting into the backend (update hooks to send sort params to the server) and let the backend call upstream APIs with appropriate parameters.
- **Date inputs & format:**: `type="date"` inputs ensure browser-provided values are in `YYYY-MM-DD` format expected by backend endpoints (`start_date`/`end_date`). This reduces validation/formatting bugs.
- **Minimal table implementation:**: `DynamicTable` uses dot-paths (e.g., `close_approach_data.0.miss_distance.kilometers`) to avoid custom renderers and external table libraries. This keeps the bundle small and code straightforward.
  - **Trade-off:** Column formatting is basic; for richer UX (sorting on header clicks, column resizing, virtualized lists) integrate a table library (e.g., TanStack Table, AG Grid) later.
- **Details view:**: `NEODetails` shows the most relevant fields (name, diameter range, next close approach date, miss distance, relative velocity). This keeps the detail panel focused and useful.

**Backend Compatibility Notes**
- The frontend expects the backend `/neo/feed` to accept `start_date` and `end_date` as ISO `YYYY-MM-DD` strings (see [backend/src/routes/neo.ts](../backend/src/routes/neo.ts#L1)). Use the date inputs and the default hook behavior to ensure compatible query params.

**Testing & Validation**
- Manual testing: open Live Feed, confirm default date range is today-30 → today and the feed returns data.
- Use React DevTools to inspect `start`/`end` state in `useLiveNEOFeed`.
- Optionally add unit tests for hooks using Vitest (example tests live in `vitest.config.ts`).

**Next Steps / Improvements**
- **Server-side sorting**: implement sort query params in backend and update hooks for large datasets.
- **Table UX**: add clickable headers to `DynamicTable` for sorting indicators and accessibility improvements.
- **Validation**: add client-side validation to prevent `end < start` and limit maximum range to avoid API rate issues.
- **Performance**: virtualize long lists (e.g., `react-window`) if browse pages grow large.

If you want, I can implement server-side sorting and header-based sort indicators next.

```
