---
description: Generate or update derived work packages from core spec
agent: orchestrator
---

Read `specs/core.md` and generate self-contained work packages in `specs/derived/`.

## Process

1. Read the full core specification at `specs/core.md`
2. If work packages already exist in `specs/derived/`, read them and compare against the core spec
3. Identify what needs to be created, updated, or left unchanged
4. For each work package:
   - Assign a unique ID: `WP-NNN-short-title.md`
   - Include all context a worker (implementer/tester) needs — they cannot read `specs/core.md`
   - List specific requirements, tech context, and acceptance criteria
   - Note dependencies on other WPs

## Rules

- Preserve existing WP IDs for unchanged packages
- Workers only see these WPs, never the core spec
- Each WP must be fully self-contained
- Split implementation WPs from test WPs
- Group logically: database, auth API, task CRUD API, users API, auth UI, task list UI, task detail UI, then corresponding test WPs

$ARGUMENTS
