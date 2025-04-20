import { FileDiff } from '@/domain/ports/file-diff-provider';
import { getTokenLimitForModel, SupportedModel } from '@/utils/models-limits';

export function batchFilesByTokenLimit(
  model: SupportedModel,
  files: FileDiff[],
  margin: number = 5000,
): string {
  const maxTokens = getTokenLimitForModel(model) - margin;
  let totalTokens = 0;
  let content = '';

  for (const file of files) {
    const estimatedTokens = Math.ceil(file.content.length / 4); // 1 token ≈ 4 chars

    if (totalTokens + estimatedTokens > maxTokens) break;

    content += `\n===== ${file.filename} =====\n${file.content}\n`;
    totalTokens += estimatedTokens;
  }

  return content.trim();
}
