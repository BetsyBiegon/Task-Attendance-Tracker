import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Initialize database connection pool
import './db/pool';

import authRoutes from './routes/auth';
import checkinRoutes from './routes/checkins';
import taskRoutes from './routes/tasks';
import teamRoutes from './routes/teams';
import { requireAuth } from './middleware/auth';

const app = express();
const PORT = process.env.PORT || 3000;

// Allow requests from the frontend origin
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

// Public routes — no authentication required
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'Server is running' });
});

app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'Task & Attendance Tracker API',
    status: 'running',
    endpoints: [
      'GET  /health',
      'POST /auth/register',
      'POST /auth/login',
      'POST /checkin',
      'GET  /checkins',
      'POST /tasks',
      'GET  /tasks',
      'PATCH /tasks/:id',
      'DELETE /tasks/:id',
    ],
  });
});

// Auth routes — register and login
app.use(authRoutes);

// Teams routes — all internally protected per route
app.use(teamRoutes);

// Protected routes — require a valid JWT token
app.use(requireAuth, checkinRoutes);
app.use(requireAuth, taskRoutes);

// 404 handler — catches requests to routes that don't exist
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler — catches any unhandled errors thrown in routes
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Something went wrong' });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
