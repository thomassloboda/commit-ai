import { CommitMessageLLM } from '@/domain/ports/commit-message-llm';
import OpenAI from 'openai';

export class OpenAICommitMessageLLM implements CommitMessageLLM {
  constructor(private readonly client: OpenAI) {
  }

  async summarizeFileChange(diff: string, filename: string): Promise<string> {
    const MAX_CHARS = 8000
    if (diff.length > MAX_CHARS) {
      console.warn(`⚠️ File ${filename} was too large and has been truncated.`)
    }
    const limitedDiff = diff.length > MAX_CHARS
      ? `// [Truncated]\n` + diff.slice(0, MAX_CHARS)
      : diff

    const response = await this.client.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a tool that summarizes file-level code changes very concisely.',
        },
        {
          role: 'user',
          content: `File: ${filename}\n\nGit diff:\n${limitedDiff}\n\nSummarize the change in 1 sentence.`,
        },
      ],
      temperature: 0.2,
    })

    return response.choices[0].message.content?.trim() ?? ''
  }

  async generateMessageFromSummaries(summaries: string[]): Promise<string> {
    const joined = summaries.join('\n- ')
    const response = await this.client.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a commit message generator following the Conventional Commits format.',
        },
        {
          role: 'user',
          content: `Here is a list of summarized changes:\n- ${joined}\n\nGenerate a single conventional commit message.`,
        },
      ],
      temperature: 0.2,
    })

    return response.choices[0].message.content?.trim() ?? ''
  }

  async generateCommitMessageFromDiff(diff: string, model: string): Promise<string> {
    const completion = await this.client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a commit message generator that follows Conventional Commits.',
        },
        {
          role: 'user',
          content: `Generate a commit message based on the following git diff:\n\n${diff}`,
        },
      ],
      temperature: 0.2,
    });

    const message = completion.choices[0].message.content?.trim();
    if (!message) throw new Error('No message returned by OpenAI.');

    return message;
  }
}
