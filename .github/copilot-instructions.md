<!-- .github/copilot-instructions.md - guidance for AI coding agents working on this repo -->
# Quick orientation for AI coding assistants

This repository is a TypeScript UI5 single-page application. The source lives in `webapp/` and is transpiled at serve/build time by the UI5 tooling. Below are the minimal, high-value facts and examples an AI assistant needs to be effective.

## Big picture
- Frontend-only UI5 application (OpenUI5) written in TypeScript. Key files:
  - `webapp/Component.ts` — UI5 Component, sets content density and bootstrapping details.
  - `webapp/manifest.json` — app metadata, `sap.ui5.rootView` and library dependencies.
  - `webapp/index.html` — UI5 bootstrap configuration (resource roots, themes).
  - `webapp/controller/*.ts`, `webapp/view/*.xml` — typical MVC structure used by UI5.
- TypeScript sources are kept in `webapp/` and are transpiled on-the-fly by `ui5-tooling-transpile` (configured in `ui5.yaml`) for local dev and by `ui5 build` for production output (placed in `dist/`).

## Local development & build commands (from `package.json`)
- Install: `npm install`
- Dev server (live transpile+reload): `npm start` (runs `ui5 serve` on port 8080)
- Dev server with coverage instrumentation: `npm run start-coverage` (uses `ui5-coverage.yaml`)
- Build (unoptimized): `npm run build` → output in `dist/`
- Build (optimized, self-contained): `npm run build:opt`
- Start the built `dist` package: `npm run start:dist`
- Type check: `npm run ts-typecheck` (runs `tsc --noEmit`)
- Lint: `npm run lint` (eslint on `webapp`)
- Test runner (headless): `npm run test-runner` (or `npm run test-runner-coverage` for coverage)
- Full test (lint + ui5 tests): `npm test`

When running tests locally the pattern is: 1) start the dev server (`npm start`) and 2) open the tests at `http://localhost:8080/test/testsuite.qunit.html` or use `ui5-test-runner` which accepts the `--url` of the running app.

## Important structural and tooling details to preserve
- Transpilation: `ui5-tooling-transpile` is configured as both a build task and middleware in `ui5.yaml`. Changes to TypeScript -> JS transformation should respect this tooling and the Babel plugin used for UI5 module conversion.
- Module naming / resource roots: the app uses the namespace `ui5.typescript.helloworld` (see `webapp/index.html` and `manifest.json`). Use that namespace when generating module paths.
- Type support: project uses `@types/openui5` and `tsconfig.json` includes `webapp` as `rootDir`; imports often use UI5-style module strings like `sap/ui/core/UIComponent`.
- tsconfig path aliases: `paths` map `ui5/typescript/helloworld/*` → `./webapp/*`. Prefer respecting these aliases when adding new imports.

## Testing conventions & examples
- Unit tests and OPA tests live under `test/` with `integration/` and `unit/` subfolders. OPA pages are classes extending `Opa5` (see `test/integration/pages/*`) and journeys call page methods directly (no Given/When/Then wrappers). This repo follows the pattern described in `README.md`.
- Use `ui5-test-runner` for CI-style headless runs; it expects a running app (passed via `--url`) unless you use the `--start` helper in scripts.

## Small code examples to mirror project style
- Adding a controller method should follow the pattern in `webapp/controller/App.controller.ts`:
  - import UI5 modules with module strings, extend the UI5 `Controller` class, cast `this.getOwnerComponent()` to the app `Component` when accessing helper methods like `getContentDensityClass()`.
- When changing boot/manifest settings, prefer edits to `webapp/manifest.json` and `webapp/index.html` over ad-hoc edits to built `dist` output.

## Where agents should try to avoid changes
- Do not change generated build outputs in `dist/` directly. Make source edits in `webapp/` and use `npm run build` to produce `dist/`.
- Avoid editing the `ui5.yaml` builder/middleware settings unless the change is explicitly required — this file controls the TypeScript middleware and build task.

## Files to read first when asked to implement features
- `package.json` — scripts and devDependencies (quick way to see build/test commands)
- `ui5.yaml` — reveal customTasks and middleware used for live transpile
- `webapp/Component.ts`, `webapp/manifest.json`, `webapp/index.html` — bootstrapping and naming
- `tsconfig.json` — path aliases and compilation options
- `webapp/controller/*`, `webapp/view/*` — existing app logic and patterns

## Example assistant workflow for a change
1. Run `npm install` locally (if needed).
2. Start dev server: `npm start` and verify app loads at `http://localhost:8080/index.html`.
3. Make source edits in `webapp/`.
4. Run `npm run ts-typecheck` and `npm run lint` locally.
5. Run tests: `npm run test-runner` (headless) or open `/test/testsuite.qunit.html` in browser.

---

# 🧼 Clean Code Prinzipien

- Verwende sprechende, präzise Benennungen für Variablen, Funktionen, Klassen und Dateien.
- Bevorzuge Funktionsnamen statt erklärender Kommentare.
- Keine Abkürzungen, außer allgemein bekannte (z. B. `id`, `url`, `db`).
- CamelCase für Variablen, Parameter, Funktionen; PascalCase für Klassen.
- Keine ungarische Notation (z. B. `strName`, `intCount`).
- Dateinamen einheitlich (camelCase.ts oder kebab-case.ts).
- Funktionen kurz und fokussiert halten – eine Aufgabe pro Funktion.
- Strukturierter Code mit Wiederverwendung durch Klassen und Hilfsfunktionen.
- Keine Magic Numbers oder Strings – nutze Konstanten.
- Tabs als 2 Spaces, auch in XML Views.
- **Keine JSDoc-Kommentare. Stattdessen selbsterklärender Code.**
- **Keine Kommentare. Stattdessen selbsterklärender Code.**

# ⚙️ Moderne JavaScript / TypeScript Praktiken

- Neue Module bevorzugt in TypeScript.
- In JavaScript-Dateien: native JS verwenden, außer wenn TS explizit gewünscht ist.
- Nutze moderne Sprachfeatures: `async/await`, `const`, `let`, `?.`, `??`.
- Vermeide `var`, klassische `function`-Deklarationen, Callback-Hell.
- Nutze ES6-Module (`import/export`).
- Verwende `map`, `filter`, `reduce`, wenn lesbar und sinnvoll.

# 🧾 JSON & Konfiguration

- Strukturierte, saubere JSON-Dateien mit 2-Spaces-Indentation.
- Konsistente, sprechende Schlüssel (z. B. `businessPartnerId` statt `bpId`).

# 🎨 UI5 / Fiori Elements

- Einhaltung des MVC-Prinzips.
- IDs von UI-Elementen sollen deren Funktion widerspiegeln.
- XML Views bevorzugt für Layouts.
- Controller enthalten keine Geschäftslogik – diese wird ausgelagert.
- Klare Trennung zwischen View-Logik, Steuerung und Businesslogik.
- Formatierung auch in XML: Tabs = 2 Spaces.

# 🧪 Tests

- Testdateien für alle Entitäten bereitstellen oder automatisch generieren.
- Testcode aktuell halten und bei Bedarf automatisch aktualisieren.

# 🚀 Workflow & Quality Gates

## Visual Verification ist MANDATORY

**KEIN Feature darf eingecheckt werden**, ohne dass:
1. ✅ Die App wurde mit Playwright/Browser gestartet
2. ✅ Screenshots der Implementierung wurden gemacht (mindestens 3-5)
3. ✅ Der Reviewer hat die Screenshots mit eigenen Augen geprüft
4. ✅ Alle Acceptance Criteria wurden visuell validiert
5. ✅ JSON Report mit Screenshot-Pfaden liegt vor

## Automated Workflow Phasen

```
Phase 1: BUILD
  ✅ TypeScript Type-Check
  ✅ ESLint
  ✅ Build der App
  → Falls FAIL: Stopp

Phase 2: REVIEW (Visual Verification mit Playwright)
  ✅ Dev-Server starten
  ✅ Playwright Screenshots machen
  ✅ Acceptance Criteria validieren
  ✅ JSON Report erstellen
  → Falls FAIL: Stopp

Phase 3: COMMIT
  ✅ git add -A
  ✅ git commit mit vollständigem Report
  ✅ Nur wenn Phase 2 PASSED
```

## Wie Reviewer den Workflow ausführt

```bash
npm install
npm run agents -- --issue=1
```

Das ist alles – der Rest ist vollautomatisch! 🎯

## Wichtige Agent-Dateien

- `scripts/visual-verification.ts` — Standalone Playwright Automation für Screenshots + AC Validation
- `.github/agents/workflow_orchestrator.js` — Main Orchestrator (BUILD → REVIEW → COMMIT)
- `.github/agents/HOW_TO_RUN_AGENTS.md` — Dokumentation für andere Reviewer
- `.github/agents/VISUAL_VERIFICATION_POLICY.md` — Verifikations-Rules
- `.github/copilot-instructions.md` — Diese Datei (wird bei jedem Prompt beachtet!)

---
If anything above is unclear or you want additional examples (e.g., how OPA pages are structured, or common UI5 class extension patterns in TypeScript), tell me which area to expand and I will iterate.
