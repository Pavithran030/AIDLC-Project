-- =============================================================
-- Syncwork — Full Database Schema
-- Run this file once to create all tables from scratch.
--
-- Usage:
--   psql -U postgres -d syncwork -f schema.sql
--
-- Or paste directly into Supabase SQL Editor and click Run.
-- =============================================================


-- =============================================================
-- USERS
-- =============================================================
CREATE TABLE IF NOT EXISTS users (
    id                   VARCHAR PRIMARY KEY,
    email                VARCHAR NOT NULL UNIQUE,
    hashed_password      VARCHAR NOT NULL,
    display_name         VARCHAR NOT NULL,
    created_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    reset_token          VARCHAR,
    reset_token_expires  TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS ix_users_email ON users (email);


-- =============================================================
-- BOARDS
-- =============================================================
CREATE TABLE IF NOT EXISTS boards (
    id                   VARCHAR PRIMARY KEY,
    name                 VARCHAR NOT NULL,
    join_code            VARCHAR(8) NOT NULL UNIQUE,
    owner_id             VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    deadline_alert_hours INTEGER NOT NULL DEFAULT 24,
    created_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_boards_join_code ON boards (join_code);


-- =============================================================
-- BOARD MEMBERS
-- =============================================================
CREATE TABLE IF NOT EXISTS board_members (
    board_id   VARCHAR NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    user_id    VARCHAR NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
    joined_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (board_id, user_id)
);


-- =============================================================
-- COLUMNS
-- =============================================================
CREATE TABLE IF NOT EXISTS columns (
    id         VARCHAR PRIMARY KEY,
    board_id   VARCHAR NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    name       VARCHAR NOT NULL,
    position   INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);


-- =============================================================
-- CARDS
-- =============================================================
CREATE TABLE IF NOT EXISTS cards (
    id               VARCHAR PRIMARY KEY,
    column_id        VARCHAR NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
    title            VARCHAR NOT NULL,
    description      TEXT,
    assigned_user_id VARCHAR REFERENCES users(id) ON DELETE SET NULL,
    deadline         TIMESTAMP WITH TIME ZONE,
    created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);


-- =============================================================
-- ACTIVITY LOGS
-- =============================================================
CREATE TABLE IF NOT EXISTS activity_logs (
    id         VARCHAR PRIMARY KEY,
    board_id   VARCHAR NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    user_id    VARCHAR NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
    message    TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);


-- =============================================================
-- Done. All 6 tables created.
-- =============================================================
