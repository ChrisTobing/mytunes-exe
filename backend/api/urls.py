# backend/api/urls.py

from django.urls import path
from .views import get_songs, register, login, refresh_token, get_profile, add_entry, has_posted, get_friends, add_friend, remove_friend, add_comment, update_comment, delete_comment, update_username, delete_account, delete_today_entry

urlpatterns = [
    path('songs/', get_songs, name='get_songs'),
    path('auth/register/', register, name='register'),
    path('auth/login/', login, name='login'),
    path('auth/refresh/', refresh_token, name='refresh_token'),
    path('profile/', get_profile, name='get_profile'),
    path('add-entry/', add_entry, name='add_entry'),
    path('has-posted/', has_posted, name='has_posted'),
    path('friends/', get_friends, name='get_friends'),
    path('friends/add/', add_friend, name='add_friend'),
    path('friends/<int:friend_id>/remove/', remove_friend, name='remove_friend'),
    path('add-comment/', add_comment, name='add_comment'),
    path('update-comment/', update_comment, name='update_comment'),
    path('entry/<int:entry_id>/comment/<int:comment_index>/delete/', delete_comment, name='delete_comment'),
    path('update-username/', update_username, name='update_username'),
    path('delete-account/', delete_account, name='delete_account'),
    path('delete-entry/', delete_today_entry, name='delete_today_entry'),
]