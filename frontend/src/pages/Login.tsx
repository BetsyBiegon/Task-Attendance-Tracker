import React, { useState } from 'react';
import { api } from '../api';

interface LoginProps {
  // Called when login succeeds — passes user data and token up to App
  onLogin: (user: { id: number; name: string; email: string }, token: string) => void;
  // Switch to the register page
  onGoToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onGoToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.login(email, password);
      // Store the token in localStorage so it persists across page refreshes
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLogin(data.user, data.token);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>Welcome back</h2>
        <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Sign in to your account</p>

        {error && (
          <div style={{
            padding: '0.6rem 1rem',
            marginBottom: '1rem',
            borderRadius: '8px',
            fontSize: '0.875rem',
            backgroundColor: 'rgba(239,68,68,0.15)',
            color: '#f87171',
            border: '1px solid rgba(239,68,68,0.3)',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <button type="submit" className="btn" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-muted" style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>
          Don't have an account?{' '}
          <span
            onClick={onGoToRegister}
            style={{ color: '#818cf8', cursor: 'pointer' }}
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
