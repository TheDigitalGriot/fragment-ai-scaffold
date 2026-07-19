import * as vscode from 'vscode';
import { BaseController } from '{{PACKAGE_SCOPE}}/core/controller/BaseController.js';

export class VSCodeController extends BaseController {
  constructor() {
    super('{{PROJECT_NAME}}');
  }

  getWorkspaceRoot(): string {
    return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
  }
}
