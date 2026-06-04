import React, { useState } from 'react';
import Header from './components/Header';
import AttendancePanel from './components/AttendancePanel';
import TaskBoard from './components/TaskBoard';
import Teams from './pages/Teams';
import Login from './pages/Login';
import Register from './pages/Register';
import './index.css';

type AuthPage = 'login' | 'register';
type ActiveTab = 'dashboard' | 'teams';

interface User {
  id: number;
  name: string;
  email: string;
}

const App: React.FC = () => {
  // Check localStorage for an existing session on page load
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  // Controls which auth page to show when not logged in
  const [authPage, setAuthPage] = useState<AuthPage>('login');

  // Controls which main tab is active
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Called when login succeeds — store user in state
  const handleLogin = (userData: User, _token: string) => {
    setUser(userData);
  };

  // Clear token and user from localStorage and reset state
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // If not logged in, show login or register page
  if (!user) {
    return authPage === 'login' ? (
      <Login onLogin={handleLogin} onGoToRegister={() => setAuthPage('register')} />
    ) : (
      <Register onGoToLogin={() => setAuthPage('login')} />
    );
  }

  // If logged in, show the main dashboard
  return (
    <div className="container">
      <Header user={user} onLogout={handleLogout} />

      {/* Tab navigation */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <button
          className="btn"
          onClick={() => setActiveTab('dashboard')}
          style={{ opacity: activeTab === 'dashboard' ? 1 : 0.5 }}
        >
          Dashboard
        </button>
        <button
          className="btn"
          onClick={() => setActiveTab('teams')}
          style={{ opacity: activeTab === 'teams' ? 1 : 0.5 }}
        >
          Teams
        </button>
      </div>

      {/* Render active tab content */}
      {activeTab === 'dashboard' ? (
        <main className="grid grid-cols-2">
          <AttendancePanel />
          <TaskBoard />
        </main>
      ) : (
        <Teams />
      )}
    </div>
  );
};

export default App;
