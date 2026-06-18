import React, { useEffect, useState } from 'react';
import { api, Task } from '../api';

const STATUSES: Task['status'][] = ['To Do', 'In Progress', 'Done'];

interface Member {
  id: number;
  name: string;
  email: string;
}

interface Team {
  id: number;
  name: string;
}

const TaskBoard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState<number | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  // Load tasks and user's teams on mount
  const loadTasks = async () => {
    try {
      const data = await api.getTasks();
      setTasks(data);
    } catch {
      showMessage('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadTeams = async () => {
    try {
      const data = await api.getTeams();
      setTeams(data);
    } catch {
      // silently fail — user may not be in any teams
    }
  };

  useEffect(() => {
    loadTasks();
    loadTeams();
  }, []);

  // When a team is selected, load its members for the assign dropdown
  const handleTeamChange = async (teamId: number | null) => {
    setSelectedTeamId(teamId);
    setAssignedTo(null);
    setMembers([]);
    if (teamId) {
      try {
        const data = await api.getTeamMembers(teamId);
        setMembers(data);
      } catch {
        showMessage('Failed to load team members', 'error');
      }
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await api.createTask({
        title,
        description,
        status: 'To Do',
        assigned_to: assignedTo,
        team_id: selectedTeamId,
      });
      setTitle('');
      setDescription('');
      setAssignedTo(null);
      showMessage('Task created successfully', 'success');
      loadTasks();
    } catch {
      showMessage('Failed to create task', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: number, newStatus: Task['status']) => {
    try {
      await api.updateTask(id, { status: newStatus });
      loadTasks();
    } catch {
      showMessage('Failed to update task status', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteTask(id);
      showMessage('Task deleted', 'success');
      loadTasks();
    } catch {
      showMessage('Failed to delete task', 'error');
    }
  };

  const getTasksByStatus = (status: Task['status']) =>
    tasks.filter((t) => t.status === status);

  const columnColors: Record<Task['status'], string> = {
    'To Do': 'rgba(245,158,11,0.15)',
    'In Progress': 'rgba(59,130,246,0.15)',
    'Done': 'rgba(16,185,129,0.15)',
  };

  const columnBadgeColors: Record<Task['status'], { bg: string; color: string }> = {
    'To Do': { bg: 'rgba(245,158,11,0.2)', color: '#fbbf24' },
    'In Progress': { bg: 'rgba(59,130,246,0.2)', color: '#60a5fa' },
    'Done': { bg: 'rgba(16,185,129,0.2)', color: '#34d399' },
  };

  return (
    <div>
      {/* Task creation form */}
      <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
        <h3>Add Task</h3>

        {message && (
          <div style={{
            padding: '0.6rem 1rem', marginBottom: '1rem', borderRadius: '8px', fontSize: '0.875rem',
            backgroundColor: message.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
            color: message.type === 'success' ? '#34d399' : '#f87171',
            border: `1px solid ${message.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleCreateTask}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
            <input type="text" placeholder="Task title" value={title}
              onChange={(e) => setTitle(e.target.value)} required disabled={submitting}
              style={{ flex: 2, marginBottom: 0 }} />
            <input type="text" placeholder="Description (optional)" value={description}
              onChange={(e) => setDescription(e.target.value)} disabled={submitting}
              style={{ flex: 3, marginBottom: 0 }} />
          </div>

          {/* Team and assignee selection */}
          {teams.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              {/* Team selector */}
              <select
                value={selectedTeamId ?? ''}
                onChange={(e) => handleTeamChange(e.target.value ? Number(e.target.value) : null)}
                style={{ flex: 1, marginBottom: 0 }}
              >
                <option value="">No team</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>

              {/* Assignee selector — only shows when a team is selected */}
              {selectedTeamId && (
                <select
                  value={assignedTo ?? ''}
                  onChange={(e) => setAssignedTo(e.target.value ? Number(e.target.value) : null)}
                  style={{ flex: 1, marginBottom: 0 }}
                >
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          <button type="submit" className="btn" style={{ width: '100%' }} disabled={submitting}>
            {submitting ? 'Adding...' : 'Add Task'}
          </button>
        </form>
      </div>

      {/* Kanban board */}
      {loading ? (
        <p className="text-muted">Loading tasks...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          {STATUSES.map((status) => (
            <div key={status} style={{
              backgroundColor: columnColors[status],
              borderRadius: '12px',
              padding: '1rem',
              minHeight: '200px',
            }}>
              <div className="flex-between" style={{ marginBottom: '1rem' }}>
                <strong>{status}</strong>
                <span className="badge" style={{ backgroundColor: columnBadgeColors[status].bg, color: columnBadgeColors[status].color }}>
                  {getTasksByStatus(status).length}
                </span>
              </div>

              {getTasksByStatus(status).length === 0 ? (
                <p className="text-muted" style={{ fontSize: '0.8rem' }}>No tasks</p>
              ) : (
                getTasksByStatus(status).map((task) => (
                  <div key={task.id} className="glass-panel" style={{ padding: '0.75rem', marginBottom: '0.75rem' }}>
                    <strong style={{ fontSize: '0.9rem' }}>{task.title}</strong>

                    {task.description && (
                      <p className="text-muted" style={{ fontSize: '0.8rem', margin: '0.25rem 0' }}>
                        {task.description}
                      </p>
                    )}

                    {/* Show assigned user */}
                    {task.assigned_to_name && (
                      <p style={{ fontSize: '0.75rem', color: '#a5b4fc', margin: '0.25rem 0' }}>
                        👤 {task.assigned_to_name}
                      </p>
                    )}

                    <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                      {STATUSES.filter((s) => s !== status).map((s) => (
                        <button key={s} className="btn"
                          style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem', backgroundColor: columnBadgeColors[s].bg, color: columnBadgeColors[s].color }}
                          onClick={() => handleStatusChange(task.id!, s)}>
                          → {s}
                        </button>
                      ))}
                      <button className="btn"
                        style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem', backgroundColor: 'rgba(239,68,68,0.2)', color: '#f87171' }}
                        onClick={() => handleDelete(task.id!)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskBoard;
