import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { formatDate, getErrorMessage } from '../utils/helpers';

const DashboardPage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/posts/mine');
      setPosts(data.data);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load your posts.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const published = posts.filter((post) => post.status === 'published');
  const drafts = posts.filter((post) => post.status === 'draft');

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/posts/${pendingDelete._id}`);
      setPosts((current) => current.filter((post) => post._id !== pendingDelete._id));
      setPendingDelete(null);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not delete post.'));
    } finally {
      setDeleting(false);
    }
  };

  const renderGroup = (title, items, empty) => (
    <section className="panel" style={{ marginTop: 20 }}>
      <h2>{title}</h2>
      {!items.length ? (
        <EmptyState title={empty} />
      ) : (
        items.map((post) => (
          <div className="dash-item" key={post._id}>
            <div>
              <strong>{post.title}</strong>
              <div className="meta-row" style={{ marginTop: 6 }}>
                <span className={`badge ${post.status}`}>{post.status}</span>
                <span className="muted">Updated {formatDate(post.updatedAt)}</span>
              </div>
            </div>
            <div className="meta-row">
              {post.status === 'published' ? (
                <Link className="ghost-btn" to={`/post/${post.slug}`}>
                  View
                </Link>
              ) : null}
              <Link className="ghost-btn" to={`/editor/${post.slug}`}>
                Edit
              </Link>
              <button type="button" className="ghost-btn" onClick={() => setPendingDelete(post)}>
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </section>
  );

  if (loading) return <LoadingSpinner label="Loading dashboard..." />;
  if (error && !posts.length) return <ErrorMessage message={error} />;

  return (
    <div className="page">
      <div className="editor-toolbar">
        <div>
          <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p className="muted">Manage drafts and published articles from one place.</p>
        </div>
        <Link to="/editor/new" className="btn">
          Create post
        </Link>
      </div>
      {error ? <div className="error-banner">{error}</div> : null}
      <div className="stats" style={{ marginTop: 20 }}>
        <div className="stat-card">
          <p className="muted">Total</p>
          <h2>{posts.length}</h2>
        </div>
        <div className="stat-card">
          <p className="muted">Published</p>
          <h2>{published.length}</h2>
        </div>
        <div className="stat-card">
          <p className="muted">Drafts</p>
          <h2>{drafts.length}</h2>
        </div>
      </div>
      {renderGroup('Published', published, 'No published articles yet.')}
      {renderGroup('Drafts', drafts, 'No drafts available.')}
      <ConfirmDeleteModal
        open={Boolean(pendingDelete)}
        title="Delete this article?"
        message={`“${pendingDelete?.title}” will be permanently removed. This cannot be undone.`}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </div>
  );
};

export default DashboardPage;
