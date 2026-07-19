import { readdirSync, mkdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import { join, extname, basename } from 'path';
import { replaceTokens, type TokenMap } from './tokens.js';

const TEXT_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.css', '.html',
  '.yaml', '.yml', '.toml', '.tmpl', '.mod', '.sum', '.go',
  '.mts', '.mjs', '.env',
]);

const SKIP_FILES = new Set(['manifest.json']);

export function copyTemplate(
  sourceDir: string,
  destDir: string,
  tokens: TokenMap,
): void {
  mkdirSync(destDir, { recursive: true });
  copyDir(sourceDir, destDir, tokens);
}

function copyDir(src: string, dest: string, tokens: TokenMap): void {
  const entries = readdirSync(src);

  for (const entry of entries) {
    if (SKIP_FILES.has(entry)) continue;

    const srcPath = join(src, entry);
    const stat = statSync(srcPath);

    if (stat.isDirectory()) {
      const destPath = join(dest, entry);
      mkdirSync(destPath, { recursive: true });
      copyDir(srcPath, destPath, tokens);
    } else {
      let destName = entry;

      // gitignore.tmpl → .gitignore
      if (entry === 'gitignore.tmpl') {
        destName = '.gitignore';
      }
      // *.tmpl → remove .tmpl extension
      else if (extname(entry) === '.tmpl') {
        destName = entry.slice(0, -5);
      }

      const content = readFileSync(srcPath, 'utf-8');
      const ext = extname(srcPath);
      const isText = TEXT_EXTENSIONS.has(ext) || TEXT_EXTENSIONS.has(extname(destName));

      const output = isText ? replaceTokens(content, tokens) : content;
      writeFileSync(join(dest, destName), output, 'utf-8');
    }
  }
}
