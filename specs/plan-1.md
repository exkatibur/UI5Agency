# Implementation Plan: Issue #1 - Pomodoro Timer

**Created**: 2025-11-12T00:00:00Z
**Source**: GitHub Issue #1
**Project**: UI5Agency
**Priority**: Medium
**Labels**: enhancement, good-first-issue

---

## Issue Summary

Implementiere einen einfachen Pomodoro Timer in der UI5Agency App mit folgenden Features:
- Timer mit 25 Minuten Countdown
- Start, Pause, Reset Buttons
- Visuelle Anzeige der verbleibenden Zeit (MM:SS Format)
- Einfacher Session Counter (wie viele Pomodoros abgeschlossen)
- Optional: Sound/Notification wenn Timer abläuft
- Keine Backend-Integration - alles Frontend only

## Acceptance Criteria

- [ ] Timer startet bei 25:00 Minuten
- [ ] Start Button startet den Countdown
- [ ] Pause Button hält den Timer an
- [ ] Reset Button setzt auf 25:00 zurück
- [ ] Timer Display aktualisiert sich jede Sekunde
- [ ] Session Counter erhöht sich bei Completion
- [ ] UI ist responsive und sieht gut aus

---

## Implementation Approach

### High-Level Strategy

**Architecture Pattern**: MVC mit UI5 Controls
- **Model**: Timer-Logik und State im Controller
- **View**: XML-basierte UI mit sap.m Controls
- **Controller**: Geschäftslogik (Timer, Counter, State Management)

**Technology Stack**:
- TypeScript für Type-Safety
- UI5 Framework für UI-Komponenten
- setInterval für Timer-Mechanism
- localStorage (optional) für Session Persistence

### Architecture Considerations

1. **Timer Logic**:
   - State-Variablen: `_totalSeconds`, `_remainingSeconds`, `_isRunning`
   - setInterval für 1-Sekunden-Ticks
   - Formatter für MM:SS Display

2. **Session Counter**:
   - localStorage Key: `pomodoro_sessions`
   - Increment bei Timer Completion (0 Sekunden erreicht)
   - Display im View

3. **UI Responsiveness**:
   - Große, gut lesbare Timer-Anzeige (sap.m.Text)
   - Button States: Start/Pause toggle
   - Counter Display unten oder oben

4. **Optional Enhancements** (Phase 2):
   - Sound Notification (Audio API)
   - Visual Alert (farb-Änderung)
   - Notification API (Browser notification)

---

## Files to Modify/Create

### 1. `webapp/controller/PomodoroTimer.controller.ts` (NEW)
**Purpose**: Timer Geschäftslogik und State Management
**Key Methods**:
- `onInit()`: Initialisiere Timer-State
- `onStartPause()`: Toggle zwischen Start und Pause
- `onReset()`: Zurücksetzen auf 25:00
- `_updateDisplay()`: Formatiere Zeit und Update View
- `_decrementTimer()`: Dekrementiere Sekunden
- `_formatTime(seconds)`: Konvertiere zu MM:SS
- `_loadSessionCount()`: Lade Count aus localStorage
- `_saveSessionCount()`: Speichere Count in localStorage

### 2. `webapp/view/PomodoroTimer.view.xml` (NEW)
**Purpose**: Timer UI-Komponenten
**Components**:
- `sap.m.VBox` - Container für vertikales Layout
- `sap.m.Text` - Timer Display (große Schrift, zentral)
- `sap.m.HBox` - Button Container
- `sap.m.Button` - Start/Pause Button
- `sap.m.Button` - Reset Button
- `sap.m.Text` - Session Counter Display

### 3. `webapp/manifest.json` (MODIFY)
**Changes**:
- Registriere neue Route für Pomodoro Timer View
- Beispiel: `routes: { { pattern: "pomodoro", ... } }`

### 4. `test/unit/controller/PomodoroTimer.qunit.ts` (NEW)
**Purpose**: Unit Tests für Timer-Logik
**Test Suites**:
- Timer Initialization
- Start/Pause/Reset Funktionalität
- Time Formatting (MM:SS)
- Session Counter Logic
- localStorage Integration

### 5. `test/integration/pages/PomodoroPage.ts` (NEW)
**Purpose**: OPA Integration Tests
**Test Journeys**:
- User startet Timer und sieht Countdown
- User pausiert Timer
- User setzt Timer zurück
- Session Counter erhöht sich

### 6. `webapp/view/App.view.xml` (OPTIONAL MODIFY)
**Changes** (falls Pomodoro als Feature in Hauptview):
- Navigation zum Pomodoro Timer hinzufügen
- ODER: Pomodoro als Separate View/Route

---

## Step-by-Step Implementation Tasks

### Task 1: Erstelle Timer Controller
**File**: `webapp/controller/PomodoroTimer.controller.ts`
**Subtasks**:
1. Import UI5 Modules: `Controller`, `Device`
2. Definiere Controller Klasse mit Private Members:
   - `_totalSeconds = 25 * 60` (1500 seconds)
   - `_remainingSeconds = 1500`
   - `_isRunning = false`
   - `_sessionCount = 0`
   - `_intervalId = null`
3. Implementiere `onInit()`:
   - Lade sessionCount aus localStorage
   - Initialisiere Timer Display
4. Implementiere `onStartPause()`:
   - Toggle `_isRunning`
   - Start/Stop setInterval
   - Update Button Text
5. Implementiere `onReset()`:
   - Stop Timer wenn läuft
   - Reset `_remainingSeconds = 1500`
   - Reset Button State
   - Update Display
6. Implementiere `_updateDisplay()`:
   - Format Time: `_formatTime(_remainingSeconds)`
   - Setze Text Control
7. Implementiere `_decrementTimer()`:
   - Dekrementiere `_remainingSeconds`
   - Wenn 0 erreicht: Stop Timer, Increment Counter, Optional: Play Sound
8. Implementiere `_formatTime(seconds)`:
   - Berechne Minutes: `Math.floor(seconds / 60)`
   - Berechne Sekunden: `seconds % 60`
   - Return: `MM:SS` String
9. Implementiere localStorage Methods

**Dependencies**: 
- sap/ui/core/mvc/Controller
- sap/ui/model/json/JSONModel

---

### Task 2: Erstelle Timer View
**File**: `webapp/view/PomodoroTimer.view.xml`
**Subtasks**:
1. Root: `mvc:View` mit Controller-Name
2. Content:
   - VBox (center, full size):
     - Text "Pomodoro Timer" (Header)
     - Text Timer Display (große Schrift, id="timerDisplay")
     - HBox (Buttons):
       - Button "Start/Pause" (id="startPauseBtn", press=".onStartPause")
       - Button "Reset" (id="resetBtn", press=".onReset")
     - Text Session Counter (id="sessionCounter")

**CSS Classes** (falls Custom Styling):
- Timer Font Size: 3-4em
- Timer Color: Auffällig (z.B. teal)
- Button Spacing: Margin zwischen Buttons

---

### Task 3: Konfiguriere Routing/Navigation
**File**: `webapp/manifest.json`
**Subtasks**:
1. Bestimme ob Pomodoro-Timer als:
   - Route in existierender Navigation OR
   - Separate Seite OR
   - Component der Haupt-App
2. Registriere Route falls Routing:
   ```json
   "routes": [
     {
       "pattern": "pomodoro",
       "name": "pomodoroTimer",
       "target": "pomodoroTimer"
     }
   ]
   ```
3. Definiere Target:
   ```json
   "targets": {
     "pomodoroTimer": {
       "viewType": "XML",
       "transition": "slide",
       "clearControlAggregation": false,
       "viewName": "ui5/typescript/helloworld/view/PomodoroTimer"
     }
   }
   ```

---

### Task 4: Unit Tests schreiben
**File**: `test/unit/controller/PomodoroTimer.qunit.ts`
**Test Cases**:
1. Timer Initialization:
   - Assert: `_remainingSeconds === 1500`
   - Assert: `_isRunning === false`
   - Assert: Session Count geladen

2. Start Timer:
   - Call: `onStartPause()`
   - Assert: `_isRunning === true`
   - Assert: setInterval wurde aufgerufen

3. Time Decrement:
   - Simulate: 1 Sekunde verstrichen
   - Assert: `_remainingSeconds === 1499`
   - Assert: Display aktualisiert zu "24:59"

4. Pause Timer:
   - Call: `onStartPause()` while running
   - Assert: `_isRunning === false`
   - Assert: setInterval cleared

5. Reset Timer:
   - Call: `onReset()`
   - Assert: `_remainingSeconds === 1500`
   - Assert: Display = "25:00"

6. Timer Completion:
   - Simulate: Countdown bis 0
   - Assert: `_sessionCount` incremented
   - Assert: Timer stopped

7. Time Formatting:
   - Test: 1500 seconds → "25:00"
   - Test: 125 seconds → "02:05"
   - Test: 5 seconds → "00:05"

8. localStorage:
   - Save und Load Session Count
   - Assert: Persist across Reloads

---

### Task 5: Integration Tests
**File**: `test/integration/pages/PomodoroPage.ts` + Journey
**Test Journey**:
1. Navigiere zu Pomodoro Timer
2. Verify Timer zeigt "25:00"
3. Click "Start/Pause" Button
4. Wait 3 Sekunden
5. Verify Timer zeigt "24:57"
6. Click "Start/Pause" again (Pause)
7. Wait 1 Sekunde
8. Verify Timer noch "24:57" (nicht weitergezählt)
9. Click "Reset"
10. Verify Timer zeigt "25:00"
11. Session Counter = 0

---

## Implementation Order

**Priority 1 (MVP)**:
1. Task 1: Timer Controller (Grundlogik)
2. Task 2: Timer View (UI)
3. Task 3: Routing (Navigation)

**Priority 2 (Tests)**:
4. Task 4: Unit Tests
5. Task 5: Integration Tests

**Priority 3 (Polish - Optional)**:
- Add Sound Notification
- Add CSS Styling/Animations
- Add Persisted Themes

---

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|-----------|
| setInterval Cleanup | Medium | Store intervalId, clear on destroy |
| localStorage Unavailable | Low | Try-catch, fallback to runtime-only state |
| Time Formatting Bugs | Low | Comprehensive test cases |
| UI5 Binding Issues | Low | Use JSONModel und Two-Way Binding |
| Browser Notification Permission | Low | Try-catch, optional feature |

---

## Testing Strategy

### Unit Testing
- Test all Controller methods
- Mock setInterval/localStorage
- Edge cases: 0 seconds, pause while paused, etc.

### Integration Testing  
- OPA Page Pattern
- User Journey: Complete Pomodoro Cycle

### Manual Testing
- Start/Pause/Reset Button Interactions
- Time Display Accuracy
- Session Counter Persistence
- Different Screen Sizes (Responsive)

---

## Deliverables

✅ Implementation Plan (dieses Dokument)
⏳ PomodoroTimer.controller.ts
⏳ PomodoroTimer.view.xml
⏳ manifest.json (aktualisiert mit Route)
⏳ PomodoroTimer.qunit.ts (Unit Tests)
⏳ PomodoroPage.ts + Journey (Integration Tests)
⏳ Updated App.controller.ts (falls Navigation)

**Estimated Effort**: 2-3 Hours für MVP
**Estimated Effort mit Tests**: 4-5 Hours

---

## Next Steps

1. ✅ **PLAN Phase**: Complete (this document)
2. ⏳ **BUILD Phase**: Implementiere Tasks 1-3
3. ⏳ **TEST Phase**: Implementiere Tasks 4-5
4. ⏳ **REVIEW Phase**: Code Review
5. ⏳ **DOCUMENT Phase**: Feature Documentation
6. ⏳ **PUBLISH Phase**: Merge zu Main Branch

**Status**: Ready for BUILD phase
