from pydantic import BaseModel, EmailStr, constr

class UserCreate(BaseModel):
    """
    A Pydantic model representing a user creation request.

    Attributes:
        email (EmailStr): The email address of the user. Must be a valid email format.
        password (constr): The password for the user account. Minimum length of 5 characters.
        username (str): The username for the user account.
    """
    email: EmailStr
    password: constr(min_length=5)
    username: str

class User(BaseModel):
    """
    A Pydantic model representing a user.

    Attributes:
        email (EmailStr): The email address of the user. Must be a valid email format.
        username (str): The username of the user.
        id (str): The unique identifier for the user.
        token (str, optional): The authentication token for the user. Defaults to None.
    """
    email: EmailStr
    username: str
    id: str
    token: str = None

class LoginRequest(BaseModel):
    """
    A Pydantic model representing a user login request.

    Attributes:
        email (EmailStr): The email address of the user. Must be a valid email format.
        password (str): The password for the user account.
        token (str, optional): The authentication token for the user. Defaults to None.
    """
    email: EmailStr
    password: str
    token: str = None

class ChangePasswordRequest(BaseModel):
    """
    A Pydantic model for requesting a password change.

    Attributes:
        old_password (str): The current password for the user account.
        new_password (constr): The new password for the user account. Minimum length of 8 characters.
    """
    old_password: str
    new_password: constr(min_length=8)
