## OpenCode

- [OpenCode](https://opencode.ai)
- [OpenCode Docs](https://opencode.ai/docs)
- [OpenCode - LLM Providers](https://opencode.ai/docs/providers)
- [OpenCode - Using Microsoft Foundry](https://opencode.ai/docs/providers/#azure-openai)
- [OpenCode - Using Ollama](https://opencode.ai/docs/providers/#ollama)
- [Using Ollama](https://docs.ollama.com/integrations/opencode)
- [Custom Provider](https://opencode.ai/docs/providers/#custom-provider)
- [VSCode - opencode](https://marketplace.visualstudio.com/items?itemName=sst-dev.opencode)
- [VSCode - OpenCode GUI](https://marketplace.visualstudio.com/items?itemName=TanishqKancharla.opencode-vscode)

```sh
ollama launch opencode --config
```

### Terminal Configuration

`~/.config/opencode/opencode.json`
```json
{
  "$schema": "https://opencode.ai/config.json",  
  "provider": {    
    "arise": {
      "models": {
        "gpt-oss-120b": {         
          "name": "gpt-oss-120b"
        },
        "qwen3-coder-next": {         
          "name": "qwen3-coder-next"
        },
        "glm-4.7-flash": {         
          "name": "glm-4.7-flash"
        }       
      },
      "name": "arise",
      "npm": "@ai-sdk/openai-compatible",
      "options": {
        "baseURL": "",
        "apiKey": "{env:ARISE_KEY}"
      }
    },
    "ollama": {
      "models": {
        "gpt-oss": {          
          "name": "gpt-oss"
        },
        "qwen3-coder": {          
          "name": "qwen3-coder"
        },
        "glm-4.7-flash": {         
          "name": "glm-4.7-flash"
        }  
      },
      "name": "Ollama",
      "npm": "@ai-sdk/openai-compatible",
      "options": {
        "baseURL": "http://127.0.0.1:11434/v1"
      }
    }
  }
}
```
`~/.zshrc`
```sh
export ARISE_KEY=
```

Run opencode with -m (providers/model)
```sh
opencode -m arise/gpt
```