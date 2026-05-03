<div align="center">

# 🗂️ Syncwork

### Real-Time Collaborative Task Management

**Syncwork** is a full-stack, real-time collaborative task board built for small teams.  
Organize work, assign tasks, track deadlines, and see every update the moment it happens — no refresh needed.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.x-010101?style=flat-square&logo=socket.io&logoColor=white)](https://socket.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)

</div>

---

## Overview

Syncwork is a Kanban-style task board where teams collaborate in real time. Every card creation, move, or deletion is instantly broadcast to all connected users via WebSockets. The interface follows a **Handwritten Notebook** design theme — warm paper backgrounds, serif typography, and ink-colored column accents — giving it a distinct, focused feel.

Built as a production-ready application with a clean separation between frontend and backend, async database access, background job scheduling, and optional email notifications.

---

## Features

| Feature | Description |
|---|---|
| **Authentication** | Register, login, forgot/reset password with JWT |
| **Boards** | Create boards, invite teammates via unique join code |
| **Task Cards** | Create, edit, delete, assign, and set deadlines on cards |
| **Drag & Drop** | Move cards between columns with smooth drag-and-drop |
| **Real-Time Sync** | All changes broadcast instantly via Socket.io — no refresh needed |
| **Live Activity Feed** | Running log of team actions on the right sidebar |
| **User Presence** | See who is currently viewing the same board |
| **Deadline Alerts** | Background scheduler detects approaching deadlines and alerts the board |
| **Email Notifications** | Optional email on card assignment and deadline reminders |
| **Notebook UI** | Warm paper theme, Lora serif font, ruled-line cards, ink accents |

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| [FastAPI](https://fastapi.tiangolo.com) | Async REST API framework |
| [SQLAlchemy 2.x](https://docs.sqlalchemy.org) | Async ORM |
| [PostgreSQL](https://www.postgresql.org) | Primary database |
| [Alembic](https://alembic.sqlalchemy.org) | Database migrations |
| [python-socketio](https://python-socketio.readthedocs.io) | WebSocket server (Socket.io) |
| [bcrypt](https://pypi.org/project/bcrypt/) | Password hashing |
| [python-jose](https://python-jose.readthedocs.io) | JWT encoding/decoding |
| [APScheduler](https://apscheduler.readthedocs.io) | Background deadline checker |
| [fastapi-mail](https://sabuhish.github.io/fastapi-mail/) | Email notifications |
| [pydantic-settings](https://docs.pydantic.dev/latest/concepts/pydantic_settings/) | Environment configuration |

### Frontend
| Technology | Purpose |
|---|---|
| [React 18](https://react.dev) + [Vite](https://vitejs.dev) | UI framework + build tool |
| [TypeScript](https://www.typescriptlang.org) | Type safety |
| [Zustand](https://zustand-demo.pmnd.rs) | Global state management |
| [Axios](https://axios-http.com) | HTTP client |
| [socket.io-client](https://socket.io/docs/v4/client-api/) | WebSocket client |
| [@dnd-kit](https://dndkit.com) | Drag-and-drop |
| [Tailwind CSS](https://tailwindcss.com) | Utility-first styling |
| [React Router v6](https://reactrouter.com) | Client-side routing |
| [react-hot-toast](https://react-hot-toast.com) | Toast notifications |
| [date-fns](https://date-fns.org) | Date formatting |

---

## Project Structure

```
syncwork/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry point + Socket.io mount
│   │   ├── config.py            # Environment settings (pydantic-settings)
│   │   ├── database.py          # Async SQLAlchemy engine + session
│   │   ├── security.py          # JWT + bcrypt helpers
│   │   ├── models/              # SQLAlchemy ORM models
│   │   │   ├── user.py
│   │   │   ├── board.py         # Board + BoardMember
│   │   │   ├── column.py
│   │   │   ├── card.py
│   │   │   └── activity.py
│   │   ├── schemas/             # Pydantic request/response schemas
│   │   ├── routers/             # API route handlers
│   │   │   ├── auth.py          # Register, login, forgot/reset password
│   │   │   ├── boards.py        # Board CRUD + members + activity
│   │   │   └── cards.py         # Card CRUD + move
│   │   ├── services/            # Business logic layer
│   │   ├── realtime/            # Socket.io server + event handlers + presence
│   │   └── scheduler/           # APScheduler deadline checker job
│   ├── alembic/                 # Database migrations
│   │   └── versions/
│   ├── requirements.txt
│   ├── .env.example
│   └── alembic.ini
│
├── frontend/
│   ├── src/
│   │   ├── api/                 # Axios API functions per resource
│   │   ├── stores/              # Zustand stores (auth, board, activity, presence)
│   │   ├── services/            # Socket.io client singleton
│   │   ├── pages/               # Route-level page components
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── ForgotPasswordPage.tsx
│   │   │   ├── ResetPasswordPage.tsx
│   │   │   ├── BoardListPage.tsx
│   │   │   └── BoardPage.tsx
│   │   ├── components/
│   │   │   ├── board/           # KanbanBoard, Column, Card, CardModal, AddCardForm
│   │   │   ├── layout/          # Navbar, PresenceBar
│   │   │   ├── activity/        # ActivityFeedPanel
│   │   │   └── ui/              # Button, Input, Modal, Avatar, PasswordInput
│   │   └── types/               # Shared TypeScript interfaces
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── vercel.json
│   └── .env.example
│
├── .gitignore
├── SETUP.md
└── README.md
```

---

## Getting Started

### Prerequisites

- **Python** 3.11+
- **Node.js** 18+
- **PostgreSQL** 14+

### 1. Clone the repository

```bash
git clone https://github.com/your-username/syncwork.git
cd syncwork
```

### 2. Create the database

```bash
psql -U postgres -c "CREATE DATABASE syncwork;"
```

### 3. Backend setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Open .env and set DATABASE_URL with your PostgreSQL password
```

```bash
# Start the backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

> Tables are created automatically on first startup via SQLAlchemy.  
> For production, use Alembic: `alembic upgrade head`

### 4. Frontend setup

Open a new terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### 5. Open the app

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |

---

## Environment Variables

### Backend — `backend/.env`

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | ✅ | — | PostgreSQL async URL (`postgresql+asyncpg://...`) |
| `SECRET_KEY` | ✅ | — | JWT signing secret — use a long random string |
| `ALGORITHM` | | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | | `10080` | Token lifetime (7 days) |
| `FRONTEND_URL` | | `http://localhost:5173` | Allowed CORS origin |
| `MAIL_USERNAME` | | `""` | SMTP username — leave blank to disable email |
| `MAIL_PASSWORD` | | `""` | SMTP password |
| `MAIL_FROM` | | `""` | Sender email address |
| `MAIL_SERVER` | | `smtp.gmail.com` | SMTP server |
| `MAIL_PORT` | | `587` | SMTP port |

> **Tip:** Generate a secure `SECRET_KEY` with:
> ```bash
> python -c "import secrets; print(secrets.token_hex(32))"
> ```

### Frontend — `frontend/.env`

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend base URL (e.g. `http://localhost:8000`) |
| `VITE_SOCKET_URL` | Socket.io server URL (same as API URL) |

---

## API Reference

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Create a new account |
| `POST` | `/auth/login` | Login and receive JWT token |
| `GET` | `/auth/me` | Get current authenticated user |
| `POST` | `/auth/forgot-password` | Request a password reset link |
| `POST` | `/auth/reset-password` | Set a new password using reset token |

### Boards

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/boards` | Create a new board |
| `GET` | `/boards` | List all boards for current user |
| `GET` | `/boards/{id}` | Get board with columns, cards, and members |
| `POST` | `/boards/join` | Join a board using its join code |
| `PATCH` | `/boards/{id}` | Update board settings (owner only) |
| `GET` | `/boards/{id}/members` | List board members |
| `GET` | `/boards/{id}/activity` | Get last 20 activity log entries |

### Cards

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/columns/{id}/cards` | Create a card in a column |
| `PATCH` | `/cards/{id}` | Update card fields |
| `DELETE` | `/cards/{id}` | Delete a card |
| `PATCH` | `/cards/{id}/move` | Move card to a different column |

---

## WebSocket Events

All real-time communication uses Socket.io rooms keyed by `board_id`.

### Client → Server

| Event | Payload | Description |
|---|---|---|
| `join_board` | `{ board_id, user_id, display_name }` | Join a board room |
| `leave_board` | `{ board_id }` | Leave a board room |

### Server → Client

| Event | Payload | Description |
|---|---|---|
| `card_created` | `{ card }` | A new card was created |
| `card_updated` | `{ card }` | A card was edited |
| `card_deleted` | `{ card_id, column_id }` | A card was deleted |
| `card_moved` | `{ card, old_column_id, new_column_id }` | A card was moved between columns |
| `activity` | `{ id, message, user_id, display_name, created_at }` | New activity log entry |
| `presence_update` | `{ users: [{ user_id, display_name }] }` | Active users on the board changed |
| `deadline_alert` | `{ cards: [{ card_id, card_title, deadline }] }` | Cards approaching their deadline |

---

## Database Schema

```
users
  id · email · hashed_password · display_name · created_at
  reset_token · reset_token_expires

boards
  id · name · join_code · owner_id → users · deadline_alert_hours · created_at

board_members
  board_id → boards · user_id → users · joined_at

columns
  id · board_id → boards · name · position · created_at

cards
  id · column_id → columns · title · description
  assigned_user_id → users · deadline · created_at · updated_at

activity_logs
  id · board_id → boards · user_id → users · message · created_at
```

---

## Deployment

### Backend → [Railway](https://railway.app) or [Render](https://render.com)

1. Push the repository to GitHub
2. Create a new web service pointing to the `backend/` directory
3. Set start command:
   ```
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
4. Add a PostgreSQL plugin and set `DATABASE_URL`
5. Add all other environment variables from `.env.example`

### Frontend → [Vercel](https://vercel.com)

1. Import the repository into Vercel
2. Set root directory to `frontend/`
3. Set environment variables:
   - `VITE_API_URL` → your backend URL
   - `VITE_SOCKET_URL` → same backend URL
4. Deploy — `vercel.json` handles SPA routing automatically

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
  Built with FastAPI · React · PostgreSQL · Socket.io
</div>
