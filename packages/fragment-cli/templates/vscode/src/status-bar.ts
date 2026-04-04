import * as vscode from 'vscode';
import type { VSCodeController } from './controller/VSCodeController.js';
import { MODEL_LABELS, type ModelId } from '{{PACKAGE_SCOPE}}/core/shared/types.js';

export function createStatusBar(controller: VSCodeController): vscode.StatusBarItem {
  const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  item.command = '{{PROJECT_NAME}}.openWelcome';

  function update() {
    const state = controller.getState();
    const connected = (['claude', 'codex', 'gemini'] as ModelId[])
      .filter((m) => state.models[m].status === 'connected')
      .map((m) => MODEL_LABELS[m]);

    item.text = `$(symbol-misc) Fragment: ${connected.length}/3`;
    item.tooltip = connected.length > 0
      ? `Connected: ${connected.join(', ')}`
      : 'No models connected';
    item.show();
  }

  controller.on('state-changed', update);
  update();

  return item;
}
