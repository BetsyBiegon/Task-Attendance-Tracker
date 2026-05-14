import { Router, Request, Response } from 'express';
import pool from '../db/pool';
import { validate } from '../middleware/validate';

const router = Router();

const VALID_STATUSES = ['PRESENT', 'ABSENT', 'LATE'];

// POST /checkin — record a new check-in
router.post('/checkin', validate(['userId']), async (req: Request, res: Response) => {
  const { userId, status = 'PRESENT' } = req.body;

  // Validate userId is a non-empty string
  if (typeof userId !== 'string' || userId.trim().length === 0) {
    return res.status(400).json({ error: 'userId must be a non-empty string' });
  }

  // Validate status value
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `status must be one of: ${VALID_STATUSES.join(', ')}`,
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO checkins (user_id, status) VALUES ($1, $2) RETURNING *`,
      [userId.trim(), status]
    );

    const row = result.rows[0];
    return res.status(201).json({
      id: row.id,
      userId: row.user_id,
      status: row.status,
      timestamp: row.timestamp,
    });
  } catch (err) {
    console.error('Error creating check-in:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /checkins — fetch all check-ins, newest first
router.get('/checkins', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, user_id, status, timestamp FROM checkins ORDER BY timestamp DESC`
    );

    const checkins = result.rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      status: row.status,
      timestamp: row.timestamp,
    }));

    return res.status(200).json(checkins);
  } catch (err) {
    console.error('Error fetching check-ins:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
