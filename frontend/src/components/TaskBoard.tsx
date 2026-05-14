import React, { useEffect, useState } from 'react';
import { api, Task } from '../api';

const TaskBoard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  const loadTasks = async () => {
    try {
      const data = await api.getTasks();
      setTasks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await api.createTask({ title, description, status: 'To Do' });
      setTitle('');
      setDescription('');
      loadTasks();
    } catch (e) {
      console.error('Failed to create task', e);
    }
  };

  const handleStatusChange = async (id: number, newStatus: Task['status']) => {
    try {
      await api.updateTask(id, { status: newStatus });
      loadTasks();
    } catch (e) {
      console.error('Failed to update task', e);
    }
  };

  const getBadgeClass = (status: string) => {
    switch (status) {
      case 'To Do': return 'badge-todo';
      case 'In Progress': return 'badge-progress';
      case 'Done': return 'badge-done';
      default: return 'badge-todo';
    }
  };

  return (
    <div className="glass-panel">
      <h3>Task Board</h3>
      <p className="text-muted" style={{ marginBottom: '1rem' }}>Manage your daily assignments.</p>

      <form onSubmit={handleCreateTask} style={{ marginBottom: '1.5rem' }}>
        <input 
          type="text" 
          placeholder="Task Title" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea 
          placeholder="Task Description (Optional)" 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
        <button type="submit" className="btn" style={{ width: '100%' }}>Add Task</button>
      </form>

      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {loading ? <p>Loading...</p> : tasks.length === 0 ? <p className="text-muted">No tasks yet.</p> : (
          tasks.map((task) => (
            <div key={task.id} className="list-item" style={{ paddingBottom: '1rem' }}>
              <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                <strong style={{ fontSize: '1.1rem' }}>{task.title}</strong>
                <span className={`badge ${getBadgeClass(task.status)}`}>
                  {task.status}
                </span>
              </div>
              {task.description && (
                <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                  {task.description}
                </p>
              )}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="btn" 
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', flex: 1, backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' }}
                  onClick={() => handleStatusChange(task.id!, 'To Do')}
                >Todo</button>
                <button 
                  className="btn" 
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', flex: 1, backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}
                  onClick={() => handleStatusChange(task.id!, 'In Progress')}
                >In Progress</button>
                <button 
                  className="btn" 
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', flex: 1, backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}
                  onClick={() => handleStatusChange(task.id!, 'Done')}
                >Done</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskBoard;
