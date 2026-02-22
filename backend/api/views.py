from django.shortcuts import render

import requests
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import UserAuth, Entry
from rest_framework_simplejwt.tokens import RefreshToken

@api_view(['GET'])
def get_songs(request):

    query = request.query_params.get('query')
    if not query:
        return Response({"error": "Query is required"}, status=400)
    
    try:
        url = f"https://itunes.apple.com/search?term={query}&entity=song&limit=10"
        response = requests.get(url)
        data = response.json()
        clean_data = []

        for item in data['results']:
            clean_data.append({
                'id': item['trackId'],
                'name': item['trackName'],
                'artist': item['artistName'],
                'album': item['collectionName'],
                'albumArt': item['artworkUrl60'],
                'previewUrl': item['previewUrl']
            })
        print(clean_data)
        return Response(clean_data)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(['POST'])
def register(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user, error = UserAuth.register(username, password)
    if user:
        return Response({"message": "User registered successfully", "user": user.id}, status=201)
    else:
        return Response({"error": error}, status=400)


@api_view(['POST'])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user, error = UserAuth.login(username, password)
    if user:
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        response = Response({"message": "Login successful", 
        "user": user.id, 
        "access_token": access_token}, status=200)

        response.set_cookie(key="refresh_token", value=str(refresh), httponly=True, secure=False, samesite="Lax")
        return response
    else:
        response = Response({"error": error}, status=401)
        response.delete_cookie(key="refresh_token")
        return response
        
@api_view(['POST'])
def refresh_token(request):
    refresh_token = request.COOKIES.get('refresh_token')
    if not refresh_token:
        return Response({"error": "No refresh token"}, status=401)
    try:
        refresh = RefreshToken(refresh_token)
        return Response({"access_token": str(refresh.access_token)}, status=200)
    except Exception:
        return Response({"error": "Invalid or expired refresh token"}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    user = request.user
    entries = Entry.objects.filter(user=user).order_by('-created_at').values(
        'id', 'song_id', 'song_name', 'song_artist',
        'song_album', 'song_album_art', 'song_preview_url',
        'comment', 'created_at'
    )
    return Response({
        "id": user.id,
        "username": user.username,
        "entries": list(entries)
    }, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_entry(request):
    user = request.user
    song_id = request.data.get('song_id')
    song_name = request.data.get('song_name')
    song_artist = request.data.get('song_artist')
    song_album = request.data.get('song_album')
    song_album_art = request.data.get('song_album_art')
    song_preview_url = request.data.get('song_preview_url')
    comment = request.data.get('comment')
    if not all([song_id, song_name, song_artist, song_album, song_album_art]):
        return Response({"error": "Missing required song fields"}, status=400)
    try:
        entry = Entry.objects.create(
            user=user,
            song_id=song_id,
            song_name=song_name,
            song_artist=song_artist,
            song_album=song_album,
            song_album_art=song_album_art,
            song_preview_url=song_preview_url or "",
            comment=comment or "",
        )
        return Response({"message": "Entry added successfully", "entry": entry.id}, status=201)
    except Exception as e:
        return Response({"error": str(e)}, status=400)
