# Units of Work

## Unit 1: Backend

**Directory**: `backend/`

```
backend/
  app/
    config.py            # pydantic-settings env vars
    database.py          # async engine + get_db session dependency
    security.py          # JWT helpers + bcrypt helpers
    main.py              # FastAPI app, CORS, Socket.io ASGI mount, scheduler start
    models/
      user.py
      board.py
      column.py
      card.py
      activity.py
    schemas/
      user.py
      board.py
      column.py
      card.py
      activity.py
    routers/
      auth.py
      boards.py
      cards.py
      activity.py
    services/
      auth_service.py
      board_service.py
      card_service.py
      activity_service.py
      email_service.py
    realtime/
      socket_server.py   # AsyncServer instance
      handlers.py        # connect/disconnect/join_board/leave_board
      presence.py        # simple dict {board_id: [user_info]}
    scheduler/
      jobs.py            # check_deadlines() job, registered on app startup
  alembic/
  requirements.txt
  Dockerfile
  .env.example
```

---

## Unit 2: Frontend

**Directory**: `frontend/`

```
frontend/
  src/
    main.tsx
    App.tsx
    index.css              # Handwritten Notebook theme variables + global styles
    api/
      axios.ts
      auth.api.ts
      boards.api.ts
      cards.api.ts
      activity.api.ts
    stores/
      authStore.ts
      boardStore.ts
      activityStore.ts
      presenceStore.ts
    services/
      socket.service.ts
    pages/
      LoginPage.tsx
      RegisterPage.tsx
      BoardListPage.tsx
      BoardPage.tsx
    components/
      board/
        KanbanBoard.tsx
        ColumnComponent.tsx
        CardComponent.tsx
        CardDetailModal.tsx
        AddCardForm.tsx
      layout/
        Navbar.tsx
        PresenceBar.tsx
      activity/
        ActivityFeedPanel.tsx
      ui/
        Button.tsx
        Input.tsx
        Modal.tsx
        Avatar.tsx
    types/
      index.ts
  index.html
  vite.config.ts
  tailwind.config.ts
  tsconfig.json
  package.json
  .env.example
  vercel.json
```
