import { describe, it, expect, beforeEach } from 'vitest';
import {
  readManifest,
  updateWorkspaces,
  type SurfaceManifest,
} from '../src/engine/manifest.js';
import { mkdtempSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('readManifest', () => {
  it('reads and parses a manifest.json', () => {
    const dir = mkdtempSync(join(tmpdir(), 'fragment-manifest-'));
    writeFileSync(
      join(dir, 'manifest.json'),
      JSON.stringify({
        surface: 'electron',
        files: ['**/*'],
        skip: ['node_modules/**'],
        workspaceEntry: 'apps/electron',
        dependencies: ['core', 'ui'],
      }),
    );

    const manifest = readManifest(dir);
    expect(manifest.surface).toBe('electron');
    expect(manifest.workspaceEntry).toBe('apps/electron');
    expect(manifest.dependencies).toEqual(['core', 'ui']);
  });

  it('returns null when no manifest exists', () => {
    const dir = mkdtempSync(join(tmpdir(), 'fragment-no-manifest-'));
    const manifest = readManifest(dir);
    expect(manifest).toBeNull();
  });
});

describe('updateWorkspaces', () => {
  let projectDir: string;

  beforeEach(() => {
    projectDir = mkdtempSync(join(tmpdir(), 'fragment-ws-'));
  });

  it('adds a workspace entry to package.json', () => {
    writeFileSync(
      join(projectDir, 'package.json'),
      JSON.stringify({
        name: 'my-project',
        workspaces: ['packages/*'],
      }, null, 2),
    );

    updateWorkspaces(projectDir, 'apps/electron');

    const pkg = JSON.parse(readFileSync(join(projectDir, 'package.json'), 'utf-8'));
    expect(pkg.workspaces).toContain('apps/electron');
    expect(pkg.workspaces).toContain('packages/*');
  });

  it('does not add duplicate workspace entries', () => {
    writeFileSync(
      join(projectDir, 'package.json'),
      JSON.stringify({
        name: 'my-project',
        workspaces: ['packages/*', 'apps/electron'],
      }, null, 2),
    );

    updateWorkspaces(projectDir, 'apps/electron');

    const pkg = JSON.parse(readFileSync(join(projectDir, 'package.json'), 'utf-8'));
    const count = pkg.workspaces.filter((w: string) => w === 'apps/electron').length;
    expect(count).toBe(1);
  });

  it('skips workspace update for non-npm surfaces', () => {
    writeFileSync(
      join(projectDir, 'package.json'),
      JSON.stringify({
        name: 'my-project',
        workspaces: ['packages/*'],
      }, null, 2),
    );

    updateWorkspaces(projectDir, null);

    const pkg = JSON.parse(readFileSync(join(projectDir, 'package.json'), 'utf-8'));
    expect(pkg.workspaces).toEqual(['packages/*']);
  });
});
