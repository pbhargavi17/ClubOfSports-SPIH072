# ClubOfSports Backend

This directory contains the FastAPI backend for ClubOfSports. It provides passwordless session authentication, athlete profiles, discovery, connection requests, connection-only posts, events, recurring schedules, trust scoring, subscriptions, a lightweight match assistant, and a WebSocket endpoint for chat.

## Run locally

Create and activate a Python 3.12+ environment, then install dependencies:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API documentation is available at `http://localhost:8000/docs`, and the health check is `GET /health`.

## Database

Production deployments should set `DATABASE_URL` to PostgreSQL. The current models are SQLAlchemy 2.0-compatible and keep latitude/longitude columns ready for PostGIS distance queries. The development fallback is SQLite, which lets the API and tests run without a local database server.

For a production migration workflow, introduce Alembic and enable the PostGIS extension with `CREATE EXTENSION IF NOT EXISTS postgis;` before applying migrations.

## Authentication

`POST /auth/login` accepts a Firebase ID token and creates or retrieves the corresponding athlete. The current development implementation uses the supplied token as a stable Firebase UID; production deployments should add Firebase Admin SDK token verification before accepting the UID. The response contains a signed JWT, which the frontend sends as a Bearer token.

## Connection-scoped social feed

`POST /posts` creates a caption post for the authenticated athlete. `GET /posts/feed` returns the athlete’s own posts plus posts authored by accepted connections. Pending requests and unrelated athletes never appear in that feed. `DELETE /posts/{post_id}` is restricted to the post owner.

The history endpoint `GET /history` returns the authenticated athlete’s posts, joined events, match records, and accepted connection count. This supports views such as “My posts”, “My events history”, and “My connections”.

## Main endpoint groups

| Area | Endpoints |
|---|---|
| Authentication | `POST /auth/login`, `GET /auth/me` |
| Profile | `PATCH /profiles/me` |
| Discovery | `GET /discover` |
| Connections | `POST /connections/request`, `GET /connections`, `GET /connections/requests`, `POST /connections/{id}/accept`, `POST /connections/{id}/reject` |
| Posts | `POST /posts`, `GET /posts/feed`, `DELETE /posts/{id}` |
| Events | `GET /events`, `POST /events/create`, `POST /events/{id}/join`, `GET /events/my-events` |
| Scheduling | `POST /schedule/create`, `GET /schedule/my-schedule` |
| Trust | `GET /trust/{user_id}`, `POST /ratings/add` |
| Subscription | `GET /subscription/plans`, `GET /subscription/current`, `POST /subscription/select` |
| AI assistant | `POST /ai/match-assistant` |
| Chat | `WS /ws/chat/{conversation_id}` |

## Frontend integration

Set `VITE_API_URL=http://localhost:8000` when running the Vite client. The dashboard now bootstraps a development session, loads the connection feed, and publishes captions through the API. The fallback mock experience remains available when the API is offline so the visual shell does not crash during frontend-only work.

## Tests

```bash
cd backend
pytest -q
```
