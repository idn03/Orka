# Specs Directory Structure

```
specs/
├── core.md              ← Single source of truth for the base application.
│                          Only readable by: orchestrator, spec-writer,
│                          reviewer, validator.
│                          NEVER exposed to implementer or tester.
│
├── new-features/        ← Feature request drop zone.
│   ├── FEAT-NNN-*.md      Developers place one Markdown file per feature.
│   └── ...                Orchestrator reads these and generates WPs
│                          WITHOUT modifying core.md.
│
├── refactors/           ← Refactoring request drop zone.
│   ├── REFAC-NNN-*.md     Developers place one Markdown file per refactor.
│   └── ...                Orchestrator reads these and generates WPs.
│
├── derived/             ← Work packages produced by the orchestrator.
│   ├── WP-NNN-*.md        These are the ONLY spec documents that
│   └── ...                implementer and tester agents receive.
│
├── bugs/                ← Bug reports from reviewer, tester, or validator.
│   ├── BUG-NNN-*.md       Each bug references the relevant work package ID
│   └── ...                and the failing acceptance criteria.
│
└── STRUCTURE.md         ← This file.
```

## Naming Conventions

- **Feature requests**: `FEAT-NNN-short-title.md` (e.g., `FEAT-001-dark-mode.md`)
- **Refactor requests**: `REFAC-NNN-short-title.md` (e.g., `REFAC-001-extract-task-hooks.md`)
- **Work packages**: `WP-NNN-short-title.md` (e.g., `WP-001-task-crud-api.md`)
- **Bug reports**: `BUG-NNN-short-title.md` (e.g., `BUG-001-cascade-delete-missing.md`)

## Input Sources for Work Packages

The orchestrator generates or updates WPs from three sources:

```
specs/core.md          ──→ /derive          ──→ WP-NNN-*.md  (base app)
specs/new-features/*.md ──→ /feature FEAT-*  ──→ WP-NNN-*.md  (additive)
specs/refactors/*.md    ──→ /refactor REFAC-* ──→ WP-NNN-*.md  (restructure)
```

**Key rule:** `/feature` and `/refactor` never modify `specs/core.md`.
The orchestrator reads the core spec for context but only creates or updates
work packages in `specs/derived/`.

## Permission Flow

```
core.md ─────────────┐
new-features/*.md ────┤──→ orchestrator ──→ WP-NNN-*.md ──→ implementer / tester
refactors/*.md ───────┘          ↑
                    reviewer ────┘ (can read core.md, features, refactors, and derived)
                    validator ───┘
```

Implementer and tester agents never see core.md, feature requests,
or refactor requests directly. They work exclusively from work packages in derived/.

## Feature Request Format

```markdown
# FEAT-NNN: Short Title

**Priority**: High / Medium / Low
**Requested by**: Name or team

## Problem
Why this feature is needed.

## Requirements
- REQ-FEAT-NNN-01: What the feature must do
- REQ-FEAT-NNN-02: ...

## Acceptance Criteria
- [ ] AC-FEAT-NNN-01: Verifiable criterion
- [ ] AC-FEAT-NNN-02: ...

## UI/UX Notes (optional)
Mockups, wireframes, or descriptions of desired behavior.

## Constraints (optional)
Performance, compatibility, or scope limitations.
```

## Refactor Request Format

```markdown
# REFAC-NNN: Short Title

**Scope**: UI / Business Logic / Data Layer / Cross-cutting
**Risk**: High / Medium / Low

## Current State
What exists today and why it needs to change.

## Desired State
What the code should look like after refactoring.

## Affected Areas
- List of files, modules, or components impacted

## Constraints
- What must NOT change (public behavior, data format, etc.)
- Migration steps if applicable

## Acceptance Criteria
- [ ] AC-REFAC-NNN-01: Verifiable criterion (e.g., "no behavior change in existing tests")
- [ ] AC-REFAC-NNN-02: ...
```
