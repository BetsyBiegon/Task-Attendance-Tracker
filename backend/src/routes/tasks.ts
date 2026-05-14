import { Router, Request, Response } from 'express';
import pool from '../db/pool';

const router = Router();

const VALID_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'];

// POST /tasks — create a new task
router.post('/tasks', async (req: Request, res: Response) => {
  const { title, description = '', status = 'TODO' } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'title is required' });
  }

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
  }

  try {
    const result = await pool.query(
      `INSERT INTO tasks (title, description, status) VALUES ($1, $2, $3) RETURNING *`,
      [title, description, status]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating task:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /tasks — fetch all tasks, newest first
router.get('/tasks', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT * FROM tasks ORDER BY created_at DESC`
    );
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /tasks/:id — update a task's status
router.patch('/tasks/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'status is required' });
  }

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
  }

  try {
    const result = await pool.query(
      `UPDATE tasks SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error updating task:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
