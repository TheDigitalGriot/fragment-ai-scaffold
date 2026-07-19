/**
 * {{PROJECT_NAME}} — DriveIntent
 *
 * A surface-agnostic "advance the session" signal. A click in ANY surface can
 * emit a DriveIntent; each surface routes it into the SAME agent call the chat
 * box uses (BaseController 'chat-message'). This is Fragment's analogue of
 * Claude Desktop's sendPrompt: the `content` MUST be a fully-formed instruction,
 * because the driven turn carries no other context than what you put in it.
 *
 * Fragment apps embed their own agent in-process/turn-based, so click-to-drive
 * is DIRECT agent input — NOT a Claude Code channel/wake (there is nothing idle
 * to wake). See .prism click-to-drive harvest for the full rationale.
 */
import type { ModelId } from './types.js';

export interface DriveIntent {
  /** Which embedded agent to drive (defaults to the active model). */
  model?: ModelId;
  /** Fully-formed instruction — must self-carry intent (chosen option + goal). */
  content: string;
  /** Provenance, e.g. "plugin:my-plugin" or "surface:electron". */
  source?: string;
  /** Optional string metadata (keys: [A-Za-z0-9_]). */
  meta?: Record<string, string>;
  /** Optional routing tag (parity with a channel session_id). */
  sessionId?: string;
}
