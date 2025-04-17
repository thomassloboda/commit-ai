import { FileDiffProvider } from '@/domain/ports/file-diff-provider';
import { CommitMessageLLM } from '@/domain/ports/commit-message-llm';
import { createSpinner } from '@/utils/create-spinner';

export class GenerateCommitMessageFromFiles {
  constructor(
    private readonly fileDiffProvider: FileDiffProvider,
    private readonly llm: CommitMessageLLM,
  ) {
  }

  async execute(isQuiet=false): Promise<string> {
    const diffs = await this.fileDiffProvider.getFileDiffs();

    const summaries: string[] = [];

    for (const file of diffs) {
      const spinner = await createSpinner(!isQuiet, `Summarizing ${file.filename}...`);
      const summary = await this.llm.summarizeFileChange(file.content, file.filename);
      summaries.push(summary);
      spinner.succeed(`Done: ${file.filename}`);
    }

    return this.llm.generateMessageFromSummaries(summaries);
  }
}
