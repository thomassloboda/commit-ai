#!/usr/bin/env node

import { Command } from 'commander';
import { OpenAICommitMessageLLM } from '@/infrastructure/openai/openai-commit-message-llm';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import prompts from 'prompts';
import { copy } from 'copy-paste';
import {
  GenerateCommitMessageFromFiles,
} from '@/application/usecases/generate-commit-message-from-files/generate-commit-message-from-files';
import { GitFileDiffProvider } from '@/infrastructure/git/git-file-diff-provider';
import { ConfigProvider } from '@/infrastructure/config/config-provider';
import { createSpinner } from '@/utils/create-spinner';
import { getLogger } from '@/utils/logger';
import pkg = require('../../package.json');

dotenv.config();

const program = new Command();

program
  .name('commit-ai')
  .description('🧠 AI-powered conventional commit message generator')
  .version(pkg.version, '-v, --version', 'Afficher la version')
  .option('--api-key <key>', 'Fournir la clé API OpenAI (non recommandé dans l’historique shell)')
  .option('--ignore <extensions>', 'Extensions de fichier à ignorer, séparées par des virgules')
  .option('--print-only', 'Afficher uniquement le message sans interaction')
  .option('--quiet', 'Désactiver les logs et spinners (pour CI)')
  .option('--init', 'Créer le fichier de config par défaut ~/.commit-ai/config.json')
  .action(async (options) => {
    const ignoredExtensionsFromCli = options.ignore
      ? options.ignore.split(',').map((e: string) => e.trim())
      : undefined;

    if (options.init) {
      const { initConfigFile } = await import('@/infrastructure/config/init-config.js');
      initConfigFile();
      process.exit(0);
    }

    const logger = getLogger(options.quiet);
    const apiKey = ConfigProvider.resolveApiKey(options.apiKey);
    const config = ConfigProvider.getConfig();
    const openai = new OpenAI({ apiKey });

    const mergedConfig = {
      ...config,
      ignoredExtensions: ignoredExtensionsFromCli ?? config.ignoredExtensions,
    };

    const fileDiffProvider = new GitFileDiffProvider(mergedConfig, logger);
    const llm = new OpenAICommitMessageLLM(openai);
    const useCase = new GenerateCommitMessageFromFiles(fileDiffProvider, llm);

    if (options.version || options.v) {
      console.log(pkg.version);
    }

    try {
      const spinner = await createSpinner(!options.quiet, 'Generating commit message...');
      const message = await useCase.execute();
      spinner.succeed('✅ Commit message generated');

      if (options.printOnly) {
        console.log(message);
        process.exit(0);
      }

      logger?.log('\n💬 Suggested commit message:\n');
      logger?.log(message);

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
      logger?.error('❌ Error:', err);
      process.exit(1);
    }
  });

program.parseAsync(process.argv);
