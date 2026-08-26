import PostCard from './PostCard';
import EmptyState from './EmptyState';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const PostList = ({ posts, loading, error, emptyTitle, emptyMessage, onRetry }) => {
  if (loading) {
    return (
      <div className="stack">
        <div className="skeleton" />
        <div className="skeleton" />
        <LoadingSpinner label="Loading articles..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        title="Articles couldn’t be loaded"
        message={error}
        onRetry={onRetry}
      />
    );
  }

  if (!posts?.length) {
    return <EmptyState title={emptyTitle} message={emptyMessage} />;
  }

  return (
    <div className="stack">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
    </div>
  );
};

export default PostList;
