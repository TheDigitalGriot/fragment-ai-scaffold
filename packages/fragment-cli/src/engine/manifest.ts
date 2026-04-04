import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface SurfaceManifest {
  surface: string;
  files: string[];
  skip: string[];
  workspaceEntry: string | null;
  dependencies: string[];
}

export function readManifest(templateDir: string): SurfaceManifest | null {
  const manifestPath = join(templateDir, 'manifest.json');
  if (!existsSync(manifestPath)) return null;

  const raw = JSON.parse(readFileSync(manifestPath, 'utf-8'));
  return {
    surface: raw.surface,
    files: raw.files ?? ['**/*'],
    skip: raw.skip ?? [],
    workspaceEntry: raw.workspaceEntry ?? null,
    dependencies: raw.dependencies ?? [],
  };
}

export function updateWorkspaces(
  projectDir: string,
  workspaceEntry: string | null,
): void {
  if (!workspaceEntry) return;

  const pkgPath = join(projectDir, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));

  if (!Array.isArray(pkg.workspaces)) {
    pkg.workspaces = [];
  }

  if (!pkg.workspaces.includes(workspaceEntry)) {
    pkg.workspaces.push(workspaceEntry);
  }

  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
}
