import { Router, Request, Response } from 'express';
import pool from '../db/pool';
import { validate } from '../middleware/validate';

const router = Router();

const VALID_STATUSES = ['To Do', 'In Progress', 'Done'];

// POST /tasks — create a new task
router.post('/tasks', validate(['title']), async (req: Request, res: Response) => {
  const { title, description = '', status = 'To Do' } = req.body;

  // Validate title is a non-empty string
  if (typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({ error: 'title must be a non-empty string' });
  }

  // Validate status value
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `status must be one of: ${VALID_STATUSES.join(', ')}`,
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO tasks (title, description, status) VALUES ($1, $2, $3) RETURNING *`,
      [title.trim(), description, status]
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
router.patch('/tasks/:id', validate(['status']), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  // Validate id is a number
  if (isNaN(Number(id))) {
    return res.status(400).json({ error: 'Task id must be a number' });
  }

  // Validate status value
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `status must be one of: ${VALID_STATUSES.join(', ')}`,
    });
  }

  try {
    const result = await pool.query(
      `UPDATE tasks SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, Number(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Task with id ${id} not found` });
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error updating task:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /tasks/:id — delete a task
router.delete('/tasks/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  if (isNaN(Number(id))) {
    return res.status(400).json({ error: 'Task id must be a number' });
  }

  try {
    const result = await pool.query(
      `DELETE FROM tasks WHERE id = $1 RETURNING *`,
      [Number(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Task with id ${id} not found` });
    }

    return res.status(200).json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('Error deleting task:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
