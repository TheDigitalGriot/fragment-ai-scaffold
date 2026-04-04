# Fragment

[![GitHub release](https://img.shields.io/github/v/release/TheDigitalGriot/fragment-ai-scaffold?include_prereleases&label=version)](https://github.com/TheDigitalGriot/fragment-ai-scaffold/releases)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/typescript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Electron](https://img.shields.io/badge/surface-Electron-47848F.svg)](https://www.electronjs.org/)
[![VS Code](https://img.shields.io/badge/surface-VS_Code-007ACC.svg)](https://code.visualstudio.com/)
[![TUI](https://img.shields.io/badge/surface-TUI_(Bubble_Tea)-FF6EC7.svg)](https://github.com/charmbracelet/bubbletea)
[![Claude](https://img.shields.io/badge/agent-Claude-D97706.svg)](https://claude.ai)
[![Codex](https://img.shields.io/badge/agent-Codex-412991.svg)](https://openai.com)
[![Gemini](https://img.shields.io/badge/agent-Gemini-4285F4.svg)](https://deepmind.google/technologies/gemini/)
[![GitHub last commit](https://img.shields.io/github/last-commit/TheDigitalGriot/fragment-ai-scaffold)](https://github.com/TheDigitalGriot/fragment-ai-scaffold/commits/main)
[![GitHub stars](https://img.shields.io/github/stars/TheDigitalGriot/fragment-ai-scaffold?style=social)](https://github.com/TheDigitalGriot/fragment-ai-scaffold)

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
