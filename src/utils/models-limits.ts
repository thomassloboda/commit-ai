export type SupportedModel = 'gpt-4' | 'gpt-4-1106-preview' | 'gpt-3.5-turbo' | string;

export const getTokenLimitForModel = (model: SupportedModel): number => {
  if (model.startsWith('gpt-4')) return 128000;
  if (model.startsWith('gpt-3.5')) return 16000;

  return 8;
};
