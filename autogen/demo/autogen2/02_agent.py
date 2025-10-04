import asyncio
import dotenv
from autogen_ext.models.ollama import OllamaChatCompletionClient
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.messages import TextMessage, MultiModalMessage
from autogen_agentchat.ui import Console
from autogen_core import CancellationToken, Image
import json
import os
import utils
from pydantic import BaseModel, Field
from typing import Literal

dotenv.load_dotenv()

async def main():
    assistant_agent = AssistantAgent(
        name="assistant",
        model_client=OllamaChatCompletionClient(model="llama3.1"),
        system_message="You're a helpful personal assistant",
        model_client_stream=True,
    )

    if os.path.exists("assistant_agent.json"):
        with open("assistant_agent.json", "r") as f:
            state = json.load(f)
            await assistant_agent.load_state(state)

    while True:
        user_message = input("User: ")
        if user_message == "exit":
            break
        
        messages = [TextMessage(content=user_message, source="user")]
        response = await assistant_agent.on_messages(
            messages=messages,
            cancellation_token=CancellationToken(),
        )        
        if isinstance(response.chat_message, TextMessage):
            print(f"Assistant: {response.chat_message.content}")
            print(response.chat_message.models_usage)

    with open("assistant_agent.json", "w") as f:
        state = await assistant_agent.save_state()
        json.dump(state, f, indent=4)

    await assistant_agent.close()

class ImageDescription(BaseModel):
    scene: str = Field(description="Briefly, the overall scene of the image")
    message: str = Field(description="The point that the image is trying to convey")
    style: str = Field(description="The artistic style of the image")
    orientation: Literal["portrait", "landscape", "square"] = Field(description="The orientation of the image")

async def vision():
    vision_agent = AssistantAgent(
        name="vision",
        model_client=OllamaChatCompletionClient(model="llava"),
        system_message="You are the vision agent, who describe the image",
        model_client_stream=True,
        # output_content_type=ImageDescription,
    )

    file_path = utils.picsum_photos()

    message = MultiModalMessage(
        content=[
            "describe this image",
            Image.from_file(file_path),
        ],
        source="user",
    )

    stream = vision_agent.run_stream(task=message)
    await Console(stream)
    await vision_agent.close()

async def weather():
    weather_agent = AssistantAgent(
        name="weather",
        model_client=OllamaChatCompletionClient(model="llama3.1"),        
        system_message="You're weather forecaster",        
        tools=[utils.get_weather],
        reflect_on_tool_use=True,
        model_client_stream=True,
    )

    stream = weather_agent.run_stream(task="Weather forecast in Bangkok")
    await Console(stream)    

    await weather_agent.close()

asyncio.run(vision())