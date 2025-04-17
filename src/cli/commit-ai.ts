import { OpenAICommitMessageLLM } from '@/infrastructure/openai/openai-commit-message-llm';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import prompts from 'prompts';
import { copy } from 'copy-paste';
import minimist from 'minimist';
import {
  GenerateCommitMessageFromFiles,
} from '@/application/usecases/generate-commit-message-from-files/generate-commit-message-from-files';
import { GitFileDiffProvider } from '@/infrastructure/git/git-file-diff-provider';
import { ConfigProvider } from '@/infrastructure/config/config-provider';
import { createSpinner } from '@/utils/create-spinner';
import pkg = require('../../package.json');

dotenv.config();

async function main() {
  const args = minimist(process.argv.slice(2));

  const ignoredExtensionsFromCli = typeof args.ignore === 'string'
    ? args.ignore.split(',').map(e => e.trim())
    : undefined;


  if (args.init) {
    const { initConfigFile } = await import('@/infrastructure/config/init-config.js');
    initConfigFile();
    process.exit(0);
  }
  
  if (args.version || args.v) {
    console.log(`🧠 commit-ai version ${pkg.version}`);
    process.exit(0);
  }

  const isQuiet = args.quiet === true;

  if (args.help || args.h) {
    console.log(`
🧠 commit-ai — AI-powered conventional commit message generator

Usage:
  commit-ai [--api-key YOUR_API_KEY]

Options:
  --api-key        Provide your OpenAI API key directly (not recommended in shell history)
  --help, -h       Show this help message
  --ignore          Comma-separated list of file extensions to ignore (e.g. .lock,.snap)
  --init            Create a default ~/.commit-ai/config.json file
  --print-only     Just print the generated commit message without prompt or clipboard
  --quiet           Disable spinners and log output (useful for CI)

API Key Resolution Order:
  1. --api-key CLI argument
  2. OPENAI_API_KEY in environment variables
  3. ~/.commit-ai/config.json (e.g. { "OPENAI_API_KEY": "sk-xxxx" })

Example:
  commit-ai --api-key sk-xxxx
  OPENAI_API_KEY=sk-xxxx commit-ai
  (with config file) commit-ai

Tip: Add a .commit-ai/config.json file in your home directory to avoid typing your key every time.

`);
    process.exit(0);
  }

  const apiKey = ConfigProvider.resolveApiKey(args['api-key']);
  const config = ConfigProvider.getConfig();
  const openai = new OpenAI({ apiKey });

  const mergedConfig = {
    ...config,
    ignoredExtensions: ignoredExtensionsFromCli ?? config.ignoredExtensions,
  };

  const fileDiffProvider = new GitFileDiffProvider(mergedConfig);
  const llm = new OpenAICommitMessageLLM(openai);
  const useCase = new GenerateCommitMessageFromFiles(fileDiffProvider, llm);

  try {
    const spinner = await createSpinner(isQuiet, 'Generating commit message...');

    const message = await useCase.execute(isQuiet);
    spinner.succeed('✅ Commit message generated');


    if (args['print-only']) {
      console.log(message);
      process.exit(0);
    }

    console.log('\n💬 Suggested commit message:\n');
    console.log(message);

    const { confirm } = await prompts({
      type: 'confirm',
      name: 'confirm',
      message: 'Copy to clipboard and use this commit message?',
      initial: true,
    });

    if (confirm) {
      copy(message, () => {
        console.log('📋 Message copied to clipboard. You can now paste it with ⌘V / Ctrl+V.\n');
      });
    } else {
      console.log('❌ Message rejected. Nothing copied.\n');
    }
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

main();
