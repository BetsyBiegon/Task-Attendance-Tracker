import { Router, Response } from 'express';
import pool from '../db/pool';
import { validate } from '../middleware/validate';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// Only these three values are accepted for task status
const VALID_STATUSES = ['To Do', 'In Progress', 'Done'];

// POST /tasks — create a new task, optionally assigned to a user and linked to a team
router.post('/tasks', requireAuth, validate(['title']), async (req: AuthRequest, res: Response) => {
  const { title, description = '', status = 'To Do', assigned_to = null, team_id = null } = req.body;

  // Validate title is a non-empty string
  if (typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({ error: 'title must be a non-empty string' });
  }

  // Validate status is one of the accepted values
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
  }

  try {
    const result = await pool.query(
      `INSERT INTO tasks (title, description, status, assigned_to, team_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title.trim(), description, status, assigned_to, team_id]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating task:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /tasks — fetch all tasks, with optional team filter (?team_id=1)
router.get('/tasks', requireAuth, async (req: AuthRequest, res: Response) => {
  const { team_id } = req.query;

  try {
    let query = `
      SELECT t.*, u.name AS assigned_to_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
    `;
    const params: unknown[] = [];

    // Filter by team if team_id is provided
    if (team_id) {
      query += ` WHERE t.team_id = $1`;
      params.push(team_id);
    }

    query += ` ORDER BY t.created_at DESC`;

    const result = await pool.query(query, params);
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /tasks/:id — update status and/or assignment of a task
router.patch('/tasks/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, assigned_to } = req.body;

  // Ensure the id is a valid number
  if (isNaN(Number(id))) {
    return res.status(400).json({ error: 'Task id must be a number' });
  }

  // At least one field must be provided
  if (!status && assigned_to === undefined) {
    return res.status(400).json({ error: 'Provide status or assigned_to to update' });
  }

  // Validate status if provided
  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
  }

  try {
    // Build update query dynamically based on what was provided
    const updates: string[] = ['updated_at = NOW()'];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (status) {
      updates.push(`status = $${paramIndex++}`);
      params.push(status);
    }

    if (assigned_to !== undefined) {
      updates.push(`assigned_to = $${paramIndex++}`);
      params.push(assigned_to);
    }

    params.push(Number(id));

    const result = await pool.query(
      `UPDATE tasks SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      params
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

// DELETE /tasks/:id — permanently delete a task
router.delete('/tasks/:id', requireAuth, async (req: AuthRequest, res: Response) => {
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
