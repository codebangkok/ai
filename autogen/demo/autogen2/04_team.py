import asyncio
import dotenv
from autogen_ext.models.ollama import OllamaChatCompletionClient
from autogen_agentchat.agents import AssistantAgent, SocietyOfMindAgent, UserProxyAgent
from autogen_agentchat.ui import Console
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_agentchat.conditions import TextMentionTermination, MaxMessageTermination
from autogen_agentchat.messages import MultiModalMessage
from autogen_core import Image
import utils
import json

dotenv.load_dotenv()

async def main():
    vision_agent = AssistantAgent(
        name="vision",
        model_client=OllamaChatCompletionClient(model="llava"),        
        system_message="You're an image analyser, who describe the image",        
        model_client_stream=True,
    )    

    writer_agent = AssistantAgent(
        name="writer",
        model_client=OllamaChatCompletionClient(model="llama3.1"),
        system_message="You're a writer. who write a tagline about image",
        model_client_stream=True,
    )

    editor_agent = AssistantAgent(
        name="editor",
        model_client=OllamaChatCompletionClient(model="llama3.1"),
        system_message="You're an editor. who feedback tagline from writer about wording must be polite, not funny. Respond with 'APPROVE' if correct",
        model_client_stream=True,
    )

    translator_agent = AssistantAgent(
        name="translator",
        model_client=OllamaChatCompletionClient(model="qwen2"),
        system_message="ํYou're a translator. who translate to Thai language",
        model_client_stream=True,
    )

    user_proxy = UserProxyAgent(name="user_proxy")

    termination = TextMentionTermination(text="APPROVE") | MaxMessageTermination(max_messages=10)

    writer_team = RoundRobinGroupChat(
        participants=[
            writer_agent,
            editor_agent,
            # user_proxy,
        ],
        termination_condition=termination,
    )

    writer_society = SocietyOfMindAgent(
        name="writer_society",
        team=writer_team,
        model_client=OllamaChatCompletionClient(model="llama3.1"),        
    )

    team = RoundRobinGroupChat(
        name="TaglineWriterTeam",
        description="A team of writer agents.",
        participants=[
            vision_agent,
            writer_society, 
            # writer_agent,
            # editor_agent,
            translator_agent,
        ],
        termination_condition=MaxMessageTermination(max_messages=4)       
    )    

    file_path = utils.picsum_photos()
    message = MultiModalMessage(
        content=[
            "Describe this image",
            Image.from_file(file_path)
        ],
        source="user",
    )
    stream = team.run_stream(task=message)
    await Console(stream)

    # with open("team.json", "w") as f:
    #     json.dump(team.dump_component().model_dump(), f, indent=4)

    await vision_agent.close()
    await writer_agent.close()
    await editor_agent.close()
    await translator_agent.close()
    await writer_society.close()
    await user_proxy.close()

asyncio.run(main())