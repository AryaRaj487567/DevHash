import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import PostList from '../components/PostList';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

function Profile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/users/${id}`);
      setProfile(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="page-center">
        <LoadingSpinner text="Loading profile..." />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container page-content">
        <ErrorMessage message={error || 'Profile not found'} onRetry={fetchProfile} />
      </div>
    );
  }

  return (
    <div className="page profile-page">
      <div className="container page-content">
        <header className="profile-header">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt={profile.name} className="avatar avatar-lg" />
          ) : (
            <span className="avatar avatar-lg avatar-placeholder">
              {profile.name?.charAt(0)}
            </span>
          )}
          <div>
            <h1>{profile.name}</h1>
            {profile.bio && <p className="profile-bio">{profile.bio}</p>}
            <p className="profile-meta">
              {profile.posts?.length || 0} published{' '}
              {(profile.posts?.length || 0) === 1 ? 'article' : 'articles'}
            </p>
          </div>
        </header>

        <section>
          <h2>Published Articles</h2>
          <PostList
            posts={profile.posts}
            loading={false}
            error=""
            emptyTitle="No published articles yet"
            emptyMessage={`${profile.name} hasn't published any articles yet.`}
          />
        </section>
      </div>
    </div>
  );
}

export default Profile;
