# Syncwork — Project Idea & Vision

## What Is It

Syncwork is a real-time collaborative task management board for small teams.
It lets multiple people work on the same board at the same time and see every
change instantly — no refresh, no waiting, no confusion about who did what.

---

## The Core Problem It Solves

Small teams waste time asking "did you finish that?" or "who's working on this?"
Syncwork answers those questions automatically by keeping everyone's view of the
board identical and up to date at all times.

---

## How It Works (Simple)

1. One person creates a board and gets a join code
2. They share the code with their team
3. Everyone joins and sees the same board
4. Cards move through three stages: **To Do → In Progress → Done**
5. Every action (create, move, delete) appears on everyone's screen instantly
6. A live feed on the side shows what happened and who did it

---

## Current Features

### Authentication
- Register with name, email, password
- Login with JWT token (stored in browser)
- Forgot password / reset password via email link
- Password show/hide toggle on all forms

### Boards
- Create a board with a name
- Auto-generated 8-character join code
- Share the code — teammates join instantly
- Private — only members can see and edit

### Cards
- Create cards with title, description, assignee, deadline
- Drag and drop between columns
- Click to edit or delete
- Cards with approaching deadlines get highlighted

### Real-Time
- All changes sync instantly via WebSocket (Socket.io)
- No page refresh needed
- See who else is on the board right now (presence avatars)
- Live activity feed showing recent actions

### Alerts
- Background job checks deadlines every 15 minutes
- Sends a real-time alert to the board when a deadline is close
- Optional email notification to the assigned person

### UI
- Handwritten Notebook theme — warm paper, serif fonts, ink accents
- Fully mobile responsive
- Column colors: red (To Do), amber (In Progress), green (Done)

---

## Tech Stack

| Part | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| State | Zustand |
| Styling | Tailwind CSS + CSS variables |
| Real-time client | socket.io-client |
| HTTP client | Axios |
| Drag and drop | @dnd-kit |
| Backend | FastAPI (Python) |
| Database | PostgreSQL (Supabase) |
| Real-time server | python-socketio |
| Auth | JWT + bcrypt |
| Background jobs | APScheduler |
| Email | fastapi-mail |
| Frontend hosting | Vercel |
| Backend hosting | Render |
| Database hosting | Supabase (free tier) |

---

## Project Structure (Simple)

```
syncwork/
├── frontend/     → React app (deployed to Vercel)
├── backend/      → FastAPI app (deployed to Render)
│   └── database/
│       └── schema.sql   → Run once in Supabase to create tables
├── README.md     → Setup and API reference
├── SETUP.md      → Step-by-step local setup guide
└── IDEA.md       → This file
```

---

## Database (6 Tables)

```
users          → accounts
boards         → workspaces
board_members  → who belongs to which board
columns        → To Do / In Progress / Done
cards          → the tasks
activity_logs  → history of actions
```

---

## Live URLs

| Service | URL |
|---|---|
| Frontend | https://syncwork-mu.vercel.app |
| Backend API | https://aidlc-project.onrender.com |
| API Docs | https://aidlc-project.onrender.com/docs |

---

## What Could Be Added Next

### Short Term (Easy Wins)
- [ ] Card labels / color tags
- [ ] Card priority levels (Low, Medium, High, Critical)
- [ ] Card comments — team discussion on a card
- [ ] Search cards by title across the board
- [ ] Board settings page — rename board, change alert threshold
- [ ] Copy join code button on the board page

### Medium Term (More Work)
- [ ] Multiple boards per workspace with a sidebar
- [ ] Card attachments — upload files to a card
- [ ] Due date calendar view — see all deadlines in a calendar
- [ ] Notifications panel — in-app notification history
- [ ] User profile page — change display name, avatar
- [ ] Board archive — archive completed boards instead of deleting

### Long Term (Big Features)
- [ ] Multiple columns — let users add/rename/delete columns
- [ ] Card checklists — sub-tasks within a card
- [ ] @mentions in activity — notify specific users
- [ ] Board templates — start with a pre-built column structure
- [ ] Export board to CSV or PDF
- [ ] Dark mode — alternative to the notebook theme
- [ ] Mobile app — React Native version using the same backend API
- [ ] Team workspaces — multi-tenant with organization accounts
- [ ] Integrations — Slack notifications, GitHub issue sync

### Infrastructure Upgrades
- [ ] Upgrade Render to paid plan — eliminates cold starts entirely
- [ ] Add Redis for Socket.io adapter — supports multiple backend instances
- [ ] Add rate limiting on auth endpoints — prevent brute force
- [ ] Add refresh token flow — longer sessions without security risk
- [ ] Automated tests — unit tests for services, E2E tests for critical flows
- [ ] CI/CD pipeline — auto-deploy on push to main

---

## Known Limitations (Current)

| Limitation | Reason | Fix |
|---|---|---|
| First request is slow (cold start) | Render free tier sleeps after inactivity | Keep-alive ping added, or upgrade to paid |
| No card ordering within a column | Kept simple intentionally | Add position field + drag-to-reorder |
| Columns are fixed (3 only) | Kept simple intentionally | Add column CRUD |
| Email requires Gmail App Password setup | SMTP config needed | Add SendGrid or Resend for easier setup |
| Supabase pauses after 1 week inactivity | Free tier limitation | Upgrade or keep active with pings |

---

## How to Run Locally

```bash
# 1. Database — run schema.sql in Supabase SQL Editor

# 2. Backend
cd backend
python -m venv venv && venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env   # fill in DATABASE_URL and SECRET_KEY
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 3. Frontend (new terminal)
cd frontend
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:8000
npm run dev
```

Open http://localhost:5173

---

## Key Design Decisions

| Decision | What was chosen | Why |
|---|---|---|
| No Docker | Plain Python venv | Simpler setup, no extra tooling |
| No Alembic | Plain SQL schema file | One file, run once, easy to understand |
| NullPool | No SQLAlchemy connection pool | Supabase uses PgBouncer — double pooling causes errors |
| localStorage JWT | Not httpOnly cookies | Simpler for small team, no CORS cookie complexity |
| Fixed 3 columns | No column CRUD | Keeps the app focused and simple |
| Notebook UI theme | Warm paper aesthetic | Distinct identity, not generic SaaS look |
| Separate register/login | No auto-login after register | Standard UX pattern, clearer flow |
