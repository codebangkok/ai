import asyncio
from autogen_ext.tools.mcp import StdioServerParams, McpWorkbench

async def main():
    # params = StdioServerParams(
    #     command="uvx",
    #     args=["mcp-server-fetch"],
    # )

    params = StdioServerParams(
        command="npx",
        args=["-y", "fetcher-mcp"],
    )

    workbench = McpWorkbench(server_params=params)
    tools = await workbench.list_tools()
    # print(tools)

    result = await workbench.call_tool(
        name=tools[0]["name"],
        arguments={
            "url": "https://arise.tech"
        }
    )
    print(result)

asyncio.run(main())