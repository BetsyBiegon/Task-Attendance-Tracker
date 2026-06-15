import { Router, Response } from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
import pool from '../db/pool';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// Store uploaded files in memory (no disk writes needed)
const upload = multer({ storage: multer.memoryStorage() });

// Helper — parse a CSV or Excel file buffer into an array of row objects
const parseFile = (buffer: Buffer, mimetype: string): Record<string, unknown>[] => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet);
};

// POST /upload/tasks — bulk create tasks from CSV or Excel
// Expected columns: title, description (optional), status (optional)
router.post('/upload/tasks', requireAuth, upload.single('file'), async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const VALID_STATUSES = ['To Do', 'In Progress', 'Done'];

  try {
    const rows = parseFile(req.file.buffer, req.file.mimetype);

    if (rows.length === 0) {
      return res.status(400).json({ error: 'File is empty or has no valid rows' });
    }

    const created: unknown[] = [];
    const errors: string[] = [];

    // Process each row individually
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i] as Record<string, unknown>;
      const title = String(row['title'] || '').trim();
      const description = String(row['description'] || '').trim();
      const status = String(row['status'] || 'To Do').trim();

      // Skip rows with no title
      if (!title) {
        errors.push(`Row ${i + 2}: missing title`);
        continue;
      }

      // Use default status if invalid value provided
      const finalStatus = VALID_STATUSES.includes(status) ? status : 'To Do';

      const result = await pool.query(
        `INSERT INTO tasks (title, description, status) VALUES ($1, $2, $3) RETURNING *`,
        [title, description, finalStatus]
      );
      created.push(result.rows[0]);
    }

    return res.status(201).json({
      message: `${created.length} task(s) created`,
      created,
      errors,
    });
  } catch (err) {
    console.error('Error processing task upload:', err);
    return res.status(500).json({ error: 'Failed to process file' });
  }
});

// POST /upload/checkins — bulk create check-ins from CSV or Excel
// Expected columns: userId, mode (optional), status (optional)
router.post('/upload/checkins', requireAuth, upload.single('file'), async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const VALID_MODES = ['remote', 'physical'];

  try {
    const rows = parseFile(req.file.buffer, req.file.mimetype);

    if (rows.length === 0) {
      return res.status(400).json({ error: 'File is empty or has no valid rows' });
    }

    const created: unknown[] = [];
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i] as Record<string, unknown>;
      const userId = String(row['userId'] || row['user_id'] || '').trim();
      const mode = String(row['mode'] || 'remote').trim().toLowerCase();
      const status = String(row['status'] || 'PRESENT').trim();

      if (!userId) {
        errors.push(`Row ${i + 2}: missing userId`);
        continue;
      }

      const finalMode = VALID_MODES.includes(mode) ? mode : 'remote';

      const result = await pool.query(
        `INSERT INTO checkins (user_id, mode, status) VALUES ($1, $2, $3) RETURNING *`,
        [userId, finalMode, status]
      );

      const r = result.rows[0];
      created.push({
        id: r.id,
        userId: r.user_id,
        mode: r.mode,
        status: r.status,
        timestamp: r.timestamp,
      });
    }

    return res.status(201).json({
      message: `${created.length} check-in(s) created`,
      created,
      errors,
    });
  } catch (err) {
    console.error('Error processing check-in upload:', err);
    return res.status(500).json({ error: 'Failed to process file' });
  }
});

export default router;
