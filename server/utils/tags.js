const Tag = require('../models/Tag');
const { slugify, generateUniqueSlug } = require('./slugify');

const findOrCreateTags = async (tagNames) => {
  if (!tagNames || !Array.isArray(tagNames)) {
    return [];
  }

  const tagIds = [];

  for (const name of tagNames) {
    const trimmed = name.trim().toLowerCase();
    if (!trimmed) continue;

    let tag = await Tag.findOne({ name: trimmed });
    if (!tag) {
      const slug = await generateUniqueSlug(Tag, trimmed);
      tag = await Tag.create({ name: trimmed, slug });
    }
    tagIds.push(tag._id);
  }

  return tagIds;
};

module.exports = findOrCreateTags;
