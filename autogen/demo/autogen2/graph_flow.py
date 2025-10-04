import asyncio
import dotenv
from autogen_ext.models.ollama import OllamaChatCompletionClient
from autogen_agentchat.agents import AssistantAgent, UserProxyAgent
from autogen_agentchat.ui import Console
from autogen_agentchat.teams import DiGraphBuilder, GraphFlow

dotenv.load_dotenv()

async def main():
    developer_agent = AssistantAgent(
        name="developer",
        model_client=OllamaChatCompletionClient(model="llama3.2:1b"),
        system_message="""You are a developer tasked with implementing a feature based on the provided requirements.
        Your job is to create a detailed implementation plan, including code snippets, architecture decisions, and any
        necessary considerations for the feature. Ensure that your plan is clear, concise, and ready for review by the lead developer.
        """
    )

    lead_developer_agent = AssistantAgent(
        name="lead_developer",
        model_client=OllamaChatCompletionClient(model="llama3.2:1b"),
        system_message="""You are a lead developer reviewing the implementation plan created by the developer.
        Your role is to assess the plan for technical feasibility, adherence to best practices, and alignment with
        project goals. Provide constructive feedback, suggest any necessary changes or improvements, and ensure that the plan is ready for final
        review by the final reviewer. If the plan is satisfactory, approve it for final review.
        """
    )

    final_reviewer_agent = AssistantAgent(
        name="final_reviewer",
        model_client=OllamaChatCompletionClient(model="llama3.1"),
        system_message="""You are a final reviewer assessing the implementation plan.  
        Your role is to provide high-level feedback and ensure alignment with project goals.
        ✅ Approve or ❌ reject the plan with justification. add in generated response
        """
    )

    user_proxy = UserProxyAgent(name="user_proxy")

    builder = DiGraphBuilder()
    builder.add_node(agent=user_proxy)
    builder.add_node(agent=developer_agent)
    builder.add_node(agent=lead_developer_agent)
    builder.add_node(agent=final_reviewer_agent)

    builder.add_edge(source=user_proxy, target=developer_agent)
    builder.add_edge(source=developer_agent, target=lead_developer_agent)
    builder.add_edge(source=lead_developer_agent, target=final_reviewer_agent)

    builder.set_entry_point(user_proxy)

    graph = builder.build()
    flow = GraphFlow(
        participants=[
            user_proxy, 
            developer_agent, 
            lead_developer_agent, 
            final_reviewer_agent
        ],
        graph=graph,
    )
    stream = flow.run_stream(task="Create a detailed implementation plan for a new feature in the project, including code snippets and architecture decisions.")
    await Console(stream)

    await developer_agent.close()
    await lead_developer_agent.close()
    await final_reviewer_agent.close()

asyncio.run(main())