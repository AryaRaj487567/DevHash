import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import ErrorMessage from '../components/ErrorMessage';

function Settings() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data } = await api.put('/users/me', { name, bio, avatarUrl });
      updateUser(data.data);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page settings-page">
      <div className="container page-content">
        <header className="page-header">
          <h1>Profile Settings</h1>
          <p>Update your public profile information.</p>
        </header>

        <div className="settings-card">
          <ErrorMessage message={error} />
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit} className="settings-form">
            <div className="form-group">
              <label htmlFor="name">Display Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={200}
                rows={3}
                placeholder="Tell us about yourself..."
              />
              <span className="char-count">{bio.length}/200</span>
            </div>
            <div className="form-group">
              <label htmlFor="avatarUrl">Avatar URL</label>
              <input
                id="avatarUrl"
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
            {avatarUrl && (
              <div className="avatar-preview">
                <img src={avatarUrl} alt="Avatar preview" className="avatar avatar-lg" />
              </div>
            )}
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Settings;
