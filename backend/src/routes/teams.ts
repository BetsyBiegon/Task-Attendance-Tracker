import { Router, Response } from 'express';
import pool from '../db/pool';
import { validate } from '../middleware/validate';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /teams — create a new team (authenticated user becomes the admin)
router.post('/teams', requireAuth, validate(['name']), async (req: AuthRequest, res: Response) => {
  const { name } = req.body;
  const userId = req.user!.userId;

  try {
    // Create the team
    const teamResult = await pool.query(
      `INSERT INTO teams (name, created_by) VALUES ($1, $2) RETURNING *`,
      [name, userId]
    );
    const team = teamResult.rows[0];

    // Automatically add the creator as an admin member
    await pool.query(
      `INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, 'admin')`,
      [team.id, userId]
    );

    return res.status(201).json(team);
  } catch (err) {
    console.error('Error creating team:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /teams — get all teams the logged-in user belongs to
router.get('/teams', requireAuth, async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;

  try {
    const result = await pool.query(
      `SELECT t.*, tm.role 
       FROM teams t
       JOIN team_members tm ON t.id = tm.team_id
       WHERE tm.user_id = $1
       ORDER BY t.created_at DESC`,
      [userId]
    );
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching teams:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /teams/:id/members — get all members of a specific team
router.get('/teams/:id/members', requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.userId;

  try {
    // Verify the requesting user is a member of this team
    const membership = await pool.query(
      `SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2`,
      [id, userId]
    );
    if (membership.rows.length === 0) {
      return res.status(403).json({ error: 'You are not a member of this team' });
    }

    // Fetch all members with their user details
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, tm.role, tm.joined_at
       FROM team_members tm
       JOIN users u ON tm.user_id = u.id
       WHERE tm.team_id = $1
       ORDER BY tm.joined_at ASC`,
      [id]
    );
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching team members:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /teams/:id/invite — invite a user to the team by email
router.post('/teams/:id/invite', requireAuth, validate(['email']), async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { email } = req.body;
  const userId = req.user!.userId;

  try {
    // Only admins can invite members
    const membership = await pool.query(
      `SELECT role FROM team_members WHERE team_id = $1 AND user_id = $2`,
      [id, userId]
    );
    if (membership.rows.length === 0 || membership.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Only team admins can send invites' });
    }

    // Check if the email is already a member
    const existingMember = await pool.query(
      `SELECT u.id FROM users u
       JOIN team_members tm ON u.id = tm.user_id
       WHERE u.email = $1 AND tm.team_id = $2`,
      [email, id]
    );
    if (existingMember.rows.length > 0) {
      return res.status(409).json({ error: 'This user is already a team member' });
    }

    // Check if there's already a pending invite for this email
    const existingInvite = await pool.query(
      `SELECT id FROM team_invites WHERE team_id = $1 AND email = $2 AND status = 'pending'`,
      [id, email]
    );
    if (existingInvite.rows.length > 0) {
      return res.status(409).json({ error: 'An invite is already pending for this email' });
    }

    // Create the invite
    const result = await pool.query(
      `INSERT INTO team_invites (team_id, email, invited_by) VALUES ($1, $2, $3) RETURNING *`,
      [id, email, userId]
    );

    return res.status(201).json({
      message: `Invite sent to ${email}`,
      invite: result.rows[0],
    });
  } catch (err) {
    console.error('Error sending invite:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /teams/invites/:id/accept — accept a team invite
router.post('/teams/invites/:id/accept', requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.userId;
  const userEmail = req.user!.email;

  try {
    // Find the invite for this user's email
    const invite = await pool.query(
      `SELECT * FROM team_invites WHERE id = $1 AND email = $2 AND status = 'pending'`,
      [id, userEmail]
    );
    if (invite.rows.length === 0) {
      return res.status(404).json({ error: 'Invite not found or already responded to' });
    }

    const teamId = invite.rows[0].team_id;

    // Add user to the team
    await pool.query(
      `INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, 'member') ON CONFLICT DO NOTHING`,
      [teamId, userId]
    );

    // Mark invite as accepted
    await pool.query(
      `UPDATE team_invites SET status = 'accepted' WHERE id = $1`,
      [id]
    );

    return res.status(200).json({ message: 'You have joined the team' });
  } catch (err) {
    console.error('Error accepting invite:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /teams/invites/pending — get all pending invites for the logged-in user
router.get('/teams/invites/pending', requireAuth, async (req: AuthRequest, res: Response) => {
  const userEmail = req.user!.email;

  try {
    const result = await pool.query(
      `SELECT ti.id, ti.status, ti.created_at, t.name AS team_name, u.name AS invited_by_name
       FROM team_invites ti
       JOIN teams t ON ti.team_id = t.id
       JOIN users u ON ti.invited_by = u.id
       WHERE ti.email = $1 AND ti.status = 'pending'
       ORDER BY ti.created_at DESC`,
      [userEmail]
    );
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching invites:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
