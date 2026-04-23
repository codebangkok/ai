## Google Gemini CLI

- [Gemini CLI](https://geminicli.com)
- [Gemini CLI Docs](https://geminicli.com/docs)
- [Using Gemini CLI with a Local LLM](https://dev.to/polar3130/using-gemini-cli-with-a-local-llm-5f5l) How to combine [LiteLLM Proxy](https://docs.litellm.ai) and [Ollama](https://ollama.com) to swap Gemini CLI's backend to a local LLM.
- [VS Code - Gemini CLI Companion](https://marketplace.visualstudio.com/items?itemName=Google.gemini-cli-vscode-ide-companion)

### Terminal Configuration
`~/.zshrc`
```sh
export GOOGLE_GEMINI_BASE_URL=
export GEMINI_API_KEY=
```
Run gemini with --sandbox --model
```sh
gemini --sandbox=false --model=qwen3-coder-next
```

### Using AGENTS.md Configuration
`.gemini/settings.json`
```json
{
  "context": {
    "fileName": ["AGENTS.md", "CLAUDE.md", "GEMINI.md"]
  }
}
```