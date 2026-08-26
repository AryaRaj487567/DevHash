import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import SearchBar from '../components/SearchBar';
import PostList from '../components/PostList';

function Home() {
  const [posts, setPosts] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchPosts = useCallback(async (searchQuery = '') => {
    setLoading(true);
    setError('');
    try {
      const params = searchQuery ? { search: searchQuery } : {};
      const { data } = await api.get('/posts', { params });
      setPosts(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(search);
  }, [search, fetchPosts]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const { data } = await api.get('/tags');
        setTags(data.data.slice(0, 12));
      } catch {
        /* optional */
      }
    };
    fetchTags();
  }, []);

  return (
    <div className="page home-page">
      <section className="hero">
        <div className="container">
          <h1>Developer stories, tutorials &amp; insights</h1>
          <p>Discover technical articles from developers around the world.</p>
          <SearchBar onSearch={setSearch} />
        </div>
      </section>

      <div className="container page-content">
        <div className="home-layout">
          <main className="home-main">
            <PostList
              posts={posts}
              loading={loading}
              error={error}
              onRetry={() => fetchPosts(search)}
              emptyTitle={search ? 'No posts found' : 'No published articles yet'}
              emptyMessage={
                search
                  ? `No articles match "${search}". Try a different search term.`
                  : 'Be the first to publish an article on DevHash!'
              }
            />
          </main>

          <aside className="home-sidebar">
            <div className="sidebar-card">
              <h3>Popular Tags</h3>
              {tags.length > 0 ? (
                <div className="tag-cloud">
                  {tags.map((tag) => (
                    <Link
                      key={tag._id}
                      to={`/tag/${tag.slug}`}
                      className="tag-cloud-item"
                    >
                      #{tag.name}
                      <span className="tag-count">{tag.postCount}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No tags yet.</p>
              )}
            </div>

            <div className="sidebar-card">
              <h3>Start Writing</h3>
              <p>Share your knowledge with the developer community.</p>
              <Link to="/editor/new" className="btn btn-primary btn-full">
                Create a Post
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default Home;
