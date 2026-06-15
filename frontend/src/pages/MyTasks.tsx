import React, { useEffect, useState } from 'react';
import { api, Task } from '../api';

// Badge color mapping for each status
const badgeStyle: Record<string, { bg: string; color: string }> = {
  'To Do':       { bg: 'rgba(245,158,11,0.2)',  color: '#fbbf24' },
  'In Progress': { bg: 'rgba(59,130,246,0.2)',  color: '#60a5fa' },
  'Done':        { bg: 'rgba(16,185,129,0.2)',  color: '#34d399' },
};

const MyTasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  // Fetch only tasks assigned to the logged-in user
  const loadMyTasks = async () => {
    try {
      const data = await api.getMyTasks();
      setTasks(data);
    } catch {
      showMessage('Failed to load your tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyTasks();
  }, []);

  // Update the status of a task
  const handleStatusChange = async (id: number, newStatus: Task['status']) => {
    try {
      await api.updateTask(id, { status: newStatus });
      loadMyTasks();
    } catch {
      showMessage('Failed to update status', 'error');
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h3 style={{ marginBottom: '0.5rem' }}>My Tasks</h3>
      <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Tasks assigned specifically to you.</p>

      {/* Feedback message */}
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

      {loading ? (
        <p className="text-muted">Loading your tasks...</p>
      ) : tasks.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '2rem' }}>
          <p className="text-muted">No tasks assigned to you yet.</p>
        </div>
      ) : (
        // Group tasks by status for a clear overview
        (['To Do', 'In Progress', 'Done'] as Task['status'][]).map((status) => {
          const filtered = tasks.filter((t) => t.status === status);
          if (filtered.length === 0) return null;
          return (
            <div key={status} style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span className="badge" style={{ backgroundColor: badgeStyle[status].bg, color: badgeStyle[status].color }}>
                  {status}
                </span>
                <span className="text-muted" style={{ fontSize: '0.8rem' }}>{filtered.length} task{filtered.length !== 1 ? 's' : ''}</span>
              </div>

              {filtered.map((task) => (
                <div key={task.id} className="glass-panel" style={{ padding: '0.75rem', marginBottom: '0.5rem' }}>
                  <div className="flex-between" style={{ marginBottom: '0.4rem' }}>
                    <strong>{task.title}</strong>
                    <span className="badge" style={{ backgroundColor: badgeStyle[task.status].bg, color: badgeStyle[task.status].color }}>
                      {task.status}
                    </span>
                  </div>

                  {task.description && (
                    <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                      {task.description}
                    </p>
                  )}

                  {task.created_at && (
                    <p className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                      Created: {new Date(task.created_at).toLocaleString()}
                    </p>
                  )}

                  {/* Quick status update buttons */}
                  <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                    {(['To Do', 'In Progress', 'Done'] as Task['status'][])
                      .filter((s) => s !== task.status)
                      .map((s) => (
                        <button key={s} className="btn"
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', backgroundColor: badgeStyle[s].bg, color: badgeStyle[s].color }}
                          onClick={() => handleStatusChange(task.id!, s)}>
                          → {s}
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          );
        })
      )}
    </div>
  );
};

export default MyTasks;
