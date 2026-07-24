"""No-orphan stdio hygiene helpers for a local stdio MCP server.

The 5 rules (cl-plugin-structure -> references/mcp-patterns.md, proven in Cinopsis v2.1.3):
  1. stdout is sacred -- it IS the JSON-RPC channel; never let a shelled-out child write to it.
  2. stdin=DEVNULL on every child -- else on Windows the child inherits the server's stdin
     JSON-RPC pipe and blocks until timeout (python-sdk #671, CPython #19575).
  3. sanitize the child env -- strip proxy vars the host/VM may inject.
  4. interpreter-first binary resolution -- prefer a bundled/venv binary over PATH/user-site.
  5. KILL_ON_JOB_CLOSE launcher -- see mcp_launcher.py.
Anti-patterns: no second stdin reader; no pre-spawn process scan.
"""
from __future__ import annotations

import os
import shutil
import subprocess
import sys
from pathlib import Path

_PROXY_VARS = ("HTTP_PROXY", "HTTPS_PROXY", "ALL_PROXY", "NO_PROXY")


def sanitized_env(extra: dict[str, str] | None = None) -> dict[str, str]:
    """Child env with proxy vars stripped (rule 3)."""
    env = {k: v for k, v in os.environ.items() if k.upper() not in _PROXY_VARS}
    if extra:
        env.update(extra)
    return env


def find_binary(name: str) -> str:
    """Resolve a helper binary interpreter-first (rule 4): prefer this interpreter's own
    environment (venv Scripts/bin) before falling back to PATH, so a stale user-site copy
    never wins."""
    bindir = Path(sys.executable).parent
    for cand in (bindir / name, bindir / f"{name}.exe"):
        if cand.is_file():
            return str(cand)
    found = shutil.which(name)
    if found:
        return found
    raise FileNotFoundError(f"binary not found interpreter-first or on PATH: {name}")


def run_child(
    cmd: list[str],
    *,
    timeout: float | None = None,
    extra_env: dict[str, str] | None = None,
) -> subprocess.CompletedProcess:
    """Run a shelled-out child with full stdio hygiene:
      - stdin=DEVNULL           (rule 2 -- THE Windows hang fix)
      - stdout/stderr captured  (rule 1 -- never leaks onto the server's JSON-RPC stdout)
      - proxy-sanitized env     (rule 3)
    Return the CompletedProcess; the caller returns child stdout as a structured tool result
    and routes any human-readable diagnostics to stderr, NEVER to stdout.
    """
    return subprocess.run(
        cmd,
        stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        env=sanitized_env(extra_env),
        text=True,
        timeout=timeout,
        check=False,
    )


def log(*args: object) -> None:
    """Diagnostics go to stderr -- stdout is the JSON-RPC channel (rule 1)."""
    print(*args, file=sys.stderr, flush=True)
