# REFAC-001: Extract Page Sections & Shared Components

**Scope**: UI
**Risk**: Medium

## Current State

All four task pages (`/tasks`, `/tasks/new`, `/tasks/[id]`, `/tasks/[id]/edit`) are monolithic single-file components with significant duplication:

1. **Page layout shell** — every page repeats `<div className="flex min-h-screen flex-col">` + `<header>` + `<main>` with identical structure and "Orka Tasks" branding.

2. **Page header** — all four pages render the same `<header className="border-b bg-background px-6 py-3">` with an optional back button. The only variation is whether a back button is shown and where it links.

3. **Task form fields** — `new/page.tsx` (lines 132–189) and `[id]/edit/page.tsx` (lines 172–247) contain nearly identical form field markup for title, description, due date, and assignee — including labels, inputs, error messages, and spacing.

4. **Form validation** — both `new/page.tsx` and `[id]/edit/page.tsx` define the same `validateForm()` function and `FormErrors` interface with identical title length and date format checks.

5. **Date/time utilities** — `isOverdue()` is defined in both `tasks/page.tsx` (line 29) and `[id]/page.tsx` (line 45). `formatDueDate()` in the list page and `formatDate()` in the detail page do similar work. `formatRelativeTime()` is only in the detail page but belongs in a shared utility.

6. **Status badge** — the detail page defines a custom `StatusBadge` component (lines 59–89) with inline color maps, while the list page uses `<Badge variant="secondary">`. These should be a single shared component with consistent styling.

7. **Subtask row** — `SubtaskRow` (detail page, lines 91–127) is an inline component that should be shared.

8. **Loading fallback** — identical `LoadingFallback` component in both `new/page.tsx` (line 209) and `[id]/edit/page.tsx` (line 267).

9. **"Not found" state** — similar "task not found" UI in `[id]/page.tsx` (lines 184–204) and `[id]/edit/page.tsx` (lines 127–152).

## Desired State

Each page file should be a thin composition of section components. Shared UI patterns live in `app/src/components/`.

### Shared Components to Extract

| Component | Location | Used By |
|-----------|----------|---------|
| `PageShell` | `components/page-shell.tsx` | All 4 pages |
| `PageHeader` | `components/page-header.tsx` | All 4 pages |
| `TaskForm` | `components/task-form.tsx` | Create + Edit pages |
| `StatusBadge` | `components/status-badge.tsx` | Detail + List pages |
| `SubtaskRow` | `components/subtask-row.tsx` | Detail page |
| `TaskNotFound` | `components/task-not-found.tsx` | Detail + Edit pages |
| `LoadingFallback` | `components/loading-fallback.tsx` | Create + Edit pages |

### Shared Utilities to Extract

| Utility | Location | Used By |
|---------|----------|---------|
| `isOverdue()` | `lib/date-utils.ts` | List + Detail pages |
| `formatDate()` | `lib/date-utils.ts` | List + Detail pages |
| `formatRelativeTime()` | `lib/date-utils.ts` | Detail page |
| `validateTaskForm()` | `lib/validation.ts` | Create + Edit pages |

### Page Structure After Refactor

**`/tasks` (list page):**
```
PageShell
├── PageHeader (title="Orka Tasks", action=NewTaskButton)
└── Main
    ├── SearchBar
    ├── FilterBar (status, assignee, due)
    └── TaskList (using StatusBadge per row)
```

**`/tasks/new` (create page):**
```
PageShell
├── PageHeader (backLink, title="Orka Tasks")
└── Main
    ├── ParentTaskBreadcrumb (conditional)
    └── Card
        └── TaskForm (mode="create")
```

**`/tasks/[id]` (detail page):**
```
PageShell
├── PageHeader (backLink, title="Orka Tasks")
└── Main
    ├── ParentTaskBreadcrumb (conditional)
    └── Card
        ├── TaskDetailHeader (title, edit/delete actions)
        ├── TaskDetailContent (status, description, assignee, dates)
        └── SubtaskSection (using SubtaskRow)
```

**`/tasks/[id]/edit` (edit page):**
```
PageShell
├── PageHeader (backLink, title="Orka Tasks")
└── Main
    └── Card
        └── TaskForm (mode="edit", initialValues={...})
```

## Affected Areas

- `app/src/app/tasks/page.tsx` — split into sections, extract shared pieces
- `app/src/app/tasks/new/page.tsx` — use shared TaskForm and PageShell
- `app/src/app/tasks/[id]/page.tsx` — split into sections, extract shared pieces
- `app/src/app/tasks/[id]/edit/page.tsx` — use shared TaskForm and PageShell
- `app/src/components/` — new shared component files
- `app/src/lib/date-utils.ts` — new shared date utilities
- `app/src/lib/validation.ts` — new shared form validation

## Constraints

- No behavior change — all existing functionality must work identically
- Existing tests must continue to pass without modification
- Keep components in `app/src/components/` (not nested under `ui/`)
- Shadcn UI primitives stay in `components/ui/` — these are higher-level app components

## Acceptance Criteria

- [ ] AC-REFAC-001-01: A shared `PageShell` component wraps all four pages with consistent layout
- [ ] AC-REFAC-001-02: A shared `PageHeader` component renders the header with optional back button on all pages
- [ ] AC-REFAC-001-03: A shared `TaskForm` component is used by both create and edit pages with a `mode` prop
- [ ] AC-REFAC-001-04: A shared `StatusBadge` component with consistent styling is used in both list and detail pages
- [ ] AC-REFAC-001-05: Date utilities (`isOverdue`, `formatDate`, `formatRelativeTime`) live in `lib/date-utils.ts` with no duplication
- [ ] AC-REFAC-001-06: Form validation logic lives in `lib/validation.ts` with no duplication
- [ ] AC-REFAC-001-07: Each page file is a composition of section components, not a monolithic render
- [ ] AC-REFAC-001-08: No duplicate UI logic across pages
- [ ] AC-REFAC-001-09: All existing tests pass without modification
- [ ] AC-REFAC-001-10: `npm run build` succeeds with no TypeScript errors
