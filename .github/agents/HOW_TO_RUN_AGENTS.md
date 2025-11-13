# 🤖 Workflow Orchestrator - Für andere Reviewer

Dieser Guide erklärt wie andere Reviewer die Feature-Verifikation reproduzierbar ausführen können.

## 🎯 Ziel

Ein **One-Command-Workflow** der:
- ✅ Code built und testet
- ✅ Screenshots mit Playwright macht
- ✅ Akzeptanzkriterien validiert
- ✅ JSON Report erstellt
- ✅ Alles committed

## 🚀 Schnellstart

### 1. Repository klonen
```bash
git clone <repo-url>
cd UI5Agency
git checkout agents
```

### 2. Dependencies installieren
```bash
npm install
```

### 3. Workflow für ein Issue ausführen
```bash
npm run agents -- --issue=1
```

Das ist alles! 🎉

## 📊 Was passiert dabei?

Der Workflow orchestriert 3 Phasen:

### Phase 1: BUILD
- ✅ TypeScript Type-Check
- ✅ ESLint
- ✅ Build der App

Wenn Build scheitert: **Workflow stoppt**, nichts anderes wird gemacht.

### Phase 2: REVIEW - Visual Verification
- ✅ Dev-Server wird gestartet
- ✅ Playwright Browser wird geöffnet
- ✅ Screenshots werden gemacht:
  - `01-home-page.png` - Startseite
  - `02-pomodoro-initial-state.png` - Timer mit 25:00
  - `03-pomodoro-running.png` - Timer läuft
  - `04-pomodoro-mobile.png` - Mobile Ansicht
- ✅ Acceptance Criteria werden validiert
- ✅ JSON Report wird erstellt

Wenn Verification scheitert: **Workflow stoppt**.

### Phase 3: COMMIT
- ✅ `git add -A`
- ✅ `git commit` mit aussagekräftiger Message
- ✅ Vollständiger Verification Report im Commit enthalten

## 📁 Output

Nach erfolgreicher Ausführung findest du:

```
state/
├── screenshots-1/           # Screenshots für Issue #1
│   ├── 01-home-page.png
│   ├── 02-pomodoro-initial-state.png
│   ├── 03-pomodoro-running.png
│   ├── 04-pomodoro-mobile.png
│   └── ...
└── visual-verification-1.json  # Verification Report (JSON)
```

## 🔍 JSON Report Struktur

```json
{
  "issue": 1,
  "timestamp": "2024-11-12T10:30:00.000Z",
  "success": true,
  "summary": "Visual verification for Issue #1 completed. 8/8 acceptance criteria passed.",
  "acceptance_criteria": [
    {
      "id": "AC1",
      "description": "Home page loads with navigation to Pomodoro Timer",
      "status": "PASS",
      "notes": "Navigation button found"
    },
    ...
  ],
  "screenshots": [
    {
      "name": "Home page with navigation button",
      "path": "/absolute/path/to/state/screenshots-1/01-home-page.png"
    },
    ...
  ],
  "console_errors": [],
  "console_warnings": [],
  "notes": "All acceptance criteria met. Ready for release."
}
```

## ⚡ Optionen

### Nur BUILD Phase
```bash
npm run agents -- --issue=1 --phase=BUILD
```

### Nur REVIEW Phase
```bash
npm run agents -- --issue=1 --phase=REVIEW
```

### Nur COMMIT Phase
```bash
npm run agents -- --issue=1 --phase=COMMIT
```

## 🐛 Troubleshooting

### "Dev server did not start"
```bash
# Manuell starten in anderen Terminal
npm start

# Dann in anderem Terminal
npm run verify:screenshots -- --issue=1
```

### "Playwright connection failed"
```bash
# Playwright binary installieren
npx playwright install chromium
npm run verify:screenshots -- --issue=1
```

### "Screenshots sind blank"
Das bedeutet normalerweise das die App nicht richtig geladen hat. Check:
- Läuft der Dev Server? (`http://localhost:8080`)
- Gibt es JavaScript Errors in der Console?
- Sind alle Dependencies installiert?

## 📋 Acceptance Criteria für Issue #1 (Pomodoro Timer)

Diese Kriterien werden automatisch validiert:

- **AC1**: Home page loads with navigation button
- **AC2**: Pomodoro Timer shows initial time display (MM:SS) and Start button
- **AC3**: Timer display shows 25:00
- **AC4**: Start button is clickable
- **AC5**: Reset button is present
- **AC6**: Responsive design works on mobile (375x667)
- **AC7**: No critical console errors
- **AC8**: Session counter is visible

## 🔒 Review Checklist

Wenn du die Verification machst, überprüfe:

- ✅ Alle Screenshots zeigen das Feature korrekt
- ✅ JSON Report zeigt `"success": true`
- ✅ Alle AC haben Status `PASS`
- ✅ Keine kritischen Console Errors
- ✅ Git Commit wurde erstellt mit detaillierter Message

## 🚀 Nächste Schritte

Nach erfolgreichem Workflow:

1. **Push zu GitHub**:
   ```bash
   git push origin agents
   ```

2. **Pull Request erstellen** mit den Screenshots als Proof

3. **Merge** wenn Reviewer approved

## 📚 Weitere Links

- `.github/agents/workflow_orchestrator.ts` - Orchestrator Source Code
- `scripts/visual-verification.ts` - Playwright Script
- `.github/agents/VISUAL_VERIFICATION_REVIEWER.md` - Detaillierte Reviewer Guidelines
- `.github/agents/VISUAL_VERIFICATION_POLICY.md` - Verifikations Policy
