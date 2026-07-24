/**
 * Child-reaper for the MCP server (rule 5, portable best-effort).
 *
 * Node has no native Windows Job Object, so a *guaranteed* KILL_ON_JOB_CLOSE needs a native
 * addon. This launcher provides the portable equivalent: every tracked child is killed when the
 * server process exits or is signalled, so a crash or host disconnect does not orphan
 * shelled-out children.
 *
 * For guaranteed OS-level reaping on Windows (the standard's rule 5 in full), either:
 *   - run the server behind the Python launcher (`../python/mcp_launcher.py`, native Job Object), or
 *   - add a Job Object native addon and assign children to a KILL_ON_JOB_CLOSE job here.
 */
import type { ChildProcess } from 'node:child_process';

const children = new Set<ChildProcess>();

/** Register a spawned child so it is reaped when this process exits. Called by runChild(). */
export function track(child: ChildProcess): void {
  children.add(child);
  child.on('close', () => children.delete(child));
}

function reapAll(): void {
  for (const c of children) {
    try {
      c.kill('SIGKILL');
    } catch {
      /* already gone */
    }
  }
  children.clear();
}

let installed = false;

/** Install exit/signal handlers that reap all tracked children. Idempotent; call once at startup. */
export function installReaper(): void {
  if (installed) return;
  installed = true;
  process.on('exit', reapAll);
  for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP'] as const) {
    process.on(sig, () => {
      reapAll();
      process.exit(0);
    });
  }
}
