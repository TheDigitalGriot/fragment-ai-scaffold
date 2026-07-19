import { describe, it, expect, beforeEach } from 'vitest';
import { runConnect } from '../src/commands/connect.js';
import { runInit } from '../src/commands/init.js';
import { mkdtempSync, mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TEMPLATES_DIR = join(__dirname, '..', 'templates');

describe('runConnect', () => {
  let projectDir: string;

  beforeEach(() => {
    const parentDir = mkdtempSync(join(tmpdir(), 'fragment-connect-'));
    projectDir = join(parentDir, 'test-proj');

    runInit({
      name: 'test-proj',
      outputDir: projectDir,
      templatesDir: TEMPLATES_DIR,
      surfaces: ['electron', 'vscode', 'tui'],
      authorName: 'Gavin',
      skipInstall: true,
    });

    mkdirSync(join(projectDir, 'plugins', 'my-plugin', '.claude-plugin'), { recursive: true });
    writeFileSync(
      join(projectDir, 'plugins', 'my-plugin', '.claude-plugin', 'plugin.json'),
      JSON.stringify({
        name: 'my-plugin',
        mcpServers: {
          porter: { command: 'python', args: ['server.py'] },
          channel: { command: 'node', args: ['index.js'] },
        },
      }),
    );
  });

  it('discovers plugin and wires all surfaces', () => {
    const result = runConnect({ projectDir });
    expect(result.plugin).toBe('my-plugin');
    expect(result.surfaces).toContain('electron');
    expect(result.surfaces).toContain('vscode');
    expect(result.surfaces).toContain('tui');
  });

  it('generates Electron glue files', () => {
    runConnect({ projectDir });
    expect(existsSync(join(projectDir, 'apps', 'electron', 'src', 'plugin-glue', 'mcp-bridge.ts'))).toBe(true);
  });

  it('generates VS Code glue files', () => {
    runConnect({ projectDir });
    expect(existsSync(join(projectDir, 'apps', 'vscode', 'src', 'plugin-glue', 'mcp-commands.ts'))).toBe(true);
  });

  it('generates TUI glue files', () => {
    runConnect({ projectDir });
    expect(existsSync(join(projectDir, 'apps', 'tui', 'plugin-glue', 'plugin_porter.go'))).toBe(true);
    expect(existsSync(join(projectDir, 'apps', 'tui', 'plugin-glue', 'plugin_channel.go'))).toBe(true);
  });

  it('throws when no plugin found', () => {
    const emptyDir = mkdtempSync(join(tmpdir(), 'fragment-no-plugin-'));
    mkdirSync(join(emptyDir, 'apps', 'electron'), { recursive: true });
    expect(() => runConnect({ projectDir: emptyDir })).toThrow('No plugin found');
  });

  it('throws when no surfaces found', () => {
    const noAppsDir = mkdtempSync(join(tmpdir(), 'fragment-no-apps-'));
    mkdirSync(join(noAppsDir, '.claude-plugin'), { recursive: true });
    writeFileSync(
      join(noAppsDir, '.claude-plugin', 'plugin.json'),
      JSON.stringify({ name: 'test', mcpServers: {} }),
    );
    expect(() => runConnect({ projectDir: noAppsDir })).toThrow('No surfaces found');
  });
});
