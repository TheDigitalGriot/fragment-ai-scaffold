import * as vscode from 'vscode';
import { VSCodeController } from './controller/VSCodeController.js';
import { SidebarProvider } from './providers/SidebarProvider.js';
import { PanelProvider } from './providers/PanelProvider.js';
import { WelcomeProvider } from './providers/WelcomeProvider.js';
import { AgentManager } from './agents/manager.js';
import { createStatusBar } from './status-bar.js';

let controller: VSCodeController;
let agentManager: AgentManager;

export function activate(context: vscode.ExtensionContext) {
  controller = new VSCodeController();
  agentManager = new AgentManager(controller);

  // Sidebar: Agentic Chat
  const sidebarProvider = new SidebarProvider(context.extensionUri, controller);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('{{PROJECT_NAME}}.chat', sidebarProvider)
  );

  // Panel: Tool Timeline
  const panelProvider = new PanelProvider(context.extensionUri, controller);
  context.subscriptions.push(
    vscode.commands.registerCommand('{{PROJECT_NAME}}.openTimeline', () => {
      panelProvider.createPanel();
    })
  );

  // Welcome tab
  const welcomeProvider = new WelcomeProvider(context.extensionUri, controller);
  context.subscriptions.push(
    vscode.commands.registerCommand('{{PROJECT_NAME}}.openWelcome', () => {
      welcomeProvider.createPanel();
    })
  );

  // Status bar
  const statusBar = createStatusBar(controller);
  context.subscriptions.push(statusBar);

  // Open welcome on first activation
  welcomeProvider.createPanel();

  // Connect agents
  agentManager.connectAll();
}

export function deactivate() {
  agentManager?.disconnectAll();
}
