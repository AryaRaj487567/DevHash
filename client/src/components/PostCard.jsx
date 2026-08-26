import { Link } from 'react-router-dom';
import TagPill from './TagPill';
import { formatDate, readingMinutes } from '../utils/helpers';

const PostCard = ({ post }) => {
  const cover = post.coverImage
    ? { backgroundImage: `url(${post.coverImage})` }
    : undefined;

  return (
    <article className="post-card">
      <Link to={`/post/${post.slug}`} className="post-card-cover" style={cover} aria-hidden="true" />
      <div className="post-card-body">
        <div className="tag-row">
          {(post.tags || []).map((tag) => (
            <TagPill key={tag._id || tag.slug} tag={tag} />
          ))}
        </div>
        <h3>
          <Link to={`/post/${post.slug}`}>{post.title}</Link>
        </h3>
        <p className="muted">{post.excerpt}</p>
        <div className="meta-row">
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
      </div>
    </article>
  );
};

export default PostCard;
