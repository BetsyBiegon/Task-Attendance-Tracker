import React, { useEffect, useState } from 'react';
import { api } from '../api';

interface HeaderProps {
  user: { id: number; name: string; email: string };
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const [status, setStatus] = useState<'Checking...' | 'Online' | 'Offline'>('Checking...');

  useEffect(() => {
    // Check backend health on mount and every 10 seconds
    const checkStatus = async () => {
      const res = await api.checkHealth();
      setStatus(res.status === 'Server is running' ? 'Online' : 'Offline');
    };
    checkStatus();
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="glass-panel flex-between" style={{ marginBottom: '2rem' }}>
      <div>
        <h2 style={{ margin: 0 }}>Task & Attendance Tracker</h2>
        <p className="text-muted" style={{ fontSize: '0.875rem' }}>Welcome, {user.name}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div className="flex-between">
          <span className={`status-indicator ${status === 'Online' ? 'online' : 'offline'}`}></span>
          <span style={{ fontWeight: 600 }}>Backend: {status}</span>
        </div>
        <button
          onClick={onLogout}
          className="btn"
          style={{ backgroundColor: 'rgba(239,68,68,0.2)', color: '#f87171', padding: '0.4rem 1rem' }}
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
