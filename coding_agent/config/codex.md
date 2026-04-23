## OpenAI Codex

- [Codex](https://openai.com/codex)
- [Codex Docs](https://developers.openai.com/codex)
- [Codex - Custom model providers](https://developers.openai.com/codex/config-advanced#custom-model-providers)
- [Codex - Using Microsoft Foundry](https://developers.openai.com/codex/config-advanced#azure-provider-and-per-provider-tuning)
- [Microsoft - Using Microsoft Foundry](https://learn.microsoft.com/en-us/azure/foundry/openai/how-to/codex)
- [Using Ollama](https://docs.ollama.com/integrations/codex)
- [VS Code - Codex](https://marketplace.visualstudio.com/items?itemName=openai.chatgpt)

```sh
ollama launch codex --config
```

### Terminal Configuation

`~/.codex/config.toml`
```toml
model_provider = "ollama"
model = "gpt-oss" 

[profiles.ollama-gpt]
model_provider = "ollama"
model = "gpt-oss"

[profiles.ollama-qwen]
model_provider = "ollama"
model = "qwen3-coder"

[profiles.ollama-glm]
model_provider = "ollama"
model = "glm-4.7-flash"

[model_providers.arise]
name = "Arise"
base_url = ""
env_key = "ARISE_KEY"

[profiles.arise-gpt]
model_provider = "arise"
model = "qpt-oss-120b"

[profiles.arise-qwen]
model_provider = "arise"
model = "qwen3-coder-next"

[profiles.arise-glm]
model_provider = "arise"
model = "glm-4.7-flash"
```

`~/.zshrc`
```sh
export ARISE_KEY=
```
Run codex with -p (profile)
```sh
codex -p ollama-gpt
codex -p arise-gpt
```