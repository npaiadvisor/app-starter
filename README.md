# app-starter — Shape A (custom AI web-app)

A starter for a **custom AI web-app assistant** for a nonprofit: monitor sources on a schedule → produce an AI brief / draft → a human reviews before anything goes out → log it. Part of the [Nonprofit AI Commons](https://github.com/npaiadvisor/discovery).

> **Status:** early but runnable. Extracted from a production donor-outreach system and scrubbed of client specifics; `pnpm build` passes. The example domain (donor/prospect outreach) is preserved as the reference vertical — fully abstracting it to a domain-neutral core is a tracked follow-on.

## Stack

- **Next.js** (App Router) + TypeScript, deployed to **Vercel**
- **Postgres on Neon** + Drizzle ORM (with per-PR *preview database* branches)
- **OpenRouter** for the app's LLM calls, with a hard monthly cost cap
- **Auth.js** + Google OAuth (email allowlist)
- **Vercel Cron** for scheduled jobs

## The handoff promise

This starter bakes in the safety rails that let a non-technical nonprofit maintain the app by talking to a coding agent:

- **Pull-request-only to `main`** (branch protection) — every change gets a Vercel preview first.
- **Preview-database migration testing** — schema changes are tried against a throwaway DB branch before they touch production.
- **A destructive-migration guard** — column/table drops require an explicit annotation; unannotated ones are blocked in CI.
- **`AGENTS.md` + `CLAUDE.md` + `docs/`** — a runbook a coding agent (Codex / Jules / Copilot / Claude Code) can read to make safe changes.

## Customize vs core

Everything client-specific — the domain taxonomy, the agent prompts, the output schema, the email copy, the schedule — lives in a clearly marked `config/` + `prompts/` layer. The reusable core underneath is meant to be left alone.

## Quickstart

```bash
pnpm install
cp .env.example .env.local   # fill in DATABASE_URL, AUTH_SECRET, OPENROUTER_API_KEY, …
pnpm build                   # or: pnpm dev
```

Deploy to Vercel + Neon and set the same env vars in the Vercel project. `AGENTS.md` explains how changes ship (PR → preview → merge) and the safe-vs-escalate boundary.

## Scaffolding it for a client

Use the [`np-ai-discovery`](https://github.com/npaiadvisor/discovery) skill to fork and configure this starter for a specific nonprofit, or fork directly and customize only this layer: `config/app.ts`, `prompts/`, the domain tables in `lib/db/schema.ts`, the Zod contract in `lib/llm/schema.ts`, the email copy in `lib/email/`, and `vercel.json`. Leave the core alone.

## License

Code [MIT](LICENSE). Docs CC BY-SA 4.0. See the [commons](https://github.com/npaiadvisor/discovery) for the contribution and sanitization rules.
