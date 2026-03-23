---
description: Generate work packages from a feature request
agent: orchestrator
---

Read the feature request at `specs/new-features/$1` and generate or update work packages in `specs/derived/`.

## Process

1. Read the feature request file at `specs/new-features/$1`
2. Read `specs/core.md` for context on the existing application (do NOT modify it)
3. Read existing work packages in `specs/derived/` to understand current state
4. Generate new WPs or update existing WPs to incorporate the feature
5. Each WP must be self-contained — workers cannot read the feature request or core spec
6. Mark the feature request status as `Derived` by adding a status line at the top

## Rules

- Do NOT modify `specs/core.md` — the core spec is not changed by feature requests
- Preserve existing WP IDs for unchanged packages
- New WPs get the next available WP-NNN ID
- If a feature overlaps with an existing WP, update that WP rather than creating a duplicate
- Workers only see WPs, never the feature request or core spec
- Each WP must include: description, requirements, tech context, acceptance criteria, dependencies
- Split implementation WPs from test WPs

## After Derivation

Report:
1. Which feature request was processed
2. Which WPs were created or updated
3. Dependencies between WPs
4. Suggested implementation order

$ARGUMENTS
