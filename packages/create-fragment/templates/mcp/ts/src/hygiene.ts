/**
 * No-orphan stdio hygiene helpers for a local stdio MCP server (Node/TypeScript).
 *
 * The 5 rules (cl-plugin-structure -> references/mcp-patterns.md; proven in Cinopsis v2.1.3):
 *  1. stdout is the JSON-RPC channel -- never let a shelled-out child write to it.
 *  2. stdin ignored on every child -- the Node equivalent of stdin=DEVNULL.
 *  3. sanitize the child env -- strip proxy vars the host/VM may inject.
 *  4. interpreter-first / bundled-first binary resolution.
 *  5. KILL_ON_JOB_CLOSE launcher -- see launcher.ts.
 * Anti-patterns: no second stdin reader; no pre-spawn process scan.
 */
import { spawn, type ChildProcess, type SpawnOptions } from 'node:child_process';
import { existsSync } from 'node:fs';
import { delimiter, join } from 'node:path';
import { track } from './launcher.js';

const PROXY_VARS = ['HTTP_PROXY', 'HTTPS_PROXY', 'ALL_PROXY', 'NO_PROXY'];

/** Child env with proxy vars stripped (rule 3). */
export function sanitizedEnv(extra: Record<string, string> = {}): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = {};
  for (const [k, v] of Object.entries(process.env)) {
    if (v !== undefined && !PROXY_VARS.includes(k.toUpperCase())) env[k] = v;
  }
  return { ...env, ...extra };
}

/** Resolve a helper binary bundled-first (rule 4): prefer the given bundled dirs before PATH,
 * so a stale global copy never wins. */
export function findBinary(name: string, bundledDirs: string[] = []): string {
  const exe = process.platform === 'win32' ? `${name}.exe` : name;
  for (const dir of bundledDirs) {
    const cand = join(dir, exe);
    if (existsSync(cand)) return cand;
  }
  for (const dir of (process.env.PATH ?? '').split(delimiter)) {
    if (!dir) continue;
    const cand = join(dir, exe);
    if (existsSync(cand)) return cand;
  }
  throw new Error(`binary not found bundled-first or on PATH: ${name}`);
}

export interface ChildResult {
  code: number | null;
  stdout: string;
  stderr: string;
}

/**
 * Run a shelled-out child with full stdio hygiene:
 *   - stdio: ['ignore', 'pipe', 'pipe']  (rule 2 -- 'ignore' stdin = DEVNULL equivalent; the
 *     child never inherits the server's JSON-RPC stdin pipe)
 *   - stdout/stderr captured             (rule 1 -- never written to the server's stdout)
 *   - proxy-sanitized env                (rule 3)
 * The child is tracked for reaping (rule 5).
 */
export function runChild(
  cmd: string,
  args: string[],
  opts: { timeoutMs?: number; extraEnv?: Record<string, string> } = {},
): Promise<ChildResult> {
  return new Promise<ChildResult>((resolvePromise, reject) => {
    const spawnOpts: SpawnOptions = {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: sanitizedEnv(opts.extraEnv),
    };
    const child: ChildProcess = spawn(cmd, args, spawnOpts);
    track(child);
    let stdout = '';
    let stderr = '';
    child.stdout?.on('data', (d: Buffer) => (stdout += d.toString()));
    child.stderr?.on('data', (d: Buffer) => (stderr += d.toString()));
    let timer: NodeJS.Timeout | undefined;
    if (opts.timeoutMs) timer = setTimeout(() => child.kill('SIGKILL'), opts.timeoutMs);
    child.on('error', (e) => {
      if (timer) clearTimeout(timer);
      reject(e);
    });
    child.on('close', (code) => {
      if (timer) clearTimeout(timer);
      resolvePromise({ code, stdout, stderr });
    });
  });
}

/** Diagnostics go to stderr -- stdout is the JSON-RPC channel (rule 1). Never console.log(). */
export function log(...args: unknown[]): void {
  process.stderr.write(args.map(String).join(' ') + '\n');
}
