const BASE_URL = 'http://localhost:3000';

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
  created_at?: string;
}

export const api = {
  checkHealth: async () => {
    try {
      const res = await fetch(`${BASE_URL}/health`);
      return await res.json();
    } catch (e) {
      console.error('Backend health check failed', e);
      return { status: 'Offline' };
    }
  },

  getCheckIns: async (): Promise<CheckIn[]> => {
    const res = await fetch(`${BASE_URL}/checkins`);
    if (!res.ok) throw new Error('Failed to fetch check-ins');
    return res.json();
  },

  createCheckIn: async (data: Partial<CheckIn>): Promise<CheckIn> => {
    const res = await fetch(`${BASE_URL}/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create check-in');
    return res.json();
  },

  getTasks: async (): Promise<Task[]> => {
    const res = await fetch(`${BASE_URL}/tasks`);
    if (!res.ok) throw new Error('Failed to fetch tasks');
    return res.json();
  },

  createTask: async (data: Partial<Task>): Promise<Task> => {
    const res = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create task');
    return res.json();
  },

  updateTask: async (id: number, data: Partial<Task>): Promise<Task> => {
    const res = await fetch(`${BASE_URL}/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update task');
    return res.json();
  },

  deleteTask: async (id: number): Promise<void> => {
    const res = await fetch(`${BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete task');
  },
};
