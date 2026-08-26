const slugify = (value) => {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'post';
};

const uniqueSlug = async (Model, base, excludeId) => {
  let slug = base;
  let counter = 2;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const query = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const exists = await Model.findOne(query).select('_id');
    if (!exists) {
      return slug;
    }
    slug = `${base}-${counter}`;
    counter += 1;
  }
};

module.exports = { slugify, uniqueSlug };
