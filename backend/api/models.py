from django.db import models
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError


class UserAuth:
    """
    Helper class for user registration and authentication.

    Password hashing: Django's create_user() hashes with PBKDF2+SHA256 automatically.
    SQL injection: Django's ORM uses parameterised queries — raw SQL is never constructed.
    """

    @staticmethod
    def register(username: str, password: str) -> tuple[User | None, str | None]:

        if not username or not password:
            return None, "Username and password are required"

        if (User.objects.filter(username=username).exists()):
            return None, "Username already exists"

        try:
            validate_password(password)
        except ValidationError as e:
            return None, str(e)

        user = User.objects.create_user(username=username, password=password)
        return user, "User registered successfully"

    @staticmethod
    def login(username: str, password: str) -> User | None:
        try:
            user = authenticate(username=username, password=password)
            if user is not None:
                return user, "Login successful"
            else:
                return None, "Invalid credentials"
        except Exception as e:
            return None, str(e)

    def __str__(self):
        return f"{self.title} - {self.user.username}"
