@AGENTS.md

# Developer / Claude Code Notes

`AGENTS.md` (imported above) is the canonical runbook — read it first; it is the single source of truth for how this app works and how changes ship. This file adds only Claude-specific notes on top.

- **Stay inside the customization boundary.** Repurposing this starter for a nonprofit means editing `config/app.ts`, `prompts/`, the domain tables in `lib/db/schema.ts`, the Zod contract in `lib/llm/schema.ts`, the email copy in `lib/email/`, and `vercel.json` — not the core. See [`config/README.md`](config/README.md).
- **Never push to `main`.** Branch + PR + preview, always (see the maintenance loop in `AGENTS.md`).
- **Verify before every PR:** `pnpm lint:migrations && pnpm lint && pnpm test && pnpm build`.
- **This repo is public** — no secrets, no client data, ever. Treat every file as world-readable.
