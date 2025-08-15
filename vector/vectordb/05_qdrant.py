from qdrant_client import QdrantClient
from qdrant_client.models import Document, VectorParams, Distance
import uuid

texts = [
    "Vector Database",
    "I Love You",
    "Good Morning",
]

qdrant_client = QdrantClient(":memory:")

model = "sentence-transformers/all-MiniLM-L6-v2"
documents = [Document(text=text, model=model) for text in texts]
# print(documents)

collection_name = "my-collection"
qdrant_client.create_collection(
    collection_name=collection_name,
    vectors_config=VectorParams(
        size=qdrant_client.get_embedding_size(model),
        distance=Distance.COSINE,
    )
)

qdrant_client.upload_collection(
    collection_name=collection_name,
    vectors=documents,
    ids=[str(uuid.uuid4()) for _ in texts],
    payload=[{"text": text} for text in texts],
)

response = qdrant_client.query_points(
    collection_name=collection_name,
    query=Document(text="greeting", model=model),
    limit=3,
)

for point in response.points:
    print(f"{point.payload['text']} - {point.score}")