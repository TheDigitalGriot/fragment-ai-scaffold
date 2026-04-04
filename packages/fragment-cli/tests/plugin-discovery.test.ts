import { describe, it, expect, beforeEach } from 'vitest';
import { discoverPlugin, detectSurfaces, type PluginInfo } from '../src/engine/plugin-discovery.js';
import { mkdtempSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('discoverPlugin', () => {
  let projectDir: string;

  beforeEach(() => {
    projectDir = mkdtempSync(join(tmpdir(), 'fragment-discover-'));
  });

  it('finds plugin at project root .claude-plugin/', () => {
    mkdirSync(join(projectDir, '.claude-plugin'), { recursive: true });
    writeFileSync(
      join(projectDir, '.claude-plugin', 'plugin.json'),
      JSON.stringify({
        name: 'my-plugin',
        mcpServers: {
          porter: { command: 'python', args: ['server.py'] },
        },
      }),
    );

    const plugin = discoverPlugin(projectDir);
    expect(plugin).not.toBeNull();
    expect(plugin!.name).toBe('my-plugin');
    expect(plugin!.mcpServers).toHaveProperty('porter');
  });

  it('finds plugin in plugins/ subdirectory', () => {
    mkdirSync(join(projectDir, 'plugins', 'my-plugin', '.claude-plugin'), { recursive: true });
    writeFileSync(
      join(projectDir, 'plugins', 'my-plugin', '.claude-plugin', 'plugin.json'),
      JSON.stringify({
        name: 'my-plugin',
        mcpServers: {
          channel: { command: 'node', args: ['index.js'] },
        },
      }),
    );

    const plugin = discoverPlugin(projectDir);
    expect(plugin).not.toBeNull();
    expect(plugin!.name).toBe('my-plugin');
  });

  it('returns null when no plugin found', () => {
    const plugin = discoverPlugin(projectDir);
    expect(plugin).toBeNull();
  });

  it('extracts MCP server names and configs', () => {
    mkdirSync(join(projectDir, '.claude-plugin'), { recursive: true });
    writeFileSync(
      join(projectDir, '.claude-plugin', 'plugin.json'),
      JSON.stringify({
        name: 'context-unifier',
        mcpServers: {
          porter: { command: 'python', args: ['server.py'], env: { DATA: '/tmp' } },
          channel: { command: 'node', args: ['index.js'] },
        },
      }),
    );

    const plugin = discoverPlugin(projectDir);
    expect(Object.keys(plugin!.mcpServers)).toEqual(['porter', 'channel']);
  });
});

describe('detectSurfaces', () => {
  let projectDir: string;

  beforeEach(() => {
    projectDir = mkdtempSync(join(tmpdir(), 'fragment-surfaces-'));
  });

  it('detects existing surfaces', () => {
    mkdirSync(join(projectDir, 'apps', 'electron', 'src'), { recursive: true });
    mkdirSync(join(projectDir, 'apps', 'vscode', 'src'), { recursive: true });

    const surfaces = detectSurfaces(projectDir);
    expect(surfaces).toContain('electron');
    expect(surfaces).toContain('vscode');
    expect(surfaces).not.toContain('tui');
  });

  it('returns empty array when no apps/ dir', () => {
    const surfaces = detectSurfaces(projectDir);
    expect(surfaces).toEqual([]);
  });
});
