# Get GitHub Issues

Rufe Issues aus dem aktuellen GitHub Repository ab, gefiltert nach Labels und Status, inklusive vollständiger Content-Analyse.

## Zweck

Dieser Agent stellt eine umfassende Schnittstelle zur GitHub API bereit und holt alle Issues aus dem Repository, die:
- Den gewünschten Status haben (open/closed/all)
- Bestimmte Labels haben (z.B. "execute", "bug", "enhancement")
- Vollständige Issue-Beschreibung und Kommentare analysiert
- Workflow-Tags aus dem Content extrahiert
- Für die Planung und Implementierung bereit sind

---

## Parameter (Optional)

- **state**: "open" | "closed" | "all" (default: "open")
- **labels**: Komma-getrennte Liste von Labels zum Filtern (z.B. "execute,bug")
- **limit**: Maximale Anzahl Issues (default: 10)
- **sort**: "created" | "updated" | "comments" (default: "created")
- **direction**: "asc" | "desc" (default: "desc")

**Einfache Verwendung**: Ohne Parameter werden alle offenen Issues abgerufen.

---

## Erwartete Issue-Struktur

### Standard GitHub Issue Properties
- **number**: Issue Nummer (z.B. 42)
- **title**: Kurze Zusammenfassung
- **state**: "open" oder "closed"
- **labels**: Array von Labels
- **assignees**: Zugewiesene User
- **body**: Vollständige Beschreibung (Markdown)
- **comments**: Array von Kommentaren

### Empfohlene Labels für Automation

| Label | Bedeutung | Verwendung |
|-------|-----------|------------|
| **execute** | ✅ Bereit für Agent | Trigger für automatische Verarbeitung |
| **bug** | Fehler beheben | Bug-Fix Workflow |
| **enhancement** | Feature hinzufügen | Feature-Implementierung |
| **high-priority** | Hohe Priorität | Wird zuerst verarbeitet |
| **blocked** | ⛔ Nicht bereit | Wird übersprungen |

---

## Ablauf

### 1. Repository-Kontext ermitteln
- Lese Git Remote URL aus lokalem Repository
- Extrahiere Owner und Repo-Name
- Alternativ: Nutze GitHub CLI (`gh repo view --json nameWithOwner`)

### 2. GitHub API Query ausführen

**Filter-Logik**:
```json
{
  "state": "open",
  "labels": "execute",
  "sort": "created",
  "direction": "desc",
  "per_page": 10
}
```

**Concurrent Access Control**:
- Überspringe Issues mit Label "in-progress" (bereits in Bearbeitung)
- Überspringe Issues die in letzten 30 Sekunden modifiziert wurden

### 3. Für jedes Issue: Content parsen

**Was extrahiert wird**:
- Issue Title und Description (body)
- Alle Kommentare (chronologisch)
- Verlinkte Pull Requests
- Erwähnte Files/Code-Snippets
- Angehängte Bilder (URLs)

**Content zu task_prompt kombinieren**:
```
Issue Description + Alle Kommentare → Zu einem String kombiniert → task_prompt
```

### 4. Workflow-Tags aus Content extrahieren

Erkenne und parse Tags im Format `{{key: value}}`:

| Tag | Bedeutung | Beispiel |
|-----|-----------|----------|
| `{{worktree: name}}` | Target Git Worktree | `{{worktree: feature-auth}}` |
| `{{model: opus}}` | Claude Model Präferenz | `{{model: opus}}` oder `{{model: sonnet}}` |
| `{{workflow: plan}}` | Force Workflow Type | `{{workflow: plan\|build}}` |
| `{{app: appname}}` | Target App Directory | `{{app: tidysnap}}` |
| `{{branch: name}}` | Target Branch | `{{branch: develop}}` |

**Beispiel Issue Description**:
```markdown
## Task
Implement Pomodoro Timer

{{worktree: feature-timer}}
{{model: sonnet}}
{{workflow: plan}}

## Requirements
- 25-minute countdown timer
- Start, Pause, Reset buttons
- Display in MM:SS format

## Acceptance Criteria
- [ ] Timer displays 25:00 on start
- [ ] Timer counts down every second
- [ ] Buttons control timer state
```

**Extrahierte Tags**:
```json
{
  "worktree": "feature-timer",
  "model": "sonnet",
  "workflow": "plan"
}
```

### 5. Bilder und Screenshots analysieren

Für jede Bild-URL im Issue Body oder Kommentaren:

1. **URL extrahieren**:
   ```regex
   !\[.*?\]\((https?://.*?)\)
   ```

2. **Optional: Herunterladen**:
   ```bash
   mkdir -p /tmp/github_images/
   curl -L -o /tmp/github_images/issue-{number}-{index}.png {image_url}
   ```

3. **In Task-Daten einfügen**:
   ```json
   {
     "images": [
       {
         "url": "https://user-images.githubusercontent.com/.../mockup.png",
         "description": "Screenshot aus Issue #42"
       }
     ]
   }
   ```

### 6. Execution Trigger erkennen

**Execution Modes**:

| Labels | Trigger | Bedeutung |
|--------|---------|-----------|
| "execute" | `"execute"` | Verarbeite gesamtes Issue |
| "continue" | `"continue"` | Setze vorherige Arbeit fort |
| Kein Label | `"none"` | Nicht für Automation |

**Priority Detection**:
- Labels: "high-priority" → Priority: "High"
- Labels: "low-priority" → Priority: "Low"
- Default: "Medium"

---

## Response Format

**KRITISCH**: Gib **NUR** valides JSON zurück, keine Markdown-Blöcke, keine Erklärungen!

```json
[
  {
    "issue_number": 1,
    "issue_id": "ISSUE-1",
    "title": "Implement Pomodoro Timer",
    "repository": "owner/repo",
    "state": "open",
    "labels": ["execute", "enhancement", "high-priority"],
    "assignees": ["username"],
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T14:20:00Z",
    "priority": "High",
    "url": "https://github.com/owner/repo/issues/1",
    "body": "Implement 25-minute Pomodoro timer...",
    "comments_count": 2,
    "comments": [
      {
        "author": "username",
        "created_at": "2025-01-15T12:00:00Z",
        "body": "Use sap.m.Button for controls"
      }
    ],
    "tags": {
      "worktree": "feature-timer",
      "model": "sonnet",
      "workflow": "plan"
    },
    "execution_trigger": "execute",
    "task_prompt": "Implement Pomodoro Timer\n\nRequirements:\n- 25-minute countdown\n- Start, Pause, Reset buttons\n- Display in MM:SS format\n\nComment by username:\nUse sap.m.Button for controls",
    "images": [
      {
        "url": "https://user-images.githubusercontent.com/.../mockup.png",
        "description": "Timer UI mockup from issue description"
      }
    ]
  }
]
```

---

## Fehlerbehandlung

### GitHub API Errors

| Error | Aktion |
|-------|--------|
| **401 Unauthorized** | Nutze `gh auth login` für Authentication |
| **404 Not Found** | Check Repository existiert und ist zugänglich |
| **403 Rate Limit** | Warte bis Rate Limit Reset, dann retry |
| **Network Error** | Retry mit Exponential Backoff |
| **No Issues Found** | Gib leeres Array zurück `[]` |

### Setup bei fehlender Authentication

```markdown
❌ GitHub Authentication erforderlich!

Setup-Schritte:
1. GitHub CLI installieren: brew install gh
2. Authentifizieren: gh auth login
3. Scope auswählen: repo, read:org

Dann erneut versuchen.
```

---

## Verwendung

### Als Custom Agent

Der Agent wird automatisch aufgerufen mit:
```
Use the get_issues custom agent to fetch issues from the current repository filtered by label "execute"
```

### Mit spezifischen Parametern

```
Use get_issues agent with parameters:
- state: "open"
- labels: "execute,high-priority"
- limit: 5
- sort: "updated"
```

---

## Issue Workflow

### Status Labels

| Label | Bedeutung | Wann setzen |
|-------|-----------|-------------|
| **execute** | ✅ Bereit für Agent | Issue vollständig beschrieben |
| **in-progress** | Wird verarbeitet | Agent setzt automatisch |
| **needs-review** | Review erforderlich | Nach Implementation |
| **blocked** | ⛔ Blockiert | Dependencies fehlen |

### Priority Labels

| Label | Priority | Verarbeitung |
|-------|----------|--------------|
| **high-priority** | High | Zuerst |
| **medium-priority** | Medium | Normal |
| **low-priority** | Low | Zuletzt |

---

## Beispiel Issue

### Issue #42: Add photo upload with AI classification

**Labels**: `execute`, `enhancement`, `high-priority`

**Description**:
```markdown
Implement data table with filtering and sorting

{{worktree: feature-data-table}}
{{model: sonnet}}
{{workflow: plan|build}}

## Requirements
- Display data in sap.m.Table
- Column filtering functionality
- Sorting by multiple columns
- Export to CSV

## UI Mockup
![Table Mockup](https://user-images.githubusercontent.com/.../mockup.png)

## Technical Notes
- Use sap.m.Table for data display
- Implement sap.ui.model.Filter for filtering
- Use sap.ui.model.Sorter for sorting
- CSV export via js library

## Acceptance Criteria
- [ ] Table displays all data correctly
- [ ] Filter works on text columns
- [ ] Sorting works ascending/descending
- [ ] Export button generates valid CSV
```

**Comment by @developer**:
```markdown
Consider using sap.ui.table.Table for large datasets instead of sap.m.Table for better performance
```

### Extrahiertes Ergebnis

```json
{
  "issue_number": 2,
  "issue_id": "ISSUE-2",
  "title": "Add data table with filtering and sorting",
  "repository": "exkatibur/UI5Agency",
  "state": "open",
  "labels": ["execute", "enhancement", "high-priority"],
  "priority": "High",
  "tags": {
    "worktree": "feature-data-table",
    "model": "sonnet",
    "workflow": "plan|build"
  },
  "execution_trigger": "execute",
  "task_prompt": "Implement data table with filtering and sorting\n\nRequirements:\n- Display data in sap.m.Table\n- Column filtering functionality\n- Sorting by multiple columns\n- Export to CSV\n\nTechnical Notes:\n- Use sap.m.Table for data display\n- Implement sap.ui.model.Filter for filtering\n- Use sap.ui.model.Sorter for sorting\n- CSV export via js library\n\nComment by @developer:\nConsider using sap.ui.table.Table for large datasets instead of sap.m.Table for better performance",
  "images": [
    {
      "url": "https://user-images.githubusercontent.com/.../mockup.png",
      "description": "Table UI mockup showing filter controls and sort indicators"
    }
  ]
}
```

---

## Implementation Details

Der Agent nutzt intern folgende Tools:
1. **GitHub MCP Server** (`github-mcp-server-list_issues`, `github-mcp-server-search_issues`)
2. **Git Commands** für Repository-Kontext
3. **Regex Parsing** für Workflow-Tags
4. **JSON Output** für strukturierte Rückgabe

---

## Best Practices

1. **Labels konsistent nutzen**: `execute` für bereite Issues
2. **Tags im Issue Body**: `{{worktree: name}}` für automatisches Branch Management
3. **Screenshots anhängen**: UI Mockups helfen enorm
4. **Detaillierte Descriptions**: Mehr Context = bessere Implementation
5. **Priority Labels setzen**: High Priority Issues werden zuerst verarbeitet
6. **Acceptance Criteria definieren**: Checkboxen für klare Definition of Done
7. **Kommentare nutzen**: Zusätzliche Informationen in Comments

---

## Integration mit anderen Agents

### task-planner Agent
```
When user asks to implement features:
1. Use get_issues agent to fetch open issues with label "execute"
2. Parse returned JSON
3. Select issue based on priority
4. Create implementation plan from task_prompt
5. Update issue status to "in-progress"
```

### build Agent
```
When implementing features:
1. Check issue tags for {{worktree: name}}
2. Create or switch to worktree
3. Implement based on task_prompt
4. Reference issue in commit messages: "Fixes #42"
5. Create PR linked to issue
```

---

## Weiterführende Informationen

- [GitHub REST API Documentation](https://docs.github.com/en/rest)
- [GitHub CLI Documentation](https://cli.github.com/manual/)
- [GitHub Issues Best Practices](https://docs.github.com/en/issues/tracking-your-work-with-issues)

---

**Custom Agent für strukturiertes Issue Management mit Workflow-Automation!** 🎉
