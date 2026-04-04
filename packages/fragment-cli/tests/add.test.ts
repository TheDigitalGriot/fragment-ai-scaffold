import { describe, it, expect, beforeEach } from 'vitest';
import { runInit } from '../src/commands/init.js';
import { runAdd } from '../src/commands/add.js';
import { mkdtempSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TEMPLATES_DIR = join(__dirname, '..', 'templates');

describe('runAdd', () => {
  let projectDir: string;

  beforeEach(() => {
    const parentDir = mkdtempSync(join(tmpdir(), 'fragment-add-'));
    projectDir = join(parentDir, 'existing-proj');

    // Create an existing project with just electron
    runInit({
      name: 'existing-proj',
      outputDir: projectDir,
      templatesDir: TEMPLATES_DIR,
      surfaces: ['electron'],
      authorName: 'Gavin',
      skipInstall: true,
    });
  });

  it('adds a new surface to an existing project', () => {
    runAdd({
      projectDir,
      templatesDir: TEMPLATES_DIR,
      surface: 'vscode',
      skipInstall: true,
    });

    expect(existsSync(join(projectDir, 'apps', 'vscode', 'package.json'))).toBe(true);
  });

  it('updates workspaces when adding an npm surface', () => {
    runAdd({
      projectDir,
      templatesDir: TEMPLATES_DIR,
      surface: 'vscode',
      skipInstall: true,
    });

    const pkg = JSON.parse(readFileSync(join(projectDir, 'package.json'), 'utf-8'));
    expect(pkg.workspaces).toContain('apps/vscode');
  });

  it('replaces tokens using existing project name', () => {
    runAdd({
      projectDir,
      templatesDir: TEMPLATES_DIR,
      surface: 'vscode',
      skipInstall: true,
    });

    const vscodePkg = JSON.parse(
      readFileSync(join(projectDir, 'apps', 'vscode', 'package.json'), 'utf-8'),
    );
    expect(vscodePkg.name).toBe('@existing-proj/vscode');
  });

  it('throws if surface already exists', () => {
    expect(() => {
      runAdd({
        projectDir,
        templatesDir: TEMPLATES_DIR,
        surface: 'electron',
        skipInstall: true,
      });
    }).toThrow('already exists');
  });

  it('throws if project directory has no package.json', () => {
    const emptyDir = mkdtempSync(join(tmpdir(), 'fragment-empty-'));
    expect(() => {
      runAdd({
        projectDir: emptyDir,
        templatesDir: TEMPLATES_DIR,
        surface: 'vscode',
        skipInstall: true,
      });
    }).toThrow('Not a Fragment project');
  });
});
