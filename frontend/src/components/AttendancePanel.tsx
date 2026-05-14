import React, { useEffect, useState } from 'react';
import { api, CheckIn } from '../api';

const AttendancePanel: React.FC = () => {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState('');
  const [mode, setMode] = useState<'remote' | 'physical'>('remote');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const loadCheckIns = async () => {
    try {
      const data = await api.getCheckIns();
      setCheckIns(data);
    } catch {
      showMessage('Failed to load check-ins', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCheckIns();
  }, []);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim()) return;
    setSubmitting(true);
    try {
      await api.createCheckIn({ userId, mode, status: 'PRESENT' });
      setUserId('');
      setMode('remote');
      showMessage('Checked in successfully', 'success');
      loadCheckIns();
    } catch {
      showMessage('Failed to check in. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="glass-panel">
      <h3>Attendance Tracker</h3>
      <p className="text-muted" style={{ marginBottom: '1rem' }}>Record daily check-ins here.</p>

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

      <form onSubmit={handleCheckIn} style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Enter your name or ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
          disabled={submitting}
        />
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as 'remote' | 'physical')}
          disabled={submitting}
        >
          <option value="remote">Remote</option>
          <option value="physical">Physical</option>
        </select>
        <button type="submit" className="btn btn-success" style={{ width: '100%', marginTop: '0.5rem' }} disabled={submitting}>
          {submitting ? 'Checking in...' : 'Check In'}
        </button>
      </form>

      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {loading ? (
          <p className="text-muted">Loading check-ins...</p>
        ) : checkIns.length === 0 ? (
          <p className="text-muted">No check-ins yet.</p>
        ) : (
          checkIns.map((ci) => (
            <div key={ci.id} className="list-item flex-between">
              <div>
                <strong>{ci.userId}</strong>
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                  {ci.timestamp ? new Date(ci.timestamp).toLocaleString() : 'Just now'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span className="badge" style={{ backgroundColor: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }}>
                  {ci.mode}
                </span>
                <span className="badge badge-done">{ci.status || 'PRESENT'}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AttendancePanel;
