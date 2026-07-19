import { execSync } from 'child_process';

export function getGitAuthorName(): string {
  try {
    return execSync('git config user.name', { encoding: 'utf-8' }).trim();
  } catch {
    return 'Unknown';
  }
}
