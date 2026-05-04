# Application Components — Syncwork (Final As-Built)

## Backend Components

### AuthService + AuthRouter (`/auth`)
- `POST /auth/register` — validate, hash password (bcrypt direct), create user, return success message (no token)
- `POST /auth/login` — verify password, return JWT token + user
- `GET /auth/me` — return current user from JWT
- `POST /auth/forgot-password` — generate reset token (secrets.token_urlsafe), store on user, send email
- `POST /auth/reset-password` — validate token + expiry, update password, clear token

### BoardService + BoardRouter (`/boards`)
- `POST /boards` — create board + 3 default columns + add owner as member
- `GET /boards` — list boards for current user (owned + joined)
- `GET /boards/{id}` — get board with columns, cards, members
- `POST /boards/join` — join board via join code
- `PATCH /boards/{id}` — update deadline_alert_hours (owner only)
- `GET /boards/{id}/members` — list board members
- `GET /boards/{id}/activity` — last 20 activity entries

### CardService + CardRouter (`/cards`)
- `POST /columns/{column_id}/cards` — create card, emit card_created, log activity, send assignment email
- `PATCH /cards/{id}` — update card, emit card_updated, log activity, send assignment email if assignee changed
- `DELETE /cards/{id}` — delete card (returns dict before deletion), emit card_deleted, log activity
- `PATCH /cards/{id}/move` — move card to different column, emit card_moved, log activity

### ActivityService
- `log_activity(board_id, user_id, message, db)` — insert ActivityLog row
- `get_board_activity(board_id, db)` — return last 20 entries (reversed for chronological order)

### EmailService
- `send_reset_email(to, token)` — password reset link
- `send_assignment_email(to, card_title, board_name, assigner_name)`
- `send_deadline_email(to, card_title, board_name, deadline)`
- All use `_send()` helper — prints to console if MAIL_USERNAME is blank (dev mode)

### Socket.io Server
- Mounted at `/socket.io` via `app.mount()`
- `socketio_path=""` in ASGIApp (avoids double path)
- CORS origins: localhost:5173, localhost:3000, syncwork-mu.vercel.app + FRONTEND_URL env var
- Events in: `join_board`, `leave_board`
- Events out: `card_created`, `card_updated`, `card_deleted`, `card_moved`, `activity`, `presence_update`, `deadline_alert`

### Scheduler (APScheduler)
- `AsyncIOScheduler` started in FastAPI lifespan
- `check_deadlines()` runs every 15 minutes
- Queries cards with deadline within board's threshold
- Emits `deadline_alert` to board room
- Sends deadline emails to assigned users

---

## Frontend Components

### Pages
- `LoginPage` — login form, registered/reset success banners, forgot password link
- `RegisterPage` — register form with confirm password + PasswordInput toggle
- `ForgotPasswordPage` — email input → shows "check inbox" state after submit
- `ResetPasswordPage` — reads token from URL query param, new password + confirm
- `BoardListPage` — list boards, create board form, join board form
- `BoardPage` — loads board + activity, connects socket, renders KanbanBoard + ActivityFeedPanel

### Board Components
- `KanbanBoard` — DndContext + PointerSensor, handles drag end (optimistic update + API call), DragOverlay
- `ColumnComponent` — column header with ink color, droppable zone (useDroppable), SortableContext, AddCardForm
- `CardComponent` — useSortable, deadline highlight (isDeadlineNear/isOverdue), click → CardDetailModal
- `CardDetailModal` — edit title/description/assignee/deadline, delete with confirm
- `AddCardForm` — inline toggle form, creates card via API (Socket.io broadcasts to others)

### Layout
- `Navbar` — 🗂️ Syncwork brand, user display name, sign out button
- `PresenceBar` — overlapping Avatar circles for active users

### Activity
- `ActivityFeedPanel` — right sidebar, reversed messages, formatDistanceToNow timestamps

### UI Primitives
- `Modal` — overlay with ESC key handler, click-outside to close
- `Avatar` — initials from display_name, dark ink background
- `PasswordInput` — wraps input, eye/eye-off SVG toggle button

### Zustand Stores
- `authStore` — user, token, login, register (returns message, no token), logout, loadFromStorage
- `boardStore` — board, setBoard, clearBoard, addCard, updateCard, deleteCard, moveCard
- `activityStore` — messages (max 20), addMessage, setMessages, clear
- `presenceStore` — users, setUsers, clear

### Services
- `socket.service.ts` — `connectSocket(boardId, userId, displayName)` / `disconnectSocket(boardId)`
  - Connects to VITE_SOCKET_URL with `path: '/socket.io'`
  - Registers: card_created, card_updated, card_deleted, card_moved, activity, presence_update, deadline_alert
  - Dispatches all events to Zustand stores
- `axios.ts` — baseURL from VITE_API_URL, Bearer token from localStorage, 401 → logout + redirect
