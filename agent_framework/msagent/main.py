import dotenv
import asyncio
from agent_framework.azure import AzureOpenAIChatClient
from agent_framework.devui import serve
from agent_framework import SequentialBuilder, ConcurrentBuilder
import requests
import os
from typing import Any, Dict

dotenv.load_dotenv()

def get_weather(location: str) -> Dict[str, Any]:    
    response = requests.get(f"https://api.weatherapi.com/v1/current.json?q={location}&key={os.environ['WEATHER_API_KEY']}")
    if response.status_code != 200:
        return "Not found"
    return response.json()

def main():
    assistant = AzureOpenAIChatClient().as_agent(
        name="assistant",
        instructions="You are AI personal assistant",
        tools=[get_weather]
    )

    # result = assistant.run("write a tagline for Coffee Shop")
    # print(result)

    copywriter_agent = AzureOpenAIChatClient().as_agent(
        name="copywriter",
        instructions=("You are a concise copywriter. Provide a single, punchy marketing sentence based on the prompt."),        
    )

    reviewer_agent = AzureOpenAIChatClient().as_agent(
        name="reviewer",
        instructions=("You are a thoughtful reviewer. Give brief feedback on the previous assistant message."),        
    )

    writer_workflow = SequentialBuilder().participants([copywriter_agent, reviewer_agent]).build()
    writer_workflow.name = "writer"

    researcher_agent = AzureOpenAIChatClient().as_agent(
        name="researcher",
        instructions=("You're an expert market and product researcher. Given a prompt, provide concise, factual insights, opportunities, and risks."),        
    )

    marketer_agent = AzureOpenAIChatClient().as_agent(
        name="marketer",
        instructions=("You're a creative marketing strategist. Craft compelling value propositions and target messaging aligned to the prompt."),        
    )

    legal_agent = AzureOpenAIChatClient().as_agent(
        name="legal",
        instructions=("You're a cautious legal/compliance reviewer. Highlight constraints, disclaimers, and policy concerns based on the prompt."),        
    )

    marketer_workflow = ConcurrentBuilder().participants([researcher_agent, marketer_agent, legal_agent]).build()
    marketer_workflow.name = "marketer"

    serve(entities=[assistant, writer_workflow, marketer_workflow], port=8000, auto_open=True)

main()