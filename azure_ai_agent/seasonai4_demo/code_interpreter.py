import os
from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential
from azure.ai.projects.models import MessageTextContent, FilePurpose, CodeInterpreterTool

project = AIProjectClient.from_connection_string(
    credential=DefaultAzureCredential(),
    conn_str=os.environ["PROJECT_CONNECTION_STRING"],
)

file = project.agents.upload_file_and_poll(
    file_path="data.csv",
    purpose=FilePurpose.AGENTS,
)

code_interpreter = CodeInterpreterTool(file_ids=[file.id])

agent = project.agents.create_agent(
    name="Assistant",
    model="gpt-4o",
    instructions="You're helpful assistant",
    tools=code_interpreter.definitions,
    tool_resources=code_interpreter.resources,
)
print(f"Agent: {agent.id}")

thread = project.agents.create_thread()
print(f"Thread: {thread.id}")

project.agents.create_message(
    thread_id=thread.id,
    role="user",
    content="What's NSE code of Aegis Logistics Ltd.?",
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
    