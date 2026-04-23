## GitHub Copilot CLI

- [Copilot CLI](https://github.com/features/copilot/cli)
- [Copilot CLI Docs](https://docs.github.com/en/copilot/how-tos/copilot-cli)
- [Copilot CLI - Using your own LLM models](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/use-byok-models)
- [Using Microsoft Foundry](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/use-byok-models#connecting-to-azure-openai)
- [Using Ollama](https://docs.ollama.com/integrations/copilot-cli)
- [Copilot CLI now supports BYOK and local models](https://github.blog/changelog/2026-04-07-copilot-cli-now-supports-byok-and-local-models)
- [Using your own LLM models in GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/use-byok-models)
- [VS Code - LiteLLM Provider for GitHub Copilot Chat](https://marketplace.visualstudio.com/items?itemName=vivswan.litellm-vscode-chat)


### Terminal Configuration
`~/.zshrc`
```sh
export COPILOT_PROVIDER_BASE_URL=http://localhost:11434/v1
export COPILOT_PROVIDER_TYPE=openai
export COPILOT_PROVIDER_API_KEY=ollama
export COPILOT_MODEL=gpt-oss
export COPILOT_PROVIDER_MAX_PROMPT_TOKENS=262144
export COPILOT_PROVIDER_MAX_OUTPUT_TOKENS=65536
```

### Offline Mode
`~/.zshrc`
```sh
export COPILOT_OFFLINE=true
```