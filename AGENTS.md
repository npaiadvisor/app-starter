<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Agent Runbook

The **canonical runbook for any AI coding agent** working on this repo (OpenAI Codex, GitHub Copilot, Google Jules, Cursor, Claude Code). Written so a competent agent can make a correct, safe change from this file alone. `CLAUDE.md` imports this file (`@AGENTS.md`) and adds only Claude-specific notes — so this file stays the single source of truth.

> This is a **starter** from the [Nonprofit AI Commons](https://github.com/npaiadvisor/discovery). The reference vertical: *monitor sources → produce an AI brief → a human reviews before anything goes out.* To repurpose it for a nonprofit, change only the customization surface in **[`config/README.md`](config/README.md)**.

## Who maintains this system

A **non-technical operator** evolves this system by talking to an AI coding agent (you) in plain English. Your job: turn a request into a small, correct change, **open a Pull Request**, and let Vercel preview-deploy it for review and merge. They do not read or write code.

Two hard invariants, always:
- **You never push directly to `main`.** Every change ships through a Pull Request.
- **The system never sends outbound communication automatically.** Every outbound message is human-sent after manual review of an AI draft. Do not add auto-send.

## The maintenance loop (how every change ships)

1. Work on a branch — never commit to `main`.
2. Make the smallest change that satisfies the request.
3. Verify locally (see **Verify before every PR**).
4. Open a Pull Request with a plain-English title and a *what changed and why* description.
5. Vercel auto-deploys a **preview** and posts its URL on the PR. The operator reviews there.
6. On approval, merge to `main`; production redeploys automatically.
7. If the preview looks wrong, the operator comments — revise on the same branch and push again.

Branch protection blocks direct pushes to `main`, so a PR is the only path. **Every change passes through a preview before it reaches production** — that is the safety model.

## Talking to the operator — plain language only

The operator is **non-technical**. They must not need to understand branches, PRs, merges, deploys, previews, or migrations — that machinery is **your** concern. Never use git/dev jargon with them. Say *"I've made the change,"* *"here's a link to preview it,"* *"want me to publish it?,"* *"it's now live,"* *"I've undone that."* Do every mechanical step yourself, hand them the preview link in chat, and publish (merge) on their plain-language approval. Their model is: **ask → look at a preview → say "publish it."**

## Tech stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4 (plain RSC + server actions)
- Auth.js v5 (`next-auth@beta`) — Google OAuth + email allowlist + database sessions
- Drizzle ORM + Neon Postgres (HTTP driver)
- IDs: cuid2 (`lib/db/id.ts`)
- Vercel + Vercel Cron
- pnpm (use pnpm, never npm/yarn)

```bash
pnpm dev                  # local dev (http://localhost:3000)
pnpm build                # production build
pnpm lint                 # eslint
pnpm lint:migrations      # destructive-migration annotation check
pnpm test                 # deterministic eval suite (contract + judge) — the CI gate
pnpm db:generate          # generate a SQL migration from schema.ts changes
pnpm db:migrate           # apply pending migrations to DATABASE_URL (manual)
pnpm test:eval            # live LLM eval proof (spends tokens, needs .env.local)
```

## Verify before every PR

```bash
pnpm lint:migrations && pnpm lint && pnpm test && pnpm build
```

If you edit `prompts/agent-*.md`, additionally run `pnpm test:eval` (needs `.env.local`; spends tokens against the cost cap) and confirm the eval results hold before merging.

## Database & migrations (the danger zone)

- Drizzle ORM + Neon Postgres. Schema in `lib/db/schema.ts`; generated SQL in `drizzle/migrations/`.
- To change the schema: edit `lib/db/schema.ts`, then `pnpm db:generate`. **Never hand-edit generated migration SQL.**
- **Destructive ops** (`DROP TABLE/COLUMN`, type narrowing) **must have `-- DESTRUCTIVE` as the first line** of the migration `.sql`. CI (`pnpm lint:migrations`) blocks unannotated destructive ops. This rail is non-negotiable.
- **Migrate-on-deploy:** `vercel.json`'s build command runs `pnpm db:migrate:deploy` before the build. A PR's preview migrates its own throwaway Neon branch (isolated from prod); merging to `main` migrates production. So adding a column is self-service: edit schema → `pnpm db:generate` → PR → review preview → merge.

## Safe to change vs. escalate

**Safe (the bulk of maintenance):** briefing email wording/layout/fields (`lib/email/`), admin UI columns/labels/filters (`app/admin/*`), threshold tuning, adding/relabelling an enum value, prompt refinements (`prompts/` — run the eval gate), adding a non-destructive field/column.

**Escalate to a developer — do NOT change without flagging:** auth + `ADMIN_ALLOWED_EMAILS` (`auth.ts`, `proxy.ts`); secrets, env vars, OAuth tokens, the LLM **cost cap**; the cron schedule (`vercel.json`); **destructive migrations**; anything adding automatic outbound communication.

## Key invariants (preserve when changing code)

- **Cron handlers** (`/api/cron/*`): auth via `Authorization: Bearer ${CRON_SECRET}`; `runtime = "nodejs"` + `dynamic = "force-dynamic"`; each calls `recordRunStart`/`recordRunFinish` (`lib/cron-runs/recorder.ts`) in both success and catch paths. Vercel env changes don't trigger a redeploy — push a commit to apply new env values.
- **LLM output is Zod-validated** against `lib/llm/schema.ts` — the single source of the output contract/invariants. Keep validation; change the contract there, not in the caller.
- **Eval harness:** deterministic checks (`lib/llm/contract.ts` + `judge.ts`) run in CI via `pnpm test` (free, no LLM) — the regression net. The live eval (`pnpm test:eval`) spends tokens and is manual, not a CI gate.
- **Idempotent writes:** capture and per-run records use deterministic ids so a same-day re-run overwrites in place.

## CRITICAL: Security

This repo may be **public** — write every file as if world-readable. No `.env*` committed, no API keys in code/fixtures/migrations, no real client or contact data in tests. Secrets live only in `.env.local` (local) and the Vercel project env (deploy). See [`SANITIZATION.md`](SANITIZATION.md).
