---
description: Generate work packages from a refactoring request
agent: orchestrator
---

Read the refactoring request at `specs/refactors/$1` and generate or update work packages in `specs/derived/`.

## Process

1. Read the refactor request file at `specs/refactors/$1`
2. Read `specs/core.md` for context on the existing application (do NOT modify it)
3. Read existing work packages in `specs/derived/` to understand current state
4. Read relevant code in `app/src/` to understand the current implementation
5. Generate new WPs or update existing WPs to carry out the refactoring
6. Each WP must be self-contained — workers cannot read the refactor request or core spec
7. Mark the refactor request status as `Derived` by adding a status line at the top

## Rules

- Do NOT modify `specs/core.md` — the core spec is not changed by refactors
- Refactoring WPs must explicitly state what must NOT change (preserved behavior, interfaces, data formats)
- Include before/after guidance so the implementer understands the target structure
- If the refactor touches code covered by existing WPs, update those WPs
- New WPs get the next available WP-NNN ID
- Workers only see WPs, never the refactor request or core spec
- Split implementation WPs from test WPs
- Refactor test WPs should verify no regressions (existing behavior preserved)

## After Derivation

Report:
1. Which refactor request was processed
2. Risk assessment (what could break)
3. Which WPs were created or updated
4. Suggested implementation order (prefer small, safe steps)

$ARGUMENTS
