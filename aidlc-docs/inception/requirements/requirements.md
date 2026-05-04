# Requirements Document — Syncwork

## Intent Analysis

- **Project Name**: Syncwork
- **User Request**: Build a real-time collaborative task management platform
- **Request Type**: New Project (Greenfield)
- **Scope**: Full-stack — FastAPI backend + React frontend
- **Complexity**: Moderate — real-time WebSockets, JWT auth, drag-and-drop, background scheduler

---

## Functional Requirements

### FR-01: User Authentication
- Register with email, password (min 6 chars), display name, confirm password
- Passwords hashed with bcrypt (direct, no passlib)
- Register redirects to login page — no auto-login after registration
- Login returns a JWT token stored in localStorage
- All protected routes require valid JWT (Authorization: Bearer header)
- Logout clears localStorage token
- Forgot password: generates a reset token (30 min expiry), sends email or prints to console in dev
- Reset password: validates token, updates password, clears token
- Password fields have show/hide toggle on all auth pages

### FR-02: Board Management
- Create boards (name required); auto-generate unique 8-char join code
- Join a board using its join code
- List all boards the user owns or has joined
- Only board members can view/edit a board
- Board owner can set the deadline alert threshold (hours, default 24)

### FR-03: Column Management
- 3 default columns auto-created on board creation: "To Do", "In Progress", "Done"
- Columns are fixed — no add/delete/rename

### FR-04: Card Management
- Create cards in any column (title required, description optional)
- Card fields: title, description, assigned user (optional, single), deadline (optional)
- Update card fields
- Delete cards
- Move cards between columns (drag-and-drop)
- Cards ordered by creation time within a column

### FR-05: Real-Time Synchronization
- Card actions (create, update, delete, move) broadcast instantly via Socket.io
- Users grouped into rooms by board ID
- No page refresh needed

### FR-06: Activity Tracking
- Every card action generates an activity message broadcast to the board room
- Activity stored in DB (board_id, user_id, message, created_at)
- Frontend shows last 20 activity entries in a sidebar panel, updated in real time

### FR-07: User Presence
- On board open, user's presence is broadcast to others in the room
- On disconnect/leave, presence is removed and others notified
- Frontend shows active user avatars at the top of the board

### FR-08: Deadline Alerts
- Background job runs every 15 minutes using APScheduler
- Checks cards whose deadline is within the board's alert threshold
- Broadcasts a `deadline_alert` Socket.io event to the board room
- Frontend highlights those cards with a warm amber/red tint

### FR-09: Email Notifications
- On card assignment: send email to the assigned user
- On deadline alert: send email to the assigned user
- On password reset: send reset link email
- Sent as FastAPI BackgroundTask via fastapi-mail
- If MAIL_USERNAME is blank, emails are printed to console (dev mode)

### FR-10: Drag-and-Drop
- Cards draggable between columns using @dnd-kit
- On drop: call REST API to update card's column_id, then Socket.io broadcasts the move

---

## Non-Functional Requirements

### NFR-01: Performance
- Async FastAPI routes + async SQLAlchemy with NullPool (PgBouncer compatible)
- Socket.io room-based broadcasting

### NFR-02: Security
- bcrypt password hashing (direct, no passlib)
- JWT validated on every protected request
- CORS restricted to known frontend origins
- Password reset tokens expire after 30 minutes

### NFR-03: Deployability
- Backend: Render (Python web service)
- Frontend: Vercel (Vite static build)
- Database: Supabase (managed PostgreSQL, pooler connection)
- All secrets via environment variables — no hardcoded values
- No Docker required

### NFR-04: Maintainability
- Backend: config → db → models → schemas → services → routers → realtime
- Frontend: types → api → stores → services → components → pages
- No unnecessary abstractions — flat, readable functions

### NFR-05: UI/UX — Handwritten Notebook Theme
- App name: Syncwork, icon: 🗂️
- Warm cream/parchment background (#F5F0E8)
- Lora serif font (Google Fonts) for headings and card titles
- Ruled-line card borders (CSS repeating-linear-gradient)
- Pencil-sketch dashed column dividers
- Column headers: ink-colored uppercase — red (To Do), amber (In Progress), green (Done)
- Cards: left-side colored accent border per column
- Deadline-approaching cards: amber/red background tint
- Drag feedback: subtle paper-lift box shadow
- Password fields: show/hide eye icon toggle

---

## Data Model

| Entity | Attributes |
|---|---|
| User | id (UUID str), email, hashed_password, display_name, created_at, reset_token (nullable), reset_token_expires (nullable) |
| Board | id (UUID str), name, join_code (8 chars, unique), owner_id→User, deadline_alert_hours (default 24), created_at |
| BoardMember | board_id→Board, user_id→User, joined_at |
| Column | id (UUID str), board_id→Board, name, position (1/2/3), created_at |
| Card | id (UUID str), column_id→Column, title, description (nullable), assigned_user_id→User (nullable), deadline (nullable), created_at, updated_at |
| ActivityLog | id (UUID str), board_id→Board, user_id→User, message (text), created_at |

---

## Tech Stack (Final — As Built)

| Layer | Technology | Notes |
|---|---|---|
| Backend | FastAPI 0.111, Python 3.11+ | Async routes |
| ORM | SQLAlchemy 2.x (async) + asyncpg | NullPool for PgBouncer |
| Database | PostgreSQL (Supabase) | Pooler port 6543 |
| Schema | Plain SQL (schema.sql) | No Alembic |
| Real-time | python-socketio 5.x (ASGI) | Mounted at /socket.io |
| Auth | JWT (python-jose) + bcrypt 5.x | Direct bcrypt, no passlib |
| Scheduler | APScheduler 3.x (AsyncIOScheduler) | Every 15 min |
| Email | fastapi-mail | Dev: console print |
| Frontend | React 18 + Vite 5 + TypeScript 5 | |
| State | Zustand 4.x | |
| HTTP | Axios 1.x | withCredentials, auth interceptor |
| WebSocket client | socket.io-client 4.x | path: /socket.io |
| Drag-and-drop | @dnd-kit/core + @dnd-kit/sortable | |
| Styling | Tailwind CSS 3.x + CSS variables | Notebook theme |
| Font | Google Fonts — Lora | Serif, loaded in index.html |
| Deployment (backend) | Render | Python web service |
| Deployment (frontend) | Vercel | Static SPA, vercel.json for routing |
| Database hosting | Supabase | Free tier, pooler connection |
