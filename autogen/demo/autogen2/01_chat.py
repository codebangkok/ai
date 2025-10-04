import asyncio
import dotenv
import os
from autogen_ext.models.openai import OpenAIChatCompletionClient
from autogen_ext.models.ollama import OllamaChatCompletionClient
from autogen_ext.models.anthropic import AnthropicChatCompletionClient
from autogen_core.models import SystemMessage, UserMessage, AssistantMessage

# import logging
# from autogen_core import EVENT_LOGGER_NAME
# logging.basicConfig(level=logging.WARNING)
# logger = logging.getLogger(EVENT_LOGGER_NAME)
# logger.addHandler(logging.StreamHandler())
# logger.setLevel(logging.INFO)

dotenv.load_dotenv()

async def main():
    model_client = OpenAIChatCompletionClient(model="gpt-4o-mini")
    model_client = OpenAIChatCompletionClient(
        model="gpt-4o-mini",    
        base_url=os.environ["AZURE_ENDPOINT"],    
        api_key=os.environ["AZURE_API_KEY"],
    )
    model_client = OpenAIChatCompletionClient(
        model="gemini-2.5-flash",
        api_key=os.environ["GEMINI_API_KEY"],
    )
    model_client = AnthropicChatCompletionClient(model="claude-sonnet-4-20250514")
    model_client = OllamaChatCompletionClient(model="llama3.1")

    messages = [SystemMessage(content="You're a helpful personal assistant")]    
    
    while True:        
        user_message = input("User: ")
        if user_message == "exit":
            break
                
        messages.append(UserMessage(content=user_message, source="user"))
        response = await model_client.create(messages=messages)
        print(f"Assistant: {response.content}")
        print(response.usage)
        messages.append(AssistantMessage(content=response.content, source="assistant"))
    
    await model_client.close()

asyncio.run(main())