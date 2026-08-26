const asyncHandler = require('express-async-handler');
const Tag = require('../models/Tag');
const Post = require('../models/Post');
const AppError = require('../utils/appError');
const { slugify } = require('../utils/slugify');

const getTags = asyncHandler(async (req, res) => {
  const tags = await Tag.aggregate([
    {
      $lookup: {
        from: 'posts',
        let: { tagId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ['$$tagId', '$tags'] },
                  { $eq: ['$status', 'published'] },
                ],
              },
            },
          },
        ],
        as: 'publishedPosts',
      },
    },
    {
      $project: {
        name: 1,
        slug: 1,
        createdAt: 1,
        postCount: { $size: '$publishedPosts' },
      },
    },
    { $sort: { postCount: -1, name: 1 } },
  ]);

  res.json({
    success: true,
    data: tags,
  });
});

const getTagPosts = asyncHandler(async (req, res) => {
  const tag = await Tag.findOne({ slug: req.params.slug.toLowerCase() });

  if (!tag) {
    throw new AppError('Tag not found', 404);
  }

  const posts = await Post.find({ status: 'published', tags: tag._id })
    .populate('author', 'name bio avatarUrl')
    .populate('tags', 'name slug')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: {
      tag: { _id: tag._id, name: tag.name, slug: tag.slug },
      posts,
    },
  });
});

module.exports = { getTags, getTagPosts, slugify };
