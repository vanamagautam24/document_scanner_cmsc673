import os
import motor.motor_asyncio

def get_database():
    """
    Connects to the MongoDB database using connection parameters from environment variables.

    It constructs the connection string from the environment variables 'MONGODB_PASSWORD'
    and 'MONGODB_URL', where 'MONGODB_PASSWORD' is inserted into the 'MONGODB_URL' at the 
    placeholder '<password>'.

    Returns:
        AsyncIOMotorDatabase: An instance of the connected database.
    """
    password = os.getenv("MONGODB_PASSWORD")
    conn_str_template = os.getenv("MONGODB_URL")
    conn_str = conn_str_template.replace("<password>", password)
    client = motor.motor_asyncio.AsyncIOMotorClient(conn_str)
    return client["document_scanner"]

def get_db():
    """
    Generator function that yields the database object and handles database connection.

    This function is typically used in FastAPI as a dependency to provide database access
    to path operation functions. It yields the database object to the caller and ensures
    proper handling of the database connection.

    Yields:
        AsyncIOMotorDatabase: An instance of the connected database.
    """
    db = get_database()
    try:
        yield db
    finally:
        # Clean up or close database connection if necessary
        pass
