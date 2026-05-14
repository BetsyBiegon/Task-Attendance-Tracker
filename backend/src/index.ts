import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

// Import pool to trigger the DB connection test on startup
import './db/pool';

import checkinRoutes from './routes/checkins';
import taskRoutes from './routes/tasks';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Routes
app.use(checkinRoutes);
app.use(taskRoutes);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
