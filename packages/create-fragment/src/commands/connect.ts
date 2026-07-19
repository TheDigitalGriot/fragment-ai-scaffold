import { join } from 'path';
import { discoverPlugin, detectSurfaces } from '../engine/plugin-discovery.js';
import { generateElectronGlue } from '../engine/generators/electron-glue.js';
import { generateVSCodeGlue } from '../engine/generators/vscode-glue.js';
import { generateTuiGlue } from '../engine/generators/tui-glue.js';

export interface ConnectOptions {
  projectDir: string;
}

export interface ConnectResult {
  plugin: string;
  surfaces: string[];
  files: Record<string, string[]>;
}

export function runConnect(options: ConnectOptions): ConnectResult {
  const { projectDir } = options;

  const plugin = discoverPlugin(projectDir);
  if (!plugin) {
    throw new Error(
      'No plugin found. Expected .claude-plugin/plugin.json at project root or in plugins/*/',
    );
  }

  const surfaces = detectSurfaces(projectDir);
  if (surfaces.length === 0) {
    throw new Error(
      'No surfaces found. Run `fragment init` first to create apps/.',
    );
  }

  const files: Record<string, string[]> = {};

  for (const surface of surfaces) {
    const surfaceDir = join(projectDir, 'apps', surface);

    switch (surface) {
      case 'electron':
        files.electron = generateElectronGlue(surfaceDir, plugin);
        break;
      case 'vscode':
        files.vscode = generateVSCodeGlue(surfaceDir, plugin);
        break;
      case 'tui':
        files.tui = generateTuiGlue(surfaceDir, plugin);
        break;
    }
  }

  console.log(`\nFragment Connect: ${plugin.name}`);
  console.log(`MCP Servers: ${Object.keys(plugin.mcpServers).join(', ')}`);
  console.log(`\nWired surfaces:`);
  for (const [surface, surfaceFiles] of Object.entries(files)) {
    console.log(`  ${surface}:`);
    for (const f of surfaceFiles) {
      console.log(`    + ${f}`);
    }
  }
  console.log(`\nNext steps:`);
  console.log(`  Import the generated glue in each surface's entry point.`);
  console.log(`  See apps/<surface>/src/plugin-glue/ for generated files.`);

  return { plugin: plugin.name, surfaces, files };
}
