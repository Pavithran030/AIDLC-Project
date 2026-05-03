# Services Design

## Backend Services

### REST API Service (FastAPI)
- Handles all HTTP requests
- Routes: /auth, /boards, /columns, /cards, /activity
- All routes are async
- JWT validation via FastAPI dependency injection
- Returns JSON responses

### WebSocket Service (Socket.io via python-socketio)
- Mounted alongside FastAPI using ASGI
- Events emitted TO clients: card_created, card_updated, card_moved, card_deleted, column_created, activity_created, presence_updated, deadline_alert
- Events received FROM clients: join_board, leave_board
- Room management: each board_id is a room

### Background Scheduler Service (APScheduler)
- AsyncIOScheduler running in the same event loop as FastAPI
- Job: check_deadlines() every 15 minutes
- On deadline detection: emits Socket.io event + sends email

### Email Service (FastAPI-Mail / aiosmtplib)
- Async SMTP client
- Templates for: card assignment, deadline reminder
- Configured via environment variables (SMTP host, port, user, password)

---

## Frontend Services

### Socket.io Client Service
- Singleton socket instance
- Connects on board page mount, disconnects on unmount
- Emits join_board with board_id on connect
- Listens for all server events and dispatches to Zustand stores

### Axios HTTP Service
- Base URL from environment variable
- withCredentials: true (for httpOnly cookie)
- Response interceptor: 401 → clear auth store → redirect to /login
- Request interceptor: can add headers if needed

### Zustand Store Orchestration
- Socket events → store actions → React re-renders
- No polling; all state updates driven by WebSocket events or user actions
