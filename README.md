# coc-ruff

Managed [Ruff](https://github.com/astral-sh/ruff) language server extension for
[coc.nvim](https://github.com/neoclide/coc.nvim).

The extension downloads the official Ruff release for the current OS and CPU
into Coc's extension storage. It does not discover Ruff from `PATH` unless
`ruff.nativeBinaryPath` explicitly selects an existing executable.

Supported platforms are macOS, Linux, and Windows on ARM64 and x64.

## Commands

- `ruff.install`: reinstall the managed Ruff executable
- `ruff.update`: update the managed Ruff executable
- `ruff.restart`: restart the Ruff language server
- `ruff.executeAutofix`: fix all auto-fixable problems
- `ruff.executeFormat`: format the document
- `ruff.executeOrganizeImports`: organize imports
- `ruff.debugInformation`: print Ruff debug information
- `ruff.showLogs`: show Ruff language-server logs

## Configuration

- `ruff.enable`: enable the extension
- `ruff.prompt`: prompt before downloading a missing executable
- `ruff.nativeBinaryPath`: use an explicitly selected Ruff executable instead
  of the managed copy

Other language-server settings follow
[ruff-vscode](https://github.com/astral-sh/ruff-vscode).

## License

MIT

This repository is derived from
[yaegassy/coc-ruff](https://github.com/yaegassy/coc-ruff).
