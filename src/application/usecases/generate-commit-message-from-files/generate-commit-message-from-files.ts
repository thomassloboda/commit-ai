import { FileDiffProvider } from '@/domain/ports/file-diff-provider';
import { CommitMessageLLM } from '@/domain/ports/commit-message-llm';
import { batchFilesByTokenLimit } from '@/utils/batch-files';

export class GenerateCommitMessageFromFiles {
  constructor(
    private readonly fileDiffProvider: FileDiffProvider,
    private readonly llm: CommitMessageLLM,
  ) {
  }

  async execute(): Promise<string> {
    const changedFiles = await this.fileDiffProvider.getFileDiffs();
    const model = 'gpt-4';

    const combinedInput = batchFilesByTokenLimit(model, changedFiles);

    return await this.llm.generateCommitMessageFromDiff(combinedInput, model);
  }
}
