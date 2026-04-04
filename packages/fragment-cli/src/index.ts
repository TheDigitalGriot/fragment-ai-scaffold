import { Command } from 'commander';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { runInit } from './commands/init.js';
import { runAdd } from './commands/add.js';
import { runConnect } from './commands/connect.js';
import { getGitAuthorName } from './utils/git.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TEMPLATES_DIR = join(__dirname, '..', 'templates');

const program = new Command();

program
  .name('create-fragment')
  .description('Scaffold multi-surface AI applications with pre-wired agent connections')
  .version('1.0.0');

program
  .command('init <name>')
  .description('Create a new Fragment project')
  .option('--electron', 'Include Electron desktop app')
  .option('--vscode', 'Include VS Code extension')
  .option('--tui', 'Include Go Bubble Tea TUI')
  .option('--all', 'Include all surfaces')
  .option('--author <name>', 'Author name (defaults to git config)')
  .action((name: string, opts: Record<string, boolean | string>) => {
    const surfaces: string[] = [];
    if (opts.all) {
      surfaces.push('electron', 'vscode', 'tui');
    } else {
      if (opts.electron) surfaces.push('electron');
      if (opts.vscode) surfaces.push('vscode');
      if (opts.tui) surfaces.push('tui');
    }

    if (surfaces.length === 0) {
      console.error('Error: specify at least one surface (--electron, --vscode, --tui, or --all)');
      process.exit(1);
    }

    const authorName = (opts.author as string) || getGitAuthorName();
    const outputDir = resolve(process.cwd(), name);

    runInit({
      name,
      outputDir,
      templatesDir: TEMPLATES_DIR,
      surfaces,
      authorName,
    });
  });

program
  .command('add')
  .description('Add a surface to an existing Fragment project')
  .option('--electron', 'Add Electron desktop app')
  .option('--vscode', 'Add VS Code extension')
  .option('--tui', 'Add Go Bubble Tea TUI')
  .action((opts: Record<string, boolean>) => {
    const surface = opts.electron ? 'electron' : opts.vscode ? 'vscode' : opts.tui ? 'tui' : null;

    if (!surface) {
      console.error('Error: specify a surface to add (--electron, --vscode, or --tui)');
      process.exit(1);
    }

    runAdd({
      projectDir: process.cwd(),
      templatesDir: TEMPLATES_DIR,
      surface: surface as string,
    });
  });

program
  .command('connect')
  .description('Wire an AI plugin into existing Fragment surfaces')
  .action(() => {
    runConnect({
      projectDir: process.cwd(),
    });
  });

program.parse();
