from django.db import models
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError


class UserAuth:
    """
    Helper class for user registration and authentication.
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

class Entry(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    song_id = models.BigIntegerField()
    song_name = models.CharField(max_length=255)
    song_artist = models.CharField(max_length=255)
    song_album = models.CharField(max_length=255)
    song_album_art = models.CharField(max_length=255)
    song_preview_url = models.CharField(max_length=255)
    comment = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
