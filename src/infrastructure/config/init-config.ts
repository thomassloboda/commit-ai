import fs from 'fs';
import os from 'os';
import path from 'path';

const DEFAULT_CONFIG = {
  OPENAI_API_KEY: 'sk-...',
  ignoredExtensions: ['.lock', '.map', '.snap'],
  ignoredFilenames: ['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock']
}

export function initConfigFile() {
  const dirPath = path.join(os.homedir(), '.commit-ai')
  const configPath = path.join(dirPath, 'config.json')

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath)
  }

  if (fs.existsSync(configPath)) {
    console.log(`⚠️ Config file already exists at: ${configPath}`)
    return
  }

  fs.writeFileSync(configPath, JSON.stringify(DEFAULT_CONFIG, null, 2))
  console.log(`✅ Config file created at: ${configPath}`)
}
