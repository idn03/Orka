---
description: Show project implementation status
agent: orchestrator
---

Analyze the current state of the Orka project and produce a progress report.

## Process

1. Read `specs/core.md` and list all acceptance criteria (AC-01 through AC-17)
2. Check which work packages exist in `specs/derived/`
3. Check what code exists in `app/src/` (components, API routes, database schema, etc.)
4. For each AC, determine status:
   - **NOT STARTED** — No code exists for this feature
   - **IN PROGRESS** — Some code exists but incomplete
   - **DONE** — Feature is fully implemented
5. List any open bugs in `specs/bugs/`
6. Check `.state/` for any pipeline execution results

## Output Format

```
## Implementation Progress

| AC | Description | Status | Notes |
|----|-------------|--------|-------|
| AC-01 | ... | NOT STARTED / IN PROGRESS / DONE | ... |

## Work Packages: X/Y derived
## Bugs: N open
## Pipeline Runs: N executed
```
