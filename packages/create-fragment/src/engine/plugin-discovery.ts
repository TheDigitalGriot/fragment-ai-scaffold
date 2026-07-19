import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';

export interface McpServerConfig {
  command: string;
  args: string[];
  env?: Record<string, string>;
}

export interface PluginInfo {
  name: string;
  version?: string;
  description?: string;
  mcpServers: Record<string, McpServerConfig>;
  pluginDir: string;
}

export function discoverPlugin(projectDir: string): PluginInfo | null {
  // Check project root: .claude-plugin/plugin.json
  const rootManifest = join(projectDir, '.claude-plugin', 'plugin.json');
  if (existsSync(rootManifest)) {
    return parsePluginManifest(rootManifest, projectDir);
  }

  // Check plugins/*/.claude-plugin/plugin.json
  const pluginsDir = join(projectDir, 'plugins');
  if (existsSync(pluginsDir)) {
    for (const entry of readdirSync(pluginsDir)) {
      const manifest = join(pluginsDir, entry, '.claude-plugin', 'plugin.json');
      if (existsSync(manifest)) {
        return parsePluginManifest(manifest, join(pluginsDir, entry));
      }
    }
  }

  return null;
}

function parsePluginManifest(manifestPath: string, pluginDir: string): PluginInfo {
  const raw = JSON.parse(readFileSync(manifestPath, 'utf-8'));
  return {
    name: raw.name,
    version: raw.version,
    description: raw.description,
    mcpServers: raw.mcpServers || {},
    pluginDir,
  };
}

export function detectSurfaces(projectDir: string): string[] {
  const appsDir = join(projectDir, 'apps');
  if (!existsSync(appsDir)) return [];

  const surfaces: string[] = [];
  for (const surface of ['electron', 'vscode', 'tui']) {
    if (existsSync(join(appsDir, surface))) {
      surfaces.push(surface);
    }
  }
  return surfaces;
}
