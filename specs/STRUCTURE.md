# Specs Directory Structure

```
specs/
├── core.md              ← Single source of truth. Only readable by:
│                          orchestrator, spec-writer, reviewer, validator.
│                          NEVER exposed to implementer or tester.
│
├── derived/             ← Work packages produced by the orchestrator.
│   ├── WP-001-*.md        These are the ONLY spec documents that
│   ├── WP-002-*.md        implementer and tester agents receive.
│   └── ...
│
├── bugs/                ← Bug reports from reviewer, tester, or validator.
│   ├── BUG-001-*.md       Each bug references the relevant work package ID
│   └── ...                and the failing acceptance criteria.
│
└── STRUCTURE.md         ← This file.
```

## Naming Conventions

- **Work packages**: `WP-NNN-short-title.md` (e.g., `WP-001-task-crud-api.md`)
- **Bug reports**: `BUG-NNN-short-title.md` (e.g., `BUG-001-cascade-delete-missing.md`)

## Permission Flow

```
core.md ──→ orchestrator ──→ WP-NNN-*.md ──→ implementer / tester
                                  ↑
              reviewer ───────────┘ (can read both core.md and derived)
              validator ──────────┘
```

Implementer and tester agents never see core.md directly.
They work exclusively from work packages in derived/.
