import os
from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential
from azure.ai.projects.models import MessageTextContent, FunctionTool, ToolSet

def get_weather(city: str) -> str:
    return f"อุณภูมิของ{city} คือ 10 องศา"

project = AIProjectClient.from_connection_string(
    credential=DefaultAzureCredential(),
    conn_str=os.environ["PROJECT_CONNECTION_STRING"],
)
functions = FunctionTool(functions=[get_weather])
toolset = ToolSet()
toolset.add(tool=functions)
project.agents.enable_auto_function_calls(toolset=toolset)

agent = project.agents.create_agent(
    name="Weather",
    model="gpt-4o",
    instructions="You're weather forecaster",
    toolset=toolset,
)
print(f"Agent: {agent.id}")

thread = project.agents.create_thread()
print(f"Thread: {thread.id}")

project.agents.create_message(
    thread_id=thread.id,
    role="user",
    content="ขอสภาพอากาศของจังหวัดเชียงใหม่",
)

project.agents.create_and_process_run(
    thread_id=thread.id,
    agent_id=agent.id,
)

messages = project.agents.list_messages(
    thread_id=thread.id,
)

for data in reversed(messages.data):
    content = data.content[0]
    if isinstance(content, MessageTextContent):
        print(f"{data.role}: {content.text.value}")
    