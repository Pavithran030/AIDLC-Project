# Unit of Work Dependencies

## Dependency Matrix

| Unit | Depends On | Communication |
|---|---|---|
| Frontend | Backend REST API | HTTP (Axios, withCredentials) |
| Frontend | Backend WebSocket | Socket.io (ws/wss) |
| Backend | PostgreSQL | Async SQLAlchemy |
| Backend | SMTP Server | Async SMTP (fastapi-mail) |

## Deployment Order
1. PostgreSQL (database must be running first)
2. Backend (needs DB connection + SMTP config)
3. Frontend (needs backend URL in env vars)

## Development Order
1. Backend models + migrations (foundation)
2. Backend auth + board/column/card services (core API)
3. Backend Socket.io server (real-time layer)
4. Backend scheduler + email (background features)
5. Frontend auth + board list (foundation)
6. Frontend Kanban board + drag-and-drop (core UI)
7. Frontend real-time integration (Socket.io client)
8. Frontend activity feed + presence + alerts (real-time features)
