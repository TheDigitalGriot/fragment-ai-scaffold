---
name: fragment-status
description: Report what AI plugins are wired into which Fragment surfaces. Shows connection health, MCP servers, hooks, and surface status.
---

# Fragment Status

Reports the current wiring state of a Fragment project.

## Usage

Run from within a Fragment project directory.

## Steps

1. Run `detect-surfaces.py` to find which surfaces exist in `apps/`
2. For each surface, check for wiring indicators:
   - **Electron**: Check `src/main.ts` for MCP IPC handlers
   - **VS Code**: Check `package.json` for plugin-contributed commands
   - **TUI**: Check `main.go` for registered plugin tabs
3. Look for `.claude-plugin/plugin.json` to identify the AI plugin
4. Report:
   - Which surfaces exist (electron, vscode, tui)
   - Which MCP servers are wired per surface
   - Which hooks are active
   - Connection health per model (claude, codex, gemini)
   - Any missing wiring (surface exists but plugin not connected)

## Output Format

```
Fragment Status: my-project
─────────────────────────
Surfaces:
  ● electron — 2 MCP servers wired
  ● vscode   — 2 MCP servers wired
  ○ tui      — not wired

Plugin: my-ai-plugin
  MCP Servers: porter, channel
  Hooks: SessionStart, Stop

Models:
  ● Claude  — CLAUDE_CODE_OAUTH_TOKEN set
  ○ Codex   — codex CLI not found
  ○ Gemini  — gemini CLI not found
```
