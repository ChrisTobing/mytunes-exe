from django.shortcuts import render
from django.contrib.auth.models import User
from datetime import datetime

import requests
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import UserAuth, Entry, Friend
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
        'comments', 'created_at'
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
    comments = request.data.get('comments')
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
            comments=comments or [],
        )
        return Response({"message": "Entry added successfully", "entry": entry.id}, status=201)
    except Exception as e:
        return Response({"error": str(e)}, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def has_posted(request):
    today = datetime.now().date()
    user = request.user
    entry = Entry.objects.filter(user=user, created_at__date=today).first()
    if entry:
        today_entry = {
                "id": entry.id,
                "username": user.username,
                "song_name": entry.song_name,
                "song_artist": entry.song_artist,
                "song_album": entry.song_album,
                "song_album_art": entry.song_album_art,
                "song_preview_url": entry.song_preview_url,
                "comments": entry.comments,
                "created_at": entry.created_at,
        }
        return Response({
            "has_posted": True,
            "entry": today_entry,
        }, status=200)
    else:
        return Response({"has_posted": False}, status=200)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_friends(request):
    user = request.user
    today = datetime.now().date()
    user_posted_today = Entry.objects.filter(user=user, created_at__date=today).exists()
    friendships = Friend.objects.filter(user=user).select_related('friend')
    result = []
    for f in friendships:
        print(f.friend.username)
        today_entry = None
        if user_posted_today:
            entry = Entry.objects.filter(user=f.friend, created_at__date=today).first()
            if entry:
                today_entry = {
                    'id': entry.id,
                    'username': f.friend.username,
                    'song_name': entry.song_name,
                    'song_artist': entry.song_artist,
                    'song_album': entry.song_album,
                    'song_album_art': entry.song_album_art,
                    'song_preview_url': entry.song_preview_url,
                    'comments': entry.comments,
                    'created_at': entry.created_at,
                }
        result.append({
            'id': f.id,
            'friend_id': f.friend.id,
            'friend_username': f.friend.username,
            'today_entry': today_entry,
        })
    return Response(result, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_friend(request):
    user = request.user
    username = request.data.get('username')
    if not username:
        return Response({"error": "Username is required"}, status=400)
    if username == user.username:
        return Response({"error": "You cannot add yourself"}, status=400)
    try:
        friend_user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)
    if Friend.objects.filter(user=user, friend=friend_user).exists():
        return Response({"error": "Already friends"}, status=400)
    friendship = Friend.objects.create(user=user, friend=friend_user)
    return Response({
        "message": f"Added {friend_user.username} as a friend",
        "id": friendship.id,
        "friend_id": friend_user.id,
        "friend_username": friend_user.username,
    }, status=201)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_friend(request, friend_id):
    user = request.user
    try:
        friendship = Friend.objects.get(id=friend_id, user=user)
    except Friend.DoesNotExist:
        return Response({"error": "Friend not found"}, status=404)
    friendship.delete()
    return Response({"message": "Friend removed"}, status=200)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_comment(request):
    user = request.user
    entry_id = request.data.get('entry_id')
    username = request.data.get('username')
    text = request.data.get('text')
    if not all([entry_id, text]):
        return Response({"error": "Missing required fields"}, status=400)
    try:
        entry = Entry.objects.get(id=entry_id)
    except Entry.DoesNotExist:
        return Response({"error": "Entry not found"}, status=404)
    entry.comments.append({
        "username": username,
        "text": text,
    })
    entry.save()
    return Response({"message": "Comment added successfully", "comments": entry.comments}, status=201)