import { Link } from 'react-router-dom';

const TagPill = ({ tag }) => {
  const slug = typeof tag === 'string' ? tag : tag.slug;
  const name = typeof tag === 'string' ? tag : tag.name;

  return (
    <Link to={`/tag/${slug}`} className="tag-pill">
      #{name}
    </Link>
  );
};

export default TagPill;
