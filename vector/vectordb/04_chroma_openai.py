import chromadb
import uuid
from chromadb.utils.embedding_functions.openai_embedding_function import OpenAIEmbeddingFunction
import dotenv
import os

dotenv.load_dotenv()

texts = [
    "Vector Database",
    "I Love You",
    "Good Morning",
]

chroma_client = chromadb.Client()
# chroma_client = chromadb.PersistentClient("./chroma")
# chroma_client = chromadb.HttpClient(host="localhost", port=8000)

# ef = OpenAIEmbeddingFunction(
#     model_name="nomic-embed-text",
#     api_base=os.environ["OLLAMA_ENDPOINT"],
#     api_key="ollama",
# )

ef = OpenAIEmbeddingFunction(
    api_type="azure",
    deployment_id="text-embedding-3-small",
    api_key=os.environ["AZURE_OPENAI_KEY"],
    api_base=os.environ["AZURE_OPENAI_ENDPOINT"],
    api_version=os.environ["AZURE_OPENAI_VERSION"],
)

collection = chroma_client.create_collection(
    name="my-collection",
    embedding_function=ef,
    configuration={"hnsw" : {"space": "cosine"}}
)

collection.add(
    documents=texts,
    ids=[str(uuid.uuid4()) for _ in texts],
    # metadatas=[{"lang": "en"} for _ in texts],
    metadatas=[{"lang": "en"}, {"lang": "th"}, {"lang": "en"}]
)

# result = collection.peek()
# print(result)

results = collection.query(
    query_texts="embedding",
    n_results=3,
    where={"lang": "en"},
)

print(results["documents"])
print(results["distances"])