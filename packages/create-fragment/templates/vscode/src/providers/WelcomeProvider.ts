import * as vscode from 'vscode';
import type { VSCodeController } from '../controller/VSCodeController.js';
import { MODEL_COLORS, MODEL_LABELS, type ModelId } from '{{PACKAGE_SCOPE}}/core/shared/types.js';

export class WelcomeProvider {
  private panel?: vscode.WebviewPanel;

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly controller: VSCodeController,
  ) {}

  createPanel(): void {
    if (this.panel) {
      this.panel.reveal();
      return;
    }

    this.panel = vscode.window.createWebviewPanel(
      '{{PROJECT_NAME}}.welcome',
      'Fragment',
      vscode.ViewColumn.One,
      { enableScripts: false },
    );

    this.panel.webview.html = this.getHtml();

    this.panel.onDidDispose(() => {
      this.panel = undefined;
    });
  }

  private getHtml(): string {
    const state = this.controller.getState();
    const models = (['claude', 'codex', 'gemini'] as ModelId[]).map((m) => {
      const conn = state.models[m];
      const color = MODEL_COLORS[m];
      const dot = conn.status === 'connected'
        ? `<span style="color:${color}">●</span>`
        : `<span style="color:#555">○</span>`;
      return `${dot} ${MODEL_LABELS[m]}`;
    }).join('&nbsp;&nbsp;&nbsp;');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      min-height: 80vh; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: var(--vscode-editor-foreground, #e0e0e0);
      background: var(--vscode-editor-background, #0a0a12);
    }
    .logo {
      font-size: 42px; font-weight: bold; letter-spacing: -2px;
      background: linear-gradient(135deg, #ff8c32, #7c3aed);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .tagline { color: var(--vscode-descriptionForeground, #888); font-size: 14px; margin-top: 8px; }
    .version { color: var(--vscode-descriptionForeground, #555); font-size: 12px; margin-top: 16px; font-family: monospace; }
    .models { margin-top: 24px; font-size: 13px; }
  </style>
</head>
<body>
  <div class="logo">Fragment</div>
  <div class="tagline">Taming the fragmented agentic ecosystem</div>
  <div class="version">v${state.version}</div>
  <div class="models">${models}</div>
</body>
</html>`;
  }
}
