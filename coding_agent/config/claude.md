## Claude Code

- [Claude Code](https://code.claude.com)
- [Claude Code Docs](https://code.claude.com/docs)
- [Claude Code - LLM Gateway](https://code.claude.com/docs/en/llm-gateway)
- [Claude Code - Using Microsoft Foundry](https://code.claude.com/docs/en/microsoft-foundry)
- [Microsoft - Using Microsoft Foundry](https://learn.microsoft.com/en-us/azure/foundry/foundry-models/how-to/configure-claude-code)
- [Using Ollama](https://docs.ollama.com/integrations/claude-code)
- [VS Code - Claude Code](https://marketplace.visualstudio.com/items?itemName=anthropic.claude-code) `recommended v2.1.85`

### Terminal Configuration
`~/.zshrc`
```sh
export ANTHROPIC_BASE_URL=http://localhost:11434
export ANTHROPIC_AUTH_TOKEN=ollama
```
Run claude code with --model
```sh
claude --model gpt-oss
```

### VS Code Configuration
Open User Setting (JSON)
```json 
"claudeCode.environmentVariables": [
    { "name": "ANTHROPIC_BASE_URL", "value": "http://localhost:11434" },
    { "name": "ANTHROPIC_AUTH_TOKEN", "value": "ollama" }   
],   
"claudeCode.selectedModel": "gpt-oss",
```

