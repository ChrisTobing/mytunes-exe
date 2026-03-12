from django.shortcuts import render
from django.contrib.auth.models import User
from datetime import datetime
import math

import requests
from rest_framework import serializers
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import UserAuth, Entry, Friend, UserProfile
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import extend_schema, OpenApiParameter, inline_serializer
from drf_spectacular.types import OpenApiTypes

def get_profile_pic_url(user, request):
    """
    Return an absolute URL for a user's profile picture, or None if unset.
    request.build_absolute_uri() converts the relative storage path
    (e.g. /media/profile_pics/foo.jpg) into a full URL the frontend can use.
    """
    try:
        if user.profile.profile_picture:
            return request.build_absolute_uri(user.profile.profile_picture.url)
    except Exception:
        pass
    return None


@extend_schema(
    summary="Upload profile picture",
    description="Replaces the authenticated user's profile picture. Send as multipart/form-data.",
    request=inline_serializer("UploadProfilePictureRequest", fields={
        "profile_picture": serializers.ImageField(),
    }),
    responses={200: inline_serializer("UploadProfilePictureResponse", fields={
        "profile_picture_url": serializers.CharField(),
    })},
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_profile_picture(request):
    if 'profile_picture' not in request.FILES:
        return Response({"error": "No file provided"}, status=400)
    # get_or_create so the endpoint works even if UserProfile doesn't exist yet.
    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    profile.profile_picture = request.FILES['profile_picture']
    profile.save()
    url = request.build_absolute_uri(profile.profile_picture.url)
    return Response({"profile_picture_url": url}, status=200)


@extend_schema(
    summary="Search songs",
    description="Queries the iTunes Search API for songs matching the given term. No authentication required.",
    parameters=[OpenApiParameter(name="query", type=OpenApiTypes.STR, required=True, description="Search term")],
    responses={200: inline_serializer("SongResult", fields={
        "id": serializers.IntegerField(),
        "name": serializers.CharField(),
        "artist": serializers.CharField(),
        "album": serializers.CharField(),
        "albumArt": serializers.CharField(),
        "previewUrl": serializers.CharField(),
        "primaryGenreName": serializers.CharField(),
    }, many=True)},
)
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
                'previewUrl': item['previewUrl'],
                'primaryGenreName': item['primaryGenreName'],
            })
        print(clean_data)
        return Response(clean_data)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@extend_schema(
    summary="Register",
    description="Creates a new user account.",
    request=inline_serializer("RegisterRequest", fields={
        "username": serializers.CharField(),
        "password": serializers.CharField(),
    }),
    responses={201: inline_serializer("RegisterResponse", fields={
        "message": serializers.CharField(),
        "user": serializers.IntegerField(),
    })},
)
@api_view(['POST'])
def register(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user, error = UserAuth.register(username, password)
    if user:
        return Response({"message": "User registered successfully", "user": user.id}, status=201)
    else:
        return Response({"error": error}, status=400)


@extend_schema(
    summary="Login",
    description="Authenticates a user. Returns an access token in the body and sets a `refresh_token` httpOnly cookie.",
    request=inline_serializer("LoginRequest", fields={
        "username": serializers.CharField(),
        "password": serializers.CharField(),
    }),
    responses={200: inline_serializer("LoginResponse", fields={
        "message": serializers.CharField(),
        "user": serializers.IntegerField(),
        "access_token": serializers.CharField(),
    })},
)
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
        
@extend_schema(
    summary="Refresh access token",
    description="Uses the `refresh_token` httpOnly cookie to issue a new access token. No request body needed.",
    request=None,
    responses={200: inline_serializer("RefreshTokenResponse", fields={
        "access_token": serializers.CharField(),
    })},
)
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

@extend_schema(
    summary="Get profile",
    description="Returns the authenticated user's profile and all their past entries.",
    responses={200: inline_serializer("ProfileResponse", fields={
        "id": serializers.IntegerField(),
        "username": serializers.CharField(),
        "profile_picture_url": serializers.CharField(allow_null=True),
        "entries": serializers.ListField(),
    })},
)
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
        "profile_picture_url": get_profile_pic_url(user, request),
        "entries": list(entries)
    }, status=200)


@extend_schema(
    summary="Add entry",
    description="Creates today's song entry for the authenticated user. One entry per day.",
    request=inline_serializer("AddEntryRequest", fields={
        "song_id": serializers.IntegerField(),
        "song_name": serializers.CharField(),
        "song_artist": serializers.CharField(),
        "song_album": serializers.CharField(),
        "song_album_art": serializers.CharField(),
        "song_preview_url": serializers.CharField(required=False),
        "song_genre": serializers.CharField(required=False),
        "comments": serializers.ListField(required=False),
    }),
    responses={201: inline_serializer("AddEntryResponse", fields={
        "message": serializers.CharField(),
        "entry": serializers.IntegerField(),
    })},
)
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
    song_genre = request.data.get('song_genre', '')
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
            song_genre=song_genre,
            comments=comments or [],
        )
        return Response({"message": "Entry added successfully", "entry": entry.id}, status=201)
    except Exception as e:
        return Response({"error": str(e)}, status=400)


@extend_schema(
    summary="Has posted today",
    description="Returns whether the user has submitted an entry today, and includes that entry if so.",
    responses={200: inline_serializer("HasPostedResponse", fields={
        "has_posted": serializers.BooleanField(),
        "entry": serializers.DictField(required=False),
    })},
)
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
                "profile_picture_url": get_profile_pic_url(user, request),
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


@extend_schema(
    summary="List friends",
    description="Returns all friends. If the user has posted today, each friend's today entry is included (gated by the privacy model).",
    responses={200: inline_serializer("FriendItem", fields={
        "id": serializers.IntegerField(),
        "friend_id": serializers.IntegerField(),
        "friend_username": serializers.CharField(),
        "profile_picture_url": serializers.CharField(allow_null=True),
        "today_entry": serializers.DictField(allow_null=True),
    }, many=True)},
)
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
                    'profile_picture_url': get_profile_pic_url(f.friend, request),
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
            'profile_picture_url': get_profile_pic_url(f.friend, request),
            'today_entry': today_entry,
        })
    return Response(result, status=200)


@extend_schema(
    summary="Add friend",
    description="Adds another user as a friend by username. Returns the new friendship with their today entry if available.",
    request=inline_serializer("AddFriendRequest", fields={
        "username": serializers.CharField(),
    }),
    responses={201: inline_serializer("AddFriendResponse", fields={
        "message": serializers.CharField(),
        "id": serializers.IntegerField(),
        "friend_id": serializers.IntegerField(),
        "friend_username": serializers.CharField(),
        "profile_picture_url": serializers.CharField(allow_null=True),
        "today_entry": serializers.DictField(allow_null=True),
    })},
)
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
    today = datetime.now().date()
    entry = Entry.objects.filter(user=friend_user, created_at__date=today).first()
    today_entry = None
    if entry:
        today_entry = {
            "id": entry.id,
            "username": friend_user.username,
            "profile_picture_url": get_profile_pic_url(friend_user, request),
            "song_name": entry.song_name,
            "song_artist": entry.song_artist,
            "song_album": entry.song_album,
            "song_album_art": entry.song_album_art,
            "song_preview_url": entry.song_preview_url,
            "comments": entry.comments,
            "created_at": entry.created_at,
        }
    return Response({
        "message": f"Added {friend_user.username} as a friend",
        "id": friendship.id,
        "friend_id": friend_user.id,
        "friend_username": friend_user.username,
        "profile_picture_url": get_profile_pic_url(friend_user, request),
        "today_entry": today_entry,
    }, status=201)


@extend_schema(
    summary="Remove friend",
    description="Deletes a friendship by its ID. Only the user who created the friendship can remove it.",
    responses={200: inline_serializer("RemoveFriendResponse", fields={
        "message": serializers.CharField(),
    })},
)
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

@extend_schema(
    summary="Add comment",
    description="Appends a comment to any entry. Returns the full updated comments array.",
    request=inline_serializer("AddCommentRequest", fields={
        "entry_id": serializers.IntegerField(),
        "username": serializers.CharField(),
        "text": serializers.CharField(),
    }),
    responses={201: inline_serializer("AddCommentResponse", fields={
        "message": serializers.CharField(),
        "comments": serializers.ListField(),
    })},
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_comment(request):
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

@extend_schema(
    summary="Update comment",
    description="Edits the text of an existing comment by its index in the entry's comments array.",
    request=inline_serializer("UpdateCommentRequest", fields={
        "entry_id": serializers.IntegerField(),
        "comment_index": serializers.IntegerField(),
        "text": serializers.CharField(),
    }),
    responses={200: inline_serializer("UpdateCommentResponse", fields={
        "message": serializers.CharField(),
        "comments": serializers.ListField(),
    })},
)
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_comment(request):
    user = request.user
    entry_id = request.data.get('entry_id')
    comment_index = request.data.get('comment_index')
    text = request.data.get('text')

    # Validate input
    if not all([entry_id, comment_index is not None, text]):
        return Response({"error": "Missing required fields"}, status=400)
    try:
        entry = Entry.objects.get(id=entry_id)
    except Entry.DoesNotExist:
        return Response({"error": "Entry not found"}, status=404)
    if comment_index < 0 or comment_index >= len(entry.comments):
        return Response({"error": "Invalid comment index"}, status=400)
    
    entry.comments[comment_index]['text'] = text
    entry.save()
    return Response({"message": "Comment updated successfully", "comments": entry.comments}, status=200)


@extend_schema(
    summary="Delete comment",
    description="Removes a comment at the given index. Only the comment's author (matched by username) can delete it.",
    responses={200: inline_serializer("DeleteCommentResponse", fields={
        "message": serializers.CharField(),
        "comments": serializers.ListField(),
    })},
)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_comment(request, entry_id, comment_index):
    user = request.user
    try:
        entry = Entry.objects.get(id=entry_id)
    except Entry.DoesNotExist:
        return Response({"error": "Entry not found"}, status=404)
    if comment_index < 0 or comment_index >= len(entry.comments):
        return Response({"error": "Invalid comment index"}, status=400)
    if entry.comments[comment_index].get('username') != user.username:
        return Response({"error": "You can only delete your own comments"}, status=403)
    entry.comments.pop(comment_index)
    entry.save()
    return Response({"message": "Comment deleted successfully", "comments": entry.comments}, status=200)

@extend_schema(
    summary="Update username",
    description="Changes the authenticated user's username. The new username must be unique.",
    request=inline_serializer("UpdateUsernameRequest", fields={
        "new_username": serializers.CharField(),
    }),
    responses={200: inline_serializer("UpdateUsernameResponse", fields={
        "message": serializers.CharField(),
        "username": serializers.CharField(),
    })},
)
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_username(request):
    user = request.user
    new_username = request.data.get('new_username')
    if not new_username:
        return Response({"error": "New username is required"}, status=400)
    if User.objects.filter(username=new_username).exists():
        return Response({"error": "Username already exists"}, status=400)
    user.username = new_username
    user.save()
    return Response({"message": "Username updated successfully", "username": user.username}, status=200)


@extend_schema(
    summary="Delete account",
    description="Permanently deletes the authenticated user's account and clears the refresh token cookie.",
    request=None,
    responses={200: inline_serializer("DeleteAccountResponse", fields={
        "message": serializers.CharField(),
    })},
)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_account(request):
    user = request.user
    user.delete()
    response = Response({"message": "Account deleted successfully"}, status=200)
    response.delete_cookie(key="refresh_token")
    return response

@extend_schema(
    summary="Delete today's entry",
    description="Deletes the authenticated user's entry for today, allowing them to re-post.",
    request=None,
    responses={200: inline_serializer("DeleteEntryResponse", fields={
        "message": serializers.CharField(),
    })},
)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_today_entry(request):
    user = request.user
    today = datetime.now().date()
    entry = Entry.objects.filter(user=user, created_at__date=today).first()
    if not entry:
        return Response({"error": "No entry found for today"}, status=404)
    entry.delete()
    return Response({"message": "Today's entry deleted successfully"}, status=200)


def build_pie_svg(genre_list, size=120):
    """
    Generate an SVG pie chart from a list of {genre, percentage} dicts.

    How each slice is drawn:
    - Convert the slice's percentage to an angle in radians.
    - Use trig (cos/sin) to find the (x,y) point on the circle where that
      slice ends, treating 12 o'clock (top) as 0° by starting at -π/2.
    - The SVG arc command needs a large-arc-flag: 1 if the slice spans more
      than 180° (>50%), 0 otherwise — this tells the renderer which of the
      two possible arcs to draw.
    """
    cx = cy = r = size / 2
    n = len(genre_list)
    angle = -math.pi / 2  # start at top (12 o'clock)
    paths = []

    for i, item in enumerate(genre_list):
        hue = round(i * 360 / n)
        color = f"hsl({hue}, 60%, 40%)"
        sweep = 2 * math.pi * item["percentage"] / 100

        x1 = cx + r * math.cos(angle)
        y1 = cy + r * math.sin(angle)
        angle += sweep
        x2 = cx + r * math.cos(angle)
        y2 = cy + r * math.sin(angle)

        large_arc = 1 if sweep > math.pi else 0
        d = f"M {cx},{cy} L {x1:.3f},{y1:.3f} A {r},{r} 0 {large_arc},1 {x2:.3f},{y2:.3f} Z"
        paths.append(f'<path d="{d}" fill="{color}" />')

    inner = "\n  ".join(paths)
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 {size} {size}">'
        f"\n  {inner}\n</svg>"
    )


@extend_schema(
    summary="Genre stats",
    description="Returns the user's all-time genre breakdown with percentages, HSL colors, and a backend-generated SVG pie chart.",
    responses={200: inline_serializer("GenreStatsResponse", fields={
        "genres": serializers.ListField(),
        "total": serializers.IntegerField(),
        "svg": serializers.CharField(),
    })},
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def genre_stats(request):
    user = request.user

    # Fetch every entry the user has ever posted, excluding blanks.
    # values_list with flat=True returns a plain list of strings, not QuerySet dicts.
    genres = Entry.objects.filter(
        user=user
    ).exclude(
        song_genre=""
    ).values_list('song_genre', flat=True)

    total = len(genres)
    if total == 0:
        # Return a plain grey circle as a placeholder SVG so the frontend
        # always has something to render without needing a conditional branch.
        placeholder = (
            '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">'
            '<circle cx="60" cy="60" r="60" fill="#c0c0c0" />'
            "</svg>"
        )
        return Response({"genres": [], "total": 0, "svg": placeholder}, status=200)
    
    counts = {}
    for genre in genres:
        counts[genre] = counts.get(genre, 0) + 1

    # Build the response list: sort descending by count so the top genre comes first.
    # Round percentage to one decimal place for clean display.
    genre_list = sorted(
        [
            {
                "genre": genre,
                "count": count,
                "percentage": round((count / total) * 100, 1),
            }
            for genre, count in counts.items()
        ],
        key=lambda x: x["count"],
        reverse=True,
    )

    # Assign colors after sorting so index i matches the SVG slice order.
    # Uses the same HSL formula as build_pie_svg.
    n = len(genre_list)
    for i, item in enumerate(genre_list):
        item["color"] = f"hsl({round(i * 360 / n)}, 60%, 40%)"

    return Response({"genres": genre_list, "total": total, "svg": build_pie_svg(genre_list)}, status=200)