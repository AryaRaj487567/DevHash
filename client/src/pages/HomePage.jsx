import { useEffect, useState } from 'react';
import api from '../api/axios';
import SearchBar from '../components/SearchBar';
import PostList from '../components/PostList';
import TagPill from '../components/TagPill';
import { getErrorMessage } from '../utils/helpers';

const HomePage = () => {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [posts, setPosts] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), 350);
    return () => clearTimeout(id);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    const params = {};
    if (debounced) params.search = debounced;

    api
      .get('/posts', { params })
      .then(({ data }) => {
        if (!cancelled) setPosts(data.data);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, 'Could not load posts.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debounced, reloadKey]);

  useEffect(() => {
    api
      .get('/tags')
      .then(({ data }) => setTags(data.data || []))
      .catch(() => setTags([]));
  }, []);

  return (
    <div className="page">
      <section className="hero">
        <div>
          <p className="tag-pill">Developer publishing</p>
          <h1>Write technical stories. Publish when they are ready.</h1>
          <p className="lede">
            DevHash is a Markdown-first blogging platform for engineers. Draft privately, tag by
            technology, and share a public feed of published work.
          </p>
        </div>
        <div className="hero-search">
          <p className="hero-search-label">Find an article</p>
          <SearchBar value={query} onChange={setQuery} />
          <p className="muted hero-search-hint">Search published titles. Visitors can browse without an account.</p>
        </div>
      </section>
      <div className="layout-grid">
        <PostList
          posts={posts}
          loading={loading}
          error={error}
          onRetry={() => setReloadKey((key) => key + 1)}
          emptyTitle={debounced ? 'No posts found.' : 'No published articles yet.'}
          emptyMessage={
            debounced
              ? `Nothing matched “${debounced}”. Try another title keyword.`
              : 'Be the first to publish an article from the editor.'
          }
        />
        <aside className="sidebar">
          <div className="panel">
            <h3>Topics</h3>
            <div className="tag-row" style={{ marginTop: 12 }}>
              {tags.filter((tag) => tag.postCount > 0).map((tag) => (
                <TagPill key={tag._id} tag={tag} />
              ))}
              {!tags.filter((tag) => tag.postCount > 0).length ? (
                <p className="muted">Tags appear after posts are published.</p>
              ) : null}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default HomePage;
