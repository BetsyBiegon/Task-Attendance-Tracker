import React, { useEffect, useState } from 'react';
import { api, Task } from '../api';

const TaskBoard: React.FC = () => {
  // State for the list of tasks fetched from the backend
  const [tasks, setTasks] = useState<Task[]>([]);
  // Form field values for creating a new task
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  // True while the initial data is being fetched
  const [loading, setLoading] = useState(true);
  // True while a task is being submitted — disables the button
  const [submitting, setSubmitting] = useState(false);
  // Feedback message shown after an action (success or error)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Show a message and auto-dismiss it after 3 seconds
  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  // Fetch all tasks from the backend
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

  // Load tasks when the component first mounts
  useEffect(() => {
    loadTasks();
  }, []);

  // Handle the create task form submission
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default browser form submission
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await api.createTask({ title, description, status: 'To Do' });
      // Reset form fields after successful creation
      setTitle('');
      setDescription('');
      showMessage('Task created successfully', 'success');
      loadTasks(); // Refresh the list
    } catch {
      showMessage('Failed to create task', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Update the status of a task when a status button is clicked
  const handleStatusChange = async (id: number, newStatus: Task['status']) => {
    try {
      await api.updateTask(id, { status: newStatus });
      loadTasks(); // Refresh to show updated status
    } catch {
      showMessage('Failed to update task status', 'error');
    }
  };

  // Delete a task permanently
  const handleDelete = async (id: number) => {
    try {
      await api.deleteTask(id);
      showMessage('Task deleted', 'success');
      loadTasks(); // Refresh the list
    } catch {
      showMessage('Failed to delete task', 'error');
    }
  };

  // Return the CSS class for the status badge based on the task's current status
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

      {/* Success or error feedback message */}
      {message && (
        <div style={{
          padding: '0.6rem 1rem',
          marginBottom: '1rem',
          borderRadius: '8px',
          fontSize: '0.875rem',
          backgroundColor: message.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
          color: message.type === 'success' ? '#34d399' : '#f87171',
          border: `1px solid ${message.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
        }}>
          {message.text}
        </div>
      )}

      {/* Task creation form */}
      <form onSubmit={handleCreateTask} style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={submitting}
        />
        <textarea
          placeholder="Task Description (Optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          disabled={submitting}
        />
        <button type="submit" className="btn" style={{ width: '100%' }} disabled={submitting}>
          {submitting ? 'Adding...' : 'Add Task'}
        </button>
      </form>

      {/* Tasks list */}
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {loading ? (
          <p className="text-muted">Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p className="text-muted">No tasks yet. Add one above.</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="list-item" style={{ paddingBottom: '1rem' }}>
              <div className="flex-between" style={{ marginBottom: '0.4rem' }}>
                <strong style={{ fontSize: '1rem' }}>{task.title}</strong>
                {/* Status badge with color based on current status */}
                <span className={`badge ${getBadgeClass(task.status)}`}>{task.status}</span>
              </div>

              {/* Only show description if it exists */}
              {task.description && (
                <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.4rem' }}>
                  {task.description}
                </p>
              )}

              {/* Show formatted creation date */}
              {task.created_at && (
                <p className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '0.75rem' }}>
                  Created: {new Date(task.created_at).toLocaleString()}
                </p>
              )}

              {/* Status action buttons and delete button */}
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                <button className="btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', flex: 1, backgroundColor: 'rgba(245,158,11,0.2)', color: '#fbbf24' }}
                  onClick={() => handleStatusChange(task.id!, 'To Do')}>To Do</button>
                <button className="btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', flex: 1, backgroundColor: 'rgba(59,130,246,0.2)', color: '#60a5fa' }}
                  onClick={() => handleStatusChange(task.id!, 'In Progress')}>In Progress</button>
                <button className="btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', flex: 1, backgroundColor: 'rgba(16,185,129,0.2)', color: '#34d399' }}
                  onClick={() => handleStatusChange(task.id!, 'Done')}>Done</button>
                <button className="btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: 'rgba(239,68,68,0.2)', color: '#f87171' }}
                  onClick={() => handleDelete(task.id!)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskBoard;
