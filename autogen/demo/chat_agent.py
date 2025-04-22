import os
import asyncio
from autogen_ext.models.openai import OpenAIChatCompletionClient, AzureOpenAIChatCompletionClient
from autogen_core.models import ModelInfo, ModelFamily, SystemMessage, UserMessage, AssistantMessage
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.messages import TextMessage
from autogen_core import CancellationToken
import json
from autogen_ext.models.cache import CHAT_CACHE_VALUE_TYPE
from autogen_ext.cache_store.redis import RedisStore
import redis

async def main():    
    model_client_ollama = OpenAIChatCompletionClient(
        model="qwen2",
        base_url=os.environ["OLLAMA_BASE_URL"],
        model_info=ModelInfo(
            vision=False,
            function_calling=False,
            json_output=False,
            family=ModelFamily.UNKNOWN,
        )
    )

    assistant_agent = AssistantAgent(
        name="assistant",
        model_client=model_client_ollama,
        system_message="You're a helpful personal assistant.",
    )

    # if os.path.exists("assistant_agent.json"):
    #     with open("assistant_agent.json", "r") as f:
    #         state = json.load(f)
    #         await assistant_agent.load_state(state)

    redis_instance = redis.Redis()
    cache_store = RedisStore[CHAT_CACHE_VALUE_TYPE](redis_instance)
    state = cache_store.get("assistant_agent")
    if state:
        state = json.loads(state)
        await assistant_agent.load_state(state)

    while True:
        user_message = input("User: ")
        if user_message == "exit":
            break

        cancellation_token = CancellationToken()        
        message = TextMessage(content=user_message, source="user")
        response = await assistant_agent.on_messages(
            messages=[message],
            cancellation_token=cancellation_token,
        )
        print(f"{response.chat_message.content}\n{response.chat_message.models_usage}")

    # with open("assistant_agent.json", "w") as f:
    #     state = await assistant_agent.save_state()
    #     json.dump(state, f, indent=4)    

    state = await assistant_agent.save_state()
    cache_store.set("assistant_agent", json.dumps(state))

asyncio.run(main())