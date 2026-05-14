import React, { useEffect, useState } from 'react';
import { api, CheckIn } from '../api';

const AttendancePanel: React.FC = () => {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');

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
      await api.createCheckIn({ userId, status: 'PRESENT' });
      setUserId('');
      loadCheckIns();
    } catch (e) {
      console.error('Failed to check in', e);
    }
  };

  return (
    <div className="glass-panel">
      <h3>Attendance Tracker</h3>
      <p className="text-muted" style={{ marginBottom: '1rem' }}>Record daily check-ins here.</p>
      
      <form onSubmit={handleCheckIn} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <input 
          type="text" 
          placeholder="Enter Intern ID or Name" 
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
          style={{ marginBottom: 0 }}
        />
        <button type="submit" className="btn btn-success">Check In</button>
      </form>

      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {loading ? <p>Loading...</p> : checkIns.length === 0 ? <p className="text-muted">No check-ins yet.</p> : (
          checkIns.map((ci) => (
            <div key={ci.id} className="list-item flex-between">
              <div>
                <strong>{ci.userId}</strong>
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                  {ci.timestamp ? new Date(ci.timestamp).toLocaleString() : 'Just now'}
                </div>
              </div>
              <span className="badge badge-done">{ci.status || 'PRESENT'}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AttendancePanel;
