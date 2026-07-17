import { commands, ExtensionContext, LanguageClient, services, window, workspace } from 'coc.nvim';
import { ServerInstaller } from '@statiolake/coc-utils';

import { createNativeServerClient } from './client';
import * as executeAutofixCommandFeature from './commands/executeAutofix';
import * as executeFormatCommandFeature from './commands/executeFormat';
import * as executeOrganizeImportsCommandFeature from './commands/executeOrganizeImports';
import * as debugInformationCommandFeature from './commands/debugInformation';
import * as showLogsCommandFeature from './commands/showLogs';
import * as autoFixOnSaveFeature from './features/autoFixOnSave';
import * as showDocumentationCodeActionFeature from './features/showDocumentation';

let client: LanguageClient | undefined;

const packages = {
  'osx-arm64': {
    executable: 'ruff-aarch64-apple-darwin/ruff',
    platformFilename: 'ruff-aarch64-apple-darwin.tar.gz',
    archiver: 'tar-gzip' as const,
  },
  'osx-x64': {
    executable: 'ruff-x86_64-apple-darwin/ruff',
    platformFilename: 'ruff-x86_64-apple-darwin.tar.gz',
    archiver: 'tar-gzip' as const,
  },
  'linux-arm64': {
    executable: 'ruff-aarch64-unknown-linux-gnu/ruff',
    platformFilename: 'ruff-aarch64-unknown-linux-gnu.tar.gz',
    archiver: 'tar-gzip' as const,
  },
  'linux-x64': {
    executable: 'ruff-x86_64-unknown-linux-gnu/ruff',
    platformFilename: 'ruff-x86_64-unknown-linux-gnu.tar.gz',
    archiver: 'tar-gzip' as const,
  },
  'win-arm64': {
    executable: 'ruff-aarch64-pc-windows-msvc/ruff.exe',
    platformFilename: 'ruff-aarch64-pc-windows-msvc.zip',
  },
  'win-x64': {
    executable: 'ruff-x86_64-pc-windows-msvc/ruff.exe',
    platformFilename: 'ruff-x86_64-pc-windows-msvc.zip',
  },
};

export async function activate(context: ExtensionContext): Promise<void> {
  const config = workspace.getConfiguration('ruff');
  if (!config.get('enable', true)) return;

  const installer = new ServerInstaller(
    'ruff',
    context,
    packages,
    { kind: 'github', repo: 'astral-sh/ruff', channel: 'latest' },
    config.get<string>('nativeBinaryPath') || undefined,
  );

  let featuresRegistered = false;
  const start = async (): Promise<void> => {
    const result = await installer.ensureInstalled(config.get('prompt', false), true);
    if (!result.available) return;

    if (client) {
      await client.restart();
      return;
    }

    client = createNativeServerClient(result.path);
    context.subscriptions.push(services.registLanguageClient(client));
    await client.onReady();

    if (!featuresRegistered) {
      featuresRegistered = true;
      showLogsCommandFeature.register(context, client);
      executeAutofixCommandFeature.register(context, client);
      executeOrganizeImportsCommandFeature.register(context, client);
      executeFormatCommandFeature.register(context, client);
      debugInformationCommandFeature.register(context, client);
      autoFixOnSaveFeature.register(client);
      showDocumentationCodeActionFeature.register(context, client);
    }
  };

  context.subscriptions.push(
    commands.registerCommand('ruff.install', async () => {
      await installer.install();
      await start();
    }),
    commands.registerCommand('ruff.update', async () => {
      await installer.ensureUpdated(false, true, true, client);
      if (!client) await start();
    }),
    commands.registerCommand('ruff.restart', start),
  );

  try {
    await start();
  } catch (error) {
    await window.showErrorMessage(`Failed to start managed Ruff: ${error}`);
  }
}
