from qdrant_client import QdrantClient
from qdrant_client.models import Document, VectorParams, Distance
import uuid
from openai import OpenAI
import dotenv
import os
import numpy

dotenv.load_dotenv()

texts = [
    "Vector Database",
    "I Love You",
    "Good Morning",
]

# qdrant_client = QdrantClient(":memory:")
# qdrant_client = QdrantClient(path="./qdrant")
qdrant_client = QdrantClient(host="localhost", port=6333)

ai_client = OpenAI(
    base_url=os.environ["OLLAMA_ENDPOINT"],
    api_key="ollama",
)
model = "nomic-embed-text"

response = ai_client.embeddings.create(input=texts, model=model)
embeddings = [numpy.array(data.embedding) for data in response.data]
# print(len(embeddings[0]))

# model = "sentence-transformers/all-MiniLM-L6-v2"
# documents = [Document(text=text, model=model) for text in texts]
# print(documents)

collection_name = "my-collection"
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

query_response = ai_client.embeddings.create(input="greeting", model=model)
query_embedding = numpy.array(query_response.data[0].embedding)

response = qdrant_client.query_points(
    collection_name=collection_name,
    query=query_embedding,
    limit=3,
)

for point in response.points:
    print(f"{point.payload['text']} - {point.score}")