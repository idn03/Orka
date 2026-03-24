# Orka

A spec-driven, multi-agent software delivery system. Orka uses [OpenCode](https://opencode.ai) to orchestrate specialized AI agents that build software from a core specification through automated work package derivation, implementation, review, testing, and validation.

The proof-of-concept target is a **Personal Task Management App** built with Next.js.

---

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+)
- [OpenCode](https://opencode.ai) CLI installed
- LLM access via [CLIProxyAPI](https://github.com/router-for-me/CLIProxyAPI) or direct Anthropic API key

### Setup

```bash
# 1. Clone the repo
git clone <repo-url> && cd Orka

# 2. Set LLM provider environment variables
export ANTHROPIC_BASE_URL=http://127.0.0.1:8317   # CLIProxyAPI (or https://api.anthropic.com)
export ANTHROPIC_AUTH_TOKEN=sk-your-key

# 3. Install app dependencies
cd app && npm install && cd ..

# 4. Launch OpenCode (the orchestrator)
opencode
```

### Running the Target App

```bash
cd app
npm run dev       # Dev server at http://localhost:3000
npm run build     # Production build
npm run test      # Jest unit tests
npm run lint      # ESLint
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        ORKA (OpenCode)                          │
│                      opencode.json config                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  specs/core.md ──► Orchestrator ──► specs/derived/WP-NNN-*.md   │
│  (source of truth)                  (work packages)             │
│                                                                 │
│  specs/new-features/ ──► /feature  ──► WP-NNN-*.md (additive)   │
│  specs/refactors/    ──► /refactor ──► WP-NNN-*.md              │
│  specs/bugs/         ──► /bug-report                            │
│                                                                 │
│         ┌───────────────────────────────────────┐               │
│         │       PIPELINE (/pipeline)            │               │
│         │                                       │               │
│         │ Review ──► Test ──► Validate          │               │
│         │   │          │         │              │               │
│         │  fail       fail      fail            │               │
│         │   ▼          ▼         ▼              │               │
│         │  .state/   .state/   .state/          │               │
│         └───────────────────────────────────────┘               │
│                          │                                      │
│                    pass all 3                                   │
│                          ▼                                      │
│                  output/*-accepted.txt                          │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                      LLM Provider                               │
│        claude-opus-4-5 (main) / claude-sonnet-4 (agents)        │
│             via CLIProxyAPI or direct Anthropic API             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
Orka/
├── opencode.json              ← OpenCode config (agents, commands, model)
├── AGENTS.md                  ← Project context loaded by OpenCode
├── .opencode/
│   ├── agents/                ← 6 specialized agent definitions
│   │   ├── orchestrator.md
│   │   ├── spec-writer.md
│   │   ├── implementer.md
│   │   ├── reviewer.md
│   │   ├── tester.md
│   │   └── validator.md
│   └── commands/              ← Custom pipeline commands
│       ├── derive.md
│       ├── feature.md
│       ├── refactor.md
│       ├── implement.md
│       ├── pipeline.md
│       ├── bug-report.md
│       └── status.md
├── specs/
│   ├── core.md                ← Core specification (single source of truth)
│   ├── STRUCTURE.md           ← Spec directory layout & permission rules
│   ├── derived/               ← Auto-generated work packages (WP-NNN-*.md)
│   ├── new-features/          ← Feature request drop zone (FEAT-NNN-*.md)
│   ├── refactors/             ← Refactor request drop zone (REFAC-NNN-*.md)
│   └── bugs/                  ← Bug reports (BUG-NNN-*.md)
├── app/                       ← Next.js target app (built by agents)
│   ├── src/
│   │   ├── app/               ← Next.js App Router pages
│   │   ├── components/        ← React components (Shadcn UI + custom)
│   │   ├── lib/               ← Types, store, utilities, seed data
│   │   ├── __tests__/         ← Jest unit tests
│   │   └── e2e/               ← Playwright end-to-end tests
│   └── package.json
├── docs/                      ← Documentation
├── .state/                    ← Pipeline execution state (JSON per stage)
└── output/                    ← Accepted pipeline outputs
```

---

## Agent Roles

Orka uses 6 specialized agents with strict permission boundaries. The key design principle is **spec isolation**: implementer and tester agents never see `specs/core.md` — they work exclusively from derived work packages.

| Agent | Reads core.md | Reads WPs | Writes code | Writes specs | Purpose |
|-------|:---:|:---:|:---:|:---:|---|
| **orchestrator** | YES | YES | NO | YES (WPs) | Derives WPs, runs pipeline, files bugs, tracks status |
| **spec-writer** | YES | YES | NO | YES | Drafts and refines specifications |
| **implementer** | NO | YES | YES | NO | Writes code from work packages only |
| **reviewer** | YES | YES | NO | NO | Reviews code quality and spec alignment (read-only) |
| **tester** | NO | YES | tests only | NO | Writes and runs Jest/Playwright tests |
| **validator** | YES | YES | NO | NO | Verifies every acceptance criterion, runs build/test/lint |

---

## Commands

All commands are run inside OpenCode:

| Command | Agent | Description |
|---------|-------|-------------|
| `/derive` | orchestrator | Generate/update work packages from `specs/core.md` |
| `/feature FEAT-NNN-*.md` | orchestrator | Generate WPs from a feature request (no core.md change) |
| `/refactor REFAC-NNN-*.md` | orchestrator | Generate WPs from a refactor request (no core.md change) |
| `/implement WP-NNN-*.md` | implementer | Implement a specific work package |
| `/pipeline` | orchestrator | Run review → test → validate quality gates |
| `/bug-report "description"` | orchestrator | File a bug report in `specs/bugs/` |
| `/status` | orchestrator | Show implementation progress vs acceptance criteria |

---

## Workflows

### Core Spec → Work Packages → Implementation

```
Human edits specs/core.md
  → /derive                      (orchestrator generates WPs)
  → /implement WP-NNN-*.md       (implementer writes code)
  → /pipeline                    (review → test → validate)
```

### Adding a Feature (without modifying core spec)

```
Create specs/new-features/FEAT-NNN-*.md
  → /feature FEAT-NNN-*.md       (orchestrator generates WPs)
  → /implement WP-NNN-*.md
  → /pipeline
```

### Refactoring

```
Create specs/refactors/REFAC-NNN-*.md
  → /refactor REFAC-NNN-*.md     (orchestrator generates WPs)
  → /implement WP-NNN-*.md
  → /pipeline
```

### Bug Fix Cycle

```
/bug-report "description"
  → Orchestrator files BUG-NNN in specs/bugs/
  → Orchestrator updates related WP with fix requirements
  → /implement WP-NNN-*.md
  → /pipeline
  → Update bug status to Fixed
```

See [docs/bug-workflow.md](docs/bug-workflow.md) for the full bug lifecycle.

---

## Quality Pipeline

The `/pipeline` command runs three sequential quality gates. Each produces a `VERDICT: PASS` or `VERDICT: FAIL`, and results are saved to `.state/` as JSON.

| Stage | Agent | What it checks |
|-------|-------|----------------|
| **Review** | reviewer | Code correctness, quality, and spec alignment |
| **Test** | tester | Writes regression tests, runs full test suite |
| **Validate** | validator | Verifies every acceptance criterion, runs build/test/lint |

All three stages must pass for the implementation to be accepted.

---

## Target App Tech Stack

The PoC app is a personal task manager with this stack:

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 (App Router) + Shadcn UI + Tailwind CSS 4 |
| Persistence | Browser localStorage (JSON) |

Single-user, no backend, no database, no authentication.

---

## Naming Conventions

| Artifact | Pattern | Example |
|----------|---------|---------|
| Work packages | `WP-NNN-short-title.md` | `WP-001-data-model.md` |
| Feature requests | `FEAT-NNN-short-title.md` | `FEAT-001-dark-mode.md` |
| Refactor requests | `REFAC-NNN-short-title.md` | `REFAC-001-extract-hooks.md` |
| Bug reports | `BUG-NNN-short-title.md` | `BUG-001-orphaned-subtasks.md` |
| Pipeline state | `<stage>-<iteration>.json` | `review-1.json` |
| Verdicts | `VERDICT: PASS` or `VERDICT: FAIL` | — |

---

## LLM Provider

Orka is configured to use Claude via [CLIProxyAPI](https://github.com/router-for-me/CLIProxyAPI), a local proxy that handles authentication and multi-account load balancing. To use a direct Anthropic API key instead, set `ANTHROPIC_BASE_URL=https://api.anthropic.com` and `ANTHROPIC_AUTH_TOKEN` to your key.

Models configured in `opencode.json`:
- **Primary (orchestrator):** `claude-opus-4-5`
- **Agents:** `claude-opus-4-5` (subagent mode)
