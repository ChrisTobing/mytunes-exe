from django.shortcuts import render

import requests
from rest_framework.response import Response
from rest_framework.decorators import api_view

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