# Application Components

## Backend

### AuthService + AuthRouter (`/auth`)
- `POST /auth/register` — hash password, create user
- `POST /auth/login` — verify password, return JWT
- `GET /auth/me` — return current user from JWT

### BoardService + BoardRouter (`/boards`)
- `POST /boards` — create board + 3 default columns + add owner as member
- `GET /boards` — list boards for current user
- `GET /boards/{id}` — get board with columns and cards
- `POST /boards/join` — join board via join code
- `PATCH /boards/{id}` — update deadline_alert_hours (owner only)

### CardService + CardRouter (`/cards`)
- `POST /columns/{column_id}/cards` — create card
- `PATCH /cards/{id}` — update card fields
- `DELETE /cards/{id}` — delete card
- `PATCH /cards/{id}/move` — move card to different column

### ActivityRouter (`/boards/{id}/activity`)
- `GET /boards/{id}/activity` — return last 20 activity entries

### Socket.io Server
- Events in: `join_board`, `leave_board`
- Events out: `card_created`, `card_updated`, `card_deleted`, `card_moved`, `activity`, `presence_update`, `deadline_alert`
- In-memory presence dict: `{board_id: [{user_id, display_name}]}`

### Scheduler (APScheduler)
- Runs every 15 min: query cards with deadline within board's threshold
- Emits `deadline_alert` to board room
- Sends email via fastapi-mail BackgroundTask

### EmailService
- `send_assignment_email(to, card_title, board_name)`
- `send_deadline_email(to, card_title, deadline)`
- Simple SMTP via fastapi-mail, called as FastAPI BackgroundTask

---

## Frontend

### Pages
- `LoginPage` — login form → authStore.login → redirect
- `RegisterPage` — register form → authStore.register → redirect
- `BoardListPage` — list boards, create board form, join board form
- `BoardPage` — full Kanban view, connects socket on mount

### Board Components
- `KanbanBoard` — DndContext wrapper, renders 3 ColumnComponents
- `ColumnComponent` — column header + SortableContext card list + AddCardForm
- `CardComponent` — draggable card, deadline tint if approaching
- `CardDetailModal` — view/edit/delete a card
- `AddCardForm` — inline title input, submit creates card

### Layout
- `Navbar` — app title, user display name, logout button
- `PresenceBar` — row of Avatar components for active users

### Sidebar
- `ActivityFeedPanel` — list of last 20 activity messages from activityStore

### Zustand Stores
- `authStore` — `{ user, token, login, register, logout }`
- `boardStore` — `{ board, columns, cards, setBoard, addCard, updateCard, deleteCard, moveCard }`
- `activityStore` — `{ messages[], addMessage }` (max 20, in-memory)
- `presenceStore` — `{ users[], setUsers }`

### Services
- `socket.service.ts` — singleton socket, `connect(boardId)`, `disconnect()`, registers all event listeners → dispatches to stores
- `axios.ts` — Axios instance, baseURL from env, Authorization header interceptor from authStore token
