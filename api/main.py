from fastapi import FastAPI
from .v1.endpoints import users
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.include_router(users.router)

"""
This code sets up a FastAPI application and includes a router from a module called 'users'.
It also loads environment variables from a .env file.

Usage:
1. Import FastAPI and other necessary modules.
2. Load environment variables from a .env file using 'load_dotenv()'.
3. Create a FastAPI application instance named 'app'.
4. Include the router defined in the 'users' module using 'app.include_router(users.router)'.

Note:
- This code serves as the main entry point for the FastAPI application.
- The 'users' router is expected to contain route handlers for user-related endpoints.
- Environment variables can be accessed after loading them using 'os.getenv("VARIABLE_NAME")'.
"""
