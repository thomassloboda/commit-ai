export interface CommitMessageLLM {
  summarizeFileChange(diff: string, filename: string): Promise<string>;

  generateMessageFromSummaries(summaries: string[]): Promise<string>;
}
