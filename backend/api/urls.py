# backend/api/urls.py

from django.urls import path
from .views import get_songs, register, login, refresh_token, get_profile

urlpatterns = [
    path('songs/', get_songs, name='get_songs'),
    path('auth/register/', register, name='register'),
    path('auth/login/', login, name='login'),
    path('auth/refresh/', refresh_token, name='refresh_token'),
    path('profile/', get_profile, name='get_profile'),
]