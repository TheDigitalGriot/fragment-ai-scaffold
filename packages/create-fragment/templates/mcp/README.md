# {{PROJECT_NAME}} — local stdio MCP server

A scaffold for a **local stdio MCP server** that ships the **no-orphan stdio hygiene standard**
by default. Two interchangeable variants are emitted — pick one, delete the other:

- `python/` — the reference implementation (mirrors Cinopsis v2.1.3, which proved the standard).
  Native Windows `KILL_ON_JOB_CLOSE` Job Object launcher.
- `ts/` — a `@modelcontextprotocol/sdk` server for TS-native stacks. Portable child-reaper
  (see `ts/src/launcher.ts` for the honest Windows Job Object caveat).

## The standard both variants enforce

A local stdio MCP server talks JSON-RPC over **stdout**, so any child process it shells out to
can corrupt the protocol or hang the server. The 5 rules (source:
`cl-plugin-structure` → `references/mcp-patterns.md` → "Local stdio server hygiene"):

1. **stdout is sacred** — it *is* the JSON-RPC channel. Never let a shelled-out child write to
   it; route wrapped-subprocess output to stderr or return it as a structured tool result.
2. **`stdin = DEVNULL`** on every shelled-out child. On Windows a child otherwise inherits the
   server's stdin JSON-RPC pipe and blocks until timeout — the 60s hang (python-sdk #671,
   CPython #19575).
3. **Sanitize the child env** — strip `HTTP/HTTPS/ALL_PROXY`/`NO_PROXY` the host or VM may inject.
4. **Interpreter-first binary resolution** — prefer a bundled/venv binary over PATH/user-site.
5. **`KILL_ON_JOB_CLOSE` launcher** — bind the server child to a Windows Job Object so the host
   reaps it instead of orphaning it.

**Anti-patterns:** no second stdin reader (corrupts the protocol); no pre-spawn process scan
(risks the ~5s spawn timeout, #61524).

## Wire it into your plugin

Add to your plugin `.mcp.json` (Python variant shown — it self-reaps via the launcher):

```json
{
  "mcpServers": {
    "{{PROJECT_NAME}}": { "command": "python", "args": ["apps/mcp/python/mcp_launcher.py"] }
  }
}
```

Then replace the example `run_command` tool with your real tools — **keep the hygiene helpers**.
