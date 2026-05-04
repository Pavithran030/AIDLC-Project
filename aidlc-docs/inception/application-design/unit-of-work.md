# Units of Work — Syncwork (Final As-Built)

## Unit 1: Backend

**Directory**: `backend/`
**Deployed to**: Render (https://aidlc-project.onrender.com)

```
backend/
  app/
    config.py            # pydantic-settings — reads from .env or Render env vars
    database.py          # async engine (NullPool), get_db, check_db_connection
    security.py          # JWT encode/decode, bcrypt hash/verify (no passlib)
    main.py              # FastAPI app, CORS, Socket.io mount, scheduler, global error handler
    models/
      __init__.py        # imports all models so Base.metadata is populated
      user.py            # User (+ reset_token, reset_token_expires)
      board.py           # Board + BoardMember
      column.py
      card.py
      activity.py
    schemas/
      __init__.py
      user.py            # UserRegister, UserLogin, UserOut, TokenOut, MessageOut,
                         # ForgotPasswordRequest, ResetPasswordRequest
      board.py           # BoardCreate, BoardJoin, BoardUpdate, BoardOut
      column.py          # ColumnOut
      card.py            # CardCreate, CardUpdate, CardMove, CardOut
      activity.py        # ActivityOut
    routers/
      __init__.py
      auth.py            # /auth/register, /login, /me, /forgot-password, /reset-password
      boards.py          # /boards CRUD + /members + /activity
      cards.py           # /columns/{id}/cards, /cards/{id} CRUD + /move
    services/
      __init__.py
      auth_service.py    # register_user, login_user, forgot_password, reset_password
      board_service.py   # create_board (+ default columns), get_user_boards,
                         # get_board_detail, join_board, update_board, get_board_members
      card_service.py    # create_card, update_card, delete_card (returns dict), move_card
      activity_service.py # log_activity, get_board_activity
      email_service.py   # send_reset_email, send_assignment_email, send_deadline_email
                         # (prints to console if MAIL_USERNAME is blank)
    realtime/
      __init__.py
      socket_server.py   # AsyncServer, socket_app (socketio_path="")
      handlers.py        # connect, disconnect, join_board, leave_board events
      presence.py        # in-memory dict {board_id: [{user_id, display_name, sid}]}
    scheduler/
      __init__.py
      jobs.py            # check_deadlines() — runs every 15 min via APScheduler
  database/
    schema.sql           # Plain SQL — run once in Supabase SQL Editor to create all tables
  requirements.txt
  Procfile               # web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
  render.yaml            # Render service config
  .python-version        # 3.11.9
  .env.example
```

### Key Implementation Notes
- **NullPool**: SQLAlchemy uses NullPool (no connection pooling) because Supabase pooler (PgBouncer) is the pool. Avoids DuplicatePreparedStatementError.
- **statement_cache_size=0**: asyncpg prepared statement cache disabled — required for PgBouncer transaction mode.
- **No Alembic**: Database schema managed via `database/schema.sql`. Run once in Supabase SQL Editor.
- **No Docker**: Removed. Local dev runs directly with Python venv + local PostgreSQL or Supabase.
- **SSL**: `CERT_NONE` SSL context — encrypted but skips cert chain verification (needed on some hosts).

---

## Unit 2: Frontend

**Directory**: `frontend/`
**Deployed to**: Vercel (https://syncwork-mu.vercel.app)

```
frontend/
  src/
    main.tsx
    App.tsx              # Routes, RequireAuth, GuestOnly guards, Toaster
    index.css            # Handwritten Notebook theme — CSS variables, paper texture,
                         # ruled-line cards, column accents, btn-ink, notebook-input
    vite-env.d.ts        # TypeScript types for import.meta.env (VITE_API_URL, VITE_SOCKET_URL)
    api/
      axios.ts           # Axios instance — baseURL from env, Bearer token interceptor,
                         # 401 → clear token → redirect to /login
      auth.api.ts        # register, login, me, forgotPassword, resetPassword
      boards.api.ts      # list, create, join, get, update, getMembers, getActivity
      cards.api.ts       # create, update, delete, move
    stores/
      authStore.ts       # user, token, login, register (no auto-login), logout, loadFromStorage
      boardStore.ts      # board, setBoard, addCard, updateCard, deleteCard, moveCard
      activityStore.ts   # messages[], addMessage, setMessages (max 20)
      presenceStore.ts   # users[], setUsers, clear
    services/
      socket.service.ts  # connectSocket, disconnectSocket — singleton socket,
                         # registers all event listeners → dispatches to Zustand stores
    pages/
      LoginPage.tsx      # Login form, registered/reset banners, forgot password link
      RegisterPage.tsx   # Register form with confirm password validation
      ForgotPasswordPage.tsx  # Email input → sends reset link
      ResetPasswordPage.tsx   # Token from URL → new password form
      BoardListPage.tsx  # List boards, create board, join board
      BoardPage.tsx      # Full Kanban view — loads board, connects socket
    components/
      board/
        KanbanBoard.tsx       # DndContext, drag-and-drop, DragOverlay
        ColumnComponent.tsx   # Column header, droppable card list, AddCardForm
        CardComponent.tsx     # Draggable card, deadline highlight, click → modal
        CardDetailModal.tsx   # View/edit/delete card
        AddCardForm.tsx       # Inline add card form
      layout/
        Navbar.tsx            # App name (🗂️ Syncwork), user name, logout
        PresenceBar.tsx       # Active user avatars
      activity/
        ActivityFeedPanel.tsx # Last 20 activity messages, right sidebar
      ui/
        Modal.tsx             # Reusable modal with ESC key support
        Avatar.tsx            # Initials avatar
        PasswordInput.tsx     # Password field with show/hide eye toggle
    types/
      index.ts           # User, Board, Column, Card, BoardDetail, ActivityEntry, PresenceUser
  index.html             # Loads Lora font from Google Fonts, title: Syncwork
  vite.config.ts
  tailwind.config.ts     # Custom colors: paper, ink, todo, progress, done
  tsconfig.json
  package.json           # name: syncwork-frontend
  vercel.json            # SPA routing rewrite
  .env.example
```

### Key Implementation Notes
- **No auto-login after register**: Register → success message → redirect to `/login?registered=true`
- **GuestOnly guard**: Logged-in users redirected away from /login, /register, /forgot-password
- **Socket path**: `path: '/socket.io'` in socket.io-client config — matches FastAPI mount
- **vite-env.d.ts**: Required for TypeScript to recognize `import.meta.env.VITE_*` variables
- **Notebook theme**: All styling via CSS custom properties in `index.css` + Tailwind config
