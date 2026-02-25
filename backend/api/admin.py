from django.contrib import admin
from .models import Entry, Friend

@admin.register(Entry)
class EntryAdmin(admin.ModelAdmin):
    list_display = ('user', 'song_name', 'song_artist', 'song_album', 'created_at')
    list_filter = ('user', 'created_at')
    search_fields = ('song_name', 'song_artist', 'user__username')

@admin.register(Friend)
class FriendAdmin(admin.ModelAdmin):
    list_display = ('user', 'friend', 'created_at')
    list_filter = ('user',)
    search_fields = ('user__username', 'friend__username')
