from sentence_transformers import SentenceTransformer
from openai import OpenAI
import dotenv
import os
import sqlite3
import sqlite_vec
import numpy

dotenv.load_dotenv()

texts = [
    "Vector Database",
    "I Love You",
    "Good Morning",
]

# model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
# embeddings = model.encode(texts)
# print(len(embeddings[0]))

ai_client = OpenAI(
    base_url=os.environ["OLLAMA_ENDPOINT"],
    api_key="ollama",
)
model = "nomic-embed-text"
dimensions = 768

# ai_client = OpenAI(api_key=os.environ["OPENAI_KEY"])
# model = "text-embedding-3-small"
# dimensions = 1536

# ai_client = OpenAI(
#     base_url=os.environ["AZURE_OPENAI_ENDPOINT"] + "/openai/v1",
#     api_key=os.environ["AZURE_OPENAI_KEY"],
#     default_query={"api-version": "preview"},
# )
# model = "text-embedding-3-large"
# dimensions = 3072

# response = ai_client.embeddings.create(input=texts, model=model)
# print(len(response.data[0].embedding))

conn = sqlite3.connect(":memory:")
conn.enable_load_extension(True)
sqlite_vec.load(conn)
cursor = conn.cursor()
cursor.execute(f"""
create virtual table documents using vec0(
    vector float[{dimensions}]
)
""")

response = ai_client.embeddings.create(input=texts, model=model)
embeddings = [(numpy.array(data.embedding, dtype=numpy.float32).tobytes(),) for data in response.data]
cursor.executemany("insert into documents(vector) values(?)", embeddings)

query_response = ai_client.embeddings.create(input="embedding", model=model)
query_embedding = (numpy.array(query_response.data[0].embedding, dtype=numpy.float32).tobytes(),)

cursor.execute("""
select
    rowid,
    distance,
    vector
from documents
where vector match ?
order by distance
limit 5
""", query_embedding)

rows = cursor.fetchall()
for id, distance, _ in rows:
    print(f"{id} - {distance}")