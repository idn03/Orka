# Bug Tracking, Reporting & Fix Workflow

> How bugs flow through the Orka multi-agent system — from discovery to verified fix.

---

## Overview

```
Discovery → /bug-report → BUG-NNN filed → WP updated → /implement → /pipeline → Verified
```

Bugs can be discovered by anyone (human, reviewer, tester, validator, or pipeline failure). They are tracked as Markdown files in `specs/bugs/` and resolved through the standard implement → pipeline cycle.

---

## 1. Discovering a Bug

Bugs surface from four sources:

| Source | How it happens |
|---|---|
| **Manual testing** | You run the app and find something broken |
| **Pipeline failure** | `/pipeline` returns `VERDICT: FAIL` at any stage |
| **Code review** | Reviewer agent spots an issue during `/pipeline` Stage 1 |
| **Validation gap** | Validator agent finds an AC that doesn't pass during `/pipeline` Stage 3 |

---

## 2. Filing a Bug Report

Run in OpenCode:

```
/bug-report "Short description of what's wrong"
```

The orchestrator creates a file in `specs/bugs/` using this format:

```markdown
# BUG-NNN: Title

**Status**: Open
**Severity**: Critical / High / Medium / Low
**Related WP**: WP-NNN
**Failing AC**: AC-NN

## Description
What is wrong.

## Steps to Reproduce
1. Step one
2. Step two
3. Step three

## Expected Behavior
What should happen.

## Actual Behavior
What actually happens.

## Suggested Fix
How this might be fixed (optional).
```

### Severity Guide

| Severity | Definition | Example |
|---|---|---|
| **Critical** | App crashes or data loss | localStorage data silently wiped on save |
| **High** | Core feature broken | Cannot create tasks, status change doesn't persist |
| **Medium** | Feature partially broken | Filter by assignee returns wrong results |
| **Low** | Cosmetic or minor UX issue | Overdue indicator shows wrong color |

---

## 3. Orchestrator Updates the Work Package

After filing the bug, the orchestrator:

1. Identifies which WP the bug belongs to (using the **Related WP** field)
2. Updates that WP in `specs/derived/` with:
   - A new requirement addressing the fix
   - A new acceptance criterion to prevent regression
3. The updated WP becomes the implementer's instruction for the fix

**Example:** If BUG-001 is about cascade delete not working, and it relates to WP-003, the orchestrator adds to WP-003:

```markdown
## Bug Fixes
- BUG-001: Ensure deleteTask() removes all subtasks from localStorage before removing the parent
```

---

## 4. Implementing the Fix

Run in OpenCode:

```
/implement WP-NNN-*.md
```

The implementer:
- Reads the updated WP (which now includes the bug fix requirement)
- Applies the fix in `app/src/`
- Reports what was changed

**Important:** The implementer never sees the bug report directly — only the updated WP. This maintains the permission boundary.

---

## 5. Validating the Fix

Run in OpenCode:

```
/pipeline
```

The pipeline runs three stages:

| Stage | Agent | What it checks |
|---|---|---|
| **Review** | Reviewer | Code quality, spec alignment, the fix makes sense |
| **Test** | Tester | Writes a regression test for the bug, runs all tests |
| **Validate** | Validator | Confirms the related AC now passes |

Each stage ends with `VERDICT: PASS` or `VERDICT: FAIL`.

### If the pipeline fails again

```
/bug-report "Fix for BUG-NNN introduced a new issue: ..."
```

Or update the existing bug report and re-run the fix cycle. Repeat until pipeline passes.

---

## 6. Closing the Bug

After the pipeline passes, manually update the bug file:

**Before:**
```markdown
**Status**: Open
```

**After:**
```markdown
**Status**: Fixed
**Fixed in WP**: WP-NNN (iteration 2)
**Regression test**: Added in WP-NNN-test
```

---

## 7. Complete Example: End-to-End

```bash
# 1. You discover that deleting a parent task doesn't delete its subtasks
#    from localStorage

# 2. File the bug
/bug-report "Deleting a parent task leaves orphaned subtasks in localStorage"

# → Orchestrator creates specs/bugs/BUG-001-orphaned-subtasks.md
# → Orchestrator updates WP-003-task-crud (adds fix requirement + AC)

# 3. Implement the fix
/implement WP-003-task-crud.md

# → Implementer reads updated WP, fixes deleteTask() in task-store.ts

# 4. Validate
/pipeline

# → Reviewer: VERDICT: PASS
# → Tester: writes regression test, VERDICT: PASS
# → Validator: AC-05 (cascade delete) now passes, VERDICT: PASS

# 5. Update bug status
# Edit specs/bugs/BUG-001-orphaned-subtasks.md → Status: Fixed
```

---

## 8. Bug Lifecycle Diagram

```
  ┌─────────┐
  │  Open   │ ← /bug-report creates this
  └────┬────┘
       │ orchestrator updates WP
       ▼
  ┌─────────┐
  │ In Fix  │ ← /implement runs on updated WP
  └────┬────┘
       │ /pipeline
       ▼
  ┌─────────────┐     ┌─────────┐
  │  Validated  │────→│  Fixed  │ ← all stages PASS
  └─────────────┘     └─────────┘
       │
       │ VERDICT: FAIL
       ▼
  ┌──────────┐
  │ Re-open  │ ← back to In Fix
  └──────────┘
```

---

## 9. File Locations

| What | Where |
|---|---|
| Bug reports | `specs/bugs/BUG-NNN-short-title.md` |
| Updated work packages | `specs/derived/WP-NNN-*.md` |
| Pipeline results | `.state/<WP-ID>/<iteration>-<stage>.json` |
| Bug-report command spec | `.opencode/commands/bug-report.md` |

---

## 10. Tips

- **One bug per file.** Don't combine multiple issues into a single BUG-NNN.
- **Always link to a WP.** Every bug should reference which work package it affects. This is how the orchestrator knows what to update.
- **Always link to an AC.** If a bug maps to a specific acceptance criterion, note it. This helps the validator.
- **Pipeline failures are bugs.** If `/pipeline` fails, the output tells you what went wrong — file it as a bug and run the cycle.
- **Don't fix bugs directly.** Always go through the `/bug-report` → WP update → `/implement` → `/pipeline` flow. This creates the audit trail that MASE-13 requires.
