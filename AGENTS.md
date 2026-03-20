# Orka — Multi-Agent Software Delivery System

## Overview

Orka is a spec-driven, multi-agent delivery system that uses OpenCode to orchestrate
specialized AI agents. It builds software from a core specification through automated
work package derivation, implementation, review, testing, and validation.

The proof-of-concept target is a **Team Task Management App**.

## Project Structure

```
Orka/
├── opencode.json           ← OpenCode config (agents, commands, model)
├── AGENTS.md               ← This file (project context for OpenCode)
├── .opencode/
│   ├── agents/             ← 6 specialized agent definitions
│   │   ├── orchestrator.md
│   │   ├── spec-writer.md
│   │   ├── implementer.md
│   │   ├── reviewer.md
│   │   ├── tester.md
│   │   └── validator.md
│   └── commands/           ← Custom commands for pipeline operations
│       ├── derive.md
│       ├── implement.md
│       ├── pipeline.md
│       ├── bug-report.md
│       └── status.md
├── specs/
│   ├── core.md             ← Core specification (humans manage this only)
│   ├── STRUCTURE.md         ← Spec directory layout & permission rules
│   ├── derived/            ← Auto-generated work packages (WP-NNN-*.md)
│   └── bugs/               ← Bug reports (BUG-NNN-*.md)
├── app/                    ← Next.js task management app (built by agents)
│   ├── src/
│   ├── prisma/
│   └── package.json
├── .state/                 ← Pipeline execution state (JSON per stage)
└── output/                 ← Accepted pipeline outputs
```

## Agent Roles & Permission Boundaries

| Agent | Reads core.md | Reads WPs | Writes code | Writes specs | Approves |
|-------|:---:|:---:|:---:|:---:|:---:|
| orchestrator | YES | YES | NO | YES (WPs) | YES |
| spec-writer | YES | YES | NO | YES | NO |
| implementer | NO | YES | YES | NO | NO |
| reviewer | YES | YES | NO | NO | YES |
| tester | NO | YES | YES (tests) | NO | NO |
| validator | YES | YES | NO | NO | YES |

**Critical rule:** Implementer and tester agents NEVER see `specs/core.md`.
They operate exclusively from work packages in `specs/derived/`.

## Workflows

### 1. Core Spec → Derived Work Packages
```
Human edits specs/core.md → /derive command → orchestrator generates WPs in specs/derived/
```

### 2. Implementation
```
/implement WP-NNN-*.md → implementer writes code in app/ from the WP
```

### 3. Quality Pipeline
```
/pipeline → reviewer checks code → tester writes/runs tests → validator checks all ACs
```

### 4. Bug Fixes
```
/bug-report "description" → orchestrator files BUG-NNN in specs/bugs/
→ orchestrator updates relevant WP → /implement re-runs → /pipeline re-validates
```

### 5. Requirement Additions
```
Human updates specs/core.md → /derive → orchestrator diffs and updates WPs
→ /implement for new/changed WPs → /pipeline
```

## Custom Commands

| Command | Description | Agent |
|---------|-------------|-------|
| `/derive` | Generate/update derived WPs from core spec | orchestrator |
| `/implement WP-NNN-*.md` | Implement a specific work package | implementer |
| `/pipeline` | Run review → test → validate pipeline | build |
| `/bug-report <description>` | File a bug report | orchestrator |
| `/status` | Show implementation progress vs ACs | orchestrator |

## LLM Provider Configuration

Orka uses [CLIProxyAPI](https://github.com/router-for-me/CLIProxyAPI) as a proxy
to access Anthropic's Claude API. This avoids direct API key management and enables
multi-account load balancing.

**Setup:**
1. Install and run CLIProxyAPI locally (default port: 8317)
2. Set environment variables:
   ```bash
   export ANTHROPIC_BASE_URL=http://127.0.0.1:8317
   export ANTHROPIC_AUTH_TOKEN=sk-dummy
   ```
3. Authenticate CLIProxyAPI with your provider accounts via its management API

All agents in `opencode.json` will route through CLIProxyAPI automatically.

## Tech Stack (Target App)

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js (App Router) + Shadcn UI + Tailwind CSS |
| Backend | Next.js API routes |
| Database | PostgreSQL + Prisma ORM |
| Authentication | NextAuth.js v5 (Credentials provider) |

## Conventions

- Work packages: `WP-NNN-short-title.md` (e.g., `WP-001-database-schema.md`)
- Bug reports: `BUG-NNN-short-title.md` (e.g., `BUG-001-cascade-delete-missing.md`)
- Pipeline results: `.state/<WP-ID>/<iteration>-<stage>.json`
- Accepted code: `output/<WP-ID>-accepted.txt`
- Verdicts: All review/test/validate agents must end with `VERDICT: PASS` or `VERDICT: FAIL`
