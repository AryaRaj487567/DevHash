import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/helpers';

const SettingsPage = () => {
  const { user, updateUser, logout } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    avatarUrl: user?.avatarUrl || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await api.put('/users/me', form);
      updateUser(data.data);
      setSuccess('Profile updated.');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not update profile.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page" style={{ width: 'min(640px, calc(100% - 32px))' }}>
      <h1 className="page-title">Settings</h1>
      <p className="muted">Update how you appear on public articles and your profile page.</p>
      <form className="panel stack" style={{ marginTop: 20 }} onSubmit={save}>
        {error ? <div className="error-banner">{error}</div> : null}
        {success ? <div className="error-banner" style={{ background: 'var(--ok-soft)', color: 'var(--ok)' }}>{success}</div> : null}
        <div className="form-field">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            maxLength={200}
            value={form.bio}
            onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
          />
          <span className="muted">{form.bio.length}/200</span>
        </div>
        <div className="form-field">
          <label htmlFor="avatarUrl">Avatar URL</label>
          <input
            id="avatarUrl"
            value={form.avatarUrl}
            onChange={(event) => setForm((current) => ({ ...current, avatarUrl: event.target.value }))}
            placeholder="https://..."
          />
        </div>
        <button className="btn" type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save profile'}
        </button>
        <Link to={`/profile/${user?._id}`}>View public profile</Link>
        <button type="button" className="ghost-btn" onClick={logout}>
          Log out
        </button>
      </form>
    </div>
  );
};

export default SettingsPage;
