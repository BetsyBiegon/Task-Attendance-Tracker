import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db/pool';
import { validate } from '../middleware/validate';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// Number of salt rounds for bcrypt hashing — higher is more secure but slower
const SALT_ROUNDS = 10;

// POST /auth/register — create a new user account
router.post('/auth/register', validate(['name', 'email', 'password']), async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  // Basic email format check
  if (!email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  // Password must be at least 6 characters
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    // Check if a user with this email already exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash the password before storing — never store plain text passwords
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert the new user into the database
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
      [name, email, hashedPassword]
    );

    return res.status(201).json({
      message: 'Account created successfully',
      user: result.rows[0],
    });
  } catch (err) {
    console.error('Error registering user:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/login — authenticate a user and return a JWT token
router.post('/auth/login', validate(['email', 'password']), async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Look up the user by email
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      // Use a generic message — don't reveal whether email or password was wrong
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Compare the provided password with the stored hash
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate a JWT token valid for 24 hours
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('Error logging in:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /users — fetch all users (for assignee dropdown)
router.get('/users', requireAuth, async (_req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email FROM users ORDER BY name ASC`
    );
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
