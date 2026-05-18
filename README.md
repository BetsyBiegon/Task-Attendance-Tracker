# Task & Attendance Tracker

A full-stack web application for tracking daily attendance and managing tasks. Built as an internship assignment.

## Live Demo

- Frontend: _coming soon_
- Backend API: _coming soon_

## Tech Stack

- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL

## Features

- Daily check-in with date, time, and mode (remote or physical)
- View list of recent check-ins
- Add tasks with title, description, and status
- Update task status: To Do / In Progress / Done
- Delete tasks
- Real-time backend health indicator

## How to Run Locally

### Prerequisites

- Node.js v18+
- PostgreSQL installed and running
- Git

### 1. Clone the repository

```bash
git clone https://github.com/BetsyBiegon/Task-Attendance-Tracker.git
cd Task-Attendance-Tracker/task-attendance-tracker
```

### 2. Set up the database

```bash
psql -U postgres -c "CREATE DATABASE task_tracker;"
psql -U postgres -d task_tracker -f backend/src/db/schema.sql
```

### 3. Configure environment variables

Create a `.env` file inside the `backend/` folder:

```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=task_tracker
DB_USER=postgres
DB_PASSWORD=your_postgres_password
```

### 4. Start both servers

Using the startup script (requires Git Bash on Windows):

```bash
./start.sh
```

Or manually in two terminals:

```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## Database Schema

### checkins

| Column     | Type         | Description                        |
|------------|--------------|------------------------------------|
| id         | SERIAL PK    | Auto-incrementing ID               |
| user_id    | VARCHAR(255) | Name or ID of the person           |
| mode       | VARCHAR(10)  | `remote` or `physical`             |
| status     | VARCHAR(20)  | Default: `PRESENT`                 |
| timestamp  | TIMESTAMP    | Auto-set to current time           |
| created_at | TIMESTAMP    | Auto-set to current time           |

### tasks

| Column      | Type         | Description                              |
|-------------|--------------|------------------------------------------|
| id          | SERIAL PK    | Auto-incrementing ID                     |
| title       | VARCHAR(255) | Task title                               |
| description | TEXT         | Optional task description                |
| status      | VARCHAR(20)  | `To Do`, `In Progress`, or `Done`        |
| created_at  | TIMESTAMP    | Auto-set on creation                     |
| updated_at  | TIMESTAMP    | Auto-updated on status change            |

## API Endpoints

| Method | Endpoint        | Description              |
|--------|-----------------|--------------------------|
| GET    | /health         | Check server status      |
| POST   | /checkin        | Record a new check-in    |
| GET    | /checkins       | Get all check-ins        |
| POST   | /tasks          | Create a new task        |
| GET    | /tasks          | Get all tasks            |
| PATCH  | /tasks/:id      | Update task status       |
| DELETE | /tasks/:id      | Delete a task            |

## What I Learned

- How to build a REST API with Node.js and Express using TypeScript
- How to connect a Node.js backend to a PostgreSQL database using a connection pool
- How to structure a full-stack project with separate frontend and backend
- How to use React with TypeScript and manage component state
- How to validate API inputs and handle errors properly
- How to use environment variables to keep secrets out of code
- How to use Git for version control and collaborate via GitHub
