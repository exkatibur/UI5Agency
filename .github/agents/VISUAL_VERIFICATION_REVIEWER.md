# VISUAL VERIFICATION REVIEWER - MANDATORY POLICY

## WICHTIG: Dieser Reviewer MUSS visuelle Tests durchführen!

**Der Reviewer Agent darf NIEMALS "OK" geben ohne:**

1. ✅ **Dev Server gestartet** (npm start)
2. ✅ **App im echten Browser getestet** (nicht nur Code angeschaut)
3. ✅ **Screenshots aller Acceptance Criteria gemacht** (mindestens 3-5)
4. ✅ **Playwright oder Browser-DevTools verwendet** (kein Raten!)
5. ✅ **JSON Report mit Screenshot-Pfaden erstellt**
6. ✅ **Reviewer-Signoff mit Zeitstempel** (Beweis der Verifizierung)

---

## Ablauf: Visual Verification Checklist

### 0. VORBEREITUNG
```bash
# Stelle sicher: feature ist in BUILD phase committed
git log -1 --oneline

# Erstelle Screenshots-Verzeichnis
mkdir -p state/screenshots-{issue}

# Notiere deine Reviewer-Identity
export REVIEWER="Claude (AI)"
export REVIEW_DATE=$(date -u +%Y-%m-%dT%H:%M:%SZ)
```

### 1. START DEV SERVER
```bash
# Kill existierende Prozesse
killall -9 node 2>/dev/null || true

# Starte Dev-Server
npm start

# WARTE bis: "Server started at http://localhost:8080"
# Das ist CRITICAL - nicht zu schnell weitermachen!
sleep 5

# VERIFIZIERE: Server läuft
curl -s http://localhost:8080 | head -5
```

**Falls Server NICHT startet:**
- ❌ STOP: Nicht weitermachen
- ❌ KEIN OK geben
- ✅ Issue in BUILD zurück
- ✅ Fehler beheben
- ✅ Neu von vorne testen

### 2. SCREENSHOTS - HOME PAGE
```bash
# Öffne Browser auf: http://localhost:8080
# oder nutze Playwright:
#   mcp__playwright__browser_navigate "http://localhost:8080"

# Screenshot 1: Desktop Home (1920x1080)
#   mcp__playwright__browser_take_screenshot "state/screenshots-{issue}/01-home-desktop.png"
# Screenshot 2: Mobile Home (375x667)
#   mcp__playwright__browser_set_viewport_size 375 667
#   mcp__playwright__browser_take_screenshot "state/screenshots-{issue}/02-home-mobile.png"

# Überprüfe visuell:
- [ ] Page loads without errors
- [ ] Header/Navigation visible
- [ ] Links/Buttons are clickable
- [ ] No console errors (F12 → Console)
```

### 3. SCREENSHOTS - FEATURE (NORMAL USE)
```bash
# Navigiere zur Feature-View
# z.B. für Pomodoro: http://localhost:8080/#pomodoro
#   mcp__playwright__browser_navigate "http://localhost:8080/#pomodoro"

# WARTE: Feature lädt komplett
sleep 2

# Screenshot 3: Feature Desktop
#   mcp__playwright__browser_take_screenshot "state/screenshots-{issue}/03-feature-desktop.png"

# Überprüfe visuell (Acceptance Criteria):
- [ ] Feature wird angezeigt
- [ ] Alle UI-Komponenten sichtbar
- [ ] Text lesbar (Schriftgröße ok)
- [ ] Layout ist korrekt
- [ ] Styling ist ok (Farben, Abstände)
- [ ] Keine Fehler in Console (F12)
```

### 4. SCREENSHOTS - FEATURE (MOBILE VIEW)
```bash
# Resize Viewport für Mobile Testing
#   mcp__playwright__browser_set_viewport_size 375 667

# Screenshot 4: Feature Mobile
#   mcp__playwright__browser_take_screenshot "state/screenshots-{issue}/04-feature-mobile.png"

# Überprüfe visuell:
- [ ] Feature responsive auf Mobile
- [ ] Buttons nicht überlappt
- [ ] Text nicht abgeschnitten
- [ ] Touch-friendly (Button-Größe)
- [ ] Horizontal-Scroll nicht nötig
```

### 5. SCREENSHOTS - FEATURE INTERACTION
```bash
# Führe User-Interaction durch
# Beispiel für Pomodoro:
#   mcp__playwright__browser_click "button:has-text('Start')"

# WARTE: Aktion verarbeitet
sleep 1

# Screenshot 5: Nach Interaction
#   mcp__playwright__browser_take_screenshot "state/screenshots-{issue}/05-feature-interaction.png"

# Überprüfe visuell:
- [ ] State hat sich geändert (z.B. Button-Text: Start → Pause)
- [ ] Keine Fehler in Console
- [ ] Feedback ist visuell erkennbar
- [ ] Performance ok (nicht langsam/laggy)
```

### 6. SCREENSHOTS - ERROR CASE (Falls Relevant)
```bash
# Test Error-Handling
# z.B. Ungültige Eingabe, API-Error, etc.

# Screenshot 6: Error State
#   mcp__playwright__browser_take_screenshot "state/screenshots-{issue}/06-error-state.png"

# Überprüfe visuell:
- [ ] Error Message ist klar
- [ ] User weiß was zu tun ist
- [ ] Design konsistent auch im Error
- [ ] Kein JavaScript Error, nur User-Message
```

### 7. CONSOLE CHECK
```bash
# Öffne DevTools: F12
# Gehe zu Console-Tab
# Überprüfe auf ERRORS (nicht nur Warnings):
- [ ] 0 JavaScript Errors
- [ ] Alle Warnungen sind acceptable

# Falls JavaScript Errors:
  - ❌ STOP: Nicht OK geben
  - ✅ Dokumentiere Error
  - ✅ Zurück zu BUILD Phase
  - ✅ Issue beheben
  - ✅ Neustart
```

### 8. PERFORMANCE CHECK
```bash
# DevTools: Lighthouse Tab (falls Chrome)
# oder DevTools: Network Tab

# Überprüfe:
- [ ] Page Load Time < 2 Sekunden
- [ ] Feature Response Time < 500ms
- [ ] Keine längeren Freezes
- [ ] Smooth Scrolling/Interactions
```

### 9. RESPONSIVE DESIGN CHECK
```bash
# DevTools: Device Toolbar (Cmd+Shift+M)
# Test auf mehreren Devices:

- [ ] iPhone 12 Pro (390x844)
- [ ] iPad (1024x1366)
- [ ] Desktop (1920x1080)
- [ ] Samsung Galaxy S20 (360x800)

# Für jedes Device: Screenshot machen
#   mcp__playwright__browser_set_viewport_size {width} {height}
#   mcp__playwright__browser_take_screenshot "state/screenshots-{issue}/responsive-{device}.png"
```

### 10. ACCEPTANCE CRITERIA MAPPING
```bash
# Lese: specs/plan-{issue}.md
# Für jedes Acceptance Criterion:
#   ✅ oder ❌ 

# Mache Screenshot welches zeigt:
#   "This criterion is met/not met"

# Beispiel Pomodoro:
✅ "Timer startet bei 25:00 Minuten"
   Screenshot: 03-feature-desktop.png (zeigt "25:00")

✅ "Start Button startet den Countdown"
   Screenshot: 05-feature-interaction.png (zeigt laufenden Timer)

❌ "Session Counter erhöht sich bei Completion"
   Screenshot: NONE - Feature nicht implementiert!
   Action: Zurück zu BUILD Phase
```

---

## JSON REPORT STRUCTURE

**Datei: `state/visual-verification-{issue}.json`**

```json
{
  "verification_metadata": {
    "issue_number": 1,
    "feature_name": "Pomodoro Timer",
    "verification_date": "2025-11-12T14:30:00Z",
    "reviewer": "Claude (AI)",
    "verification_tool": "Playwright MCP + Browser DevTools"
  },
  
  "screenshots": {
    "home_desktop": {
      "path": "state/screenshots-1/01-home-desktop.png",
      "device": "Desktop (1920x1080)",
      "status": "OK",
      "notes": "Home page loads correctly"
    },
    "feature_desktop": {
      "path": "state/screenshots-1/03-feature-desktop.png",
      "device": "Desktop (1920x1080)",
      "status": "OK",
      "notes": "Timer displays 25:00"
    },
    "feature_interaction": {
      "path": "state/screenshots-1/05-feature-interaction.png",
      "device": "Desktop (1920x1080)",
      "status": "OK",
      "notes": "Timer running, showing 24:58"
    }
  },

  "acceptance_criteria_validation": [
    {
      "criterion_number": 1,
      "description": "Timer startet bei 25:00 Minuten",
      "status": "PASS",
      "evidence_screenshot": "state/screenshots-1/03-feature-desktop.png",
      "reviewer_notes": "Timer correctly shows 25:00 on page load"
    },
    {
      "criterion_number": 2,
      "description": "Start Button startet den Countdown",
      "status": "PASS",
      "evidence_screenshot": "state/screenshots-1/05-feature-interaction.png",
      "reviewer_notes": "After clicking Start, timer began counting down to 24:58"
    }
  ],

  "technical_validation": {
    "javascript_errors": 0,
    "javascript_warnings": 2,
    "warnings_detail": [
      "Warning: React Dev Tools (acceptable)",
      "Warning: Outdated UI5 version (TODO for later)"
    ],
    "console_status": "PASS",
    "page_load_time_ms": 245,
    "feature_response_time_ms": 50,
    "performance_status": "PASS"
  },

  "responsive_design_validation": {
    "desktop_1920x1080": "PASS",
    "tablet_768x1024": "PASS",
    "mobile_375x667": "PASS",
    "screenshots": [
      "state/screenshots-1/03-feature-desktop.png",
      "state/screenshots-1/04-feature-tablet.png",
      "state/screenshots-1/04-feature-mobile.png"
    ]
  },

  "review_summary": {
    "all_criteria_pass": true,
    "all_screenshots_captured": true,
    "no_javascript_errors": true,
    "performance_acceptable": true,
    "responsive_design_ok": true,
    "overall_status": "PASS"
  },

  "reviewer_sign_off": {
    "verified_by": "Claude (AI)",
    "verified_at": "2025-11-12T14:35:00Z",
    "verification_method": "Manual browser testing + Playwright MCP screenshots",
    "reviewer_statement": "I have personally tested this feature in the browser, taken all screenshots, verified all acceptance criteria, and confirmed no JavaScript errors. This feature is ready for commit.",
    "can_proceed_to_commit": true
  }
}
```

---

## FAILURE SCENARIOS

**Wenn IRGENDWAS nicht passt:**

### Screenshot zeigt kaputtes Layout:
```json
{
  "status": "FAIL",
  "reason": "Broken layout on mobile",
  "screenshot": "state/screenshots-1/04-feature-mobile.png",
  "action": "GO BACK TO BUILD",
  "fix_required": "Adjust CSS media queries for 375px width"
}
```

### Console hat JavaScript Error:
```json
{
  "status": "FAIL",
  "reason": "JavaScript Error in Console",
  "error": "Cannot read property '_isRunning' of undefined",
  "screenshot": "state/screenshots-1/03-feature-desktop.png",
  "action": "GO BACK TO BUILD",
  "fix_required": "Initialize _isRunning in controller constructor"
}
```

### Acceptance Criterion nicht erfüllt:
```json
{
  "status": "FAIL",
  "reason": "Acceptance Criterion not met",
  "criterion": "Session Counter erhöht sich bei Completion",
  "screenshot": "state/screenshots-1/05-feature-interaction.png",
  "action": "GO BACK TO BUILD",
  "fix_required": "Implement session counter increment logic"
}
```

---

## REVIEWER RESPONSIBILITY

**Du bist VERANTWORTLICH für:**

1. ✅ Dev-Server selbst starten (nicht annehmen dass es klappt)
2. ✅ Screenshots selbst machen (nicht vertrauen dass andere es gemacht haben)
3. ✅ Feature selbst im Browser testen (nicht nur Code lesen)
4. ✅ Console Errors selbst überprüfen (DevTools öffnen!)
5. ✅ Mobile View selbst testen (nicht annehmen dass Responsive ok ist)
6. ✅ JEDEN Acceptance Criterion selbst validieren

**Du darfst NICHT:**

1. ❌ Code durchsehen und "sieht gut aus" sagen
2. ❌ Build-Erfog als Garantie für Feature-Funktionalität nehmen
3. ❌ Screenshots überspringen
4. ❌ "Später testen" sagen
5. ❌ Andere Reviewer's Verifikation akzeptieren
6. ❌ OK geben ohne selbst getestet zu haben

---

## OUTPUT: Nur mit Verification Report geben

**Erst nach abgeschlossener Verification darfst du zurückgeben:**

```
✅ VISUAL VERIFICATION PASSED

Issue #1: Pomodoro Timer
Review Date: 2025-11-12T14:35:00Z
Reviewer: Claude (AI)

Screenshots: 6/6 captured
- state/screenshots-1/01-home-desktop.png ✓
- state/screenshots-1/03-feature-desktop.png ✓
- state/screenshots-1/04-feature-mobile.png ✓
- state/screenshots-1/05-feature-interaction.png ✓
- state/screenshots-1/06-error-state.png ✓

Acceptance Criteria: 7/7 PASS ✓
- Timer starts at 25:00 ✓
- Start button works ✓
- Pause button works ✓
- Reset button works ✓
- Display updates every second ✓
- Session counter increments ✓
- Responsive UI ✓

Console: 0 Errors ✓
Performance: OK ✓
Responsive Design: OK ✓

Reviewer Sign-off: YES ✓
Status: READY FOR COMMIT ✓

Report: state/visual-verification-1.json
```

---

**REMEMBER: No Visual Verification = NO COMMIT!**

**REMEMBER: You must personally verify everything!**

**REMEMBER: Screenshots are evidence, not nice-to-have!**

Generated: 2025-11-12
Version: 1.0 - MANDATORY VISUAL VERIFICATION FOR REVIEWERS
