import {
  GenerateCommitMessageFromFiles,
} from '@/application/usecases/generate-commit-message-from-files/generate-commit-message-from-files';
import { FileDiffProvider } from '@/domain/ports/file-diff-provider';
import { CommitMessageLLM } from '@/domain/ports/commit-message-llm';
import { createSpinner } from '@/utils/create-spinner';

vi.mock('@/utils/create-spinner', () => ({
  createSpinner: vi.fn(() => ({
    succeed: vi.fn(),
  })),
}));

describe('GenerateCommitMessageFromFiles', () => {
  let mockDiffProvider: FileDiffProvider;
  let mockLLM: CommitMessageLLM;

  beforeEach(() => {
    mockDiffProvider = {
      getFileDiffs: vi.fn().mockResolvedValue([
        { filename: 'file1.ts', content: 'diff1' },
        { filename: 'file2.ts', content: 'diff2' },
      ]),
    };

    mockLLM = {
      summarizeFileChange: vi
        .fn()
        .mockImplementation((diff, filename) => Promise.resolve(`summary for ${filename}`)),
      generateMessageFromSummaries: vi
        .fn()
        .mockResolvedValue('feat: some global message'),
    };
  });

  it('should summarize each file and generate a global message', async () => {
    const useCase = new GenerateCommitMessageFromFiles(mockDiffProvider, mockLLM);

    const result = await useCase.execute();

    expect(result).toBe('feat: some global message');

    expect(mockDiffProvider.getFileDiffs).toHaveBeenCalled();

    expect(mockLLM.summarizeFileChange).toHaveBeenCalledTimes(2);
    expect(mockLLM.summarizeFileChange).toHaveBeenCalledWith('diff1', 'file1.ts');
    expect(mockLLM.summarizeFileChange).toHaveBeenCalledWith('diff2', 'file2.ts');

    expect(mockLLM.generateMessageFromSummaries).toHaveBeenCalledWith([
      'summary for file1.ts',
      'summary for file2.ts',
    ]);

    expect(createSpinner).toHaveBeenCalledTimes(2);
    expect(createSpinner).toHaveBeenCalledWith(true, 'Summarizing file1.ts...');
  });
});
