import os
import asyncio
from autogen_ext.models.openai import OpenAIChatCompletionClient
from autogen_core.models import ModelInfo, ModelFamily
from autogen_agentchat.agents import AssistantAgent, CodeExecutorAgent
from autogen_agentchat.ui import Console
from autogen_agentchat.messages import MultiModalMessage
from autogen_core import Image
from autogen_ext.code_executors.local import LocalCommandLineCodeExecutor
from autogen_ext.code_executors.docker import DockerCommandLineCodeExecutor

async def get_weather(city: str) -> str:
    return f"อุณหภูมิที่{city} คือ 40 องศา"

async def main():
    model_client_ollama = OpenAIChatCompletionClient(
        model="qwen2",
        base_url=os.environ["OLLAMA_BASE_URL"],
        model_info=ModelInfo(
            vision=False,
            function_calling=True,
            json_output=False,
            family=ModelFamily.UNKNOWN,
        )
    )

    weather_agent = AssistantAgent(
        name="weather",
        model_client=model_client_ollama,
        system_message="คุณคือนักพยากรณ์อากาศ จงนำขัอมูลที่ได้มาสรุป และตอบกลับ",
        tools=[get_weather],
        reflect_on_tool_use=True,
    )

    stream = weather_agent.run_stream(task="ขอข้อมูลสภาพอากาศที่จังหวัดเชียงใหม่")
    await Console(stream)

async def vision():
    model_client_ollama = OpenAIChatCompletionClient(
        model="llama3.2-vision",
        base_url=os.environ["OLLAMA_BASE_URL"],
        model_info=ModelInfo(
            vision=True,
            function_calling=True,
            json_output=False,
            family=ModelFamily.UNKNOWN,
        )
    )

    vision_agent = AssistantAgent(
        name="vision",
        model_client=model_client_ollama,
        system_message="คุณคือนักวิเคราะห์รูปภาพ",
    )

    message = MultiModalMessage(
        content=[
            "describe this image",
            Image.from_file("catdog.png"),
        ],
        source="vision",
    )

    stream = vision_agent.run_stream(task=message)
    await Console(stream)

async def code_executor():
    local_code_executor = LocalCommandLineCodeExecutor(work_dir="coding")
    docker_code_executor = DockerCommandLineCodeExecutor(work_dir="coding")
    await docker_code_executor.start()

    code_executor_agent = CodeExecutorAgent(
        name="code_executor",
        code_executor=docker_code_executor,
    )

    stream = code_executor_agent.run_stream(task="""
```python
print("Hello World")
``` 
""")
    
    await Console(stream)
    await docker_code_executor.stop()

asyncio.run(code_executor())