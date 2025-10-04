import asyncio
from autogen_ext.models.ollama import OllamaChatCompletionClient
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.ui import Console
from autogen_ext.tools.mcp import StdioServerParams, mcp_server_tools

async def main():
    model_client = OllamaChatCompletionClient(model="llama3.1")

    params = StdioServerParams(
        command="uv",
        args=[""
            "--directory",
            "/Users/IF630201/dev/autogen/autogen1",
            "run",
            "07_mcp_server.py"
        ],
    )

    tools = await mcp_server_tools(server_params=params)

    assistant_agent = AssistantAgent(
        name="assistant",
        model_client=model_client,
        system_message="You're weather forecaster",
        model_client_stream=True,
        tools=tools,
        reflect_on_tool_use=True,
    )

    stream = assistant_agent.run_stream(task="Weather forecast in Bangkok")
    await Console(stream)

asyncio.run(main())