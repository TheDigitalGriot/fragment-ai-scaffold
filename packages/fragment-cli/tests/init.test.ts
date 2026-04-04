import { describe, it, expect, beforeEach } from 'vitest';
import { runInit } from '../src/commands/init.js';
import { mkdtempSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TEMPLATES_DIR = join(__dirname, '..', 'templates');

describe('runInit', () => {
  let parentDir: string;

  beforeEach(() => {
    parentDir = mkdtempSync(join(tmpdir(), 'fragment-init-'));
  });

  it('creates a project with base + core + ui + electron', () => {
    const projectDir = join(parentDir, 'test-proj');

    runInit({
      name: 'test-proj',
      outputDir: projectDir,
      templatesDir: TEMPLATES_DIR,
      surfaces: ['electron'],
      authorName: 'TestAuthor',
      skipInstall: true,
    });

    // Base files
    expect(existsSync(join(projectDir, 'package.json'))).toBe(true);
    expect(existsSync(join(projectDir, 'tsconfig.base.json'))).toBe(true);
    expect(existsSync(join(projectDir, '.gitignore'))).toBe(true);

    // Core package
    expect(existsSync(join(projectDir, 'packages', 'core', 'package.json'))).toBe(true);
    expect(existsSync(join(projectDir, 'packages', 'core', 'src', 'shared', 'types.ts'))).toBe(true);

    // UI package
    expect(existsSync(join(projectDir, 'packages', 'ui', 'package.json'))).toBe(true);

    // Electron surface
    expect(existsSync(join(projectDir, 'apps', 'electron', 'package.json'))).toBe(true);

    // No manifest.json in output
    expect(existsSync(join(projectDir, 'apps', 'electron', 'manifest.json'))).toBe(false);
  });

  it('replaces tokens in generated files', () => {
    const projectDir = join(parentDir, 'token-proj');

    runInit({
      name: 'token-proj',
      outputDir: projectDir,
      templatesDir: TEMPLATES_DIR,
      surfaces: ['electron'],
      authorName: 'Gavin',
      skipInstall: true,
    });

    const corePkg = JSON.parse(
      readFileSync(join(projectDir, 'packages', 'core', 'package.json'), 'utf-8'),
    );
    expect(corePkg.name).toBe('@token-proj/core');
  });

  it('adds workspace entries for selected surfaces', () => {
    const projectDir = join(parentDir, 'ws-proj');

    runInit({
      name: 'ws-proj',
      outputDir: projectDir,
      templatesDir: TEMPLATES_DIR,
      surfaces: ['electron', 'vscode'],
      authorName: 'Gavin',
      skipInstall: true,
    });

    const rootPkg = JSON.parse(
      readFileSync(join(projectDir, 'package.json'), 'utf-8'),
    );
    expect(rootPkg.workspaces).toContain('apps/electron');
    expect(rootPkg.workspaces).toContain('apps/vscode');
  });

  it('does not add workspace entry for tui (Go module)', () => {
    const projectDir = join(parentDir, 'tui-proj');

    runInit({
      name: 'tui-proj',
      outputDir: projectDir,
      templatesDir: TEMPLATES_DIR,
      surfaces: ['tui'],
      authorName: 'Gavin',
      skipInstall: true,
    });

    const rootPkg = JSON.parse(
      readFileSync(join(projectDir, 'package.json'), 'utf-8'),
    );
    expect(rootPkg.workspaces).not.toContain('apps/tui');
    expect(existsSync(join(projectDir, 'apps', 'tui', 'go.mod'))).toBe(true);
  });

  it('supports --all flag by generating all surfaces', () => {
    const projectDir = join(parentDir, 'all-proj');

    runInit({
      name: 'all-proj',
      outputDir: projectDir,
      templatesDir: TEMPLATES_DIR,
      surfaces: ['electron', 'vscode', 'tui'],
      authorName: 'Gavin',
      skipInstall: true,
    });

    expect(existsSync(join(projectDir, 'apps', 'electron', 'package.json'))).toBe(true);
    expect(existsSync(join(projectDir, 'apps', 'vscode', 'package.json'))).toBe(true);
    expect(existsSync(join(projectDir, 'apps', 'tui', 'go.mod'))).toBe(true);
  });
});
