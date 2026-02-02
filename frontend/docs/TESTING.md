```markdown
# Testing

This file describes how to run and extend tests for the project.

Local testing
- Unit / component tests: the project uses `vitest`. Run tests locally with:

```bash
npx vitest
```

- The `package.json` currently has a placeholder `test` script. If you prefer `npm run test`, add or update the script to `"test": "vitest"`.

Storybook
- Storybook is used for interactive component demos. Run it with:

```bash
npm run storybook
```

- The repository has a Storybook setup with example stories in `src/stories` and `src/stories/live/Live.stories.tsx`.

Integration / browser tests
- The `vitest.config.ts` includes a project configured to run Storybook-based tests using Playwright (chromium). This allows story-driven browser tests.

Recommended CI commands
- Install deps: `npm ci`
- Type-check: `npm run type-check`
- Lint: `npm run lint`
- Run tests: `npx vitest run` (or `npm run test` after adding the script)

Adding tests
- For hooks: use `renderHook` from `@testing-library/react` or test the hook through a small component wrapper.
- For components: use `@testing-library/react` to render and query the DOM.
- For story-based tests: add stories to Storybook and create play/test files that the Storybook Vitest addon can run in a browser context.

```
