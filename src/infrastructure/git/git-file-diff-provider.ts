import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { FileDiff, FileDiffProvider } from '@/domain/ports/file-diff-provider';
import { CommitAiConfig } from '@/infrastructure/config/config-provider';

const execAsync = promisify(exec);


export class GitFileDiffProvider implements FileDiffProvider {
  constructor(private readonly config: CommitAiConfig = {}) {
  }

  async getFileDiffs(): Promise<FileDiff[]> {
    const { stdout } = await execAsync('git diff --cached --name-only');
    const files = stdout.split('\n').filter(Boolean);

    const IGNORED_EXTENSIONS = this.config.ignoredExtensions ?? ['.lock', '.map', '.min.js', '.snap'];
    const IGNORED_FILENAMES = this.config.ignoredFilenames ?? ['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock'];


    const diffs: FileDiff[] = [];

    for (const file of files) {
      const shouldIgnore =
        IGNORED_EXTENSIONS.some(ext => file.endsWith(ext)) ||
        IGNORED_FILENAMES.includes(file);

      if (shouldIgnore) {
        console.log(`⏭️ Ignoring file: ${file}`);
        continue;
      }

      const { stdout: fileDiff } = await execAsync(`git diff --cached -- ${file}`);
      diffs.push({ filename: file, content: fileDiff });
    }

    return diffs;
  }
}
