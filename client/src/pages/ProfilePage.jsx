import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import PostList from '../components/PostList';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { getErrorMessage } from '../utils/helpers';

const ProfilePage = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get(`/users/${id}`)
      .then(({ data }) => {
        if (!cancelled) {
          setProfile(data.data.user);
          setPosts(data.data.posts);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, 'Profile not found.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <LoadingSpinner label="Loading profile..." />;
  if (error || !profile) return <ErrorMessage message={error || 'Profile not found.'} />;

  return (
    <div className="page">
      <section className="panel profile-head">
        <img
          className="avatar-lg"
          src={
            profile.avatarUrl ||
            `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(profile.name)}`
          }
          alt=""
        />
        <div>
          <h1 className="page-title">{profile.name}</h1>
          <p className="muted">{profile.bio || 'This writer has not added a bio yet.'}</p>
        </div>
      </section>
      <h2 style={{ marginTop: 28 }}>Published articles</h2>
      <PostList
        posts={posts}
        loading={false}
        error=""
        emptyTitle="No published articles yet."
        emptyMessage="This author has not published anything public."
      />
    </div>
  );
};

export default ProfilePage;
