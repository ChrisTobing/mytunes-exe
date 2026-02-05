from django.db import models

from django.db import models

class DailySong(models.Model):
    # Data from Spotify (We cache this so we don't spam the API)
    spotify_id = models.CharField(max_length=100)
    title = models.CharField(max_length=200)
    artist = models.CharField(max_length=200)
    album_art_url = models.URLField()
    
    # Social Data (Your App's Value Add)
    user_comment = models.TextField()
    mood_rating = models.IntegerField(default=5) # 1-10 scale
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.user_comment}"
