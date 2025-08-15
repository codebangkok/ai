import chromadb
import uuid

texts = [
    "Vector Database",
    "I Love You",
    "Good Morning",
]

chroma_client = chromadb.Client()

collection = chroma_client.create_collection(
    name="my-collection",
)

collection.add(
    documents=texts,
    ids=[str(uuid.uuid4()) for _ in texts],
    metadatas=[{"lang": "en"} for _ in texts],
)

# result = collection.peek()
# print(result)

results = collection.query(
    query_texts="feeling",
    n_results=3,
)

print(results["documents"])
print(results["distances"])