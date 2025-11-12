<!-- .github/copilot-instructions.md - guidance for AI coding agents working on this repo -->
# Quick orientation for AI coding assistants

Below is a concise, high-value orientation for working in this repo. For full detail see `README.md` and `step-by-step.md` (they document the TypeScript + UI5 setup). This short guide highlights the immediate facts an AI agent needs to be productive:

- Repo: OpenUI5 (UI5) single-page app written in TypeScript. Edit sources under `webapp/`. Do not modify `dist/` (generated).
- Tooling: TypeScript is transpiled on-the-fly by `ui5-tooling-transpile` (configured in `ui5.yaml`) and converted to UI5 modules by a Babel plugin. Respect this pipeline for local dev and CI.
- Tests: unit tests in `test/unit/`; OPA/integration in `test/integration/` (OPA pages extend `Opa5`, journeys call page methods directly).

This file below contains additional examples and expanded guidance.

## Big picture
- Frontend-only UI5 application (OpenUI5) written in TypeScript. Key files:
  - `webapp/Component.ts` — UI5 Component, sets content density and bootstrapping details.
  - `webapp/manifest.json` — app metadata, `sap.ui5.rootView` and library dependencies.
  - `webapp/index.html` — UI5 bootstrap configuration (resource roots, themes).
  - `webapp/controller/*.ts`, `webapp/view/*.xml` — typical MVC structure used by UI5.
- TypeScript sources are kept in `webapp/` and are transpiled on-the-fly by `ui5-tooling-transpile` (configured in `ui5.yaml`) for local dev and by `ui5 build` for production output (placed in `dist/`).

## Fast developer workflows (scripts you will use)
- npm install: `npm install`
- Dev server (live TS transpile + reload): `npm start` (runs `ui5 serve`, serves app at http://localhost:8080)
- Build (dev/prod): `npm run build` and `npm run build:opt` (output → `dist/`)
- Run built app: `npm run start:dist`
- Type-check: `npm run ts-typecheck` (runs `tsc --noEmit`)
- Lint: `npm run lint` (ESLint targets `webapp`)
- Tests: `npm run test-runner` (headless); full test (lint + ui5 tests): `npm test`

Note: to run integration tests locally the pattern is: start dev server (`npm start`) then open `http://localhost:8080/test/testsuite.qunit.html` or run `ui5-test-runner --url http://localhost:8080`.

## Project-specific conventions & gotchas
- TypeScript is transpiled on-the-fly by `ui5-tooling-transpile` configured in `ui5.yaml`. Don't bypass the middleware when testing locally.
- tsconfig path alias maps `ui5/typescript/helloworld/*` → `./webapp/*`. Use these aliases for new modules to match imports in the codebase.
- UI5-style module strings are used (e.g. `sap/ui/core/Controller`) — follow existing import patterns in `webapp/controller/*`.
- When accessing component helpers, cast owner component: const comp = this.getOwnerComponent() as Component; comp.getContentDensityClass(); — see `webapp/controller/App.controller.ts`.

## Tests & integration points
- OPA pages extend `Opa5` and live under `test/integration/pages/` — journeys call page methods directly (no Given/When/Then wrappers).
- Headless CI uses `ui5-test-runner`; it expects a running app unless you use the `--start` helper.

## Where not to edit
- Never edit files under `dist/` (generated output). Make source changes under `webapp/` and run `npm run build`.
- Avoid modifying `ui5.yaml` and the configured TypeScript middleware unless you understand the toolchain impact.

## Files to read first (order matters)
1. `package.json` — scripts and devDependencies
2. `ui5.yaml` — custom tasks/middleware (TypeScript transpile)
3. `tsconfig.json` — path aliases and compiler options
4. `webapp/Component.ts`, `webapp/index.html`, `webapp/manifest.json` — bootstrapping
5. `webapp/controller/*`, `webapp/view/*` — app logic and UI patterns

## Quick examples to mirror style
- Controller method pattern: import UI5 modules with module strings, extend `Controller`, cast owner component when calling app helpers (see `webapp/controller/App.controller.ts`).
- Add tests under `test/unit` (QUnit) following `test/unit/controller/App.qunit.ts`.

If any of these items are unclear or you want this expanded into examples (e.g., a sample controller + test), tell me which area to expand and I will iterate.
