import { describe, it, expect, beforeEach } from 'vitest';
import { copyTemplate } from '../src/engine/copier.js';
import { type TokenMap } from '../src/engine/tokens.js';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('copyTemplate', () => {
  let sourceDir: string;
  let destDir: string;
  const tokens: TokenMap = {
    PROJECT_NAME: 'test-proj',
    PACKAGE_SCOPE: '@test-proj',
    AUTHOR_NAME: 'Test',
    YEAR: '2026',
  };

  beforeEach(() => {
    sourceDir = mkdtempSync(join(tmpdir(), 'fragment-src-'));
    destDir = mkdtempSync(join(tmpdir(), 'fragment-dest-'));
  });

  it('copies files from source to destination', () => {
    writeFileSync(join(sourceDir, 'readme.md'), '# Hello');

    copyTemplate(sourceDir, destDir, tokens);

    expect(readFileSync(join(destDir, 'readme.md'), 'utf-8')).toBe('# Hello');
  });

  it('replaces tokens in .tmpl files and removes .tmpl extension', () => {
    writeFileSync(
      join(sourceDir, 'package.json.tmpl'),
      '{"name": "{{PACKAGE_SCOPE}}/core"}',
    );

    copyTemplate(sourceDir, destDir, tokens);

    expect(existsSync(join(destDir, 'package.json.tmpl'))).toBe(false);
    expect(readFileSync(join(destDir, 'package.json'), 'utf-8')).toBe(
      '{"name": "@test-proj/core"}',
    );
  });

  it('replaces tokens in non-.tmpl text files too', () => {
    writeFileSync(join(sourceDir, 'config.ts'), 'const name = "{{PROJECT_NAME}}";');

    copyTemplate(sourceDir, destDir, tokens);

    expect(readFileSync(join(destDir, 'config.ts'), 'utf-8')).toBe(
      'const name = "test-proj";',
    );
  });

  it('copies nested directories', () => {
    mkdirSync(join(sourceDir, 'src', 'shared'), { recursive: true });
    writeFileSync(join(sourceDir, 'src', 'shared', 'types.ts'), 'export type Foo = string;');

    copyTemplate(sourceDir, destDir, tokens);

    expect(readFileSync(join(destDir, 'src', 'shared', 'types.ts'), 'utf-8')).toBe(
      'export type Foo = string;',
    );
  });

  it('renames gitignore.tmpl to .gitignore', () => {
    writeFileSync(join(sourceDir, 'gitignore.tmpl'), 'node_modules/');

    copyTemplate(sourceDir, destDir, tokens);

    expect(existsSync(join(destDir, '.gitignore'))).toBe(true);
    expect(readFileSync(join(destDir, '.gitignore'), 'utf-8')).toBe('node_modules/');
  });

  it('skips manifest.json files', () => {
    writeFileSync(join(sourceDir, 'manifest.json'), '{"surface":"electron"}');
    writeFileSync(join(sourceDir, 'index.ts'), 'export {}');

    copyTemplate(sourceDir, destDir, tokens);

    expect(existsSync(join(destDir, 'manifest.json'))).toBe(false);
    expect(existsSync(join(destDir, 'index.ts'))).toBe(true);
  });
});
