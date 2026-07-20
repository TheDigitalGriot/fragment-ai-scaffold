/**
 * Anthropic auth resolver — the canonical Griot / Prism auth protocol.
 *
 * Ported from Prism's `packages/prism-core/src/core/api/auth.ts` (the source of
 * truth). Every scaffolded Griot tool authenticates the same way, STRICT
 * subscription-first:
 *
 *   1. Prefer the Claude Max subscription — a Claude Code OAuth token in
 *      `CLAUDE_CODE_OAUTH_TOKEN` (produced by `claude setup-token`). Requests
 *      then bill against the subscription with no per-token API fees.
 *   2. Use a metered `ANTHROPIC_API_KEY` ONLY when the subscription token is
 *      absent AND `GRIOT_ALLOW_METERED` is explicitly set — the flag-gated
 *      escape hatch (mirroring the Fable 5 flag). By default a Griot tool never
 *      silently bills the metered API.
 *   3. Otherwise `none` (with an actionable message) — never a silent hard-fail
 *      and never a silent metered downgrade.
 *
 * The Claude Agent SDK and the `claude` CLI both read these same env vars, so
 * resolving here gives the app one explicit, observable auth decision. For a raw
 * `@anthropic-ai/sdk` client, send the subscription token as
 * `Authorization: Bearer <authToken>` with the `anthropic-beta: OAUTH_BETA_HEADER`
 * header (never as `x-api-key`).
 */

/** Env var carrying a Claude Code subscription OAuth token (`claude setup-token`). */
export const OAUTH_TOKEN_ENV = 'CLAUDE_CODE_OAUTH_TOKEN';

/** Env var carrying a metered Anthropic API key (fallback). */
export const API_KEY_ENV = 'ANTHROPIC_API_KEY';

/** Beta header required to authenticate the raw Messages API with an OAuth token. */
export const OAUTH_BETA_HEADER = 'oauth-2025-04-20';

/**
 * Env var that opts INTO the metered API-key fallback. Absent/empty = STRICT
 * subscription-only: a missing subscription token resolves to `none`, never a
 * silent metered call. Truthy values: 1/true/yes/on.
 */
export const ALLOW_METERED_ENV = 'GRIOT_ALLOW_METERED';

/** Which credential the app is using. */
export type AuthMode = 'subscription' | 'api-key' | 'none';

export type ResolvedAuth =
  | { mode: 'subscription'; authToken: string }
  | { mode: 'api-key'; apiKey: string }
  | { mode: 'none' };

function flagEnabled(value: string | undefined): boolean {
  if (!value) return false;
  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
}

/**
 * Resolve which Claude credential to use — STRICT subscription-first. The
 * subscription OAuth token always wins; the metered API key is used only when
 * `GRIOT_ALLOW_METERED` is set; otherwise `none`.
 *
 * @param env Environment to read (defaults to `process.env`).
 */
export function resolveAnthropicAuth(
  env: Record<string, string | undefined> = typeof process !== 'undefined'
    ? process.env
    : {},
): ResolvedAuth {
  const oauth = env[OAUTH_TOKEN_ENV]?.trim();
  if (oauth) return { mode: 'subscription', authToken: oauth };
  const key = env[API_KEY_ENV]?.trim();
  if (key && flagEnabled(env[ALLOW_METERED_ENV])) return { mode: 'api-key', apiKey: key };
  return { mode: 'none' };
}

/** One-line, user-facing description of the active auth mode (for UI / logs). */
export function describeAuth(auth: ResolvedAuth): string {
  switch (auth.mode) {
    case 'subscription':
      return 'Claude Max subscription (CLAUDE_CODE_OAUTH_TOKEN)';
    case 'api-key':
      return 'Metered Anthropic API key (ANTHROPIC_API_KEY)';
    case 'none':
      return 'No Claude subscription — run `claude setup-token` to use your Max subscription (metered API keys require GRIOT_ALLOW_METERED=1)';
  }
}

/**
 * Build the environment a spawned `claude` CLI / Agent-SDK child process should
 * inherit, ensuring the resolved credential is present. Returns the base env
 * unchanged when `mode === 'none'` (the caller should surface `describeAuth`).
 */
export function authEnv(
  auth: ResolvedAuth,
  base: Record<string, string | undefined> = typeof process !== 'undefined'
    ? process.env
    : {},
): Record<string, string | undefined> {
  if (auth.mode === 'subscription') return { ...base, [OAUTH_TOKEN_ENV]: auth.authToken };
  if (auth.mode === 'api-key') return { ...base, [API_KEY_ENV]: auth.apiKey };
  return { ...base };
}
