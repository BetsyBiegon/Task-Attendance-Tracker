-- Run this file manually in psql to set up your database tables
-- Command: psql -U postgres -d task_tracker -f src/db/schema.sql

CREATE TABLE IF NOT EXISTS checkins (
  id          SERIAL PRIMARY KEY,
  user_id     VARCHAR(255) NOT NULL,
  status      VARCHAR(20) DEFAULT 'PRESENT',
  timestamp   TIMESTAMP DEFAULT NOW(),
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  status      VARCHAR(20) CHECK (status IN ('To Do', 'In Progress', 'Done')) DEFAULT 'To Do',
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);
