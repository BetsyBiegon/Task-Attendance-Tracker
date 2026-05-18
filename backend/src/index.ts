import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import './db/pool';
import checkinRoutes from './routes/checkins';
import taskRoutes from './routes/tasks';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'Server is running' });
});

// Root
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'Task & Attendance Tracker API',
    status: 'running',
    endpoints: [
      'GET  /health',
      'POST /checkin',
      'GET  /checkins',
      'POST /tasks',
      'GET  /tasks',
      'PATCH /tasks/:id',
      'DELETE /tasks/:id',
    ],
  });
});

// Routes
app.use(checkinRoutes);
app.use(taskRoutes);

// 404 handler — catches requests to routes that don't exist
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler — catches any unhandled errors thrown in routes
// Must have 4 parameters for Express to recognize it as an error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Something went wrong' });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
