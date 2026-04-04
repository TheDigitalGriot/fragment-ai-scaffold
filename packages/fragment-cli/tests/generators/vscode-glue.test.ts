import { describe, it, expect, beforeEach } from 'vitest';
import { generateVSCodeGlue } from '../../src/engine/generators/vscode-glue.js';
import type { PluginInfo } from '../../src/engine/plugin-discovery.js';
import { mkdtempSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('generateVSCodeGlue', () => {
  let appsDir: string;
  const plugin: PluginInfo = {
    name: 'context-unifier',
    mcpServers: {
      porter: { command: 'python', args: ['server.py'] },
      channel: { command: 'node', args: ['index.js'] },
    },
    pluginDir: '/plugins/context-unifier',
  };

  beforeEach(() => {
    const tmpDir = mkdtempSync(join(tmpdir(), 'fragment-vscode-glue-'));
    appsDir = join(tmpDir, 'apps', 'vscode');
    mkdirSync(join(appsDir, 'src'), { recursive: true });
  });

  it('generates a plugin commands file', () => {
    const files = generateVSCodeGlue(appsDir, plugin);
    expect(files.length).toBeGreaterThan(0);
    expect(existsSync(join(appsDir, 'src', 'plugin-glue', 'mcp-commands.ts'))).toBe(true);
  });

  it('includes command registration for each MCP server', () => {
    generateVSCodeGlue(appsDir, plugin);
    const content = readFileSync(join(appsDir, 'src', 'plugin-glue', 'mcp-commands.ts'), 'utf-8');
    expect(content).toContain('porter');
    expect(content).toContain('channel');
    expect(content).toContain('registerCommand');
  });

  it('returns list of generated files', () => {
    const files = generateVSCodeGlue(appsDir, plugin);
    expect(files).toContain('src/plugin-glue/mcp-commands.ts');
  });
});
