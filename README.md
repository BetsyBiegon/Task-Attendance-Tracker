# Task & Attendance Tracker

A full-stack web app for tracking daily attendance and managing tasks.

## Tech Stack
- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL

## Getting Started

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run dev
```

## API Endpoints
- `GET /health` — Check server status
- `POST /checkin` — Record a check-in
- `GET /checkins` — Get all check-ins
- `POST /tasks` — Create a task
- `GET /tasks` — Get all tasks
- `PATCH /tasks/:id` — Update a task
