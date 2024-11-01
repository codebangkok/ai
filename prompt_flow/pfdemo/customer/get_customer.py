from promptflow.core import tool
from promptflow.connections import CustomConnection
from azure.cosmos import CosmosClient

@tool
def get_customer(customerId: str, conn: CustomConnection) -> dict:
    client = CosmosClient(url=conn.configs["endpoint"], credential=conn.secrets["key"])
    db = client.get_database_client(conn.configs["databaseId"])
    container = db.get_container_client(conn.configs["containerId"])
    customer = container.read_item(item=customerId, partition_key=customerId)
    return customer
