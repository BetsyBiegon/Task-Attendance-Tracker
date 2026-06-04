import React, { useEffect, useState } from 'react';
import { api } from '../api';

interface Team {
  id: number;
  name: string;
  role: string;
  created_at: string;
}

interface Member {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface PendingInvite {
  id: number;
  team_name: string;
  invited_by_name: string;
  created_at: string;
}

const Teams: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(true);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  // Load the user's teams and pending invites
  const loadTeams = async () => {
    try {
      const [teamsData, invitesData] = await Promise.all([
        api.getTeams(),
        api.getPendingInvites(),
      ]);
      setTeams(teamsData);
      setPendingInvites(invitesData);
    } catch {
      showMessage('Failed to load teams', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  // Load members when a team is selected
  const handleSelectTeam = async (team: Team) => {
    setSelectedTeam(team);
    try {
      const data = await api.getTeamMembers(team.id);
      setMembers(data);
    } catch {
      showMessage('Failed to load team members', 'error');
    }
  };

  // Create a new team
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    try {
      await api.createTeam(newTeamName);
      setNewTeamName('');
      showMessage('Team created successfully', 'success');
      loadTeams();
    } catch (err: unknown) {
      showMessage(err instanceof Error ? err.message : 'Failed to create team', 'error');
    }
  };

  // Invite a user to the selected team
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam || !inviteEmail.trim()) return;
    try {
      await api.inviteToTeam(selectedTeam.id, inviteEmail);
      setInviteEmail('');
      showMessage(`Invite sent to ${inviteEmail}`, 'success');
    } catch (err: unknown) {
      showMessage(err instanceof Error ? err.message : 'Failed to send invite', 'error');
    }
  };

  // Accept a pending invite
  const handleAcceptInvite = async (inviteId: number) => {
    try {
      await api.acceptInvite(inviteId);
      showMessage('You joined the team!', 'success');
      loadTeams();
    } catch (err: unknown) {
      showMessage(err instanceof Error ? err.message : 'Failed to accept invite', 'error');
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h3 style={{ marginBottom: '1.5rem' }}>Teams</h3>

      {/* Feedback message */}
      {message && (
        <div style={{
          padding: '0.6rem 1rem', marginBottom: '1rem', borderRadius: '8px', fontSize: '0.875rem',
          backgroundColor: message.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
          color: message.type === 'success' ? '#34d399' : '#f87171',
          border: `1px solid ${message.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
        }}>
          {message.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

        {/* Left column — team list and create form */}
        <div className="glass-panel">
          <h4 style={{ marginBottom: '1rem' }}>Your Teams</h4>
          <form onSubmit={handleCreateTeam} style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="New team name"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              style={{ marginBottom: 0, flex: 1 }}
              required
            />
            <button type="submit" className="btn">Create</button>
          </form>

          {loading ? <p className="text-muted">Loading...</p> : teams.length === 0 ? (
            <p className="text-muted">You're not in any teams yet.</p>
          ) : (
            teams.map((team) => (
              <div
                key={team.id}
                className="list-item flex-between"
                style={{ cursor: 'pointer', backgroundColor: selectedTeam?.id === team.id ? 'rgba(99,102,241,0.15)' : 'transparent' }}
                onClick={() => handleSelectTeam(team)}
              >
                <div>
                  <strong>{team.name}</strong>
                  <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                    {new Date(team.created_at).toLocaleDateString()}
                  </div>
                </div>
                <span className="badge" style={{ backgroundColor: team.role === 'admin' ? 'rgba(245,158,11,0.2)' : 'rgba(99,102,241,0.2)', color: team.role === 'admin' ? '#fbbf24' : '#a5b4fc' }}>
                  {team.role}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Right column — team details, members, invite */}
        <div className="glass-panel">
          {!selectedTeam ? (
            <p className="text-muted">Select a team to see its members.</p>
          ) : (
            <>
              <h4 style={{ marginBottom: '1rem' }}>{selectedTeam.name} — Members</h4>

              {/* Invite form — only visible to admins */}
              {selectedTeam.role === 'admin' && (
                <form onSubmit={handleInvite} style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="email"
                    placeholder="Invite by email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    style={{ marginBottom: 0, flex: 1 }}
                    required
                  />
                  <button type="submit" className="btn">Invite</button>
                </form>
              )}

              {/* Members list */}
              {members.length === 0 ? (
                <p className="text-muted">No members found.</p>
              ) : (
                members.map((member) => (
                  <div key={member.id} className="list-item flex-between">
                    <div>
                      <strong>{member.name}</strong>
                      <div className="text-muted" style={{ fontSize: '0.8rem' }}>{member.email}</div>
                    </div>
                    <span className="badge" style={{ backgroundColor: member.role === 'admin' ? 'rgba(245,158,11,0.2)' : 'rgba(99,102,241,0.2)', color: member.role === 'admin' ? '#fbbf24' : '#a5b4fc' }}>
                      {member.role}
                    </span>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>

      {/* Pending invites section */}
      {pendingInvites.length > 0 && (
        <div className="glass-panel" style={{ marginTop: '1.5rem' }}>
          <h4 style={{ marginBottom: '1rem' }}>Pending Invites</h4>
          {pendingInvites.map((invite) => (
            <div key={invite.id} className="list-item flex-between">
              <div>
                <strong>{invite.team_name}</strong>
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                  Invited by {invite.invited_by_name}
                </div>
              </div>
              <button className="btn" style={{ backgroundColor: 'rgba(16,185,129,0.2)', color: '#34d399' }}
                onClick={() => handleAcceptInvite(invite.id)}>
                Accept
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Teams;
