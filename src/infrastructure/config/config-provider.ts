import fs from 'fs';
import os from 'os';
import path from 'path';

export interface CommitAiConfig {
  OPENAI_API_KEY?: string
  ignoredExtensions?: string[]
  ignoredFilenames?: string[]
}

export class ConfigProvider {
  static getConfig(): CommitAiConfig {
    const configPath = path.join(os.homedir(), '.commit-ai', 'config.json')
    if (!fs.existsSync(configPath)) return {}

    try {
      const raw = fs.readFileSync(configPath, 'utf-8')
      return JSON.parse(raw)
    } catch {
      return {}
    }
  }

  static resolveApiKey(cliArg?: string): string {
    return (
      cliArg ||
      process.env.OPENAI_API_KEY ||
      ConfigProvider.getConfig().OPENAI_API_KEY ||
      (() => {
        throw new Error(
          '❌ No API key provided. Use --api-key, .env, or ~/.commit-ai/config.json'
        )
      })()
    )
  }
}
