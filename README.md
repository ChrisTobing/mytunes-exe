# MyTunes

A Windows XP-themed music journaling social app. Every day, pick a song that matches your mood, write a comment about it, and see what your friends are listening to.

## What it does

- **Daily entry** — Search songs via the iTunes Search API, select a track, and post it as your entry for the day. One entry per day.
- **Social feed** — A carousel-style feed shows your entry alongside your friends' entries, but only after you've posted. Write comments on any entry.
- **Friends** — Add friends by username. See what they're listening to in real time (once you've both posted).
- **Profile** — Update your display name, upload a profile picture, view today's tape, and see a genre breakdown pie chart of all your entries.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, xp.css |
| Backend | Django 6, Django REST Framework |
| Auth | SimpleJWT (access token in memory, refresh token as httpOnly cookie) |
| Database | SQLite |
| Song search | iTunes Search API (no key required) |

## Project structure

```
mytunesexe/
├── backend/
│   ├── core/          # Django project config (settings, root urls)
│   ├── api/           # All business logic (models, views, urls)
│   ├── media/         # Uploaded profile pictures (gitignored)
│   └── db.sqlite3
└── frontend/
    └── src/
        ├── App.jsx         # Main authenticated view, owns entry/feed state
        ├── Feed.jsx        # Carousel feed with commenting
        ├── EntryForm.jsx   # Song search and submission
        ├── Friends.jsx     # Friends list management
        ├── Profile.jsx     # User profile, genre stats, settings
        ├── Login.jsx / SignUp.jsx
        ├── main.jsx        # Root component, auth bootstrap
        └── utils/
            └── functions.jsx
```

## API Documentation

For complete endpoint documentation with request/response examples, see [mytunesapi.pdf](MyTunesAPI.pdf).

Alternatively, run the backend server and visit `http://localhost:8000/api/docs/` for interactive Swagger UI documentation.

## Getting started

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers requests Pillow
python manage.py migrate
python manage.py runserver     # http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev                    # http://localhost:5173
```

## Auth flow

1. Login → backend returns `access_token` in JSON body + sets `refresh_token` as an httpOnly cookie
2. Frontend stores the access token in React state only (never localStorage)
3. All authenticated requests send `Authorization: Bearer <access_token>`
4. On page refresh, `main.jsx` POSTs to `/api/auth/refresh/` using the cookie to restore the session silently

## Privacy model

Friends' entries are gated — you can only see them after you've posted your own entry for the day. This is enforced on both the frontend (`hasPosted` state) and backend (`get_friends` checks before populating `today_entry`).
