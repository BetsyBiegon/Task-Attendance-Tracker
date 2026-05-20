import React, { useState } from 'react';
import Header from './components/Header';
import AttendancePanel from './components/AttendancePanel';
import TaskBoard from './components/TaskBoard';
import Login from './pages/Login';
import Register from './pages/Register';
import './index.css';

type AuthPage = 'login' | 'register';

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

  // Called when login succeeds — store user in state
  const handleLogin = (userData: User, _token: string) => {
    setUser(userData);
  };

  // Clear token and user from localStorage and state
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // If not logged in, show login or register page
  if (!user) {
    return authPage === 'login' ? (
      <Login
        onLogin={handleLogin}
        onGoToRegister={() => setAuthPage('register')}
      />
    ) : (
      <Register onGoToLogin={() => setAuthPage('login')} />
    );
  }

  // If logged in, show the main dashboard
  return (
    <div className="container">
      <Header user={user} onLogout={handleLogout} />
      <main className="grid grid-cols-2">
        <AttendancePanel />
        <TaskBoard />
      </main>
    </div>
  );
};

export default App;
