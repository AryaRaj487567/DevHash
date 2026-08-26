import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios';
import MarkdownPreview from '../components/MarkdownPreview';
import TagPill from '../components/TagPill';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatDate, getErrorMessage, readingMinutes } from '../utils/helpers';

const PostPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    api
      .get(`/posts/${slug}`)
      .then(({ data }) => {
        if (!cancelled) setPost(data.data);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, 'Post not found.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) return <LoadingSpinner label="Opening article..." />;
  if (error || !post) return <ErrorMessage message={error || 'Post not found.'} />;

  return (
    <article className="page" style={{ width: 'min(820px, calc(100% - 32px))' }}>
      {post.coverImage ? <img className="article-cover" src={post.coverImage} alt="" /> : null}
      <div className="tag-row">
        {(post.tags || []).map((tag) => (
          <TagPill key={tag._id} tag={tag} />
        ))}
      </div>
      <h1 className="article-title">{post.title}</h1>
      <div className="meta-row" style={{ marginBottom: 28 }}>
        <Link to={`/profile/${post.author?._id}`} className="author-chip">
          <img
            className="avatar"
            src={
              post.author?.avatarUrl ||
              `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(post.author?.name || 'DH')}`
            }
            alt=""
          />
          {post.author?.name}
        </Link>
        <span className="muted">{formatDate(post.createdAt)}</span>
        <span className="muted">{readingMinutes(post.content)} min read</span>
      </div>
      <MarkdownPreview content={post.content} />
    </article>
  );
};

export default PostPage;
