# Complete Workflow Guide

Dieser Guide beschreibt wie man die verschiedenen Custom Agents kombiniert um einen vollständigen **plan → build → test → review → document → publish → branch** Workflow für GitHub Issues durchzuführen.

## Übersicht

Du hast 7 Custom Agents zur Verfügung, die zusammen einen kompletten Feature-Entwicklungs-Workflow ermöglichen:

1. **get_issues** - Holt GitHub Issues
2. **task_planner** - Erstellt Implementierungspläne
3. **build_implementer** - Implementiert Features
4. **spec_implementation_reviewer** - Reviewed Code Quality
5. **feature_documenter** - Erstellt Feature-Dokumentation
6. **task_feedback_publisher** - Postet Feedback zurück zum Issue
7. **git_commit_push** - Committed und pushed zu GitHub

## Workflow: Vollständige Feature-Implementierung

### Manueller Workflow (Schritt für Schritt)

Du kannst jeden Agent einzeln aufrufen:

```
1. Use get_issues agent to fetch open issues
   → Wähle ein Issue aus

2. Use task_planner agent with issue_number "1"
   → Erstellt specs/plan-1.md

3. Use build_implementer agent with issue_number "1"
   → Implementiert Feature gemäß Plan

4. Use spec_implementation_reviewer agent with issue_number "1"
   → Reviewed Implementierung

5. Use feature_documenter agent with issue_number "1"
   → Erstellt Dokumentation

6. Use task_feedback_publisher agent
   → Postet Feedback zum Issue

7. Use git_commit_push agent
   → Committed und pushed alle Änderungen
```

### Orchestrierter Workflow

Du kannst auch Claude bitten, alle Agents nacheinander aufzurufen:

```
"Implement Issue #1 completely - run all workflow phases"
```

Claude führt dann aus:
1. Lädt Issue-Daten
2. Erstellt Plan
3. Implementiert Feature
4. Führt Tests aus
5. Reviewed Code
6. Erstellt Dokumentation
7. Postet Feedback
8. Committed und pushed

## Workflow-Phasen im Detail

### Phase 1: PLAN

**Agent**: `task_planner`

**Input**: 
- Issue number (z.B. "1")
- Optional: spec_path

**Output**:
- `specs/plan-{issue_number}.md` - Detaillierter Implementierungsplan
- `state/workflow_state_{issue_number}.json` - Workflow State

**Was passiert**:
1. Liest GitHub Issue
2. Analysiert Requirements
3. Identifiziert betroffene Files
4. Erstellt Task-Liste
5. Definiert Acceptance Criteria

**Beispiel Plan**:
```markdown
# Implementation Plan: Issue #1 - Pomodoro Timer

## Overview
Implement a 25-minute Pomodoro timer with start/pause/reset controls

## Requirements
- Timer countdown from 25:00
- Start, Pause, Reset buttons
- Display in MM:SS format

## Implementation Tasks

### Task 1: Add Timer State to Controller
**Files**: `webapp/controller/App.controller.ts`
**Actions**:
- Add private properties: _timerInterval, _remainingTime, _isRunning
- Add getFormattedTime() method

### Task 2: Add UI Components
**Files**: `webapp/view/App.view.xml`
**Actions**:
- Add VBox with timer display
- Add HBox with control buttons

### Task 3: Write Unit Tests
**Files**: `test/unit/controller/AppControllerTest.js`
**Actions**:
- Test timer initialization
- Test start/pause/reset logic

## Acceptance Criteria
- [ ] Timer displays 25:00 on start
- [ ] Start button begins countdown
- [ ] Pause button pauses timer
- [ ] Reset button resets to 25:00
```

### Phase 2: BUILD

**Agent**: `build_implementer`

**Input**:
- Issue number
- Plan file (aus Phase 1)

**Output**:
- Implementierte Files (Controller, View, Tests)
- Git Commit mit Changes
- Updated Workflow State

**Was passiert**:
1. Liest Plan file
2. Implementiert jeden Task sequenziell
3. Schreibt Unit Tests
4. Führt Quality Checks aus:
   - `npm run ts-typecheck`
   - `npm run lint`
5. Committed Änderungen

**Quality Gates**:
- ✅ Keine TypeScript Errors
- ✅ Keine Lint Errors
- ✅ Code folgt UI5 Patterns

### Phase 3: TEST

**Integriert in BUILD Phase**

**Was getestet wird**:
1. TypeScript Compilation
2. Code Linting
3. Unit Tests (falls vorhanden)

**Bei Fehlern**:
- Auto-fix Attempt
- Retry (max 3x)
- Bei max_retries: Escalate zu User

### Phase 4: REVIEW

**Agent**: `spec_implementation_reviewer`

**Input**:
- Issue number
- Spec file
- Review screenshots dir (optional)

**Output**:
- JSON Review Report
- `state/review-results.json`

**Was reviewed wird**:
1. **Code Quality**:
   - TypeScript Type-Check
   - Lint Results
   - UI5 Pattern Compliance

2. **Spec Compliance**:
   - Alle Requirements implementiert?
   - Acceptance Criteria erfüllt?
   - Abweichungen vom Plan?

3. **Visual Validation** (für UI work):
   - Screenshots von Feature
   - UI matches Spec?

**Review Report**:
```json
{
  "success": true,
  "review_summary": "Timer implementation matches all spec requirements. Code quality is good with no TypeScript or lint errors.",
  "review_issues": [
    {
      "review_issue_number": 1,
      "issue_description": "Timer duration hardcoded. Should be constant.",
      "issue_resolution": "Extract to TIMER_DURATION_SECONDS constant",
      "issue_severity": "tech_debt"
    }
  ],
  "screenshots": [
    "/path/to/review_screenshots/01_timer_initial.png",
    "/path/to/review_screenshots/02_timer_running.png"
  ]
}
```

**Decision**:
- `success: true` → Continue zu DOCUMENT
- `success: false` → Fix Issues, retry BUILD

### Phase 5: DOCUMENT

**Agent**: `feature_documenter`

**Input**:
- Issue number
- Spec path (optional)
- Screenshot directory (optional)

**Output**:
- `app_docs/feature-{issue_number}-{slug}.md`
- Screenshots in `app_docs/assets/`

**Was dokumentiert wird**:
1. **Overview**: Was wurde gebaut, warum
2. **Technical Implementation**: Files geändert, Key Changes
3. **How to Use**: User Instructions, Developer Examples
4. **Testing**: Test Commands, Manual Testing
5. **Screenshots**: Visuelle Dokumentation

**Beispiel Dokumentation**:
```markdown
# Feature: Pomodoro Timer

**Issue**: #1
**Implemented**: 2025-11-12
**Status**: ✅ Complete

## Overview
Implemented a 25-minute Pomodoro timer with start/pause/reset controls for productivity tracking.

## What Was Built
- Timer countdown from 25:00
- Start, Pause, Reset buttons
- MM:SS format display
- Unit tests for timer logic

## How to Use

### For Users
1. Open app at http://localhost:8080
2. Click "Start" to begin timer
3. Click "Pause" to pause
4. Click "Reset" to reset to 25:00

### For Developers
```typescript
const controller = this.getView().getController();
const time = controller.getFormattedTime(); // "25:00"
```

## Screenshots
![Timer Initial](assets/feature-1-timer-initial.png)
![Timer Running](assets/feature-1-timer-running.png)
```

### Phase 6: PUBLISH

**Agent**: `task_feedback_publisher`

**Input**:
- Workflow State (liest aus state/)
- Documentation file

**Output**:
- GitHub Issue Comment mit Zusammenfassung
- Optional: Label "✅ implemented"
- `state/task-feedback-result.json`

**Was gepostet wird**:

**GitHub Comment**:
```markdown
## ✅ Implementation Complete

### 📋 Summary
Pomodoro Timer implemented with start/pause/reset controls displaying MM:SS format.

### 🎯 What Was Built
- Timer countdown from 25:00
- Start, Pause, Reset buttons
- MM:SS format display
- 5 unit tests

### 📸 Screenshots
![Timer Initial](https://github.com/.../feature-1-timer-initial.png?raw=true)
![Timer Running](https://github.com/.../feature-1-timer-running.png?raw=true)

### 📖 Full Documentation
[feature-1-pomodoro-timer.md](https://github.com/.../app_docs/feature-1-pomodoro-timer.md)

### 🧪 Testing
- TypeScript: ✅ No errors
- Lint: ✅ Clean
- Unit Tests: ✅ 5/5 passed

---
*🤖 Automated workflow feedback*
```

### Phase 7: BRANCH & COMMIT

**Agent**: `git_commit_push`

**Input**: Current git changes

**Output**:
- Git commit mit Conventional Commit format
- Push zu GitHub

**Commit Message**:
```
feat: add pomodoro timer with controls

Implements #1
```

**Final Result**:
- Feature implementiert
- Tests passing
- Dokumentiert
- Feedback gepostet
- Committed und pushed

---

## State Management

Jeder Workflow nutzt ein State File: `state/workflow_state_{issue_number}.json`

**State Tracking**:
```json
{
  "workflow_id": "issue-1",
  "issue_number": 1,
  "phase": "document",
  "status": "completed",
  "next_action": "publish",
  "plan_file": "specs/plan-1.md",
  "documentation_file": "app_docs/feature-1-pomodoro-timer.md",
  "commit_hash": "abc123def456",
  "timestamp": "2025-11-12T21:00:00Z",
  "retry_count": 0,
  "max_retries": 2
}
```

**State Transitions**:
```
init → plan → build → test → review → document → publish → done
```

**Bei Fehlern**:
```json
{
  "phase": "build",
  "status": "failed",
  "next_action": "fix",
  "error": "TypeScript compilation errors",
  "retry_count": 1
}
```

---

## Workflow-Varianten

### Nur Planning

```
Use task_planner agent with issue_number "1"
```

→ Erstellt nur Plan, keine Implementation

### Build ohne Plan

```
Use build_implementer agent with issue_number "1"
```

→ Liest Issue direkt, erstellt impliziten Plan

### Review ohne Build

```
Use spec_implementation_reviewer agent with issue_number "1"
```

→ Reviewed existierende Changes

### Nur Dokumentation

```
Use feature_documenter agent with issue_number "1"
```

→ Dokumentiert existierende Implementation

---

## Best Practices

### 1. Issue Preparation

**Gute Issue-Struktur**:
```markdown
## Description
Clear description of what to implement

## Requirements
- Requirement 1
- Requirement 2

## Technical Notes
- Use UI5 component X
- Follow pattern Y

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
```

### 2. Workflow Monitoring

**Check State**:
```bash
cat state/workflow_state_1.json
```

**Check Logs**:
```bash
git log --oneline -5
```

### 3. Error Recovery

**Bei Fehlern**:
1. Check State file für Error details
2. Fix manuell wenn nötig
3. Resume Workflow (aktuell: nächster Agent manuell aufrufen)

### 4. Quality Gates

**Vor PUBLISH Phase sicherstellen**:
- ✅ TypeScript compiles
- ✅ Linter clean
- ✅ Tests passing
- ✅ Review approved
- ✅ Documentation complete

---

## Estimated Duration

**Kompletter Workflow** (Issue → Fertige Implementation):

| Phase | Dauer |
|-------|-------|
| PLAN | 1-2 Min |
| BUILD | 3-5 Min |
| TEST | 1-2 Min |
| REVIEW | 1-2 Min |
| DOCUMENT | 1-2 Min |
| PUBLISH | 10-30 Sek |
| COMMIT | 10-30 Sek |
| **TOTAL** | **~8-15 Min** |

**Abhängig von**:
- Issue-Komplexität
- Code-Umfang
- Test-Coverage
- Manual Interventions

---

## Troubleshooting

### "Agent nicht responding"

**Lösung**: Warte 30-60 Sekunden, Agents können länger brauchen für komplexe Tasks

### "State file corrupted"

**Lösung**:
```bash
# Backup
cp state/workflow_state_1.json state/workflow_state_1.json.backup

# Fix oder delete
rm state/workflow_state_1.json
```

### "TypeScript errors persist"

**Lösung**:
```bash
# Check errors
npm run ts-typecheck

# Fix manually
# Then continue with next agent
```

### "Git push rejected"

**Lösung**:
```bash
# Pull latest changes
git pull --rebase origin main

# Retry push
git push
```

---

## Example: Full Workflow Execution

```
User: "Implement Issue #1 completely"

Claude:
"Starting complete workflow for Issue #1: Pomodoro Timer

Phase 1: PLANNING
→ Using task_planner agent
  📋 Analyzing Issue #1...
  ✅ Created specs/plan-1.md
  ✅ 5 tasks identified

Phase 2: IMPLEMENTATION
→ Using build_implementer agent
  🔨 Implementing Task 1: Timer State...
  🔨 Implementing Task 2: UI Components...
  🔨 Implementing Task 3: Unit Tests...
  ✅ 3 files modified
  ✅ TypeScript: Clean
  ✅ Lint: Clean
  ✅ Tests: 5/5 passed

Phase 3: REVIEW
→ Using spec_implementation_reviewer agent
  🔍 Reviewing code quality...
  🔍 Checking spec compliance...
  📸 Analyzing screenshots...
  ✅ No blocking issues
  ⚠️  1 tech_debt item noted

Phase 4: DOCUMENTATION
→ Using feature_documenter agent
  📚 Extracting implementation details...
  📚 Creating markdown documentation...
  ✅ Created app_docs/feature-1-pomodoro-timer.md
  ✅ Copied 2 screenshots to assets/

Phase 5: PUBLISH FEEDBACK
→ Using task_feedback_publisher agent
  📤 Generating feedback comment...
  📤 Posting to Issue #1...
  ✅ Comment posted successfully
  ✅ Label "✅ implemented" added

Phase 6: GIT COMMIT
→ Using git_commit_push agent
  🔧 Analyzing changes...
  🔧 Generating commit message...
  ✅ Committed: feat: add pomodoro timer with controls
  ✅ Pushed to GitHub

🎉 WORKFLOW COMPLETE!

Summary:
- Issue #1: Pomodoro Timer
- Duration: ~12 minutes
- Files changed: 3
- Tests added: 5
- Documentation: ✅
- Feedback posted: ✅
- Committed & pushed: ✅

View in GitHub: https://github.com/exkatibur/UI5Agency/issues/1
"
```

---

## Zukünftige Verbesserungen

**Mögliche Erweiterungen**:
1. Automatische Branch Creation vor BUILD
2. Automatische PR Creation nach PUBLISH
3. Integration mit CI/CD Pipelines
4. Slack/Discord Notifications
5. Automatic Retry mit exponential backoff

---

**Dieser Guide beschreibt wie die verschiedenen Agents zusammenarbeiten. Da Agents sich nicht gegenseitig aufrufen können, orchestriert Claude (oder du manuell) die sequenzielle Ausführung.** 🚀
