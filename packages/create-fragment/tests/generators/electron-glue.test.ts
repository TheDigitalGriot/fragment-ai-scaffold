import { describe, it, expect, beforeEach } from 'vitest';
import { generateElectronGlue } from '../../src/engine/generators/electron-glue.js';
import type { PluginInfo } from '../../src/engine/plugin-discovery.js';
import { mkdtempSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('generateElectronGlue', () => {
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
    const tmpDir = mkdtempSync(join(tmpdir(), 'fragment-electron-glue-'));
    appsDir = join(tmpDir, 'apps', 'electron');
    mkdirSync(join(appsDir, 'src'), { recursive: true });
  });

  it('generates a plugin bridge file', () => {
    const files = generateElectronGlue(appsDir, plugin);
    expect(files.length).toBeGreaterThan(0);
    expect(existsSync(join(appsDir, 'src', 'plugin-glue', 'mcp-bridge.ts'))).toBe(true);
  });

  it('includes IPC handler for each MCP server', () => {
    generateElectronGlue(appsDir, plugin);
    const bridge = readFileSync(join(appsDir, 'src', 'plugin-glue', 'mcp-bridge.ts'), 'utf-8');
    expect(bridge).toContain('porter');
    expect(bridge).toContain('channel');
  });

  it('generates timeline wiring', () => {
    generateElectronGlue(appsDir, plugin);
    const bridge = readFileSync(join(appsDir, 'src', 'plugin-glue', 'mcp-bridge.ts'), 'utf-8');
    expect(bridge).toContain('timeline');
    expect(bridge).toContain('ToolCall');
  });

  it('returns list of generated files', () => {
    const files = generateElectronGlue(appsDir, plugin);
    expect(files).toContain('src/plugin-glue/mcp-bridge.ts');
  });
});
