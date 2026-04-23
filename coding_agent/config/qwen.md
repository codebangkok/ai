## Qwen Code

- [Qwen Code](https://qwen.ai/qwencode)
- [Qwen Code GitHub](https://github.com/QwenLM/qwen-code)
- [Qwen Code - Docs](https://qwenlm.github.io/qwen-code-docs/en/developers/architecture)
- [VS Code - Qwen Code Companion](https://marketplace.visualstudio.com/items?itemName=qwenlm.qwen-code-vscode-ide-companion)


### Terminal Configuration

`~/.qwen/settins.json`
```sh
export OLLAMA_API_KEY=ollama
```

```json
{
  "modelProviders": {
    "openai": [
      {
        "id": "gpt-oss",
        "name": "GPT-OSS",
        "envKey": "OLLAMA_API_KEY",
        "baseUrl": "http://localhost:11434/v1"
      }
    ]
  },
  "security": {
    "auth": {
      "selectedType": "openai"
    }
  },
  "model": {
    "name": "qpt-oss"
  }
}
```