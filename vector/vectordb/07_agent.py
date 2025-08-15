from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.ui import Console
from autogen_ext.models.ollama import OllamaChatCompletionClient
import asyncio
from qdrant_client import QdrantClient
from qdrant_client.models import Document, VectorParams, Distance
import uuid
from openai import OpenAI
import dotenv
import os
import numpy

dotenv.load_dotenv()

ai_client = OpenAI(
    base_url=os.environ["OLLAMA_ENDPOINT"],
    api_key="ollama",
)
model = "nomic-embed-text"
collection_name = "my-collection"

# qdrant_client = QdrantClient(":memory:")
qdrant_client = QdrantClient(host="localhost", port=6333)

def get_news(text: str) -> list[str]:
    query_response = ai_client.embeddings.create(input=text, model=model)
    query_embedding = numpy.array(query_response.data[0].embedding)

    response = qdrant_client.query_points(
        collection_name=collection_name,
        query=query_embedding,
        limit=3,
    )
    return [point.payload["text"] for point in response.points]

def create_database():
    with open("news.txt", "r") as f:
        texts = f.read().splitlines()

    response = ai_client.embeddings.create(input=texts, model=model)
    embeddings = [numpy.array(data.embedding) for data in response.data]
    
    qdrant_client.create_collection(
        collection_name=collection_name,
        vectors_config=VectorParams(
            size=len(embeddings[0]),
            distance=Distance.COSINE,
        )
    )

    qdrant_client.upload_collection(
        collection_name=collection_name,
        vectors=embeddings,
        ids=[str(uuid.uuid4()) for _ in texts],
        payload=[{"text": text} for text in texts]
    )


async def main():
    model_client = OllamaChatCompletionClient(model="qwen2")

    assistant_agent = AssistantAgent(
        name="assistant",
        model_client=model_client,
        system_message="You're helpful assistant",
        model_client_stream=True,
        tools=[get_news],
        reflect_on_tool_use=True,
    )

    stream = assistant_agent.run_stream(task="How about Funding & Growth")
    await Console(stream)

asyncio.run(main())
# create_database()