# Project Setup Guide — Syncwork

This guide walks you through setting up the entire project from scratch on a fresh machine.

---

## What You Need

| Tool | Version | Download |
|---|---|---|
| Python | 3.11+ | https://www.python.org/downloads/ |
| Node.js | 18+ | https://nodejs.org/ |
| PostgreSQL | 14+ | https://www.postgresql.org/download/ |
| Git | any | https://git-scm.com/ |

> **Windows users:** After installing PostgreSQL, make sure `psql` is added to your PATH.
> You can verify by running `psql --version` in your terminal.

---

## Step 1 — Clone the Repository

```bash
git clone <your-repo-url>
cd <repo-folder>
```

---

## Step 2 — PostgreSQL Database

### Start PostgreSQL

**Windows:** PostgreSQL runs as a Windows service automatically after install.
Open **pgAdmin** or use the terminal:

```bash
psql -U postgres
```

**macOS (Homebrew):**
```bash
brew services start postgresql@16
psql -U postgres
```

**Linux:**
```bash
sudo service postgresql start
psql -U postgres
```

### Create the database

Inside the `psql` prompt:

```sql
CREATE DATABASE syncwork;
\q
```

---

## Step 3 — Backend Setup

### 3.1 Navigate to the backend folder

```bash
cd backend
```

### 3.2 Create a Python virtual environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**macOS / Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

You should see `(venv)` at the start of your terminal prompt.

### 3.3 Install Python dependencies

```bash
pip install -r requirements.txt
```

This installs FastAPI, SQLAlchemy, python-socketio, APScheduler, fastapi-mail, and all other backend packages.

### 3.4 Configure environment variables

```bash
cp .env.example .env
```

Open `backend/.env` in your editor and fill in the values:

```env
# Required
DATABASE_URL=postgresql+asyncpg://postgres:YOUR_PASSWORD@localhost:5432/syncwork
SECRET_KEY=replace-this-with-a-long-random-string

# Keep these as-is for local dev
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
FRONTEND_URL=http://localhost:5173

# Email — leave blank to disable (app works fine without it)
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM=
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_STARTTLS=True
MAIL_SSL_TLS=False
```

> **Tip:** Replace `YOUR_PASSWORD` with the password you set for the `postgres` user during PostgreSQL installation.
> To generate a strong `SECRET_KEY`, run: `python -c "import secrets; print(secrets.token_hex(32))"`

### 3.5 Start the backend server

```bash
uvicorn app.main:combined_app --host 0.0.0.0 --port 8000 --reload
```

**Expected output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Application startup complete.
```

> Database tables are created automatically on first startup — no migration step needed for local development.

**Verify it works:** Open http://localhost:8000/docs in your browser. You should see the FastAPI Swagger UI.

---

## Step 4 — Frontend Setup

Open a **new terminal window** (keep the backend running).

### 4.1 Navigate to the frontend folder

```bash
cd frontend
```

### 4.2 Install Node.js dependencies

```bash
npm install
```

### 4.3 Configure environment variables

```bash
cp .env.example .env
```

Open `frontend/.env` — it should look like this (no changes needed for local dev):

```env
VITE_API_URL=http://localhost:8000
VITE_SOCKET_URL=http://localhost:8000
```

### 4.4 Start the frontend dev server

```bash
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Open the app:** http://localhost:5173

---

## Step 5 — Verify Everything Works

1. Open http://localhost:5173
2. Click **Register** and create an account
3. Create a new board
4. Add cards to columns
5. Open the same board in a second browser tab — changes should sync in real time

---

## Optional — Email Notifications

To enable email notifications (card assignment + deadline reminders):

1. Use a Gmail account with an **App Password** (not your regular password)
   - Go to Google Account → Security → 2-Step Verification → App Passwords
   - Generate a password for "Mail"

2. Update `backend/.env`:
```env
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-16-char-app-password
MAIL_FROM=your-email@gmail.com
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_STARTTLS=True
MAIL_SSL_TLS=False
```

3. Restart the backend server.

---

## Database Tables — Two Options

### Option A: Auto-create on startup (recommended for local dev)

Tables are created automatically when you start the backend with `uvicorn`.
No extra steps needed. SQLAlchemy reads all models and creates any missing tables.

### Option B: Alembic migrations (recommended for production)

An initial migration file is already included at `backend/alembic/versions/0001_initial_schema.py`.
Just run:

```bash
cd backend

# Make sure venv is active and .env is configured
alembic upgrade head
```

This creates all 6 tables: `users`, `boards`, `board_members`, `columns`, `cards`, `activity_logs`.

**For future schema changes:**
```bash
# After editing a model file, generate a new migration
alembic revision --autogenerate -m "describe your change"

# Apply it
alembic upgrade head
```

**To roll back the last migration:**
```bash
alembic downgrade -1
```

**To check current migration status:**
```bash
alembic current
alembic history
```

---

## Folder Structure Reference

```
project-root/
├── backend/
│   ├── app/
│   │   ├── config.py          # Environment settings
│   │   ├── database.py        # Database connection
│   │   ├── security.py        # JWT + password hashing
│   │   ├── main.py            # App entry point
│   │   ├── models/            # Database models
│   │   ├── schemas/           # Request/response schemas
│   │   ├── routers/           # API endpoints
│   │   ├── services/          # Business logic
│   │   ├── realtime/          # WebSocket (Socket.io)
│   │   └── scheduler/         # Background jobs
│   ├── alembic/               # Database migrations
│   ├── requirements.txt       # Python packages
│   └── .env.example           # Environment template
│
├── frontend/
│   ├── src/
│   │   ├── api/               # HTTP API calls
│   │   ├── stores/            # Zustand state
│   │   ├── services/          # Socket.io client
│   │   ├── pages/             # Page components
│   │   ├── components/        # UI components
│   │   └── types/             # TypeScript types
│   ├── package.json
│   └── .env.example           # Environment template
│
├── README.md                  # Project overview
└── SETUP.md                   # This file
```

---

## Common Issues

### `psycopg2` or `asyncpg` connection error
- Make sure PostgreSQL is running
- Double-check `DATABASE_URL` in `backend/.env` — password and database name must match exactly

### `ModuleNotFoundError` on backend start
- Make sure your virtual environment is activated — you should see `(venv)` in your prompt
- Re-run `pip install -r requirements.txt`

### Frontend shows blank page or network errors
- Make sure the backend is running on port 8000
- Check `frontend/.env` has `VITE_API_URL=http://localhost:8000`
- Check browser console for CORS errors — make sure `FRONTEND_URL=http://localhost:5173` is set in `backend/.env`

### Port already in use
```bash
# Kill process on port 8000 (Windows)
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Kill process on port 8000 (macOS/Linux)
lsof -ti:8000 | xargs kill
```

### Socket.io not connecting
- Both `VITE_SOCKET_URL` (frontend) and the running backend must be on the same URL
- Check browser DevTools → Network → WS tab for connection errors

---

## Quick Start Summary

```bash
# 1. Database
psql -U postgres -c "CREATE DATABASE syncwork;"

# 2. Backend
cd backend
python -m venv venv && venv\Scripts\activate   # Windows
# or: python3 -m venv venv && source venv/bin/activate  (macOS/Linux)
pip install -r requirements.txt
cp .env.example .env   # then edit .env
uvicorn app.main:combined_app --host 0.0.0.0 --port 8000 --reload

# 3. Frontend (new terminal)
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open **http://localhost:5173** and you're good to go.
