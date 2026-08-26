import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import MarkdownEditor from '../components/MarkdownEditor';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/helpers';

const emptyDraft = {
  title: '',
  coverImage: '',
  tags: [],
  content: '',
};

const EditorPage = () => {
  const { slug } = useParams();
  const isNew = !slug || slug === 'new';
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState(emptyDraft);
  const [postId, setPostId] = useState(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isNew) {
      setForm(emptyDraft);
      setPostId(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    api
      .get(`/posts/${slug}`)
      .then(({ data }) => {
        const post = data.data;
        if (post.author?._id !== user?._id) {
          throw { message: 'You can only edit your own posts.' };
        }
        if (!cancelled) {
          setPostId(post._id);
          setForm({
            title: post.title,
            coverImage: post.coverImage || '',
            tags: (post.tags || []).map((tag) => tag.name),
            content: post.content,
          });
        }
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, 'Could not load this article.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isNew, slug, user?._id]);

  const payload = (status) => ({
    title: form.title,
    content: form.content,
    tags: form.tags,
    coverImage: form.coverImage,
    status,
  });

  const save = async (status) => {
    if (!form.title.trim() || !form.content.trim()) {
      setError('Title and content are required.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const request = postId
        ? api.put(`/posts/${postId}`, payload(status))
        : api.post('/posts', payload(status));
      const { data } = await request;
      const saved = data.data;
      setPostId(saved._id);
      if (status === 'published') {
        navigate(`/post/${saved.slug}`);
      } else {
        navigate(`/editor/${saved.slug}`, { replace: true });
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Could not save the article.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner label="Opening editor..." />;
  if (error && !isNew && !postId) return <ErrorMessage message={error} />;

  return (
    <div className="page">
      {error ? <div className="error-banner">{error}</div> : null}
      <MarkdownEditor
        {...form}
        saving={saving}
        onChange={(patch) => setForm((current) => ({ ...current, ...patch }))}
        onSaveDraft={() => save('draft')}
        onPublish={() => save('published')}
      />
    </div>
  );
};

export default EditorPage;
