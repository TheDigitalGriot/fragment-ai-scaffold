# Fragment

A scaffold CLI for building multi-surface AI applications. Generate a monorepo with shared core logic and UI components that deploy to Electron, VS Code, and terminal (TUI) — each wired to talk to Claude, Codex, and Gemini.

## Quick Start

```bash
npm install
npx fragment init my-app --surfaces electron,vscode,tui --author "YourName"
cd my-app
```

## What You Get

```
my-app/
  packages/
    core/       # Shared state, event bus, controllers
    ui/         # React components (chat, timeline, model selector)
  apps/
    electron/   # Electron app with Forge, Vite, agent IPC
    vscode/     # VS Code extension with sidebar + panel webviews
    tui/        # Bubble Tea TUI with three-pane layout (Go)
```

## Surfaces

| Surface | Stack | Agent Transports |
|---------|-------|------------------|
| Electron | Vite + React + Forge | IPC to main process |
| VS Code | esbuild + React webviews | Extension host commands |
| TUI | Bubble Tea + Lip Gloss | CLI subprocess |

Each surface ships with agent adapters for Claude, Codex, and Gemini, a chat panel, brand panel, and tool timeline.

## CLI Commands

```bash
fragment init <name>           # Scaffold a new project
fragment add <surface>         # Add a surface to an existing project
```

## Plugin System

AI plugins can be wired into surfaces using the companion [fragment-plugin](https://github.com/TheDigitalGriot/fragment-plugin). See `plugins/` for the submodule.

## Development

```bash
npm test          # Run CLI tests
npm run build     # Compile TypeScript
```

## Project Structure

| Path | Description |
|------|-------------|
| `packages/fragment-cli/` | CLI tool — init, add, copier engine, token replacement |
| `packages/fragment-cli/templates/` | Surface templates copied during scaffold |
| `plugins/fragment-plugin/` | Claude Code plugin for wiring AI into surfaces (submodule) |

## License

MIT
