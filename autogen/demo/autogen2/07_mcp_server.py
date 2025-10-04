from mcp.server.fastmcp import FastMCP
import utils
import dotenv

dotenv.load_dotenv()

mcp = FastMCP("codebangkok")

mcp.add_tool(fn=utils.get_weather)
mcp.run(transport="stdio")