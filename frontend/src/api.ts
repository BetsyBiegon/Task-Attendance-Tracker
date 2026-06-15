// Base URL for the backend API — uses environment variable in production
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper to get the stored JWT token from localStorage
const getToken = () => localStorage.getItem('token');

// Helper to build auth headers — attaches the token to every protected request
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

export interface CheckIn {
  id?: number;
  userId: string;
  mode?: 'remote' | 'physical';
  timestamp?: string;
  status?: string;
}

export interface Task {
  id?: number;
  title: string;
  description?: string;
  status: 'To Do' | 'In Progress' | 'Done';
  assigned_to?: number | null;
  assigned_to_name?: string;
  team_id?: number | null;
  created_at?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export const api = {
  // Check if the backend server is running
  checkHealth: async () => {
    try {
      const res = await fetch(`${BASE_URL}/health`);
      return await res.json();
    } catch (e) {
      console.error('Backend health check failed', e);
      return { status: 'Offline' };
    }
  },

  // Register a new user account
  register: async (name: string, email: string, password: string) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data;
  },

  // Login with email and password — returns a JWT token
  login: async (email: string, password: string) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  // Fetch all check-ins (protected)
  getCheckIns: async (): Promise<CheckIn[]> => {
    const res = await fetch(`${BASE_URL}/checkins`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch check-ins');
    return res.json();
  },

  // Create a new check-in (protected)
  createCheckIn: async (data: Partial<CheckIn>): Promise<CheckIn> => {
    const res = await fetch(`${BASE_URL}/checkin`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create check-in');
    return res.json();
  },

  // Fetch only tasks assigned to the logged-in user (protected)
  getMyTasks: async (): Promise<Task[]> => {
    const res = await fetch(`${BASE_URL}/tasks/my`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch my tasks');
    return res.json();
  },

  // Fetch all tasks (protected)
  getTasks: async (): Promise<Task[]> => {
    const res = await fetch(`${BASE_URL}/tasks`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch tasks');
    return res.json();
  },

  // Create a new task (protected)
  createTask: async (data: Partial<Task>): Promise<Task> => {
    const res = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create task');
    return res.json();
  },

  // Update a task's status and/or assignment (protected)
  updateTask: async (id: number, data: Partial<Task>): Promise<Task> => {
    const res = await fetch(`${BASE_URL}/tasks/${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update task');
    return res.json();
  },

  // Delete a task (protected)
  deleteTask: async (id: number): Promise<void> => {
    const res = await fetch(`${BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete task');
  },

  // Create a new team
  createTeam: async (name: string) => {
    const res = await fetch(`${BASE_URL}/teams`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create team');
    return data;
  },

  // Get all teams the logged-in user belongs to
  getTeams: async () => {
    const res = await fetch(`${BASE_URL}/teams`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch teams');
    return res.json();
  },

  // Get all members of a specific team
  getTeamMembers: async (teamId: number) => {
    const res = await fetch(`${BASE_URL}/teams/${teamId}/members`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch team members');
    return res.json();
  },

  // Invite a user to a team by email
  inviteToTeam: async (teamId: number, email: string) => {
    const res = await fetch(`${BASE_URL}/teams/${teamId}/invite`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send invite');
    return data;
  },

  // Accept a pending team invite
  acceptInvite: async (inviteId: number) => {
    const res = await fetch(`${BASE_URL}/teams/invites/${inviteId}/accept`, {
      method: 'POST',
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to accept invite');
    return data;
  },

  // Get all pending invites for the logged-in user
  getPendingInvites: async () => {
    const res = await fetch(`${BASE_URL}/teams/invites/pending`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch invites');
    return res.json();
  },
};
