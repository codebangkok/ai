from promptflow.core import tool
from promptflow.connections import CognitiveSearchConnection
from azure.search.documents import SearchClient
from azure.core.credentials import AzureKeyCredential
from azure.search.documents.models import QueryType

@tool
def search_product(question: str, index_name: str, conn: CognitiveSearchConnection) -> list:
    credential = AzureKeyCredential(conn.secrets["api_key"])
    client = SearchClient(endpoint=conn.configs["api_base"], index_name=index_name, credential=credential)    
    items = client.search(
        search_text=question, 
        query_type=QueryType.SEMANTIC, 
        semantic_configuration_name="default",
        top=3,
    )

    products = [
        {
            "id": item["id"],
            "title": item["title"],
            "content": item["content"],
            "url": item["url"]
        }
        for item in items
    ]

    return products
