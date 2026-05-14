import React, { useEffect, useState } from 'react';
import { api, CheckIn } from '../api';

const AttendancePanel: React.FC = () => {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');
  const [mode, setMode] = useState<'remote' | 'physical'>('remote');

  const loadCheckIns = async () => {
    try {
      const data = await api.getCheckIns();
      setCheckIns(data);
    } catch (e) {
      console.error(e);
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
    try {
      await api.createCheckIn({ userId, mode, status: 'PRESENT' });
      setUserId('');
      setMode('remote');
      loadCheckIns();
    } catch (e) {
      console.error('Failed to check in', e);
    }
  };

  return (
    <div className="glass-panel">
      <h3>Attendance Tracker</h3>
      <p className="text-muted" style={{ marginBottom: '1rem' }}>Record daily check-ins here.</p>

      <form onSubmit={handleCheckIn} style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Enter your name or ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
        />
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as 'remote' | 'physical')}
        >
          <option value="remote">Remote</option>
          <option value="physical">Physical</option>
        </select>
        <button type="submit" className="btn btn-success" style={{ width: '100%', marginTop: '0.5rem' }}>
          Check In
        </button>
      </form>

      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {loading ? (
          <p>Loading...</p>
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
