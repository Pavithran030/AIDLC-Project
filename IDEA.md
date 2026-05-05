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

## Architecture

Syncwork is a **frontend-only application** — no custom backend server.
Everything runs through Supabase.

```
Browser (React on Vercel)
        ↕  REST API (data queries)
        ↕  Realtime WebSocket (live updates)
        ↕  Auth (register / login / reset)
Supabase (PostgreSQL + Auth + Realtime)
```

- **Vercel** — serves the React app (static files, no server)
- **Supabase** — handles everything else: database, authentication, real-time, and row-level security

---

## Current Features

### Authentication (Supabase Auth)
- Register with name, email, password
- Login — session managed by Supabase automatically
- Forgot password / reset password via email link (Supabase sends the email)
- Password show/hide toggle on all forms
- No email confirmation required (disabled in Supabase dashboard)

### Boards
- Create a board with a name
- Auto-generated 8-character join code
- Share the code — teammates join instantly
- Private — Row Level Security ensures only members can see board data

### Cards
- Create cards with title, description, assignee, deadline
- Drag and drop between columns (touch + mouse)
- Click to edit or delete
- Cards with approaching deadlines get highlighted amber/red

### Real-Time (Supabase Realtime)
- All card changes sync instantly via Supabase Postgres Changes
- No page refresh needed
- See who else is on the board right now (presence avatars via Supabase Presence)
- Live activity feed showing recent actions

### UI
- Handwritten Notebook theme — warm paper, serif fonts, ink accents
- Fully mobile responsive — columns scroll horizontally with snap
- Modal slides up from bottom on mobile
- Column colors: red (To Do), amber (In Progress), green (Done)
- Red sign out button in navbar

---

## Tech Stack

| Part | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| State | Zustand |
| Styling | Tailwind CSS + CSS variables |
| Real-time | Supabase Realtime (Postgres Changes + Presence) |
| Database client | @supabase/supabase-js |
| Auth | Supabase Auth (built-in) |
| Drag and drop | @dnd-kit/core + @dnd-kit/sortable |
| Notifications | react-hot-toast |
| Date formatting | date-fns |
| Frontend hosting | Vercel |
| Database + Auth + Realtime | Supabase (free tier) |

**Removed (no longer needed):**
- ~~FastAPI backend~~ → Supabase handles all data
- ~~Socket.io~~ → Supabase Realtime
- ~~JWT + bcrypt~~ → Supabase Auth
- ~~APScheduler~~ → (deadline alerts via Supabase Edge Functions — future)
- ~~Axios~~ → Supabase JS client
- ~~Render hosting~~ → frontend-only, Vercel is enough

---

## Project Structure

```
syncwork/
├── frontend/                    → React app (deployed to Vercel)
│   ├── src/
│   │   ├── lib/
│   │   │   └── supabase.ts      → Supabase client (reads env vars)
│   │   ├── api/
│   │   │   ├── auth.api.ts      → forgot/reset password
│   │   │   ├── boards.api.ts    → board CRUD via Supabase
│   │   │   └── cards.api.ts     → card CRUD via Supabase
│   │   ├── stores/              → Zustand state (auth, board, activity, presence)
│   │   ├── services/
│   │   │   └── realtime.service.ts → Supabase Realtime channel
│   │   ├── pages/               → Login, Register, ForgotPassword, ResetPassword,
│   │   │                           BoardList, Board
│   │   ├── components/          → Kanban board, columns, cards, navbar, activity feed
│   │   └── index.css            → Notebook theme CSS variables
│   ├── supabase-setup.sql       → Run once in Supabase SQL Editor
│   ├── .env.example             → VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
│   └── vercel.json              → SPA routing config
│
├── .gitignore
├── README.md                    → Project overview + setup
├── SETUP.md                     → Step-by-step local setup
└── IDEA.md                      → This file
```

---

## Database (6 Tables in Supabase)

```
profiles       → display names linked to Supabase Auth users
boards         → workspaces with join codes
board_members  → who belongs to which board
columns        → To Do / In Progress / Done (3 per board)
cards          → the tasks (with board_id for RLS + Realtime)
activity_logs  → history of actions on a board
```

All tables have **Row Level Security (RLS)** enabled.
A `is_board_member()` helper function (SECURITY DEFINER) prevents RLS recursion.

---

## Live URL

| Service | URL |
|---|---|
| Frontend | https://syncwork-mu.vercel.app |
| Database | Supabase (kbleumachhpetcvhxzvg) |

---

## How to Run Locally

```bash
# 1. Set up Supabase
#    - Create a project at supabase.com
#    - Run frontend/supabase-setup.sql in SQL Editor
#    - Disable email confirmation: Auth → Providers → Email → turn off "Confirm email"

# 2. Configure environment
cd frontend
cp .env.example .env
# Edit .env:
#   VITE_SUPABASE_URL=https://your-project.supabase.co
#   VITE_SUPABASE_ANON_KEY=your-anon-key

# 3. Install and run
npm install
npm run dev
```

Open http://localhost:5173

---

## Deploy to Vercel

1. Push to GitHub
2. Import repo in Vercel, set root directory to `frontend/`
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy — `vercel.json` handles SPA routing automatically

---

## What Could Be Added Next

### Short Term (Easy Wins)
- [ ] Copy join code button on the board page
- [ ] Card labels / color tags
- [ ] Card priority levels (Low, Medium, High, Critical)
- [ ] Search cards by title across the board
- [ ] Board settings page — rename board, change alert threshold

### Medium Term (More Work)
- [ ] Card comments — team discussion on a card
- [ ] Due date calendar view — see all deadlines in a calendar
- [ ] Notifications panel — in-app notification history
- [ ] User profile page — change display name, avatar
- [ ] Board archive — archive completed boards instead of deleting
- [ ] Card attachments — upload files via Supabase Storage

### Long Term (Big Features)
- [ ] Deadline alerts via Supabase Edge Functions (cron job every 15 min)
- [ ] Multiple columns — let users add/rename/delete columns
- [ ] Card checklists — sub-tasks within a card
- [ ] @mentions in activity — notify specific users
- [ ] Board templates — start with a pre-built column structure
- [ ] Export board to CSV or PDF
- [ ] Dark mode — alternative to the notebook theme
- [ ] Mobile app — React Native using the same Supabase backend

### Infrastructure Upgrades
- [ ] Add rate limiting on auth (Supabase has built-in limits, but can add more)
- [ ] Automated tests — Vitest for unit tests, Playwright for E2E
- [ ] CI/CD pipeline — auto-deploy on push to main via Vercel GitHub integration

---

## Known Limitations (Current)

| Limitation | Reason | Fix |
|---|---|---|
| No card ordering within a column | Kept simple intentionally | Add position field + drag-to-reorder |
| Columns are fixed (3 only) | Kept simple intentionally | Add column CRUD |
| No deadline scheduler | No backend to run cron jobs | Add Supabase Edge Function with cron trigger |
| Supabase free tier pauses after 1 week | Free tier limitation | Keep active with pings or upgrade |
| Profiles fetched separately (no FK join) | cards.assigned_user_id has no FK to profiles | Add FK constraint or use Supabase views |

---

## Key Design Decisions

| Decision | What was chosen | Why |
|---|---|---|
| No custom backend | Supabase-only | No server to maintain, no cold starts, free tier |
| Supabase Auth | Not custom JWT | Built-in forgot/reset password, session management |
| Supabase Realtime | Not Socket.io | No backend needed, works directly from frontend |
| RLS with SECURITY DEFINER function | Not open tables | Prevents data leaks without recursion bugs |
| Profiles table separate from auth.users | Supabase pattern | auth.users is not directly accessible from client |
| Fixed 3 columns | No column CRUD | Keeps the app focused and simple |
| Notebook UI theme | Warm paper aesthetic | Distinct identity, not generic SaaS look |
| Separate register/login | No auto-login after register | Standard UX pattern, clearer flow |
| No email confirmation | Disabled in Supabase dashboard | Faster onboarding for small team app |
