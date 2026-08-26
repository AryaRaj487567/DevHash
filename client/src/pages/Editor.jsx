import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import MarkdownEditor from '../components/MarkdownEditor';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;

    const fetchPost = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get(`/posts/edit/${id}`);
        setPost(data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id, isEdit]);

  const handleSave = async (formData) => {
    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        const { data } = await api.put(`/posts/${id}`, formData);
        if (data.data.status === 'published') {
          navigate(`/post/${data.data.slug}`);
        } else {
          navigate('/dashboard');
        }
      } else {
        const { data } = await api.post('/posts', formData);
        if (data.data.status === 'published') {
          navigate(`/post/${data.data.slug}`);
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-center">
        <LoadingSpinner text="Loading editor..." />
      </div>
    );
  }

  if (error && isEdit && !post) {
    return (
      <div className="container page-content">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="page editor-page">
      <div className="container page-content">
        <header className="page-header">
          <h1>{isEdit ? 'Edit Article' : 'Write a New Article'}</h1>
        </header>
        <ErrorMessage message={error} />
        <MarkdownEditor
          postId={id}
          initialTitle={post?.title || ''}
          initialContent={post?.content || ''}
          initialCoverImage={post?.coverImage || ''}
          initialTags={post?.tags?.map((t) => t.name) || []}
          initialStatus={post?.status || 'draft'}
          onSave={handleSave}
          saving={saving}
        />
      </div>
    </div>
  );
}

export default Editor;
