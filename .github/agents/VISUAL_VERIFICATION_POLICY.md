# Workflow Orchestrator - VISUAL VERIFICATION POLICY

## ⚠️ KRITISCHES REQUIREMENT: MANDATORY VISUAL VERIFICATION

**KEIN Feature darf eingecheckt werden, ohne dass:**

1. ✅ **Die App mit echtem Browser gestartet wurde** (npm start)
2. ✅ **Screenshots der Implementierung wurden gemacht** (mindestens 3-5 views)
3. ✅ **Der Reviewer hat die Screenshots mit eigenen Augen geprüft**
4. ✅ **Alle Acceptance Criteria wurden visuell validiert**
5. ✅ **Visual Test Report liegt vor** (state/visual-verification-{issue}.json)

---

## Visual Verification Checklist

### Vor Commit MUSS folgendes geprüft sein:

**Für UI Features:**
- [ ] Desktop View (1920x1080) - Screenshot gemacht
- [ ] Tablet View (768x1024) - Screenshot gemacht  
- [ ] Mobile View (375x667) - Screenshot gemacht
- [ ] Alle Buttons/Links funktionieren - Getestet
- [ ] Alle Input-Felder funktionieren - Getestet
- [ ] Keine JavaScript-Fehler in Console - Überprüft
- [ ] Styling ist korrekt - Visuell validiert
- [ ] Performance ist ok (keine Lags) - Überprüft

**Für Logic Features:**
- [ ] Feature funktioniert wie beschrieben - Getestet
- [ ] Error Handling funktioniert - Getestet
- [ ] Edge Cases funktionieren - Getestet
- [ ] Keine Console Errors - Überprüft

**Für alle Features:**
- [ ] Screenshots in state/screenshots-{issue}/ abgelegt
- [ ] Screenshot-Labels dokumentieren was zu sehen ist
- [ ] Visual Report in state/visual-verification-{issue}.json
- [ ] Reviewer hat alles selbst geprüft (nicht nur angenommen!)

---

## Reviewer Role - Kritische Anforderungen

**Der Reviewer (ob Mensch oder AI) DARF NICHT einfach "ok" sagen für:**
- Code der nur auf Build-Success vertraut
- Features die nicht visuell getestet wurden
- Screenshots die ein anderer gemacht hat (du musst selbst testen!)
- Features bei denen Console-Errors ignoriert werden
- UI-Fehler die "später gefixt werden"

**Der Reviewer MUSS:**
1. Die App selbst starten (npm start oder npm run start:dist)
2. Mit Playwright/Browser zu alle wichtigen Seiten navigieren
3. Alle Acceptance Criteria selbst testen
4. Screenshots selbst machen
5. Erst nach erfolgreichem visuellen Test "ok" geben

---

## Workflow mit Visual Verification

### Phase 0: Init
```
→ Initialize workflow state
→ Verify issue exists
→ Next: PLAN
```

### Phase 1: PLAN  
```
→ Create detailed implementation plan
→ Document all acceptance criteria
→ Next: BUILD
```

### Phase 2: BUILD
```
→ Implement feature
→ TypeScript compilation: OK ✓
→ Run tests: OK ✓
→ Commit code
→ Next: VISUAL VERIFICATION (MANDATORY!)
```

### Phase 3: VISUAL VERIFICATION ⭐ CRITICAL ⭐
```
→ START DEV SERVER: npm start
→ WAIT FOR: http://localhost:8080 ready
→ TAKE SCREENSHOTS:
  - Home page
  - Feature page (normal view)
  - Feature page (mobile view)
  - Feature with user interaction (if applicable)
  - Error state (if applicable)
→ VALIDATE IN BROWSER:
  - All buttons clickable
  - All text visible
  - No JavaScript errors
  - Performance ok (no lags)
  - Responsive design works
→ CREATE VISUAL REPORT:
  state/visual-verification-{issue}.json with:
    - All screenshots paths
    - Test results (pass/fail for each criterion)
    - Reviewer notes
    - Timestamp when verified
→ FAIL CHECKS: 
  - If ANY criterion fails → DO NOT PROCEED
  - Fix the issue, return to BUILD phase
  - Re-take screenshots and re-validate
→ PASS CHECKS:
  - All criteria pass → Proceed to REVIEW
```

### Phase 4: REVIEW
```
→ Code quality review (using visual verification results)
→ Check: All acceptance criteria visually validated ✓
→ Check: Screenshots confirm functionality ✓
→ Check: No console errors ✓
→ Next: DOCUMENT
```

### Phase 5: DOCUMENT
```
→ Create feature documentation
→ Include screenshots from visual verification
→ Next: PUBLISH
```

### Phase 6: PUBLISH
```
→ Post to GitHub issue with documentation & screenshots
→ Next: COMMIT
```

### Phase 7: COMMIT
```
→ Commit all changes (including visual verification report)
→ Push to repository
→ Workflow DONE
```

---

## What Gets Checked In?

**MUST include in state/ directory:**

```
state/
├── workflow_state_{issue}.json          # Workflow state
├── visual-verification-{issue}.json     # Visual test results
└── screenshots-{issue}/
    ├── 01-home-page.png                # Desktop home
    ├── 02-feature-desktop.png          # Desktop feature
    ├── 03-feature-mobile.png           # Mobile feature
    ├── 04-feature-interaction.png      # After user interaction
    └── verification-report.md           # Visual test notes
```

**Example visual-verification-1.json:**
```json
{
  "issue_number": 1,
  "feature_name": "Pomodoro Timer",
  "verification_date": "2025-11-12T12:00:00Z",
  "reviewer": "Claude (AI)",
  "status": "PASS",
  "acceptance_criteria": [
    {
      "criterion": "Timer startet bei 25:00 Minuten",
      "status": "PASS",
      "screenshot": "screenshots-1/02-feature-desktop.png",
      "notes": "Timer correctly shows 25:00 on load"
    },
    {
      "criterion": "Start Button startet den Countdown",
      "status": "PASS",
      "screenshot": "screenshots-1/04-feature-interaction.png",
      "notes": "Clicked Start, timer began counting down"
    },
    {
      "criterion": "Pause Button hält den Timer an",
      "status": "PASS",
      "screenshot": "screenshots-1/04-feature-interaction.png",
      "notes": "Clicked Pause, timer stopped at 24:58"
    },
    {
      "criterion": "Reset Button setzt auf 25:00 zurück",
      "status": "PASS",
      "screenshot": "screenshots-1/04-feature-interaction.png",
      "notes": "Clicked Reset, timer reset to 25:00"
    },
    {
      "criterion": "UI ist responsive und sieht gut aus",
      "status": "PASS",
      "screenshot": "screenshots-1/03-feature-mobile.png",
      "notes": "Mobile view is responsive, all buttons are clickable"
    }
  ],
  "console_errors": [],
  "console_warnings": [],
  "performance": {
    "page_load_time_ms": 245,
    "feature_response_time_ms": 50,
    "status": "OK"
  },
  "device_tests": [
    {
      "device": "Desktop (1920x1080)",
      "status": "PASS",
      "screenshot": "screenshots-1/02-feature-desktop.png"
    },
    {
      "device": "Tablet (768x1024)",
      "status": "PASS",
      "screenshot": "screenshots-1/03-feature-mobile.png"
    },
    {
      "device": "Mobile (375x667)",
      "status": "PASS",
      "screenshot": "screenshots-1/03-feature-mobile.png"
    }
  ],
  "reviewer_sign_off": {
    "all_tests_pass": true,
    "acceptance_criteria_met": true,
    "no_blocking_issues": true,
    "safe_to_merge": true,
    "reviewed_by": "Claude (AI)",
    "reviewed_at": "2025-11-12T12:30:00Z"
  }
}
```

---

## Tools Für Visual Verification

### Playwright (Recommended)
```bash
npm install -D @playwright/test
npx playwright codegen http://localhost:8080
# Generate screenshots and user flows
```

### Simple Browser Screenshots
```bash
# Manual: Open http://localhost:8080
# DevTools: F12 → Device toolbar → Resize
# Screenshot: Cmd+Shift+5 → Save
```

### Screenshot Naming Convention
```
{state}/screenshots-{issue}/
├── 01-{view}-{device}.png
├── 02-{feature}-{device}.png
├── 03-{interaction}-{device}.png
└── 04-{errorcase}-{device}.png

Examples:
- 01-home-desktop.png
- 02-pomodoro-mobile.png
- 03-timer-running-desktop.png
- 04-error-state-mobile.png
```

---

## Failing Visual Verification

**If visual verification FAILS:**

1. ❌ DO NOT commit anything
2. ❌ DO NOT mark as "done"
3. ✅ GO BACK to BUILD phase
4. ✅ FIX the issue
5. ✅ RE-BUILD and RE-TEST
6. ✅ RE-TAKE screenshots
7. ✅ RE-RUN visual verification
8. ✅ Only after PASS: Continue to next phase

**Example Failure Scenarios:**

```
FAIL: Timer display not visible
→ Fix: CSS not loaded / Controller error
→ Screenshot shows: Timer div exists but no text
→ Resolution: Fix CSS import in Component

FAIL: Mobile view breaks at 375px
→ Fix: CSS media queries incorrect
→ Screenshot shows: Buttons overlapping on mobile
→ Resolution: Adjust responsive breakpoints

FAIL: Console shows JavaScript error
→ Fix: Reference error in controller
→ Error: "Cannot read property '_intervalId' of undefined"
→ Resolution: Initialize variable in onInit()
```

---

## Sign-Off Rules

**ONLY after ALL of these are true, can you sign off:**

```
✅ Dev server started: npm start (running at localhost:8080)
✅ Screenshots taken: All 4+ views documented
✅ Acceptance criteria: ALL visually validated (PASS)
✅ Console: No errors (0 JavaScript errors)
✅ Performance: Acceptable (no major lags)
✅ Responsive: Works on mobile/tablet/desktop
✅ Report: visual-verification-{issue}.json created
✅ Reviewer: Manually tested everything (not just read code)
✅ No Blockers: Feature works as specified
✅ Documentation: Screenshots included in commit

THEN AND ONLY THEN: "PASS - Ready for commit"
```

---

## For Agents/Reviewers

**Remember: You represent the user's trust!**

- ❌ Don't just read the code and say "looks good"
- ❌ Don't assume the build output works
- ❌ Don't skip visual testing because it's "fast build"
- ❌ Don't ignore console errors
- ❌ Don't review someone else's screenshots without testing yourself

- ✅ Start the app yourself
- ✅ Click all the buttons yourself
- ✅ Take screenshots yourself
- ✅ Check console errors yourself
- ✅ Test on mobile yourself
- ✅ Only then: sign off

**If you don't verify visually, you're not doing your job.**

---

Generated: 2025-11-12
Version: 1.0 - STRICT VISUAL VERIFICATION POLICY
