import React, { useState } from 'react';
import { api } from '../api';

interface RegisterProps {
  // Called when registration succeeds — switch to login
  onGoToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onGoToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.register(name, email, password);
      setSuccess('Account created! Redirecting to login...');
      // Redirect to login after a short delay
      setTimeout(onGoToLogin, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
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
        <h2 style={{ marginBottom: '0.5rem' }}>Create account</h2>
        <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Sign up to get started</p>

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

        {success && (
          <div style={{
            padding: '0.6rem 1rem',
            marginBottom: '1rem',
            borderRadius: '8px',
            fontSize: '0.875rem',
            backgroundColor: 'rgba(16,185,129,0.15)',
            color: '#34d399',
            border: '1px solid rgba(16,185,129,0.3)',
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
          />
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
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <button type="submit" className="btn" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-muted" style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>
          Already have an account?{' '}
          <span
            onClick={onGoToLogin}
            style={{ color: '#818cf8', cursor: 'pointer' }}
          >
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;
