/**
 * Per-deployment configuration knobs — the customize-for-each-client boundary.
 *
 * The reusable core reads client-specific values from here (or the matching env
 * vars) so nothing client-specific is hard-coded in core code. CLAUDE.md and
 * AGENTS.md list the full customization surface (prompts/, the domain schema,
 * email copy, the cron schedule in vercel.json).
 */

// Display name of this assistant — used in OpenRouter attribution + UI copy.
export const APP_NAME = process.env.APP_NAME ?? "Nonprofit AI Assistant";

// OpenRouter attribution headers — https://openrouter.ai/docs
export const OPENROUTER_REFERER =
  process.env.OPENROUTER_REFERER ?? "https://github.com/npaiadvisor/app-starter";
export const OPENROUTER_TITLE = process.env.OPENROUTER_TITLE ?? APP_NAME;

// Address that briefing + health emails are sent from. Set FROM_ADDRESS per client.
export const FROM_ADDRESS = process.env.FROM_ADDRESS ?? "alerts@example.org";

// Operator "Make a change" launch-page links (the client's runbook / docs folder).
// Set at handoff; default to "#" so the page renders before they're configured.
export const OPERATOR_DOCS_URL = process.env.OPERATOR_DOCS_URL ?? "#";
export const OPERATOR_README_URL = process.env.OPERATOR_README_URL ?? "#";
