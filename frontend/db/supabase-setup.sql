-- =============================================================
-- Syncwork — Complete Database Setup (Clean Slate)
-- Drops all existing tables and recreates everything fresh.
-- Run this entire file in Supabase SQL Editor.
-- Click "Run without RLS" if prompted.
-- =============================================================


-- =============================================================
-- PART 1: DROP EVERYTHING (clean slate)
-- =============================================================

-- Drop all policies first (required before dropping tables)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE tablename IN (
      'profiles','boards','board_members','columns','cards','activity_logs'
    )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- Drop helper function if exists
DROP FUNCTION IF EXISTS is_board_member(TEXT);

-- Drop tables in correct order (child tables first)
DROP TABLE IF EXISTS activity_logs  CASCADE;
DROP TABLE IF EXISTS cards          CASCADE;
DROP TABLE IF EXISTS columns        CASCADE;
DROP TABLE IF EXISTS board_members  CASCADE;
DROP TABLE IF EXISTS boards         CASCADE;
DROP TABLE IF EXISTS profiles       CASCADE;


-- =============================================================
-- PART 2: CREATE ALL TABLES
-- =============================================================

-- Profiles (linked to Supabase Auth users)
CREATE TABLE profiles (
    id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email        TEXT NOT NULL,
    display_name TEXT NOT NULL,
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Boards
CREATE TABLE boards (
    id                   TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name                 TEXT NOT NULL,
    join_code            VARCHAR(8) NOT NULL UNIQUE,
    owner_id             TEXT NOT NULL,
    deadline_alert_hours INTEGER NOT NULL DEFAULT 24,
    created_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX ix_boards_join_code ON boards(join_code);

-- Board Members
CREATE TABLE board_members (
    board_id  TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    user_id   TEXT NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (board_id, user_id)
);

-- Columns
CREATE TABLE columns (
    id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    board_id   TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    name       TEXT NOT NULL,
    position   INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cards
CREATE TABLE cards (
    id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    column_id        TEXT NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
    board_id         TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    title            TEXT NOT NULL,
    description      TEXT,
    assigned_user_id TEXT,
    deadline         TIMESTAMP WITH TIME ZONE,
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX ix_cards_board_id    ON cards(board_id);
CREATE INDEX ix_cards_column_id   ON cards(column_id);

-- Activity Logs
CREATE TABLE activity_logs (
    id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    board_id   TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    user_id    TEXT NOT NULL,
    message    TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX ix_activity_board_id ON activity_logs(board_id);


-- =============================================================
-- PART 3: ENABLE REALTIME
-- =============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE cards;
ALTER PUBLICATION supabase_realtime ADD TABLE activity_logs;


-- =============================================================
-- PART 4: ENABLE ROW LEVEL SECURITY
-- =============================================================
ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE boards         ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_members  ENABLE ROW LEVEL SECURITY;
ALTER TABLE columns        ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards          ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs  ENABLE ROW LEVEL SECURITY;


-- =============================================================
-- PART 5: HELPER FUNCTION
-- SECURITY DEFINER means it runs as the function owner (postgres)
-- so it can query board_members without triggering RLS recursion.
-- =============================================================
CREATE OR REPLACE FUNCTION is_board_member(bid TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM board_members
    WHERE board_id = bid
      AND user_id = auth.uid()::text
  );
$$;


-- =============================================================
-- PART 6: RLS POLICIES
-- =============================================================

-- ── Profiles ──────────────────────────────────────────────────
-- Anyone authenticated can read profiles (to show display names)
CREATE POLICY "profiles_select" ON profiles
    FOR SELECT USING (true);

-- Users can only create/update their own profile
CREATE POLICY "profiles_insert" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update" ON profiles
    FOR UPDATE USING (auth.uid() = id);


-- ── Board Members ─────────────────────────────────────────────
-- Users can only see their own membership rows
-- (direct column check — NO subquery to avoid recursion)
CREATE POLICY "bm_select" ON board_members
    FOR SELECT USING (user_id = auth.uid()::text);

-- Any authenticated user can insert (to join a board)
CREATE POLICY "bm_insert" ON board_members
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);


-- ── Boards ────────────────────────────────────────────────────
-- Any authenticated user can read boards
-- (needed so users can look up a board by join code before joining)
CREATE POLICY "boards_select" ON boards
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only the owner can create a board
CREATE POLICY "boards_insert" ON boards
    FOR INSERT WITH CHECK (owner_id = auth.uid()::text);

-- Only the owner can update board settings
CREATE POLICY "boards_update" ON boards
    FOR UPDATE USING (owner_id = auth.uid()::text);


-- ── Columns ───────────────────────────────────────────────────
CREATE POLICY "columns_select" ON columns
    FOR SELECT USING (is_board_member(board_id));

CREATE POLICY "columns_insert" ON columns
    FOR INSERT WITH CHECK (is_board_member(board_id));


-- ── Cards ─────────────────────────────────────────────────────
CREATE POLICY "cards_select" ON cards
    FOR SELECT USING (is_board_member(board_id));

CREATE POLICY "cards_insert" ON cards
    FOR INSERT WITH CHECK (is_board_member(board_id));

CREATE POLICY "cards_update" ON cards
    FOR UPDATE USING (is_board_member(board_id));

CREATE POLICY "cards_delete" ON cards
    FOR DELETE USING (is_board_member(board_id));


-- ── Activity Logs ─────────────────────────────────────────────
CREATE POLICY "activity_select" ON activity_logs
    FOR SELECT USING (is_board_member(board_id));

CREATE POLICY "activity_insert" ON activity_logs
    FOR INSERT WITH CHECK (is_board_member(board_id));


-- =============================================================
-- Done. All tables, indexes, realtime, RLS, and policies created.
-- Tables: profiles, boards, board_members, columns, cards, activity_logs
-- =============================================================
