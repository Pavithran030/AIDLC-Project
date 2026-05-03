# Requirements Document

## Intent Analysis

- **User Request**: Build a real-time collaborative Kanban task management platform
- **Request Type**: New Project (Greenfield)
- **Scope**: Full-stack — FastAPI backend + React frontend
- **Complexity**: Moderate — all core features kept, implemented simply

---

## Simplicity Principle
All features from the original description are kept. The simplicity directive applies to
**implementation approach only** — avoid over-engineering, unnecessary abstractions,
complex patterns, or premature optimization. Write straightforward, readable code.

---

## Functional Requirements

### FR-01: User Authentication
- Register with email, password, display name
- Passwords hashed with bcrypt
- Login returns a JWT token stored in localStorage
- All protected routes require valid JWT (Authorization: Bearer header)
- Logout clears localStorage token

### FR-02: Board Management
- Create boards (name required); auto-generate unique 8-char join code
- Join a board using its join code
- List all boards the user owns or has joined
- Only board members can view/edit a board
- Board owner can set the deadline alert threshold (hours, default 24)

### FR-03: Column Management
- 3 default columns auto-created on board creation: "To Do", "In Progress", "Done"
- Columns are fixed — no add/delete/rename in v1

### FR-04: Card Management
- Create cards in any column (title required, description optional)
- Card fields: title, description, assigned user (optional, single), deadline (optional)
- Update card fields
- Delete cards
- Move cards between columns (drag-and-drop on frontend)
- Cards ordered by creation time within a column (no manual reordering)

### FR-05: Real-Time Synchronization
- Card actions (create, update, delete, move) broadcast instantly via Socket.io
- Users grouped into rooms by board ID — events go only to that board's users
- No page refresh needed

### FR-06: Activity Tracking
- Every card action generates an activity message broadcast to the board room
- Activity stored in DB (simple table: board_id, user_id, message, created_at)
- Frontend shows last 20 activity entries in a sidebar panel, updated in real time

### FR-07: User Presence
- On board open, user's presence is broadcast to others in the room
- On disconnect/leave, presence is removed and others notified
- Frontend shows active user avatars at the top of the board

### FR-08: Deadline Alerts
- Background job runs every 15 minutes using APScheduler
- Checks cards whose deadline is within the board's alert threshold
- Broadcasts a `deadline_alert` Socket.io event to the board room
- Frontend highlights those cards with a warm amber/red tint (simple CSS class, no animation)

### FR-09: Email Notifications
- On card assignment: send email to the assigned user
- On deadline alert trigger: send email to the assigned user
- Sent as FastAPI BackgroundTask (simple, no queue needed)
- Uses SMTP via fastapi-mail

### FR-10: Drag-and-Drop
- Cards draggable between columns using @dnd-kit
- On drop: call REST API to update card's column_id, then Socket.io broadcasts the move

---

## Non-Functional Requirements

### NFR-01: Performance
- Async FastAPI routes + async SQLAlchemy
- Socket.io room-based broadcasting

### NFR-02: Security
- bcrypt password hashing
- JWT validated on every protected request
- CORS restricted to frontend origin

### NFR-03: Deployability
- Backend: Railway or Render (Dockerfile)
- Frontend: Vercel (Vite static build)
- Docker Compose for local dev
- All secrets via environment variables

### NFR-04: Maintainability
- Backend: config → db → models → schemas → services → routers → realtime
- Frontend: types → api → stores → components → pages
- No unnecessary abstractions — keep functions flat and readable

### NFR-05: UI/UX — Handwritten Notebook Theme
- Warm cream/parchment background (`#F5F0E8`)
- Lora serif font for headings and card titles
- Ruled-line card borders
- Pencil-sketch dashed column dividers
- Column headers: ink-colored uppercase — red (To Do), amber (In Progress), green (Done)
- Cards: left-side colored accent border per column
- Deadline-approaching cards: amber/red background tint
- Drag feedback: subtle paper-lift box shadow
- Warm muted palette: cream, parchment, sepia text, ink accents

---

## Data Model

| Entity | Attributes |
|---|---|
| User | id (UUID), email, hashed_password, display_name, created_at |
| Board | id (UUID), name, join_code (unique), owner_id→User, deadline_alert_hours (default 24), created_at |
| BoardMember | board_id→Board, user_id→User, joined_at |
| Column | id (UUID), board_id→Board, name, position (1/2/3), created_at |
| Card | id (UUID), column_id→Column, title, description, assigned_user_id→User (nullable), deadline (nullable), created_at, updated_at |
| ActivityLog | id (UUID), board_id→Board, user_id→User, message (text), created_at |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI (async), Python 3.11+ |
| ORM | SQLAlchemy 2.x (async) + asyncpg |
| Database | PostgreSQL |
| Real-time | python-socketio (ASGI) |
| Auth | JWT (python-jose) + bcrypt (passlib) |
| Scheduler | APScheduler (AsyncIOScheduler) |
| Email | fastapi-mail |
| Frontend | React 18 + Vite + TypeScript |
| State | Zustand |
| HTTP | Axios |
| WebSocket client | socket.io-client |
| Drag-and-drop | @dnd-kit/core + @dnd-kit/sortable |
| Styling | Tailwind CSS + CSS variables |
| Font | Google Fonts — Lora |
| Deployment | Vercel (frontend), Railway/Render (backend) |
| Local dev | Docker Compose |
