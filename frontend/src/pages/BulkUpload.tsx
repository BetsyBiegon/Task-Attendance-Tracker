import React, { useState } from 'react';

// Backend API base URL
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

type UploadType = 'tasks' | 'checkins';

interface UploadResult {
  message: string;
  created: unknown[];
  errors: string[];
}

const BulkUpload: React.FC = () => {
  const [uploadType, setUploadType] = useState<UploadType>('tasks');
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setResult(null);
    setError('');

    // Build a FormData object — required for file uploads
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${BASE_URL}/upload/${uploadType}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          // Note: do NOT set Content-Type here — browser sets it automatically with boundary
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setResult(data);
      setFile(null);
      // Reset the file input
      const input = document.getElementById('file-input') as HTMLInputElement;
      if (input) input.value = '';
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '600px' }}>
      <h3 style={{ marginBottom: '0.5rem' }}>Bulk Upload</h3>
      <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
        Upload a CSV or Excel file to create multiple tasks or check-ins at once.
      </p>

      <div className="glass-panel">
        <form onSubmit={handleUpload}>
          {/* Upload type selector */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
              Upload type
            </label>
            <select value={uploadType} onChange={(e) => setUploadType(e.target.value as UploadType)}>
              <option value="tasks">Tasks</option>
              <option value="checkins">Check-ins</option>
            </select>
          </div>

          {/* File input */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
              File (.csv or .xlsx)
            </label>
            <input
              id="file-input"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
            />
          </div>

          <button type="submit" className="btn" style={{ width: '100%' }} disabled={loading || !file}>
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </form>

        {/* Expected format hint */}
        <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'rgba(99,102,241,0.1)', borderRadius: '8px' }}>
          <p style={{ fontSize: '0.8rem', color: '#a5b4fc', marginBottom: '0.5rem' }}>
            <strong>Expected columns:</strong>
          </p>
          {uploadType === 'tasks' ? (
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              <code>title</code> (required), <code>description</code> (optional), <code>status</code> (optional: To Do / In Progress / Done)
            </p>
          ) : (
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              <code>userId</code> (required), <code>mode</code> (optional: remote / physical), <code>status</code> (optional)
            </p>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div style={{
          marginTop: '1rem', padding: '0.6rem 1rem', borderRadius: '8px', fontSize: '0.875rem',
          backgroundColor: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)',
        }}>
          {error}
        </div>
      )}

      {/* Upload results */}
      {result && (
        <div className="glass-panel" style={{ marginTop: '1rem' }}>
          <p style={{ color: '#34d399', marginBottom: '0.5rem' }}>✅ {result.message}</p>

          {result.errors.length > 0 && (
            <div style={{ marginTop: '0.5rem' }}>
              <p style={{ color: '#f87171', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                ⚠️ {result.errors.length} row(s) had issues:
              </p>
              {result.errors.map((err, i) => (
                <p key={i} style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{err}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BulkUpload;
