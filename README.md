<div align="center">

# 🗂️ Syncwork

### Real-Time Collaborative Task Management

**Syncwork** is a real-time collaborative task board built for small teams.  
Organize work, assign tasks, track deadlines, and see every update the moment it happens — no refresh needed.

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-2.x-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)

**Live:** [syncwork-mu.vercel.app](https://syncwork-mu.vercel.app)

</div>

---

## Overview

Syncwork is a Kanban-style task board where teams collaborate in real time. Every card creation, move, or deletion is instantly reflected for all connected users via Supabase Realtime. The interface follows a **Handwritten Notebook** design theme — warm paper backgrounds, serif typography, and ink-colored column accents.

This is a **frontend-only application** — no custom backend server. Everything runs through Supabase: authentication, database, real-time, and row-level security.

```
Browser (React on Vercel)
        ↕  REST queries (data)
        ↕  Realtime WebSocket (live updates + presence)
        ↕  Auth (register / login / reset password)
Supabase (PostgreSQL + Auth + Realtime + RLS)
```

---

## Features

| Feature | Description |
|---|---|
| **Authentication** | Register, login, forgot/reset password via Supabase Auth |
| **Boards** | Create boards, invite teammates via unique 8-char join code |
| **Task Cards** | Create, edit, delete, assign, and set deadlines on cards |
| **Drag & Drop** | Move cards between columns — mouse and touch supported |
| **Real-Time Sync** | All changes broadcast instantly via Supabase Realtime |
| **Live Activity Feed** | Running log of team actions on the right sidebar |
| **User Presence** | See who is currently viewing the same board |
| **Deadline Highlight** | Cards approaching their deadline are highlighted amber/red |
| **Notebook UI** | Warm paper theme, Lora serif font, ruled-line cards, fully mobile responsive |

---

## Tech Stack

| Technology | Purpose |
|---|---|
| [React 18](https://react.dev) + [Vite](https://vitejs.dev) | UI framework + build tool |
| [TypeScript](https://www.typescriptlang.org) | Type safety |
| [Supabase JS](https://supabase.com/docs/reference/javascript) | Database, Auth, Realtime — all in one client |
| [Zustand](https://zustand-demo.pmnd.rs) | Global state management |
| [@dnd-kit](https://dndkit.com) | Drag-and-drop (mouse + touch) |
| [Tailwind CSS](https://tailwindcss.com) | Utility-first styling + responsive breakpoints |
| [React Router v6](https://reactrouter.com) | Client-side routing |
| [react-hot-toast](https://react-hot-toast.com) | Toast notifications |
| [date-fns](https://date-fns.org) | Date formatting |
| [Vercel](https://vercel.com) | Frontend hosting |
| [Supabase](https://supabase.com) | Database + Auth + Realtime (free tier) |

---

## Project Structure

```
syncwork/
├── frontend/
│   ├── src/
│   │   ├── lib/
│   │   │   └── supabase.ts          # Supabase client (reads VITE_ env vars)
│   │   ├── api/
│   │   │   ├── auth.api.ts          # Forgot/reset password
│   │   │   ├── boards.api.ts        # Board CRUD via Supabase
│   │   │   └── cards.api.ts         # Card CRUD via Supabase
│   │   ├── stores/
│   │   │   ├── authStore.ts         # Supabase Auth session + user profile
│   │   │   ├── boardStore.ts        # Current board, columns, cards
│   │   │   ├── activityStore.ts     # Last 20 activity messages
│   │   │   └── presenceStore.ts     # Active users on the board
│   │   ├── services/
│   │   │   └── realtime.service.ts  # Supabase Realtime channel (Postgres Changes + Presence)
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── ForgotPasswordPage.tsx
│   │   │   ├── ResetPasswordPage.tsx
│   │   │   ├── BoardListPage.tsx
│   │   │   └── BoardPage.tsx
│   │   ├── components/
│   │   │   ├── board/               # KanbanBoard, Column, Card, CardModal, AddCardForm
│   │   │   ├── layout/              # Navbar, PresenceBar
│   │   │   ├── activity/            # ActivityFeedPanel
│   │   │   └── ui/                  # Modal, Avatar, PasswordInput
│   │   ├── types/                   # Shared TypeScript interfaces
│   │   └── index.css                # Notebook theme CSS variables + global styles
│   ├── supabase-setup.sql           # Run once in Supabase SQL Editor
│   ├── .env.example
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── vercel.json                  # SPA routing rewrite
│
├── .gitignore
├── IDEA.md                          # Project vision + roadmap
├── SETUP.md                         # Step-by-step local setup
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+
- A free [Supabase](https://supabase.com) account

### 1. Clone the repository

```bash
git clone https://github.com/your-username/syncwork.git
cd syncwork
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → **New query**
3. Paste the contents of `frontend/supabase-setup.sql` and click **Run without RLS**
4. Go to **Authentication → Providers → Email** and turn off **"Confirm email"**

### 3. Get your Supabase keys

Go to **Settings → API** and copy:
- **Project URL** → `VITE_SUPABASE_URL`
- **anon / public key** → `VITE_SUPABASE_ANON_KEY`

### 4. Configure the frontend

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Install and run

```bash
npm install
npm run dev
```

Open **http://localhost:5173**

---

## Environment Variables

### `frontend/.env`

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Your Supabase anon/public key |

---

## Database Schema

All tables live in Supabase PostgreSQL with Row Level Security enabled.

```
profiles
  id (UUID → auth.users) · email · display_name · created_at

boards
  id · name · join_code (8 chars, unique) · owner_id · deadline_alert_hours · created_at

board_members
  board_id → boards · user_id · joined_at

columns
  id · board_id → boards · name · position (1/2/3) · created_at

cards
  id · column_id → columns · board_id → boards
  title · description · assigned_user_id · deadline · created_at · updated_at

activity_logs
  id · board_id → boards · user_id · message · created_at
```

### RLS Security Model

- `profiles` — anyone authenticated can read; users can only write their own
- `board_members` — users can only see their own membership rows (direct column check, no recursion)
- `boards` — any authenticated user can read (needed for join code lookup); only owner can update
- `columns`, `cards`, `activity_logs` — only board members can read/write, enforced via `is_board_member()` helper function (SECURITY DEFINER)

---

## Real-Time Events

All real-time updates use Supabase Realtime channels keyed by `board:{board_id}`.

| Trigger | How it works |
|---|---|
| Card created | Postgres Changes INSERT on `cards` → fetch card → update Zustand store |
| Card updated | Postgres Changes UPDATE on `cards` → fetch card → update Zustand store |
| Card deleted | Postgres Changes DELETE on `cards` → remove from Zustand store |
| Activity added | Postgres Changes INSERT on `activity_logs` → fetch entry → add to feed |
| User joins board | Supabase Presence track → presence sync → update avatars |
| User leaves board | Supabase Presence untrack → presence sync → remove avatar |

---

## Deployment

### Frontend → [Vercel](https://vercel.com)

1. Push the repository to GitHub
2. Import into Vercel, set **root directory** to `frontend/`
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
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
  Built with Vibe Coding 💻 and Own Idea 💡
</div>
