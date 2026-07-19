import { describe, it, expect, beforeEach } from 'vitest';
import { generateTuiGlue } from '../../src/engine/generators/tui-glue.js';
import type { PluginInfo } from '../../src/engine/plugin-discovery.js';
import { mkdtempSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('generateTuiGlue', () => {
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
    const tmpDir = mkdtempSync(join(tmpdir(), 'fragment-tui-glue-'));
    appsDir = join(tmpDir, 'apps', 'tui');
    mkdirSync(appsDir, { recursive: true });
  });

  it('generates a plugin tab file per MCP server', () => {
    const files = generateTuiGlue(appsDir, plugin);
    expect(files.length).toBe(2);
    expect(existsSync(join(appsDir, 'plugin-glue', 'plugin_porter.go'))).toBe(true);
    expect(existsSync(join(appsDir, 'plugin-glue', 'plugin_channel.go'))).toBe(true);
  });

  it('generates valid Go source with Plugin interface methods', () => {
    generateTuiGlue(appsDir, plugin);
    const content = readFileSync(join(appsDir, 'plugin-glue', 'plugin_porter.go'), 'utf-8');
    expect(content).toContain('package pluginglue');
    expect(content).toContain('func (p *PorterPlugin) ID()');
    expect(content).toContain('func (p *PorterPlugin) Name()');
  });

  it('returns list of generated files', () => {
    const files = generateTuiGlue(appsDir, plugin);
    expect(files).toContain('plugin-glue/plugin_porter.go');
    expect(files).toContain('plugin-glue/plugin_channel.go');
  });
});
