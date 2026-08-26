import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import PostList from '../components/PostList';
import { getErrorMessage } from '../utils/helpers';

const TagPage = () => {
  const { slug } = useParams();
  const [tag, setTag] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    api
      .get(`/tags/${slug}/posts`)
      .then(({ data }) => {
        if (!cancelled) {
          setTag(data.data.tag);
          setPosts(data.data.posts);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, 'Tag not found.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <div className="page">
      <h1 className="page-title">#{tag?.name || slug}</h1>
      <p className="muted">Published articles tagged with this topic.</p>
      <div style={{ marginTop: 24 }}>
        <PostList
          posts={posts}
          loading={loading}
          error={error}
          emptyTitle="No published articles yet."
          emptyMessage="This tag has no published posts."
        />
      </div>
    </div>
  );
};

export default TagPage;
