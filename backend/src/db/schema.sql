-- Run this file manually in psql to set up your database tables
-- Command: psql -U postgres -d task_tracker -f src/db/schema.sql

CREATE TABLE IF NOT EXISTS checkins (
  id          SERIAL PRIMARY KEY,
  date        DATE NOT NULL,
  time        TIME NOT NULL,
  mode        VARCHAR(10) CHECK (mode IN ('remote', 'physical')) NOT NULL,
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
