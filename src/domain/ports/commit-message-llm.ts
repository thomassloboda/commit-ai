export interface CommitMessageLLM {
  summarizeFileChange(diff: string, filename: string): Promise<string>;

  generateMessageFromSummaries(summaries: string[], quiet: boolean): Promise<string>;

  generateCommitMessageFromDiff(diff: string, model: string): Promise<string>;
}
