---
name: fragment-connect
description: Wire an AI plugin (from /cl-plugin-structure) into Fragment-scaffolded surfaces. Detects existing surfaces, reads the plugin manifest, and generates glue code for Electron, VS Code, and TUI.
---

# Fragment Connect

Wires an AI plugin into Fragment-generated UI surfaces.

## Prerequisites

- A Fragment-scaffolded project (created with `fragment init`)
- An AI plugin directory with `.claude-plugin/plugin.json` (from `/cl-plugin-structure`)

## Usage

Run this skill from within a Fragment project directory that also contains an AI plugin.

## Steps

1. Run `detect-surfaces.py` to find which surfaces exist in `apps/`
2. Read the AI plugin's `.claude-plugin/plugin.json` to discover MCP servers, skills, hooks
3. For each detected surface, generate the wiring:

   **Electron** (`apps/electron/`):
   - Add MCP server IPC handlers to `src/main.ts`
   - Wire tool calls from MCP servers into the tool timeline
   - Add plugin-specific commands to the renderer

   **VS Code** (`apps/vscode/`):
   - Register MCP tool commands in `package.json` contributes
   - Add tree view providers for plugin resources
   - Wire tool calls into the timeline panel

   **TUI** (`apps/tui/`):
   - Generate tab plugins implementing the Plugin interface
   - Register new tabs in `main.go`
   - Wire tool calls into the timeline pane

4. Report what was wired and suggest next steps

## When to Use the Connector Agent

If the plugin has multiple MCP servers or non-standard tool configurations, invoke the `connector-agent` for complex wiring logic rather than attempting template-based generation.
