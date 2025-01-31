## AutoGen 0.4.x
### Installation
```sh
python3 –m venv .venv
source .venv/bin/activate
```

### Python Packages
```sh
pip install "autogen-agentchat" "autogen-ext[openai]"
```

### Environment Parameters
Create `.env` file
```
OPENAI_API_KEY=
AZURE_OPENAI_API_KEY=
AZURE_OPENAI_ENDPOINT=
OPENAI_API_VERSION=
OLLAMA_BASE_URL=
```

### Import Simple Library
```python
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_agentchat.ui import Console
from autogen_core.models import ModelInfo
from autogen_ext.models.openai import OpenAIChatCompletionClient, AzureOpenAIChatCompletionClient
```

### Model Client
OpenAI
```python
OpenAIChatCompletionClient(model="gpt-4o")
```
Azure OpenAI
```python
AzureOpenAIChatCompletionClient(model="gpt-4o")
```

Ollama
```python
OpenAIChatCompletionClient(
    base_url=os.environ["OLLAMA_BASE_URL"],
    model="deepseek-r1", 
    model_info=ModelInfo(
        vision=False, 
        function_calling=True, 
        json_output=True, 
    ),         
)
```

### AssistantAgent
```python
AssistantAgent(
    name="assistant",         
    system_message="You are a helpful assistant.",
    model_client=model_client,
)
```