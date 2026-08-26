import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { useAuth } from '../context/AuthContext';
import { formatRelativeDate } from '../utils/formatDate';

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/posts/mine');
      setPosts(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const published = posts.filter((p) => p.status === 'published');
  const drafts = posts.filter((p) => p.status === 'draft');

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/posts/${deleteTarget._id}`);
      setPosts(posts.filter((p) => p._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete post');
    } finally {
      setDeleting(false);
    }
  };

  const PostTable = ({ items, emptyTitle, emptyMessage }) => {
    if (!items.length) {
      return <EmptyState title={emptyTitle} message={emptyMessage} />;
    }

    return (
      <div className="dashboard-table-wrapper">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((post) => (
              <tr key={post._id}>
                <td>
                  <span className="post-title-cell">{post.title}</span>
                </td>
                <td>
                  <span className={`status-badge status-${post.status}`}>
                    {post.status}
                  </span>
                </td>
                <td>{formatRelativeDate(post.updatedAt)}</td>
                <td className="actions-cell">
                  {post.status === 'published' && (
                    <Link to={`/post/${post.slug}`} className="btn btn-ghost btn-sm">
                      View
                    </Link>
                  )}
                  <Link to={`/editor/${post._id}`} className="btn btn-ghost btn-sm">
                    Edit
                  </Link>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm btn-danger-text"
                    onClick={() => setDeleteTarget(post)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="page-center">
        <LoadingSpinner text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="page dashboard-page">
      <div className="container page-content">
        <header className="dashboard-header">
          <div>
            <h1>Welcome back, {user?.name?.split(' ')[0]}!</h1>
            <p>Manage your articles and drafts from here.</p>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/editor/new')}
          >
            + Create Post
          </button>
        </header>

        <ErrorMessage message={error} onRetry={fetchPosts} />

        <div className="dashboard-stats">
          <div className="stat-card">
            <span className="stat-value">{posts.length}</span>
            <span className="stat-label">Total Posts</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{published.length}</span>
            <span className="stat-label">Published</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{drafts.length}</span>
            <span className="stat-label">Drafts</span>
          </div>
        </div>

        <section className="dashboard-section">
          <h2>Published Posts</h2>
          <PostTable
            items={published}
            emptyTitle="No published articles yet"
            emptyMessage="Publish your first article to share it with the community."
          />
        </section>

        <section className="dashboard-section">
          <h2>Drafts</h2>
          <PostTable
            items={drafts}
            emptyTitle="No drafts available"
            emptyMessage="Start writing and save as draft to continue later."
          />
        </section>
      </div>

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        title="Delete Post"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}

export default Dashboard;
