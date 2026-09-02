<!-- BEGIN AGENT-SKILLS -->
# agent-skills — Agent Instructions

Framework-agnostic engineering skills and hard safety rules for Claude Code, Cursor, and Codex.

**Source of truth for skills:** `.claude/skills/` (mirrored to `.cursor/skills/` and Codex `.agents/skills/`).

## Hard Rules (always apply)

These override convenience. Full text lives under `.claude/rules/` and `.cursor/rules/`.

### 0 — No automatic deletion
Never delete files, directories, DB rows, volumes, caches, or remote resources without **explicit** user confirmation for that specific destructive op. Plan approval does not authorize deletes inside the plan.

### 1 — No removing defense-in-depth without proof
Do not remove a guard, fallback, retry, or “redundant” check that backs another mechanism unless (a) the primary is proven in all target environments, (b) telemetry shows the backup never fired, and (c) the user explicitly confirms removal.

### 2 — Plan before execute
For non-trivial work (multi-file, schema, deps, new features, refactors): write a plan, wait for explicit approval, then execute. Trivial exemptions: one-line typo, format-only, pure rename with zero callsites.

## Core Principles

1. **Test-driven** — tests before implementation when changing behavior; aim 80%+ coverage on new code.
2. **Immutability** — return new objects; do not mutate in place.
3. **Validate at boundaries** — never trust external input / API payloads.
4. **Verification ≠ tsc** — prove expected vs observed for computed values, functionality, and side effects (`verification` skill).
5. **Stack-agnostic rules** — prefer pseudocode and neutral wording in skills; framework specifics are optional examples.

## Codex Skill Discovery

Codex loads skills from `.agents/skills/<name>/SKILL.md` (each includes `agents/openai.yaml`). Prefer the skill that matches the task; do not load every skill into context.

Start with: `using-agent-skills`, then lifecycle / `be-*` / `fe-*` / verify skills as needed.

## Codex Supplement

See `.codex/AGENTS.md` for Codex-specific MCP, sandbox, multi-agent roles, and hook-parity limits.

## Shared References

- `.claude/shared/api-conventions.md` — API envelope
- `.claude/shared/security-baseline.md` — auth / secrets defaults
- `.claude/shared/commit-style.md` — commit conventions
<!-- END AGENT-SKILLS -->
