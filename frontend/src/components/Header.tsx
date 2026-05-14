import React, { useEffect, useState } from 'react';
import { api } from '../api';

const Header: React.FC = () => {
  const [status, setStatus] = useState<'Checking...' | 'Online' | 'Offline'>('Checking...');

  useEffect(() => {
    const checkStatus = async () => {
      const res = await api.checkHealth();
      if (res.status === 'Server is running') {
        setStatus('Online');
      } else {
        setStatus('Offline');
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="glass-panel flex-between" style={{ marginBottom: '2rem' }}>
      <div>
        <h2 style={{ margin: 0 }}>Task & Attendance Tracker</h2>

      </div>
      <div className="flex-between">
        <span className={`status-indicator ${status === 'Online' ? 'online' : 'offline'}`}></span>
        <span style={{ fontWeight: 600 }}>Backend Status: {status}</span>
      </div>
    </header>
  );
};

export default Header;
