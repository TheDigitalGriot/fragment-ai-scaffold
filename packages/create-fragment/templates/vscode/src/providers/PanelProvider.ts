import * as vscode from 'vscode';
import type { VSCodeController } from '../controller/VSCodeController.js';
import { isGrpcRequest } from '{{PACKAGE_SCOPE}}/core/shared/messages.js';

export class PanelProvider {
  private panel?: vscode.WebviewPanel;

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly controller: VSCodeController,
  ) {
    controller.on('state-changed', (state) => {
      this.panel?.webview.postMessage({
        type: 'state-update',
        state: JSON.stringify(state),
      });
    });
  }

  createPanel(): void {
    if (this.panel) {
      this.panel.reveal(vscode.ViewColumn.Two);
      return;
    }

    this.panel = vscode.window.createWebviewPanel(
      '{{PROJECT_NAME}}.timeline',
      'Tool Timeline',
      { viewColumn: vscode.ViewColumn.Two, preserveFocus: true },
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.joinPath(this.extensionUri, 'webview-panel', 'dist'),
        ],
      },
    );

    this.panel.webview.html = this.getHtml(this.panel.webview);

    this.panel.webview.onDidReceiveMessage(async (msg) => {
      if (isGrpcRequest(msg)) {
        await this.controller.handleRequest(
          async (response) => {
            this.panel?.webview.postMessage(response);
          },
          msg.grpc_request,
        );
      }
    });

    this.panel.onDidDispose(() => {
      this.panel = undefined;
    });
  }

  private getHtml(webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'webview-panel', 'dist', 'assets', 'index.js')
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'webview-panel', 'dist', 'assets', 'index.css')
    );
    const nonce = getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
  <link rel="stylesheet" href="${styleUri}">
</head>
<body data-platform="vscode">
  <div id="root"></div>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }
}

function getNonce(): string {
  let text = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return text;
}
