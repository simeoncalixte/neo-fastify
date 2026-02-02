
## TODO

- **Review tests and typings:** Review backend test files, verify correctness, and add/complete TypeScript typings so tests are type-safe and pass.

- **Add explicit NEO DTO/types and use across service+routes**: Create concrete NEO interfaces/DTOs and apply them in `NeoService`, schema, and routes. Targets: `backend/src/services/neo.service.ts`, `backend/src/schema/neo.schemas.ts`, `backend/src/routes/neo.ts`. (Estimate: medium)

- **Replace `any` in route handlers with Fastify generics**: Remove `as any` casts in handlers and use Fastify request/response generics. Targets: `backend/src/routes/neo.ts`, `backend/src/utils/routeHelpers.ts`. (Estimate: small)

- **Strengthen test typings and remove `as any` usages**: Update Jest tests to use typed mocks and avoid `as any`. Targets: `backend/src/**/*.test.ts`. (Estimate: medium)

- **Add frontend unit tests for hooks and components**: Add Vitest/React Testing Library tests for hooks and core components. Targets: `frontend/src/hooks/*`, `frontend/src/components/DynamicTable.tsx`. (Estimate: medium)

- **Enable stricter TypeScript settings**: Turn on `strict`/`noImplicitAny` for backend and frontend and run `tsc --noEmit` to find issues. Targets: `backend/tsconfig.json`, `frontend/tsconfig.json`. (Estimate: small)

- **Type `DynamicTable` data and add typed accessor**: Convert `DynamicTable` to a generic or concrete row type and replace `any` accessors with typed helpers. Targets: `frontend/src/components/DynamicTable.tsx`, `frontend/src/components/NEODetails.tsx`. (Estimate: medium)

- **Create shared types module for NEO shapes**: Add a small shared `types` module or package to hold NEO interfaces for reuse. Targets: `backend/src/schema/neo.schemas.ts`, `frontend/src/shared` (or similar). (Estimate: large)

- **Refactor NeoService to return typed results and explicit errors**: Ensure typed returns and explicit error handling to help callers and tests. Targets: `backend/src/services/neo.service.ts`. (Estimate: small)

- **Add CI step: run tests and `tsc --noEmit` on push**: Add CI workflow or package scripts to run tests and `tsc --noEmit`. Targets: CI config / `package.json` scripts. (Estimate: small)


