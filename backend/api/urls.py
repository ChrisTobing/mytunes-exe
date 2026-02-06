# backend/api/urls.py

from django.urls import path
from .views import get_songs
# Import the views you created earlier

urlpatterns = [
    path('songs/', get_songs, name='get_songs'),
]